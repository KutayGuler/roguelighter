import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { viteSingleFile } from 'vite-plugin-singlefile';
// import { createHtmlPlugin } from 'vite-plugin-html';

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), viteSingleFile({ removeViteModuleLoader: true })],
  build: {
    cssCodeSplit: false,
    assetsInlineLimit: 100000000
    // ""
    // rollupOptions: {
    //   output: {
    //     manualChunks: () => 'everything.js'
    //   }
    // }
  }
});