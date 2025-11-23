import { Driver, LocalAnime, LocalEpisode } from './localStorage';

/**
 * Browser-based crawler that uses drivers to extract anime data
 * Works 100% locally without server
 */

export interface CrawlResult {
  animes: LocalAnime[];
  errors: string[];
}

/**
 * Fetches HTML from URL using backend edge function to bypass CORS
 */
const fetchHTML = async (url: string): Promise<string> => {
  try {
    // Import supabase client dynamically to avoid circular dependencies
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Use edge function to fetch HTML and bypass CORS
    const { data, error } = await supabase.functions.invoke('fetch-html', {
      body: { url }
    });
    
    if (error) {
      console.error('Edge function error:', error);
      throw new Error('Não foi possível acessar o site via backend');
    }
    
    if (data?.error) {
      throw new Error(data.error);
    }
    
    if (!data?.html) {
      throw new Error('Resposta inválida do servidor');
    }
    
    return data.html;
  } catch (error) {
    console.error('Fetch HTML failed:', error);
    throw error instanceof Error ? error : new Error('Não foi possível acessar o site');
  }
};

/**
 * Parses HTML using driver selectors
 */
const parseWithDriver = (html: string, driver: Driver): { animes: any[], errors: string[] } => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const animes: any[] = [];
  const errors: string[] = [];
  
  try {
    const { selectors } = driver.config;
    
    console.log('🔍 Parser - Starting with selectors:', JSON.stringify(selectors, null, 2));
    
    // Get anime list
    const animeElements = selectors.animeList 
      ? doc.querySelectorAll(selectors.animeList)
      : [doc.body]; // If no list selector, treat the whole page as one anime
    
    console.log(`📋 Parser - Found ${animeElements.length} anime elements using selector: "${selectors.animeList}"`);
    
    if (animeElements.length === 0) {
      errors.push(`Nenhum anime encontrado usando o seletor: ${selectors.animeList}`);
      return { animes: [], errors };
    }
    
    animeElements.forEach((element, index) => {
      try {
        // Extract URL first (check if animeList itself is the link)
        let sourceUrl = '';
        
        // If animeUrl is empty/falsy, the animeList selector itself points to the link
        if (!selectors.animeUrl || selectors.animeUrl === '') {
          const linkElement = element as HTMLAnchorElement;
          sourceUrl = linkElement.href || linkElement.getAttribute('href') || '';
          console.log(`🔗 Anime ${index + 1} - Using animeList as link: ${sourceUrl}`);
        } else {
          // animeUrl is relative to animeList container
          const urlEl = element.querySelector(selectors.animeUrl) as HTMLAnchorElement;
          sourceUrl = urlEl?.href || urlEl?.getAttribute('href') || '';
          console.log(`🔗 Anime ${index + 1} - Found link with selector "${selectors.animeUrl}": ${sourceUrl}`);
        }
        
        // Make URL absolute if relative
        if (sourceUrl && !sourceUrl.startsWith('http')) {
          sourceUrl = new URL(sourceUrl, driver.config.baseUrl).href;
          console.log(`✅ Made URL absolute: ${sourceUrl}`);
        }
        
        if (!sourceUrl) {
          errors.push(`Anime ${index + 1}: URL não encontrada`);
          console.log(`❌ Anime ${index + 1} - No URL found`);
          return;
        }
        
        // Extract title (might be inside link or in a specific selector)
        let title = '';
        if (selectors.animeTitle) {
          const titleEl = element.querySelector(selectors.animeTitle);
          title = titleEl?.textContent?.trim() || '';
        }
        
        // If no title found and element is a link, use link text
        if (!title && element.tagName === 'A') {
          title = element.textContent?.trim() || '';
        }
        
        console.log(`📝 Anime ${index + 1} - Title: "${title}"`);
        
        if (!title) {
          // Use URL as fallback title
          try {
            const urlObj = new URL(sourceUrl);
            title = urlObj.pathname.split('/').filter(Boolean).pop() || `Anime ${index + 1}`;
            console.log(`⚠️ Anime ${index + 1} - No title found, using fallback: "${title}"`);
          } catch {
            title = `Anime ${index + 1}`;
          }
        }
        
        // Extract image
        const imageEl = selectors.animeImage 
          ? element.querySelector(selectors.animeImage) as HTMLImageElement
          : null;
        let coverUrl = imageEl?.src || imageEl?.getAttribute('data-src') || '';
        
        // Make image URL absolute if relative
        if (coverUrl && !coverUrl.startsWith('http')) {
          coverUrl = new URL(coverUrl, driver.config.baseUrl).href;
        }
        
        console.log(`🖼️ Anime ${index + 1} - Image: ${coverUrl || 'none'}`);
        
        // Extract synopsis
        const synopsisEl = selectors.animeSynopsis 
          ? element.querySelector(selectors.animeSynopsis)
          : null;
        const synopsis = synopsisEl?.textContent?.trim();
        
        const animeData = {
          id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          driverId: driver.id,
          title,
          synopsis,
          coverUrl,
          sourceUrl,
          episodes: [], // Episodes will be crawled separately
          metadata: {
            crawledAt: new Date().toISOString(),
            driverVersion: driver.version
          }
        };
        
        console.log(`✅ Anime ${index + 1} processed successfully:`, animeData);
        animes.push(animeData);
      } catch (err) {
        const errorMsg = `Erro ao processar anime ${index + 1}: ${err instanceof Error ? err.message : 'erro desconhecido'}`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`, err);
      }
    });
    
    console.log(`🎉 Parser complete - ${animes.length} animes extracted, ${errors.length} errors`);
    return { animes, errors };
  } catch (error) {
    const errorMsg = `Erro ao fazer parse do HTML: ${error instanceof Error ? error.message : 'erro desconhecido'}`;
    errors.push(errorMsg);
    console.error(`❌ ${errorMsg}`, error);
    return { animes: [], errors };
  }
};

/**
 * Crawls episodes for a specific anime and automatically saves to cloud if logged in
 * Only crawls if episodes don't already exist in the anime data
 */
export const crawlEpisodes = async (
  animeUrl: string, 
  driver: Driver, 
  animeId?: string,
  indexId?: number,
  existingEpisodes?: LocalEpisode[]
): Promise<{ episodes: LocalEpisode[], errors: string[] }> => {
  // If episodes already exist, return them without crawling
  if (existingEpisodes && existingEpisodes.length > 0) {
    return { episodes: existingEpisodes, errors: [] };
  }

  const errors: string[] = [];
  const episodes: LocalEpisode[] = [];
  
  try {
    const html = await fetchHTML(animeUrl);
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const { selectors } = driver.config;
    const episodeElements = doc.querySelectorAll(selectors.episodeList);
    
    episodeElements.forEach((element, index) => {
      try {
        // Extract episode number
        const numberEl = element.querySelector(selectors.episodeNumber);
        const numberText = numberEl?.textContent?.trim();
        const episodeNumber = numberText ? parseInt(numberText.replace(/\D/g, '')) : index + 1;
        
        // Extract episode URL
        const urlEl = element.querySelector(selectors.episodeUrl) as HTMLAnchorElement;
        let sourceUrl = urlEl?.href || urlEl?.getAttribute('href') || '';
        
        if (sourceUrl && !sourceUrl.startsWith('http')) {
          sourceUrl = new URL(sourceUrl, driver.config.baseUrl).href;
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
    
    // Auto-save to cloud only if we actually crawled new episodes
    if (animeId && indexId && episodes.length > 0) {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Fetch current index data
          const { data: indexData, error: fetchError } = await supabase
            .from('indexes')
            .select('index_data')
            .eq('id', indexId)
            .single();
            
          if (!fetchError && indexData) {
            // Update anime with episodes in index_data
            const currentIndexData = (indexData.index_data as any[]) || [];
            const updatedIndexData = currentIndexData.map((anime: any) => {
              if (anime.id === animeId) {
                return { ...anime, episodes };
              }
              return anime;
            });
            
            // Save back to database
            await supabase
              .from('indexes')
              .update({ 
                index_data: updatedIndexData,
                updated_at: new Date().toISOString()
              })
              .eq('id', indexId);
              
            console.log('Episodes auto-saved to cloud');
          }
        }
      } catch (cloudError) {
        console.error('Failed to auto-save episodes to cloud:', cloudError);
        // Don't fail the whole operation if cloud save fails
      }
    }
    
    return { episodes, errors };
  } catch (error) {
    errors.push(`Erro ao buscar episódios: ${error instanceof Error ? error.message : 'erro desconhecido'}`);
    return { episodes: [], errors };
  }
};

/**
 * Crawls a URL using the provided driver with progress callback
 */
export const crawlWithDriver = async (
  url: string,
  driver: Driver,
  onProgress?: (status: string, progress: number) => void
): Promise<CrawlResult> => {
  const result: CrawlResult = {
    animes: [],
    errors: []
  };
  
  try {
    console.log('Crawling:', url);
    console.log('Using driver:', driver.name);
    
    onProgress?.('Buscando HTML...', 0.1);
    const html = await fetchHTML(url);
    
    onProgress?.('Extraindo animes...', 0.3);
    const { animes, errors } = parseWithDriver(html, driver);
    
    result.animes = animes;
    result.errors = errors;
    
    onProgress?.('Concluído!', 1.0);
    console.log(`Crawl complete: ${animes.length} animes found, ${errors.length} errors`);
    
    return result;
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : 'Erro desconhecido ao crawlear');
    return result;
  }
};

/**
 * Example driver structure for reference
 */
export const createExampleDriver = (): Driver => {
  return {
    id: `example_${Date.now()}`,
    name: 'Example Anime Site',
    domain: 'example.com',
    version: '1.0.0',
    author: 'AniDock',
    config: {
      baseUrl: 'https://example.com',
      selectors: {
        animeList: '.anime-card',
        animeTitle: '.anime-title',
        animeImage: '.anime-cover img',
        animeSynopsis: '.anime-synopsis',
        animeUrl: 'a.anime-link',
        episodeList: '.episode-item',
        episodeNumber: '.ep-number',
        episodeTitle: '.ep-title',
        episodeUrl: 'a.ep-link',
        videoPlayer: 'iframe, video'
      },
      pagination: {
        nextButton: '.next-page',
        pageParam: 'page'
      }
    },
    isLocal: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};