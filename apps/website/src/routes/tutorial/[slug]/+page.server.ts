import { read } from '$app/server';
import type { PageServerLoad } from './$types';
import { mapper } from '$lib/server/tutorial';
import type { TutorialJson } from '$lib/types';
import { template_json_code, json_to_code_string, type Scene } from 'roguelighter-core/utils';

export const load: PageServerLoad = async ({ params }) => {
  const slug = params.slug;
  const mdFile = read(`/src/tutorials/${mapper[slug]}/index.md`);
  const jsonFile = read(`/src/tutorials/${mapper[slug]}/index.json`);

  let [markdown, tutorial]: [any, TutorialJson] = await Promise.all([
    mdFile.text(),
    jsonFile.json()
  ]);

  const template_code_string = json_to_code_string(template_json_code);
  const solution_code_string = json_to_code_string({
    ...template_json_code,
    ...tutorial.solution_object
  });

  tutorial.project.code = template_code_string;
  tutorial.project.scenes = new Map(tutorial.project.scenes);
  // @ts-expect-error
  let scene = tutorial.project.scenes.get(0) as Scene;
  scene.backgrounds = new Map(scene?.backgrounds);
  scene.agents = new Map(scene?.agents);
  scene.portals = new Map();
  // @ts-expect-error
  tutorial.project.agent_asset_urls = new Map(tutorial.project.agent_asset_urls);
  // @ts-expect-error
  tutorial.project.bg_asset_urls = new Map(tutorial.project.bg_asset_urls);

  return {
    markdown,
    tutorial,
    template_code_string,
    solution_code_string
  };
};
