import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import qiankun from 'vite-plugin-qiankun';

// Plugin to remove React Refresh preamble
const removeReactRefreshScript = () => {
  return {
    name: 'remove-react-refresh',
    transformIndexHtml(html: string) {
      // Simple string replacement to avoid cheerio dependency issues
      return html.replace(/<script[^>]*src="\/@react-refresh"[^>]*><\/script>/gi, '');
    },
  };
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: 'https://training.harx.ai/',
    plugins: [
      react({
        jsxRuntime: 'classic',
      }),
      qiankun('training', {
        useDevMode: true,
      }),
      removeReactRefreshScript(), // Add the script removal plugin
    ],
    define: {
      'import.meta.env': env,
    },
    server: {
      port: 5190,
      cors: true,
      hmr: false,
      fs: {
        strict: true, // Ensure static assets are correctly resolved
      },
      proxy: {
        '/api': {
          target: 'https://api-training.harx.ai',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      target: 'esnext',
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          format: 'umd',
          name: 'training',
          entryFileNames: 'index.js', // Fixed name for the JS entry file
          chunkFileNames: 'chunk-[name].js', // Fixed name for chunks
          assetFileNames: (assetInfo) => {
            // Ensure CSS files are consistently named
            if (assetInfo.name?.endsWith('.css')) {
              return 'index.css';
            }
            return '[name].[ext]'; // Default for other asset types
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});
