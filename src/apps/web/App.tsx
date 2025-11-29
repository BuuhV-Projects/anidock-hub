import {
    PlataformProvider,
    RouterAppCore,
    UpdateNotification
} from "@anidock/app-core";
import { Toaster, TooltipProvider } from "@anidock/shared-ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { I18nextProvider } from 'react-i18next';
import i18n from '../../packages/app-core/src/i18n/config';

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
            <TooltipProvider>
                <Toaster />
                <UpdateNotification />
                <PlataformProvider>
                    <BrowserRouter>
                        <RouterAppCore />
                    </BrowserRouter>
                </PlataformProvider>
            </TooltipProvider>
        </I18nextProvider>
    </QueryClientProvider>
);

export default App;

