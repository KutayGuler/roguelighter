<script lang="ts">
  import { T, useTask, useThrelte } from '@threlte/core';
  import AnimatedSpriteMaterial from './AnimatedSpriteMaterial.svelte';
  import { DEFAULT_FRAME_COUNT, DEFAULT_FPS, DEFAULT_CAMERA_ZOOM } from '../../constants';
  import { Mesh } from 'three';
  import { noop } from '../../utils';
  import type { AgentAssetUrls, PlayableAgent, PlayableScene } from '../../types/engine';
  import type { Settings, SpriteConfig } from '../../types/game';
  import { SvelteSet } from 'svelte/reactivity';
  const { camera } = useThrelte();

  interface Props {
    agent: PlayableAgent<'player'>;
    settings: Settings;
    agent_asset_urls: AgentAssetUrls;
    position: [number, number, number];
    scene: PlayableScene;
  }

  let { agent, settings, agent_asset_urls, position, scene }: Props = $props();
  const is_player = agent.name == 'player';

  // @ts-expect-error
  let play: () => void = $state(),
    // @ts-expect-error
    pause: () => void = $state();

  const states = agent.states as SpriteConfig;

  let _state_name = $state('idle');
  // @ts-expect-error
  let _state = $derived(states[_state_name]);
  let textureUrl = agent_asset_urls.get(agent.name) as string;
  let totalFrames = $derived(_state?.frame_count || DEFAULT_FRAME_COUNT);
  let fps = $derived(_state?.fps || settings?.fps || DEFAULT_FPS);
  let columns = $derived(_state?.columns || 0);
  let rows = $derived(_state?.rows || 1);
  let startFrame = $derived(_state?.start_frame || 0);
  let endFrame = $derived(_state?.end_frame || totalFrames - 1);
  let delay = $derived(_state?.delay || 0);
  let filter = $derived(_state?.filter || settings?.filter || 'nearest');

  let keyboard = $state({ x: 0, y: 0 });
  const pressed = $state(new SvelteSet<string>());
  const mesh = new Mesh();
  mesh.position.set(...position);

  const handleKey = (key: string, value: 0 | 1) => {
    if (key.toLocaleLowerCase() == 'z') {
      $camera.position.z += 1;
      return;
    }

    if (key.toLocaleLowerCase() == 'x') {
      $camera.position.z += -1;
      return;
    }

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
  const { width, height } = scene;

  useTask((delta) => {
    let makeHalf = keyboard.x && keyboard.y;
    console.log(position);

    let xDiff = (-keyboard.x * (delta * 5)) / (makeHalf ? sqrtTwo : 1);
    let yDiff = (-keyboard.y * (delta * 5)) / (makeHalf ? sqrtTwo : 1);
    let resX = position[0] + xDiff;
    let resY = position[1] + yDiff;

    if (resX > 0 && resX < width - 1) {
      position[0] += xDiff;
      $camera.position.x = position[0];
    }

    if (resY < 0 && resY > -height + 1) {
      position[1] += yDiff;
      $camera.position.y = position[1];
    }

    mesh.position.set(...position);
  });
</script>

<svelte:window
  onkeydown={is_player ? handleKeydown : noop}
  onkeyup={is_player ? handleKeyup : noop}
/>

<T is={mesh}>
  <AnimatedSpriteMaterial
    {textureUrl}
    {totalFrames}
    {fps}
    {rows}
    {startFrame}
    {endFrame}
    {filter}
    {delay}
  />
  <T.PlaneGeometry />
</T>

<!-- <T.Group>
  <RigidBody type="kinematicPosition">
    <Collider
      bind:collider
      oncontact={(e) => console.log(e)}
      oncollisionenter={(e) => console.log(e)}
      shape="cuboid"
      args={[0.5, 0.5, 0.5]}
    ></Collider>
    <T is={mesh}>
      <AnimatedSpriteMaterial
        {textureUrl}
        {totalFrames}
        {fps}
        {rows}
        {startFrame}
        {endFrame}
        {filter}
        {delay}
      />
      <T.PlaneGeometry />
    </T>
  </RigidBody>
</T.Group> -->
