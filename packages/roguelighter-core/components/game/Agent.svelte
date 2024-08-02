<script lang="ts">
  import { T, useTask } from '@threlte/core';
  import { AnimatedSpriteMaterial, Suspense } from '@threlte/extras';
  import { DEFAULT_FRAME_COUNT, DEFAULT_FPS, DEFAULT_CAMERA_ZOOM } from '../../constants';
  import type { Settings, PlayableAgent, AgentAssetUrls } from '../../types';
  import { Mesh, MeshStandardMaterial } from 'three';

  export let agent: PlayableAgent;
  export let settings: Settings;
  export let agent_asset_urls: AgentAssetUrls;

  let play: () => void, pause: () => void;
  window.addEventListener('paused', () => {});
  window.addEventListener('unpaused', () => {});

  const states = agent.states;
  const defaults = states.default;

  let textureUrl = agent_asset_urls.get(agent.name)?.default;
  let totalFrames = defaults.frame_count || DEFAULT_FRAME_COUNT;
  let fps = defaults.fps || settings?.fps || DEFAULT_FPS;
  let columns = defaults.columns;
  let rows = defaults.rows;
  let startFrame = defaults.start_frame;
  let endFrame = defaults.end_frame;
  let delay = defaults.delay;
  let filter = defaults.filter || settings.filter || 'nearest';

  let zoom = settings.camera?.zoom || DEFAULT_CAMERA_ZOOM;

  const keyboard = { x: 0, y: 0 };
  const pressed = new Set<string>();
  export const playerPosition: [number, number, number] = [-2.0, 1.75, zoom];
  const mesh = new Mesh();
  mesh.position.set(...playerPosition);

  const handleKey = (key: string, value: 0 | 1) => {
    switch (key.toLowerCase()) {
      case 'a':
      case 'arrowleft':
        return (keyboard.x = +value);
      case 'd':
      case 'arrowright':
        return (keyboard.x = -value);
      case 'w':
      case 'arrowup':
        return (keyboard.y = -value);
      case 's':
      case 'arrowdown':
        return (keyboard.y = +value);
    }
    return;
  };

  // TODO: player should be able to define keybindings

  const handleKeydown = (e: KeyboardEvent) => {
    pressed.add(e.key);
    pressed.forEach((key) => handleKey(key, 1));
  };

  const handleKeyup = (e: KeyboardEvent) => {
    pressed.delete(e.key);
    handleKey(e.key, 0);
    pressed.forEach((key) => handleKey(key, 1));
    if (e.key === 'q') play();
    if (e.key === 'e') pause();
  };

  useTask((delta) => {
    // if (keyboard.x === 0) return;
    playerPosition[0] += -keyboard.x * (delta * 2);
    playerPosition[1] += -keyboard.y * (delta * 2);
    mesh.position.set(...playerPosition);
  });
</script>

<svelte:window on:keydown={handleKeydown} on:keyup={handleKeyup} />

<Suspense>
  <T is={mesh}>
    <AnimatedSpriteMaterial
      is={new MeshStandardMaterial()}
      {textureUrl}
      {totalFrames}
      {fps}
      {columns}
      {rows}
      {startFrame}
      {endFrame}
      {filter}
      {delay}
      bind:play
      bind:pause
    />
    <T.PlaneGeometry args={[0.5, 0.5]} />
  </T>
</Suspense>
