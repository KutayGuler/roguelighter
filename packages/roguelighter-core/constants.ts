import { BaseDirectory } from '@tauri-apps/api/fs';

export const DEFAULT_FRAME_COUNT = 1;
export const DEFAULT_FPS = 24;
export const DEFAULT_EASING = 'linear';
export const DEFAULT_DURATION = 400;
export const DEFAULT_MAP_WIDTH = 10;
export const DEFAULT_CAMERA_ZOOM = 20;
export const DEFAULT_DIR = 'Roguelighter Projects';
export const DEFAULT_EXPORT_DIR = 'Roguelighter Exports';
export const dir = BaseDirectory.Document;
export const MAPS = ['backgrounds', 'agents', 'portals'];

export const CROSS = '🞫';

export const INTERNAL_EVENTS = [
  '$open_pause_menu',
  '$close_pause_menu',
  '$toggle_pause_menu',
  '$exit'
];
export const INTERNAL_TEXTS = ['$agent_avatar', '$agent_name', '$agent_text'];
export const INTERNAL_GUI = ['$pause_menu'];

export const variables_regex = /\$var\(([^)]+)\)/g;
export const function_regex = /s*function\s*\([^)]*\)\s*\{[\s\S]*?\}/g;
