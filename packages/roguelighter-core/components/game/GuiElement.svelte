<script module>
  interface Props {
    get_variable_value: (variable_name: string) => any;
    children_handler: (obj: GUI | GUI_Element) => Snippet;
    variables: { [key: string]: any };
    handlers: any;
    name: string;
    gui_element: GUI_Element;
    is_in_if_block?: boolean;
    is_in_for_block?: boolean;
  }
</script>

<script lang="ts">
  import { cn, noop } from '../../utils';
  import type { GUI, GUI_Element, ClassesObject } from '../../types/game';
  import type { Snippet } from 'svelte';
  import * as transitions from 'svelte/transition';
  import HtmlElement from './HTMLElement.svelte';

  function stringify_modifiers(modifiers: ClassesObject['modifiers']) {
    if (!modifiers) return '';

    let modifier_tokens = '';
    for (let [modifier, _tokens] of Object.entries(modifiers)) {
      modifier_tokens += _tokens.map((t) => `${modifier}:${t} `) + ' ';
    }
    return modifier_tokens;
  }

  let {
    variables = $bindable(),
    handlers = $bindable(),
    children_handler,
    get_variable_value,
    name,
    gui_element,
    is_in_if_block = false,
    is_in_for_block = false
  }: Props = $props();
  let {
    text,
    type = 'div',
    classes,
    transition,
    children,
    ...original_attrs
  } = $state(gui_element);
  const element_transition = transition ? transitions[transition.type] : noop;

  let attrs = $state({});
  $inspect(attrs);

  for (let [key, val] of Object.entries(original_attrs)) {
    if (typeof val == 'string' && val.startsWith('function')) {
      // @ts-expect-error
      attrs[key] = new Function('return ' + val.replace('(e)', '(e, _, $)'))();
    } else {
      // @ts-expect-error
      attrs[key] = val;
    }
  }

  let iteration_count = $derived.by(() => {
    if (!is_in_for_block) return 1;

    let variable = get_variable_value(name);
    if (typeof variable !== 'number') return 1;
    return variable || 0;
  });

  let is_visible = $derived(!is_in_if_block ? true : get_variable_value(name));
  let if_object = $derived(classes?.$if || ({} as { [name: string]: ClassesObject }));

  let default_tokens = $state(classes?.default?.join(' ') || '');
  let modifier_tokens = $state(stringify_modifiers(classes?.modifiers));
  const original_tokens = default_tokens + ' ' + modifier_tokens;
  let all_tokens = $state(default_tokens + ' ' + modifier_tokens);

  window.addEventListener('fired_event', () => {
    all_tokens = original_tokens;

    for (let [variable_name, classes_obj] of Object.entries(if_object)) {
      if (get_variable_value(variable_name)) {
        const { default: d, modifiers } = classes_obj as ClassesObject;
        const all_conditionals = d + ' ' + stringify_modifiers(modifiers);
        all_tokens = cn(original_tokens, all_conditionals);
      }
    }
  });

  function wrap<T extends keyof HTMLElementEventMap>(e: HTMLElementEventMap[T], name: T) {
    // @ts-expect-error
    if (attrs[name]) {
      // @ts-expect-error
      attrs[name](e, variables, handlers);
    }
  }
</script>

{#snippet gui_component()}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  {#each { length: iteration_count }, index}
    <!-- TODO: test component -->
    <HtmlElement
      bind:all_tokens
      bind:variables
      bind:handlers
      {index}
      {gui_element}
      {children_handler}
      {get_variable_value}
      {name}
    ></HtmlElement>
  {/each}
{/snippet}

{#if is_visible}
  {@render gui_component()}
{/if}
