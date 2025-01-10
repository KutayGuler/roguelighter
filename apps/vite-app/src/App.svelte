<script lang="ts">
  import { Game, MAPS, noop, PLATFORMS } from 'roguelighter-core';
  import { config } from '../roguelighter.config';
  import * as project from './lib/data.json';
  import { SvelteMap } from 'svelte/reactivity';

  async function get_on_exit() {
    if (config.platform == PLATFORMS.WEB) {
      return noop;
    }

    const { exit } = await import('@tauri-apps/plugin-process');
    return exit;
  }

  const agent_asset_urls = new Map([['player', './assets/agents/elf_idle.png']]);
  const bg_asset_urls = new Map([['floor_1', './assets/backgrounds/floors/floor_1.png']]);

  let transformed_project = JSON.parse(JSON.stringify(project));

  transformed_project.scenes = transformed_project.scenes.length
    ? new SvelteMap(transformed_project.scenes)
    : new SvelteMap();

  for (let scene of transformed_project.scenes.values()) {
    for (let map of MAPS) {
      scene[map] =
        Array.isArray(scene[map]) && scene[map].length
          ? new SvelteMap(scene[map])
          : new SvelteMap();
    }
  }
</script>

{#await get_on_exit() then on_exit}
  <Game project={transformed_project} {bg_asset_urls} {agent_asset_urls} {on_exit} on_error={noop}
  ></Game>
{/await}
