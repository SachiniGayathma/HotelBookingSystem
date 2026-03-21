import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/bookings": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/api/payment": {
        target: "http://localhost:8082",
        changeOrigin: true,
      },
      "/api/hotels": {
        target: "http://localhost:8081",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/hotels": {
        target: "http://localhost:8081",
        changeOrigin: true,
      },
    },
  },
});
