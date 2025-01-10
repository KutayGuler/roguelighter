import { browser } from '$app/environment';
import type { LayoutLoad } from './$types';
import RunCSS from 'runcss';

export const load: LayoutLoad = async () => {
  if (!browser) return;

  const { processClasses: process_classes, exportCSS } = RunCSS();

  return {
    process_classes,
    exportCSS
  };
};
