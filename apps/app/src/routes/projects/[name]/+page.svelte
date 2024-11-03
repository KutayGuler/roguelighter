<script lang="ts">
  import { documentDir } from '@tauri-apps/api/path';
  import { Engine } from 'roguelighter-core';
  import toast from '../../../lib/svelte-french-toast/core/toast.js';
  let { data } = $props();

  function on_no_player_in_scene() {
    toast.error('Player is not in the scene, cannot start the game');
  }

  function on_no_scene_is_selected() {
    toast.error('No scene is selected, cannot start the game');
  }
</script>

{#await documentDir() then document_path}
  <Engine
    project={data.project}
    {document_path}
    {on_no_player_in_scene}
    {on_no_scene_is_selected}
  />
{/await}
