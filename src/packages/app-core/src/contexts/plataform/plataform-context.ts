import { createContext } from 'react';

interface PlataformContextType {
    isDesktop: boolean;
    setIsDesktop: (isDesktop: boolean) => void;
    appVersion: string | null;
    setAppVersion: (version: string | null) => void;
}

export const PlataformContext = createContext<PlataformContextType>({
    isDesktop: false,
    setIsDesktop: () => {},
    appVersion: null,
    setAppVersion: () => {}
});