export function generate_boilerplate_types({
  assets,
  events,
  variables,
  agent_states,
  user_functions_and_parameters
}: {
  assets: { agents: string; backgrounds: string };
  events: string;
  variables: string;
  agent_states: string;
  user_functions_and_parameters: string;
}) {
  const variable_declarations = `
  let game_data: GameData = {} 
  `;

  const generated_types = `
  type Prettify<T> = {
    [K in keyof T]: T[K];
  } & {};
  type AgentAssets = ${assets.agents};
  type BackgroundAssets = ${assets.backgrounds};
  type EventNames = ${events};
  type Variables = { ${variables} };
  type BackgroundNames = ${assets.backgrounds};
  type AgentStates = { ${agent_states} };
  type UserFunctionsAndParameters = ${user_functions_and_parameters};
  `;

  // @start
const static_types = `type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
type AgentAssets = any;
type BackgroundAssets = any;
type EventNames = any;
type Variables = { [key: string]: any };
type BackgroundNames = any;
type AgentStates = { [key: string]: any };
type UserFunctionsAndParameters = any;

type Easing =
  | 'backIn'
  | 'backOut'
  | 'backInOut'
  | 'bounceIn'
  | 'bounceOut'
  | 'bounceInOut'
  | 'circIn'
  | 'circOut'
  | 'circInOut'
  | 'cubicIn'
  | 'cubicOut'
  | 'cubicInOut'
  | 'elasticIn'
  | 'elasticOut'
  | 'elasticInOut'
  | 'expoIn'
  | 'expoOut'
  | 'expoInOut'
  | 'quadIn'
  | 'quadOut'
  | 'quadInOut'
  | 'quartIn'
  | 'quartOut'
  | 'quartInOut'
  | 'quintIn'
  | 'quintOut'
  | 'quintInOut'
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
declare type WritableProps = PlayerPositions;

declare type F = {
  [key in InternalEvents]: UserFunction;
};

type UserFunction = (_: GameEnvironment, ...args: any) => void;

/**
 * TODO: docs
 */
declare interface Events {
  [function_name: string]: UserFunction;
}

type InternalEvents = '$open_pause_menu' | '$close_pause_menu' | '$toggle_pause_menu' | '$exit';
type InternalTexts = '$agent_avatar' | '$agent_name' | '$agent_text';

declare interface GUI_Element {
  /** The type of HTML element */
  type?: keyof HTMLElementTagNameMap;
  /** TODO: Tailwind tokens for styling */
  tokens: Readonly<Array<Tw.Tokens>>;
  /** TODO: Name of the function that will be triggered once the element is clicked on */
  onclick?: InternalEvents;
  /** TODO: The text that will be displayed inside the element */
  text?: InternalTexts | (string & {});
  /** An array of elements that will be inside this element
   *
   * @example TODO
   */
  children?: { [name: string]: GUI_Element };
  /** TODO: Documentation */
  transition?: {
    type: Transition;
    // on: 'intro' | 'outro' | 'both';
    easing?: Easing;
  };
  /** Variable name that will determine the visibility of the element */
  visibility_depends_on?: keyof Variables;
}

declare interface GUI {
  /**
   * TODO: doc
   */
  $pause_menu?: Omit<GUI_Element, 'visibility_depends_on' | 'type' | 'onclick'>;
  [key: string]: GUI_Element;
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

type NumpadDigitKeys =
  | 'Numpad0'
  | 'Numpad1'
  | 'Numpad2'
  | 'Numpad3'
  | 'Numpad4'
  | 'Numpad5'
  | 'Numpad6'
  | 'Numpad7'
  | 'Numpad8'
  | 'Numpad9';

type NumpadKeys =
  | NumpadDigitKeys
  | 'NumLock'
  | 'NumpadDivide'
  | 'NumpadMultiply'
  | 'NumpadSubtract'
  | 'NumpadAdd'
  | 'NumpadEnter'
  | 'NumpadDecimal';

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

declare type KeyboardEventCode =
  | \`Key\${Alphabet}\`
  | FKeys
  | DigitKeys
  | ArrowKeys
  | NumpadKeys
  | 'Backquote'
  | 'Backslash'
  | 'Backspace'
  | 'BracketLeft'
  | 'BracketRight'
  | 'CapsLock'
  | 'Comma'
  | 'ContextMenu'
  | 'ControlLeft'
  | 'ControlRight'
  | 'Delete'
  | 'Enter'
  | 'Escape'
  | 'Home'
  | 'Insert'
  | 'IntlBackslash'
  | 'Minus'
  | 'PageDown'
  | 'PageUp'
  | 'Period'
  | 'Quote'
  | 'Semicolon'
  | 'ShiftLeft'
  | 'ShiftRight'
  | 'Slash'
  | 'Space'
  | 'Tab';

declare type KeyboardCombinations =
  | \`Control_\${Exclude<KeyboardEventCode, 'ControlLeft' | 'ControlRight'>}\`
  | \`Shift_\${Exclude<KeyboardEventCode, 'ShiftLeft' | 'ShiftRight'>}\`
  | \`Alt_\${Exclude<KeyboardEventCode, 'AltLeft' | 'AltRight'>}\`;

/**
 * Default settings for your game
 */
declare interface Settings {
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

declare type KeyBindings = {
  [key in KeyboardEventCode | KeyboardCombinations]?:
    | EventNames
    | InternalEvents
    | UserFunctionsAndParameters;
};

/**
 * TODO: doc
 */
declare type SpriteConfig = {
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
declare interface AgentConfig<K extends keyof AgentStates> {
  /**
   * TODO: doc
   */
  props?: { [key: string]: any };
  /**
   * TODO: doc
   */
  states?: {
    [key in AgentStates[K]]?: SpriteConfig;
  };
}

declare type Agents = {
  /**
   * Non-player agent settings
   */
  [key in keyof AgentStates]: Prettify<AgentConfig<key>>;
};

declare type XY_Tuple = [x: number, y: number];
declare type Collisions = Array<BackgroundNames>;

declare interface GameData {
  /**
   * TODO: doc
   */
  variables: Prettify<Variables>;
  /**
   * TODO: doc
   */
  agents: Prettify<Agents>;
  /**
   * TODO: doc
   */
  settings: Prettify<Settings>;
  /**
   * TODO: doc
   */
  events: Prettify<Events>;
  /**
   * The object that contains all the GUI elements that will be in the game
   */
  gui: Prettify<GUI>;
  /**
   * TODO: doc
   */
  keybindings: Prettify<KeyBindings>;
  /**
   * TODO: doc
   */
  collisions: Prettify<Collisions>;
  /**
   * TODO: doc
   */
  __dev_only?: {
    /**
     * TODO: doc
     */
    variables?: Prettify<Variables>;
    /**
     * TODO: doc
     */
    agents?: Prettify<Agents>;
    /**
     * TODO: doc
     */
    settings?: Prettify<Settings>;
    /**
     * TODO: doc
     */
    events?: Prettify<Events>;
    /**
     * The object that contains all the GUI elements that will be in the game
     */
    gui?: Prettify<GUI>;
    /**
     * TODO: doc
     */
    keybindings?: Prettify<KeyBindings>;
    /**
     * TODO: doc
     */
    collisions?: Prettify<Collisions>;
  };
}

declare interface GameEnvironment {
  variables: Variables;
  agents: any;
}
`
// @end

  return generated_types + static_types + variable_declarations;
}
