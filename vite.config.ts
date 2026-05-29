import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({

  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          // Split heavy libs out of the React core vendor bundle so they can load
          // in parallel and be evicted from the critical path when not needed.
          if (id.includes('lucide-react')) return 'icons';
          if (id.includes('@supabase/')) return 'supabase';

          // React ecosystem, data layers, and Radix primitives — ship together to guarantee
          // initialization order (avoids "X is not a function" / createContext crashes
          // that happen when Radix/Tanstack/other libs load before React is ready).
          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/react-router') ||
            id.includes('/react-helmet-async/') ||
            id.includes('/scheduler/') ||
            id.includes('@tanstack/') ||
            id.includes('@radix-ui/') ||
            id.includes('class-variance-authority') ||
            id.includes('clsx') ||
            id.includes('tailwind-merge')
          ) return 'vendor';

          // Heavy libs only loaded by specific pages — keep out of home bundle.
          if (id.includes('framer-motion')) return 'motion';
          if (id.includes('react-day-picker') || id.includes('date-fns')) return 'dates';
          if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('/zod/')) return 'forms';
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "react-helmet-async": path.resolve(__dirname, "./src/lib/helmet-shim.tsx"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
