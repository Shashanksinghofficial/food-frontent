import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()], // React plugin for JSX, Fast Refresh
  base: "/", // Base path for assets, "/" means root
  build: {
    outDir: "dist", // Build folder name
    assetsDir: "assets", // Static assets folder inside dist
    rollupOptions: {
      input: resolve(__dirname, "index.html"), // Entry point
      output: {
        entryFileNames: "assets/index.js", // JS bundle name
        chunkFileNames: "assets/[name].js", // Split chunks
        assetFileNames: "assets/[name][extname]", // CSS, images, fonts etc.
      },
    },
  },
});
