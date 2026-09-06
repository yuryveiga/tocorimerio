import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/supabase/vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({

  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    }
  },
  plugins: [react(), mcpPlugin(), mode === "development" && componentTagger()].filter(Boolean),
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          // Split heavy libs out of the React core vendor bundle so they can load
          // in parallel and be evicted from the critical path when not needed.
          if (id.includes('lucide-react')) return 'icons';
          // Rich-text editor (admin only) — keep in its own named chunk so it can
          // never be merged into a chunk reachable from the first paint.
          if (id.includes('react-quill') || id.includes('/quill') || id.includes('parchment') || id.includes('quill-delta')) return 'editor';
          if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-')) return 'charts';
          if (id.includes('@supabase/')) return 'supabase';

          // Radix primitives — split per package so the first paint only pays for
          // the primitives that page actually uses (tooltip/toast) instead of the
          // whole Dialog/Select/Popover/Dropdown bundle. Shared internal helpers
          // stay together to keep initialization order safe.
          if (id.includes('@radix-ui/')) {
            const m = id.match(/@radix-ui\/([^/]+)/);
            const pkg = m ? m[1] : 'shared';
            // Internal primitives shared by nearly every component.
            if (/^(react-primitive|react-compose-refs|react-context|react-slot|react-use-|react-presence|react-portal|primitive|react-id|react-dismissable-layer|react-focus-|react-collection|number|rect)/.test(pkg)) {
              return 'radix-core';
            }
            return `radix-${pkg.replace(/^react-/, '')}`;
          }


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
