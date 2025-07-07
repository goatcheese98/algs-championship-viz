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
    minify: 'esbuild',
    target: 'es2015',
    rollupOptions: {
      input: {
        main: './index.html',
        championship: './year_4_championship.html'
      },
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunks
          vue: ['vue'],
          charts: ['src/chart/ChartEngine.js', 'src/chart/ChartRenderer.js', 'src/chart/DataManager.js'],
          utils: ['src/utils/GSAPDraggableManager.js', 'src/chart/AnimationController.js']
        },
        // Optimize chunk loading
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  publicDir: 'public',
  base: './', // For GitHub Pages compatibility
  optimizeDeps: {
    include: ['vue', 'd3'],
    exclude: ['vue-demi']
  },
  // CSS code splitting
  css: {
    modules: {
      localsConvention: 'camelCase'
    }
  },
  // Enable source maps in development
  sourcemap: process.env.NODE_ENV === 'development',
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