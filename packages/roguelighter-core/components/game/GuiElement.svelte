<script module>
  interface Props {
    get_variable_value: (variable_name: string) => any;
    children_handler: (obj: GUI | GUI_Element) => ReturnType<import('svelte').Snippet>;
    variables: { [key: string]: any };
    functions: any;
    name: string;
    gui_element: GUI_Element;
    is_in_if_block?: boolean;
    is_in_for_block?: boolean;
    PROCESS: any;
  }
</script>

<script lang="ts">
  import { cn, noop } from '../../utils';
  import type { GUI, GUI_Element, ClassesObject } from '../../types/game';
  import type { Snippet } from 'svelte';
  import * as transitions from 'svelte/transition';
  import GuiText from './GuiText.svelte';

  const scale = transitions.scale;

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
    functions = $bindable(),
    PROCESS,
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
  let attrs = $state({});

  const element_transition = gui_element.transition
    ? transitions[gui_element.transition.type]
    : noop;

  console.log(element_transition);

  for (let [key, val] of Object.entries(original_attrs)) {
    if (typeof val == 'string' && key.startsWith('on')) {
      // @ts-expect-error
      attrs[key] = new Function('return ' + val)();
    } else {
      // @ts-expect-error
      attrs[key] = val;
    }
  }

  let non_function_attrs = $state({});
  let function_attrs = $state({});

  for (let [attr_name, value] of Object.entries(attrs)) {
    if (attr_name.startsWith('on')) {
      // @ts-expect-error
      function_attrs[attr_name] = (e) => value(e, variables, functions, PROCESS);
    } else {
      // @ts-expect-error
      non_function_attrs[attr_name] = value;
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
</script>

{#snippet gui_component()}
  {#if is_visible}
    {#each { length: iteration_count }, index}
      <svelte:element
        this={gui_element.type || 'div'}
        class={all_tokens}
        transition:element_transition
        {...non_function_attrs}
        {...function_attrs}
      >
        {#if text}
          <GuiText {index} {text} {get_variable_value}></GuiText>
        {/if}
        {#if Object.keys(children || {}).length}
          {@render children_handler(children)}
        {/if}
      </svelte:element>
    {/each}
  {/if}
{/snippet}

{@render gui_component()}
