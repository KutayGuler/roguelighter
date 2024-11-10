<script lang="ts">
  import { T, useTask, useThrelte } from '@threlte/core';
  import { AnimatedSpriteMaterial } from '@threlte/extras';
  import { DEFAULT_FRAME_COUNT, DEFAULT_FPS, DEFAULT_CAMERA_ZOOM } from '../../constants';
  import { Mesh } from 'three';
  import { noop } from '../../utils';
  import type { AgentAssetUrls, PlayableAgent } from '../../types/engine';
  import type { Settings } from '../../types/game';
  import { SvelteSet } from 'svelte/reactivity';
  const { camera } = useThrelte();

  interface Props {
    agent: PlayableAgent;
    settings: Settings;
    agent_asset_urls: AgentAssetUrls;
    position: [number, number, number];
  }

  let { agent, settings, agent_asset_urls, position = $bindable() }: Props = $props();
  const is_player = agent.name == 'player';

  // @ts-expect-error
  let play: () => void = $state(),
    // @ts-expect-error
    pause: () => void = $state();

  const defaults = agent.states.default;
  const textureUrl = agent_asset_urls.get(agent.name);
  const totalFrames = defaults.frame_count || DEFAULT_FRAME_COUNT;
  const fps = defaults.fps || settings?.fps || DEFAULT_FPS;
  const columns = defaults.columns;
  const rows = defaults.rows;
  const startFrame = defaults.start_frame;
  const endFrame = defaults.end_frame;
  const delay = defaults.delay;
  const filter = defaults.filter || settings.filter || 'nearest';

  let keyboard = $state({ x: 0, y: 0 });
  const pressed = $state(new SvelteSet<string>());
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

  const sqrtTwo = 1.4;

  useTask((delta) => {
    let makeHalf = keyboard.x && keyboard.y;

    position[0] += (-keyboard.x * (delta * 5)) / (makeHalf ? sqrtTwo : 1);
    position[1] += (-keyboard.y * (delta * 5)) / (makeHalf ? sqrtTwo : 1);
    mesh.position.set(...position);
    $camera.position.x = position[0];
    $camera.position.y = position[1];
  });
</script>

<svelte:window
  onkeydown={is_player ? handleKeydown : noop}
  onkeyup={is_player ? handleKeyup : noop}
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
