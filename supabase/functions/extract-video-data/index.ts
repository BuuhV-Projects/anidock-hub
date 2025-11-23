import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { episode_url, external_link_selector } = await req.json();

    if (!episode_url) {
      return new Response(
        JSON.stringify({ error: 'URL do episódio é obrigatória' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching HTML from:', episode_url);
    console.log('External link selector:', external_link_selector);

    // Fetch HTML content
    const htmlResponse = await fetch(episode_url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    if (!htmlResponse.ok) {
      throw new Error(`Erro ao buscar URL: ${htmlResponse.status}`);
    }

    const html = await htmlResponse.text();
    console.log('HTML fetched, length:', html.length);

    const { DOMParser } = await import('https://deno.land/x/deno_dom/deno-dom-wasm.ts');
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    if (!doc) {
      throw new Error('Failed to parse HTML');
    }

    // If driver provided a specific selector, use it first
    if (external_link_selector) {
      console.log('Searching for selector:', external_link_selector);
      const linkEl = doc.querySelector(external_link_selector);
      
      if (linkEl) {
        const href = linkEl.getAttribute('href') || linkEl.getAttribute('data-href') || '';
        console.log('Found link with selector:', href);

        if (href) {
          const finalUrl = href.startsWith('http')
            ? href
            : new URL(href, episode_url).href;

          console.log('Final URL:', finalUrl);

          return new Response(
            JSON.stringify({ success: true, videoUrl: finalUrl }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        console.log('No element found with selector:', external_link_selector);
      }
    }

    // Try common selectors for external links
    const commonSelectors = [
      'a[href*="assistir"]',
      'a[href*="watch"]',
      'a.watch-button',
      'a.btn-watch',
      'a[target="_blank"]',
      '.video-link a',
      '.player-link a',
    ];

    for (const selector of commonSelectors) {
      const linkEl = doc.querySelector(selector);
      if (linkEl) {
        const href = linkEl.getAttribute('href') || '';
        if (href && (href.startsWith('http') || href.startsWith('/'))) {
          const finalUrl = href.startsWith('http')
            ? href
            : new URL(href, episode_url).href;
          
          console.log('Found link with common selector', selector, ':', finalUrl);
          
          return new Response(
            JSON.stringify({ success: true, videoUrl: finalUrl }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // No external link found - return error so frontend can open episode page directly
    console.log('No external link found');
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Nenhum link externo encontrado. Abrindo página do episódio...' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in extract-video-data:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
