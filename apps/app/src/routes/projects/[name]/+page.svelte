<script lang="ts">
  import { Engine, ERROR_MESSAGES, TOAST_SETTINGS, type OnError } from 'roguelighter-core';
  import toast from '../../../lib/svelte-french-toast/core/toast.js';

  let { data } = $props();

  const on_error: OnError = (type, e) => {
    toast.error(ERROR_MESSAGES[type], TOAST_SETTINGS);
  };
</script>

<Engine
  project={data.project}
  document_path={data.document_path}
  {on_error}
  process_classes={data.process_classes}
  exportCSS={data.exportCSS}
/>
