import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type Plugin } from 'vite';

const viteServerConfig: Plugin = {
  name: 'add headers',
  configureServer: (server) => {
    server.middlewares.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      next();
    });
  }
};

const prefix = 'monaco-editor/esm/vs';
export default defineConfig({
  plugins: [sveltekit(), viteServerConfig],
  build: {
    commonjsOptions: {
      include: [/roguelighter-core/, /roguelighter-tailwind/, /node_modules/]
    }
    // rollupOptions: {
    //   output: {
    //     manualChunks: {
    //       tsWorker: [`${prefix}/language/typescript/ts.worker`],
    //       editorWorker: [`${prefix}/editor/editor.worker`],
    //       twWorker: [`monaco-tailwindcss/tailwindcss.worker`]
    //     }
    //   }
    // }
  }
});
