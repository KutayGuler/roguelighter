<script module>
  interface Props {
    project: RoguelighterProject;
    view: View;
    unfocus_from_code_editor?: Function;
    save_file: Function;
    on_content_changed?: Function;
    process_and_update?: (
      bg_entries: Array<EntryObject>,
      agents_entries: Array<EntryObject>
    ) => void;
    predefined_entries?: {
      agents: Array<EntryObject>;
      bg: Array<EntryObject>;
    };
  }
</script>

<script lang="ts">
  // BACKLOG: save folding information on code
  import { onDestroy, onMount } from 'svelte';
  import JSON5 from 'json5';

  import * as monaco from 'monaco-editor';
  // import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
  import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
  // import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
  // import twWorker from 'monaco-tailwindcss/tailwindcss.worker?worker';
  // @ts-expect-error
  import { editorBackground } from 'monaco-editor/esm/vs/platform/theme/common/colorRegistry';
  // import {
  //   configureMonacoTailwindcss,
  //   tailwindcssData,
  // } from 'monaco-tailwindcss';
  import { debounce, filters, includes_any, agent_states_obj, noop } from '../../utils';
  import {
    INTERNAL_EVENTS,
    TEMPLATE_LOGIC,
    INTERNAL_TEXTS,
    variables_regex,
    DEFAULT_GUI_TYPE
  } from '../../constants';
  import type { EntryObject, RoguelighterProject, View } from '../../types/engine';
  import ts from 'typescript';
  import { generate_boilerplate_types } from '../../generate_boilerplate_types';

  // TODO: add manually restarting the ts server

  let {
    project = $bindable(),
    view = $bindable(),
    predefined_entries,
    unfocus_from_code_editor = noop,
    save_file,
    on_content_changed = noop
  }: Props = $props();
  let editorElement: HTMLDivElement | undefined = $state();
  let editor: monaco.editor.IStandaloneCodeEditor;
  let model: monaco.editor.ITextModel;
  let agents_entries: Array<EntryObject> = predefined_entries?.agents || [];
  let bg_entries: Array<EntryObject> = predefined_entries?.bg || [];

  export function set_code(new_code: string) {
    project.code = new_code;
    editor.setValue(project.code);
  }

  export async function format_document() {
    editor.trigger('anyString', 'editor.action.formatDocument', '');
  }

  export function process_and_update(
    _bg_entries: Array<EntryObject>,
    _agents_entries: Array<EntryObject>
  ) {
    bg_entries = _bg_entries;
    agents_entries = _agents_entries;
    update_types();
  }

  function load_code(code: string) {
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
    model.setValue(code);
  }

  function infer_type(kind: string) {
    // BACKLOG: cannot infer the types of objects inside variables
    if (kind === 'FirstLiteralToken') {
      return 'number';
    } else if (kind === 'StringLiteral') {
      return 'string';
    } else if (['TrueKeyword', 'FalseKeyword'].includes(kind)) {
      return 'boolean';
    } else if (kind === 'ObjectLiteralExpression') {
      return 'object';
    }

    return 'any';
  }

  function update_types() {
    const models = monaco.editor.getModels();
    let content_id = '';

    for (let model of models) {
      const value = model.getValue();
      if (!value) continue;
      if (value.includes('type Easing =')) {
        model.setValue(generate_types(editor.getValue(), [...agents_entries, ...bg_entries]) || '');
      } else {
        content_id = model.id;
      }
    }
  }

  export function generate_types(code: string, cached_entries: Array<EntryObject> = []) {
    // TODO: infer function types cuz computed variables cannot be reassigned

    try {
      const ast = generate_ast(code);
      const prop_assignments = ast.c[0].c[0].c[2].c;
      const event_functions = prop_assignments.filter(filters.events)[0].c[1].c;
      const variable_assignments = prop_assignments.filter(filters.variables)[0].c[1].c;
      const gui_assignments = prop_assignments.filter(filters.gui)[0].c[1].c;

      let gui_keys = [];

      for (let assignment of gui_assignments) {
        gui_keys.push(assignment.text.split(':')[0]);
      }

      let gui_interface = ``;

      for (let key of gui_keys) {
        if (key == '$if') {
          gui_interface += `\t$if: { [name in keyof Variables]?: GUI_Element; };\n`;
        } else {
          gui_interface += `\t${key}: DetermineGuiChildType<'${key}'>;\n`;
        }
      }

      if (!gui_interface.length) {
        gui_interface = DEFAULT_GUI_TYPE;
      }

      let events = '';
      let variables = '';
      let agent_states = '';
      let user_functions_and_parameters = '';
      let event_types: { [key: string]: string } = {};

      for (let assignment of event_functions) {
        let identifier = assignment.c[0].text;
        let parameters = [];

        events += `| '${identifier}'`;

        if (!assignment.c[1]) continue;

        // BACKLOG: also add regular function declaration
        if (assignment.c[1].kind == 'ArrowFunction') {
          parameters = assignment.c[1].c.filter(({ kind }) => kind == 'Parameter');
        } else {
          parameters = assignment.c.filter(({ kind }) => kind == 'Parameter');
        }

        let typed_parameters = [];

        for (let p of parameters) {
          if (p.text == '_') continue;

          let optional = '';

          for (let c of p.c) {
            if (c.text == '?') optional = ' | undefined';
          }

          let type = p.c.find(({ kind }) => kind.includes('Keyword'));
          if (!type) continue;

          typed_parameters.push(type.text + optional);
        }

        let filtered_typed_parameters = typed_parameters.filter((t) => !t.includes('undefined'));
        event_types[identifier] =
          '[' +
          typed_parameters.join(', ') +
          '] | ' +
          '[' +
          filtered_typed_parameters.join(', ') +
          ']';
      }

      for (let [key, val] of Object.entries(event_types)) {
        user_functions_and_parameters += `| ["${key}", ${val}]`;
      }

      let assets = {
        agents: `'ERROR: no assets found'`,
        backgrounds: `'ERROR: no assets found'`
      };

      for (let assignment of variable_assignments) {
        if (!assignment.c[1]) continue;
        variables += `${assignment.c[0].text}: ${infer_type(assignment.c[1].kind)};\n`;
      }

      for (let [key, val] of Object.entries(agent_states_obj)) {
        agent_states += `${key}: `;
        for (let v of val) {
          agent_states += `| '${v}'`;
        }
        agent_states += ';\n';
      }

      if (cached_entries.length) {
        assets.agents = '';
        assets.backgrounds = '';

        for (let { type, name } of cached_entries) {
          assets[type] += `| '${name}'`;
        }
      }

      assets.agents = assets.agents.replaceAll('agents/', '');
      assets.backgrounds = assets.backgrounds.replaceAll('backgrounds/', '');

      const generated_type = generate_boilerplate_types({
        assets,
        events,
        variables,
        agent_states,
        user_functions_and_parameters,
        gui_interface
      });

      return generated_type;
    } catch (e) {
      console.log(e);
    }
  }

  function generate_ast(code: string) {
    const ast = ts.createSourceFile(
      'code.ts',
      code,
      {
        languageVersion: ts.ScriptTarget.Latest
      },
      true,
      ts.ScriptKind.TS
    );

    function ast_to_obj(node: ts.Node): any {
      const result: any = {
        kind: ts.SyntaxKind[node.kind],
        text: node.getText(),
        c: []
      };

      ts.forEachChild(node, (child) => {
        result.c.push(ast_to_obj(child));
      });

      return result;
    }

    return ast_to_obj(ast);
  }

  function validate(model: monaco.editor.ITextModel) {
    const ast = generate_ast(project.code);
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

      let starts_with_statements = false;

      for (let str of TEMPLATE_LOGIC) {
        starts_with_statements = content.startsWith(str);
        if (starts_with_statements) break;
      }

      if (!starts_with_statements) {
        if (content[0] == '$' && !includes_any(content, [...INTERNAL_EVENTS, ...INTERNAL_TEXTS])) {
          markers.push({
            message: '$ prefix is reserved and cannot be used for custom property names.',
            severity: monaco.MarkerSeverity.Error,
            startLineNumber: range.startLineNumber,
            startColumn: range.startColumn,
            endLineNumber: range.endLineNumber,
            endColumn: range.endColumn
          });
        }
        break;
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
            /(^|[^a-zA-Z0-9_])(\$if_\w*|\$for_\w*|if|for|switch|case|return|continue|break|try|catch|else|else\sif|do|while|finally|with|yield|of|throw)(?=$|[^a-zA-Z0-9_])/g,
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

    self.MonacoEnvironment = {
      getWorker(moduleID, label) {
        // if (label == 'tailwindcss') {
        //   return new twWorker();
        // }
        if (label == 'typescript' || label == 'editorWorkerService') {
          return new tsWorker();
        } else if (label == 'html') {
          // return new HtmlWorker()
        }

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

    monaco.editor.createModel(generate_types(project.code) || '', 'typescript');

    editor = monaco.editor.create(editorElement as HTMLDivElement, {
      automaticLayout: true,
      theme: 'vs-dark',
      tabSize: 2,
      autoIndent: 'full',
      formatOnPaste: true,
      formatOnType: true
    });

    editor.onDidChangeModelContent(
      debounce(() => {
        on_content_changed();
        update_types();
        try {
          validate(model);
        } catch (e) {
          console.log('error');
          // console.log(e);
        }
        project.code = editor.getValue();
        save_file();
      }, 200)
    );
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
      if (view != 'code') {
        e.preventDefault();
        return;
      }
      // LATER: prevent triggering OS level shortcut
      if (e.code === 'Escape' && e.shiftKey) {
        e.preventDefault();
        unfocus_from_code_editor();
      }
    });

    load_code(project.code);
    format_document();
  });

  onDestroy(() => {
    monaco?.editor.getModels().forEach((model) => model.dispose());
    editor?.dispose();
  });
</script>

<div class="h-screen" bind:this={editorElement}></div>
