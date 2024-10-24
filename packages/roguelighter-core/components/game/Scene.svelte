<script module>
    interface Props {
    bg_asset_urls: BackgroundAssetUrls;
    agent_asset_urls: AgentAssetUrls;
    settings: Settings;
    scene: PlayableScene;
    scene_just_changed: boolean;
    player_pos: number;
    change_scene: (portal_info: Portal) => void
  }
</script>

<script lang="ts">
  import type { Settings } from '../../types/game';
  import { T, useTask, useThrelte } from '@threlte/core';
  import { AnimatedSpriteMaterial } from '@threlte/extras';
  import Agent from './Agent.svelte';
  import { DEFAULT_CAMERA_ZOOM } from '../../constants';
  import type {
    AgentAssetUrls,
    BackgroundAssetUrls,
    PlayableScene,
    Portal
  } from '../../types/engine';

  let {
    bg_asset_urls,
    agent_asset_urls,
    settings,
    scene,
    scene_just_changed,
    player_pos,
    change_scene
  }: Props = $props();

  let zoom = settings.camera?.zoom || DEFAULT_CAMERA_ZOOM;

  useTask(() => {
    if (!scene_just_changed && scene.portals.has(player_pos)) {
      const portal_info = scene.portals.get(player_pos) as Portal;
      change_scene(portal_info);
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
