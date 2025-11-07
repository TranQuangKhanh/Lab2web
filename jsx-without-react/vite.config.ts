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
  },
});
