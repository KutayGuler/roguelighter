<script lang="ts">
  let {
    window_handlers,
    variables = $bindable(),
    functions = $bindable(),
    PROCESS,
    on_window_handler_failed
  } = $props();
  function wrap<K extends keyof WindowEventMap>(e: WindowEventMap[K]) {
    if (window_handlers['on' + e.type]) {
      try {
        window_handlers['on' + e.type](e, variables, functions, PROCESS);
      } catch (e) {
        on_window_handler_failed(e);
      }
      window.dispatchEvent(new Event('fired_event'));
    }
  }
</script>

<svelte:window
  onabort={wrap}
  onanimationend={wrap}
  onanimationiteration={wrap}
  onanimationstart={wrap}
  onauxclick={wrap}
  onbeforeinput={wrap}
  onbeforetoggle={wrap}
  onblur={wrap}
  oncancel={wrap}
  oncanplay={wrap}
  oncanplaythrough={wrap}
  onchange={wrap}
  onclick={wrap}
  onclose={wrap}
  oncompositionend={wrap}
  oncompositionstart={wrap}
  oncompositionupdate={wrap}
  oncontextmenu={wrap}
  oncopy={wrap}
  oncuechange={wrap}
  oncut={wrap}
  ondblclick={wrap}
  ondrag={wrap}
  ondragend={wrap}
  ondragenter={wrap}
  ondragleave={wrap}
  ondragover={wrap}
  ondragstart={wrap}
  ondrop={wrap}
  ondurationchange={wrap}
  onemptied={wrap}
  onended={wrap}
  onerror={wrap}
  onfocus={wrap}
  onfocusin={wrap}
  onfocusout={wrap}
  onformdata={wrap}
  ongotpointercapture={wrap}
  oninput={wrap}
  oninvalid={wrap}
  onkeydown={wrap}
  onkeypress={wrap}
  onkeyup={wrap}
  onload={wrap}
  onloadeddata={wrap}
  onloadedmetadata={wrap}
  onloadstart={wrap}
  onlostpointercapture={wrap}
  onmousedown={wrap}
  onmouseenter={wrap}
  onmouseleave={wrap}
  onmousemove={wrap}
  onmouseout={wrap}
  onmouseover={wrap}
  onmouseup={wrap}
  onpaste={wrap}
  onpause={wrap}
  onplay={wrap}
  onplaying={wrap}
  onpointercancel={wrap}
  onpointerdown={wrap}
  onpointerenter={wrap}
  onpointerleave={wrap}
  onpointermove={wrap}
  onpointerout={wrap}
  onpointerover={wrap}
  onpointerup={wrap}
  onprogress={wrap}
  onratechange={wrap}
  onreset={wrap}
  onresize={wrap}
  onscroll={wrap}
  onscrollend={wrap}
  onseeked={wrap}
  onseeking={wrap}
  onselect={wrap}
  onselectionchange={wrap}
  onselectstart={wrap}
  onstalled={wrap}
  onsubmit={wrap}
  onsuspend={wrap}
  ontimeupdate={wrap}
  ontoggle={wrap}
  ontouchcancel={wrap}
  ontouchend={wrap}
  ontouchmove={wrap}
  ontouchstart={wrap}
  ontransitioncancel={wrap}
  ontransitionend={wrap}
  ontransitionrun={wrap}
  ontransitionstart={wrap}
  onvolumechange={wrap}
  onwaiting={wrap}
  onwheel={wrap}
/>
