import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    proxy: {
      "/api/": {
        target: "http://localhost:8082/",
        changeOrigin: true,
      },
      "/s/": {
        target: "http://localhost:8082/",
        changeOrigin: true,
      },
    },
  },
});
