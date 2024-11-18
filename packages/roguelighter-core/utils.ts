import JSON5 from 'json5';
import ts from 'typescript';
import { PROJECTS_DIR, function_regex } from './constants';
import { join } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/core';
import { DirEntry, readDir } from '@tauri-apps/plugin-fs';
import { GameData, GUI } from './types/game';
import { EntryObject, EntryTuple, ParseErrorObject } from './types/engine';

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
  // @ts-expect-error
  let timeout: NodeJS.Timeout;
  return function () {
    clearTimeout(timeout);
    // @ts-expect-error
    timeout = setTimeout(() => fn.apply(this, arguments), ms);
  };
}

const rgx1 = /\[\s*(?:[^\]]*?,\s*)*\s*(undefined)\s*(?=(?:,\s*[^\]]*)*\])/g;
const rgx2 = /\[\s*(?:[^\]]*?,\s*)*\s*(null)\s*(?=(?:,\s*[^\]]*)*\])/g;

export function code_string_to_json(code: string): GameData | ParseErrorObject {
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

  // turn function declarations into strings
  let game_data_declaration = find_game_data_declaration(transpiled)?.replace(
    function_regex,
    (match) => {
      let modified = match
        .replaceAll('\n', ' ')
        .replaceAll('"', '\\"')
        .replaceAll('undefined', '__undefined__');
      return `"${modified}"`;
    }
  );

  let t = game_data_declaration as string;

  let game_data_or_error: GameData | ParseErrorObject;

  try {
    t = t.replaceAll("'", '"');
    t = t.replace('},\n\n', '}');
    t = `{
      ${t}
    }`;
    t = t.replaceAll(/(?<!["'])\bundefined\b(?!["'])/g, `"!undefined!"`);
    t = t.replaceAll('__undefined__', 'undefined');

    // BACKLOG: support types for nested variables
    game_data_or_error = JSON5.parse(t, (key, val) => {
      if (val == '!undefined!') return undefined;
      if (val == '!null!') return null;
      return val;
    }).game_data;
  } catch (e) {
    game_data_or_error = {
      code,
      json_string: t,
      // @ts-expect-error
      error: e.toString()
    };
  }

  console.log(game_data_or_error);
  return game_data_or_error;
}

// BACKLOG: fix indentation
export function json_to_code_string(json: GameData) {
  let str = ``;

  for (let [key, val] of Object.entries(json)) {
    str += `${key}: ${JSON.stringify(val, null, '\t')},\n`;
  }

  return `game_data = {
  ${str.replace(/"([^"]+)":/g, '$1:')}}
  `;
}

export let agent_states_obj = {};

export async function process_entries_recursively(
  parent: string,
  entries: DirEntry[],
  type: 'backgrounds' | 'agents'
) {
  let _entries: Array<EntryObject> = [];

  for (const entry of entries) {
    // if (entry.isFile) continue;

    const dir = await join(parent, entry.name);

    const name = entry.name.replace('http://asset.localhost/', '');
    const simplified_name = name.split('.')[0];

    if (entry.isDirectory) {
      const children = await process_entries_recursively(dir, await readDir(dir), type);
      _entries.push(...children);
      if (type == 'agents') {
        agent_states_obj[name] = children.map(({ name }) => name);
      }
      continue;
    }

    _entries.push({
      name: simplified_name,
      path: parent + '\\' + name,
      type: type
    });
  }

  return _entries;
}

export async function generate_asset_urls(
  project_dir: string,
  type: 'backgrounds' | 'agents',
  document_path: string
) {
  let asset_urls = new Map<string, string>();

  const file_path = await join(document_path, `${PROJECTS_DIR}/${project_dir}/assets/${type}`);
  const entries = await readDir(file_path);
  let children = await process_entries_recursively(file_path, entries, type);

  console.log(agent_states_obj);

  for (let { name, path } of children) {
    let source = convertFileSrc(path);
    asset_urls.set(name, source);
  }

  return asset_urls;
}

export const template_json_code: GameData = {
  settings: {
    fps: 8,
    easing: 'sineOut',
    duration: 400,
    camera: {
      zoom: 9
    }
  },
  collisions: ['floor_2'],
  agents: {
    player: {
      states: {
        idle: {
          frame_count: 1
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
          onclick: '$close_pause_menu',
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
          onclick: '$exit',
          text: 'Exit' // add variable {v.var_name}
        }
      }
    }
  }
};

export function generate_template_data() {
  return JSON5.stringify({
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

export const filters: { [key: string]: ({ text }: { text: string }) => boolean } = {
  events: ({ text }) => text.startsWith('events:'),
  variables: ({ text }) => text.startsWith('variables:')
  // agent_states: ({ text }) => text.startsWith('variables:'),
};

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
    // @ts-expect-error
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
