import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  root: '.', // Set root to current directory
  server: {
    port: 3000,
    open: true,
    cors: true,
    host: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: './index.html',
        championship: './year_4_championship.html'
      }
    }
  },
  publicDir: 'public',
  base: './', // For GitHub Pages compatibility
  optimizeDeps: {
    include: ['vue', 'd3']
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // Use full Vue build with template compiler
      'vue': 'vue/dist/vue.esm-bundler.js'
    }
  },
  define: {
    // Configure Vue feature flags
    __VUE_OPTIONS_API__: 'true',
    __VUE_PROD_DEVTOOLS__: 'false',
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
  }
}) 