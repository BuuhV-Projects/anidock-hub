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

    // If we received a selector from the driver, try to extrair o link diretamente
    if (external_link_selector) {
      try {
        const { DOMParser } = await import('https://deno.land/x/deno_dom/deno-dom-wasm.ts');
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const linkEl = doc.querySelector(external_link_selector) as any;
        const href = linkEl?.getAttribute('href') || linkEl?.getAttribute('data-href') || '';

        if (href) {
          const finalUrl = href.startsWith('http')
            ? href
            : new URL(href, episode_url).href;

          return new Response(
            JSON.stringify({ success: true, videoUrl: finalUrl }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (e) {
        console.error('Erro ao tentar extrair link direto com selector:', e);
        // Se falhar, continuamos para a abordagem via IA abaixo
      }
    }

    // Caso o seletor direto não funcione, usamos IA como fallback
    const prompt = `Analise o HTML abaixo e determine o tipo de player de vídeo:

1. Se há um player EMBARCADO (iframe, video tag) na página
2. Se há apenas um LINK EXTERNO que leva para outro site

HTML da página:
${html.substring(0, 50000)}

Retorne APENAS um JSON válido no seguinte formato:
{
  "hasEmbeddedPlayer": boolean,
  "videoSelector": "seletor CSS do player (iframe, video, etc)" ou null,
  "externalLinkSelector": "seletor CSS do link externo" ou null,
  "episodeNumber": número do episódio (se detectado) ou null,
  "title": "título do episódio" ou null,
  "thumbnailUrl": "url da thumbnail" ou null
}`;

    console.log('Calling AI to extract data...');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em extrair dados estruturados de HTML. Sempre retorne apenas JSON válido, sem explicações ou markdown.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      throw new Error(`Erro na API de IA: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;

    console.log('AI response:', content);

    // Parse JSON from AI response
    let extractedData;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      extractedData = JSON.parse(cleanContent);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Resposta da IA não está em formato JSON válido');
    }

    // Tentar extrair um link final a partir dos seletores retornados pela IA
    let finalUrl: string | null = null;
    try {
      const { DOMParser } = await import('https://deno.land/x/deno_dom/deno-dom-wasm.ts');
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      if (extractedData.hasEmbeddedPlayer && extractedData.videoSelector) {
        const playerEl = doc.querySelector(extractedData.videoSelector) as any;
        const src = playerEl?.getAttribute('src') || '';
        if (src) {
          finalUrl = src.startsWith('http') ? src : new URL(src, episode_url).href;
        }
      }

      if (!finalUrl && extractedData.externalLinkSelector) {
        const linkEl = doc.querySelector(extractedData.externalLinkSelector) as any;
        const href = linkEl?.getAttribute('href') || '';
        if (href) {
          finalUrl = href.startsWith('http') ? href : new URL(href, episode_url).href;
        }
      }
    } catch (e) {
      console.error('Erro ao usar seletores da IA para extrair URL final:', e);
    }

    if (!finalUrl) {
      return new Response(
        JSON.stringify({ success: true, data: extractedData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, videoUrl: finalUrl, data: extractedData }),
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