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
    on_step_function_failed: Function;
  }
</script>

<script lang="ts">
  import { T, useTask, useThrelte } from '@threlte/core';
  import { DEFAULT_FRAME_COUNT, DEFAULT_FPS, DEFAULT_CAMERA_ZOOM } from '../../constants';
  import * as THREE from 'three';
  import type { PlayableAgent } from '../../types/engine';
  import type { Settings, SpatialData, SpriteConfig, StepFunction } from '../../types/game';
  const { camera } = useThrelte();

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
    on_step_function_failed
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

  (async () => {
    let xd = await fetch('yarro');
    let x = new Response({});
  })();

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

  $camera.position.z = 100 / (settings.camera?.zoom || DEFAULT_CAMERA_ZOOM);

  // TODO: event handler oncollision
  // TODO: add destroy function

  const { stop } = useTask(
    (delta: number) => {
      t += delta;

      try {
        // @ts-expect-error
        step(delta, spatial_data, variables, functions, PROCESS);
      } catch (e) {
        on_step_function_failed(e);
        stop();
      }

      _box.copy(sprite.geometry.boundingBox).applyMatrix4(sprite.matrixWorld);
      box = _box;
      check_collision();

      if (t > 1 / fps) {
        current_frame = (current_frame + 1) % frame_count;
        map.offset.x = current_frame / frame_count;
        t = 0;
      }
    },
    { autoStart: agent.name == 'player' }
  );
</script>

<T is={sprite} position={spatial_data.position} rotation={spatial_data.rotation}></T>
