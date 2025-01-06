<script module>
  interface Props {
    agent: PlayableAgent<'player'>;
    box: THREE.Box3;
    is_first: boolean;
    is_player: boolean;
    settings: Settings;
    agent_asset_urls: AgentAssetUrls;
    position: [number, number, number];
    check_collision: Function;
  }
</script>

<script lang="ts">
  import { T, useTask, useThrelte } from '@threlte/core';
  import { DEFAULT_FRAME_COUNT, DEFAULT_FPS, DEFAULT_CAMERA_ZOOM } from '../../constants';
  import * as THREE from 'three';
  import { noop } from '../../utils';
  import type { AgentAssetUrls, PlayableAgent } from '../../types/engine';
  import type { Settings, SpriteConfig } from '../../types/game';
  const { camera } = useThrelte();

  let {
    is_first,
    agent,
    box = $bindable(),
    is_player,
    settings,
    agent_asset_urls,
    position: initial_position,
    check_collision
  }: Props = $props();

  console.log(agent);

  const states = agent.states as SpriteConfig;

  let texture_url = agent_asset_urls.get(agent.name) as string;
  console.log(agent_asset_urls);
  console.log(texture_url);
  let current_state = $state('idle');
  // @ts-expect-error
  let _state = $derived(states[current_state]);
  let fps = $derived(_state?.fps || settings?.fps || DEFAULT_FPS);
  let filter = $derived(_state?.filter || settings?.filter || 'nearest');
  let frame_count = $derived(_state?.frame_count || DEFAULT_FRAME_COUNT);
  let current_frame = $state(1);

  let map = new THREE.TextureLoader().load(texture_url, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = filter == 'nearest' ? THREE.NearestFilter : THREE.LinearFilter;
    texture.magFilter = filter == 'nearest' ? THREE.NearestFilter : THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping; // prevents texture bleeding
    texture.wrapT = THREE.ClampToEdgeWrapping; // prevents texture bleeding
    texture.repeat.set(1 / frame_count, current_frame);
  });

  let position = $state([0, 0, 0]);
  let t = $state(0);
  let _box = $state(new THREE.Box3());
  let sprite = $state(new THREE.Sprite(new THREE.SpriteMaterial({ map: map, color: 0xffffff })));

  sprite.scale.set(1, 1, 1);
  sprite.geometry.computeBoundingBox();

  $camera.position.z = 100 / (settings.camera?.zoom || DEFAULT_CAMERA_ZOOM);

  const handleKeydown = (e: KeyboardEvent) => {};

  const handleKeyup = (e: KeyboardEvent) => {};

  const { start, stop } = useTask((delta: number) => {
    t += delta;

    // event handling

    _box.copy(sprite.geometry.boundingBox).applyMatrix4(sprite.matrixWorld);
    box = _box;
    check_collision();

    if (t > 1 / fps) {
      current_frame = (current_frame + 1) % frame_count;
      map.offset.x = current_frame / frame_count;
      t = 0;
    }
  });

  if (is_first) {
    start();
  }
</script>

<svelte:window
  onkeydown={is_player ? handleKeydown : noop}
  onkeyup={is_player ? handleKeyup : noop}
/>

<T is={sprite} {position}></T>
