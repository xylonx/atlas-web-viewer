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
        "D:/study/Eindhoven Master Program/2024-q3/Visual Computing Project",
      ],
    },
  },
});
