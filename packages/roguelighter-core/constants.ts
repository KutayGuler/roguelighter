import { BaseDirectory } from '@tauri-apps/plugin-fs';
import { Setup } from './types/game';

export const DEFAULT_FRAME_COUNT = 1;
export const DEFAULT_FPS = 24;
export const DEFAULT_EASING = 'linear';
export const DEFAULT_DURATION = 400;
export const DEFAULT_MAP_WIDTH = 10;
export const DEFAULT_CAMERA_ZOOM = 20;
export const DEFAULT_DIR = 'roguelighter';
export const PROJECTS_DIR = `${DEFAULT_DIR}/projects`;
export const EXPORT_DIR = `${DEFAULT_DIR}/exports`;
export const baseDir = BaseDirectory.Document;
export const MAPS = ['backgrounds', 'agents', 'portals'];

export const CROSS = '🞫';

export const INTERNAL_TEXTS = ['$agent_avatar', '$agent_name', '$agent_text'];
export const TEMPLATE_FOR_LOOP = '$for';
export const TEMPLATE_IF_STATEMENT = '$if';
export const TEMPLATE_LOGIC = [TEMPLATE_FOR_LOOP, TEMPLATE_IF_STATEMENT];

export const DEFAULT_GUI_TYPE = '[key: string]: DetermineGuiChildType<string>; // @replace';
export const SETUP_NAME = 'setup';
export const SETUP_DECLARATION = `${SETUP_NAME} =`;

export const variables_regex = /\{([^\}]+)\}/g;
export const function_regex = /s*function\s*\([^)]*\)\s*\{[\s\S]*?\}/g;
export const TOAST_SETTINGS = {
  position: 'bottom-right'
} as const;

const PROCESS = {
  exit: () => {}
};

const _ = {
  is_paused: false
};

const $ = {
  toggle_pause: () => {
    _.is_paused = !_.is_paused;
  }
};

export const REPLACER = [
  [`'F_tp'`, `() => { _.is_paused = !_.is_paused;}`],
  [
    `'F_okd'`,
    `(e) => {
      if (e.code == \"Escape\") {
        $.toggle_pause();
      }
    }`
  ],
  [`'F_coc'`, `() => $.toggle_pause()`],
  [`'F_pe'`, `() => PROCESS.exit()`]
] as const;

const setup: Setup = {
  settings: {
    fps: 8,
    easing: 'sineOut',
    duration: 400,
    camera: {
      zoom: 9
    }
  },
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
    is_paused: false
  },
  functions: {
    // @ts-expect-error
    toggle_pause: 'F_tp'
  },
  window: {
    // @ts-expect-error
    onkeydown: 'F_okd'
  },
  gui: {
    $if: {
      // @ts-expect-error
      is_paused: {
        classes: {
          default: [
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
          ]
        },
        transition: { type: 'fade' },
        children: {
          continue: {
            type: 'button',
            classes: {
              default: ['bg-amber-200', 'font-bold', 'p-4', 'text-amber-600', 'w-1/2', 'rounded'],
              modifiers: {
                hover: ['bg-purple-200']
              }
            },
            // @ts-expect-error
            onclick: 'F_coc',
            text: 'Continue' // add variable {v.var_name}
          },
          exit: {
            type: 'button',
            classes: {
              default: ['bg-amber-200', 'font-bold', 'p-4', 'text-amber-600', 'w-1/2', 'rounded'],
              modifiers: {
                hover: ['bg-purple-200']
              }
            },
            // @ts-expect-error
            onclick: 'F_pe',
            text: 'Exit' // add variable {v.var_name}
          }
        }
      }
    }
  }
};

export { setup as template_json_code };
