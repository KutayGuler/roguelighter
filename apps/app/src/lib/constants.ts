import { BaseDirectory } from '@tauri-apps/plugin-fs';

export const DEFAULT_DIR = 'roguelighter';
export const PROJECTS_DIR = `${DEFAULT_DIR}/projects`;
export const baseDir = BaseDirectory.Document;
