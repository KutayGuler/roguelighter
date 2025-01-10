import { exists, mkdir, readDir, type DirEntry } from '@tauri-apps/plugin-fs';
import type { PageLoad } from './$types';
import { DEFAULT_DIR, baseDir, PROJECTS_DIR } from '$lib/constants';
import { join } from '@tauri-apps/api/path';

async function process_entries_recursively(parent: string, entries: Array<DirEntry>) {
  let obj: { [key: string]: any } = {};

  for (const entry of entries) {
    if (entry.isDirectory) {
      const dir = await join(parent, entry.name);
      obj[entry.name] = await process_entries_recursively(dir, await readDir(dir, { baseDir }));
    } else {
      if (!obj[entry.name]) obj[entry.name] = {};
      obj[entry.name] = {};
    }
  }

  return obj;
}

export const load: PageLoad = async ({ parent, depends }) => {
  depends('page:projects');
  const parent_data = await parent();

  if (!(await exists(DEFAULT_DIR, { baseDir }))) {
    await mkdir(DEFAULT_DIR, { baseDir });
  }

  if (!(await exists(PROJECTS_DIR, { baseDir }))) {
    await mkdir(PROJECTS_DIR, { baseDir });
  }

  const folder_or_file_entries = await readDir(PROJECTS_DIR, { baseDir });
  const projects_dir = await join(parent_data.document_path, PROJECTS_DIR);
  const obj = await process_entries_recursively(projects_dir, folder_or_file_entries);

  let valid_project_names = new Set();

  for (let [key, val] of Object.entries(obj)) {
    if (!val || typeof val != 'object') continue;
    if ('data.json' in val && 'assets' in val) valid_project_names.add(key);
  }

  return {
    projects_dir,
    projects: (await readDir(PROJECTS_DIR, { baseDir })).filter(({ name }) =>
      valid_project_names.has(name)
    )
  };
};
