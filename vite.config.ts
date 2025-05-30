import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(async ({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Use API_URL from environment variables or fall back to localhost
  const apiUrl = env.VITE_API_URL
  //  || 'https://go-pet-care-production-6a6c.up.railway.app';
  console.log(`Using API URL: ${apiUrl} in ${mode} mode`);

  // Use PUSH_NOTI from environment variables or fall back to API URL
  const pushNotiUrl = env.PUSH_NOTI;
  console.log(`Using Push Notification URL: ${pushNotiUrl} in ${mode} mode`);

  return {
    plugins: [
      react(),
      runtimeErrorOverlay(),
      themePlugin(),
      ...(process.env.NODE_ENV !== "production" &&
      process.env.REPL_ID !== undefined
        ? [
            await import("@replit/vite-plugin-cartographer").then((m) =>
              m.cartographer(),
            ),
          ]
        : []),
    ],
    server: {
      proxy: {
        '/api': {
          target: apiUrl,
          changeOrigin: true
        }
      },
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*'
      }
    },
    define: {
      // Make environment variables available to client code
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
      'import.meta.env.PUSH_NOTI': JSON.stringify(pushNotiUrl),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client", "src"),
        "@shared": path.resolve(__dirname, "shared"),
      },
    },
    root: path.resolve(__dirname, "client"),
    build: {
      outDir: path.resolve(__dirname, "dist"),
      emptyOutDir: true,
    },
  };
});
