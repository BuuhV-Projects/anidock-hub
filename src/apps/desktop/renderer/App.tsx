import {
    AuthProvider,
    PlataformProvider,
    RouterAppCore,
    UpdateNotification,
    usePlataform
} from "@anidock/app-core";
import { Toaster, TooltipProvider } from "@anidock/shared-ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { HashRouter } from "react-router-dom";

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
            <AuthProvider>
                <RouterAppCore />
            </AuthProvider>
        </HashRouter>
    );
}

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <Toaster />
            <UpdateNotification />
            <PlataformProvider>
                <AppContent />
            </PlataformProvider>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;

