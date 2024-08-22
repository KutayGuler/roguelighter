import RunCSS from 'runcss';
import JSON5 from 'json5';
import ts from 'typescript';
import { DEFAULT_DIR, function_regex } from './constants';
import { join, documentDir } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { FileEntry, readDir } from '@tauri-apps/api/fs';
import { generate_boilerplate_types } from './generate_boilerplate_types';
import { GameData, Agents, GUI } from './types/game';
import { parse_errors } from './store';

export const { processClasses } = RunCSS();
export const noop = () => {};
export function generate_id() {
  return (Math.random() + 1).toString(36).substring(7);
}

export function includes_any(str: string, array_of_str: Array<string>) {
  return array_of_str.some((substring) => str.includes(substring));
}

export function pos_to_xy(pos: number, scene_width: number) {
  return [pos % scene_width, -Math.floor(pos / scene_width)];
}

export function debounce(fn: Function, ms: number) {
  let timeout: NodeJS.Timeout;
  return function () {
    clearTimeout(timeout);
    // @ts-expect-error
    timeout = setTimeout(() => fn.apply(this, arguments), ms);
  };
}

export function generate_ast(code: string) {
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

export function code_string_to_json(code: string): string | GameData {
  const transpiled = ts.transpile(code, { removeComments: true, strict: false });

  function find_game_data_declaration(code: string) {
    const regex = new RegExp(`\\b(game_data)\\b\\s*=\\s*([\\[{])`, 'g');
    let game_data_declaration;
    let match;

    while ((match = regex.exec(code)) !== null) {
      const start = match.index + match[0].length - 1;
      const startChar = match[2];
      const endChar = startChar === '{' ? '}' : ']';
      let depth = 1;
      let end = start;

      while (depth > 0 && end < code.length) {
        end++;
        if (code[end] === startChar) depth++;
        else if (code[end] === endChar) depth--;
      }

      if (depth === 0) {
        game_data_declaration = `${match[1]}: ${code.substring(start, end + 1).trim()},\n`;
      }
    }

    return game_data_declaration;
  }

  let game_data_declaration = find_game_data_declaration(transpiled);

  // turn function declarations into strings
  game_data_declaration = game_data_declaration?.replace(function_regex, (match) => {
    let modified = match.replaceAll('\n', ' ').replaceAll('"', '\\"');
    return `"${modified}"`;
  });

  let t = game_data_declaration as string;

  try {
    t = t.replace(/([\w$]+): /g, '"$1": ');
    t = t.replaceAll("'", '"');
    t = t.replace('},\n\n', '}');
    t = `{
      ${t}
    }`;

    // BACKLOG: cannot parse undefined & null
    return JSON5.parse(t).game_data;
  } catch (e) {
    console.log(t, e);
    parse_errors.set({
      json: t,
      // @ts-expect-error
      error: e.toString()
    });
    return code;
  }
}

export function json_to_code_string(json: GameData) {
  let str = ``;

  for (let [key, val] of Object.entries(json)) {
    str += `${key} = ${JSON.stringify(val, null, '\t')};\n\n`;
  }

  return str.replace(/"([^"]+)":/g, '$1:');
}

export async function get_asset_urls(project_dir: string, agents: Agents<string>) {
  let bg_asset_urls = new Map<string, string>();
  let agent_asset_urls = new Map<string, any>();

  const documentDirPath = await documentDir();

  const bg_file_path = await join(
    documentDirPath,
    `${DEFAULT_DIR}/${project_dir}/assets/backgrounds`
  );
  const bg_entries = await readDir(bg_file_path, { recursive: true });

  let bg_children = [];

  for (let entry of bg_entries) {
    bg_children.push(...get_children_assets(entry));
  }

  for (let [key, path] of bg_children) {
    let source = convertFileSrc(path);
    bg_asset_urls.set(key, source);
  }

  for (let [key, obj] of Object.entries(agents)) {
    let url_obj = {};

    for (let [_key, val] of Object.entries(obj.states)) {
      const filePath = await join(
        documentDirPath,
        `${DEFAULT_DIR}/${project_dir}/assets/agents/${val.source}`
      );
      // @ts-expect-error
      url_obj[_key] = convertFileSrc(filePath);
    }

    agent_asset_urls.set(key, url_obj);
  }

  return {
    backgrounds: bg_asset_urls,
    agents: agent_asset_urls
  };
}

