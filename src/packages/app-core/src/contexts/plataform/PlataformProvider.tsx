import React from 'react';
import { ReactNode, useState } from 'react';
import { PlataformContext } from './plataform-context';

export const PlataformProvider = ({ children }: { children: ReactNode }) => {
    const [isDesktop, setIsDesktop] = useState(false);

    return (
        <PlataformContext.Provider value={{ isDesktop, setIsDesktop }}>
            {children}
        </PlataformContext.Provider>
    );
}