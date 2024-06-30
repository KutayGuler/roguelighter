import RunCSS from 'runcss';
import * as ts from 'typescript';
import type { Agents, Backgrounds, GUI_Element, GameData } from './types';
import { join, documentDir } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { DEFAULT_DIR } from './constants';
import JSON5 from 'json5';
import { FileEntry } from '@tauri-apps/api/fs';

// TODO: update packages

export const { processClasses } = RunCSS();
export const noop = () => {};
export function generate_id() {
  return (Math.random() + 1).toString(36).substring(7);
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

export function code_string_to_json(code: string): string | GameData {
  const transpiled = ts.transpile(code, { removeComments: true, strict: false });
  const valid_declarations_regex =
    /var\s+(settings|backgrounds|collisions|agents|variables|events|key_bindings|conditions|gui)\s*=\s*(\{[^]*?\}|\[[^]*?\])\s*;\s*/g;
  const declarations = transpiled.match(valid_declarations_regex);

  let t = '';

  for (let d of declarations) {
    t += d;
  }

  t = t.replaceAll('var ', '');
  t = t.replaceAll(' = ', ': ');
  t = t.replaceAll(';', ',');
  t = t.replace(/([\w$]+): /g, '"$1": ');
  t = t.replaceAll("'", '"');
  t = t.replace('},\n\n', '}');
  t = `{
    ${t}
  }`;

  try {
    return JSON5.parse(t);
  } catch (e) {
    return code;
  }
}

const type_annotations = {
  settings: 'Settings',
  backgrounds: 'Backgrounds',
  collisions: 'Collisions',
  agents: 'Agents',
  variables: 'Variables',
  events: 'Events',
  key_bindings: 'KeyBindings',
  conditions: 'Conditions',
  gui: 'GUI'
};

export function json_to_code_string(json: GameData) {
  let str = ``;

  for (let [key, val] of Object.entries(json)) {
    // @ts-expect-error
    str += `const ${key}: ${type_annotations[key]} = ${JSON.stringify(val, null, '\t')};\n\n`;
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

export function create_types(game_code: string | GameData, assets_array: Array<FileEntry> = []) {
  if (typeof game_code === 'string') {
    game_code = code_string_to_json(game_code) as GameData;
  }

  let assets = `'ERROR: no assets found'`;
  let events = '';
  let variables = '';
  let backgrounds = '';
  let agent_states = '';

  for (let key of Object.keys(game_code.events || {})) {
    events += `| '${key}'`;
  }

  for (let key of Object.keys(game_code.variables || {})) {
    variables += `| '${key}'`;
  }

  for (let key of Object.keys(game_code.backgrounds || {})) {
    backgrounds += `| '${key}'`;
  }

  for (let key of Object.keys(game_code?.agents?.player?.states || {})) {
    if (key === 'default') continue;
    agent_states += `| '${key}'`;
  }

  if (assets_array.length) {
    assets = '';

    for (let asset of assets_array) {
      if (asset.children) {
        assets += retrieve_children_names(asset);
        continue;
      }

      assets += `| '${asset.name}'`;
    }
  }

  // TODO: create BooleanVariables and NumberVariables
  // TODO: update logic in Game.svelte for events ()
  // TODO: could introduce Sequences (multiple events in a row)
  // TODO: get rid of backgrounds
  // assets should have two directories: agents and backgrounds

  return `
  type Assets = ${assets};
  type EventNames = ${events};
  type VariableNames = ${variables};
  type BackgroundNames = ${backgrounds};
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
    declare type Breakpoints =
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
    declare type Units =
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
    declare type Colors =
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
    declare type ShadelessColors = 'white' | 'black' | 'transparent';
    declare type Shades =
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
    declare type Opacities = '10' | '20' | '30' | '40' | '50' | '60' | '70' | '80' | '90';
  
    /**
     *
     *
     * TW CLASSES
     *
     */
    declare type BackgroundColors =
      | \`bg-\${Colors}-\${Shades}\`
      | \`bg-\${Colors}-\${Shades}/\${Opacities}\`
      | \`bg-\${ShadelessColors}\`
      | \`bg-white/\${Opacities}\`
      | \`bg-black/\${Opacities}\`;
    declare type TextColors =
      | \`text-\${Colors}-\${Shades}\`
      | \`text-\${Colors}-\${Shades}/\${Opacities}\`
      | \`text-\${ShadelessColors}\`
      | \`text-white/\${Opacities}\`
      | \`text-black/\${Opacities}\`;
    declare type BorderSize = 'border' | \`border-\${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}\`;
    declare type BorderColors =
      | \`border-\${Colors}-\${Shades}\`
      | \`border-\${Colors}-\${Shades}/\${Opacities}\`
      | \`border-\${ShadelessColors}\`
      | \`border-white/\${Opacities}\`
      | \`border-black/\${Opacities}\`;
    declare type BorderRadiusSuffix =
      | ''
      | '-none'
      | '-sm'
      | '-md'
      | '-lg'
      | '-xl'
      | '-2xl'
      | '-3xl'
      | '-full';
    declare type BorderRadiusTypes =
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
    declare type BorderRadius = \`\${BorderRadiusTypes}\${BorderRadiusSuffix}\`;
    declare type Display =
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
    declare type FlexDirection = 'flex-row' | 'flex-row-reverse' | 'flex-col' | 'flex-col-reverse';
    declare type Position = 'static' | 'fixed' | 'absolute' | 'relative' | 'sticky';
    declare type FontSize = \`text-\${Breakpoints}\`;
    declare type FontWeight =
      | 'font-thin'
      | 'font-extralight'
      | 'font-light'
      | 'font-normal'
      | 'font-medium'
      | 'font-semibold'
      | 'font-bold'
      | 'font-extrabold'
      | 'font-black';
    declare type TranslateX = \`translate-x-\${Units}\`;
    declare type TranslateY = \`translate-y-\${Units}\`;
    declare type Width = \`w-\${Units}\`;
    declare type Height = \`h-\${Units}\`;
    declare type Margin = \`m-\${Units}\`;
    declare type MarginTop = \`mt-\${Units}\`;
    declare type MarginRight = \`mr-\${Units}\`;
    declare type MarginLeft = \`ml-\${Units}\`;
    declare type MarginBottom = \`mb-\${Units}\`;
    declare type MarginX = \`mx-\${Units}\`;
    declare type MarginY = \`my-\${Units}\`;
    declare type Padding = \`p-\${Units}\`;
    declare type PaddingTop = \`pt-\${Units}\`;
    declare type PaddingRight = \`pr-\${Units}\`;
    declare type PaddingLeft = \`pl-\${Units}\`;
    declare type PaddingBottom = \`pb-\${Units}\`;
    declare type PaddingX = \`px-\${Units}\`;
    declare type PaddingY = \`py-\${Units}\`;
    declare type Top = \`top-\${Units}\`;
    declare type Right = \`right-\${Units}\`;
    declare type Bottom = \`bottom-\${Units}\`;
    declare type Left = \`left-\${Units}\`;
    declare type Gap = \`gap-\${Units}\`;
    declare type Visibility = 'visible' | 'invisible' | 'collapse';
    declare type AlignItems =
      | 'items-start'
      | 'items-end'
      | 'items-center'
      | 'items-baseline'
      | 'items-stretch';
    declare type JustifyContent =
      | 'justify-normal'
      | 'justify-start'
      | 'justify-end'
      | 'justify-center'
      | 'justify-between'
      | 'justify-around'
      | 'justify-evenly'
      | 'justify-stretch';
    declare type ZIndex = 'z-0' | 'z-10' | 'z-20' | 'z-30' | 'z-40' | 'z-50' | 'z-auto';
  
    /**
     *
     *
     * TOKENS
     *
     */
  
    declare type VanillaTokens =
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
  
    declare type PseudoClasses = 'hover' | 'focus' | 'active';
    declare type Tokens = VanillaTokens | \`\${PseudoClasses}:\${VanillaTokens}\`;
  }
  
  declare type PlayerPositions = 'x' | 'y';
  declare type WritableProps = PlayerPositions | VariableNames;
  type EventExpression =
    | [\`wait\`, number]
    | [\`play \${AgentStates}\`, any]
    | [\`toggle \${VariableNames}\`, any]
    | [\`set \${VariableNames}\`, any]
    | [\`add \${VariableNames}\`, any]
    | [\`move \${PlayerPositions}\`, number]
    | [\`move \${PlayerPositions} \${AgentStates}\`, number]

  declare interface Variables {
    [variable_name: string]: any;
  }
  
  declare interface Events {
    [function_name: string]: Array<EventExpression> | EventExpression;
  }
  
  declare interface _Events {
    [functionName: string]: () => void;
  }
  
  type ComparisonOperator = '==' | '<=' | '>=' | '!=';
  type LogicalOperator = '&&' | '||';
  type BinaryOperator = ComparisonOperator | LogicalOperator;
  type BinaryExpression = [Expression, BinaryOperator, Expression];
  type Expression = WritableProps | BinaryExpression;
  
  // let xd: BinaryExpression = [
  //   [[['bar', '==', 'foo'], '&&', 'baz'], '||', ['foo', '&&', 'zoo']],
  //   '||',
  //   ['bar', '&&', 'foo'],
  // ];
  
  declare type Conditions = {
    [event_name: EventNames]: BinaryExpression;
  };
  
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
  
  declare interface Settings {
    fps?: number;
    easing?: Easing;
    duration?: number;
    filter?: 'nearest' | 'linear';
    camera?: {
      zoom?: number;
    };
    ready_for_declare?: boolean;
  }
  
  declare type KeyBindings = {
    [key in KeyboardEventCode]?: EventNames | InternalEvents;
  };
  
  type SpriteConfig = {
    source: Assets;
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
  declare type Backgrounds = { [name: string]: Assets };
  declare type XY_Tuple = [x: number, y: number];
  
  declare interface PlayableAgent extends Agent<string> {
    x: number;
    y: number;
    x_tween: any;
    y_tween: any;
    state: string;
  }
  
  declare type PlayableAgents = Map<number, PlayableAgent>;
  
  declare type _ = {
    v: Variables;
    e: _Events;
  };
  
  declare type Collisions = Array<${backgrounds}>;
  
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
  `;
}
