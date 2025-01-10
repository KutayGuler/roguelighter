<script module>
  interface Props {
    bg_asset_urls: BackgroundAssetUrls;
    agent_asset_urls: AgentAssetUrls;
    settings: Settings;
    scene: PlayableScene;
    agents: Agents;
    step: StepFunction;
    variables: any;
    functions: any;
    PROCESS: any;
    on_error: OnError;
  }
</script>

<script lang="ts">
  import type { Agents, Settings, StepFunction } from '../../types/game';
  import type {
    AgentAssetUrls,
    BackgroundAssetUrls,
    OnError,
    PlayableScene
  } from '../../types/engine';
  import Agent from './Agent.svelte';
  import Floor from './Floor.svelte';
  import { DEFAULT_CAMERA_ZOOM } from '../../constants';
  import { Box3 } from 'three';
  import { SvelteMap } from 'svelte/reactivity';

  let {
    bg_asset_urls,
    agent_asset_urls,
    settings,
    scene,
    step,
    agents,
    variables = $bindable(),
    functions = $bindable(),
    PROCESS,
    on_error
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

  let agent_components: { [pos: number]: any } = $state({});
  let agent_boxes: { [pos: number]: Box3 } = $state({});
  let bg_boxes: { [pos: number]: Box3 } = $state({});
  let aa_collisions = new SvelteMap<`${number}`, Set<`${number}`>>();
  let ab_collisions = new SvelteMap<`${number}`, Set<`${number}`>>();

  function check_collision() {
    // @ts-expect-error
    let agent_entries: [`${number}`, Box3][] = Object.entries(agent_boxes);
    // @ts-expect-error
    let bg_entries: [`${number}`, Box3][] = Object.entries(bg_boxes);

    for (let i = 0; i < agent_entries.length; i++) {
      const [id_1, agent_box_1] = agent_entries[i];

      // TODO: make agent collisions too

      for (let j = i + 1; j < agent_entries.length; j++) {
        const [id_2, agent_box_2] = agent_entries[j];

        if (agent_box_1.intersectsBox(agent_box_2)) {
          if (aa_collisions.has(id_1)) {
            let existing_set = aa_collisions.get(id_1);
            existing_set?.add(id_2);
            // @ts-expect-error
            aa_collisions.set(id_1, existing_set);
          } else {
            // @ts-expect-error
            aa_collisions.set(id_1, new Set(id_2));
          }
        } else {
          if (aa_collisions.has(id_1)) {
            let existing_set = aa_collisions.get(id_1);
            existing_set?.delete(id_2);
            // @ts-expect-error
            aa_collisions.set(id_1, existing_set);
          }
        }
      }

      for (let k = 0; k < bg_entries.length; k++) {
        const [bg_id, bg_box] = bg_entries[k];
        if (bg_box.intersectsBox(agent_box_1)) {
          if (ab_collisions.has(id_1)) {
            let existing_set = ab_collisions.get(id_1);

            if (!existing_set?.has(bg_id)) {
              existing_set?.add(bg_id);
              // @ts-expect-error
              ab_collisions.set(id_1, existing_set);

              agent_components[id_1].oncollision({
                id: +bg_id,
                type: 'background',
                name: scene.backgrounds.get(+bg_id)
              });
            }
          } else {
            // @ts-expect-error
            ab_collisions.set(id_1, new Set(bg_id));
          }
        } else if (ab_collisions.has(id_1)) {
          let existing_set = ab_collisions.get(id_1);

          if (existing_set?.has(bg_id)) {
            existing_set?.delete(bg_id);
            ab_collisions.set(id_1, existing_set);

            agent_components[id_1].onseparation({
              id: +bg_id,
              type: 'background',
              name: scene.backgrounds.get(+bg_id)
            });
          }
        }
      }
    }
  }

  const background_count = scene.backgrounds.size;
  let calculated_bg_count = $state(0);
  let all_positions_calculated = $state(false);

  function position_calculated() {
    calculated_bg_count++;

    if (calculated_bg_count == background_count) {
      all_positions_calculated = true;
    }
  }
</script>

{#each scene.backgrounds.entries() as [pos, texture]}
  <Floor
    {position_calculated}
    bind:box={bg_boxes[pos]}
    {settings}
    position={calc_pos(pos)}
    texture_url={bg_asset_urls.get(texture) as string}
  ></Floor>
{/each}
{#each scene.agents.entries() as [pos, agent]}
  <Agent
    bind:all_positions_calculated
    bind:this={agent_components[pos]}
    bind:box={agent_boxes[pos]}
    texture_url={agent_asset_urls.get(agent.name) as string}
    {agent}
    {settings}
    position={calc_pos(pos)}
    {check_collision}
    {step}
    {variables}
    {functions}
    {PROCESS}
    {on_error}
  />
{/each}
