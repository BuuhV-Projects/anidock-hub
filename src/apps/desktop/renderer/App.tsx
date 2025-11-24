import {
    AuthProvider,
    PlataformProvider,
    RouterAppCore,
    usePlataform
} from "@anidock/app-core";
import { Toaster, TooltipProvider } from "@anidock/shared-ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";

const queryClient = new QueryClient();

function AppContent() {
    const { setIsDesktop } = usePlataform();
    useEffect(() => {
        if (typeof setIsDesktop === 'function') setIsDesktop(true);
    }, [setIsDesktop]);
    return (
        <BrowserRouter>
            <AuthProvider>
                <RouterAppCore />
            </AuthProvider>
        </BrowserRouter>
    );
}

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <Toaster />
            <PlataformProvider>
                <AppContent />
            </PlataformProvider>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;

