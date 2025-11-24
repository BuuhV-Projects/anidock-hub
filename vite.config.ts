import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Bridge configuration pointing to desktop app
export default defineConfig(({ mode }) => ({
  root: path.resolve(__dirname, "src/apps/desktop"),
  publicDir: path.resolve(__dirname, "src/apps/desktop/public"),
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src/apps/desktop"),
      "@anidock/anime-core": path.resolve(__dirname, "src/packages/anime-core/src"),
      "@anidock/anime-drivers": path.resolve(__dirname, "src/packages/anime-drivers/src"),
      "@anidock/shared-ui": path.resolve(__dirname, "src/packages/shared-ui/src"),
      "@anidock/shared-utils": path.resolve(__dirname, "src/packages/shared-utils/src"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
}));
