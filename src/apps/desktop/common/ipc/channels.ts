export const IPC_CHANNELS = {
  window: {
    close: 'window:close'
  },
  app: {
    version: 'app:version'
  },
  crawler: {
    fetchHTML: 'crawler:fetchHTML',
    extractData: 'crawler:extractData',
    extractVideoUrl: 'crawler:extractVideoUrl'
  },
  deepLink: {
    importDriver: 'deep-link:import-driver'
  }
} as const;

export type WindowChannel = (typeof IPC_CHANNELS.window)[keyof typeof IPC_CHANNELS.window];
export type AppChannel = (typeof IPC_CHANNELS.app)[keyof typeof IPC_CHANNELS.app];
export type CrawlerChannel = (typeof IPC_CHANNELS.crawler)[keyof typeof IPC_CHANNELS.crawler];
export type DeepLinkChannel = (typeof IPC_CHANNELS.deepLink)[keyof typeof IPC_CHANNELS.deepLink];

