<script lang="ts">
  import { Game, noop, PLATFORMS } from 'roguelighter-core';
  import { config } from '../../roguelighter.config';
  import * as project from '$lib/data.json';

  async function get_on_exit() {
    if (config.platform == PLATFORMS.WEB) {
      return noop;
    }

    const { exit } = await import('@tauri-apps/plugin-process');
    return exit;
  }

  const agent_asset_urls = new Map([['player', '/assets/agents/elf_idle.png']]);
  const bg_asset_urls = new Map([['floor', '/assets/backgrounds/floors/floor_1.png']]);
</script>

{#await get_on_exit() then on_exit}
  <Game {project} {bg_asset_urls} {agent_asset_urls} {on_exit} on_error={noop}></Game>
{/await}
