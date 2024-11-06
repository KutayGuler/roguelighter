<script lang="ts">
  import { Engine, TOAST_SETTINGS } from 'roguelighter-core';
  import toast from '../../../lib/svelte-french-toast/core/toast.js';
  import { document_path } from '$lib/state.svelte.js';
  let { data } = $props();

  function on_no_player_in_scene() {
    toast.error('Player is not in the scene, cannot start the game', TOAST_SETTINGS);
  }

  function on_no_scene_is_selected() {
    toast.error('No scene is selected, cannot start the game', TOAST_SETTINGS);
  }
</script>

<Engine
  project={data.project}
  document_path={document_path.value}
  {on_no_player_in_scene}
  {on_no_scene_is_selected}
/>
