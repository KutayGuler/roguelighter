<script lang="ts">
  import { documentDir } from '@tauri-apps/api/path';
  import { Engine } from 'roguelighter-core';
  let { data } = $props();
</script>

{#await documentDir() then document_path}
  <Engine project={data.project} {document_path} />
{/await}
