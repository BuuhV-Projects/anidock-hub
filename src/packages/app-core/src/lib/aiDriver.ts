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

// Fetch HTML from URL using backend function
async function fetchHTML(url: string): Promise<string> {
    const FETCH_HTML_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-html`;

    try {
        const response = await fetch(FETCH_HTML_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ url }),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch HTML: ${response.status}`);
        }

        const data = await response.json();
        return data.html;
    } catch (error) {
        console.error('Error fetching HTML:', error);
        throw new Error(`Failed to fetch HTML: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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

// Generate driver using AI
export async function generateDriverWithAI(
    url: string,
    config: AIConfig,
    onProgress?: (status: string) => void
): Promise<Driver> {
    onProgress?.('Fetching website HTML...');

    // Fetch HTML
    const html = await fetchHTML(url);

    onProgress?.('Analyzing HTML structure with AI...');

    // Create prompt for AI
    const prompt = `Analyze this HTML from an anime website catalog page and extract CSS selectors for scraping.

Website URL: ${url}
HTML Content (first 50000 chars):
${html.substring(0, 50000)}

Return a JSON object with these selectors:
{
  "animeList": "CSS selector for each anime item container",
  "animeTitle": "CSS selector for anime title (relative to animeList item)",
  "animeUrl": "CSS selector for anime page link (relative to animeList item)",
  "animeImage": "CSS selector for anime cover image (relative to animeList item)",
  "animeSynopsis": "CSS selector for anime description (optional, relative to animeList item)",
  "episodeList": "CSS selector for episode list items on anime page",
  "episodeNumber": "CSS selector for episode number (relative to episodeList item)",
  "episodeUrl": "CSS selector for episode page link (relative to episodeList item)",
  "episodeTitle": "CSS selector for episode title (optional, relative to episodeList item)",
  "videoPlayer": "CSS selector for video iframe or video element on episode page",
  "externalLinkSelector": "CSS selector for external video link if not embedded (optional)",
  "baseUrl": "Base URL of the website (e.g., https://example.com)",
  "requiresExternalLink": true or false (whether episodes open in external player)
}

IMPORTANT RULES:
1. Use only existing HTML classes and tags from the provided HTML
2. Prefer simple, stable selectors (avoid nth-child if possible)
3. For elements without classes, use just the tag name (e.g., "a" not "a.link" if no link class exists)
4. Test mentally if the selector would match the correct elements
5. DO NOT invent class names that don't exist in the HTML
6. Return ONLY valid JSON, no markdown formatting`;

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

    const selectors = JSON.parse(jsonStr);

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
