import { exists, mkdir, readDir } from '@tauri-apps/plugin-fs';
import type { PageLoad } from './$types';
import { BaseDirectory } from '@tauri-apps/plugin-fs';

const DEFAULT_DIR = 'roguelighter';
const PROJECTS_DIR = `${DEFAULT_DIR}/projects`;
const baseDir = BaseDirectory.Document;

export const load: PageLoad = async () => {
  if (!(await exists(DEFAULT_DIR, { baseDir }))) {
    await mkdir(DEFAULT_DIR, { baseDir });
  }

  if (!(await exists(PROJECTS_DIR, { baseDir }))) {
    await mkdir(PROJECTS_DIR, { baseDir });
  }

  return {
    projects: await readDir(PROJECTS_DIR, { baseDir })
  };
};
