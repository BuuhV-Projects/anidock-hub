export const IPC_CHANNELS = {
  window: {
    close: 'window:close'
  }
} as const;

export type WindowChannel = (typeof IPC_CHANNELS.window)[keyof typeof IPC_CHANNELS.window];


