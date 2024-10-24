<script lang="ts">
  import { onMount } from 'svelte';
  import * as monaco from 'monaco-editor';
  import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker.js?worker';
  import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
  import twWorker from 'monaco-tailwindcss/tailwindcss.worker?worker';
  // @ts-expect-error
  import { editorBackground } from 'monaco-editor/esm/vs/platform/theme/common/colorRegistry';
  import { configureMonacoTailwindcss, tailwindcssData } from 'monaco-tailwindcss';
  import { page } from '$app/stores';

  // BACKLOG: reproduce the error in an isolated environment, ask remcohaszing for help

  window.MonacoEnvironment = {
    getWorker(moduleId, label) {
      console.log(label);

      switch (label) {
        // case 'html':
        //   return new htmlWorker();
        case 'editorWorkerService':
          return new editorWorker();
        case 'tailwindcss':
          return new twWorker();
        default:
          throw new Error(`Unknown label ${label}`);
      }
    }
  };

  configureMonacoTailwindcss(monaco, {});

  onMount(() => {
    monaco.editor.create(document.getElementById('editor'), {
      automaticLayout: true,
      language: 'html',
      value: `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
    </head>
    <body>
      <div class="w-6 w-6 h-6 text-gray-600 bg-[#ff8888] hover:text-sky-600 ring-gray-900/5"></div>
    </body>
  </html>
  `
    });
  });
</script>

<div id="editor" class="h-full"></div>
