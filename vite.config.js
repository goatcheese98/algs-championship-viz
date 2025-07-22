import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue({
      // Enable script setup sugar for better performance
      script: {
        defineModel: true,
        propsDestructure: true
      },
      template: {
        compilerOptions: {
          // Optimize for production
          hoistStatic: true,
          cacheHandlers: true
        }
      }
    })
  ],
  root: '.',
  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: true
    }
  },
  css: {
    devSourcemap: true,
    postcss: './postcss.config.js'
  },
  build: {
    outDir: 'dist',
    cssCodeSplit: true,
    cssMinify: 'esbuild',
    sourcemap: process.env.NODE_ENV === 'development',
    rollupOptions: {
      input: {
        main: './index.html'
      },
      output: {
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || []
          const ext = info[info.length - 1]
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext || '')) {
            return `assets/images/[name]-[hash][extname]`
          }
          if (/css/i.test(ext || '')) {
            return `assets/styles/[name]-[hash][extname]`
          }
          return `assets/[name]-[hash][extname]`
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        manualChunks(id) {
          // Vendor chunks with better splitting
          if (id.includes('node_modules')) {
            // Vue ecosystem
            if (id.includes('vue') || id.includes('pinia')) {
              return 'vendor-vue'
            }
            
            // Chart libraries
            if (id.includes('d3') || id.includes('chart')) {
              return 'vendor-charts'
            }
            
            // Utility libraries
            if (id.includes('lodash') || id.includes('date-fns') || id.includes('uuid')) {
              return 'vendor-utils'
            }
            
            // UI libraries
            if (id.includes('gsap') || id.includes('anime') || id.includes('framer-motion')) {
              return 'vendor-ui'
            }
            
            return 'vendor-core'
          }
          
          // Feature-based chunks
          if (id.includes('/features/tournament/')) {
            return 'features-tournament'
          }
          
          if (id.includes('/features/charts/')) {
            return 'features-charts'
          }
          
          if (id.includes('/features/controls/')) {
            return 'features-controls'
          }
          
          // Component chunks
          if (id.includes('/components/ui/')) {
            return 'components-ui'
          }
          
          if (id.includes('/components/layout/')) {
            return 'components-layout'
          }
          
          // Store chunks
          if (id.includes('/stores/')) {
            return 'app-stores'
          }
          
          // API chunks
          if (id.includes('/api/')) {
            return 'app-api'
          }
          
          // Composables
          if (id.includes('/composables/')) {
            return 'app-composables'
          }
        }
      }
    },
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
        pure_funcs: process.env.NODE_ENV === 'production' 
          ? ['console.log', 'console.debug', 'console.info'] 
          : []
      },
      mangle: {
        safari10: true
      }
    },
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '~': resolve(__dirname, '.'),
      '@components': resolve(__dirname, 'src/components'),
      '@stores': resolve(__dirname, 'src/stores'),
      '@types': resolve(__dirname, 'src/types'),
      '@api': resolve(__dirname, 'src/api'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@composables': resolve(__dirname, 'src/composables'),
      '@assets': resolve(__dirname, 'src/assets')
    }
  },
  optimizeDeps: {
    include: [
      'vue', 
      'vue-router',
      'pinia',
      '@vueuse/core'
    ],
    exclude: [
      // Exclude large dependencies for dynamic import
      'd3',
      'gsap'
    ]
  },
  define: {
    __VUE_OPTIONS_API__: false, // Disable Options API for smaller bundle
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
  },
  // Performance optimization
  esbuild: {
    target: 'esnext',
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  },
  // Preview configuration
  preview: {
    port: 4173,
    strictPort: true,
    host: true
  }
}) 