<script lang="ts">
  import { noop } from '../../utils';
  import type { GUI_Element, Variables, Events } from '../../types/game';
  import * as transitions from 'svelte/transition';
  import GuiText from './GuiText.svelte';

  export let variables: Variables;
  export let events: Events;
  export let name: keyof typeof events;
  export let guiElement: GUI_Element;

  let { on_click: on_click_name, text, type, visibility_depends_on, tokens } = guiElement;
  const on_click = on_click_name ? events[on_click_name] : noop;
  const element_transition = guiElement.transition
    ? transitions[guiElement.transition?.type]
    : noop;

  const joined_tokens = tokens.join(' ');
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
    {#if text}
      <!-- {@const modified_text = text.replaceAll()} -->
      <GuiText {text} {variables}></GuiText>
    {/if}
    {#each Object.entries(guiElement?.children || []) as [name, child]}
      <svelte:self guiElement={child} {variables} {events} {name} />
    {/each}
  </svelte:element>
{/if}
