<script lang="ts">
  import { PUBLIC_APP_VERSION } from '$env/static/public';
  import { CROSS } from '../constants';
  export let open = false;
  // TODO LATER: hotkey to switch views (Ctrl + Q)
  // options page
  // options.json should be stored globally
  // export game button
</script>

{#if open}
  <div class="w-full h-full absolute top-0 left-0 bg-zinc-950/90 z-50 text-zinc-200 py-2 px-4">
    <div class="flex flex-row justify-end">
      <button class="text-2xl" on:click={() => (open = false)}>{CROSS}</button>
    </div>
    <span class="text-xs">v{PUBLIC_APP_VERSION}</span>
  </div>
{/if}
