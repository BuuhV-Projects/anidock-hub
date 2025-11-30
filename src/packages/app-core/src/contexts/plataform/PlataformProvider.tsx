import React from 'react';
import { ReactNode, useState } from 'react';
import { PlataformContext } from './plataform-context';

declare global {
    interface Window {
        crawler?: {
            fetchHTML: (url: string) => Promise<string>;
            extractData: (url: string, selectors: any) => Promise<any[]>;
            extractVideoUrl: (url: string, selectors: any) => Promise<{ videoUrl: string | null; videoType: 'iframe' | 'video' | 'external' }>;
        };
    }
}

export const PlataformProvider = ({ children }: { children: ReactNode }) => {
    const [isDesktop, setIsDesktop] = useState(false);
    const [appVersion, setAppVersion] = useState<string | null>(null);

    const crawlerMethods = isDesktop && window.crawler ? {
        fetchHTML: window.crawler.fetchHTML,
        extractData: window.crawler.extractData,
        extractVideoUrl: window.crawler.extractVideoUrl
    } : undefined;

    return (
        <PlataformContext.Provider value={{ 
            isDesktop, 
            setIsDesktop, 
            appVersion, 
            setAppVersion,
            crawler: crawlerMethods
        }}>
            {children}
        </PlataformContext.Provider>
    );
}