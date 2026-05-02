// Export pages
export { default as Dashboard } from './pages/Dashboard';
export { default as Browse } from './pages/Browse';
export { default as AnimeDetails } from './pages/AnimeDetails';
export { default as History } from './pages/History';
export { default as ImportDriver } from './pages/ImportDriver';
export { default as CreateDriver } from './pages/CreateDriver';
export { default as EditDriver } from './pages/EditDriver';
export { default as MyDrivers } from './pages/MyDrivers';
export { default as IndexManual } from './pages/IndexManual';
export { default as EditIndexedAnime } from './pages/EditIndexedAnime';
export { default as Backup } from './pages/Backup';
export { default as Settings } from './pages/Settings';
export { default as AddAnime } from './pages/AddAnime';
export { default as Library } from './pages/Library';
export { default as Stats } from './pages/Stats';
export { default as NotFound } from './pages/NotFound';
export { default as TermsOfService } from './pages/TermsOfService';
export { default as PrivacyPolicy } from './pages/PrivacyPolicy';
export { default as LGPD } from './pages/LGPD';
export { default as Copyright } from './pages/Copyright';
export { default as Index } from './pages/Index';
export { UpdateNotification } from './components/UpdateNotification';
export { LanguageSelector } from './components/LanguageSelector';

// Export router
export { default as RouterAppCore } from './router/RouterAppCore';

// Export i18n instance (configured at module load)
export { default as i18n } from './i18n/config';

// Export contexts
export { PlataformProvider } from './contexts/plataform/PlataformProvider';
export { usePlataform } from './contexts/plataform/usePlataform';

// Export lib functions
export * from './lib/localStorage';
export {
  buildLibraryEntryId,
  db,
  LIBRARY_STATUSES,
} from './lib/indexedDB';
export type {
  AnimeIndex,
  Driver,
  LibraryEntry,
  LibraryStatus,
  LocalAnime,
  LocalEpisode,
  WatchHistoryEntry,
} from './lib/indexedDB';
export { crawlWithDriver, crawlEpisodes, extractVideoUrl, fetchHTML } from './lib/clientCrawler';
export type { CrawlResult, CrawlProgress } from './lib/clientCrawler';
export { generateDriverWithAI, validateAPIKey } from './lib/aiDriver';
export type { AIProvider, AIConfig } from './lib/aiDriver';
export {
  addLibraryTag,
  collectAllTags,
  getOrCreateLibraryEntry,
  LIBRARY_STATUS_LABELS_PT,
  removeFromLibrary,
  removeLibraryTag,
  setLibraryNotes,
  setLibraryScore,
  setLibraryStatus,
} from './lib/library';
export { computeWatchStatistics } from './lib/stats';
export type {
  ActivityBucket,
  AnimeWatchCount,
  DriverWatchCount,
  LibraryStatusCount,
  WatchStatistics,
} from './lib/stats';

