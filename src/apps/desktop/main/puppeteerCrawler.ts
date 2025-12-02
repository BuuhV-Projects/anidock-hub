import puppeteer, { Browser } from 'puppeteer';

let browser: Browser | null = null;

// Helper function to replace deprecated waitForTimeout
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Initialize browser instance
async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080'
      ]
    });
  }
  return browser;
}

// Close browser on app exit
export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

// Fetch HTML from URL using Puppeteer
export async function fetchHTML(url: string): Promise<string> {
  const browserInstance = await getBrowser();
  const page = await browserInstance.newPage();
  
  try {
    // Set realistic browser properties
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Set extra headers to look more like a real browser
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    });
    
    // Block redirects to google.com or other unwanted domains
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const requestUrl = request.url();
      
      // Block redirects to Google and other common redirect targets
      if (requestUrl.includes('google.com') || 
          requestUrl.includes('captcha') ||
          requestUrl.includes('recaptcha')) {
        request.abort();
      } else {
        request.continue();
      }
    });
    
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    // Wait a bit for any JS to execute
    await delay(5000);
    
    const html = await page.content();
    return html;
  } catch (error) {
    throw new Error(`Failed to fetch HTML: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    await page.close();
  }
}

// Extract data from page using selectors
export async function extractData(
  url: string,
  selectors: {
    listSelector: string;
    itemSelectors: {
      title?: string;
      url?: string;
      image?: string;
      synopsis?: string;
      episodeNumber?: string;
      episodeTitle?: string;
    };
  }
): Promise<any[]> {
  const browserInstance = await getBrowser();
  const page = await browserInstance.newPage();
  
  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    });
    
    // Block redirects
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const requestUrl = request.url();
      if (requestUrl.includes('google.com') || requestUrl.includes('captcha')) {
        request.abort();
      } else {
        request.continue();
      }
    });
    
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    await delay(5000);
    
    // Extract data using selectors
    const data = await page.evaluate((config) => {
      const items = document.querySelectorAll(config.listSelector);
      const results: any[] = [];
      
      items.forEach((item) => {
        const extracted: any = {};
        
        if (config.itemSelectors.title) {
          const titleEl = item.querySelector(config.itemSelectors.title);
          extracted.title = titleEl?.textContent?.trim() || titleEl?.getAttribute('title')?.trim();
        }
        
        if (config.itemSelectors.url) {
          const urlEl = item.querySelector(config.itemSelectors.url) as HTMLAnchorElement;
          extracted.url = urlEl?.href || urlEl?.getAttribute('href');
        }
        
        if (config.itemSelectors.image) {
          const imgEl = item.querySelector(config.itemSelectors.image) as HTMLImageElement;
          extracted.image = imgEl?.src || imgEl?.getAttribute('data-src') || imgEl?.getAttribute('data-lazy-src');
        }
        
        if (config.itemSelectors.synopsis) {
          const synopsisEl = item.querySelector(config.itemSelectors.synopsis);
          extracted.synopsis = synopsisEl?.textContent?.trim();
        }
        
        if (config.itemSelectors.episodeNumber) {
          const numberEl = item.querySelector(config.itemSelectors.episodeNumber);
          const numberText = numberEl?.textContent?.trim() || '';
          extracted.episodeNumber = parseInt(numberText.replace(/\D/g, ''));
        }
        
        if (config.itemSelectors.episodeTitle) {
          const titleEl = item.querySelector(config.itemSelectors.episodeTitle);
          extracted.episodeTitle = titleEl?.textContent?.trim();
        }
        
        results.push(extracted);
      });
      
      return results;
    }, selectors);
    
    return data;
  } catch (error) {
    throw new Error(`Failed to extract data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    await page.close();
  }
}

// Extract video URL from episode page
export async function extractVideoUrl(
  url: string,
  selectors: {
    videoPlayer?: string;
    externalLinkSelector?: string;
  }
): Promise<{ videoUrl: string | null; videoType: 'iframe' | 'video' | 'external' }> {
  const browserInstance = await getBrowser();
  const page = await browserInstance.newPage();
  
  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    });
    
    // Block redirects
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const requestUrl = request.url();
      if (requestUrl.includes('google.com') || requestUrl.includes('captcha')) {
        request.abort();
      } else {
        request.continue();
      }
    });
    
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    await delay(5000);
    
    const result = await page.evaluate((config) => {
      // Strategy 1: Look for iframe with video player
      if (config.videoPlayer) {
        const iframe = document.querySelector(config.videoPlayer) as HTMLIFrameElement;
        if (iframe?.src) {
          return { videoUrl: iframe.src, videoType: 'iframe' as const };
        }
      }
      
      // Strategy 2: Look for video tag
      const video = document.querySelector('video source, video') as HTMLVideoElement | HTMLSourceElement;
      if (video?.src) {
        return { videoUrl: video.src, videoType: 'video' as const };
      }
      
      // Strategy 3: Look for external link
      if (config.externalLinkSelector) {
        const link = document.querySelector(config.externalLinkSelector) as HTMLAnchorElement;
        if (link?.href) {
          return { videoUrl: link.href, videoType: 'external' as const };
        }
      }
      
      // Strategy 4: Default iframe search
      const anyIframe = document.querySelector('iframe[src*="player"], iframe[src*="embed"], iframe[src*="video"]') as HTMLIFrameElement;
      if (anyIframe?.src) {
        return { videoUrl: anyIframe.src, videoType: 'iframe' as const };
      }
      
      return { videoUrl: null, videoType: 'external' as const };
    }, selectors);
    
    return result;
  } catch (error) {
    console.error('Failed to extract video URL:', error);
    return { videoUrl: null, videoType: 'external' };
  } finally {
    await page.close();
  }
}
