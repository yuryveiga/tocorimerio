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

          // React + routing + helmet — needed on every page, ship together.
          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/react-router') ||
            id.includes('/react-helmet-async/') ||
            id.includes('/scheduler/')
          ) return 'react-vendor';

          // Data layer — used everywhere.
          if (id.includes('@tanstack/') || id.includes('@supabase/')) return 'data';

          // Heavy libs only loaded by specific pages — keep out of home bundle.
          if (id.includes('recharts') || id.includes('d3-')) return 'charts';
          if (id.includes('react-quill') || id.includes('quill')) return 'editor';
          if (id.includes('dompurify')) return 'editor';
          if (id.includes('framer-motion')) return 'motion';
          if (id.includes('embla-carousel')) return 'carousel';
          if (id.includes('canvas-confetti')) return 'confetti';
          if (id.includes('react-day-picker') || id.includes('date-fns')) return 'dates';
          if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('/zod/')) return 'forms';
          if (id.includes('lucide-react')) return 'icons';

          // Radix split: core primitives used on the home vs. the rest used by admin/forms.
          if (id.includes('@radix-ui/')) {
            if (
              id.includes('react-tooltip') ||
              id.includes('react-dialog') ||
              id.includes('react-dropdown-menu') ||
              id.includes('react-toast') ||
              id.includes('react-slot') ||
              id.includes('react-label') ||
              id.includes('react-popover')
            ) return 'radix-core';
            return 'radix-extra';
          }

          return 'vendor';
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
