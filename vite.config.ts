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
          // Keep React + its ecosystem together to avoid TDZ initialization errors.
          // Splitting react into its own chunk causes "Cannot access X before initialization"
          // when other chunks reference React context before the react chunk executes.
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router') ||
            id.includes('node_modules/scheduler/')
          ) return 'react-vendor';

          // Heavy UI libraries — safe to split because they don't init React context
          if (id.includes('@radix-ui')) return 'radix';
          if (id.includes('framer-motion')) return 'motion';
          if (id.includes('embla-carousel')) return 'carousel';
          if (id.includes('recharts') || id.includes('d3-')) return 'charts';

          // Data layer — no React dependency issues
          if (id.includes('@supabase')) return 'supabase';
          if (id.includes('@tanstack')) return 'query';
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
