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
    const { url, catalog_url, is_public = false } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL é obrigatória' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get authorization header and extract JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header found');
      return new Response(
        JSON.stringify({ error: 'Token de autenticação não fornecido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract JWT token (remove "Bearer " prefix)
    const jwt = authHeader.replace('Bearer ', '');
    console.log('JWT token extracted, length:', jwt.length);

    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validate JWT and get user using admin client
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(jwt);

    if (userError) {
      console.error('Error validating JWT:', userError.message);
      return new Response(
        JSON.stringify({ error: 'Token inválido ou expirado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!user) {
      console.error('No user found in JWT');
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User authenticated:', user.id);

    // Get user role using admin client
    const { data: roleData, error: roleError } = await supabaseAdmin
      .rpc('get_user_role', { _user_id: user.id });

    if (roleError) {
      console.error('Error getting user role:', roleError);
      return new Response(
        JSON.stringify({ error: 'Erro ao verificar plano do usuário' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userRole = roleData as 'free' | 'premium' | 'premium_plus';
    console.log('User role:', userRole);

    // Check driver count for free users
    if (userRole === 'free') {
      const { count, error: countError } = await supabaseAdmin
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

      console.log('Free user driver count:', count);

      if (count !== null && count >= 3) {
        return new Response(
          JSON.stringify({ 
            error: 'Limite de 3 drivers atingido para usuários gratuitos. Faça upgrade para Premium!' 
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Determine which URL to analyze
    const targetUrl = catalog_url || url;
    console.log('Fetching HTML from:', targetUrl);
    const htmlResponse = await fetch(targetUrl);
    const html = await htmlResponse.text();
    
    // Also fetch main page to look for catalog links if catalog_url not provided
    let mainPageHtml = '';
    if (!catalog_url && url !== targetUrl) {
      const mainResponse = await fetch(url);
      mainPageHtml = await mainResponse.text();
    }

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
            content: `Você é um especialista em web scraping de sites de anime. Analise o HTML e crie um driver JSON.

REGRAS CRÍTICAS:
1. Identifique se a página mostra uma LISTA DE ANIMES ou LISTA DE EPISÓDIOS
2. Se for lista de EPISÓDIOS (não animes), retorne: {"error": "Esta página lista episódios, não animes. Forneça a URL do catálogo de animes."}
3. Se for lista de ANIMES, extraia os seletores corretos

Formato esperado:
{
  "name": "Nome do Site",
  "domain": "exemplo.com",
  "pageType": "anime_catalog",
  "selectors": {
    "animeList": ".anime-item",
    "animeTitle": ".title",
    "animeCover": "img.cover",
    "animeUrl": "a.link",
    "animeSynopsis": ".synopsis",
    "episodeList": ".episode",
    "episodeNumber": ".ep-number",
    "episodeUrl": "a.episode-link"
  },
  "catalogUrl": "url_do_catalogo_se_encontrada"
}

DICAS PARA IDENTIFICAÇÃO:
- Lista de ANIMES: múltiplos títulos diferentes, capas, sinopses
- Lista de EPISÓDIOS: mesmo anime, múltiplos episódios numerados
- Se a página tem "Episódio X", "EP X", é lista de episódios

Retorne APENAS o JSON, sem explicações.`
          },
          {
            role: 'user',
            content: `Analise este HTML e determine se é um catálogo de animes ou lista de episódios:\n\n${html.slice(0, 15000)}`
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
      
      // Check if AI detected episode list instead of anime catalog
      if (driverConfig.error) {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: driverConfig.error,
            suggestion: driverConfig.catalogUrl || 'Forneça a URL da página que lista os animes, não episódios.'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (e) {
      console.error('Error parsing driver JSON:', e);
      return new Response(
        JSON.stringify({ error: 'Erro ao processar driver gerado. Tente novamente.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract domain from URL (use catalog_url if provided)
    const targetUrlObj = new URL(catalog_url || url);
    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    // Normalize driver config to match crawler expectations
    const rawSelectors = (driverConfig as any).selectors || driverConfig;
    const normalizedConfig = {
      baseUrl: targetUrlObj.origin,
      selectors: {
        animeList: rawSelectors.animeList,
        animeTitle: rawSelectors.animeTitle,
        animeImage: rawSelectors.animeImage || rawSelectors.animeCover,
        animeSynopsis: rawSelectors.animeSynopsis,
        animeUrl: rawSelectors.animeUrl,
        episodeList: rawSelectors.episodeList,
        episodeNumber: rawSelectors.episodeNumber,
        episodeTitle: rawSelectors.episodeTitle,
        episodeUrl: rawSelectors.episodeUrl,
        videoPlayer: rawSelectors.videoPlayer,
      },
    };

    // Save driver to database using admin client
    // Use catalog_url as source_url if provided, otherwise use main url
    const { data: driver, error: insertError } = await supabaseAdmin
      .from('drivers')
      .insert({
        name: driverConfig.name || `Driver ${domain}`,
        domain: driverConfig.domain || domain,
        config: normalizedConfig,
        user_id: user.id,
        is_public: is_public,
        source_url: catalog_url || url,
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
