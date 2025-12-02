export interface SelectorValidationResult {
  counts: Record<string, number>;
  pages: {
    catalog: string | null;
    anime: string | null;
    episode: string | null;
  };
  errors: string[];
}

export interface SelectorsToValidate {
  // Catalog page selectors
  animeList?: string;
  animeTitle?: string;
  animeImage?: string;
  animeUrl?: string;
  // Anime page selectors
  animeSynopsis?: string;
  animePageTitle?: string;
  episodeList?: string;
  episodeNumber?: string;
  episodeTitle?: string;
  episodeUrl?: string;
  // Episode page selectors
  videoPlayer?: string;
  externalLinkSelector?: string;
}

type FetchHTMLFunction = (url: string) => Promise<string>;

const CATALOG_SELECTORS = ['animeList', 'animeTitle', 'animeImage', 'animeUrl'];
const ANIME_PAGE_SELECTORS = ['animeSynopsis', 'animePageTitle', 'episodeList', 'episodeNumber', 'episodeTitle', 'episodeUrl'];
const EPISODE_PAGE_SELECTORS = ['videoPlayer', 'externalLinkSelector'];

function countElements(doc: Document, selector: string): number {
  if (!selector) return 0;
  try {
    return doc.querySelectorAll(selector).length;
  } catch {
    return 0;
  }
}

function extractUrl(doc: Document, baseUrl: string, containerSelector: string, urlSelector: string): string | null {
  try {
    let element: Element | null = null;
    
    if (containerSelector) {
      const container = doc.querySelector(containerSelector);
      if (container && urlSelector) {
        element = container.querySelector(urlSelector);
      } else if (container) {
        element = container.querySelector('a');
      }
    } else if (urlSelector) {
      element = doc.querySelector(urlSelector);
    }

    if (!element) return null;

    const href = element.getAttribute('href');
    if (!href) return null;

    // Handle relative URLs
    if (href.startsWith('/')) {
      const url = new URL(baseUrl);
      return `${url.origin}${href}`;
    } else if (!href.startsWith('http')) {
      const url = new URL(baseUrl);
      return `${url.origin}/${href}`;
    }
    
    return href;
  } catch {
    return null;
  }
}

export async function validateSelectors(
  catalogUrl: string,
  selectors: SelectorsToValidate,
  fetchHTML: FetchHTMLFunction
): Promise<SelectorValidationResult> {
  const result: SelectorValidationResult = {
    counts: {},
    pages: {
      catalog: null,
      anime: null,
      episode: null,
    },
    errors: [],
  };

  const parser = new DOMParser();

  // Step 1: Fetch and validate catalog page
  try {
    const catalogHtml = await fetchHTML(catalogUrl);
    const catalogDoc = parser.parseFromString(catalogHtml, 'text/html');
    result.pages.catalog = catalogUrl;

    // Validate catalog selectors
    for (const key of CATALOG_SELECTORS) {
      const selector = selectors[key as keyof SelectorsToValidate];
      if (selector) {
        result.counts[key] = countElements(catalogDoc, selector);
      }
    }

    // Step 2: Try to get first anime URL and fetch anime page
    const animeUrl = extractUrl(
      catalogDoc,
      catalogUrl,
      selectors.animeList || '',
      selectors.animeUrl || 'a'
    );

    if (animeUrl) {
      try {
        const animeHtml = await fetchHTML(animeUrl);
        const animeDoc = parser.parseFromString(animeHtml, 'text/html');
        result.pages.anime = animeUrl;

        // Validate anime page selectors
        for (const key of ANIME_PAGE_SELECTORS) {
          const selector = selectors[key as keyof SelectorsToValidate];
          if (selector) {
            result.counts[key] = countElements(animeDoc, selector);
          }
        }

        // Step 3: Try to get first episode URL and fetch episode page
        const episodeUrl = extractUrl(
          animeDoc,
          animeUrl,
          selectors.episodeList || '',
          selectors.episodeUrl || 'a'
        );

        if (episodeUrl) {
          try {
            const episodeHtml = await fetchHTML(episodeUrl);
            const episodeDoc = parser.parseFromString(episodeHtml, 'text/html');
            result.pages.episode = episodeUrl;

            // Validate episode/player selectors
            for (const key of EPISODE_PAGE_SELECTORS) {
              const selector = selectors[key as keyof SelectorsToValidate];
              if (selector) {
                result.counts[key] = countElements(episodeDoc, selector);
              }
            }
          } catch (error) {
            result.errors.push(`Failed to fetch episode page: ${episodeUrl}`);
          }
        } else {
          result.errors.push('Could not find episode URL on anime page');
        }
      } catch (error) {
        result.errors.push(`Failed to fetch anime page: ${animeUrl}`);
      }
    } else {
      result.errors.push('Could not find anime URL on catalog page');
    }
  } catch (error) {
    result.errors.push(`Failed to fetch catalog page: ${catalogUrl}`);
  }

  return result;
}
