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
  import GuiText from './GuiText.svelte';

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
    <!-- TODO: TS-NOCHECK THIS COMPONENT -->
    <svelte:element
      this={type}
      class={all_tokens}
      transition:element_transition
      onabort={(e: HTMLElementEventMap['abort']) => wrap(e, 'abort')}
      onanimationcancel={(e) => wrap(e, 'onanimationcancel')}
      onanimationend={(e) => wrap(e, 'onanimationend')}
      onanimationiteration={(e) => wrap(e, 'onanimationiteration')}
      onanimationstart={(e) => wrap(e, 'onanimationstart')}
      onauxclick={(e) => wrap(e, 'onauxclick')}
      onbeforeinput={(e) => wrap(e, 'onbeforeinput')}
      onbeforetoggle={(e) => wrap(e, 'onbeforetoggle')}
      onblur={(e) => wrap(e, 'onblur')}
      oncancel={(e) => wrap(e, 'oncancel')}
      oncanplay={(e) => wrap(e, 'oncanplay')}
      oncanplaythrough={(e) => wrap(e, 'oncanplaythrough')}
      onchange={(e) => wrap(e, 'onchange')}
      onclick={(e) => wrap(e, 'onclick')}
      onclose={(e) => wrap(e, 'onclose')}
      oncompositionend={(e) => wrap(e, 'oncompositionend')}
      oncompositionstart={(e) => wrap(e, 'oncompositionstart')}
      oncompositionupdate={(e) => wrap(e, 'oncompositionupdate')}
      oncontextlost={(e) => wrap(e, 'oncontextlost')}
      oncontextmenu={(e) => wrap(e, 'oncontextmenu')}
      oncontextrestored={(e) => wrap(e, 'oncontextrestored')}
      oncopy={(e) => wrap(e, 'oncopy')}
      oncuechange={(e) => wrap(e, 'oncuechange')}
      oncut={(e) => wrap(e, 'oncut')}
      ondblclick={(e) => wrap(e, 'ondblclick')}
      ondrag={(e) => wrap(e, 'ondrag')}
      ondragend={(e) => wrap(e, 'ondragend')}
      ondragenter={(e) => wrap(e, 'ondragenter')}
      ondragleave={(e) => wrap(e, 'ondragleave')}
      ondragover={(e) => wrap(e, 'ondragover')}
      ondragstart={(e) => wrap(e, 'ondragstart')}
      ondrop={(e) => wrap(e, 'ondrop')}
      ondurationchange={(e) => wrap(e, 'ondurationchange')}
      onemptied={(e) => wrap(e, 'onemptied')}
      onended={(e) => wrap(e, 'onended')}
      onerror={(e) => wrap(e, 'onerror')}
      onfocus={(e) => wrap(e, 'onfocus')}
      onfocusin={(e) => wrap(e, 'onfocusin')}
      onfocusout={(e) => wrap(e, 'onfocusout')}
      onformdata={(e) => wrap(e, 'onformdata')}
      ongotpointercapture={(e) => wrap(e, 'ongotpointercapture')}
      oninput={(e) => wrap(e, 'oninput')}
      oninvalid={(e) => wrap(e, 'oninvalid')}
      onkeydown={(e) => wrap(e, 'onkeydown')}
      onkeypress={(e) => wrap(e, 'onkeypress')}
      onkeyup={(e) => wrap(e, 'onkeyup')}
      onload={(e) => wrap(e, 'onload')}
      onloadeddata={(e) => wrap(e, 'onloadeddata')}
      onloadedmetadata={(e) => wrap(e, 'onloadedmetadata')}
      onloadstart={(e) => wrap(e, 'onloadstart')}
      onlostpointercapture={(e) => wrap(e, 'onlostpointercapture')}
      onmousedown={(e) => wrap(e, 'onmousedown')}
      onmouseenter={(e) => wrap(e, 'onmouseenter')}
      onmouseleave={(e) => wrap(e, 'onmouseleave')}
      onmousemove={(e) => wrap(e, 'onmousemove')}
      onmouseout={(e) => wrap(e, 'onmouseout')}
      onmouseover={(e) => wrap(e, 'onmouseover')}
      onmouseup={(e) => wrap(e, 'onmouseup')}
      onpaste={(e) => wrap(e, 'onpaste')}
      onpause={(e) => wrap(e, 'onpause')}
      onplay={(e) => wrap(e, 'onplay')}
      onplaying={(e) => wrap(e, 'onplaying')}
      onpointercancel={(e) => wrap(e, 'onpointercancel')}
      onpointerdown={(e) => wrap(e, 'onpointerdown')}
      onpointerenter={(e) => wrap(e, 'onpointerenter')}
      onpointerleave={(e) => wrap(e, 'onpointerleave')}
      onpointermove={(e) => wrap(e, 'onpointermove')}
      onpointerout={(e) => wrap(e, 'onpointerout')}
      onpointerover={(e) => wrap(e, 'onpointerover')}
      onpointerup={(e) => wrap(e, 'onpointerup')}
      onprogress={(e) => wrap(e, 'onprogress')}
      onratechange={(e) => wrap(e, 'onratechange')}
      onreset={(e) => wrap(e, 'onreset')}
      onresize={(e) => wrap(e, 'onresize')}
      onscroll={(e) => wrap(e, 'onscroll')}
      onscrollend={(e) => wrap(e, 'onscrollend')}
      onsecuritypolicyviolation={(e) => wrap(e, 'onsecuritypolicyviolation')}
      onseeked={(e) => wrap(e, 'onseeked')}
      onseeking={(e) => wrap(e, 'onseeking')}
      onselect={(e) => wrap(e, 'onselect')}
      onselectionchange={(e) => wrap(e, 'onselectionchange')}
      onselectstart={(e) => wrap(e, 'onselectstart')}
      onslotchange={(e) => wrap(e, 'onslotchange')}
      onstalled={(e) => wrap(e, 'onstalled')}
      onsubmit={(e) => wrap(e, 'onsubmit')}
      onsuspend={(e) => wrap(e, 'onsuspend')}
      ontimeupdate={(e) => wrap(e, 'ontimeupdate')}
      ontoggle={(e) => wrap(e, 'ontoggle')}
      ontouchcancel={(e) => wrap(e, 'ontouchcancel')}
      ontouchend={(e) => wrap(e, 'ontouchend')}
      ontouchmove={(e) => wrap(e, 'ontouchmove')}
      ontouchstart={(e) => wrap(e, 'ontouchstart')}
      ontransitioncancel={(e) => wrap(e, 'ontransitioncancel')}
      ontransitionend={(e) => wrap(e, 'ontransitionend')}
      ontransitionrun={(e) => wrap(e, 'ontransitionrun')}
      ontransitionstart={(e) => wrap(e, 'ontransitionstart')}
      onvolumechange={(e) => wrap(e, 'onvolumechange')}
      onwaiting={(e) => wrap(e, 'onwaiting')}
      onwebkitanimationend={(e) => wrap(e, 'onwebkitanimationend')}
      onwebkitanimationiteration={(e) => wrap(e, 'onwebkitanimationiteration')}
      onwebkitanimationstart={(e) => wrap(e, 'onwebkitanimationstart')}
      onwebkittransitionend={(e) => wrap(e, 'onwebkittransitionend')}
      onwheel={(e) => wrap(e, 'onwheel')}
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
