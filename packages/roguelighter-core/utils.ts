import JSON5 from 'json5';
import ts from 'typescript';
import {
  SETUP_DECLARATION,
  SETUP_NAME,
  PROJECTS_DIR,
  function_regex,
  template_json_code
} from './constants';
import { join } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/core';
import { DirEntry, readDir } from '@tauri-apps/plugin-fs';
import { Setup } from './types/game';
import { EntryObject, ParseErrorObject } from './types/engine';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

export function code_string_to_json(code: string): Setup | ParseErrorObject {
  const transpiled = ts.transpile(code, { removeComments: true, strict: false });

  // turn function declarations into strings
  let t = transpiled?.replace(function_regex, (match) => {
    let modified = match
      .replaceAll('\n', ' ')
      .replaceAll('"', '\\"')
      .replaceAll('undefined', '__undefined__');
    return `"${modified}"`;
  });

  let setup_or_error: Setup | ParseErrorObject;

  try {
    t = t.replace(`var ${SETUP_NAME} =`, '');
    t = t.replaceAll("'", '"');
    t = t.replace('},\n\n', '}');
    t = `{
      ${t}
    }`;
    t = t.replaceAll(/(?<!["'])\bundefined\b(?!["'])/g, `"!undefined!"`);
    t = t.replaceAll('__undefined__', 'undefined');
    let first_curly = t.indexOf('{');
    let last_curly = t.lastIndexOf('};');

    t = t.slice(first_curly + 1, last_curly);
    t = t.slice(0, t.lastIndexOf('},'));
    t += '}\n}';
    t = t.replace(SETUP_DECLARATION, '');

    // BACKLOG: support types for nested variables
    setup_or_error = JSON5.parse(t, (key, val) => {
      if (val == '!undefined!') return undefined;
      if (val == '!null!') return null;
      return val;
    });
  } catch (e) {
    setup_or_error = {
      code,
      json_string: t,
      // @ts-expect-error
      error: e.toString()
    };
  }

  return setup_or_error;
}

// BACKLOG: fix indentation
export function json_to_code_string(json: Setup) {
  let str = ``;

  for (let [key, val] of Object.entries(json)) {
    str += `${key}: ${JSON.stringify(val, null, '\t')},\n`;
  }

  return `${SETUP_DECLARATION} {
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

  for (let { name, path } of children) {
    let source = convertFileSrc(path);
    asset_urls.set(name, source);
  }

  return asset_urls;
}

export function generate_template_data() {
  return JSON5.stringify({
    id: crypto.randomUUID(),
    code: json_to_code_string(template_json_code),
    scenes: new Map()
  });
}

const array_regex = /\[([^\]]*)\]/g;
const token_regex = /"([^"]+)"/g;

export function extract_tailwind_classes(stringified_gui) {
  let tokens = new Set();
  let match;

  const modifiers_regex = /"modifiers":\s*{([^}]*)}/;
  const modifiers_match = modifiers_regex.exec(stringified_gui);

  if (modifiers_match) {
    const modifiers_content = modifiers_match[1];
    const key_value_regex = /"([^"]+)":\s*\[([^\]]*)\]/g;
    let key_value_match;

    while ((key_value_match = key_value_regex.exec(modifiers_content)) !== null) {
      const key = key_value_match[1];
      const array_content = key_value_match[2];
      let token_match;

      while ((token_match = token_regex.exec(array_content)) !== null) {
        tokens.add(`${key}:${token_match[1]}`);
      }
    }
  }

  while ((match = array_regex.exec(stringified_gui)) !== null) {
    const array_content = match[0].slice(1, -1);
    let token_match;

    while ((token_match = token_regex.exec(array_content)) !== null) {
      tokens.add(token_match[1]);
    }
  }

  return Array.from(tokens.values()).join(' ');
}

export const filters: { [key in keyof Setup]?: ({ text }: { text: string }) => boolean } = {
  handlers: ({ text }) => text.startsWith('handlers:'),
  variables: ({ text }) => text.startsWith('variables:'),
  gui: ({ text }) => text.startsWith('gui:')
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
        if (a.tabIndex === 0 && b.tabIndex > 0)
          return 1; // Move 0 to end of array
        else if (a.tabIndex > 0 && b.tabIndex === 0)
          return -1; // Move 0 to end of array
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

export function replace_content_in_range(
  str: string,
  start_marker: string,
  end_marker: string,
  new_content: string
) {
  const startIdx = str.indexOf(start_marker);
  const endIdx = str.indexOf(end_marker);

  if (startIdx === -1 || endIdx === -1) {
    return str; // Markers not found, return the original string
  }

  // Calculate the range between the markers
  const rangeStart = startIdx + start_marker.length;
  const rangeEnd = endIdx;

  // Replace the content in the range
  return str.slice(0, rangeStart) + new_content + str.slice(rangeEnd);
  // return str.replace(
  //   new RegExp(`(${start_marker})(.*?)(${end_marker})`, 's'),
  //   `$1${new_content}$3`
  // );
}
