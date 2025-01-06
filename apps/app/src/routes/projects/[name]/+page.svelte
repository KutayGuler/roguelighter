<script lang="ts">
  import { Engine, TOAST_SETTINGS } from 'roguelighter-core';
  import toast from '../../../lib/svelte-french-toast/core/toast.js';

  let { data } = $props();

  function on_no_scene_is_selected() {
    toast.error('No scene is selected, cannot start the game', TOAST_SETTINGS);
  }
</script>

<Engine
  project={data.project}
  document_path={data.document_path}
  {on_no_scene_is_selected}
  process_classes={data.process_classes}
  exportCSS={data.exportCSS}
/>
