export const types_string = `
// @ts-expect-error
// import * as easings from 'svelte/easing';
// @ts-expect-error
// import * as transitions from 'svelte/transition';

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
    | Display;

  declare type PseudoClasses = 'hover' | 'focus' | 'active';
  declare type Tokens = VanillaTokens | \`\${PseudoClasses}:\${VanillaTokens}\`;
}

type GetVars<V extends Variables> = \`v.\${keyof V}\`;

declare type PlayerPositions = 'x' | 'y';
declare type WritableProps<V extends Variables> = PlayerPositions | GetVars<V>;
type EventExpression<P extends Agent<string>, V extends Variables> =
  | ['wait']
  | ['wait', number]
  | ['move', PlayerPositions, number, keyof P['states']]
  | ['move', PlayerPositions, number]
  | ['toggle', GetVars<V>]
  | ['play', keyof P['states']]
  | ['set', GetVars<V>, any]
  | ['add', GetVars<V>, any];

declare type F<P extends Agent<string>, V extends Variables> = {
  [key in EventExpression<P, V>[0] | InternalEvents]: Function;
};

declare interface Variables {
  [variable_name: string]: any;
}

declare interface Events<P extends Agent<string>, V extends Variables> {
  [function_name: string]: Array<EventExpression<P, V>>;
}

declare interface _Events {
  [functionName: string]: () => void;
}

type ComparisonOperator = '==' | '<=' | '>=' | '!=';
type LogicalOperator = '&&' | '||';
type BinaryOperator = ComparisonOperator | LogicalOperator;
type BinaryExpression<V extends Variables> = [Expression<V>, BinaryOperator, Expression<V>];
type Expression<V extends Variables> = WritableProps<V> | BinaryExpression<V>;

// let xd: BinaryExpression = [
//   [[['bar', '==', 'foo'], '&&', 'baz'], '||', ['foo', '&&', 'zoo']],
//   '||',
//   ['bar', '&&', 'foo'],
// ];

declare type Conditions<P extends Agent<string>, V extends Variables, E extends Events<P, V>> = {
  [event_name: keyof Events<P, V>]: BinaryExpression<V>;
};

type InternalEvents = '\$open_pause_menu' | '\$close_pause_menu' | '\$toggle_pause_menu' | '\$exit';

declare interface GUI_Element<VariableKeys, EventKeys> {
  /** TODO: Documentation */
  type?: keyof HTMLElementTagNameMap;
  /** TODO: Documentation */
  tokens: Readonly<Array<Tw.Tokens>>;
  /** TODO: Documentation */
  on_click?: EventKeys | InternalEvents;

  /** TODO: Documentation */
  text?: ('\$agent_avatar' | '\$agent_name' | '\$agent_text') | (string & {});

  /** TODO: Documentation */
  children?: { [name: string]: GUI_Element<VariableKeys, EventKeys> };
  /** TODO: Documentation */
  transition?: {
    type: keyof typeof transitions;
    // on: 'intro' | 'outro' | 'both';
    // easing: keyof typeof easings;
  };
  /** TODO: Documentation */
  visibility_depends_on?: VariableKeys;
}

declare interface GUI<P extends Agent<string>, V extends Variables, EventsObj extends Events<P, V>> {
  \$pause_menu?: Omit<
    GUI_Element<GetVars<V>, keyof EventsObj>,
    'visibility_depends_on' | 'type' | 'on_click'
  >;
  // \$dialogue: GUI_Element<GetVars<V>, keyof EventsObj>;
  [key: string]: GUI_Element<GetVars<V>, keyof EventsObj>;
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
  easing?: keyof typeof easings;
  duration?: number;
  filter?: 'nearest' | 'linear';
  camera?: {
    zoom?: number;
  };
  ready_for_declare?: boolean;
}

declare type KeyBindings<P extends Agent<string>, V extends Variables, F extends Events<P, V>> = {
  [key in KeyboardEventCode]?: keyof F | InternalEvents;
};

type SpriteConfig<Assets> = {
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

declare interface Agent<Assets> {
  states: {
    default: SpriteConfig<Assets>;
    [state_name: string]: SpriteConfig<Assets>;
  };
  easing?: keyof typeof easings;
  duration?: number;
}

declare type Agents<Assets = string> = { player: Agent<Assets>; [name: string]: Agent<Assets> };
declare type Backgrounds<Assets = string> = { [name: string]: Assets };
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

declare type Collisions<B extends Backgrounds> = Array<keyof B>;

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
