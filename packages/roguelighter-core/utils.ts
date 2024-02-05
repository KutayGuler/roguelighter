import RunCSS from 'runcss';
import { transpile } from 'typescript';
import type { Agents, Backgrounds, GUI_Element, GameData } from './types';
import { join, documentDir } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { DEFAULT_DIR } from './constants';

export const { processClasses } = RunCSS();
export const noop = () => {};
export function generate_id() {
  return (Math.random() + 1).toString(36).substring(7);
}

export function clickOutside(node: Node) {
  const handleClick = (event: Event) => {
    // @ts-expect-error
    if (node && !node.contains(event.target) && !event.defaultPrevented) {
      // @ts-expect-error
      node.dispatchEvent(new CustomEvent('click_outside', node));
    }
  };

  document.addEventListener('click', handleClick, true);

  return {
    destroy() {
      document.removeEventListener('click', handleClick, true);
    }
  };
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

export function parse_code(code: string): string | GameData {
  let function_declarations = [];
  let t = transpile(code, { removeComments: true, strict: false });
  const function_regex = /function\s+([a-zA-Z_$][\w$]*)\s*\([^)]*\)\s*{[^}]*}/g;
  let matches = t.matchAll(function_regex);

  for (let m of matches) {
    let fn_str = m[0];
    function_declarations.push(fn_str);

    t = t.replace(fn_str, '');
  }

  t = t.replaceAll('var ', '');
  t = t.replaceAll(' = ', ': ');
  t = t.replaceAll(';', ',');
  t = t.replaceAll('Object.defineProperty(exports, "__esModule", { value: true }),', '');
  t = t.replace(/\b(\w+): /g, '"$1": ');
  t = t.replaceAll("'", '"');
  t = t.replaceAll('$"', '"$');
  t = t.replace('},\n\n', '}');
  t = t.slice(0, -2);
  t = `{
    ${t}
  }`;

  try {
    return JSON.parse(t);
  } catch (e) {
    return code;
  }
}

const type_annotations = {
  settings: 'satisfies Settings',
  backgrounds: 'as const satisfies Backgrounds',
  collisions: 'satisfies Collisions<typeof backgrounds>',
  agents: 'satisfies Agents',
  variables: 'satisfies Variables',
  events: 'satisfies Events<typeof agents.player, typeof variables>',
  key_bindings: 'satisfies KeyBindings<typeof agents.player, typeof variables, typeof events>',
  conditions: 'satisfies Conditions<typeof agents.player, typeof variables, typeof events>',
  gui: 'as const satisfies GUI<typeof agents.player, typeof variables, typeof events>'
};

export function json_to_code_string(json: GameData) {
  let str = ``;

  for (let [key, val] of Object.entries(json)) {
    // @ts-expect-error
    str += `const ${key} = ${JSON.stringify(val, null, '\t')} ${type_annotations[key]};\n\n`;
  }

  return str.replace(/"([^"]+)":/g, '$1:');
}

export async function get_asset_asset_urls(
  project_dir: string,
  agents: Agents<string>,
  backgrounds: Backgrounds<string>
) {
  let asset_urls = new Map<string, string>();

  const documentDirPath = await documentDir();

  for (let [key, path] of Object.entries(backgrounds)) {
    const filePath = await join(documentDirPath, `${DEFAULT_DIR}/${project_dir}/assets/${path}`);
    let source = convertFileSrc(filePath);
    asset_urls.set(key, source);
  }

  for (let [key, obj] of Object.entries(agents)) {
    let url_obj = {};

    for (let [_key, val] of Object.entries(obj.states)) {
      const filePath = await join(
        documentDirPath,
        `${DEFAULT_DIR}/${project_dir}/assets/${val.source}`
      );
      // @ts-expect-error
      url_obj[_key] = convertFileSrc(filePath);
    }

    asset_urls.set(key, url_obj);
  }

  return asset_urls;
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
  backgrounds: {
    floor: 'floors/floor_1.png',
    floor_2: 'floors/floor_2.png'
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
  events: {
    move_up: [
      ['move', 'y', 1, 'walk']
      // ['move', 'x', 1, 'walk']
      // how to do simulatenous axis movement? using arrays and promise.all
      // how to check if all the functions are going to work?
      // skip invalid functions?
    ],
    move_down: [['move', 'y', -1, 'walk']],
    move_right: [['move', 'x', 1, 'walk']],
    move_left: [['move', 'x', -1, 'walk']]
  },
  key_bindings: {
    Escape: '$toggle_pause_menu',
    ArrowUp: 'move_up',
    ArrowRight: 'move_right',
    ArrowDown: 'move_down',
    ArrowLeft: 'move_left'
  },
  conditions: {
    // something: ['x', '==', 'v.variable_name']
  },
  gui: {
    $pause_menu: {
      tokens: ['absolute', 'bottom-0', 'w-full', 'h-full', 'bg-black/50'],
      transition: { type: 'fade' },
      children: {
        continue: {
          type: 'button',
          tokens: ['bg-amber-200', 'font-bold', 'p-4', 'hover:bg-red-200'],
          on_click: '$close_pause_menu',
          text: 'Continue' // add variable {v.var_name}
        },
        exit: {
          type: 'button',
          tokens: ['bg-amber-200', 'font-bold', 'p-4', 'hover:bg-red-200'],
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

export function get_tailwind_classes(gui_element: GUI_Element<string, string>) {
  let set = new Set();

  for (let child of Object.values(gui_element)) {
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
