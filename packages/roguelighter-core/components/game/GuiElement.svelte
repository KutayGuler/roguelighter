<script lang="ts">
  import GuiElement from './GuiElement.svelte';
  import { noop } from '../../utils';
  import type { GUI_Element } from '../../types/game';
  import * as transitions from 'svelte/transition';
  import GuiText from './GuiText.svelte';

  interface Props {
    variables: { [key: string]: any };
    events: any;
    name: keyof typeof events;
    guiElement: GUI_Element;
  }

  let { variables = $bindable(), events, name, guiElement }: Props = $props();

  let { onclick: onclick_name, text, type, visibility_depends_on, tokens } = $state(guiElement);
  const onclick = onclick_name ? events[onclick_name] : noop;
  const element_transition = guiElement.transition
    ? transitions[guiElement.transition?.type]
    : noop;

  const joined_tokens = tokens.join(' ');
</script>

{#if visibility_depends_on}
  {#if variables[visibility_depends_on.split('.')[1]]}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <svelte:element
      this={type || 'div'}
      transition:element_transition
      {onclick}
      class={joined_tokens}
    >
      {#if text}
        <GuiText {text} bind:variables></GuiText>
      {/if}
      {#each Object.entries(guiElement?.children || []) as [name, child]}
        <GuiElement guiElement={child} {variables} {events} {name} />
      {/each}
    </svelte:element>
  {/if}
{:else if name == '$pause_menu'}
  {#if variables.$pause_menu}
    <div
      transition:element_transition
      onintrostart={events.$open_pause_menu}
      onoutrostart={events.$close_pause_menu}
      class={joined_tokens}
    >
      {#if text}
        <GuiText {text} bind:variables></GuiText>
      {/if}
      {#each Object.entries(guiElement?.children || []) as [name, child]}
        <GuiElement guiElement={child} {variables} {events} {name} />
      {/each}
    </div>
  {/if}
{:else}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <svelte:element
    this={type || 'div'}
    class={joined_tokens}
    transition:element_transition
    {onclick}
  >
    {#if text}
      <GuiText {text} bind:variables></GuiText>
    {/if}
    {#each Object.entries(guiElement?.children || []) as [name, child]}
      <GuiElement guiElement={child} {variables} {events} {name} />
    {/each}
  </svelte:element>
{/if}
