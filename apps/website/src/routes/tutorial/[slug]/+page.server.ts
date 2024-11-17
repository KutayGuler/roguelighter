import { read } from '$app/server';
import type { PageServerLoad } from './$types';
import { mapper } from '$lib/server/tutorial';
import type { TutorialJson } from '$lib/types';

export const load: PageServerLoad = async ({ params }) => {
  const slug = params.slug;
  const mdFile = read(`/src/tutorials/${mapper[slug]}/index.md`);
  const jsonFile = read(`/src/tutorials/${mapper[slug]}/index.json`);

  const [markdown, tutorial]: [any, TutorialJson] = await Promise.all([
    mdFile.text(),
    jsonFile.json()
  ]);

  return {
    markdown,
    tutorial
  };
};
