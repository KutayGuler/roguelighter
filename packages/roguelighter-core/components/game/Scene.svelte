<script lang="ts">
  import type { Tweened } from 'svelte/motion';
  import type {
    AgentAssetUrls,
    BackgroundAssetUrls,
    PlayableScene,
    Portal,
    Settings,
    _
  } from '../../types';
  import { T, useTask, useThrelte } from '@threlte/core';
  import { AnimatedSpriteMaterial } from '@threlte/extras';
  import { get } from 'svelte/store';
  import Agent from './Agent.svelte';
  import { createEventDispatcher } from 'svelte';
  import { DEFAULT_CAMERA_ZOOM } from '../../constants';
  const dispatch = createEventDispatcher();

  export let bg_asset_urls: BackgroundAssetUrls;
  export let agent_asset_urls: AgentAssetUrls;
  export let settings: Settings;
  export let scene: PlayableScene;
  export let scene_just_changed: boolean;
  export let player_pos: number;
  export let camera_x_tween: Tweened<number>;
  export let camera_y_tween: Tweened<number>;
  const { camera } = useThrelte();

  let zoom = settings.camera?.zoom || DEFAULT_CAMERA_ZOOM;
  $camera.position.z = 100 / zoom;

  useTask(() => {
    $camera.position.x = get(camera_x_tween);
    $camera.position.y = get(camera_y_tween);

    if (!scene_just_changed && scene.portals.has(player_pos)) {
      const portal_info = scene.portals.get(player_pos) as Portal;
      dispatch('change_scene', portal_info);
    }
  });
</script>

<T.PerspectiveCamera />
<T.DirectionalLight position={[0, 10, 10]} />
<!-- {#each scene.backgrounds.entries() as [pos, texture]}
  <T.Sprite position={[pos % scene.width, -Math.floor(pos / scene.width)]}>
    <AnimatedSpriteMaterial textureUrl={bg_asset_urls.get(texture)} totalFrames={1} />
  </T.Sprite>
{/each} -->
{#each scene.agents.values() as agent}
  <Agent {agent_asset_urls} {agent} {settings} />
{/each}
