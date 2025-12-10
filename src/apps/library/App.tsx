import {
    RouterAppCore,
} from "@anidock/library-core";
import { Toaster, TooltipProvider } from "@anidock/shared-ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <Toaster />
            <BrowserRouter>
                <RouterAppCore />
            </BrowserRouter>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;

