import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repoBasePath = "/ManpowerManagement/";
const base = process.env.VITE_BASE_PATH
  ? process.env.VITE_BASE_PATH
  : process.env.GITHUB_ACTIONS
    ? repoBasePath
    : "/";

export default defineConfig({
  plugins: [react()],
  base,
  server: {
    port: 5173,
  },
});
