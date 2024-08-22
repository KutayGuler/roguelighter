<script lang="ts">
  import type { Settings } from '../../types/game';
  import { T, useTask, useThrelte } from '@threlte/core';
  import { AnimatedSpriteMaterial } from '@threlte/extras';
  import Agent from './Agent.svelte';
  import { createEventDispatcher } from 'svelte';
  import { DEFAULT_CAMERA_ZOOM } from '../../constants';
  import type {
    AgentAssetUrls,
    BackgroundAssetUrls,
    PlayableScene,
    Portal
  } from '../../types/engine';
  const dispatch = createEventDispatcher();

  export let bg_asset_urls: BackgroundAssetUrls;
  export let agent_asset_urls: AgentAssetUrls;
  export let settings: Settings;
  export let scene: PlayableScene;
  export let scene_just_changed: boolean;
  export let player_pos: number;

  let zoom = settings.camera?.zoom || DEFAULT_CAMERA_ZOOM;

  useTask(() => {
    if (!scene_just_changed && scene.portals.has(player_pos)) {
      const portal_info = scene.portals.get(player_pos) as Portal;
      dispatch('change_scene', portal_info);
    }
  });

  function calc_pos(pos: number): [number, number, number] {
    return [pos % scene.width, -Math.floor(pos / scene.width), zoom];
  }
</script>

<T.PerspectiveCamera />
<T.DirectionalLight />
{#each scene.backgrounds.entries() as [pos, texture]}
  {@const textureUrl = bg_asset_urls.get(texture)}
  {#if textureUrl}
    <T.Sprite position={calc_pos(pos)}>
      <AnimatedSpriteMaterial autoplay={false} {textureUrl} totalFrames={1} />
      <T.PlaneGeometry></T.PlaneGeometry>
    </T.Sprite>
  {/if}
{/each}
{#each scene.agents.entries() as [pos, agent]}
  <Agent {agent_asset_urls} {agent} {settings} position={calc_pos(pos)} />
{/each}
