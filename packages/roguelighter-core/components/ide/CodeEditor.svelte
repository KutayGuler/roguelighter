<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';
  import * as monaco from 'monaco-editor';
  import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
  import { editorBackground } from 'monaco-editor/esm/vs/platform/theme/common/colorRegistry';
  import { create_types } from '../../utils';
  const dispatch = createEventDispatcher();

  import { watch } from 'tauri-plugin-fs-watch-api';
  import { join, documentDir } from '@tauri-apps/api/path';
  import { type FileEntry, readDir } from '@tauri-apps/api/fs';
  import { DEFAULT_DIR } from '../../constants';
  import { current_project_name } from '../../store';

  export let code: string;
  let editorElement: HTMLDivElement;
  let editor: monaco.editor.IStandaloneCodeEditor;
  let model: monaco.editor.ITextModel;
  let cached_entries: Array<FileEntry> = [];
  let filePath = '';

  export function set_code(new_code: string) {
    code = new_code;
    editor.setValue(code);
  }

  async function loadCode(code: string) {
    model = monaco.editor.createModel(code, 'typescript');
    monaco.editor.tokenize('yarrak', model.getLanguageId());

    // monaco.languages.setMonarchTokensProvider(model.getLanguageId(), )
    // monaco.languages.setTokensProvider()
    // monaco.languages.setLanguageConfiguration()
    // monaco.languages.set

    monaco.editor.defineTheme('default', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        {
          token: 'identifier',
          foreground: 'D1FAE5'
        },
        { token: 'constant', foreground: '2E1065' },
        { token: 'type', foreground: 'a78bfa' },
        { token: 'keyword', foreground: '34d399' },
        { token: 'variable', foreground: '1AEBFF' },
        { token: 'variable.parameter', foreground: '9CDCFE' },
        { token: 'comment', foreground: '608B4E' },
        { token: 'number', foreground: '7dd3fc' },
        { token: 'string', foreground: 'fde68a' }
      ],
      colors: {
        [editorBackground]: '#18181b'
      }
    });
    monaco.editor.setTheme('default');

    editor.setModel(model);

    const entries = await readDir(filePath, { recursive: true });
    cached_entries = entries;
    model.setValue(code);
    update_types();

    await watch(
      filePath,
      async () => {
        const entries = await readDir(filePath, { recursive: true });
        cached_entries = entries;
        update_types();
      },
      { recursive: true }
    );
  }

  onMount(async () => {
    const documentDirPath = await documentDir();
    filePath = await join(documentDirPath, `${DEFAULT_DIR}/${$current_project_name}/assets`);

    self.MonacoEnvironment = {
      getWorker: () => new tsWorker()
    };

    monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);

    // compiler options
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.Latest,
      allowNonTsExtensions: true
    });

    monaco.editor.createModel(create_types(code), 'typescript');

    editor = monaco.editor.create(editorElement, {
      automaticLayout: true,
      theme: 'vs-dark',
      tabSize: 2
    });

    let initialized = false;

    editor.onDidChangeModelContent(() => {
      code = editor.getValue();
      if (!initialized) {
        initialized = true;
        return;
      }

      dispatch('change');
    });
    editor.onKeyUp((e) => {
      if (e.keyCode === monaco.KeyCode.Quote) {
        editor.trigger('', 'editor.action.triggerSuggest', '');
      }
    });

    await loadCode(code);
  });

  onDestroy(() => {
    monaco?.editor.getModels().forEach((model) => model.dispose());
    editor?.dispose();
  });

  function update_types() {
    const models = monaco.editor.getModels();
    let content_id = '';

    for (let model of models) {
      const value = model.getValue();
      if (!value) continue;
      if (value.includes('type Easing =')) {
        model.setValue(create_types(editor.getValue(), cached_entries));
      } else {
        content_id = model.id;
      }
    }
  }
</script>

<div class="h-full" bind:this={editorElement} />
