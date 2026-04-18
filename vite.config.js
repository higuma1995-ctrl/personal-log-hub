import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/personal-log-hub/",
  plugins: [react()],
});
