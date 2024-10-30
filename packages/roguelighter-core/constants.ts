import { documentDir } from '@tauri-apps/api/path';
import { BaseDirectory } from '@tauri-apps/plugin-fs';

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

async function _getDocumentDir() {
  const documentDirPath = await documentDir();
  return documentDirPath;
}

export const documentDirPromise = _getDocumentDir();
