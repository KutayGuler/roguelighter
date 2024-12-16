<script module>
  interface Props {
    variables: { [key: string]: any };
    events: any;
    name: string;
    guiElement: GUI_Element;
  }
</script>

<script lang="ts">
  import GuiElement from './GuiElement.svelte';
  import { noop, cn } from '../../utils';
  import type { GUI_Element } from '../../types/game';
  import * as transitions from 'svelte/transition';
  import GuiText from './GuiText.svelte';
  import { onMount } from 'svelte';
  import { TEMPLATE_IF_STATEMENT } from '../../constants';

  let { variables = $bindable(), events, name, guiElement }: Props = $props();
  let iteration_count = $derived.by(() => {
    if (!name.startsWith('$for_')) return 1;

    let variable_name = name.replace('$for_', '');
    let variable = variables[variable_name.substring(1)];
    if (variable === undefined) return 1;
    return variable;
  });

  let {
    onclick: onclick_name,
    text,
    type,
    visibility_depends_on,
    tokens,
    transition,
    children,
    ...if_statements
  } = $state(guiElement);
  const onclick = onclick_name ? events[onclick_name] : noop;
  const element_transition = transition ? transitions[transition?.type] : noop;

  let joined_tokens = $state(tokens.join(' '));
  let fns: Array<[fn: Function, _tokens: Array<string>]> = [];

  function execute_fns() {
    joined_tokens = tokens.join(' ');
    for (let [fn, _tokens] of fns) {
      if (fn(variables)) {
        joined_tokens = cn(joined_tokens, _tokens.join(' '));
      }
    }
  }

  onMount(() => {
    for (let [if_statement, _tokens] of Object.entries(if_statements)) {
      let fn_str = variables[if_statement.replace(TEMPLATE_IF_STATEMENT, '')];

      if (fn_str && fn_str.startsWith('function (_)')) {
        let modified_fn_str = fn_str.replace('(_)', '(variables)').replace('_.', '');
        const fn = new Function('return ' + modified_fn_str)(variables);
        fns.push([fn, _tokens]);
      }
    }

    window.addEventListener('fired_event', (e) => {
      execute_fns();
    });
  });
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
        <GuiElement guiElement={child} {events} {name} bind:variables />
      {/each}
    </svelte:element>
  {/if}
{:else if name == '$pause_menu'}
  {#if variables.$pause_menu}
    <!--       onintrostart={events.$open_pause_menu}
      onoutrostart={events.$close_pause_menu} -->
    <div transition:element_transition class={joined_tokens}>
      {#if text}
        <GuiText {text} bind:variables></GuiText>
      {/if}
      {#each Object.entries(guiElement?.children || []) as [name, child]}
        <GuiElement guiElement={child} {events} {name} bind:variables />
      {/each}
    </div>
  {/if}
{:else}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  {#each { length: iteration_count } as item, index}
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
        <GuiElement guiElement={child} {events} {name} bind:variables />
      {/each}
    </svelte:element>
  {/each}
{/if}