export const template_json_code: GameData = {
  settings: {
    fps: 8,
    easing: 'sineOut',
    duration: 400,
    camera: {
      zoom: 20
    }
  },
  collisions: ['floor_2'],
  agents: {
    player: {
      states: {
        default: {
          source: 'elf_idle.png',
          frame_count: 4
        },
        walk: {
          source: 'elf_run.png',
          frame_count: 4
        }
      }
    },
    orc: {
      states: {
        default: {
          source: 'orc.png'
        }
      }
    }
  },
  variables: {
    variable_name: 3
  },
  events: {},
  keybindings: {
    Escape: '$toggle_pause_menu'
  },
  gui: {
    $pause_menu: {
      tokens: [
        'absolute',
        'bottom-0',
        'w-full',
        'h-full',
        'bg-black/50',
        'flex',
        'flex-col',
        'items-center',
        'gap-2',
        'pt-8'
      ],
      transition: { type: 'fade' },
      children: {
        continue: {
          type: 'button',
          tokens: [
            'bg-amber-200',
            'font-bold',
            'p-4',
            'hover:bg-purple-200',
            'text-amber-600',
            'w-1/2',
            'rounded'
          ],
          on_click: '$close_pause_menu',
          text: 'Continue' // add variable {v.var_name}
        },
        exit: {
          type: 'button',
          tokens: [
            'bg-amber-200',
            'font-bold',
            'p-4',
            'hover:bg-purple-200',
            'text-amber-600',
            'w-1/2',
            'rounded'
          ],
          on_click: '$exit',
          text: 'Exit' // add variable {v.var_name}
        }
      }
    }
  }
};

export function generate_template_data() {
  return JSON.stringify({
    id: crypto.randomUUID(),
    code: json_to_code_string(template_json_code),
    scenes: new Map()
  });
}

export function get_tailwind_classes(gui: GUI) {
  let set = new Set();

  for (let child of Object.values(gui)) {
    for (let token of child.tokens) {
      set.add(token);
    }

    if (child.children) {
      let returned_set = get_tailwind_classes(child.children);
      for (let val of returned_set.values()) {
        set.add(val);
      }
    }
  }

  return set;
}

function get_children_assets(entry: FileEntry, parent_name = ''): Array<Array<string>> {
  let children = [];

  for (let child of entry.children as FileEntry[]) {
    if (child.children) {
      children.push(...get_children_assets(child, entry.name));
      continue;
    }

    if (parent_name) {
      children.push([
        `${parent_name}/${entry.name}/${child.name?.replace('.png', '')}`,
        child.path
      ]);
    } else {
      children.push([`${entry.name}/${child.name?.replace('.png', '')}`, child.path]);
    }
  }

  return children;
}

function retrieve_children_names(entry: FileEntry, parent_name = '') {
  let children = '';

  for (let child of entry.children as FileEntry[]) {
    if (child.children) {
      children += retrieve_children_names(child, entry.name);
      continue;
    }

    if (parent_name) {
      children += `| '${parent_name}/${entry.name}/${child.name}'`;
    } else {
      children += `| '${entry.name}/${child.name}'`;
    }
  }

  return children;
}

export const filters: { [key: string]: ({ text }: { text: string }) => boolean } = {
  events: ({ text }) => text.startsWith('events:'),
  variables: ({ text }) => text.startsWith('variables:')
  // agent_states: ({ text }) => text.startsWith('variables:'),
};

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

  return 'undefined';
}

export function generate_types(code: string, assets_array: Array<FileEntry> = []) {
  try {
    const ast = generate_ast(code);
    const prop_assignments = ast.c[0].c[0].c[2].c;
    const event_functions = prop_assignments.filter(filters.events)[0].c[1].c;
    const variable_assignments = prop_assignments.filter(filters.variables)[0].c[1].c;

    let events = '';
    let variables = '';
    let agent_states = '';
    let user_functions_and_parameters = '';
    let event_types: { [key: string]: string } = {};

    for (let assignment of event_functions) {
      let identifier = assignment.c[0].text;
      let parameters = [];
      let tuple_type = '[]';

      events += `| '${identifier}'`;

      // BACKLOG: also add regular function declaration
      if (assignment.c[1].kind == 'ArrowFunction') {
        parameters = assignment.c[1].c.filter(({ kind }) => kind == 'Parameter');
      } else {
        parameters = assignment.c.filter(({ kind }) => kind == 'Parameter');
      }

      if (parameters.length == 2) {
        tuple_type = parameters[1].c[1].text;
      }

      event_types[identifier] = tuple_type;
    }

    for (let [key, val] of Object.entries(event_types)) {
      user_functions_and_parameters += `| ["${key}", ${val}]`;
    }

    let assets = {
      agents: `'ERROR: no assets found'`,
      backgrounds: `'ERROR: no assets found'`
    };

    let variables_interface = '';

    for (let assignment of variable_assignments) {
      console.log(assignment.c[1]);
      variables += `${assignment.c[0].text}: ${infer_type(assignment.c[1].kind)};\n`;
    }

    // TODO: agent_states
    // for (let key of Object.keys(game_data?.agents?.player?.states || {})) {
    //   if (key === 'default') continue;
    //   agent_states += `| '${key}'`;
    // }

    if (assets_array.length) {
      assets.agents = '';
      assets.backgrounds = '';

      for (let asset of assets_array) {
        if (asset.children) {
          assets[asset.name as keyof typeof assets] += retrieve_children_names(asset);
          continue;
        }

        assets[asset.name as keyof typeof assets] += `| '${asset.name}'`;
      }
    }

    assets.agents = assets.agents.replaceAll('agents/', '');
    assets.backgrounds = assets.backgrounds.replaceAll('backgrounds/', '');

    return generate_boilerplate_types({
      assets,
      events,
      variables,
      agent_states,
      user_functions_and_parameters
    });
  } catch (e) {
    console.log(e);
  }
}

