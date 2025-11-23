import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyRequest {
  email: string;
  code: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code }: VerifyRequest = await req.json();

    if (!email || !code) {
      throw new Error('Email e código são obrigatórios');
    }

    console.log('Verifying code for:', email);

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find valid code
    const { data: verificationData, error: fetchError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('type', 'signup')
      .is('verified_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (fetchError || !verificationData) {
      console.error('Invalid or expired code:', fetchError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Código inválido ou expirado'
        }),
        {
          status: 400,
          headers: { 
            "Content-Type": "application/json", 
            ...corsHeaders 
          },
        }
      );
    }

    console.log('Code verified, marking as used...');

    // Mark code as verified
    const { error: updateError } = await supabase
      .from('verification_codes')
      .update({ verified_at: new Date().toISOString() })
      .eq('id', verificationData.id);

    if (updateError) {
      console.error('Error marking code as verified:', updateError);
      throw updateError;
    }

    // Update user email_confirmed_at in auth.users
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error fetching users:', listError);
      throw listError;
    }

    const user = users.find(u => u.email === email);

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Confirm the user's email
    const { error: confirmError } = await supabase.auth.admin.updateUserById(
      user.id,
      { email_confirm: true }
    );

    if (confirmError) {
      console.error('Error confirming email:', confirmError);
      throw confirmError;
    }

    console.log('Email confirmed successfully');

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Código verificado com sucesso'
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in verify-code:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);