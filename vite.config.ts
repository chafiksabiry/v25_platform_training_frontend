import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import qiankun from 'vite-plugin-qiankun';
import * as cheerio from 'cheerio';

// Plugin to remove React Refresh preamble
const removeReactRefreshScript = () => {
  return {
    name: 'remove-react-refresh',
    transformIndexHtml(html: any) {
      const $ = cheerio.load(html);
      $('script[src="/@react-refresh"]').remove();
      return $.html();
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
      removeReactRefreshScript(),
    ],

    define: {
      'import.meta.env': env,
    },
    server: {
      port: 5190,
      hmr: false,
      fs: {
        strict: true,
      },
    },
    build: {
      target: 'esnext',
      outDir: 'dist',
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          format: 'es',
          name: 'training',
          entryFileNames: 'index.js',
          chunkFileNames: 'chunk-[name].js',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith('.css')) {
              return 'index.css';
            }
            return '[name].[ext]';
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
