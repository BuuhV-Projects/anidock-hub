import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AI-RECOMMENDATIONS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Parse request body to get client-side data
    const body = await req.json();
    const { watchHistory, availableAnimes } = body;
    
    logStep("Received client data", { 
      watchHistoryCount: watchHistory?.length,
      availableAnimesCount: availableAnimes?.length 
    });

    // Check if user is premium
    const { data: roleData } = await supabaseClient
      .rpc('get_user_role', { _user_id: user.id });
    
    if (roleData !== 'premium') {
      return new Response(JSON.stringify({ error: "Premium subscription required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // Use client-provided data if available, fallback to database
    let history = watchHistory;
    let allAnimes = availableAnimes;

    // If no client data, try to get from database
    if (!history || history.length === 0) {
      const { data: dbHistory, error: historyError } = await supabaseClient
        .from('watch_history')
        .select('anime_title, anime_source_url, episode_number')
        .eq('user_id', user.id)
        .order('watched_at', { ascending: false })
        .limit(20);

      if (historyError) {
        logStep("Error fetching watch history", { error: historyError });
      }
      
      history = dbHistory || [];
      logStep("Fetched watch history from DB", { count: history?.length });
    }

    if (!allAnimes || allAnimes.length === 0) {
      // Get all indexed animes (from user's drivers)
      const { data: indexes } = await supabaseClient
        .from('indexes')
        .select('index_data, name')
        .eq('user_id', user.id);

      // Extract anime titles from indexes
      allAnimes = [];
      indexes?.forEach((index: any) => {
        if (index.index_data && Array.isArray(index.index_data)) {
          index.index_data.forEach((anime: any) => {
            if (anime.title) allAnimes.push(anime.title);
          });
        }
      });

      logStep("Extracted indexed animes from DB", { count: allAnimes.length });
    }

    if (!history || history.length === 0) {
      return new Response(JSON.stringify({ 
        recommendations: [],
        message: "Assista alguns animes para receber recomendações personalizadas!"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (!allAnimes || allAnimes.length === 0) {
      return new Response(JSON.stringify({ 
        recommendations: [],
        message: "Importe ou crie drivers para começar a receber recomendações!"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Build AI prompt
    const watchedAnimes = history.map((h: any) => h.anime_title || h.animeTitle).slice(0, 10);
    const availableAnimesList = allAnimes.slice(0, 50);

    const systemPrompt = `Você é um especialista em recomendações de animes. 
Baseado no histórico de visualização do usuário, sugira animes similares da lista disponível.
Retorne APENAS animes que existem na lista disponível.
Considere gêneros, temas, estilos e narrativas similares.`;

    const userPrompt = `Histórico assistido (em ordem do mais recente):
${watchedAnimes.join('\n')}

Animes disponíveis para recomendar:
${availableAnimesList.join('\n')}

Recomende 5 animes da lista disponível que o usuário provavelmente vai gostar baseado no histórico.
Para cada recomendação, explique brevemente (1 linha) por que é uma boa escolha.`;

    logStep("Calling Lovable AI");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "recommend_animes",
            description: "Return anime recommendations",
            parameters: {
              type: "object",
              properties: {
                recommendations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      reason: { type: "string" }
                    },
                    required: ["title", "reason"]
                  }
                }
              },
              required: ["recommendations"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "recommend_animes" } }
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em alguns instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos esgotados. Entre em contato com o suporte." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    logStep("AI response received", { hasChoices: !!aiData.choices });

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in AI response");
    }

    const recommendations = JSON.parse(toolCall.function.arguments);
    logStep("Recommendations parsed", { count: recommendations.recommendations?.length });

    return new Response(JSON.stringify(recommendations), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});