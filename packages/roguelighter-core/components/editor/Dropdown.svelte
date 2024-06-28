<script lang="ts">
  import { createMenu } from 'svelte-headlessui';
  import Transition from 'svelte-transition';
  export let menu = createMenu({ label: 'Actions' });
</script>

<div class="flex w-full flex-col items-center justify-center">
  <div class="relative top-16 w-56 text-right">
    <div class="relative inline-block text-left">
      <Transition
        show={$menu.expanded}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <div
          use:menu.items
          class="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        >
          <slot><!-- optional fallback --></slot>
          <!-- {#each groups as group}
            <div class="px-1 py-1">
              {#each group as option}
                {@const active = $menu.active === option.text}
                <button
                  use:menu.item
                  class="group flex w-full items-center rounded-md px-2 py-2 text-sm {active
                    ? 'bg-violet-500 text-white'
                    : 'text-gray-900'}"
                >
                  <svelte:component this={option.icon} class="mr-2 h-5 w-5" {active} />
                  {option.text}
                </button>
              {/each}
            </div>
          {/each} -->
        </div>
      </Transition>
    </div>
  </div>
</div>
