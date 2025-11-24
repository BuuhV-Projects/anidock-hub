import {
  AnimeDetails,
  Auth,
  AuthProvider,
  Browse,
  CreateDriver,
  Dashboard,
  EditDriver,
  EditIndexedAnime,
  ImportDriver,
  IndexManual,
  MyDrivers,
  NotFound,
  Player,
  ResetPassword,
  UpdatePassword,
  useAuth,
  VerifyOtp
} from "@anidock/app-core";
import { ProtectedRoute, Toaster, TooltipProvider } from "@anidock/shared-ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, loading } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={<Browse />} />
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
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

