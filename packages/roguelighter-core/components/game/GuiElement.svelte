<script lang="ts">
  import { noop } from '../../utils';
  import type { GUI_Element, Variables, _Events } from '../../types';
  import * as transitions from 'svelte/transition';

  export let variables: Variables;
  export let events: _Events;
  export let name: keyof typeof events;
  export let guiElement: GUI_Element<typeof variables, keyof typeof events>;

  const { on_click: on_click_name, text, type, visibility_depends_on, tokens } = guiElement;
  const on_click = on_click_name ? events[on_click_name] : noop;
  const element_transition = guiElement.transition
    ? transitions[guiElement.transition?.type]
    : noop;

  const joined_tokens = tokens.join(' ');
  console.log(joined_tokens);
</script>

{#if visibility_depends_on}
  {#if variables[visibility_depends_on.split('.')[1]]}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <svelte:element
      this={type || 'div'}
      transition:element_transition
      on:click={on_click}
      class={joined_tokens}
    >
      {#if text}{text}{/if}
      {#each Object.entries(guiElement?.children || []) as [name, child]}
        <svelte:self guiElement={child} {variables} {events} {name} />
      {/each}
    </svelte:element>
  {/if}
{:else if name == '$pause_menu'}
  {#if variables.$pause_menu}
    <div
      transition:element_transition
      on:introstart={events.$open_pause_menu}
      on:outrostart={events.$close_pause_menu}
      class={joined_tokens}
    >
      {#if text}{text}{/if}
      {#each Object.entries(guiElement?.children || []) as [name, child]}
        <svelte:self guiElement={child} {variables} {events} {name} />
      {/each}
    </div>
  {/if}
{:else}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <svelte:element
    this={type || 'div'}
    class={joined_tokens}
    transition:element_transition
    on:click={on_click}
  >
    {#if text}{text}{/if}
    {#each Object.entries(guiElement?.children || []) as [name, child]}
      <svelte:self guiElement={child} {variables} {events} {name} />
    {/each}
  </svelte:element>
{/if}

<!-- <div class="absolute bottom-0 w-full h-1/4 flex flex-row gap-4 bg-slate-50 p-4">
  <div class="bg-red-200 rounded w-1/4">image</div>
  
  <div>char name</div>
  <div class="w-3/4 bg-purple-200 p-4">text</div>
</div> -->
