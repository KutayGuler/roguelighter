<script lang="ts">
  import { get } from 'svelte/store';
  import { T, useTask } from '@threlte/core';
  import { AnimatedSpriteMaterial } from '@threlte/extras';
  import { DEFAULT_FRAME_COUNT, DEFAULT_FPS } from '../../constants';
  import type { Settings, PlayableAgent, AssetUrls } from '../../types';

  export let agent: PlayableAgent;
  export let settings: Settings;
  export let asset_urls: AssetUrls;

  // since the engine is turn based, there is no need to pause the animations lol
  let play: () => void, pause: () => void;
  window.addEventListener('paused', () => {});
  window.addEventListener('unpaused', () => {});

  const states = agent.states;
  const defaults = states.default;

  let textureUrl = asset_urls.get(agent.name).default;
  let totalFrames = defaults.frame_count || DEFAULT_FRAME_COUNT;
  let fps = defaults.fps || settings?.fps || DEFAULT_FPS;
  let columns = defaults.columns;
  let rows = defaults.rows;
  let startFrame = defaults.start_frame;
  let endFrame = defaults.end_frame;
  let delay = defaults.delay;
  let filter = defaults.filter || settings.filter || 'nearest';

  function loop() {
    if (agent.revert_state_in == null) return;
    agent.revert_state_in -= 1;
    if (agent.revert_state_in == 0) {
      agent.state = 'default';
    }
  }

  function update_animation_state(state: string) {
    textureUrl = asset_urls.get(agent.name)[state];
    totalFrames = states[state].frame_count || DEFAULT_FRAME_COUNT;
  }

  $: update_animation_state(agent.state);

  useTask(() => {
    agent.x = get(agent.x_tween);
    agent.y = get(agent.y_tween);
  });
</script>

<T.Sprite position.x={agent.x} position.y={agent.y}>
  {#key textureUrl}
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
      on:loop={loop}
      bind:play
      bind:pause
    />
  {/key}
</T.Sprite>
