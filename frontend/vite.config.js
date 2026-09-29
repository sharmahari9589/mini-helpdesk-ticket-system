import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiProxyTarget = process.env.API_PROXY_TARGET || "https://mini-helpdesk-ticket-system-1.onrender.com" || "http://localhost:4000";

export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/api": apiProxyTarget } },
});
