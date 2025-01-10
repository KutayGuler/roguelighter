<script module>
  interface Props {
    agent: PlayableAgent<'player'>;
    box: THREE.Box3;
    settings: Settings;
    texture_url: string;
    position: [number, number, number];
    check_collision: Function;
    step: StepFunction;
    variables: any;
    functions: any;
    PROCESS: any;
    on_error: OnError;
    all_positions_calculated: boolean;
  }
</script>

<script lang="ts">
  import { T, useTask } from '@threlte/core';
  import { DEFAULT_FRAME_COUNT, DEFAULT_FPS } from '../../constants';
  import * as THREE from 'three';
  import type { OnError, PlayableAgent } from '../../types/engine';
  import type {
    CollisionEvent,
    Settings,
    SpatialData,
    SpriteConfig,
    StepFunction
  } from '../../types/game';

  let {
    agent,
    box = $bindable(),
    settings,
    texture_url,
    position: initial_position,
    check_collision,
    step,
    variables,
    functions,
    PROCESS,
    on_error,
    all_positions_calculated
  }: Props = $props();

  let spatial_data: SpatialData = $state({
    position: initial_position,
    rotation: [0, 0, 0]
  });

  const states = agent.states as SpriteConfig;

  let current_state = $state('idle');
  // @ts-expect-error
  let _state = $derived(states[current_state]);
  let fps = $derived(_state?.fps || settings?.fps || DEFAULT_FPS);
  let filter = $derived(_state?.filter || settings?.filter || 'nearest');
  let frame_count = $derived(_state?.frame_count || DEFAULT_FRAME_COUNT);
  let current_frame = $state(1);

  let map = new THREE.TextureLoader().load(texture_url, (texture) => {
    texture.colorSpace = THREE.DisplayP3ColorSpace;
    texture.minFilter = filter == 'nearest' ? THREE.NearestFilter : THREE.LinearFilter;
    texture.magFilter = filter == 'nearest' ? THREE.NearestFilter : THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping; // prevents texture bleeding
    texture.wrapT = THREE.ClampToEdgeWrapping; // prevents texture bleeding
    texture.repeat.set(1 / frame_count, current_frame);
  });

  let t = $state(0);
  let _box = $state(new THREE.Box3());
  let sprite = $state(new THREE.Sprite(new THREE.SpriteMaterial({ map: map, color: 0xffffff })));

  sprite.scale.set(1, 1, 1);
  sprite.geometry.computeBoundingBox();

  // TODO: add destroy function
  let separation_queue: Array<CollisionEvent> = $state([]);
  let collision_queue: Array<CollisionEvent> = $state([]);

  export function oncollision(info: any) {
    if (!all_positions_calculated) return;

    collision_queue.push(info);
  }

  export function onseparation(info: CollisionEvent) {
    if (!all_positions_calculated) return;

    separation_queue.push(info);
  }

  let first_frame_ran = $state(false);

  const { stop } = useTask(
    (delta: number) => {
      t += delta;

      try {
        while (collision_queue.length > 0) {
          const info = collision_queue.shift();
          // @ts-expect-error
          agent.oncollision(delta, info, variables, functions, PROCESS);
        }
      } catch (e) {
        on_error('COLLISION_HANDLER_FAILED', e);
        stop();
      }

      try {
        while (separation_queue.length > 0) {
          const info = separation_queue.shift();
          // @ts-expect-error
          agent.onseparation(delta, info, variables, functions, PROCESS);
        }
      } catch (e) {
        on_error('SEPARATION_HANDLER_FAILED', e);
        stop();
      }

      try {
        // @ts-expect-error
        step(delta, spatial_data, variables, functions, PROCESS);
      } catch (e) {
        on_error('STEP_FUNCTION_FAILED', e);
        stop();
      }

      // @ts-expect-error
      _box.copy(sprite.geometry.boundingBox).applyMatrix4(sprite.matrixWorld);
      box = _box;
      check_collision();

      if (t > 1 / fps) {
        current_frame = (current_frame + 1) % frame_count;
        map.offset.x = current_frame / frame_count;
        t = 0;
      }

      first_frame_ran = true;
    },
    { autoStart: agent.name == 'player' }
  );
</script>

<T is={sprite} position={spatial_data.position} rotation={spatial_data.rotation}></T>
