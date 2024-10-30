<script lang="ts">
  import { PUBLIC_APP_VERSION } from '$env/static/public';
  import { CROSS } from '../constants';
  import { focus_trap } from '../utils';
  interface Props {
    open?: boolean;
  }

  let { open = $bindable(false) }: Props = $props();
  // BACKLOG: hotkey to switch views (Ctrl + Q)
  // BACKLOG: put all stuff inside Roguelighter document
  // options.json
  // Projects
  // Exports
  // options page
  // options.json should be stored globally (probably in Roguelighter Options or sth)
  // export game button
  let value = $state('Ctrl + Q');
  let editing = $state(false);

  function toggleEdit() {
    editing = !editing;

    if (!editing) return;

    // BACKLOG: prevent ctrl + tab

    value = 'Press a key';
  }

  function handle(e: KeyboardEvent) {
    if (!editing) return;

    let prefix = '';

    if (e.ctrlKey) {
      prefix = 'Ctrl + ';
    } else if (e.shiftKey) {
      prefix = 'Shift + ';
    } else if (e.altKey) {
      prefix = 'Alt + ';
    }
    value = prefix + e.code;
  }
</script>

<svelte:window onkeydown={handle} />

{#if open}
  <div
    class="w-full h-full absolute top-0 left-0 bg-zinc-950/90 z-50 text-zinc-200 py-2 px-4"
    use:focus_trap={true}
  >
    <div class="flex flex-row justify-end">
      <button class="text-2xl" onclick={() => (open = false)}>{CROSS}</button>
    </div>
    <span class="text-xs">Version: {PUBLIC_APP_VERSION}</span>
    <h1 class="pt-8 pb-2 text-xl serif">Keybindings</h1>
    <div
      class="flex flex-row gap-2 text-sm bg-zinc-800 items-center p-2 px-4 w-64 justify-between rounded"
    >
      <span>Switch view</span>
      <span
        use:focus_trap={editing}
        class:border-amber-400={editing}
        class:border-transparent={!editing}
        class="border px-2 rounded py-0.5">{value}</span
      >
      <button
        class:text-zinc-400={editing}
        class="bg-zinc-700 shadow-inner py-1 px-2 rounded"
        onclick={toggleEdit}
        ><svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-4"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
          />
        </svg>
      </button>
    </div>
  </div>
{/if}
