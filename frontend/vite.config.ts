import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

const API_TARGET = "http://localhost:5000";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const useMsw = env.VITE_USE_MSW === "true";

  return {
    plugins: [react(), tsconfigPaths(), tailwindcss()],
    build: {
      sourcemap: false,
    },
    optimizeDeps: {
      entries: ["index.html"],
      esbuildOptions: {
        resolveExtensions: [".js", ".mjs", ".cjs"],
      },
    },
    server: {
      proxy: useMsw
        ? undefined
        : {
            "/api": { target: API_TARGET, changeOrigin: true, secure: false },
            "/hubs": { target: API_TARGET, changeOrigin: true, secure: false, ws: true },
          },
    },
  };
});
