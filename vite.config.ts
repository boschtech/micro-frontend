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
        target: "https://product-service-ua20.onrender.com",
        changeOrigin: true,
      },
      "/actuator/health/products": {
        target: "https://product-service-ua20.onrender.com",
        changeOrigin: true,
        rewrite: (path) => path.replace("/actuator/health/products", "/actuator/health"),
      },
      "/api/orders": {
        target: "https://order-service-7342.onrender.com",
        changeOrigin: true,
      },
      "/actuator/health/orders": {
        target: "https://order-service-7342.onrender.com",
        changeOrigin: true,
        rewrite: (path) => path.replace("/actuator/health/orders", "/actuator/health"),
      },
    },
  },
});
