import type { PageLoad } from './$types';

import { exists, readTextFile } from '@tauri-apps/plugin-fs';
import { PROJECTS_DIR, MAPS, baseDir, type RoguelighterProject, REPLACER } from 'roguelighter-core';
import JSON5 from 'json5';
import { SvelteMap } from 'svelte/reactivity';
import { fail } from '@sveltejs/kit';

export const load: PageLoad = async ({ params, url }) => {
  const data_file_path = `${PROJECTS_DIR}\\${params.name}\\data.json`;

  if (!exists(data_file_path, { baseDir })) {
    fail(400, { message: 'data.json does not exist' });
  }

  try {
    const res = await readTextFile(data_file_path, { baseDir });
    let parsed: RoguelighterProject = JSON5.parse(res);
    parsed.name = params.name;
    // @ts-expect-error
    parsed.scenes = parsed.scenes.length ? new SvelteMap(parsed.scenes) : new SvelteMap();

    if (url.searchParams.has('initial')) {
      for (let [to_be_replaced, new_code] of REPLACER) {
        parsed.code = parsed.code.replaceAll(to_be_replaced, new_code);
      }
    }

    for (let scene of parsed.scenes.values()) {
      for (let map of MAPS) {
        // @ts-expect-error
        scene[map] =
          // @ts-expect-error
          Array.isArray(scene[map]) && scene[map].length
            ? // @ts-expect-error
              new SvelteMap(scene[map])
            : new SvelteMap();
      }
    }

    return {
      project: parsed
    };
  } catch (e) {
    fail(400, { message: 'Failed to read or parse data.json' });
  }
};
