import { createContext } from 'react';

interface PlataformContextType {
    isDesktop: boolean;
    setIsDesktop: (isDesktop: boolean) => void;
}

export const PlataformContext = createContext<PlataformContextType>({
    isDesktop: false,
    setIsDesktop: () => {}
});