/// <reference types="vite/client" />
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  base: "./", // Quan trọng để deploy không lỗi đường dẫn
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
    sourcemap: false,
    target: "esnext",
  },
});
