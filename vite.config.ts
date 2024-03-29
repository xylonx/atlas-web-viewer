import react from "@vitejs/plugin-react";
import { defineConfig, searchForWorkspaceRoot } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./",
  server: {
    fs: {
      allow: [
        searchForWorkspaceRoot(process.cwd()),
        "/Users/xylonx/Documents/TUe/2IMV10",
      ],
    },
  },
});