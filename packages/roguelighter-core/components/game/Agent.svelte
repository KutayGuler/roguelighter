<script lang="ts">
  import { T, useTask, useThrelte } from '@threlte/core';
  import { AnimatedSpriteMaterial } from '@threlte/extras';
  import { DEFAULT_FRAME_COUNT, DEFAULT_FPS, DEFAULT_CAMERA_ZOOM } from '../../constants';
  import { Mesh } from 'three';
  import { noop } from '../../utils';
  import type { AgentAssetUrls, PlayableAgent } from '../../types/engine';
  import type { Settings } from '../../types/game';
  const { camera } = useThrelte();

  export let agent: PlayableAgent;
  export let settings: Settings;
  export let agent_asset_urls: AgentAssetUrls;
  export let position: [number, number, number];
  const is_player = agent.name == 'player';
  console.log(agent);

  let play: () => void, pause: () => void;

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

  const keyboard = { x: 0, y: 0 };
  const pressed = new Set<string>();
  const mesh = new Mesh();
  mesh.position.set(...position);

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

  $camera.position.z = 100 / (settings.camera?.zoom || DEFAULT_CAMERA_ZOOM);
  useTask((delta) => {
    position[0] += -keyboard.x * (delta * 5);
    position[1] += -keyboard.y * (delta * 5);
    mesh.position.set(...position);
    $camera.position.x = position[0];
    $camera.position.y = position[1];
  });
</script>

<svelte:window
  on:keydown={is_player ? handleKeydown : noop}
  on:keyup={is_player ? handleKeyup : noop}
/>

{#if textureUrl}
  <T is={mesh}>
    <AnimatedSpriteMaterial
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
    <T.PlaneGeometry />
  </T>
{/if}
