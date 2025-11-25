import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, user is on free plan");
      
      // Update user role to free
      await supabaseClient
        .from('user_subscriptions')
        .update({ role: 'free' })
        .eq('user_id', user.id);
      
      return new Response(JSON.stringify({ subscribed: false, role: 'free' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    const hasActiveSub = subscriptions.data.length > 0;
    let productId = null;
    let subscriptionEnd = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      
      // Safely convert timestamp to ISO string
      try {
        if (subscription.current_period_end) {
          subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
        }
      } catch (dateError) {
        logStep("Error converting date", { error: dateError, timestamp: subscription.current_period_end });
      }
      
      logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });
      
      // Get product ID safely
      if (subscription.items?.data?.[0]?.price?.product) {
        productId = subscription.items.data[0].price.product;
      }
      logStep("Determined subscription product", { productId });
      
      // Update user role to premium
      const { error: updateError } = await supabaseClient
        .from('user_subscriptions')
        .update({ role: 'premium' })
        .eq('user_id', user.id);
      
      if (updateError) {
        logStep("Error updating role to premium", { error: updateError });
      } else {
        logStep("Successfully updated role to premium");
      }
    } else {
      logStep("No active subscription found, setting to free");
      
      // Update user role to free
      const { error: updateError } = await supabaseClient
        .from('user_subscriptions')
        .update({ role: 'free' })
        .eq('user_id', user.id);
      
      if (updateError) {
        logStep("Error updating role to free", { error: updateError });
      } else {
        logStep("Successfully updated role to free");
      }
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      role: hasActiveSub ? 'premium' : 'free',
      product_id: productId,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
