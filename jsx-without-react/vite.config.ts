/// <reference types="vite/client" />
import { defineConfig } from "vite";

export default defineConfig({
  esbuild: {
    jsxFactory: "createElement",
    jsxFragment: "Fragment",
    jsx: "transform",
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    minify: 'esbuild',
    target: 'esnext'
  },
  base: "./",
  server: {
    port: 5173,
    open: true,
  },
});
