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
    const { url, driver } = await req.json();

    if (!url || !driver) {
      return new Response(
        JSON.stringify({ error: 'URL e driver são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching HTML from:', url);

    // Fetch HTML content
    const htmlResponse = await fetch(url, {
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

    // Prepare AI prompt
    const prompt = `Analise o HTML abaixo e extraia as seguintes informações de uma página de anime:

1. Título do anime
2. Sinopse/descrição
3. URL da imagem de capa
4. URL da página (já fornecida: ${url})

Driver Context (seletores já conhecidos):
${JSON.stringify(driver.config.selectors, null, 2)}

HTML da página:
${html.substring(0, 50000)}

Retorne APENAS um JSON válido no seguinte formato:
{
  "title": "título do anime",
  "synopsis": "sinopse completa" ou null,
  "coverUrl": "url da capa" ou null,
  "sourceUrl": "${url}"
}`;

    console.log('Calling AI to extract anime data...');

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
            content: 'Você é um especialista em extrair dados estruturados de HTML de sites de anime. Sempre retorne apenas JSON válido, sem explicações ou markdown.'
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

    return new Response(
      JSON.stringify({ success: true, data: extractedData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in extract-anime-data:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});