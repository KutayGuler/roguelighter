<script module>
  interface Props {
    bg_asset_urls: BackgroundAssetUrls;
    agent_asset_urls: AgentAssetUrls;
    settings: Settings;
    scene: PlayableScene;
    agents: Agents;
    change_scene: (portal_info: Portal) => void;
  }
</script>

<script lang="ts">
  import type { Agents, Settings } from '../../types/game';
  import { T, useTask } from '@threlte/core';
  import { AnimatedSpriteMaterial } from '@threlte/extras';
  // import { Collider, AutoColliders, useRapier, RigidBody } from '@threlte/rapier';
  import Agent from './Agent.svelte';
  import { DEFAULT_CAMERA_ZOOM } from '../../constants';
  import type {
    AgentAssetUrls,
    BackgroundAssetUrls,
    PlayableScene,
    Portal
  } from '../../types/engine';
  import { Box3 } from 'three';

  // const { world } = useRapier();
  // world.gravity = { x: 0, y: 0, z: 0 };

  let { bg_asset_urls, agent_asset_urls, settings, scene, change_scene, agents }: Props = $props();

  let zoom = settings.camera?.zoom || DEFAULT_CAMERA_ZOOM;

  function calc_pos(pos: number, offsetX = 0, offsetY = 0): [number, number, number] {
    console.log(pos);
    return [(pos % scene.width) + offsetX, -Math.floor(pos / scene.width) + offsetY, 0];
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

  let boxes: Array<Box3> = [];

  function check_collision() {
    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i];
      for (let j = 0; j < boxes.length; j++) {
        if (i !== j) {
          const other_box = boxes[j];
          if (box.intersectsBox(other_box)) {
            console.log(`Box ${i} intersects with Box ${j}`);
          }
        }
      }
    }
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
{#each scene.agents.entries() as [pos, agent], i}
  <Agent
    bind:box={boxes[i]}
    {scene}
    {agent_asset_urls}
    {agent}
    {settings}
    position={calc_pos(pos)}
    {check_collision}
  />
{/each}
