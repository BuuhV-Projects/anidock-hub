import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL é obrigatória' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user role
    const { data: roleData, error: roleError } = await supabaseClient
      .rpc('get_user_role', { _user_id: user.id });

    if (roleError) {
      console.error('Error getting user role:', roleError);
      return new Response(
        JSON.stringify({ error: 'Erro ao verificar plano do usuário' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userRole = roleData as 'free' | 'premium' | 'premium_plus';

    // Check driver count for free users
    if (userRole === 'free') {
      const { count, error: countError } = await supabaseClient
        .from('drivers')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (countError) {
        console.error('Error counting drivers:', countError);
        return new Response(
          JSON.stringify({ error: 'Erro ao verificar drivers existentes' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (count !== null && count >= 3) {
        return new Response(
          JSON.stringify({ 
            error: 'Limite de 3 drivers atingido para usuários gratuitos. Faça upgrade para Premium!' 
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Fetch the website HTML
    console.log('Fetching HTML from:', url);
    const htmlResponse = await fetch(url);
    const html = await htmlResponse.text();

    // Use OpenAI to analyze and generate driver
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key não configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing HTML with OpenAI...');
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em web scraping. Analise o HTML fornecido e crie um driver JSON para extrair informações de anime.

O driver deve ter este formato:
{
  "name": "Nome do Site",
  "domain": "exemplo.com",
  "selectors": {
    "animeList": ".anime-item",
    "animeTitle": ".title",
    "animeCover": "img.cover",
    "animeUrl": "a.link",
    "animeSynopsis": ".synopsis",
    "episodeList": ".episode",
    "episodeNumber": ".ep-number",
    "episodeUrl": "a.episode-link"
  }
}

IMPORTANTE:
- Use seletores CSS válidos
- Seja específico mas flexível
- Priorize classes e IDs sobre tags genéricas
- Retorne APENAS o JSON, sem explicações`
          },
          {
            role: 'user',
            content: `Analise este HTML e extraia seletores para um site de anime:\n\n${html.slice(0, 15000)}`
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Erro ao gerar driver com IA' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openAIData = await openAIResponse.json();
    const generatedText = openAIData.choices[0].message.content;
    
    console.log('Generated driver text:', generatedText);

    // Parse the JSON from the response
    let driverConfig;
    try {
      // Try to extract JSON from code blocks if present
      const jsonMatch = generatedText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || 
                       [null, generatedText];
      driverConfig = JSON.parse(jsonMatch[1].trim());
    } catch (e) {
      console.error('Error parsing driver JSON:', e);
      return new Response(
        JSON.stringify({ error: 'Erro ao processar driver gerado. Tente novamente.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract domain from URL
    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    // Save driver to database
    const { data: driver, error: insertError } = await supabaseClient
      .from('drivers')
      .insert({
        name: driverConfig.name || `Driver ${domain}`,
        domain: driverConfig.domain || domain,
        config: driverConfig.selectors || driverConfig,
        user_id: user.id,
        is_public: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error saving driver:', insertError);
      return new Response(
        JSON.stringify({ error: 'Erro ao salvar driver no banco de dados' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Driver created successfully:', driver);

    return new Response(
      JSON.stringify({ 
        success: true, 
        driver: driver,
        message: 'Driver criado com sucesso!' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in generate-driver function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
