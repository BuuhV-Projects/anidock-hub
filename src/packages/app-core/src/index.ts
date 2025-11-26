// Export pages
export { default as Auth } from './pages/Auth';
export { default as Dashboard } from './pages/Dashboard';
export { default as Browse } from './pages/Browse';
export { default as AnimeDetails } from './pages/AnimeDetails';
export { default as Player } from './pages/Player';
export { default as History } from './pages/History';
export { default as ImportDriver } from './pages/ImportDriver';
export { default as CreateDriver } from './pages/CreateDriver';
export { default as EditDriver } from './pages/EditDriver';
export { default as MyDrivers } from './pages/MyDrivers';
export { default as IndexManual } from './pages/IndexManual';
export { default as EditIndexedAnime } from './pages/EditIndexedAnime';
export { default as VerifyOtp } from './pages/VerifyOtp';
export { default as ResetPassword } from './pages/ResetPassword';
export { default as UpdatePassword } from './pages/UpdatePassword';
export { default as NotFound } from './pages/NotFound';
export { default as TermsOfService } from './pages/TermsOfService';
export { default as PrivacyPolicy } from './pages/PrivacyPolicy';
export { default as LGPD } from './pages/LGPD';
export { default as Copyright } from './pages/Copyright';
export { default as Index } from './pages/Index';
export { default as PremiumFeatures } from './pages/PremiumFeatures';
export { default as ManageSubscription } from './pages/ManageSubscription';
export { UpdateNotification } from './components/UpdateNotification';

// Export router
export { default as RouterAppCore } from './router/RouterAppCore';

// Export contexts
export { AuthProvider } from './contexts/auth/AuthProvider';
export { useAuth } from './contexts/auth/useAuth';
export { PlataformProvider } from './contexts/plataform/PlataformProvider';
export { usePlataform } from './contexts/plataform/usePlataform';

// Export lib functions
export * from './lib/crawler';
export * from './lib/localStorage';

