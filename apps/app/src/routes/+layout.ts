import { documentDir } from '@tauri-apps/api/path';
import type { LayoutLoad } from './$types';
import RunCSS from 'runcss';

export const ssr = false;
export const prerender = true;

export const load: LayoutLoad = async () => {
  const { processClasses: process_classes, exportCSS } = RunCSS();

  return {
    document_path: await documentDir(),
    process_classes,
    exportCSS
  };
};
