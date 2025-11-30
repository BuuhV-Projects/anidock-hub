import { createContext } from 'react';

interface CrawlerMethods {
    fetchHTML: (url: string) => Promise<string>;
    extractData: (url: string, selectors: any) => Promise<any[]>;
    extractVideoUrl: (url: string, selectors: any) => Promise<{ videoUrl: string | null; videoType: 'iframe' | 'video' | 'external' }>;
}

interface PlataformContextType {
    isDesktop: boolean;
    setIsDesktop: (isDesktop: boolean) => void;
    appVersion: string | null;
    setAppVersion: (version: string | null) => void;
    crawler?: CrawlerMethods;
}

export const PlataformContext = createContext<PlataformContextType>({
    isDesktop: false,
    setIsDesktop: () => {},
    appVersion: null,
    setAppVersion: () => {},
    crawler: undefined
});