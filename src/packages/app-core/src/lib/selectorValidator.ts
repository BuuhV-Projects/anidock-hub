import { Logger } from "@anidock/shared-utils";

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

type SelectorKey = keyof SelectorsToValidate;

const CATALOG_SELECTORS: SelectorKey[] = ['animeList', 'animeTitle', 'animeImage', 'animeUrl'];
const ANIME_PAGE_SELECTORS: SelectorKey[] = ['animeSynopsis', 'animePageTitle', 'episodeList', 'episodeNumber', 'episodeTitle', 'episodeUrl'];
const EPISODE_PAGE_SELECTORS: SelectorKey[] = ['videoPlayer', 'externalLinkSelector'];

/**
 * Counts elements matching a selector in a document
 */
function countElements(doc: Document, selector: string): number {
  if (!selector) return 0;
  
  try {
    return doc.querySelectorAll(selector).length;
  } catch {
    return 0;
  }
}

/**
 * Normalizes a URL to an absolute URL based on a base URL
 */
function normalizeUrl(href: string, baseUrl: string): string {
  if (href.startsWith('http://') || href.startsWith('https://')) {
    return href;
  }

  const base = new URL(baseUrl);
  
  if (href.startsWith('/')) {
    return `${base.origin}${href}`;
  }
  
  return `${base.origin}/${href}`;
}

/**
 * Extracts the first URL from a document using container and URL selectors
 */
function extractUrl(
  doc: Document,
  baseUrl: string,
  containerSelector: string,
  urlSelector: string
): string | null {
  try {
    const element = findLinkElement(doc, containerSelector, urlSelector);
    if (!element) return null;

    const href = element.getAttribute('href');
    if (!href) return null;

    return normalizeUrl(href, baseUrl);
  } catch {
    return null;
  }
}

/**
 * Finds a link element using container and URL selectors
 */
function findLinkElement(
  doc: Document,
  containerSelector: string,
  urlSelector: string
): Element | null {
  if (containerSelector) {
    const container = doc.querySelector(containerSelector);
    if (!container) return null;

    return container.querySelector(urlSelector || 'a');
  }

  return doc.querySelector(urlSelector || 'a');
}

/**
 * Validates selectors on a document and updates the result counts
 */
function validateSelectorsOnDocument(
  doc: Document,
  selectors: SelectorsToValidate,
  selectorKeys: SelectorKey[],
  result: SelectorValidationResult
): void {
  for (const key of selectorKeys) {
    const selector = selectors[key];
    if (selector) {
      result.counts[key] = countElements(doc, selector);
    }
  }
}

/**
 * Fetches and parses HTML from a URL
 */
async function fetchAndParseHTML(
  url: string,
  fetchHTML: FetchHTMLFunction,
  parser: DOMParser
): Promise<Document> {
  const html = await fetchHTML(url);
  return parser.parseFromString(html, 'text/html');
}

/**
 * Validates the catalog page and extracts the first anime URL
 */
async function validateCatalogPage(
  catalogUrl: string,
  selectors: SelectorsToValidate,
  fetchHTML: FetchHTMLFunction,
  parser: DOMParser,
  result: SelectorValidationResult,
  logger: Logger
): Promise<Document | null> {
  try {
    const catalogDoc = await fetchAndParseHTML(catalogUrl, fetchHTML, parser);
    result.pages.catalog = catalogUrl;

    validateSelectorsOnDocument(catalogDoc, selectors, CATALOG_SELECTORS, result);

    return catalogDoc;
  } catch (error) {
    logger.error(`Failed to fetch catalog page: ${catalogUrl}`, error);
    result.errors.push(`Failed to fetch catalog page: ${catalogUrl}`);
    return null;
  }
}

/**
 * Validates the anime page and extracts the first episode URL
 */
async function validateAnimePage(
  animeUrl: string,
  selectors: SelectorsToValidate,
  fetchHTML: FetchHTMLFunction,
  parser: DOMParser,
  result: SelectorValidationResult,
  logger: Logger
): Promise<Document | null> {
  try {
    const animeDoc = await fetchAndParseHTML(animeUrl, fetchHTML, parser);
    result.pages.anime = animeUrl;

    validateSelectorsOnDocument(animeDoc, selectors, ANIME_PAGE_SELECTORS, result);

    return animeDoc;
  } catch (error) {
    logger.error(`Failed to fetch anime page: ${animeUrl}`, error);
    result.errors.push(`Failed to fetch anime page: ${animeUrl}`);
    return null;
  }
}

/**
 * Validates the episode page
 */
async function validateEpisodePage(
  episodeUrl: string,
  selectors: SelectorsToValidate,
  fetchHTML: FetchHTMLFunction,
  parser: DOMParser,
  result: SelectorValidationResult,
  logger: Logger
): Promise<void> {
  try {
    const episodeDoc = await fetchAndParseHTML(episodeUrl, fetchHTML, parser);
    result.pages.episode = episodeUrl;

    validateSelectorsOnDocument(episodeDoc, selectors, EPISODE_PAGE_SELECTORS, result);
  } catch (error) {
    logger.error(`Failed to fetch episode page: ${episodeUrl}`, error);
    result.errors.push(`Failed to fetch episode page: ${episodeUrl}`);
  }
}

export async function validateSelectors(
  catalogUrl: string,
  selectors: SelectorsToValidate,
  fetchHTML: FetchHTMLFunction
): Promise<SelectorValidationResult> {
  const logger = new Logger(validateSelectors.name);
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

  // Step 1: Validate catalog page
  const catalogDoc = await validateCatalogPage(
    catalogUrl,
    selectors,
    fetchHTML,
    parser,
    result,
    logger
  );

  if (!catalogDoc) {
    return result;
  }

  // Step 2: Extract anime URL and validate anime page
  const animeUrl = extractUrl(
    catalogDoc,
    catalogUrl,
    selectors.animeList || '',
    selectors.animeUrl || 'a'
  );

  if (!animeUrl) {
    result.errors.push('Could not find anime URL on catalog page');
    return result;
  }

  const animeDoc = await validateAnimePage(
    animeUrl,
    selectors,
    fetchHTML,
    parser,
    result,
    logger
  );

  if (!animeDoc) {
    return result;
  }

  // Step 3: Extract episode URL and validate episode page
  const episodeUrl = extractUrl(
    animeDoc,
    animeUrl,
    selectors.episodeList || '',
    selectors.episodeUrl || 'a'
  );

  if (!episodeUrl) {
    result.errors.push('Could not find episode URL on anime page');
    return result;
  }

  await validateEpisodePage(
    episodeUrl,
    selectors,
    fetchHTML,
    parser,
    result,
    logger
  );

  return result;
}
