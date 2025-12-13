import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [solidPlugin(), tsconfigPaths(), tailwindcss()],
  server: {
    port: 3000,
    open: false,
  },
  build: {
    target: "esnext",
  },
});
