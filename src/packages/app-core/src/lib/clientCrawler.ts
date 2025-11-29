// Client-side crawler using fetch and DOM parsing
import { Driver, LocalAnime, LocalEpisode } from './indexedDB';

export interface CrawlResult {
  animes: LocalAnime[];
  errors: string[];
}

export interface CrawlProgress {
  current: number;
  total: number;
  status: string;
}

// Fetch HTML from URL with CORS proxy if needed
export async function fetchHTML(url: string): Promise<string> {
  try {
    // Try direct fetch first
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error('Failed to fetch HTML:', error);
    // If direct fetch fails, use CORS proxy
    const corsProxy = 'https://api.allorigins.win/raw?url=';
    const response = await fetch(corsProxy + encodeURIComponent(url));
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    
    return await response.text();
  }
}

// Parse HTML and extract anime data using driver selectors
export async function crawlWithDriver(
  url: string,
  driver: Driver,
  onProgress?: (progress: CrawlProgress) => void
): Promise<CrawlResult> {
  const errors: string[] = [];
  const animes: LocalAnime[] = [];

  try {
    onProgress?.({ current: 0, total: 1, status: 'Fetching catalog page...' });
    
    const html = await fetchHTML(url);
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Find anime list items
    const animeItems = doc.querySelectorAll(driver.config.selectors.animeList || 'article, .anime-item, .item');
    
    if (animeItems.length === 0) {
      errors.push('No anime items found with selector: ' + (driver.config.selectors.animeList || 'default'));
      return { animes: [], errors };
    }

    onProgress?.({ current: 0, total: animeItems.length, status: 'Extracting anime data...' });

    for (let i = 0; i < animeItems.length; i++) {
      const item = animeItems[i];
      
      try {
        // Extract title
        const titleEl = item.querySelector(driver.config.selectors.animeTitle);
        const title = titleEl?.textContent?.trim() || titleEl?.getAttribute('title')?.trim();
        
        if (!title) {
          errors.push(`Anime ${i + 1}: Title not found`);
          continue;
        }

        // Extract URL
        const urlEl = item.querySelector(driver.config.selectors.animeUrl) as HTMLAnchorElement;
        let animeUrl = urlEl?.href || urlEl?.getAttribute('href') || '';
        
        if (!animeUrl) {
          errors.push(`Anime ${i + 1}: URL not found`);
          continue;
        }

        // Make URL absolute if relative
        if (animeUrl.startsWith('/')) {
          const baseUrl = new URL(driver.config.baseUrl);
          animeUrl = baseUrl.origin + animeUrl;
        } else if (!animeUrl.startsWith('http')) {
          animeUrl = driver.config.baseUrl + animeUrl;
        }

        // Extract cover image
        const imgEl = item.querySelector(driver.config.selectors.animeImage || 'img') as HTMLImageElement;
        const coverUrl = imgEl?.src || imgEl?.getAttribute('data-src') || imgEl?.getAttribute('data-lazy-src');

        // Extract synopsis if available
        const synopsisEl = driver.config.selectors.animeSynopsis 
          ? item.querySelector(driver.config.selectors.animeSynopsis)
          : null;
        const synopsis = synopsisEl?.textContent?.trim();

        const anime: LocalAnime = {
          id: crypto.randomUUID(),
          driverId: driver.id,
          title,
          coverUrl: coverUrl || undefined,
          synopsis: synopsis || undefined,
          sourceUrl: animeUrl,
          episodes: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        animes.push(anime);
        onProgress?.({ current: i + 1, total: animeItems.length, status: `Extracted ${i + 1}/${animeItems.length} animes` });
      } catch (error) {
        errors.push(`Anime ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { animes, errors };
  } catch (error) {
    errors.push(`Crawl failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { animes, errors };
  }
}

// Crawl episodes for a specific anime
export async function crawlEpisodes(
  animeUrl: string,
  driver: Driver,
  onProgress?: (progress: CrawlProgress) => void
): Promise<{ episodes: LocalEpisode[]; errors: string[] }> {
  const errors: string[] = [];
  const episodes: LocalEpisode[] = [];

  try {
    onProgress?.({ current: 0, total: 1, status: 'Fetching anime page...' });
    
    const html = await fetchHTML(animeUrl);
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Find episode list items
    const episodeItems = doc.querySelectorAll(driver.config.selectors.episodeList);
    
    if (episodeItems.length === 0) {
      errors.push('No episodes found with selector: ' + driver.config.selectors.episodeList);
      return { episodes: [], errors };
    }

    onProgress?.({ current: 0, total: episodeItems.length, status: 'Extracting episodes...' });

    for (let i = 0; i < episodeItems.length; i++) {
      const item = episodeItems[i];
      
      try {
        // Extract episode number
        const numberEl = item.querySelector(driver.config.selectors.episodeNumber);
        const numberText = numberEl?.textContent?.trim() || '';
        const episodeNumber = parseInt(numberText.replace(/\D/g, '')) || (i + 1);

        // Extract episode URL
        const urlEl = item.querySelector(driver.config.selectors.episodeUrl) as HTMLAnchorElement;
        let episodeUrl = urlEl?.href || urlEl?.getAttribute('href') || '';
        
        if (!episodeUrl) {
          errors.push(`Episode ${episodeNumber}: URL not found`);
          continue;
        }

        // Make URL absolute if relative
        if (episodeUrl.startsWith('/')) {
          const baseUrl = new URL(driver.config.baseUrl);
          episodeUrl = baseUrl.origin + episodeUrl;
        } else if (!episodeUrl.startsWith('http')) {
          episodeUrl = driver.config.baseUrl + episodeUrl;
        }

        // Extract episode title if available
        const titleEl = driver.config.selectors.episodeTitle 
          ? item.querySelector(driver.config.selectors.episodeTitle)
          : null;
        const title = titleEl?.textContent?.trim();

        const episode: LocalEpisode = {
          id: crypto.randomUUID(),
          episodeNumber,
          title: title || undefined,
          sourceUrl: episodeUrl,
          watched: false,
        };

        episodes.push(episode);
        onProgress?.({ current: i + 1, total: episodeItems.length, status: `Extracted ${i + 1}/${episodeItems.length} episodes` });
      } catch (error) {
        errors.push(`Episode ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { episodes, errors };
  } catch (error) {
    errors.push(`Episode crawl failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { episodes, errors };
  }
}

// Extract video URL from episode page
export async function extractVideoUrl(
  episodeUrl: string,
  driver: Driver
): Promise<{ videoUrl: string | null; videoType: 'iframe' | 'video' | 'external' }> {
  try {
    const html = await fetchHTML(episodeUrl);
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Strategy 1: Look for iframe with video player
    if (driver.config.selectors.videoPlayer) {
      const iframe = doc.querySelector(driver.config.selectors.videoPlayer) as HTMLIFrameElement;
      if (iframe?.src) {
        return { videoUrl: iframe.src, videoType: 'iframe' };
      }
    }

    // Strategy 2: Look for video tag
    const video = doc.querySelector('video source, video') as HTMLVideoElement | HTMLSourceElement;
    if (video?.src) {
      return { videoUrl: video.src, videoType: 'video' };
    }

    // Strategy 3: Look for external link
    if (driver.config.selectors.externalLinkSelector) {
      const link = doc.querySelector(driver.config.selectors.externalLinkSelector) as HTMLAnchorElement;
      if (link?.href) {
        return { videoUrl: link.href, videoType: 'external' };
      }
    }

    // Strategy 4: Default iframe search
    const anyIframe = doc.querySelector('iframe[src*="player"], iframe[src*="embed"], iframe[src*="video"]') as HTMLIFrameElement;
    if (anyIframe?.src) {
      return { videoUrl: anyIframe.src, videoType: 'iframe' };
    }

    return { videoUrl: null, videoType: 'external' };
  } catch (error) {
    console.error('Failed to extract video URL:', error);
    return { videoUrl: null, videoType: 'external' };
  }
}
