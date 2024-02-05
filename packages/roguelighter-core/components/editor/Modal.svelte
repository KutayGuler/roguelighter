<script lang="ts">
  export let visible = false;
  export let locked = false;
  const handler = locked ? () => {} : () => (visible = false);
</script>

{#if visible}
  <dialog
    on:mousedown|self={handler}
    class="flex items-center justify-center absolute top-0 right-0 w-screen h-screen bg-black/50 text-white z-30"
  >
    <div class="w-96 bg-zinc-700 p-8 rounded relative">
      <slot />
    </div>
  </dialog>
{/if}
