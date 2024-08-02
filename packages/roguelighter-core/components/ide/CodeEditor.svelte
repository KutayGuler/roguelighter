<script lang="ts">
  // TODO LATER: save folding information on code
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';
  import * as monaco from 'monaco-editor';
  // import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
  import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
  import twWorker from 'monaco-tailwindcss/tailwindcss.worker?worker';
  // @ts-expect-error
  import { editorBackground } from 'monaco-editor/esm/vs/platform/theme/common/colorRegistry';
  import { configureMonacoTailwindcss, tailwindcssData } from 'monaco-tailwindcss';
  import { filters, generate_ast, generate_types, includes_any } from '../../utils';
  import { watch } from 'tauri-plugin-fs-watch-api';
  import { join, documentDir } from '@tauri-apps/api/path';
  import { type FileEntry, readDir } from '@tauri-apps/api/fs';
  import {
    DEFAULT_DIR,
    INTERNAL_EVENTS,
    INTERNAL_GUI,
    INTERNAL_TEXTS,
    variables_regex
  } from '../../constants';
  import { current_project_name } from '../../store';
  import type { View } from '../../types';
  const dispatch = createEventDispatcher();

  export let code: string;
  export let view: View;
  let editorElement: HTMLDivElement;
  let editor: monaco.editor.IStandaloneCodeEditor;
  let model: monaco.editor.ITextModel;
  let cached_entries: Array<FileEntry> = [];
  let filePath = '';

  export function set_code(new_code: string) {
    code = new_code;
    editor.setValue(code);
  }

  async function load_code(code: string) {
    model = monaco.editor.createModel(code, 'typescript');
    monaco.editor.defineTheme('default', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        {
          token: 'globals',
          foreground: 'fda4af'
        },
        {
          token: 'vardec',
          foreground: '10b981'
        },
        {
          token: 'kwClass',
          foreground: 'c084fc'
        },
        {
          token: 'kwProps',
          foreground: 'bae6fd'
        },
        {
          token: 'identifier',
          foreground: 'bae6fd'
        },
        { token: 'constant', foreground: '2E1065' },
        { token: 'type', foreground: '38bdf8' },
        { token: 'keyword', foreground: '60a5fa' },
        { token: 'comment', foreground: '608B4E' },
        { token: 'number', foreground: 'a3e635' },
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

  function validate(model: monaco.editor.ITextModel) {
    const ast = generate_ast(code);
    const prop_assignments = ast.c[0].c[0].c[2].c;
    const variable_assignments = prop_assignments.filter(filters.variables)[0].c[1].c;
    let markers = [];
    let variable_keys = [];

    for (let assignment of variable_assignments) {
      variable_keys.push(assignment.c[0].text);
    }

    for (let i = 1; i < model.getLineCount() + 1; i++) {
      const range = {
        startLineNumber: i,
        startColumn: 1,
        endLineNumber: i,
        endColumn: model.getLineLength(i) + 1
      };
      const content = model.getValueInRange(range).trim();

      if (
        content[0] == '$' &&
        !includes_any(content, [...INTERNAL_EVENTS, ...INTERNAL_TEXTS, ...INTERNAL_GUI])
      ) {
        markers.push({
          message: '$ prefix is reserved and cannot be used for custom property names.',
          severity: monaco.MarkerSeverity.Error,
          startLineNumber: range.startLineNumber,
          startColumn: range.startColumn,
          endLineNumber: range.endLineNumber,
          endColumn: range.endColumn
        });
      }

      const variables_matches = content.match(variables_regex);

      if (variables_matches) {
        for (let match of variables_matches) {
          const startColumn = content.indexOf(match);
          const variable_name = match.replace('$var(', '').replace(')', '');

          if (!variable_keys.includes(variable_name)) {
            markers.push({
              message: `Variable "${variable_name}" does not exist.`,
              severity: monaco.MarkerSeverity.Warning,
              startLineNumber: range.startLineNumber,
              startColumn: startColumn + 2,
              endLineNumber: range.endLineNumber,
              endColumn: content.length + 2
            });
          }
        }
      }
    }
    monaco.editor.setModelMarkers(model, 'owner', markers);
  }

  async function create_custom_tokenizer() {
    let keys = [];

    for (let k of [
      'KeyA',
      'KeyB',
      'KeyC',
      'KeyD',
      'KeyE',
      'KeyF',
      'KeyG',
      'KeyH',
      'KeyI',
      'KeyJ',
      'KeyK',
      'KeyL',
      'KeyM',
      'KeyN',
      'KeyO',
      'KeyP',
      'KeyQ',
      'KeyR',
      'KeyS',
      'KeyT',
      'KeyU',
      'KeyV',
      'KeyW',
      'KeyX',
      'KeyY',
      'KeyZ',
      'F1',
      'F2',
      'F3',
      'F4',
      'F5',
      'F6',
      'F7',
      'F8',
      'F9',
      'F10',
      'F11',
      'F12',
      'DigitKeys',
      'ArrowKeys',
      'Space',
      'Enter',
      'ControlLeft',
      'ControlRight',
      'ShiftLeft',
      'ShiftRight',
      'Tab',
      'CapsLock',
      'BracketRight',
      'BracketLeft',
      'Backslash',
      'Quote',
      'Semicolon',
      'Period',
      'Comma',
      'Slash',
      'Escape'
    ]) {
      keys.push([k, 'kwProps']);
    }

    const customTokenizer = {
      tokenizer: {
        root: [{ include: 'custom' }],
        custom: [
          ['continue:', 'kwProps'],
          ['default:', 'kwProps'],
          ['type:', 'kwProps'],
          [
            /^(?:game_data|\tsettings|\tcollisions|\tagents|\tvariables|\tevents|\tkeybindings|\tgui|\t__dev_only)\b.*/gm,
            'globals'
          ],
          [/\b(let|var|const)\b/g, 'vardec'],
          [
            /\b(if|for|switch|case|return|continue|break|try|catch|else|else\sif|do|while|finally|with|yield|of|throw)\b/g,
            'kwClass'
          ],
          ...keys
        ]
      }
    };

    const allLangs = monaco.languages.getLanguages();
    // @ts-expect-error
    const { language: tsLang } = await allLangs.find(({ id }) => id === 'typescript').loader();

    for (let key in customTokenizer) {
      // @ts-expect-error
      const value = customTokenizer[key];
      if (key === 'tokenizer') {
        for (let category in value) {
          const tokenDefs = value[category];
          if (!tsLang.tokenizer.hasOwnProperty(category)) {
            tsLang.tokenizer[category] = [];
          }
          if (Array.isArray(tokenDefs)) {
            tsLang.tokenizer[category].unshift.apply(tsLang.tokenizer[category], tokenDefs);
          }
        }
      } else if (Array.isArray(value)) {
        if (!tsLang.hasOwnProperty(key)) {
          tsLang[key] = [];
        }
        tsLang[key].unshift.apply(tsLang[key], value);
      }
    }
  }

  onMount(async () => {
    create_custom_tokenizer();

    const documentDirPath = await documentDir();
    filePath = await join(documentDirPath, `${DEFAULT_DIR}/${$current_project_name}/assets`);

    self.MonacoEnvironment = {
      getWorker(moduleID, label) {
        // if (label == 'tailwindcss') {
        //   return new twWorker();
        // }

        return new tsWorker();
        // console.log(moduleID, label);
        // switch (label) {
        //   case 'typescript':
        //     console.log('typescript');
        //     return new tsWorker();
        //   case 'tailwindcss':
        //     console.log('tailwindcss');
        //     return new twWorker();
        //   default:
        //     return new editorWorker();
        // }
      }
    };

    monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
    // monaco.languages.css.cssDefaults.setOptions({
    //   data: {
    //     dataProviders: {
    //       tailwindcssData
    //     }
    //   }
    // });

    // configureMonacoTailwindcss(monaco);

    // compiler options
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.Latest,
      allowNonTsExtensions: true
    });

    monaco.editor.createModel(generate_types(code), 'typescript');

    editor = monaco.editor.create(editorElement, {
      automaticLayout: true,
      theme: 'vs-dark',
      tabSize: 2
    });

    editor.onDidChangeModelContent(() => {
      update_types();
      validate(model);
      code = editor.getValue();
    });
    editor.onKeyUp((e) => {
      if (view == 'game') {
        e.preventDefault();
        return;
      }
      if (e.keyCode === monaco.KeyCode.Quote) {
        editor.trigger('', 'editor.action.triggerSuggest', '');
      }
    });
    editor.onKeyDown((e) => {
      if (view == 'game') {
        e.preventDefault();
        return;
      }
      if (e.code === 'Escape') {
        dispatch('unfocus');
      }
    });

    await load_code(code);
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
        model.setValue(generate_types(editor.getValue(), cached_entries));
      } else {
        content_id = model.id;
      }
    }
  }
</script>

<div class="h-full" bind:this={editorElement} />
