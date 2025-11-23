import { Toaster } from "@anidock/shared-ui";
import { Toaster as Sonner } from "@anidock/shared-ui";
import { TooltipProvider } from "@anidock/shared-ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Browse from "./pages/Browse";
import AnimeDetails from "./pages/AnimeDetails";
import Player from "./pages/Player";
import ImportDriver from "./pages/ImportDriver";
import CreateDriver from "./pages/CreateDriver";
import EditDriver from "./pages/EditDriver";
import MyDrivers from "./pages/MyDrivers";
import IndexManual from "./pages/IndexManual";
import EditIndexedAnime from "./pages/EditIndexedAnime";
import VerifyOtp from "./pages/VerifyOtp";
import ResetPassword from "./pages/ResetPassword";
import UpdatePassword from "./pages/UpdatePassword";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "@anidock/shared-ui";
import { useAuth } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, loading } = useAuth();
  
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/browse" element={<Browse />} />
      <Route path="/anime" element={<AnimeDetails />} />
      <Route path="/player" element={<Player />} />
      <Route path="/drivers/import" element={<ImportDriver />} />
      <Route path="/drivers/create" element={
        <ProtectedRoute user={user} loading={loading}>
          <CreateDriver />
        </ProtectedRoute>
      } />
      <Route path="/drivers/:driverId/edit" element={
        <ProtectedRoute user={user} loading={loading}>
          <EditDriver />
        </ProtectedRoute>
      } />
      <Route path="/drivers" element={
        <ProtectedRoute user={user} loading={loading}>
          <MyDrivers />
        </ProtectedRoute>
      } />
      <Route path="/drivers/:driverId/index-manual" element={
        <ProtectedRoute user={user} loading={loading}>
          <IndexManual />
        </ProtectedRoute>
      } />
      <Route path="/drivers/:driverId/edit-anime" element={
        <ProtectedRoute user={user} loading={loading}>
          <EditIndexedAnime />
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute user={user} loading={loading}>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/update-password" element={<UpdatePassword />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

