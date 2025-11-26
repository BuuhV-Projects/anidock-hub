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
    const { url, catalog_url, is_public = false } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL é obrigatória' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!catalog_url) {
      return new Response(
        JSON.stringify({ error: 'URL do catálogo é obrigatória' }),
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
    
    // STEP 1: Analyze catalog page to get anime list selectors
    const catalogAnalysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `Você é um especialista em web scraping. Analise o HTML da página de CATÁLOGO de animes.

TAREFA: Extrair seletores CSS ESPECÍFICOS E PRECISOS para LISTAR ANIMES.

🎯 REGRAS FUNDAMENTAIS:
1. NUNCA invente seletores genéricos (ex: ".anime-card", ".item", ".box")
2. USE EXATAMENTE as classes, tags e IDs que você VÊ no HTML fornecido
3. PRIORIZE seletores compostos (tag + classe) para maior especificidade: "article.boxAN", "div.item-list"
4. Para elementos SEM CLASSE (ex: <a> sem classe), use APENAS a tag: "a", "img", "span"
5. NUNCA adicione classes que não existem (ex: se vê <a> sem classe, use "a", NÃO "a.link")
6. VERIFIQUE que o seletor realmente existe no HTML antes de retornar
7. TESTE mentalmente: "querySelectorAll(seletor) vai pegar TODOS os animes repetidos?"

📋 PROCESSO DE ANÁLISE:
1. IDENTIFIQUE o padrão que se repete (cada repetição = um anime)
2. OBSERVE a estrutura HTML exata: tags, classes, IDs
3. CONSTRUA o seletor usando SOMENTE as classes/tags REAIS que você vê
4. Se um elemento NÃO tem classe, use apenas a tag
5. VALIDE: o seletor captura todos os itens repetidos?

🔍 EXEMPLOS DE ESTRUTURAS REAIS:
- article.boxAN (cada article com classe "boxAN" é um anime)
- .itemlistanime a (cada link dentro de .itemlistanime - note que "a" não tem classe)
- div.anime-item (cada div com classe "anime-item")
- li.episode-card (cada li com classe "episode-card")

📝 PARA CADA SELETOR:
- animeList: Container que se repete (article.boxAN, .item-list, li.anime)
- animeTitle: Tag com o título DENTRO do container (.title, h2.name, h2, .anime-title)
- animeCover: Tag img dentro do container (img, img.cover, .thumb img)
- animeUrl: Link relativo a animeList:
  * Se animeList JÁ for um <a>, deixe vazio ""
  * Se há <a> SEM CLASSE dentro do container, use "a"
  * Se há <a class="link">, use "a.link"
  * NUNCA invente "a.link" se a tag <a> não tem classe!
- animeSynopsis: Descrição/sinopse se houver (.synopsis, .desc, .summary, p)

⚠️ ERROS COMUNS A EVITAR:
❌ NÃO use ".anime-card" se não vir essa classe no HTML
❌ NÃO use "a.link" se vir apenas <a> sem classe
❌ NÃO use ".item" genérico - seja específico
❌ NÃO invente estruturas - use o que está no HTML
✅ USE "article.boxAN" se você vê <article class="boxAN">
✅ USE "a" (sem classe) se você vê <a> sem atributo class
✅ USE ".title" se você vê <div class="title">
✅ USE "h2" (sem classe) se você vê <h2> sem atributo class

Formato de retorno:
{
  "name": "Nome do Site",
  "domain": "exemplo.com",
  "selectors": {
    "animeList": "article.boxAN",
    "animeTitle": "h2",
    "animeCover": "img.cover",
    "animeUrl": "a",
    "animeSynopsis": ".desc"
  }
}

🚨 CRÍTICO: Use SOMENTE classes/tags que você REALMENTE vê no HTML fornecido!
🚨 Se um elemento não tem classe, use APENAS a tag (ex: "a", "h2", "img", "p")
Retorne APENAS o JSON válido, sem markdown ou explicações.`
          },
          {
            role: 'user',
            content: `Analise este HTML de catálogo e extraia seletores CSS para listar animes.

DICA: Procure por elementos que se REPETEM (um para cada anime). Pode ser links diretos ou containers com informações.

HTML:\n\n${html.slice(0, 30000)}`
          }
        ],
        temperature: 0.2,
      }),
    });

    if (!catalogAnalysisResponse.ok) {
      const errorText = await catalogAnalysisResponse.text();
      console.error('OpenAI API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Erro ao gerar driver com IA' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const catalogData = await catalogAnalysisResponse.json();
    const catalogText = catalogData.choices[0].message.content;
    
    console.log('Catalog analysis:', catalogText);

    // Parse catalog selectors
    let catalogConfig;
    try {
      const jsonMatch = catalogText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, catalogText];
      catalogConfig = JSON.parse(jsonMatch[1].trim());
      
      console.log('📦 Parsed catalog config:', JSON.stringify(catalogConfig, null, 2));
    } catch (e) {
      console.error('Error parsing catalog JSON:', e);
      return new Response(
        JSON.stringify({ error: 'Erro ao processar seletores do catálogo' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // STEP 2: Fetch an anime page to analyze episodes
    console.log('Fetching anime page to analyze episodes...');
    
    // Parse catalog HTML to get first anime URL
    const parser = new DOMParser();
    const catalogDoc = parser.parseFromString(html, 'text/html');
    const animeElements = catalogDoc.querySelectorAll(catalogConfig.selectors.animeList);
    
    console.log(`📋 Found ${animeElements.length} anime elements using selector: "${catalogConfig.selectors.animeList}"`);
    
    let animePageUrl = '';
    if (animeElements.length > 0) {
      const firstAnime = animeElements[0];
      
      console.log('🔍 First anime element:', {
        tagName: firstAnime.tagName,
        className: firstAnime.className,
        hasHref: !!firstAnime.getAttribute('href')
      });
      
      // If animeUrl is empty/falsy OR animeList itself is an 'A' tag, use the element directly
      if (!catalogConfig.selectors.animeUrl || catalogConfig.selectors.animeUrl === '' || firstAnime.tagName === 'A') {
        animePageUrl = firstAnime.getAttribute('href') || '';
        console.log('✅ Using animeList element directly as link:', animePageUrl);
      } else {
        // animeUrl is relative to animeList container
        const urlElement = firstAnime.querySelector(catalogConfig.selectors.animeUrl);
        animePageUrl = urlElement?.getAttribute('href') || '';
        console.log(`🔗 Found link using selector "${catalogConfig.selectors.animeUrl}":`, animePageUrl);
      }
      
      if (animePageUrl && !animePageUrl.startsWith('http')) {
        const absoluteUrl = new URL(animePageUrl, targetUrl).href;
        console.log(`🌐 Made URL absolute: ${animePageUrl} -> ${absoluteUrl}`);
        animePageUrl = absoluteUrl;
      }
    } else {
      console.log('❌ No anime elements found! Selector may be incorrect.');
    }

    console.log('🎯 First anime URL found:', animePageUrl);

    let episodeSelectors: {
      animePageTitle?: string;
      episodeList: string;
      episodeNumber: string;
      episodeTitle: string;
      episodeUrl: string;
      videoPlayer?: string;
      externalLinkSelector?: string;
    } = {
      episodeList: '',
      episodeNumber: '',
      episodeTitle: '',
      episodeUrl: ''
    };

    let requiresExternalLink = false;
    
    if (animePageUrl) {
      try {
        const animePageResponse = await fetch(animePageUrl);
        const animePageHtml = await animePageResponse.text();

        // STEP 3: Analyze anime page with AI to get episode selectors AND anime title
        const episodeAnalysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
                content: `Você é um especialista em web scraping. Analise o HTML da página de UM ANIME ESPECÍFICO.

TAREFA: Extrair seletores CSS ESPECÍFICOS E PRECISOS para TÍTULO DO ANIME e LISTA DE EPISÓDIOS.

🎯 REGRAS FUNDAMENTAIS:
1. NUNCA invente seletores genéricos (ex: ".episode-item", ".ep-number")
2. USE EXATAMENTE as classes, tags e IDs que você VÊ no HTML fornecido
3. Para elementos SEM CLASSE, use APENAS a tag (ex: "a", "h1", "span", "li")
4. NUNCA adicione classes que não existem (ex: se vê <a>, use "a", NÃO "a.link")
5. PRIORIZE seletores compostos (tag + classe) quando a classe REALMENTE existe
6. VERIFIQUE que o seletor existe no HTML antes de retornar

📋 PROCESSO DE ANÁLISE:
1. IDENTIFIQUE o título principal do anime (geralmente h1, h2 - pode ter ou não ter classe)
2. IDENTIFIQUE o padrão que se repete para episódios
3. OBSERVE a estrutura HTML exata: tags, classes, IDs
4. CONSTRUA seletores usando SOMENTE classes/tags REAIS
5. Se um elemento NÃO tem classe, use apenas a tag

🔍 PARA CADA SELETOR:
- animePageTitle: Título principal
  * Se <h1 class="title">, use "h1.title"
  * Se <h1> sem classe, use "h1"
  * Se <h2 class="anime-name">, use "h2.anime-name"
- episodeList: Container que se repete (.ep-item, li.episode, li sem classe = "li")
- episodeNumber: Número do episódio (.ep-num, .number, span sem classe = "span")
- episodeTitle: Nome do episódio (.ep-title, .episode-name, h3 sem classe = "h3")
- episodeUrl: Link do episódio
  * Se <a> SEM classe, use "a"
  * Se <a class="link">, use "a.link"
  * NUNCA invente "a.link" se não vê a classe!

⚠️ ERROS COMUNS A EVITAR:
❌ NÃO use "a.link" se vir apenas <a> sem classe
❌ NÃO use ".episode-item" se não vir essa classe
❌ NÃO invente estruturas - use o que está no HTML
✅ USE "a" se você vê <a> sem atributo class
✅ USE "h1" se você vê <h1> sem atributo class
✅ USE "li.episode" se você vê <li class="episode">

Formato esperado:
{
  "animePageTitle": "h1",
  "episodeList": "li.episode",
  "episodeNumber": "span.number",
  "episodeTitle": "h3",
  "episodeUrl": "a"
}

🚨 CRÍTICO: Use SOMENTE classes/tags que você REALMENTE vê no HTML!
🚨 Se um elemento não tem classe, use APENAS a tag!
Retorne APENAS o JSON válido, sem markdown ou explicações.`
              },
              {
                role: 'user',
                content: `Analise este HTML de página de anime e extraia seletores para o título do anime e lista de episódios:\n\n${animePageHtml.slice(0, 15000)}`
              }
            ],
            temperature: 0.3,
          }),
        });

        if (episodeAnalysisResponse.ok) {
          const episodeData = await episodeAnalysisResponse.json();
          const episodeText = episodeData.choices[0].message.content;
          console.log('Episode analysis:', episodeText);

          try {
            const epJsonMatch = episodeText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, episodeText];
            const episodeConfig = JSON.parse(epJsonMatch[1].trim());
            episodeSelectors = episodeConfig;
          } catch (e) {
            console.warn('Could not parse episode selectors, using defaults');
          }
        }

        // STEP 4: Check if first episode has embedded player or external link
        const episodeDoc = parser.parseFromString(animePageHtml, 'text/html');
        const episodeElements = episodeDoc.querySelectorAll(episodeSelectors.episodeList);
        
        if (episodeElements.length > 0) {
          const firstEpisode = episodeElements[0];
          const episodeUrlElement = firstEpisode.querySelector(episodeSelectors.episodeUrl);
          let firstEpisodeUrl = episodeUrlElement?.getAttribute('href') || '';
          
          if (firstEpisodeUrl && !firstEpisodeUrl.startsWith('http')) {
            firstEpisodeUrl = new URL(firstEpisodeUrl, animePageUrl).href;
          }

          if (firstEpisodeUrl) {
            console.log('Analyzing first episode for player detection:', firstEpisodeUrl);
            
            try {
              const episodePageResponse = await fetch(firstEpisodeUrl);
              const episodePageHtml = await episodePageResponse.text();

              // Check with AI if page has embedded player or requires external link
              const playerDetectionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
                      content: `Você é um especialista em análise de páginas de vídeo.

TAREFA: Determinar se a página tem player embutido ou link externo.

🎯 REGRAS:
1. USE EXATAMENTE as classes, tags e IDs que você VÊ no HTML
2. Para elementos SEM CLASSE, use APENAS a tag
3. NUNCA adicione classes que não existem
4. VERIFIQUE se iframe/video realmente existe

📋 ANÁLISE:
- hasEmbeddedPlayer = true: Se há <iframe> ou <video> no HTML
- hasEmbeddedPlayer = false: Se só há botões/links para outro site

🔍 SELETORES:
- videoSelector: Tag exata do player
  * Se <iframe id="player">, use "iframe#player"
  * Se <iframe class="video">, use "iframe.video"
  * Se <iframe> sem classe/id, use "iframe"
  * Se <video>, use "video"
- externalLinkSelector: Link externo se não houver player
  * Se <a> SEM classe, use "a"
  * Se <a class="watch">, use "a.watch"
  * NUNCA invente classes!

Formato:
{
  "hasEmbeddedPlayer": true,
  "videoSelector": "iframe",
  "externalLinkSelector": ""
}

🚨 Use APENAS tags/classes que REALMENTE existem no HTML!
🚨 Se um elemento não tem classe/id, use apenas a tag!
Retorne APENAS JSON, sem explicações.`
                    },
                    {
                      role: 'user',
                      content: `Analise este HTML de página de episódio:\n\n${episodePageHtml.slice(0, 15000)}`
                    }
                  ],
                  temperature: 0.3,
                }),
              });

              if (playerDetectionResponse.ok) {
                const playerData = await playerDetectionResponse.json();
                const playerText = playerData.choices[0].message.content;
                console.log('Player detection result:', playerText);

                try {
                  const playerJsonMatch = playerText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, playerText];
                  const playerConfig = JSON.parse(playerJsonMatch[1].trim());
                  
                  requiresExternalLink = !playerConfig.hasEmbeddedPlayer;
                  
                  if (playerConfig.videoSelector) {
                    episodeSelectors.videoPlayer = playerConfig.videoSelector;
                  }
                  if (playerConfig.externalLinkSelector) {
                    episodeSelectors.externalLinkSelector = playerConfig.externalLinkSelector;
                  }
                  
                  console.log('Player type detected:', requiresExternalLink ? 'External Link' : 'Embedded Player');
                } catch (e) {
                  console.warn('Could not parse player detection result, assuming embedded player');
                }
              }
            } catch (error) {
              console.warn('Could not analyze episode page for player:', error);
            }
          }
        }
      } catch (error) {
        console.warn('Could not analyze anime page for episodes:', error);
      }
    }

    // Merge catalog and episode selectors
    const driverConfig = {
      name: catalogConfig.name,
      domain: catalogConfig.domain,
      selectors: {
        ...catalogConfig.selectors,
        ...episodeSelectors
      }
    };

    // Extract domain from URL (use catalog_url if provided)
    const targetUrlObj = new URL(catalog_url || url);
    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    // Normalize driver config to match crawler expectations
    const rawSelectors = (driverConfig as any).selectors || driverConfig;
    const normalizedConfig = {
      baseUrl: targetUrlObj.origin,
      requiresExternalLink,
      selectors: {
        animeList: rawSelectors.animeList,
        animeTitle: rawSelectors.animeTitle,
        animeImage: rawSelectors.animeImage || rawSelectors.animeCover,
        animeSynopsis: rawSelectors.animeSynopsis,
        animeUrl: rawSelectors.animeUrl,
        animePageTitle: rawSelectors.animePageTitle,
        episodeList: rawSelectors.episodeList,
        episodeNumber: rawSelectors.episodeNumber,
        episodeTitle: rawSelectors.episodeTitle,
        episodeUrl: rawSelectors.episodeUrl,
        videoPlayer: rawSelectors.videoPlayer,
        externalLinkSelector: rawSelectors.externalLinkSelector,
      },
    };

    // Save driver to database using admin client
    // Save driver with catalog_url (now required)
    const { data: driver, error: insertError } = await supabaseAdmin
      .from('drivers')
      .insert({
        name: driverConfig.name || `Driver ${domain}`,
        domain: driverConfig.domain || domain,
        config: normalizedConfig,
        user_id: user.id,
        is_public: is_public,
        source_url: url,
        catalog_url: catalog_url,
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
