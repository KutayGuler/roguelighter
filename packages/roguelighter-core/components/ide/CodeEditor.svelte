<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';
  import * as monaco from 'monaco-editor';
  import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
  import { types_string } from '../../types_string';
  const dispatch = createEventDispatcher();

  export let code: string;
  let editorElement: HTMLDivElement;
  let editor: monaco.editor.IStandaloneCodeEditor;
  let model: monaco.editor.ITextModel;

  export function set_code(new_code: string) {
    code = new_code;
    editor.setValue(code);
  }

  function loadCode(code: string) {
    model = monaco.editor.createModel(code, 'typescript');
    editor.setModel(model);
  }

  onMount(async () => {
    self.MonacoEnvironment = {
      getWorker: () => new tsWorker()
    };

    monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);

    // compiler options
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.Latest,
      allowNonTsExtensions: true
    });

    monaco.editor.createModel(types_string, 'typescript');

    editor = monaco.editor.create(editorElement, {
      automaticLayout: true,
      theme: 'vs-dark',
      tabSize: 2
    });

    editor.onDidChangeModelContent(() => {
      code = editor.getValue();
      dispatch('change');
    });
    editor.onKeyUp((e) => {
      if (e.keyCode === monaco.KeyCode.Quote) {
        editor.trigger('', 'editor.action.triggerSuggest', '');
      }
    });

    loadCode(code);
  });

  onDestroy(() => {
    monaco?.editor.getModels().forEach((model) => model.dispose());
    editor?.dispose();
  });
</script>

<div class="h-full" bind:this={editorElement} />
