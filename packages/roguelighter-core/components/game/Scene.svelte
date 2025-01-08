<script module>
  interface Props {
    bg_asset_urls: BackgroundAssetUrls;
    agent_asset_urls: AgentAssetUrls;
    settings: Settings;
    scene: PlayableScene;
    agents: Agents;
    step: StepFunction;
    change_scene: (portal_info: Portal) => void;
    variables: any;
    functions: any;
    PROCESS: any;
    on_step_function_failed: Function;
  }
</script>

<script lang="ts">
  import type { Agents, Settings, StepFunction } from '../../types/game';
  import { T } from '@threlte/core';
  import Agent from './Agent.svelte';
  import { DEFAULT_CAMERA_ZOOM } from '../../constants';
  import type {
    AgentAssetUrls,
    BackgroundAssetUrls,
    PlayableScene,
    Portal
  } from '../../types/engine';
  import { Box3 } from 'three';
  import Floor from './Floor.svelte';

  let {
    bg_asset_urls,
    agent_asset_urls,
    settings,
    scene,
    change_scene,
    step,
    agents,
    variables = $bindable(),
    functions = $bindable(),
    PROCESS,
    on_step_function_failed
  }: Props = $props();

  let zoom = settings.camera?.zoom || DEFAULT_CAMERA_ZOOM;

  function calc_pos(pos: number, offsetX = 0, offsetY = 0): [number, number, number] {
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

  let agent_boxes: Array<Box3> = $state([]);
  let floor_boxes: Array<Box3> = $state([]);

  function check_collision() {
    return;
    // TODO: get data of the collided objects, fire an event
    // collision event could be handled here based on the subjects
    // oncollision_object[player]();
    // oncollision_object[coin]();
    // let collision tuples = [[player, coin]]

    for (let i = 0; i < agent_boxes.length; i++) {
      const agent_box = agent_boxes[i];
      for (let j = 0; j < agent_boxes.length; j++) {
        if (i !== j) {
          const other_box = agent_boxes[j];
          if (agent_box.intersectsBox(other_box)) {
            console.log(`Agent ${i} intersects with Agent ${j}`);
          }
        }
      }

      // FIXME: floors not firing collision events
      for (let k = 0; k < floor_boxes.length; k++) {
        const floor_box = floor_boxes[k];
        if (agent_box.intersectsBox(floor_box)) {
          console.log(`Agent ${i} intersects with Floor ${k}`);
        }
      }
    }
  }
</script>

{#each scene.backgrounds.entries() as [pos, texture], i}
  <Floor
    bind:box={floor_boxes[i]}
    {settings}
    position={calc_pos(pos)}
    texture_url={bg_asset_urls.get(texture) as string}
  ></Floor>
{/each}
{#each scene.agents.entries() as [pos, agent], i}
  <Agent
    bind:box={agent_boxes[i]}
    {scene}
    {agent_asset_urls}
    {agent}
    {settings}
    position={calc_pos(pos)}
    {check_collision}
    {step}
    {variables}
    {functions}
    {PROCESS}
    {on_step_function_failed}
  />
{/each}
