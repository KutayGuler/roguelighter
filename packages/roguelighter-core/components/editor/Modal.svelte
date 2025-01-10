<script module>
  interface Props {
    dialog?: any;
    locked?: boolean;
    children?: import('svelte').Snippet;
  }
</script>

<script lang="ts">
  import { createDialog } from 'svelte-headlessui';
  import Transition from 'svelte-transition';
  let {
    dialog = $bindable(createDialog({ label: '' })),
    locked = false,
    children
  }: Props = $props();
</script>

{#if $dialog}
  <div class:locked class="flex w-full flex-col items-center justify-center">
    <div class="relative z-50">
      <Transition show={$dialog.expanded}>
        <Transition
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <button
            class="fixed inset-0 bg-black bg-opacity-50 outline-none border-none"
            onclick={dialog.close}
          ></button>
        </Transition>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4 text-center">
            <Transition
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div
                class="w-full max-w-lg bg-base-700 transform overflow-hidden rounded p-8 text-left align-middle shadow-xl transition-all text-white"
                use:dialog.modal
              >
                {@render children?.()}
              </div>
            </Transition>
          </div>
        </div>
      </Transition>
    </div>
  </div>
{/if}

<style>
  .locked {
    pointer-events: none;
  }
</style>
