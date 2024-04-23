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
    | `bg-${Colors}-${Shades}`
    | `bg-${Colors}-${Shades}/${Opacities}`
    | `bg-${ShadelessColors}`
    | `bg-white/${Opacities}`
    | `bg-black/${Opacities}`;
  type TextColors =
    | `text-${Colors}-${Shades}`
    | `text-${Colors}-${Shades}/${Opacities}`
    | `text-${ShadelessColors}`
    | `text-white/${Opacities}`
    | `text-black/${Opacities}`;
  type BorderSize = 'border' | `border-${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`;
  type BorderColors =
    | `border-${Colors}-${Shades}`
    | `border-${Colors}-${Shades}/${Opacities}`
    | `border-${ShadelessColors}`
    | `border-white/${Opacities}`
    | `border-black/${Opacities}`;
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
  type BorderRadius = `${BorderRadiusTypes}${BorderRadiusSuffix}`;
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
  type FontSize = `text-${Breakpoints}`;
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
  type TranslateX = `translate-x-${Units}`;
  type TranslateY = `translate-y-${Units}`;
  type Width = `w-${Units}`;
  type Height = `h-${Units}`;
  type Margin = `m-${Units}`;
  type MarginTop = `mt-${Units}`;
  type MarginRight = `mr-${Units}`;
  type MarginLeft = `ml-${Units}`;
  type MarginBottom = `mb-${Units}`;
  type MarginX = `mx-${Units}`;
  type MarginY = `my-${Units}`;
  type Padding = `p-${Units}`;
  type PaddingTop = `pt-${Units}`;
  type PaddingRight = `pr-${Units}`;
  type PaddingLeft = `pl-${Units}`;
  type PaddingBottom = `pb-${Units}`;
  type PaddingX = `px-${Units}`;
  type PaddingY = `py-${Units}`;
  type Top = `top-${Units}`;
  type Right = `right-${Units}`;
  type Bottom = `bottom-${Units}`;
  type Left = `left-${Units}`;
  type Gap = `gap-${Units}`;
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
    | Display;

  type PseudoClasses = 'hover' | 'focus' | 'active';
  type Tokens = VanillaTokens | `${PseudoClasses}:${VanillaTokens}`;
}

// type GetVars<V> = $<S.Prepend<'v.'>, $<O.Keys, V>>;
// @ts-expect-error
type GetVars<V extends Variables> = `v.${keyof V}`;

export type PlayerPositions = 'x' | 'y';
export type WritableProps<V extends Variables> = PlayerPositions | GetVars<V>;
type EventExpression<P extends Agent<string>, V extends Variables> =
  | ['wait']
  | ['wait', number]
  | ['move', PlayerPositions, number, keyof P['states']]
  | ['move', PlayerPositions, number]
  | ['toggle', GetVars<V>]
  | ['play', keyof P['states']]
  | ['set', GetVars<V>, any]
  | ['add', GetVars<V>, any];

export type F<P extends Agent<string>, V extends Variables> = {
  [key in EventExpression<P, V>[0] | InternalEvents]: Function;
};

/**
 * TODO: docs
 */
export interface Variables {
  [variable_name: string]: any;
}

/**
 * TODO: docs
 */
export interface Events<P extends Agent<string>, V extends Variables> {
  [function_name: string]: Array<EventExpression<P, V>>;
}

