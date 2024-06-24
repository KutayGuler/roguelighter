<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';
  import * as monaco from 'monaco-editor';
  import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
  import { create_types, debounce, json_to_code_string, template_json_code } from '../../utils';
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

    monaco.editor.createModel(create_types(template_json_code), 'typescript');

    editor = monaco.editor.create(editorElement, {
      automaticLayout: true,
      theme: 'vs-dark',
      tabSize: 2
    });

    editor.onDidChangeModelContent(
      debounce(() => {
        code = editor.getValue();
        update_types();
        dispatch('change');
        console.log('change');
      }, 200)
    );
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

  function update_types() {
    // TODO: assets types (could be a store)
    const models = monaco.editor.getModels();
    let content_id = '';

    for (let model of models) {
      const value = model.getValue();
      if (!value) continue;
      if (value.includes('type Easing =')) {
        model.setValue(create_types(editor.getValue()));
      } else {
        content_id = model.id;
      }
    }

    // model?.setValue(model.getValue());
    // editor.focus();
    console.log('focus');
  }
</script>

<div class="h-full" bind:this={editorElement} />
