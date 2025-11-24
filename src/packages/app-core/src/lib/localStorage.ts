// Local storage utilities for offline-first functionality
// This wraps the core types with browser localStorage implementation

import { Driver, LocalAnime, AnimeIndex } from '@anidock/anime-core';

// Re-export types for convenience
export type { Driver, LocalAnime, LocalEpisode, AnimeIndex } from '@anidock/anime-core';

const DRIVERS_KEY = 'anidock_drivers';
const ANIMES_KEY = 'anidock_animes';
const SETTINGS_KEY = 'anidock_settings';
const INDEXES_KEY = 'anidock_indexes';

// Drivers Management
export const getLocalDrivers = (): Driver[] => {
  try {
    const data = localStorage.getItem(DRIVERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading drivers:', error);
    return [];
  }
};

export const saveLocalDriver = (driver: Driver): void => {
  try {
    const drivers = getLocalDrivers();
    const existingIndex = drivers.findIndex(d => d.id === driver.id);
    
    if (existingIndex >= 0) {
      drivers[existingIndex] = { ...driver, updatedAt: new Date().toISOString() };
    } else {
      drivers.push({ ...driver, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    
    localStorage.setItem(DRIVERS_KEY, JSON.stringify(drivers));
  } catch (error) {
    console.error('Error saving driver:', error);
    throw error;
  }
};

export const deleteLocalDriver = (driverId: string): void => {
  try {
    const drivers = getLocalDrivers().filter(d => d.id !== driverId);
    localStorage.setItem(DRIVERS_KEY, JSON.stringify(drivers));
    
    // Also delete related animes
    const animes = getLocalAnimes().filter(a => a.driverId !== driverId);
    localStorage.setItem(ANIMES_KEY, JSON.stringify(animes));
  } catch (error) {
    console.error('Error deleting driver:', error);
    throw error;
  }
};

export const getLocalDriver = (driverId: string): Driver | null => {
  const drivers = getLocalDrivers();
  return drivers.find(d => d.id === driverId) || null;
};

// Animes Management
export const getLocalAnimes = (): LocalAnime[] => {
  try {
    const data = localStorage.getItem(ANIMES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading animes:', error);
    return [];
  }
};

export const saveLocalAnime = (anime: LocalAnime): void => {
  try {
    const animes = getLocalAnimes();
    const existingIndex = animes.findIndex(a => a.id === anime.id);
    
    if (existingIndex >= 0) {
      animes[existingIndex] = { ...anime, updatedAt: new Date().toISOString() };
    } else {
      animes.push({ ...anime, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    
    localStorage.setItem(ANIMES_KEY, JSON.stringify(animes));
  } catch (error) {
    console.error('Error saving anime:', error);
    throw error;
  }
};

export const deleteLocalAnime = (animeId: string): void => {
  try {
    const animes = getLocalAnimes().filter(a => a.id !== animeId);
    localStorage.setItem(ANIMES_KEY, JSON.stringify(animes));
  } catch (error) {
    console.error('Error deleting anime:', error);
    throw error;
  }
};

export const getLocalAnime = (animeId: string): LocalAnime | null => {
  const animes = getLocalAnimes();
  return animes.find(a => a.id === animeId) || null;
};

export const getAnimesByDriver = (driverId: string): LocalAnime[] => {
  return getLocalAnimes().filter(a => a.driverId === driverId);
};

// Episode Management
export const markEpisodeWatched = (animeId: string, episodeId: string): void => {
  try {
    const animes = getLocalAnimes();
    const anime = animes.find(a => a.id === animeId);
    
    if (anime) {
      const episode = anime.episodes.find(e => e.id === episodeId);
      if (episode) {
        episode.watched = true;
        episode.watchedAt = new Date().toISOString();
        anime.updatedAt = new Date().toISOString();
        localStorage.setItem(ANIMES_KEY, JSON.stringify(animes));
      }
    }
  } catch (error) {
    console.error('Error marking episode as watched:', error);
  }
};

// Settings Management
export const getSettings = (): Record<string, any> => {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error loading settings:', error);
    return {};
  }
};

export const saveSetting = (key: string, value: any): void => {
  try {
    const settings = getSettings();
    settings[key] = value;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving setting:', error);
  }
};

// Import/Export
export const exportDriver = (driverId: string): string => {
  const driver = getLocalDriver(driverId);
  if (!driver) throw new Error('Driver not found');
  return JSON.stringify(driver, null, 2);
};

export const importDriver = (driverJson: string): Driver => {
  try {
    const driver = JSON.parse(driverJson) as Driver;
    
    // Validate driver structure
    if (!driver.name || !driver.domain || !driver.config) {
      throw new Error('Invalid driver structure');
    }
    
    // Check if driver has indexed_data (from export format)
    const indexedData = (driver as any).indexed_data || driver.indexedData || [];
    
    // Generate new ID for the imported driver
    const newDriverId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Update driverId in all animes to match the new driver ID
    const updatedIndexedData = indexedData.map((anime: LocalAnime) => ({
      ...anime,
      driverId: newDriverId
    }));
    
    // Generate new ID if importing
    const newDriver: Driver = {
      ...driver,
      id: newDriverId,
      isLocal: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Preserve indexed data if it exists (already processed, no need to reprocess)
      indexedData: updatedIndexedData.length > 0 ? updatedIndexedData : undefined,
      sourceUrl: (driver as any).source_url || driver.sourceUrl,
      totalAnimes: (driver as any).total_animes || driver.totalAnimes || updatedIndexedData.length,
      lastIndexedAt: (driver as any).last_indexed_at || driver.lastIndexedAt
    };
    
    saveLocalDriver(newDriver);
    return newDriver;
  } catch (error) {
    console.error('Error importing driver:', error);
    throw new Error('Invalid driver file');
  }
};

// Clear all local data
export const clearAllLocalData = (): void => {
  if (confirm('Tem certeza que deseja limpar todos os dados locais? Esta ação não pode ser desfeita.')) {
    localStorage.removeItem(DRIVERS_KEY);
    localStorage.removeItem(ANIMES_KEY);
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(INDEXES_KEY);
  }
};

// ========== INDEX MANAGEMENT ==========
export const getLocalIndexes = (): AnimeIndex[] => {
  try {
    const data = localStorage.getItem(INDEXES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading indexes:', error);
    return [];
  }
};

export const saveLocalIndex = (index: AnimeIndex): void => {
  try {
    const indexes = getLocalIndexes();
    const existingIndex = indexes.findIndex(i => i.id === index.id);
    
    if (existingIndex >= 0) {
      indexes[existingIndex] = { ...index, updated_at: new Date().toISOString() };
    } else {
      indexes.push(index);
    }
    
    localStorage.setItem(INDEXES_KEY, JSON.stringify(indexes));
  } catch (error) {
    console.error('Error saving index:', error);
    throw error;
  }
};

export const deleteLocalIndex = (indexId: string): void => {
  try {
    const indexes = getLocalIndexes().filter(i => i.id !== indexId);
    localStorage.setItem(INDEXES_KEY, JSON.stringify(indexes));
  } catch (error) {
    console.error('Error deleting index:', error);
    throw error;
  }
};

export const getLocalIndexById = (indexId: string): AnimeIndex | null => {
  const indexes = getLocalIndexes();
  return indexes.find(i => i.id === indexId) || null;
};

export const importIndex = (jsonString: string): AnimeIndex => {
  try {
    const index = JSON.parse(jsonString) as AnimeIndex;
    
    // Validate index structure
    if (!index.name || !index.source_url || !index.animes) {
      throw new Error('Invalid index structure');
    }
    
    // Generate new ID if importing
    const newIndex: AnimeIndex = {
      ...index,
      id: `index_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    saveLocalIndex(newIndex);
    return newIndex;
  } catch (error) {
    console.error('Error importing index:', error);
    throw new Error('Invalid index file');
  }
};

export const exportIndex = (indexId: string): string => {
  const index = getLocalIndexById(indexId);
  if (!index) throw new Error('Index not found');
  
  const blob = new Blob([JSON.stringify(index, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${index.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_index.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  return JSON.stringify(index, null, 2);
};

export const exportIndexData = (index: AnimeIndex): void => {
  const blob = new Blob([JSON.stringify(index, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${index.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_index.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

