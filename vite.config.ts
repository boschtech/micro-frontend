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
        target: "https://product-service-ua20.onrender.com/",
        changeOrigin: true,
      },
      "/api/orders": {
        target: "https://order-service-7342.onrender.com/",
        changeOrigin: true,
      },
    },
  },
});
