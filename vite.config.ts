import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api/products": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/api/orders": {
        target: "http://localhost:8081",
        changeOrigin: true,
      },
    },
  },
});
