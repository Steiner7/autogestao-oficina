import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Em desenvolvimento, /api é encaminhado para o back-end (evita CORS).
    proxy: {
      "/api": "http://localhost:3333"
    }
  }
});
