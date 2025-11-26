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
    const { setIsDesktop } = usePlataform();
    useEffect(() => {
        if (typeof setIsDesktop === 'function') setIsDesktop(true);
    }, [setIsDesktop]);
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