export function focus_trap(node: HTMLElement, enabled: boolean) {
  const elemWhitelist =
    'a[href]:not([tabindex="-1"]), button:not([tabindex="-1"]), input:not([tabindex="-1"]), textarea:not([tabindex="-1"]), select:not([tabindex="-1"]), details:not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])';
  let elemFirst: HTMLElement;
  let elemLast: HTMLElement;

  // When the first element is selected, shift+tab pressed, jump to the last selectable item.
  function onFirstElemKeydown(e: KeyboardEvent): void {
    if (e.shiftKey && e.code === 'Tab') {
      e.preventDefault();
      elemLast.focus();
    }
  }

  // When the last item selected, tab pressed, jump to the first selectable item.
  function onLastElemKeydown(e: KeyboardEvent): void {
    if (!e.shiftKey && e.code === 'Tab') {
      e.preventDefault();
      elemFirst.focus();
    }
  }

  // Sort focusable elements by tabindex, positive first, then 0
  const sortByTabIndex = (focusableElems: HTMLElement[]): HTMLElement[] => {
    return focusableElems
      .filter((elem) => elem.tabIndex >= 0)
      .sort((a, b) => {
        if (a.tabIndex === 0 && b.tabIndex > 0) return 1; // Move 0 to end of array
        else if (a.tabIndex > 0 && b.tabIndex === 0) return -1; // Move 0 to end of array
        else return a.tabIndex - b.tabIndex; // Sort non-zero values in ascending order
      });
  };

  type FocusindexElement = HTMLElement & { dataset: { focusindex: string } };

  // Get element with smallest focusindex value, or first focusable element
  const getFocusTrapTarget = (elemFirst: HTMLElement) => {
    // Get elements with data-focusindex attribute
    const focusindexElements = [...node.querySelectorAll<FocusindexElement>('[data-focusindex]')];
    if (!focusindexElements || focusindexElements.length === 0) return elemFirst;
    // return smallest focusindex element or elemFirst
    return (
      focusindexElements.sort((a, b) => {
        return +a.dataset.focusindex - +b.dataset.focusindex;
      })[0] || elemFirst
    );
  };

  const onScanElements = (fromObserver: boolean) => {
    if (enabled === false) return;
    // Gather all focusable elements, sorted according to tabindex
    const focusableElems: HTMLElement[] = sortByTabIndex(
      Array.from(node.querySelectorAll(elemWhitelist))
    );
    if (focusableElems.length) {
      // Set first/last focusable elements
      elemFirst = focusableElems[0];
      elemLast = focusableElems[focusableElems.length - 1];
      // Auto-focus focusTrapTarget or first focusable element only when not called from observer
      if (!fromObserver) getFocusTrapTarget(elemFirst).focus();
      // Listen for keydown on first & last element
      elemFirst.addEventListener('keydown', onFirstElemKeydown);
      elemLast.addEventListener('keydown', onLastElemKeydown);
    }
  };
  onScanElements(false);

  function onCleanUp(): void {
    if (elemFirst) elemFirst.removeEventListener('keydown', onFirstElemKeydown);
    if (elemLast) elemLast.removeEventListener('keydown', onLastElemKeydown);
  }

  // When children of node are changed (added or removed)
  const onObservationChange = (mutationRecords: MutationRecord[], observer: MutationObserver) => {
    if (mutationRecords.length) {
      onCleanUp();
      onScanElements(true);
    }
    return observer;
  };
  const observer = new MutationObserver(onObservationChange);
  observer.observe(node, { childList: true, subtree: true });

  // Lifecycle
  return {
    update(newArgs: boolean) {
      enabled = newArgs;
      newArgs ? onScanElements(false) : onCleanUp();
    },
    destroy() {
      onCleanUp();
      observer.disconnect();
    }
  };
}
