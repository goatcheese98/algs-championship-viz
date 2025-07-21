import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  root: '.',
  server: {
    port: 3000,
    open: true
  },
  css: {
    devSourcemap: true,
    postcss: process.env.NODE_ENV === 'production' 
      ? './postcss.config.advanced.js'
      : './postcss.config.js'
  },
  build: {
    outDir: 'dist',
    cssCodeSplit: true,
    cssMinify: true,
    rollupOptions: {
      input: {
        main: './index.html'
      },
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        manualChunks(id) {
          // Only create chunks for files that actually exist
          if (id.includes('/styles/critical.css')) return 'critical';
          if (id.includes('/styles/non-critical.css')) return 'non-critical';
          if (id.includes('/styles/optimized.css')) return 'optimized';
          
          // Group route-based CSS
          if (id.includes('/styles/routes/')) return 'route-css';
          
          // Group utility CSS
          if (id.includes('/styles/') && !id.includes('/styles/main.css')) return 'css-utils';
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  optimizeDeps: {
    include: ['vue', 'd3']
  },
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false
  }
}) 