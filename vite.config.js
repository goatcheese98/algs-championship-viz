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
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        manualChunks(id) {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('vue')) return 'vendor-vue';
            if (id.includes('d3')) return 'vendor-d3';
            return 'vendor';
          }
          
          // CSS chunks - only for files that exist
          if (id.includes('/styles/critical.css')) return 'critical-css';
          if (id.includes('/styles/main.css')) return 'main-css';
          if (id.includes('/styles/routes/')) return 'route-css';
        }
      }
    },
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true
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