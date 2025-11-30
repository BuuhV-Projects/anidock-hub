// AI-powered driver generation using user's API key (OpenAI or Gemini)
import { Driver } from './indexedDB';

export type AIProvider = 'openai' | 'gemini';

export interface AIConfig {
    provider: AIProvider;
    apiKey: string;
    model?: string;
}

interface OpenAIResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
}

interface GeminiResponse {
    candidates: Array<{
        content: {
            parts: Array<{
                text: string;
            }>;
        };
    }>;
}

// Fetch HTML helper with multiple CORS proxy fallbacks
async function fetchHTML(url: string): Promise<string> {
    const proxies = [
        'https://corsproxy.io/?',
        'https://api.allorigins.win/raw?url=',
        'https://cors-anywhere.herokuapp.com/',
    ];

    for (let i = 0; i < proxies.length; i++) {
        try {
            const proxyUrl = proxies[i] + encodeURIComponent(url);
            const response = await fetch(proxyUrl);

            if (!response.ok) {
                if (i === proxies.length - 1) {
                    throw new Error(`Failed to fetch: ${response.status}`);
                }
                continue;
            }

            return await response.text();
        } catch (error) {
            if (i === proxies.length - 1) {
                throw new Error(`Failed to fetch HTML: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
    }

    throw new Error('All CORS proxies failed');
}

// Call OpenAI API
async function callOpenAI(config: AIConfig, prompt: string): Promise<string> {
    const model = config.model || 'gpt-4o-mini';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert at analyzing HTML and extracting CSS selectors for web scraping anime websites.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.3,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'OpenAI API request failed');
    }

    const data: OpenAIResponse = await response.json();
    return data.choices[0].message.content;
}

// Call Gemini API
async function callGemini(config: AIConfig, prompt: string): Promise<string> {
    const model = config.model || 'gemini-2.0-flash-exp';

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: prompt,
                            },
                        ],
                    },
                ],
                generationConfig: {
                    temperature: 0.3,
                },
            }),
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Gemini API request failed');
    }

    const data: GeminiResponse = await response.json();
    return data.candidates[0].content.parts[0].text;
}

export type FetchHTMLFunction = (url: string) => Promise<string>;

// Generate driver using AI
export async function generateDriverWithAI(
    url: string,
    config: AIConfig,
    onProgress?: (status: string) => void,
    customFetchHTML?: FetchHTMLFunction
): Promise<Driver> {
    onProgress?.('Fetching website HTML...');

    // Fetch HTML using custom function (Puppeteer) or fallback to CORS proxies
    const fetchFn = customFetchHTML || fetchHTML;
    const html = await fetchFn(url);

    onProgress?.('Analyzing HTML structure with AI...');

    // Create prompt for AI with more detailed instructions
    const prompt = `Analyze this HTML from an anime website catalog page and extract CSS selectors for scraping.

Website URL: ${url}
HTML Content (first 50000 chars):
${html.substring(0, 50000)}

CRITICAL INSTRUCTIONS:
1. Look for repeating elements that represent individual anime entries
2. The "animeList" selector must return MULTIPLE elements (one for each anime)
3. Test selectors mentally: querySelectorAll(animeList) should return 5-50+ elements
4. Use only classes/IDs that ACTUALLY exist in the HTML above
5. Prefer class selectors over tag names when possible
6. All other selectors (animeTitle, animeUrl, etc.) are RELATIVE to each animeList item

COMMON PATTERNS TO LOOK FOR:
- Anime cards/items often have classes like: .card, .item, .anime, .post, .entry, .grid-item
- Links usually have href attributes
- Images often have src or data-src attributes
- Titles are usually in h2, h3, h4, or span/div with specific classes

Return a JSON object with these selectors:
{
  "animeList": "CSS selector that returns MULTIPLE anime containers (e.g., '.anime-card')",
  "animeTitle": "CSS selector for title RELATIVE to animeList item (e.g., 'h3', '.title')",
  "animeUrl": "CSS selector for link RELATIVE to animeList item (e.g., 'a', '.link')",
  "animeImage": "CSS selector for image RELATIVE to animeList item (e.g., 'img', '.cover img')",
  "animeSynopsis": "CSS selector for synopsis RELATIVE to animeList (optional, e.g., '.description')",
  "episodeList": "CSS selector for episode items on anime detail page",
  "episodeNumber": "CSS selector for episode number RELATIVE to episodeList",
  "episodeUrl": "CSS selector for episode link RELATIVE to episodeList",
  "episodeTitle": "CSS selector for episode title RELATIVE to episodeList (optional)",
  "videoPlayer": "CSS selector for video player (e.g., 'iframe', 'video')",
  "externalLinkSelector": "CSS selector for external video link (optional)",
  "baseUrl": "Base URL of the website (e.g., https://example.com)",
  "requiresExternalLink": true or false (whether episodes open in external player)
}

VALIDATION:
- animeList must match multiple elements (5+ expected)
- If you see 10 anime cards, animeList should match all 10
- Test each selector mentally against the HTML

Return ONLY valid JSON, no markdown code blocks, no explanations.`;

    // Call AI provider
    const aiCall = config.provider === 'openai' ? callOpenAI : callGemini;
    const response = await aiCall(config, prompt);

    onProgress?.('Processing AI response...');

    // Parse AI response
    let jsonStr = response.trim();

    // Remove markdown code blocks if present
    if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```\n?/g, '');
    }

    console.log('🤖 AI Response:', jsonStr);
    
    const selectors = JSON.parse(jsonStr);
    
    // Log the generated selectors for debugging
    console.log('🎯 Generated selectors:', selectors);

    // Extract domain from URL
    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    // Create driver
    const driver: Driver = {
        id: crypto.randomUUID(),
        name: `Driver for ${domain}`,
        domain,
        version: '1.0.0',
        author: 'AI Generated',
        config: {
            requiresExternalLink: selectors.requiresExternalLink || false,
            selectors: {
                animeList: selectors.animeList,
                animeTitle: selectors.animeTitle,
                animeImage: selectors.animeImage,
                animeSynopsis: selectors.animeSynopsis,
                animeUrl: selectors.animeUrl,
                episodeList: selectors.episodeList,
                episodeNumber: selectors.episodeNumber,
                episodeTitle: selectors.episodeTitle,
                episodeUrl: selectors.episodeUrl,
                videoPlayer: selectors.videoPlayer,
                externalLinkSelector: selectors.externalLinkSelector,
            },
            baseUrl: selectors.baseUrl || `${urlObj.protocol}//${urlObj.hostname}`,
        },
        catalogUrl: url,
        sourceUrl: url,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    onProgress?.('Driver generated successfully!');
    return driver;
}

// Validate API key
export async function validateAPIKey(config: AIConfig): Promise<boolean> {
    try {
        const testPrompt = 'Say "OK" if you receive this message.';

        if (config.provider === 'openai') {
            await callOpenAI(config, testPrompt);
        } else {
            await callGemini(config, testPrompt);
        }

        return true;
    } catch (error) {
        console.error('API key validation failed:', error);
        return false;
    }
}
