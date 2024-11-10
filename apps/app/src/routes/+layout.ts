import { documentDir } from '@tauri-apps/api/path';
import type { LayoutLoad } from './$types';

export const ssr = false;
export const prerender = true;

export const load: LayoutLoad = async () => {
  return {
    document_path: await documentDir()
  };
};
