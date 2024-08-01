import RunCSS from 'runcss';
import JSON5 from 'json5';
import ts from 'typescript';
import type { Agents, GUI, GUI_Element, GameData } from './types';
import { DEFAULT_DIR, function_regex } from './constants';
import { join, documentDir } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { FileEntry, readDir } from '@tauri-apps/api/fs';

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

    return JSON5.parse(t).game_data;
  } catch (e) {
    console.log(t, e);
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

const filters: { [key: string]: ({ text }: { text: string }) => boolean } = {
  events: ({ text }) => text.startsWith('events:'),
  variables: ({ text }) => text.startsWith('variables:')
  // agent_states: ({ text }) => text.startsWith('variables:'),
};

export function generate_types(code: string, assets_array: Array<FileEntry> = []) {
  const ast = generate_ast(code);
  const prop_assignments = ast.c[0].c[0].c[2].c;
  const event_functions = prop_assignments.filter(filters.events)[0].c[1].c;
  const variable_assignments = prop_assignments.filter(filters.variables)[0].c[1].c;

  let events = '';
  let variables = '';
  let agent_states = '';

  // TODO: event_types
  let event_types: { [key: string]: string } = {};

  for (let assignment of event_functions) {
    let identifier = assignment.c[0].text;
    let parameters = [];
    let tuple_type = '[]';

    events += `| '${identifier}'`;

    // TODO: also add regular function declaration
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

  let assets = {
    agents: `'ERROR: no assets found'`,
    backgrounds: `'ERROR: no assets found'`
  };

  for (let assignment of variable_assignments) {
    variables += `| '${assignment.c[0].text}'`;
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

  const variable_declarations = `
  let game_data: GameData = {} 
  `;

  return (
    `
  type Prettify<T> = {
    [K in keyof T]: T[K];
  } & {};
  type AgentAssets = ${assets.agents};
  type BackgroundAssets = ${assets.backgrounds};
  type EventNames = ${events};
  type VariableNames = ${variables};
  type BackgroundNames = ${assets.backgrounds};
  type AgentStates = ${agent_states};

  type Easing =
    | 'back'
    | 'backIn'
    | 'backOut'
    | 'backInOut'
    | 'bounce'
    | 'bounceIn'
    | 'bounceOut'
    | 'bounceInOut'
    | 'circ'
    | 'circIn'
    | 'circOut'
    | 'circInOut'
    | 'cubic'
    | 'cubicIn'
    | 'cubicOut'
    | 'cubicInOut'
    | 'elastic'
    | 'elasticIn'
    | 'elasticOut'
    | 'elasticInOut'
    | 'expo'
    | 'expoIn'
    | 'expoOut'
    | 'expoInOut'
    | 'quad'
    | 'quadIn'
    | 'quadOut'
    | 'quadInOut'
    | 'quart'
    | 'quartIn'
    | 'quartOut'
    | 'quartInOut'
    | 'quint'
    | 'quintIn'
    | 'quintOut'
    | 'quintInOut'
    | 'sine'
    | 'sineIn'
    | 'sineOut'
    | 'sineInOut';
  
  type Transition = 'blur' | 'fade' | 'fly' | 'slide' | 'scale';
  
  declare namespace Tw {
     type Breakpoints =
      | 'xs'
      | 'sm'
      | 'md'
      | 'lg'
      | 'xl'
      | '2xl'
      | '3xl'
      | '4xl'
      | '5xl'
      | '6xl'
      | '7xl'
      | '8xl'
      | '9xl';
     type Units =
      | '0'
      | 'px'
      | '1'
      | '1.5'
      | '2'
      | '2.5'
      | '3'
      | '4'
      | '5'
      | '6'
      | '7'
      | '8'
      | '9'
      | '10'
      | '11'
      | '12'
      | '14'
      | '16'
      | '20'
      | '24'
      | '28'
      | '32'
      | '36'
      | '40'
      | '44'
      | '48'
      | '52'
      | '56'
      | '60'
      | '64'
      | '72'
      | '80'
      | '96'
      | 'auto'
      | 'full'
      | 'screen'
      | 'min'
      | 'max'
      | 'fit'
      | '1/2'
      | '1/3'
      | '2/3'
      | '1/4'
      | '2/4'
      | '3/4'
      | '1/5'
      | '2/5'
      | '3/5'
      | '4/5'
      | '1/6'
      | '2/6'
      | '3/6'
      | '4/6'
      | '5/6'
      | '1/12'
      | '2/12'
      | '3/12'
      | '4/12'
      | '5/12'
      | '6/12'
      | '7/12'
      | '8/12'
      | '9/12'
      | '10/12'
      | '11/12';
     type Colors =
      | 'slate'
      | 'gray'
      | 'zinc'
      | 'neutral'
      | 'stone'
      | 'red'
      | 'orange'
      | 'amber'
      | 'yellow'
      | 'lime'
      | 'green'
      | 'emerald'
      | 'teal'
      | 'cyan'
      | 'sky'
      | 'blue'
      | 'indigo'
      | 'violet'
      | 'purple'
      | 'fuchsia'
      | 'pink'
      | 'rose';
     type ShadelessColors = 'white' | 'black' | 'transparent';
     type Shades =
      | '50'
      | '100'
      | '200'
      | '300'
      | '400'
      | '500'
      | '600'
      | '700'
      | '800'
      | '900'
      | '950';
     type Opacities = '10' | '20' | '30' | '40' | '50' | '60' | '70' | '80' | '90';
  
    /**
     *
     *
     * TW CLASSES
     *
     */
     type BackgroundColors =
      | \`bg-\${Colors}-\${Shades}\`
      | \`bg-\${Colors}-\${Shades}/\${Opacities}\`
      | \`bg-\${ShadelessColors}\`
      | \`bg-white/\${Opacities}\`
      | \`bg-black/\${Opacities}\`;
     type TextColors =
      | \`text-\${Colors}-\${Shades}\`
      | \`text-\${Colors}-\${Shades}/\${Opacities}\`
      | \`text-\${ShadelessColors}\`
      | \`text-white/\${Opacities}\`
      | \`text-black/\${Opacities}\`;
     type BorderSize = 'border' | \`border-\${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}\`;
     type BorderColors =
      | \`border-\${Colors}-\${Shades}\`
      | \`border-\${Colors}-\${Shades}/\${Opacities}\`
      | \`border-\${ShadelessColors}\`
      | \`border-white/\${Opacities}\`
      | \`border-black/\${Opacities}\`;
     type BorderRadiusSuffix =
      | ''
      | '-none'
      | '-sm'
      | '-md'
      | '-lg'
      | '-xl'
      | '-2xl'
      | '-3xl'
      | '-full';
     type BorderRadiusTypes =
      | 'rounded'
      | 'rounded-s'
      | 'rounded-e'
      | 'rounded-t'
      | 'rounded-r'
      | 'rounded-b'
      | 'rounded-l'
      | 'rounded-ss'
      | 'rounded-se'
      | 'rounded-ee'
      | 'rounded-es'
      | 'rounded-tl'
      | 'rounded-tr'
      | 'rounded-br'
      | 'rounded-bl';
     type BorderRadius = \`\${BorderRadiusTypes}\${BorderRadiusSuffix}\`;
     type Display =
      | 'block'
      | 'inline-block'
      | 'inline'
      | 'flex'
      | 'inline-flex'
      | 'table'
      | 'inline-table'
      | 'table-caption'
      | 'table-cell'
      | 'table-column'
      | 'table-column-group'
      | 'table-footer-group'
      | 'table-header-group'
      | 'table-row-group'
      | 'table-row'
      | 'flow-root'
      | 'grid'
      | 'inline-grid'
      | 'contents'
      | 'list-item'
      | 'hidden';
     type FlexDirection = 'flex-row' | 'flex-row-reverse' | 'flex-col' | 'flex-col-reverse';
     type Position = 'static' | 'fixed' | 'absolute' | 'relative' | 'sticky';
     type FontSize = \`text-\${Breakpoints}\`;
     type FontWeight =
      | 'font-thin'
      | 'font-extralight'
      | 'font-light'
      | 'font-normal'
      | 'font-medium'
      | 'font-semibold'
      | 'font-bold'
      | 'font-extrabold'
      | 'font-black';
     type TranslateX = \`translate-x-\${Units}\`;
     type TranslateY = \`translate-y-\${Units}\`;
     type Width = \`w-\${Units}\`;
     type Height = \`h-\${Units}\`;
     type Margin = \`m-\${Units}\`;
     type MarginTop = \`mt-\${Units}\`;
     type MarginRight = \`mr-\${Units}\`;
     type MarginLeft = \`ml-\${Units}\`;
     type MarginBottom = \`mb-\${Units}\`;
     type MarginX = \`mx-\${Units}\`;
     type MarginY = \`my-\${Units}\`;
     type Padding = \`p-\${Units}\`;
     type PaddingTop = \`pt-\${Units}\`;
     type PaddingRight = \`pr-\${Units}\`;
     type PaddingLeft = \`pl-\${Units}\`;
     type PaddingBottom = \`pb-\${Units}\`;
     type PaddingX = \`px-\${Units}\`;
     type PaddingY = \`py-\${Units}\`;
     type Top = \`top-\${Units}\`;
     type Right = \`right-\${Units}\`;
     type Bottom = \`bottom-\${Units}\`;
     type Left = \`left-\${Units}\`;
     type Gap = \`gap-\${Units}\`;
     type Visibility = 'visible' | 'invisible' | 'collapse';
     type AlignItems =
      | 'items-start'
      | 'items-end'
      | 'items-center'
      | 'items-baseline'
      | 'items-stretch';
     type JustifyContent =
      | 'justify-normal'
      | 'justify-start'
      | 'justify-end'
      | 'justify-center'
      | 'justify-between'
      | 'justify-around'
      | 'justify-evenly'
      | 'justify-stretch';
     type ZIndex = 'z-0' | 'z-10' | 'z-20' | 'z-30' | 'z-40' | 'z-50' | 'z-auto';
  
    /**
     *
     *
     * TOKENS
     *
     */
  
     type VanillaTokens =
      | Position
      | AlignItems
      | JustifyContent
      | FontSize
      | FontWeight
      | TranslateX
      | TranslateY
      | Width
      | Height
      | Margin
      | MarginTop
      | MarginRight
      | MarginLeft
      | MarginBottom
      | MarginX
      | MarginY
      | Padding
      | PaddingTop
      | PaddingRight
      | PaddingLeft
      | PaddingBottom
      | PaddingX
      | PaddingY
      | Top
      | Right
      | Bottom
      | Left
      | Gap
      | Visibility
      | ZIndex
      | BackgroundColors
      | TextColors
      | BorderSize
      | BorderColors
      | BorderRadius
      | Display
      | FlexDirection;
  
     type PseudoClasses = 'hover' | 'focus' | 'active';
     type Tokens = VanillaTokens | \`\${PseudoClasses}:\${VanillaTokens}\`;
  }
  
  declare type PlayerPositions = 'x' | 'y';
  declare type WritableProps = PlayerPositions | VariableNames;
  declare type UserFunction = (_: GameData, args?: Array<any>) => void;

  declare interface Variables {
    [variable_name: string]: any;
  }
  
  declare interface Events {
    [function_name: string]: UserFunction;
  }
  
  type InternalEvents = '\$open_pause_menu' | '\$close_pause_menu' | '\$toggle_pause_menu' | '\$exit';

  declare interface GUI_Element {
    /** TODO: Documentation */
    type?: keyof HTMLElementTagNameMap;
    /** TODO: Documentation */
    tokens: Readonly<Array<Tw.Tokens>>;
    /** TODO: Documentation */
    on_click?: EventNames | InternalEvents;
  
    /** TODO: Documentation */
    text?: ('\$agent_avatar' | '\$agent_name' | '\$agent_text') | (string & {});
  
    /** TODO: Documentation */
    children?: { [name: string]: GUI_Element };
    /** TODO: Documentation */
    transition?: {
      type: Transition;
      // on: 'intro' | 'outro' | 'both';
      easing?: Easing;
    };
    /** TODO: Documentation */
    visibility_depends_on?: VariableNames;
  }
  
  declare interface GUI {
    \$pause_menu?: Omit<
      GUI_Element,
      'visibility_depends_on' | 'type' | 'on_click'
    >;
    // \$dialogue: GUI_Element;
    [key: string]: GUI_Element;
  }
  
  type FKeys = 'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'F6' | 'F7' | 'F8' | 'F9' | 'F10' | 'F11' | 'F12';
  
  type ArrowKeys = 'ArrowRight' | 'ArrowLeft' | 'ArrowUp' | 'ArrowDown';
  
  type DigitKeys =
    | 'Digit0'
    | 'Digit1'
    | 'Digit2'
    | 'Digit3'
    | 'Digit4'
    | 'Digit5'
    | 'Digit6'
    | 'Digit7'
    | 'Digit8'
    | 'Digit9';
  
    type Alphabet = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z' 
   
    type KeyboardEventCode =
      | \`Key\${Alphabet}\`
      | FKeys
      | DigitKeys
      | ArrowKeys
      | 'Space'
      | 'Enter'
      | 'ControlLeft'
      | 'ControlRight'
      | 'ShiftLeft'
      | 'ShiftRight'
      | 'Tab'
      | 'CapsLock'
      | 'BracketRight'
      | 'BracketLeft'
      | 'Backslash'
      | 'Quote'
      | 'Semicolon'
      | 'Period'
      | 'Comma'
      | 'Slash'
      | 'Escape';

  type KeyboardCombinations =
  | \`Ctrl_\${Exclude<KeyboardEventCode, 'ControlLeft' | 'ControlRight'>}\`
  | \`Ctrl_\${Exclude<KeyboardEventCode, 'ShiftLeft' | 'ShiftRight'>}\`;
  
  declare interface Settings {
    fps?: number;
    easing?: Easing;
    duration?: number;
    filter?: 'nearest' | 'linear';
    camera?: {
      zoom?: number;
    };
  }
  
  declare type KeyBindings = {
    [key in KeyboardEventCode | KeyboardCombinations]?: EventNames | InternalEvents | [EventNames | InternalEvents, Array<any>];
  };
  
  type SpriteConfig = {
    source: AgentAssets;
    /** The total number of frames in the spritesheet. */
    frame_count?: number;
    /** The desired frames per second of the animation. */
    fps?: number;
    /** The number of columns in the spritesheet. */
    columns?: number;
    /** The number of rows in the spritesheet. */
    rows?: number;
    /** The start frame of the current animation. */
    start_frame?: number;
    /** The end frame of the current animation. */
    end_frame?: number;
    /** Delay the start of the animation in ms. */
    delay?: number;
    /** The texture filtering applied to the spritesheet. */
    filter?: 'nearest' | 'linear';
  };
  
  declare interface Agent {
    states: {
      default: SpriteConfig;
      [state_name: string]: SpriteConfig;
    };
    easing?: Easing;
    duration?: number;
  }
  
  declare type Agents = { player: Agent; [name: string]: Agent };
  declare type XY_Tuple = [x: number, y: number];
  
  declare interface PlayableAgent extends Agent {
    x: number;
    y: number;
    x_tween: any;
    y_tween: any;
    state: string;
  }
  
  declare type PlayableAgents = Map<number, PlayableAgent>;
  
  declare type Collisions = Array<BackgroundNames>;
  
  declare interface Portal {
    to_scene_id: number;
    to_position: number;
  }
  
  declare interface Scene {
    id?: number;
    name: string;
    backgrounds: Map<number, string>;
    agents: Map<number, string>;
    portals: Map<number, Portal>;
    width: number;
    height: number;
  }
  
  declare interface PlayableScene extends Omit<Scene, 'agents'> {
    agents: Map<number, PlayableAgent>;
  }

  declare interface GameData {
    variables: Variables;
    agents: Agents;
    settings: Settings;
    events: Events;
    gui: GUI;
    keybindings: KeyBindings;
    collisions: Collisions;
    __dev_only?: {
      variables?: Variables;
      agents?: Agents;
      settings?: Settings;
      events?: Events;
      gui?: GUI;
      keybindings?: KeyBindings;
      collisions?: Collisions;
    };
  }
  ` + variable_declarations
  );
}
