<script>
  import 'roguelighter-core/styles.css';
  import 'tippy.js/dist/tippy.css';
  import 'tippy.js/themes/light.css';
  import Toaster from '$lib/svelte-french-toast/components/Toaster.svelte';
  import tippy from 'tippy.js';

  let { children } = $props();

  $effect(() => {
    tippy.setDefaultProps({
      theme: 'light'
    });
  });
</script>

{@render children()}

<Toaster></Toaster>
