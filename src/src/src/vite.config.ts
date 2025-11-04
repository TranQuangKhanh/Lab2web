/// <reference types="vite/client" />
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  esbuild: {
    jsxFactory: "createElement",
    jsxFragment: "Fragment",
    jsxInject: `import { createElement, Fragment } from "./src/jsx-runtime";`,
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    target: "esnext",
  },
});
