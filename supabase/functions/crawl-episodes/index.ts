import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { DOMParser } from 'https://esm.sh/linkedom@0.14.26';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { anime_id, index_id, anime_url, driver_id } = await req.json();
    
    if (!anime_id || !index_id || !anime_url || !driver_id) {
      return new Response(
        JSON.stringify({ error: 'Dados incompletos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Token de autenticação não fornecido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const jwt = authHeader.replace('Bearer ', '');

    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validate JWT and get user
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(jwt);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User authenticated:', user.id);

    // Fetch the index from database
    const { data: index, error: indexError } = await supabaseAdmin
      .from('indexes')
      .select('*, drivers(*)')
      .eq('id', index_id)
      .eq('user_id', user.id)
      .single();

    if (indexError || !index) {
      console.error('Error fetching index:', indexError);
      return new Response(
        JSON.stringify({ error: 'Index não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Index found:', index.id);

    // Check if episodes already exist for this anime
    const indexData = (index.index_data as any[]) || [];
    const anime = indexData.find(a => a.id === anime_id);

    if (!anime) {
      return new Response(
        JSON.stringify({ error: 'Anime não encontrado no index' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If episodes already exist, return them
    if (anime.episodes && anime.episodes.length > 0) {
      console.log('Episodes already exist:', anime.episodes.length);
      return new Response(
        JSON.stringify({ 
          success: true,
          episodes: anime.episodes,
          cached: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Crawling episodes from:', anime_url);

    // Fetch the driver to get selectors
    const driver = index.drivers;
    if (!driver) {
      return new Response(
        JSON.stringify({ error: 'Driver não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const driverConfig = driver.config as any;
    const selectors = driverConfig.selectors;

    // Fetch HTML from anime page
    const htmlResponse = await fetch(anime_url);
    const html = await htmlResponse.text();

    // Parse HTML to extract episodes
    const episodes: any[] = [];
    const errors: string[] = [];

    try {
      // Use DOMParser to parse HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      if (!doc) {
        throw new Error('Failed to parse HTML');
      }

      console.log('Selectors being used:', JSON.stringify(selectors, null, 2));
      console.log('Episode list selector:', selectors.episodeList);

      const episodeElements = doc.querySelectorAll(selectors.episodeList);
      console.log('Found episode elements:', episodeElements.length);

      // If no elements found, try to find common episode selectors
      if (episodeElements.length === 0) {
        console.log('No episodes found with provided selector. Trying common selectors...');
        
        const commonSelectors = [
          '.animepag_episodios_item',
          '.episode-item',
          '.episode',
          '.ep-item',
          '[class*="episode"]',
          '[class*="ep-"]'
        ];

        for (const selector of commonSelectors) {
          const elements = doc.querySelectorAll(selector);
          console.log(`Trying selector "${selector}": found ${elements.length} elements`);
          if (elements.length > 0) {
            errors.push(`Seletor original "${selectors.episodeList}" não funcionou. Encontrado ${elements.length} episódios com "${selector}". Ajuste o driver.`);
            break;
          }
        }
      }

      episodeElements.forEach((element: any, index: number) => {
        try {
          // Extract episode number
          const numberEl = element.querySelector(selectors.episodeNumber);
          const numberText = numberEl?.textContent?.trim();
          const episodeNumber = numberText ? parseInt(numberText.replace(/\D/g, '')) : index + 1;

          // Extract episode URL
          const urlEl = element.querySelector(selectors.episodeUrl);
          let sourceUrl = urlEl?.href || urlEl?.getAttribute('href') || '';

          if (sourceUrl && !sourceUrl.startsWith('http')) {
            const baseUrl = new URL(anime_url).origin;
            sourceUrl = new URL(sourceUrl, baseUrl).href;
          }

          if (!sourceUrl) {
            errors.push(`Episódio ${episodeNumber}: URL não encontrada`);
            return;
          }

          // Extract episode title (optional)
          const titleEl = selectors.episodeTitle 
            ? element.querySelector(selectors.episodeTitle)
            : null;
          const title = titleEl?.textContent?.trim();

          episodes.push({
            id: `ep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            episodeNumber,
            title,
            sourceUrl,
            watched: false
          });
        } catch (err) {
          errors.push(`Erro ao processar episódio ${index + 1}: ${err instanceof Error ? err.message : 'erro desconhecido'}`);
        }
      });

      console.log('Extracted episodes:', episodes.length);
      console.log('Errors:', errors);

    } catch (error) {
      console.error('Error parsing HTML:', error);
      return new Response(
        JSON.stringify({ error: 'Erro ao processar HTML da página' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save episodes to database
    if (episodes.length > 0) {
      const updatedIndexData = indexData.map((a: any) => {
        if (a.id === anime_id) {
          return { ...a, episodes };
        }
        return a;
      });

      const { error: updateError } = await supabaseAdmin
        .from('indexes')
        .update({ 
          index_data: updatedIndexData,
          updated_at: new Date().toISOString()
        })
        .eq('id', index_id);

      if (updateError) {
        console.error('Error saving episodes:', updateError);
        return new Response(
          JSON.stringify({ error: 'Erro ao salvar episódios' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Episodes saved to database');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        episodes,
        errors,
        cached: false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in crawl-episodes function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
