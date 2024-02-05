<script lang="ts">
  import docs from './documentation.json';
  import Type from './Type.svelte';

  const excluded_types = ['Engine', 'Errors'];

  docs.children = docs.children.filter(({ name }) => !excluded_types.includes(name));
</script>

<div class="flex flex-col gap-16 overflow-y-auto mono">
  {#each docs.children as type}
    <Type {type}></Type>
  {/each}
</div>
