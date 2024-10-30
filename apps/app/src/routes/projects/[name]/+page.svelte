<script lang="ts">
  import { Engine } from 'roguelighter-core';
  let { data } = $props();
  console.log(data);
</script>

<Engine project={data.project} />
