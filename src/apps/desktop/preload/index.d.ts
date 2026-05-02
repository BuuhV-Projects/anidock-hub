import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      closeWindow: () => void
      getAppVersion: () => Promise<string>
    }
    crawler: {
      fetchHTML: (url: string) => Promise<string>
      extractData: (url: string, selectors: any) => Promise<any[]>
      extractVideoUrl: (url: string, selectors: any) => Promise<{
        videoUrl: string | null
        videoType: 'iframe' | 'video' | 'external'
      }>
    }
    aiKeys: {
      save: (provider: 'openai' | 'gemini', plaintextKey: string) => Promise<void>
      get: (provider: 'openai' | 'gemini') => Promise<string | null>
      delete: (provider: 'openai' | 'gemini') => Promise<void>
    }
  }
}
