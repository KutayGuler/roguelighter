<script module>
  interface Props {
    get_variable_value: (variable_name: string) => any;
    children_handler: (obj: GUI | GUI_Element) => Snippet;
    variables: { [key: string]: any };
    events: any;
    name: string;
    gui_element: GUI_Element;
    is_in_if_block?: boolean;
    is_in_for_block?: boolean;
  }

  interface VariableGetter {
    vanilla: {
      [variable_name: string]: {
        style_obj: StyleObject;
      };
    };
    computed: {
      [variable_name: string]: {
        fn: (variables: any) => boolean;
        style_obj: StyleObject;
      };
    };
  }
</script>

<script lang="ts">
  import { cn, noop } from '../../utils';
  import type { GUI, GUI_Element, StyleObject } from '../../types/game';
  import type { Snippet } from 'svelte';
  import * as transitions from 'svelte/transition';
  import GuiText from './GuiText.svelte';

  function stringify_modifiers(modifiers: StyleObject['modifiers']) {
    if (!modifiers) return '';

    let modifier_tokens = '';
    for (let [modifier, _tokens] of Object.entries(modifiers)) {
      modifier_tokens += _tokens.map((t) => `${modifier}:${t} `) + ' ';
    }
    return modifier_tokens;
  }

  let {
    children_handler,
    get_variable_value,
    events,
    name,
    gui_element,
    is_in_if_block = false,
    is_in_for_block = false
  }: Props = $props();
  let { text, type, style, transition, children, ...attrs } = $state(gui_element);
  const element_transition = transition ? transitions[transition?.type] : noop;

  let iteration_count = $derived.by(() => {
    if (!is_in_for_block) return 1;

    let variable = get_variable_value(name);
    if (typeof variable !== 'number') return 1;
    return variable || 0;
  });

  let is_visible = $derived(!is_in_if_block ? true : get_variable_value(name));
  let if_object = $derived(style?.$if || ({} as { [name: string]: StyleObject }));

  let default_tokens = $state(style?.default?.join(' ') || '');
  let modifier_tokens = $state(stringify_modifiers(style?.modifiers));
  const original_tokens = default_tokens + ' ' + modifier_tokens;
  let all_tokens = $state(default_tokens + ' ' + modifier_tokens);

  window.addEventListener('fired_event', () => {
    all_tokens = original_tokens;

    for (let [variable_name, style_obj] of Object.entries(if_object)) {
      if (get_variable_value(variable_name)) {
        const { default: d, modifiers } = style_obj as StyleObject;
        const all_conditionals = d + ' ' + stringify_modifiers(modifiers);
        all_tokens = cn(original_tokens, all_conditionals);
      }
    }
  });
</script>

{#snippet gui_component()}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  {#each { length: iteration_count }, index}
    <svelte:element
      this={type || 'div'}
      class={all_tokens}
      {...attrs}
      transition:element_transition
    >
      {#if text}
        <GuiText {index} {text} {get_variable_value}></GuiText>
      {/if}
      {#if Object.keys(children || {}).length}
        {@render children_handler(children)}
      {/if}
    </svelte:element>
  {/each}
{/snippet}

{#if is_visible}
  {@render gui_component()}
{/if}
