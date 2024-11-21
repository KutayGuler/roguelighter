<script module>
  interface Props {
    bg_asset_urls: BackgroundAssetUrls;
    agent_asset_urls: AgentAssetUrls;
    settings: Settings;
    scene: PlayableScene;
    scene_just_changed: boolean;
    player_pos: number;
    change_scene: (portal_info: Portal) => void;
  }
</script>

<script lang="ts">
  import type { Settings } from '../../types/game';
  import { T, useTask } from '@threlte/core';
  import { AnimatedSpriteMaterial } from '@threlte/extras';
  // import { Collider } from '@threlte/rapier'
  import { DEG2RAD } from 'three/src/math/MathUtils.js';
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

  function calc_pos(pos: number, offsetX = 0, offsetY = 0): [number, number, number] {
    return [(pos % scene.width) + offsetX, -Math.floor(pos / scene.width) + offsetY, zoom];
  }

  let all_empty_cells = new Set<number>();
  const { width, height } = scene;

  for (let [pos, val] of scene.backgrounds.entries()) {
    const values = [pos + 1, pos - 1, pos + width, pos - width];
    const neighbors = values.map((pos) => scene.backgrounds.get(pos) || pos);

    const empty_cells = new Set(neighbors.filter((n) => typeof n == 'number' && n > 0));
    if (!empty_cells.size) continue;

    for (let pos of empty_cells.values()) {
      all_empty_cells.add(pos);
    }
  }

  let offsets = new Map<number, [x1: number, y1: number, x2: number, y2: number]>();

  for (let i = 0; i <= width * height; i += width) {
    all_empty_cells.add(i);
    offsets.set(i, [-1, 1, width, 1]);
  }

  for (let i = 0; i < width; i++) {
    all_empty_cells.add(i);
    offsets.set(i, [0, 1, 0, -height]);
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
<!-- TODO: create an experiment repo -->
<!-- TODO: make this invisible -->
<!-- TODO: make this collide with the player -->
<!-- FIXME: the algorithm -->
{#each all_empty_cells as pos}
  {@const o = offsets.get(pos)}
  <T.Mesh position={calc_pos(pos, o?.[0] || 0, o?.[1] || 0)}>
    <T.BoxGeometry />
    <T.MeshBasicMaterial />
  </T.Mesh>
  <T.Mesh position={calc_pos(pos, o?.[2] || 0, o?.[3] || 0)}>
    <T.BoxGeometry />
    <T.MeshBasicMaterial />
  </T.Mesh>
{/each}
