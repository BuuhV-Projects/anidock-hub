// Client-side crawler using fetch and DOM parsing
import { Logger } from '@anidock/shared-utils';
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

function removeAnidockHostFromCrawledUrl(driverBaseUrl: string, url?: string | null, ): string | null {
    if (!url) {
        return null;
    }

    // Make URL absolute if relative
    if (url.startsWith('/')) {
        const baseUrl = new URL(driverBaseUrl);
        url = baseUrl.origin + url;
    } else if (!url.startsWith('http')) {
        url = driverBaseUrl + url;
    }

    //previne que caso a url seja a do anidock e não a do site, então ele aplica a url do site para envitar apontamento errado
    const anidockOriginUrl = new URL(url).origin;
    if (anidockOriginUrl !== driverBaseUrl) {
        url = url.replace(anidockOriginUrl, driverBaseUrl);
    }
    return url;
}

// Fetch HTML from URL with CORS proxy fallbacks (web) or Puppeteer (desktop)
export async function fetchHTML(url: string, usePuppeteer?: () => Promise<string>): Promise<string> {
    // If Puppeteer is available (desktop), use it
    if (usePuppeteer) {
        try {
            console.log('Using Puppeteer to fetch HTML');
            return await usePuppeteer();
        } catch (error) {
            console.error('Puppeteer failed:', error);
            throw error;
        }
    }

    // Otherwise, use CORS proxies (web)
    const proxies = [
        'https://corsproxy.io/?',
        'https://api.allorigins.win/raw?url=',
        'https://cors-anywhere.herokuapp.com/',
    ];

    // Try each proxy (skip direct fetch due to CORS)
    for (let i = 0; i < proxies.length; i++) {
        try {
            const proxyUrl = proxies[i] + encodeURIComponent(url);
            console.log(`Attempting proxy ${i + 1}/${proxies.length}: ${proxies[i]}`);
            
            const response = await fetch(proxyUrl);

            if (!response.ok) {
                console.warn(`Proxy ${i + 1} failed with status ${response.status}`);
                if (i === proxies.length - 1) {
                    throw new Error(`Failed to fetch: ${response.status}`);
                }
                continue;
            }

            console.log(`Proxy ${i + 1} succeeded!`);
            return await response.text();
        } catch (error) {
            console.error(`Proxy ${i + 1} error:`, error);
            if (i === proxies.length - 1) {
                throw new Error(`All CORS proxies failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
    }

    throw new Error('Failed to fetch HTML from all sources');
}

// Parse HTML and extract anime data using driver selectors
export async function crawlWithDriver(
    url: string,
    driver: Driver,
    onProgress?: (progress: CrawlProgress) => void,
    crawlerFetchHTML?: (url: string) => Promise<string>
): Promise<CrawlResult> {
    const errors: string[] = [];
    const animes: LocalAnime[] = [];
    const logger = new Logger(crawlWithDriver.name);

    try {
        logger.info(`Iniciando crawler para ${url}`);
        onProgress?.({ current: 0, total: 1, status: 'Fetching catalog page...' });

        const html = await fetchHTML(url, crawlerFetchHTML);
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
            logger.info(`Extraindo anime ${i + 1} de ${animeItems.length}`);
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
                const animeUrl = removeAnidockHostFromCrawledUrl(driver.config.baseUrl, urlEl?.href || urlEl?.getAttribute('href') || '');

                if (!animeUrl) {
                    errors.push(`Anime ${i + 1}: URL not found`);
                    continue;
                }


                // Extract cover image
                const imgEl = item.querySelector(driver.config.selectors.animeImage || 'img') as HTMLImageElement;
                const coverUrl = removeAnidockHostFromCrawledUrl(driver.config.baseUrl, imgEl?.src || imgEl?.getAttribute('data-src') || imgEl?.getAttribute('data-lazy-src'));

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

                logger.info(`Anime ${i + 1} extraído:`, JSON.stringify(anime));

                animes.push(anime);
                onProgress?.({ current: i + 1, total: animeItems.length, status: `Extracted ${i + 1}/${animeItems.length} animes` });
            } catch (error) {
                logger.error(`Erro ao extrair anime ${i + 1}:`, error);
                errors.push(`Anime ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }

        return { animes, errors };
    } catch (error) {
        logger.error(`Erro ao fazer crawl:`, error);
        errors.push(`Crawl failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return { animes, errors };
    }
}

// Crawl episodes for a specific anime
export async function crawlEpisodes(
    animeUrl: string,
    driver: Driver,
    onProgress?: (progress: CrawlProgress) => void,
    crawlerFetchHTML?: (url: string) => Promise<string>
): Promise<{ episodes: LocalEpisode[]; errors: string[] }> {
    const errors: string[] = [];
    const episodes: LocalEpisode[] = [];
    const logger = new Logger(crawlEpisodes.name);
    try {
        onProgress?.({ current: 0, total: 1, status: 'Fetching anime page...' });

        const html = await fetchHTML(animeUrl, crawlerFetchHTML);
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
                const episodeUrl = removeAnidockHostFromCrawledUrl(driver.config.baseUrl, urlEl?.href || urlEl?.getAttribute('href') || '');

                if (!episodeUrl) {
                    errors.push(`Episode ${episodeNumber}: URL not found`);
                    continue;
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
    driver: Driver,
    crawlerFetchHTML?: (url: string) => Promise<string>
): Promise<{ videoUrl: string | null; videoType: 'iframe' | 'video' | 'external' }> {
    try {
        const html = await fetchHTML(episodeUrl, crawlerFetchHTML);
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
