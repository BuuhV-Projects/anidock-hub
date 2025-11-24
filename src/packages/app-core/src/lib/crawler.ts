// Wrapper for anime-core crawler with browser-specific fetchHTML implementation
import { crawlWithDriver as crawlWithDriverCore, crawlEpisodes as crawlEpisodesCore, createExampleDriver, FetchHTMLFunction } from '@anidock/anime-core';
import { Driver, LocalAnime, LocalEpisode, CrawlResult } from '@anidock/anime-core';
import { supabase } from '@anidock/shared-utils';

/**
 * Fetches HTML from URL using backend edge function to bypass CORS
 */
const fetchHTML: FetchHTMLFunction = async (url: string): Promise<string> => {
  try {
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
 * Wrapper for crawlEpisodes that uses the configured fetchHTML
 * Accepts the signature expected by the app code
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

  const { episodes, errors } = await crawlEpisodesCore(animeUrl, driver, fetchHTML, existingEpisodes);
  
  // Auto-save to cloud only if we actually crawled new episodes
  if (animeId && indexId && episodes.length > 0) {
    try {
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
};

/**
 * Crawls episodes for a specific anime and automatically saves to cloud if logged in
 * Only crawls if episodes don't already exist in the anime data
 * @deprecated Use crawlEpisodes instead
 */
export const crawlEpisodesWithCloudSave = crawlEpisodes;

/**
 * Crawls a URL using the provided driver with progress callback
 */
export const crawl = async (
  url: string,
  driver: Driver,
  onProgress?: (status: string, progress: number) => void
): Promise<CrawlResult> => {
  return crawlWithDriverCore(url, driver, fetchHTML, onProgress);
};

/**
 * Wrapper for crawlWithDriver that uses the configured fetchHTML
 * Accepts the signature expected by the app code (without fetchHTML parameter)
 */
export const crawlWithDriver = async (
  url: string,
  driver: Driver,
  onProgress?: (status: string, progress: number) => void
): Promise<CrawlResult> => {
  return crawlWithDriverCore(url, driver, fetchHTML, onProgress);
};

// Re-export types and utilities
export { createExampleDriver };
export type { Driver, LocalAnime, LocalEpisode, CrawlResult };

