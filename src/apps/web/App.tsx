import {
    PlataformProvider,
    RouterAppCore,
    UpdateNotification
} from "@anidock/app-core";
import { Toaster, TooltipProvider } from "@anidock/shared-ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <Toaster />
            <UpdateNotification />
            <PlataformProvider>
                <BrowserRouter>
                    <RouterAppCore />
                </BrowserRouter>
            </PlataformProvider>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;

