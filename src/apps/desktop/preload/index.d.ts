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
  }
}
