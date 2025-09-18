import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isProduction = mode === 'production';
    
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.NODE_ENV': JSON.stringify(mode),
        'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
        'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY)
      },
      envPrefix: 'VITE_',
      base: '/',
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      // Configurações de otimização de cache e performance
      server: {
        hmr: {
          overlay: true, // Mostra erros na tela
          clientPort: 3000,
          port: 24679 // Porta separada para HMR
        },
        fs: {
          strict: false
        },
        port: 3000,
        host: true,
        // Configurações de watch para hot reload mais eficiente
        watch: {
          usePolling: true,
          interval: 100,
          ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**']
        }
      },
      preview: {
        port: 4173,
        host: true
      },
      build: {
        outDir: 'dist',
        sourcemap: !isProduction,
        minify: isProduction ? 'esbuild' : false,
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom'],
              router: ['react-router-dom'],
              supabase: ['@supabase/supabase-js'],
              charts: ['recharts']
            },
            assetFileNames: 'assets/[name]-[hash][extname]',
            chunkFileNames: 'assets/[name]-[hash].js',
            entryFileNames: 'assets/[name]-[hash].js'
          }
        },
        chunkSizeWarningLimit: 1000,
        assetsInlineLimit: 4096
      },
      optimizeDeps: {
        include: [
          'react',
          'react-dom',
          'react-router-dom',
          '@supabase/supabase-js',
          'recharts'
        ]
      }
    };
});
