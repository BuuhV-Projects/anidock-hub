import React from 'react';
import { ReactNode, useState } from 'react';
import { PlataformContext } from './plataform-context';

export const PlataformProvider = ({ children }: { children: ReactNode }) => {
    const [isDesktop, setIsDesktop] = useState(false);
    const [appVersion, setAppVersion] = useState<string | null>(null);

    return (
        <PlataformContext.Provider value={{ isDesktop, setIsDesktop, appVersion, setAppVersion }}>
            {children}
        </PlataformContext.Provider>
    );
}