<script lang="ts">
  import Type from './Type.svelte';
  let { type } = $props();
  const children_types = type.type?.declaration?.children;
</script>

<div>
  <h3 class="h3" id={type.name}>
    {type.name}
    <button
      ><svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-6 h-6 hover:text-emerald-400 duration-150 ease-out"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
        />
      </svg>
    </button>
  </h3>
  <p class="text-zinc-300/90">{type.comment?.summary[0].text}</p>
  {#if type.children}
    <div class="flex flex-col gap-8 pl-8">
      {#each type.children as child_type}
        <Type type={child_type}></Type>
      {/each}
    </div>
  {/if}
  {#if children_types}
    <div class="flex flex-col gap-8 pl-8">
      {#each children_types as child_type}
        <Type type={child_type}></Type>
      {/each}
    </div>
  {/if}
</div>
