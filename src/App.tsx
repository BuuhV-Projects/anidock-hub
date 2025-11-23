import { Toaster } from "@/packages/shared-ui/components/ui/toaster";
import { Toaster as Sonner } from "@/packages/shared-ui/components/ui/sonner";
import { TooltipProvider } from "@/packages/shared-ui/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/apps/desktop/contexts/AuthContext";
import Index from "./apps/web/pages/Index";
import Auth from "./apps/desktop/pages/Auth";
import Dashboard from "./apps/desktop/pages/Dashboard";
import Browse from "./apps/desktop/pages/Browse";
import AnimeDetails from "./apps/desktop/pages/AnimeDetails";
import Player from "./apps/desktop/pages/Player";
import ImportDriver from "./apps/desktop/pages/ImportDriver";
import CreateDriver from "./apps/desktop/pages/CreateDriver";
import EditDriver from "./apps/desktop/pages/EditDriver";
import MyDrivers from "./apps/desktop/pages/MyDrivers";
import IndexManual from "./apps/desktop/pages/IndexManual";
import EditIndexedAnime from "./apps/desktop/pages/EditIndexedAnime";
import VerifyOtp from "./apps/desktop/pages/VerifyOtp";
import ResetPassword from "./apps/desktop/pages/ResetPassword";
import UpdatePassword from "./apps/desktop/pages/UpdatePassword";
import TermsOfService from "./apps/web/pages/TermsOfService";
import PrivacyPolicy from "./apps/web/pages/PrivacyPolicy";
import LGPD from "./apps/web/pages/LGPD";
import Copyright from "./apps/web/pages/Copyright";
import NotFound from "./apps/desktop/pages/NotFound";
import { ProtectedRoute } from "./apps/desktop/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/anime" element={<AnimeDetails />} />
            <Route path="/player" element={<Player />} />
            <Route path="/drivers/import" element={<ImportDriver />} />
            <Route path="/drivers/create" element={
              <ProtectedRoute>
                <CreateDriver />
              </ProtectedRoute>
            } />
            <Route path="/drivers/:driverId/edit" element={
              <ProtectedRoute>
                <EditDriver />
              </ProtectedRoute>
            } />
            <Route path="/drivers" element={
              <ProtectedRoute>
                <MyDrivers />
              </ProtectedRoute>
            } />
            <Route path="/drivers/:driverId/index-manual" element={
              <ProtectedRoute>
                <IndexManual />
              </ProtectedRoute>
            } />
            <Route path="/drivers/:driverId/edit-anime" element={
              <ProtectedRoute>
                <EditIndexedAnime />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/termos" element={<TermsOfService />} />
            <Route path="/privacidade" element={<PrivacyPolicy />} />
            <Route path="/lgpd" element={<LGPD />} />
            <Route path="/direitos-autorais" element={<Copyright />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
