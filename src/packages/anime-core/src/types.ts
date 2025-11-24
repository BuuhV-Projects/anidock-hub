// Core types for anime indexing system

export interface Driver {
  id: string;
  name: string;
  domain: string;
  version: string;
  author?: string;
  config: {
    requiresExternalLink?: boolean;
    selectors: {
      animeList?: string;
      animeTitle: string;
      animeImage?: string;
      animeSynopsis?: string;
      animeUrl: string;
      animePageTitle?: string;
      episodeList: string;
      episodeNumber: string;
      episodeTitle?: string;
      episodeUrl: string;
      videoPlayer?: string;
      externalLinkSelector?: string;
    };
    pagination?: {
      nextButton?: string;
      pageParam?: string;
    };
    baseUrl: string;
  };
  isLocal: boolean;
  createdAt: string;
  updatedAt: string;
  // Indexing fields
  indexedData?: LocalAnime[];
  sourceUrl?: string;
  totalAnimes?: number;
  lastIndexedAt?: string;
}

export interface LocalAnime {
  id: string;
  driverId: string;
  title: string;
  alternativeTitles?: string[];
  synopsis?: string;
  coverUrl?: string;
  sourceUrl: string;
  metadata?: Record<string, any>;
  episodes: LocalEpisode[];
  createdAt: string;
  updatedAt: string;
}

export interface LocalEpisode {
  id: string;
  episodeNumber: number;
  title?: string;
  sourceUrl: string;
  thumbnailUrl?: string;
  watched?: boolean;
  watchedAt?: string;
}

export interface AnimeIndex {
  id: string;
  driver_id: string;
  name: string;
  source_url: string;
  total_animes: number;
  animes: LocalAnime[];
  created_at: string;
  updated_at: string;
}

export interface CrawlResult {
  animes: LocalAnime[];
  errors: string[];
}

