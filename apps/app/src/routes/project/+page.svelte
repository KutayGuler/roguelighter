<script lang="ts">
  import { Engine, project_store } from 'roguelighter-core';
  let project = structuredClone($project_store);
  console.log(project);
</script>

<Engine {project} />
