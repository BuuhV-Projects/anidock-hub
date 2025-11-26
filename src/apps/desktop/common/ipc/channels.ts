export const IPC_CHANNELS = {
  window: {
    close: 'window:close'
  },
  app: {
    version: 'app:version'
  }
} as const;

export type WindowChannel = (typeof IPC_CHANNELS.window)[keyof typeof IPC_CHANNELS.window];
export type AppChannel = (typeof IPC_CHANNELS.app)[keyof typeof IPC_CHANNELS.app];


