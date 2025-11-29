import {
    PlataformProvider,
    RouterAppCore,
    UpdateNotification,
    usePlataform
} from "@anidock/app-core";
import { Toaster, TooltipProvider } from "@anidock/shared-ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { HashRouter } from "react-router-dom";
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../packages/app-core/src/i18n/config';

const queryClient = new QueryClient();

function AppContent() {
    const { setIsDesktop, setAppVersion } = usePlataform();
    useEffect(() => {
        if (typeof setIsDesktop === 'function') setIsDesktop(true);
        
        // Get app version from Electron
        if (window.api?.getAppVersion) {
            window.api.getAppVersion().then((version) => {
                if (typeof setAppVersion === 'function') setAppVersion(version);
            }).catch(console.error);
        }
    }, [setIsDesktop, setAppVersion]);
    return (
        <HashRouter>
            <RouterAppCore />
        </HashRouter>
    );
}

const App = () => (
    <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
            <TooltipProvider>
                <Toaster />
                <UpdateNotification />
                <PlataformProvider>
                    <AppContent />
                </PlataformProvider>
            </TooltipProvider>
        </I18nextProvider>
    </QueryClientProvider>
);

export default App;

