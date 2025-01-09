import { BaseDirectory } from '@tauri-apps/plugin-fs';
import { Setup } from './types/game';

export const PLATFORMS = {
  WINDOWS: 'windows',
  WEB: 'web'
};

export const DEFAULT_SCENE_ID = 0;
export const DEFAULT_SCENE_INDEX = -1;
export const DEFAULT_FRAME_COUNT = 1;
export const DEFAULT_FPS = 8;
export const DEFAULT_EASING = 'linear';
export const DEFAULT_DURATION = 400;
export const DEFAULT_MAP_WIDTH = 10;
export const DEFAULT_CAMERA_ZOOM = 10;
export const DEFAULT_DIR = 'roguelighter';
export const PROJECTS_DIR = `${DEFAULT_DIR}/projects`;
export const EXPORT_DIR = `${DEFAULT_DIR}/exports`;
export const baseDir = BaseDirectory.Document;
export const MAPS = ['backgrounds', 'agents'];

export const CROSS = '🞫';

export const INTERNAL_TEXTS = ['$agent_avatar', '$agent_name', '$agent_text'];
export const TEMPLATE_FOR_LOOP = '$for';
export const TEMPLATE_IF_STATEMENT = '$if';
export const TEMPLATE_LOGIC = [TEMPLATE_FOR_LOOP, TEMPLATE_IF_STATEMENT] as const;

export const DEFAULT_GUI_TYPE = '[key: string]: DetermineGuiChildType<string>; // @replace';
export const SETUP_NAME = 'setup';
export const SETUP_DECLARATION = `${SETUP_NAME} =`;

export const variables_regex = /\{([^\}]+)\}/g;
export const function_regex = /s*function\s*\([^)]*\)\s*\{[\s\S]*?\}/g;
export const TOAST_SETTINGS = {
  position: 'bottom-right'
} as const;

export const VARIABLES_IDENTIFIER = '_';
export const FUNCTIONS_IDENTIFIER = '$';
export const PROCESS_IDENTIFIER = 'PROCESS';

export const ERROR_MESSAGES = {
  STEP_FUNCTION_FAILED: 'Step function failed to execute: ',
  WINDOW_HANDLER_FAILED: 'Window handler failed to execute: ',
  NO_SCENE_IS_SELECTED: 'No scene is selected, cannot start the game'
} as const;

export const REPLACER = [[`'F_step'`, '(delta, $player) => {}']] as const;

const setup: Setup = {
  settings: {},
  agents: {},
  variables: {},
  functions: {},
  // @ts-expect-error
  step: 'F_step',
  window: {},
  gui: {}
};

export { setup as template_json_code };
