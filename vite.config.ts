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
          // Radix UI components — large, rarely changes
          if (id.includes('@radix-ui')) return 'radix';
          // Recharts — heavy charting library
          if (id.includes('recharts') || id.includes('d3-')) return 'charts';
          // Framer Motion — animation library
          if (id.includes('framer-motion')) return 'motion';
          // Embla Carousel
          if (id.includes('embla-carousel')) return 'carousel';
          // React core — always cache separately
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'react';
          // Supabase client
          if (id.includes('@supabase')) return 'supabase';
          // TanStack Query
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
