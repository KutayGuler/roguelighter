<script>
  // @ts-nocheck
  import GuiText from './GuiText.svelte';
  import { noop } from '../../utils';
  import * as transitions from 'svelte/transition';

  let {
    variables = $bindable(),
    functions = $bindable(),
    all_tokens = $bindable(),
    index,
    attrs,
    children_handler,
    get_variable_value,
    name,
    gui_element
  } = $props();

  const element_transition = gui_element.transition
    ? transitions[gui_element.transition.type]
    : noop;

  function wrap(e, name) {
    // @ts-expect-error
    if (attrs[name]) {
      // @ts-expect-error
      attrs[name](e, variables, functions);
    }
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<svelte:element
  this={gui_element.type || 'div'}
  class={all_tokens}
  transition:element_transition
  onabort={(e) => wrap(e, 'abort')}
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
  {#if gui_element.text}
    <GuiText {index} text={gui_element.text} {get_variable_value}></GuiText>
  {/if}
  {#if Object.keys(gui_element.children || {}).length}
    {@render children_handler(gui_element.children)}
  {/if}
</svelte:element>
