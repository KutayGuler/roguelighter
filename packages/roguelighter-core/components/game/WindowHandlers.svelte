<script>
  // @ts-nocheck
  import { noop } from '../../utils';
  let { window_handlers, variables = $bindable(), handlers = $bindable() } = $props();
  function wrap(e, name) {
    if (window_handlers[name]) {
      window_handlers[name](e, variables, handlers);
      window.dispatchEvent(new Event('fired_event'));
    }
  }
</script>

<svelte:window
  onabort={(e) => wrap(e, 'onabort') || noop}
  onanimationend={(e) => wrap(e, 'onanimationend') || noop}
  onanimationiteration={(e) => wrap(e, 'onanimationiteration') || noop}
  onanimationstart={(e) => wrap(e, 'onanimationstart') || noop}
  onauxclick={(e) => wrap(e, 'onauxclick') || noop}
  onbeforeinput={(e) => wrap(e, 'onbeforeinput') || noop}
  onbeforetoggle={(e) => wrap(e, 'onbeforetoggle') || noop}
  onblur={(e) => wrap(e, 'onblur') || noop}
  oncancel={(e) => wrap(e, 'oncancel') || noop}
  oncanplay={(e) => wrap(e, 'oncanplay') || noop}
  oncanplaythrough={(e) => wrap(e, 'oncanplaythrough') || noop}
  onchange={(e) => wrap(e, 'onchange') || noop}
  onclick={(e) => wrap(e, 'onclick') || noop}
  onclose={(e) => wrap(e, 'onclose') || noop}
  oncompositionend={(e) => wrap(e, 'oncompositionend') || noop}
  oncompositionstart={(e) => wrap(e, 'oncompositionstart') || noop}
  oncompositionupdate={(e) => wrap(e, 'oncompositionupdate') || noop}
  oncontextmenu={(e) => wrap(e, 'oncontextmenu') || noop}
  oncopy={(e) => wrap(e, 'oncopy') || noop}
  oncuechange={(e) => wrap(e, 'oncuechange') || noop}
  oncut={(e) => wrap(e, 'oncut') || noop}
  ondblclick={(e) => wrap(e, 'ondblclick') || noop}
  ondrag={(e) => wrap(e, 'ondrag') || noop}
  ondragend={(e) => wrap(e, 'ondragend') || noop}
  ondragenter={(e) => wrap(e, 'ondragenter') || noop}
  ondragleave={(e) => wrap(e, 'ondragleave') || noop}
  ondragover={(e) => wrap(e, 'ondragover') || noop}
  ondragstart={(e) => wrap(e, 'ondragstart') || noop}
  ondrop={(e) => wrap(e, 'ondrop') || noop}
  ondurationchange={(e) => wrap(e, 'ondurationchange') || noop}
  onemptied={(e) => wrap(e, 'onemptied') || noop}
  onended={(e) => wrap(e, 'onended') || noop}
  onerror={(e) => wrap(e, 'onerror') || noop}
  onfocus={(e) => wrap(e, 'onfocus') || noop}
  onfocusin={(e) => wrap(e, 'onfocusin') || noop}
  onfocusout={(e) => wrap(e, 'onfocusout') || noop}
  onformdata={(e) => wrap(e, 'onformdata') || noop}
  ongotpointercapture={(e) => wrap(e, 'ongotpointercapture') || noop}
  oninput={(e) => wrap(e, 'oninput') || noop}
  oninvalid={(e) => wrap(e, 'oninvalid') || noop}
  onkeydown={(e) => wrap(e, 'onkeydown') || noop}
  onkeypress={(e) => wrap(e, 'onkeypress') || noop}
  onkeyup={(e) => wrap(e, 'onkeyup') || noop}
  onload={(e) => wrap(e, 'onload') || noop}
  onloadeddata={(e) => wrap(e, 'onloadeddata') || noop}
  onloadedmetadata={(e) => wrap(e, 'onloadedmetadata') || noop}
  onloadstart={(e) => wrap(e, 'onloadstart') || noop}
  onlostpointercapture={(e) => wrap(e, 'onlostpointercapture') || noop}
  onmousedown={(e) => wrap(e, 'onmousedown') || noop}
  onmouseenter={(e) => wrap(e, 'onmouseenter') || noop}
  onmouseleave={(e) => wrap(e, 'onmouseleave') || noop}
  onmousemove={(e) => wrap(e, 'onmousemove') || noop}
  onmouseout={(e) => wrap(e, 'onmouseout') || noop}
  onmouseover={(e) => wrap(e, 'onmouseover') || noop}
  onmouseup={(e) => wrap(e, 'onmouseup') || noop}
  onpaste={(e) => wrap(e, 'onpaste') || noop}
  onpause={(e) => wrap(e, 'onpause') || noop}
  onplay={(e) => wrap(e, 'onplay') || noop}
  onplaying={(e) => wrap(e, 'onplaying') || noop}
  onpointercancel={(e) => wrap(e, 'onpointercancel') || noop}
  onpointerdown={(e) => wrap(e, 'onpointerdown') || noop}
  onpointerenter={(e) => wrap(e, 'onpointerenter') || noop}
  onpointerleave={(e) => wrap(e, 'onpointerleave') || noop}
  onpointermove={(e) => wrap(e, 'onpointermove') || noop}
  onpointerout={(e) => wrap(e, 'onpointerout') || noop}
  onpointerover={(e) => wrap(e, 'onpointerover') || noop}
  onpointerup={(e) => wrap(e, 'onpointerup') || noop}
  onprogress={(e) => wrap(e, 'onprogress') || noop}
  onratechange={(e) => wrap(e, 'onratechange') || noop}
  onreset={(e) => wrap(e, 'onreset') || noop}
  onresize={(e) => wrap(e, 'onresize') || noop}
  onscroll={(e) => wrap(e, 'onscroll') || noop}
  onscrollend={(e) => wrap(e, 'onscrollend') || noop}
  onseeked={(e) => wrap(e, 'onseeked') || noop}
  onseeking={(e) => wrap(e, 'onseeking') || noop}
  onselect={(e) => wrap(e, 'onselect') || noop}
  onselectionchange={(e) => wrap(e, 'onselectionchange') || noop}
  onselectstart={(e) => wrap(e, 'onselectstart') || noop}
  onstalled={(e) => wrap(e, 'onstalled') || noop}
  onsubmit={(e) => wrap(e, 'onsubmit') || noop}
  onsuspend={(e) => wrap(e, 'onsuspend') || noop}
  ontimeupdate={(e) => wrap(e, 'ontimeupdate') || noop}
  ontoggle={(e) => wrap(e, 'ontoggle') || noop}
  ontouchcancel={(e) => wrap(e, 'ontouchcancel') || noop}
  ontouchend={(e) => wrap(e, 'ontouchend') || noop}
  ontouchmove={(e) => wrap(e, 'ontouchmove') || noop}
  ontouchstart={(e) => wrap(e, 'ontouchstart') || noop}
  ontransitioncancel={(e) => wrap(e, 'ontransitioncancel') || noop}
  ontransitionend={(e) => wrap(e, 'ontransitionend') || noop}
  ontransitionrun={(e) => wrap(e, 'ontransitionrun') || noop}
  ontransitionstart={(e) => wrap(e, 'ontransitionstart') || noop}
  onvolumechange={(e) => wrap(e, 'onvolumechange') || noop}
  onwaiting={(e) => wrap(e, 'onwaiting') || noop}
  onwheel={(e) => wrap(e, 'onwheel') || noop}
/>
