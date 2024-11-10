import { exists, mkdir, readDir } from '@tauri-apps/plugin-fs';
import type { PageLoad } from './$types';
import { DEFAULT_DIR, baseDir, PROJECTS_DIR } from '$lib/constants';
import { join } from '@tauri-apps/api/path';

export const load: PageLoad = async ({ parent, depends }) => {
  console.log('load');

  depends('page:projects');
  const parent_data = await parent();

  if (!(await exists(DEFAULT_DIR, { baseDir }))) {
    await mkdir(DEFAULT_DIR, { baseDir });
  }

  if (!(await exists(PROJECTS_DIR, { baseDir }))) {
    await mkdir(PROJECTS_DIR, { baseDir });
  }

  // TODO: check for /assets & data.json

  return {
    projects_dir: await join(parent_data.document_path, PROJECTS_DIR),
    projects: (await readDir(PROJECTS_DIR, { baseDir })).filter(({ isDirectory }) => isDirectory)
  };
};
