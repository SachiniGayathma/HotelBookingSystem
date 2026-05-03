import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/bookings": {
        target: "https://booking-service-app.jollyforest-5b37db64.southeastasia.azurecontainerapps.io",
        changeOrigin: true,
      },
      "/api/payment": {
        target: "https://payment-service-app.jollyforest-5b37db64.southeastasia.azurecontainerapps.io",
        changeOrigin: true,
      },
      "/api/hotels": {
        target: "https://hotel-service-app.jollyforest-5b37db64.southeastasia.azurecontainerapps.io",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/hotels": {
        target: "https://hotel-service-app.jollyforest-5b37db64.southeastasia.azurecontainerapps.io",
        changeOrigin: true,
      },
    },
  },
});
