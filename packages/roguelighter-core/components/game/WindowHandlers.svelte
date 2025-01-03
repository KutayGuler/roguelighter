<script>
  // @ts-nocheck
  import { noop } from '../../utils';
  let { window_handlers, variables = $bindable(), functions = $bindable(), PROCESS } = $props();
  function wrap(e, name) {
    if (window_handlers[name]) {
      window_handlers[name](e, variables, functions, PROCESS);
      window.dispatchEvent(new Event('fired_event'));
    }
  }
</script>

<svelte:window
  onabort={(e) => wrap(e, 'onabort')}
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
  oncontextmenu={(e) => wrap(e, 'oncontextmenu')}
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
  onseeked={(e) => wrap(e, 'onseeked')}
  onseeking={(e) => wrap(e, 'onseeking')}
  onselect={(e) => wrap(e, 'onselect')}
  onselectionchange={(e) => wrap(e, 'onselectionchange')}
  onselectstart={(e) => wrap(e, 'onselectstart')}
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
  onwheel={(e) => wrap(e, 'onwheel')}
/>
