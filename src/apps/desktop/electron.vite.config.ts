import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: path.resolve(__dirname, './main/main.ts'),
        output: {
          format: 'cjs',
          entryFileNames: 'main.cjs',
          dir: path.resolve(__dirname, './dist-electron/main')
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './main')
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: path.resolve(__dirname, './preload/index.ts'),
        output: {
          format: 'cjs',
          entryFileNames: 'index.cjs',
          dir: path.resolve(__dirname, './dist-electron/preload')
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './preload')
      }
    }
  },
  renderer: {
    plugins: [react()],
    envDir: path.resolve(__dirname),
    build: {
      rollupOptions: {
        input: path.resolve(__dirname, './renderer/index.html')
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './renderer'),
        '@anidock/anime-core': path.resolve(__dirname, '../../packages/anime-core/src'),
        '@anidock/anime-drivers': path.resolve(__dirname, '../../packages/anime-drivers/src'),
        '@anidock/app-core': path.resolve(__dirname, '../../packages/app-core/src'),
        '@anidock/shared-ui': path.resolve(__dirname, '../../packages/shared-ui/src'),
        '@anidock/shared-utils': path.resolve(__dirname, '../../packages/shared-utils/src')
      }
    },
    root: path.resolve(__dirname, './renderer')
  }
});

