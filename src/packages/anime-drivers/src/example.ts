import { Driver } from '@anidock/anime-core';

/**
 * Example driver implementation
 * This serves as a template for creating new drivers
 */
export const exampleDriver: Driver = {
  id: 'example_driver',
  name: 'Example Anime Site',
  domain: 'example.com',
  version: '1.0.0',
  author: 'AniDock',
  config: {
    baseUrl: 'https://example.com',
    selectors: {
      animeList: '.anime-card',
      animeTitle: '.anime-title',
      animeImage: '.anime-cover img',
      animeSynopsis: '.anime-synopsis',
      animeUrl: 'a.anime-link',
      episodeList: '.episode-item',
      episodeNumber: '.ep-number',
      episodeTitle: '.ep-title',
      episodeUrl: 'a.ep-link',
      videoPlayer: 'iframe, video'
    },
    pagination: {
      nextButton: '.next-page',
      pageParam: 'page'
    }
  },
  isLocal: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

