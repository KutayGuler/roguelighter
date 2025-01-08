<script lang="ts">
  import { CROSS } from 'roguelighter-core';
  import { focus_trap } from 'roguelighter-core';
  interface Props {
    open?: boolean;
  }

  let { open = $bindable(false) }: Props = $props();

  let value = $state('Ctrl + Q');
  let editing = $state(false);

  function toggleEdit() {
    editing = !editing;

    if (!editing) return;

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

<main class="w-full h-full flex justify-center">
  <div class="w-full max-w-xl h-full p-4" use:focus_trap={true}>
    <h3 class="pt-[2px] relative">
      <span>Keybindings</span>
      <a href="/" aria-labelledby="home" class="absolute top-1 -right-10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6 duration-150 ease-out"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125
          1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
          />
        </svg>
      </a>
    </h3>
    <div
      class="flex flex-row gap-2 bg-base-800 items-center p-4 w-full justify-between rounded mt-4"
    >
      <span>Switch view</span>
      <span
        use:focus_trap={editing}
        class:border-amber-400={editing}
        class:border-transparent={!editing}
        class="border px-2 rounded py-0.5">{value}</span
      >
      <button
        aria-label="toggle editing shortcut for Switch View"
        class:text-base-400={editing}
        class="bg-base-700 shadow-inner py-1 px-2 rounded"
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
</main>