export interface _Events {
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

/**
 * TODO: docs
 */
export type Conditions<P extends Agent<string>, V extends Variables, E extends Events<P, V>> = {
  [event_name: keyof Events<P, V>]: BinaryExpression<V>;
};

type InternalEvents = '$open_pause_menu' | '$close_pause_menu' | '$toggle_pause_menu' | '$exit';
type InternalTexts = '$agent_avatar' | '$agent_name' | '$agent_text';

export interface GUI_Element<VariableKeys, EventKeys> {
  /** The type of HTML element */
  type?: keyof HTMLElementTagNameMap;
  /** TODO: Tailwind tokens for styling */
  tokens: Readonly<Array<Tw.Tokens>>;
  /** TODO: Name of the function that will be triggered once the element is clicked on */
  on_click?: EventKeys | InternalEvents;
  /** TODO: The text that will be displayed inside the element */
  text?: InternalTexts | (string & {});
  /** An array of elements that will be inside this element
   *
   * @example // TODO:
   */
  children?: { [name: string]: GUI_Element<VariableKeys, EventKeys> };
  /** TODO: Documentation */
  transition?: {
    type: Transition;
    // on: 'intro' | 'outro' | 'both';
    easing: Easing;
  };
  /** Variable name that will determine the visibility of the element */
  visibility_depends_on?: VariableKeys;
}

/**
 * The object that contains all the GUI elements that will be in the game
 */
export interface GUI<P extends Agent<string>, V extends Variables, EventsObj extends Events<P, V>> {
  /**
   * TODO: doc
   */
  // @ts-expect-error
  $pause_menu?: Omit<
    GUI_Element<GetVars<V>, keyof EventsObj>,
    'visibility_depends_on' | 'type' | 'on_click'
  >;
  // $dialogue: GUI_Element<GetVars<V>, keyof EventsObj>;
  [key: string]: GUI_Element<GetVars<V>, keyof EventsObj>;
}

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

type FKeys = 'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'F6' | 'F7' | 'F8' | 'F9' | 'F10' | 'F11' | 'F12';

type Alphabet =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'O'
  | 'P'
  | 'Q'
  | 'R'
  | 'S'
  | 'T'
  | 'U'
  | 'V'
  | 'W'
  | 'X'
  | 'Y'
  | 'Z';

export type KeyboardEventCode =
  | `Key${Alphabet}`
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

/**
 * Default settings for your game
 */
export interface Settings {
  /**
   * Number of frames that will be played in a second
   */
  fps?: number;
  /**
   * Default easing function for animations
   */
  easing?: Easing;
  /**
   * Default duration for animations
   */
  duration?: number;
  /**
   * TODO: docs
   */
  filter?: 'nearest' | 'linear';
  /**
   * Camera options
   */
  camera?: {
    /**
     * Determines how close the camera will be to the scene
     */
    zoom?: number;
  };
}

/**
 *
 */
export type KeyBindings<P extends Agent<string>, V extends Variables, F extends Events<P, V>> = {
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

/**
 * TODO: doc
 */
export interface Agent<Assets> {
  /**
   * Different states of the agent
   */
  states: {
    /**
     * Default state of the agent. You can think this of 'idle' animation.
     */
    default: SpriteConfig<Assets>;
    /**
     * TODO: doc
     */
    [state_name: string]: SpriteConfig<Assets>;
  };
  /**
   * Default easing function for agent animations
   */
  easing?: Easing;
  /**
   * Default duration for agent animations
   */
  duration?: number;
}

/**
 * TODO: doc
 */
export type Agents<Assets = string> = {
  /**
   * Player agent settings
   */
  player: Agent<Assets>;
  /**
   * Non-player agent settings
   */
  [name: string]: Agent<Assets>;
};
/**
 * TODO: doc
 */
export type Backgrounds<Assets = string> = { [name: string]: Assets };
export type XY_Tuple = [x: number, y: number];

export interface PlayableAgent extends Agent<string> {
  name: string;
  x: number;
  y: number;
  x_tween: any;
  y_tween: any;
  state: string;
}

export type PlayableAgents = Map<number, PlayableAgent>;

export type _ = {
  v: Variables;
  e: _Events;
};

/**
 * TODO: doc
 */
export type Collisions<B extends Backgrounds> = Array<keyof B>;

export interface Portal {
  to_scene_id: number;
  to_position: number;
}

export interface Scene {
  name: string;
  backgrounds: Map<number, string>;
  agents: Map<number, string>;
  portals: Map<number, Portal>;
  width: number;
  height: number;
}

export interface Project {
  id?: number;
  name: string;
  code: string;
}

export interface PlayableScene extends Omit<Scene, 'agents'> {
  agents: Map<number, PlayableAgent>;
}

export interface GameData {
  variables: Variables;
  agents: Agents;
  settings: Settings;
  events: Events<any, any>;
  gui: GUI<any, any, any>;
  conditions: Conditions<any, any, any>;
  key_bindings: KeyBindings<any, any, any>;
  backgrounds: Backgrounds;
  collisions: Collisions<any>;
}

export interface RoguelighterProject {
  code: string;
  scenes: Map<number, Scene>;
  parsed_code: GameData;
}

export type AssetUrls = Map<string, { default: string; [key: string]: string } | string>;
