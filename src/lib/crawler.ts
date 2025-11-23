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
 * Fetches HTML from URL using CORS proxy or direct fetch
 * IMPORTANT: Many anime sites block CORS, so we'll need a proxy for production
 */
const fetchHTML = async (url: string): Promise<string> => {
  try {
    // Try direct fetch first
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error('Direct fetch failed, CORS blocked:', error);
    throw new Error('Não foi possível acessar o site. O site pode estar bloqueando acesso externo.');
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
    
    // Get anime list
    const animeElements = selectors.animeList 
      ? doc.querySelectorAll(selectors.animeList)
      : [doc.body]; // If no list selector, treat the whole page as one anime
    
    animeElements.forEach((element, index) => {
      try {
        // Extract title
        const titleEl = element.querySelector(selectors.animeTitle);
        const title = titleEl?.textContent?.trim();
        
        if (!title) {
          errors.push(`Anime ${index + 1}: título não encontrado`);
          return;
        }
        
        // Extract URL
        const urlEl = element.querySelector(selectors.animeUrl) as HTMLAnchorElement;
        let sourceUrl = urlEl?.href || urlEl?.getAttribute('href') || '';
        
        // Make URL absolute if relative
        if (sourceUrl && !sourceUrl.startsWith('http')) {
          sourceUrl = new URL(sourceUrl, driver.config.baseUrl).href;
        }
        
        if (!sourceUrl) {
          errors.push(`${title}: URL não encontrada`);
          return;
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
        
        // Extract synopsis
        const synopsisEl = selectors.animeSynopsis 
          ? element.querySelector(selectors.animeSynopsis)
          : null;
        const synopsis = synopsisEl?.textContent?.trim();
        
        animes.push({
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
        });
      } catch (err) {
        errors.push(`Erro ao processar anime ${index + 1}: ${err instanceof Error ? err.message : 'erro desconhecido'}`);
      }
    });
    
    return { animes, errors };
  } catch (error) {
    errors.push(`Erro ao fazer parse do HTML: ${error instanceof Error ? error.message : 'erro desconhecido'}`);
    return { animes: [], errors };
  }
};

/**
 * Crawls episodes for a specific anime
 */
export const crawlEpisodes = async (animeUrl: string, driver: Driver): Promise<{ episodes: LocalEpisode[], errors: string[] }> => {
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