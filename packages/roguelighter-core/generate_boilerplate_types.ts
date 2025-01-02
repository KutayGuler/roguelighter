import { DEFAULT_GUI_TYPE, SETUP_NAME } from './constants';

export function generate_boilerplate_types({
  assets,
  handlers,
  variables,
  variables_map,
  agent_states,
  handler_types,
  gui_interface
}: {
  assets: { agents: string; backgrounds: string };
  handlers: string;
  variables: string;
  variables_map: Map<string, [value: string, type: string]>;
  agent_states: string;
  handler_types: any;
  gui_interface: string;
}) {
  let variable_declarations = '';
  const custom_handler_union = Object.keys(handler_types)
    .map((str) => `| '${str}'`)
    .join(' ');

  for (let [key, [value, type]] of variables_map.entries()) {
    let readonly = type == 'ComputedVariable' ? 'readonly' : '';
    variable_declarations += `${readonly} ${key}: ${value},\n`;
  }

  // _ means variables
  // $ means handlers
  // PROCESS means system obj
  // BACKLOG do not allow read/write access to setup

  const setup_declarations = `
  type Process = { exit: HandlerFunction }
  type HandlersObject = { ${Object.entries(handler_types).map(([key, params]) => `${key}: (${params}) => any;\n`)} };

  const PROCESS: Process = {};
  const $: HandlersObject = {};
  const _ = { ${variable_declarations} };

  let ${SETUP_NAME}: Setup = {} 
  `;

  const generated_types = `
  type AgentAssets = ${assets.agents};
  type BackgroundAssets = ${assets.backgrounds};
  type EventNames = ${handlers};
  type Variables = { ${variables} };
  type BackgroundNames = ${assets.backgrounds};
  type AgentStates = { ${agent_states} };
  type CustomFunctionNames = ${custom_handler_union}
  `;

  // @start
const static_types = `// @replace
type AgentAssets = any;
type BackgroundAssets = any;
type EventNames = any;
type Variables = {
  [key: string]: string | number | boolean | null | undefined | object | ComputedVariable;
};
type BackgroundNames = any;
type AgentStates = { [key: string]: any };

type UserFunction = (...args: any) => void;
type CustomFunctionNames = 'custom';

type RemovePrefix<T extends string, Prefix extends string> = T extends \`\${Prefix}\${infer Rest}\`
  ? Rest
  : T;

declare type Functions = {
  [key: string]: UserFunction;
};

declare type WindowHandlers = {
  [key in \`on\${keyof WindowEventMap}\`]?: (e: WindowEventMap[RemovePrefix<key, 'on'>]) => void;
};

// replace@

// Taken from https://github.com/aryomuzakki/tw-prefixer/tree/main/assets
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
    | '7xl';
  type ExtendedBreakpoints = Breakpoints | '8xl' | '9xl';

  type ShadefulColors =
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
  type ShadelessColors = 'white' | 'black';
  type TransparentColors = 'transparent';
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
  type ColorVariants =
    | \`\${ShadefulColors}-\${Shades}\`
    | \`\${ShadefulColors}-\${Shades}/\${Opacities}\`
    | \`\${ShadelessColors}/\${Opacities}\`
    | ShadelessColors
    | TransparentColors;

  type BaseUnits =
    | '0'
    | 'px'
    | '0.5'
    | '1'
    | '1.5'
    | '2'
    | '2.5'
    | '3'
    | '3.5'
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
    | '96';

  type StandaloneClasses =
    | 'aspect-auto'
    | 'aspect-square'
    | 'aspect-video'
    | 'container'
    | 'columns-1'
    | 'columns-2'
    | 'columns-3'
    | 'columns-4'
    | 'columns-5'
    | 'columns-6'
    | 'columns-7'
    | 'columns-8'
    | 'columns-9'
    | 'columns-10'
    | 'columns-11'
    | 'columns-12'
    | 'columns-auto'
    | 'columns-3xs'
    | 'columns-2xs'
    | \`columns-\${Breakpoints}\`
    | 'break-after-auto'
    | 'break-after-avoid'
    | 'break-after-all'
    | 'break-after-avoid-page'
    | 'break-after-page'
    | 'break-after-left'
    | 'break-after-right'
    | 'break-after-column'
    | 'break-before-auto'
    | 'break-before-avoid'
    | 'break-before-all'
    | 'break-before-avoid-page'
    | 'break-before-page'
    | 'break-before-left'
    | 'break-before-right'
    | 'break-before-column'
    | 'break-inside-auto'
    | 'break-inside-avoid'
    | 'break-inside-avoid-page'
    | 'break-inside-avoid-column'
    | 'box-decoration-clone'
    | 'box-decoration-slice'
    | 'box-border'
    | 'box-content'
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
    | 'hidden'
    | 'float-start'
    | 'float-end'
    | 'float-right'
    | 'float-left'
    | 'float-none'
    | 'clear-start'
    | 'clear-end'
    | 'clear-left'
    | 'clear-right'
    | 'clear-both'
    | 'clear-none'
    | 'isolate'
    | 'isolation-auto'
    | 'object-contain'
    | 'object-cover'
    | 'object-fill'
    | 'object-none'
    | 'object-scale-down'
    | 'object-bottom'
    | 'object-center'
    | 'object-left'
    | 'object-left-bottom'
    | 'object-left-top'
    | 'object-right'
    | 'object-right-bottom'
    | 'object-right-top'
    | 'object-top'
    | 'overflow-auto'
    | 'overflow-hidden'
    | 'overflow-clip'
    | 'overflow-visible'
    | 'overflow-scroll'
    | 'overflow-x-auto'
    | 'overflow-y-auto'
    | 'overflow-x-hidden'
    | 'overflow-y-hidden'
    | 'overflow-x-clip'
    | 'overflow-y-clip'
    | 'overflow-x-visible'
    | 'overflow-y-visible'
    | 'overflow-x-scroll'
    | 'overflow-y-scroll'
    | 'overscroll-auto'
    | 'overscroll-contain'
    | 'overscroll-none'
    | 'overscroll-y-auto'
    | 'overscroll-y-contain'
    | 'overscroll-y-none'
    | 'overscroll-x-auto'
    | 'overscroll-x-contain'
    | 'overscroll-x-none'
    | 'static'
    | 'fixed'
    | 'absolute'
    | 'relative'
    | 'sticky'
    | \`inset-\${BaseUnits}\`
    | \`inset-x-\${BaseUnits}\`
    | \`inset-y-\${BaseUnits}\`
    | \`start-\${BaseUnits}\`
    | \`end-\${BaseUnits}\`
    | \`top-\${BaseUnits}\`
    | \`right-\${BaseUnits}\`
    | \`bottom-\${BaseUnits}\`
    | \`left-\${BaseUnits}\`
    | \`inset-\${BaseUnits}\`
    | \`inset-x-\${BaseUnits}\`
    | \`inset-y-\${BaseUnits}\`
    | \`start-\${BaseUnits}\`
    | \`end-\${BaseUnits}\`
    | \`top-\${BaseUnits}\`
    | \`right-\${BaseUnits}\`
    | \`bottom-\${BaseUnits}\`
    | \`left-\${BaseUnits}\`
    | 'inset-auto'
    | 'inset-1/2'
    | 'inset-1/3'
    | 'inset-2/3'
    | 'inset-1/4'
    | 'inset-2/4'
    | 'inset-3/4'
    | 'inset-full'
    | 'inset-x-auto'
    | 'inset-x-1/2'
    | 'inset-x-1/3'
    | 'inset-x-2/3'
    | 'inset-x-1/4'
    | 'inset-x-2/4'
    | 'inset-x-3/4'
    | 'inset-x-full'
    | 'inset-y-auto'
    | 'inset-y-1/2'
    | 'inset-y-1/3'
    | 'inset-y-2/3'
    | 'inset-y-1/4'
    | 'inset-y-2/4'
    | 'inset-y-3/4'
    | 'inset-y-full'
    | 'start-auto'
    | 'start-1/2'
    | 'start-1/3'
    | 'start-2/3'
    | 'start-1/4'
    | 'start-2/4'
    | 'start-3/4'
    | 'start-full'
    | 'end-auto'
    | 'end-1/2'
    | 'end-1/3'
    | 'end-2/3'
    | 'end-1/4'
    | 'end-2/4'
    | 'end-3/4'
    | 'end-full'
    | 'top-auto'
    | 'top-1/2'
    | 'top-1/3'
    | 'top-2/3'
    | 'top-1/4'
    | 'top-2/4'
    | 'top-3/4'
    | 'top-full'
    | 'right-auto'
    | 'right-1/2'
    | 'right-1/3'
    | 'right-2/3'
    | 'right-1/4'
    | 'right-2/4'
    | 'right-3/4'
    | 'right-full'
    | 'bottom-auto'
    | 'bottom-1/2'
    | 'bottom-1/3'
    | 'bottom-2/3'
    | 'bottom-1/4'
    | 'bottom-2/4'
    | 'bottom-3/4'
    | 'bottom-full'
    | 'left-auto'
    | 'left-1/2'
    | 'left-1/3'
    | 'left-2/3'
    | 'left-1/4'
    | 'left-2/4'
    | 'left-3/4'
    | 'left-full'
    | 'visible'
    | 'invisible'
    | 'collapse'
    | 'z-0'
    | 'z-10'
    | 'z-20'
    | 'z-30'
    | 'z-40'
    | 'z-50'
    | 'z-auto'
    | \`basis-\${BaseUnits}\`
    | 'basis-auto'
    | 'basis-1/2'
    | 'basis-1/3'
    | 'basis-2/3'
    | 'basis-1/4'
    | 'basis-2/4'
    | 'basis-3/4'
    | 'basis-1/5'
    | 'basis-2/5'
    | 'basis-3/5'
    | 'basis-4/5'
    | 'basis-1/6'
    | 'basis-2/6'
    | 'basis-3/6'
    | 'basis-4/6'
    | 'basis-5/6'
    | 'basis-1/12'
    | 'basis-2/12'
    | 'basis-3/12'
    | 'basis-4/12'
    | 'basis-5/12'
    | 'basis-6/12'
    | 'basis-7/12'
    | 'basis-8/12'
    | 'basis-9/12'
    | 'basis-10/12'
    | 'basis-11/12'
    | 'basis-full'
    | 'flex-row'
    | 'flex-row-reverse'
    | 'flex-col'
    | 'flex-col-reverse'
    | 'flex-wrap'
    | 'flex-wrap-reverse'
    | 'flex-nowrap'
    | 'flex-1'
    | 'flex-auto'
    | 'flex-initial'
    | 'flex-none'
    | 'grow'
    | 'grow-0'
    | 'shrink'
    | 'shrink-0'
    | 'order-1'
    | 'order-2'
    | 'order-3'
    | 'order-4'
    | 'order-5'
    | 'order-6'
    | 'order-7'
    | 'order-8'
    | 'order-9'
    | 'order-10'
    | 'order-11'
    | 'order-12'
    | 'order-first'
    | 'order-last'
    | 'order-none'
    | 'grid-cols-1'
    | 'grid-cols-2'
    | 'grid-cols-3'
    | 'grid-cols-4'
    | 'grid-cols-5'
    | 'grid-cols-6'
    | 'grid-cols-7'
    | 'grid-cols-8'
    | 'grid-cols-9'
    | 'grid-cols-10'
    | 'grid-cols-11'
    | 'grid-cols-12'
    | 'grid-cols-none'
    | 'grid-cols-subgrid'
    | 'col-auto'
    | 'col-span-1'
    | 'col-span-2'
    | 'col-span-3'
    | 'col-span-4'
    | 'col-span-5'
    | 'col-span-6'
    | 'col-span-7'
    | 'col-span-8'
    | 'col-span-9'
    | 'col-span-10'
    | 'col-span-11'
    | 'col-span-12'
    | 'col-span-full'
    | 'col-start-1'
    | 'col-start-2'
    | 'col-start-3'
    | 'col-start-4'
    | 'col-start-5'
    | 'col-start-6'
    | 'col-start-7'
    | 'col-start-8'
    | 'col-start-9'
    | 'col-start-10'
    | 'col-start-11'
    | 'col-start-12'
    | 'col-start-13'
    | 'col-start-auto'
    | 'col-end-1'
    | 'col-end-2'
    | 'col-end-3'
    | 'col-end-4'
    | 'col-end-5'
    | 'col-end-6'
    | 'col-end-7'
    | 'col-end-8'
    | 'col-end-9'
    | 'col-end-10'
    | 'col-end-11'
    | 'col-end-12'
    | 'col-end-13'
    | 'col-end-auto'
    | 'grid-rows-1'
    | 'grid-rows-2'
    | 'grid-rows-3'
    | 'grid-rows-4'
    | 'grid-rows-5'
    | 'grid-rows-6'
    | 'grid-rows-7'
    | 'grid-rows-8'
    | 'grid-rows-9'
    | 'grid-rows-10'
    | 'grid-rows-11'
    | 'grid-rows-12'
    | 'grid-rows-none'
    | 'grid-rows-subgrid'
    | 'row-auto'
    | 'row-span-1'
    | 'row-span-2'
    | 'row-span-3'
    | 'row-span-4'
    | 'row-span-5'
    | 'row-span-6'
    | 'row-span-7'
    | 'row-span-8'
    | 'row-span-9'
    | 'row-span-10'
    | 'row-span-11'
    | 'row-span-12'
    | 'row-span-full'
    | 'row-start-1'
    | 'row-start-2'
    | 'row-start-3'
    | 'row-start-4'
    | 'row-start-5'
    | 'row-start-6'
    | 'row-start-7'
    | 'row-start-8'
    | 'row-start-9'
    | 'row-start-10'
    | 'row-start-11'
    | 'row-start-12'
    | 'row-start-13'
    | 'row-start-auto'
    | 'row-end-1'
    | 'row-end-2'
    | 'row-end-3'
    | 'row-end-4'
    | 'row-end-5'
    | 'row-end-6'
    | 'row-end-7'
    | 'row-end-8'
    | 'row-end-9'
    | 'row-end-10'
    | 'row-end-11'
    | 'row-end-12'
    | 'row-end-13'
    | 'row-end-auto'
    | 'grid-flow-row'
    | 'grid-flow-col'
    | 'grid-flow-dense'
    | 'grid-flow-row-dense'
    | 'grid-flow-col-dense'
    | 'auto-cols-auto'
    | 'auto-cols-min'
    | 'auto-cols-max'
    | 'auto-cols-fr'
    | 'auto-rows-auto'
    | 'auto-rows-min'
    | 'auto-rows-max'
    | 'auto-rows-fr'
    | \`gap-\${BaseUnits}\`
    | 'justify-normal'
    | 'justify-start'
    | 'justify-end'
    | 'justify-center'
    | 'justify-between'
    | 'justify-around'
    | 'justify-evenly'
    | 'justify-stretch'
    | 'justify-items-start'
    | 'justify-items-end'
    | 'justify-items-center'
    | 'justify-items-stretch'
    | 'justify-self-auto'
    | 'justify-self-start'
    | 'justify-self-end'
    | 'justify-self-center'
    | 'justify-self-stretch'
    | 'content-normal'
    | 'content-center'
    | 'content-start'
    | 'content-end'
    | 'content-between'
    | 'content-around'
    | 'content-evenly'
    | 'content-baseline'
    | 'content-stretch'
    | 'items-start'
    | 'items-end'
    | 'items-center'
    | 'items-baseline'
    | 'items-stretch'
    | 'self-auto'
    | 'self-start'
    | 'self-end'
    | 'self-center'
    | 'self-stretch'
    | 'self-baseline'
    | 'place-content-center'
    | 'place-content-start'
    | 'place-content-end'
    | 'place-content-between'
    | 'place-content-around'
    | 'place-content-evenly'
    | 'place-content-baseline'
    | 'place-content-stretch'
    | 'place-items-start'
    | 'place-items-end'
    | 'place-items-center'
    | 'place-items-baseline'
    | 'place-items-stretch'
    | 'place-self-auto'
    | 'place-self-start'
    | 'place-self-end'
    | 'place-self-center'
    | 'place-self-stretch'
    | \`p-\${BaseUnits}\`
    | \`px-\${BaseUnits}\`
    | \`py-\${BaseUnits}\`
    | \`ps-\${BaseUnits}\`
    | \`pe-\${BaseUnits}\`
    | \`pt-\${BaseUnits}\`
    | \`pr-\${BaseUnits}\`
    | \`pb-\${BaseUnits}\`
    | \`pl-\${BaseUnits}\`
    | \`m-\${BaseUnits}\`
    | \`mx-\${BaseUnits}\`
    | \`my-\${BaseUnits}\`
    | \`ms-\${BaseUnits}\`
    | \`me-\${BaseUnits}\`
    | \`mt-\${BaseUnits}\`
    | \`mr-\${BaseUnits}\`
    | \`mb-\${BaseUnits}\`
    | \`ml-\${BaseUnits}\`
    | 'm-auto'
    | 'mx-auto'
    | 'my-auto'
    | 'ms-auto'
    | 'me-auto'
    | 'mt-auto'
    | 'mr-auto'
    | 'mb-auto'
    | 'ml-auto'
    | \`space-x-\${BaseUnits}\`
    | \`space-y-\${BaseUnits}\`
    | 'space-y-reverse'
    | 'space-x-reverse'
    | \`w-\${BaseUnits}\`
    | 'w-auto'
    | 'w-1/2'
    | 'w-1/3'
    | 'w-2/3'
    | 'w-1/4'
    | 'w-2/4'
    | 'w-3/4'
    | 'w-1/5'
    | 'w-2/5'
    | 'w-3/5'
    | 'w-4/5'
    | 'w-1/6'
    | 'w-2/6'
    | 'w-3/6'
    | 'w-4/6'
    | 'w-5/6'
    | 'w-1/12'
    | 'w-2/12'
    | 'w-3/12'
    | 'w-4/12'
    | 'w-5/12'
    | 'w-6/12'
    | 'w-7/12'
    | 'w-8/12'
    | 'w-9/12'
    | 'w-10/12'
    | 'w-11/12'
    | 'w-full'
    | 'w-screen'
    | 'w-svw'
    | 'w-lvw'
    | 'w-dvw'
    | 'w-min'
    | 'w-max'
    | 'w-fit'
    | \`min-w-\${BaseUnits}\`
    | 'min-w-full'
    | 'min-w-min'
    | 'min-w-max'
    | 'min-w-fit'
    | \`max-w-\${BaseUnits}\`
    | 'max-w-none'
    | \`max-w-\${Breakpoints}\`
    | 'max-w-full'
    | 'max-w-min'
    | 'max-w-max'
    | 'max-w-fit'
    | 'max-w-prose'
    | 'max-w-screen-sm'
    | 'max-w-screen-md'
    | 'max-w-screen-lg'
    | 'max-w-screen-xl'
    | 'max-w-screen-2xl'
    | \`h-\${BaseUnits}\`
    | 'h-auto'
    | 'h-1/2'
    | 'h-1/3'
    | 'h-2/3'
    | 'h-1/4'
    | 'h-2/4'
    | 'h-3/4'
    | 'h-1/5'
    | 'h-2/5'
    | 'h-3/5'
    | 'h-4/5'
    | 'h-1/6'
    | 'h-2/6'
    | 'h-3/6'
    | 'h-4/6'
    | 'h-5/6'
    | 'h-full'
    | 'h-screen'
    | 'h-svh'
    | 'h-lvh'
    | 'h-dvh'
    | 'h-min'
    | 'h-max'
    | 'h-fit'
    | \`min-h-\${BaseUnits}\`
    | 'min-h-full'
    | 'min-h-screen'
    | 'min-h-svh'
    | 'min-h-lvh'
    | 'min-h-dvh'
    | 'min-h-min'
    | 'min-h-max'
    | 'min-h-fit'
    | \`max-h-\${BaseUnits}\`
    | 'max-h-none'
    | 'max-h-full'
    | 'max-h-screen'
    | 'max-h-svh'
    | 'max-h-lvh'
    | 'max-h-dvh'
    | 'max-h-min'
    | 'max-h-max'
    | 'max-h-fit'
    | \`size-\${BaseUnits}\`
    | 'size-auto'
    | 'size-1/2'
    | 'size-1/3'
    | 'size-2/3'
    | 'size-1/4'
    | 'size-2/4'
    | 'size-3/4'
    | 'size-1/5'
    | 'size-2/5'
    | 'size-3/5'
    | 'size-4/5'
    | 'size-1/6'
    | 'size-2/6'
    | 'size-3/6'
    | 'size-4/6'
    | 'size-5/6'
    | 'size-1/12'
    | 'size-2/12'
    | 'size-3/12'
    | 'size-4/12'
    | 'size-5/12'
    | 'size-6/12'
    | 'size-7/12'
    | 'size-8/12'
    | 'size-9/12'
    | 'size-10/12'
    | 'size-11/12'
    | 'size-full'
    | 'size-min'
    | 'size-max'
    | 'size-fit'
    | 'font-sans'
    | 'font-serif'
    | 'font-mono'
    | \`text-\${ExtendedBreakpoints}\`
    | 'text-base'
    | 'antialiased'
    | 'subpixel-antialiased'
    | 'italic'
    | 'not-italic'
    | 'font-thin'
    | 'font-extralight'
    | 'font-light'
    | 'font-normal'
    | 'font-medium'
    | 'font-semibold'
    | 'font-bold'
    | 'font-extrabold'
    | 'font-black'
    | 'normal-nums'
    | 'ordinal'
    | 'slashed-zero'
    | 'lining-nums'
    | 'oldstyle-nums'
    | 'proportional-nums'
    | 'tabular-nums'
    | 'diagonal-fractions'
    | 'stacked-fractions'
    | 'tracking-tighter'
    | 'tracking-tight'
    | 'tracking-normal'
    | 'tracking-wide'
    | 'tracking-wider'
    | 'tracking-widest'
    | 'line-clamp-1'
    | 'line-clamp-2'
    | 'line-clamp-3'
    | 'line-clamp-4'
    | 'line-clamp-5'
    | 'line-clamp-6'
    | 'line-clamp-none'
    | 'leading-3'
    | 'leading-4'
    | 'leading-5'
    | 'leading-6'
    | 'leading-7'
    | 'leading-8'
    | 'leading-9'
    | 'leading-10'
    | 'leading-none'
    | 'leading-tight'
    | 'leading-snug'
    | 'leading-normal'
    | 'leading-relaxed'
    | 'leading-loose'
    | 'list-image-none'
    | 'list-inside'
    | 'list-outside'
    | 'list-none'
    | 'list-disc'
    | 'list-decimal'
    | 'text-left'
    | 'text-center'
    | 'text-right'
    | 'text-justify'
    | 'text-start'
    | 'text-end'
    | 'text-inherit'
    | 'text-current'
    | \`text-\${ColorVariants}\`
    | 'underline'
    | 'overline'
    | 'line-through'
    | 'no-underline'
    | 'decoration-inherit'
    | 'decoration-current'
    | \`decoration-\${ColorVariants}\`
    | 'decoration-solid'
    | 'decoration-double'
    | 'decoration-dotted'
    | 'decoration-dashed'
    | 'decoration-wavy'
    | 'decoration-auto'
    | 'decoration-from-font'
    | 'decoration-0'
    | 'decoration-1'
    | 'decoration-2'
    | 'decoration-4'
    | 'decoration-8'
    | 'underline-offset-auto'
    | 'underline-offset-0'
    | 'underline-offset-1'
    | 'underline-offset-2'
    | 'underline-offset-4'
    | 'underline-offset-8'
    | 'uppercase'
    | 'lowercase'
    | 'capitalize'
    | 'normal-case'
    | 'truncate'
    | 'text-ellipsis'
    | 'text-clip'
    | 'text-wrap'
    | 'text-nowrap'
    | 'text-balance'
    | 'text-pretty'
    | \`indent-\${BaseUnits}\`
    | 'align-baseline'
    | 'align-top'
    | 'align-middle'
    | 'align-bottom'
    | 'align-text-top'
    | 'align-text-bottom'
    | 'align-sub'
    | 'align-super'
    | 'whitespace-normal'
    | 'whitespace-nowrap'
    | 'whitespace-pre'
    | 'whitespace-pre-line'
    | 'whitespace-pre-wrap'
    | 'whitespace-break-spaces'
    | 'break-normal'
    | 'break-words'
    | 'break-all'
    | 'break-keep'
    | 'hyphens-none'
    | 'hyphens-manual'
    | 'hyphens-auto'
    | 'content-none'
    | 'bg-fixed'
    | 'bg-local'
    | 'bg-scroll'
    | 'bg-clip-border'
    | 'bg-clip-padding'
    | 'bg-clip-content'
    | 'bg-clip-text'
    | 'bg-inherit'
    | 'bg-current'
    | \`bg-\${ColorVariants}\`
    | 'bg-origin-border'
    | 'bg-origin-padding'
    | 'bg-origin-content'
    | 'bg-bottom'
    | 'bg-center'
    | 'bg-left'
    | 'bg-left-bottom'
    | 'bg-left-top'
    | 'bg-right'
    | 'bg-right-bottom'
    | 'bg-right-top'
    | 'bg-top'
    | 'bg-repeat'
    | 'bg-no-repeat'
    | 'bg-repeat-x'
    | 'bg-repeat-y'
    | 'bg-repeat-round'
    | 'bg-repeat-space'
    | 'bg-auto'
    | 'bg-cover'
    | 'bg-contain'
    | 'bg-none'
    | 'bg-gradient-to-t'
    | 'bg-gradient-to-tr'
    | 'bg-gradient-to-r'
    | 'bg-gradient-to-br'
    | 'bg-gradient-to-b'
    | 'bg-gradient-to-bl'
    | 'bg-gradient-to-l'
    | 'bg-gradient-to-tl'
    | 'from-inherit'
    | 'from-current'
    | \`from-\${ColorVariants}\`
    | 'from-0%'
    | 'from-5%'
    | 'from-10%'
    | 'from-15%'
    | 'from-20%'
    | 'from-25%'
    | 'from-30%'
    | 'from-35%'
    | 'from-40%'
    | 'from-45%'
    | 'from-50%'
    | 'from-55%'
    | 'from-60%'
    | 'from-65%'
    | 'from-70%'
    | 'from-75%'
    | 'from-80%'
    | 'from-85%'
    | 'from-90%'
    | 'from-95%'
    | 'from-100%'
    | 'via-inherit'
    | 'via-current'
    | \`via-\${ColorVariants}\`
    | 'via-0%'
    | 'via-5%'
    | 'via-10%'
    | 'via-15%'
    | 'via-20%'
    | 'via-25%'
    | 'via-30%'
    | 'via-35%'
    | 'via-40%'
    | 'via-45%'
    | 'via-50%'
    | 'via-55%'
    | 'via-60%'
    | 'via-65%'
    | 'via-70%'
    | 'via-75%'
    | 'via-80%'
    | 'via-85%'
    | 'via-90%'
    | 'via-95%'
    | 'via-100%'
    | 'to-inherit'
    | 'to-current'
    | \`to-\${ColorVariants}\`
    | 'to-0%'
    | 'to-5%'
    | 'to-10%'
    | 'to-15%'
    | 'to-20%'
    | 'to-25%'
    | 'to-30%'
    | 'to-35%'
    | 'to-40%'
    | 'to-45%'
    | 'to-50%'
    | 'to-55%'
    | 'to-60%'
    | 'to-65%'
    | 'to-70%'
    | 'to-75%'
    | 'to-80%'
    | 'to-85%'
    | 'to-90%'
    | 'to-95%'
    | 'to-100%'
    | 'rounded-none'
    | 'rounded-sm'
    | 'rounded'
    | 'rounded-md'
    | 'rounded-lg'
    | 'rounded-xl'
    | 'rounded-2xl'
    | 'rounded-3xl'
    | 'rounded-full'
    | 'rounded-s-none'
    | 'rounded-s-sm'
    | 'rounded-s'
    | 'rounded-s-md'
    | 'rounded-s-lg'
    | 'rounded-s-xl'
    | 'rounded-s-2xl'
    | 'rounded-s-3xl'
    | 'rounded-s-full'
    | 'rounded-e-none'
    | 'rounded-e-sm'
    | 'rounded-e'
    | 'rounded-e-md'
    | 'rounded-e-lg'
    | 'rounded-e-xl'
    | 'rounded-e-2xl'
    | 'rounded-e-3xl'
    | 'rounded-e-full'
    | 'rounded-t-none'
    | 'rounded-t-sm'
    | 'rounded-t'
    | 'rounded-t-md'
    | 'rounded-t-lg'
    | 'rounded-t-xl'
    | 'rounded-t-2xl'
    | 'rounded-t-3xl'
    | 'rounded-t-full'
    | 'rounded-r-none'
    | 'rounded-r-sm'
    | 'rounded-r'
    | 'rounded-r-md'
    | 'rounded-r-lg'
    | 'rounded-r-xl'
    | 'rounded-r-2xl'
    | 'rounded-r-3xl'
    | 'rounded-r-full'
    | 'rounded-b-none'
    | 'rounded-b-sm'
    | 'rounded-b'
    | 'rounded-b-md'
    | 'rounded-b-lg'
    | 'rounded-b-xl'
    | 'rounded-b-2xl'
    | 'rounded-b-3xl'
    | 'rounded-b-full'
    | 'rounded-l-none'
    | 'rounded-l-sm'
    | 'rounded-l'
    | 'rounded-l-md'
    | 'rounded-l-lg'
    | 'rounded-l-xl'
    | 'rounded-l-2xl'
    | 'rounded-l-3xl'
    | 'rounded-l-full'
    | 'rounded-ss-none'
    | 'rounded-ss-sm'
    | 'rounded-ss'
    | 'rounded-ss-md'
    | 'rounded-ss-lg'
    | 'rounded-ss-xl'
    | 'rounded-ss-2xl'
    | 'rounded-ss-3xl'
    | 'rounded-ss-full'
    | 'rounded-se-none'
    | 'rounded-se-sm'
    | 'rounded-se'
    | 'rounded-se-md'
    | 'rounded-se-lg'
    | 'rounded-se-xl'
    | 'rounded-se-2xl'
    | 'rounded-se-3xl'
    | 'rounded-se-full'
    | 'rounded-ee-none'
    | 'rounded-ee-sm'
    | 'rounded-ee'
    | 'rounded-ee-md'
    | 'rounded-ee-lg'
    | 'rounded-ee-xl'
    | 'rounded-ee-2xl'
    | 'rounded-ee-3xl'
    | 'rounded-ee-full'
    | 'rounded-es-none'
    | 'rounded-es-sm'
    | 'rounded-es'
    | 'rounded-es-md'
    | 'rounded-es-lg'
    | 'rounded-es-xl'
    | 'rounded-es-2xl'
    | 'rounded-es-3xl'
    | 'rounded-es-full'
    | 'rounded-tl-none'
    | 'rounded-tl-sm'
    | 'rounded-tl'
    | 'rounded-tl-md'
    | 'rounded-tl-lg'
    | 'rounded-tl-xl'
    | 'rounded-tl-2xl'
    | 'rounded-tl-3xl'
    | 'rounded-tl-full'
    | 'rounded-tr-none'
    | 'rounded-tr-sm'
    | 'rounded-tr'
    | 'rounded-tr-md'
    | 'rounded-tr-lg'
    | 'rounded-tr-xl'
    | 'rounded-tr-2xl'
    | 'rounded-tr-3xl'
    | 'rounded-tr-full'
    | 'rounded-br-none'
    | 'rounded-br-sm'
    | 'rounded-br'
    | 'rounded-br-md'
    | 'rounded-br-lg'
    | 'rounded-br-xl'
    | 'rounded-br-2xl'
    | 'rounded-br-3xl'
    | 'rounded-br-full'
    | 'rounded-bl-none'
    | 'rounded-bl-sm'
    | 'rounded-bl'
    | 'rounded-bl-md'
    | 'rounded-bl-lg'
    | 'rounded-bl-xl'
    | 'rounded-bl-2xl'
    | 'rounded-bl-3xl'
    | 'rounded-bl-full'
    | 'rounded-s-*'
    | 'rounded-e-*'
    | 'rounded-ss-*'
    | 'rounded-se-*'
    | 'rounded-es-*'
    | 'rounded-ee-*'
    | 'border-0'
    | 'border-2'
    | 'border-4'
    | 'border-8'
    | 'border'
    | 'border-x-0'
    | 'border-x-2'
    | 'border-x-4'
    | 'border-x-8'
    | 'border-x'
    | 'border-y-0'
    | 'border-y-2'
    | 'border-y-4'
    | 'border-y-8'
    | 'border-y'
    | 'border-s-0'
    | 'border-s-2'
    | 'border-s-4'
    | 'border-s-8'
    | 'border-s'
    | 'border-e-0'
    | 'border-e-2'
    | 'border-e-4'
    | 'border-e-8'
    | 'border-e'
    | 'border-t-0'
    | 'border-t-2'
    | 'border-t-4'
    | 'border-t-8'
    | 'border-t'
    | 'border-r-0'
    | 'border-r-2'
    | 'border-r-4'
    | 'border-r-8'
    | 'border-r'
    | 'border-b-0'
    | 'border-b-2'
    | 'border-b-4'
    | 'border-b-8'
    | 'border-b'
    | 'border-l-0'
    | 'border-l-2'
    | 'border-l-4'
    | 'border-l-8'
    | 'border-l'
    | 'border-inherit'
    | 'border-current'
    | \`border-\${ColorVariants}\`
    | 'border-x-inherit'
    | 'border-x-current'
    | \`border-x-\${ColorVariants}\`
    | 'border-y-inherit'
    | 'border-y-current'
    | \`border-y-\${ColorVariants}\`
    | 'border-s-inherit'
    | 'border-s-current'
    | \`border-s-\${ColorVariants}\`
    | 'border-e-inherit'
    | 'border-e-current'
    | \`border-e-\${ColorVariants}\`
    | 'border-t-inherit'
    | 'border-t-current'
    | \`border-t-\${ColorVariants}\`
    | 'border-r-inherit'
    | 'border-r-current'
    | \`border-r-\${ColorVariants}\`
    | 'border-b-inherit'
    | 'border-b-current'
    | \`border-b-\${ColorVariants}\`
    | 'border-l-inherit'
    | 'border-l-current'
    | \`border-l-\${ColorVariants}\`
    | 'border-solid'
    | 'border-dashed'
    | 'border-dotted'
    | 'border-double'
    | 'border-hidden'
    | 'border-none'
    | 'divide-x-0'
    | 'divide-x-2'
    | 'divide-x-4'
    | 'divide-x-8'
    | 'divide-x'
    | 'divide-y-0'
    | 'divide-y-2'
    | 'divide-y-4'
    | 'divide-y-8'
    | 'divide-y'
    | 'divide-y-reverse'
    | 'divide-x-reverse'
    | 'divide-inherit'
    | 'divide-current'
    | \`divide-\${ColorVariants}\`
    | 'divide-solid'
    | 'divide-dashed'
    | 'divide-dotted'
    | 'divide-double'
    | 'divide-none'
    | 'outline-0'
    | 'outline-1'
    | 'outline-2'
    | 'outline-4'
    | 'outline-8'
    | 'outline-inherit'
    | 'outline-current'
    | \`outline-\${ColorVariants}\`
    | 'outline-none'
    | 'outline'
    | 'outline-dashed'
    | 'outline-dotted'
    | 'outline-double'
    | 'outline-offset-0'
    | 'outline-offset-1'
    | 'outline-offset-2'
    | 'outline-offset-4'
    | 'outline-offset-8'
    | 'ring-0'
    | 'ring-1'
    | 'ring-2'
    | 'ring'
    | 'ring-4'
    | 'ring-8'
    | 'ring-inset'
    | 'ring-inherit'
    | 'ring-current'
    | \`ring-\${ColorVariants}\`
    | 'ring-offset-0'
    | 'ring-offset-1'
    | 'ring-offset-2'
    | 'ring-offset-4'
    | 'ring-offset-8'
    | 'ring-offset-inherit'
    | 'ring-offset-current'
    | \`ring-offset-\${ColorVariants}\`
    | 'shadow-sm'
    | 'shadow'
    | 'shadow-md'
    | 'shadow-lg'
    | 'shadow-xl'
    | 'shadow-2xl'
    | 'shadow-inner'
    | 'shadow-none'
    | 'shadow-inherit'
    | 'shadow-current'
    | \`shadow-\${ColorVariants}\`
    | 'opacity-0'
    | 'opacity-5'
    | 'opacity-10'
    | 'opacity-15'
    | 'opacity-20'
    | 'opacity-25'
    | 'opacity-30'
    | 'opacity-35'
    | 'opacity-40'
    | 'opacity-45'
    | 'opacity-50'
    | 'opacity-55'
    | 'opacity-60'
    | 'opacity-65'
    | 'opacity-70'
    | 'opacity-75'
    | 'opacity-80'
    | 'opacity-85'
    | 'opacity-90'
    | 'opacity-95'
    | 'opacity-100'
    | 'mix-blend-normal'
    | 'mix-blend-multiply'
    | 'mix-blend-screen'
    | 'mix-blend-overlay'
    | 'mix-blend-darken'
    | 'mix-blend-lighten'
    | 'mix-blend-color-dodge'
    | 'mix-blend-color-burn'
    | 'mix-blend-hard-light'
    | 'mix-blend-soft-light'
    | 'mix-blend-difference'
    | 'mix-blend-exclusion'
    | 'mix-blend-hue'
    | 'mix-blend-saturation'
    | 'mix-blend-color'
    | 'mix-blend-luminosity'
    | 'mix-blend-plus-darker'
    | 'mix-blend-plus-lighter'
    | 'bg-blend-normal'
    | 'bg-blend-multiply'
    | 'bg-blend-screen'
    | 'bg-blend-overlay'
    | 'bg-blend-darken'
    | 'bg-blend-lighten'
    | 'bg-blend-color-dodge'
    | 'bg-blend-color-burn'
    | 'bg-blend-hard-light'
    | 'bg-blend-soft-light'
    | 'bg-blend-difference'
    | 'bg-blend-exclusion'
    | 'bg-blend-hue'
    | 'bg-blend-saturation'
    | 'bg-blend-color'
    | 'bg-blend-luminosity'
    | 'blur-none'
    | 'blur-sm'
    | 'blur'
    | 'blur-md'
    | 'blur-lg'
    | 'blur-xl'
    | 'blur-2xl'
    | 'blur-3xl'
    | 'brightness-0'
    | 'brightness-50'
    | 'brightness-75'
    | 'brightness-90'
    | 'brightness-95'
    | 'brightness-100'
    | 'brightness-105'
    | 'brightness-110'
    | 'brightness-125'
    | 'brightness-150'
    | 'brightness-200'
    | 'contrast-0'
    | 'contrast-50'
    | 'contrast-75'
    | 'contrast-100'
    | 'contrast-125'
    | 'contrast-150'
    | 'contrast-200'
    | 'drop-shadow-sm'
    | 'drop-shadow'
    | 'drop-shadow-md'
    | 'drop-shadow-lg'
    | 'drop-shadow-xl'
    | 'drop-shadow-2xl'
    | 'drop-shadow-none'
    | 'grayscale-0'
    | 'grayscale'
    | 'hue-rotate-0'
    | 'hue-rotate-15'
    | 'hue-rotate-30'
    | 'hue-rotate-60'
    | 'hue-rotate-90'
    | 'hue-rotate-180'
    | 'invert-0'
    | 'invert'
    | 'saturate-0'
    | 'saturate-50'
    | 'saturate-100'
    | 'saturate-150'
    | 'saturate-200'
    | 'sepia-0'
    | 'sepia'
    | 'backdrop-blur-none'
    | 'backdrop-blur-sm'
    | 'backdrop-blur'
    | 'backdrop-blur-md'
    | 'backdrop-blur-lg'
    | 'backdrop-blur-xl'
    | 'backdrop-blur-2xl'
    | 'backdrop-blur-3xl'
    | 'backdrop-brightness-0'
    | 'backdrop-brightness-50'
    | 'backdrop-brightness-75'
    | 'backdrop-brightness-90'
    | 'backdrop-brightness-95'
    | 'backdrop-brightness-100'
    | 'backdrop-brightness-105'
    | 'backdrop-brightness-110'
    | 'backdrop-brightness-125'
    | 'backdrop-brightness-150'
    | 'backdrop-brightness-200'
    | 'backdrop-contrast-0'
    | 'backdrop-contrast-50'
    | 'backdrop-contrast-75'
    | 'backdrop-contrast-100'
    | 'backdrop-contrast-125'
    | 'backdrop-contrast-150'
    | 'backdrop-contrast-200'
    | 'backdrop-grayscale-0'
    | 'backdrop-grayscale'
    | 'backdrop-hue-rotate-0'
    | 'backdrop-hue-rotate-15'
    | 'backdrop-hue-rotate-30'
    | 'backdrop-hue-rotate-60'
    | 'backdrop-hue-rotate-90'
    | 'backdrop-hue-rotate-180'
    | 'backdrop-invert-0'
    | 'backdrop-invert'
    | 'backdrop-opacity-0'
    | 'backdrop-opacity-5'
    | 'backdrop-opacity-10'
    | 'backdrop-opacity-15'
    | 'backdrop-opacity-20'
    | 'backdrop-opacity-25'
    | 'backdrop-opacity-30'
    | 'backdrop-opacity-35'
    | 'backdrop-opacity-40'
    | 'backdrop-opacity-45'
    | 'backdrop-opacity-50'
    | 'backdrop-opacity-55'
    | 'backdrop-opacity-60'
    | 'backdrop-opacity-65'
    | 'backdrop-opacity-70'
    | 'backdrop-opacity-75'
    | 'backdrop-opacity-80'
    | 'backdrop-opacity-85'
    | 'backdrop-opacity-90'
    | 'backdrop-opacity-95'
    | 'backdrop-opacity-100'
    | 'backdrop-saturate-0'
    | 'backdrop-saturate-50'
    | 'backdrop-saturate-100'
    | 'backdrop-saturate-150'
    | 'backdrop-saturate-200'
    | 'backdrop-sepia-0'
    | 'backdrop-sepia'
    | 'border-collapse'
    | 'border-separate'
    | \`border-spacing-\${BaseUnits}\`
    | \`border-spacing-x-\${BaseUnits}\`
    | \`border-spacing-y-\${BaseUnits}\`
    | 'table-auto'
    | 'table-fixed'
    | 'caption-top'
    | 'caption-bottom'
    | 'transition-none'
    | 'transition-all'
    | 'transition'
    | 'transition-colors'
    | 'transition-opacity'
    | 'transition-shadow'
    | 'transition-transform'
    | 'duration-0'
    | 'duration-75'
    | 'duration-100'
    | 'duration-150'
    | 'duration-200'
    | 'duration-300'
    | 'duration-500'
    | 'duration-700'
    | 'duration-1000'
    | 'ease-linear'
    | 'ease-in'
    | 'ease-out'
    | 'ease-in-out'
    | 'delay-0'
    | 'delay-75'
    | 'delay-100'
    | 'delay-150'
    | 'delay-200'
    | 'delay-300'
    | 'delay-500'
    | 'delay-700'
    | 'delay-1000'
    | 'animate-none'
    | 'animate-spin'
    | 'animate-ping'
    | 'animate-pulse'
    | 'animate-bounce'
    | 'scale-0'
    | 'scale-x-0'
    | 'scale-y-0'
    | 'scale-50'
    | 'scale-x-50'
    | 'scale-y-50'
    | 'scale-75'
    | 'scale-x-75'
    | 'scale-y-75'
    | 'scale-90'
    | 'scale-x-90'
    | 'scale-y-90'
    | 'scale-95'
    | 'scale-x-95'
    | 'scale-y-95'
    | 'scale-100'
    | 'scale-x-100'
    | 'scale-y-100'
    | 'scale-105'
    | 'scale-x-105'
    | 'scale-y-105'
    | 'scale-110'
    | 'scale-x-110'
    | 'scale-y-110'
    | 'scale-125'
    | 'scale-x-125'
    | 'scale-y-125'
    | 'scale-150'
    | 'scale-x-150'
    | 'scale-y-150'
    | 'rotate-0'
    | 'rotate-1'
    | 'rotate-2'
    | 'rotate-3'
    | 'rotate-6'
    | 'rotate-12'
    | 'rotate-45'
    | 'rotate-90'
    | 'rotate-180'
    | \`translate-x-\${BaseUnits}\`
    | \`translate-y-\${BaseUnits}\`
    | 'translate-x-1/2'
    | 'translate-x-1/3'
    | 'translate-x-2/3'
    | 'translate-x-1/4'
    | 'translate-x-2/4'
    | 'translate-x-3/4'
    | 'translate-x-full'
    | 'translate-y-1/2'
    | 'translate-y-1/3'
    | 'translate-y-2/3'
    | 'translate-y-1/4'
    | 'translate-y-2/4'
    | 'translate-y-3/4'
    | 'translate-y-full'
    | 'skew-x-0'
    | 'skew-y-0'
    | 'skew-x-1'
    | 'skew-y-1'
    | 'skew-x-2'
    | 'skew-y-2'
    | 'skew-x-3'
    | 'skew-y-3'
    | 'skew-x-6'
    | 'skew-y-6'
    | 'skew-x-12'
    | 'skew-y-12'
    | 'origin-center'
    | 'origin-top'
    | 'origin-top-right'
    | 'origin-right'
    | 'origin-bottom-right'
    | 'origin-bottom'
    | 'origin-bottom-left'
    | 'origin-left'
    | 'origin-top-left'
    | 'accent-inherit'
    | 'accent-current'
    | \`accent-\${ColorVariants}\`
    | 'accent-auto'
    | 'appearance-none'
    | 'appearance-auto'
    | 'cursor-auto'
    | 'cursor-default'
    | 'cursor-pointer'
    | 'cursor-wait'
    | 'cursor-text'
    | 'cursor-move'
    | 'cursor-help'
    | 'cursor-not-allowed'
    | 'cursor-none'
    | 'cursor-context-menu'
    | 'cursor-progress'
    | 'cursor-cell'
    | 'cursor-crosshair'
    | 'cursor-vertical-text'
    | 'cursor-alias'
    | 'cursor-copy'
    | 'cursor-no-drop'
    | 'cursor-grab'
    | 'cursor-grabbing'
    | 'cursor-all-scroll'
    | 'cursor-col-resize'
    | 'cursor-row-resize'
    | 'cursor-n-resize'
    | 'cursor-e-resize'
    | 'cursor-s-resize'
    | 'cursor-w-resize'
    | 'cursor-ne-resize'
    | 'cursor-nw-resize'
    | 'cursor-se-resize'
    | 'cursor-sw-resize'
    | 'cursor-ew-resize'
    | 'cursor-ns-resize'
    | 'cursor-nesw-resize'
    | 'cursor-nwse-resize'
    | 'cursor-zoom-in'
    | 'cursor-zoom-out'
    | 'caret-inherit'
    | 'caret-current'
    | \`caret-\${ColorVariants}\`
    | 'pointer-events-none'
    | 'pointer-events-auto'
    | 'resize-none'
    | 'resize-y'
    | 'resize-x'
    | 'resize'
    | 'scroll-auto'
    | 'scroll-smooth'
    | \`scroll-m-\${BaseUnits}\`
    | \`scroll-mx-\${BaseUnits}\`
    | \`scroll-my-\${BaseUnits}\`
    | \`scroll-ms-\${BaseUnits}\`
    | \`scroll-me-\${BaseUnits}\`
    | \`scroll-mt-\${BaseUnits}\`
    | \`scroll-mr-\${BaseUnits}\`
    | \`scroll-mb-\${BaseUnits}\`
    | \`scroll-ml-\${BaseUnits}\`
    | \`scroll-p-\${BaseUnits}\`
    | \`scroll-px-\${BaseUnits}\`
    | \`scroll-py-\${BaseUnits}\`
    | \`scroll-ps-\${BaseUnits}\`
    | \`scroll-pe-\${BaseUnits}\`
    | \`scroll-pt-\${BaseUnits}\`
    | \`scroll-pr-\${BaseUnits}\`
    | \`scroll-pb-\${BaseUnits}\`
    | \`scroll-pl-\${BaseUnits}\`
    | 'snap-start'
    | 'snap-end'
    | 'snap-center'
    | 'snap-align-none'
    | 'snap-normal'
    | 'snap-always'
    | 'snap-none'
    | 'snap-x'
    | 'snap-y'
    | 'snap-both'
    | 'snap-mandatory'
    | 'snap-proximity'
    | 'touch-auto'
    | 'touch-none'
    | 'touch-pan-x'
    | 'touch-pan-left'
    | 'touch-pan-right'
    | 'touch-pan-y'
    | 'touch-pan-up'
    | 'touch-pan-down'
    | 'touch-pinch-zoom'
    | 'touch-manipulation'
    | 'select-none'
    | 'select-text'
    | 'select-all'
    | 'select-auto'
    | 'will-change-auto'
    | 'will-change-scroll'
    | 'will-change-contents'
    | 'will-change-transform'
    | 'fill-none'
    | 'fill-inherit'
    | 'fill-current'
    | \`fill-\${ColorVariants}\`
    | 'stroke-none'
    | 'stroke-inherit'
    | 'stroke-current'
    | \`stroke-\${ColorVariants}\`
    | 'stroke-0'
    | 'stroke-1'
    | 'stroke-2'
    | 'sr-only'
    | 'not-sr-only'
    | 'forced-color-adjust-auto'
    | 'forced-color-adjust-none'
    | 'transform'
    | 'transform-none'
    | 'transform-gpu'
    | 'transform-cpu'
    | 'group'
    | 'peer';

  type ArbitraryVariantsAndModifiers =
    | \`min-[\${string}]\`
    | \`max-[\${string}]\`
    | \`supports-[\${string}]\`
    | \`aria-[\${string}]\`
    | \`data-[\${string}]\`;

  type VariantsAndModifiers =
    | 'hover'
    | 'focus'
    | 'focus-within'
    | 'focus-visible'
    | 'active'
    | 'visited'
    | 'target'
    | '*'
    | 'has'
    | 'first'
    | 'last'
    | 'only'
    | 'odd'
    | 'even'
    | 'first-of-type'
    | 'last-of-type'
    | 'only-of-type'
    | 'empty'
    | 'disabled'
    | 'enabled'
    | 'checked'
    | 'indeterminate'
    | 'default'
    | 'required'
    | 'valid'
    | 'invalid'
    | 'in-range'
    | 'out-of-range'
    | 'placeholder-shown'
    | 'autofill'
    | 'read-only'
    | 'before'
    | 'after'
    | 'first-letter'
    | 'first-line'
    | 'marker'
    | 'selection'
    | 'file'
    | 'backdrop'
    | 'placeholder'
    | 'sm'
    | 'md'
    | 'lg'
    | 'xl'
    | '2xl'
    | 'max-sm'
    | 'max-md'
    | 'max-lg'
    | 'max-xl'
    | 'max-2xl'
    | 'dark'
    | 'portrait'
    | 'landscape'
    | 'motion-safe'
    | 'motion-reduce'
    | 'contrast-more'
    | 'contrast-less'
    | 'print'
    | 'aria-checked'
    | 'aria-disabled'
    | 'aria-expanded'
    | 'aria-hidden'
    | 'aria-pressed'
    | 'aria-readonly'
    | 'aria-required'
    | 'aria-selected'
    | 'rtl'
    | 'ltr'
    | 'open';

  type Tokens = StandaloneClasses;
}

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
type ComputedVariable = () => string | number | boolean | null | undefined | object;

type TemplateLogicKeywords = '$if' | '$for';

declare type ClassesObject = {
  /** TODO: Tailwind tokens for styling */
  default?: Array<Tw.Tokens>;
  modifiers?: {
    [key in Tw.VariantsAndModifiers]?: Array<Tw.Tokens>;
  };
};

declare type ParameterizedStyleObject<ReplaceParams> = ClassesObject & {
  params: ReplaceParams;
};

declare type ClassesObjectWithIf = ClassesObject & {
  $if?: {
    [key in keyof Variables]?: ClassesObject;
  };
};

declare type GUI_Element = {
  [key in \`on\${keyof HTMLElementEventMap}\`]?: (
    e: HTMLElementEventMap[RemovePrefix<key, 'on'>]
  ) => void;
} & {
  /** The type of HTML element */
  type?: keyof HTMLElementTagNameMap;
  id?: string;
  classes?: Prettify<ClassesObjectWithIf>;
  /** TODO: The text that will be displayed inside the element */
  text?: string;
  /** An array of elements that will be inside this element
   *
   * @example TODO
   */
  children?: {
    [key: string]: DetermineGuiChildType<string>;
  };

  /** TODO: Documentation */
  transition?: {
    type: Transition;
    // on: 'intro' | 'outro' | 'both';
    easing?: Easing;
  };
};

type DetermineGuiChildType<T extends string> = T extends TemplateLogicKeywords
  ? {
      [name in keyof Variables]?: GUI_Element;
    }
  : GUI_Element;

declare interface GUI {
  /**
   * TODO: doc
   */
  [key: string]: DetermineGuiChildType<string>; // @replace
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
  scene?: {
    background?: string;
  };
}

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

declare interface Setup {
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
  functions: Prettify<Functions>;
  /**
   * TODO: doc
   */
  window: Prettify<WindowHandlers>;
  /**
   * The object that contains all the GUI elements that will be in the game
   */
  gui: Prettify<Partial<GUI>>;
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
    functions?: Prettify<Functions>;
    /**
     * TODO: doc
     */
    window?: Prettify<WindowHandlers>;
    /**
     * The object that contains all the GUI elements that will be in the game
     */
    gui?: Prettify<Partial<GUI>>;
  };
}

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
`
// @end

  return (
    generated_types + setup_declarations + static_types.replaceAll(DEFAULT_GUI_TYPE, gui_interface)
  );
}
