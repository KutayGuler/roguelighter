<script>
  import 'roguelighter-tailwind/styles.css';
  import 'tippy.js/dist/tippy.css'; // optional for styling
  // import Toaster from '$lib/svelte-french-toast/components/Toaster.svelte';

  let { children } = $props();
</script>

{@render children()}

<!-- <Toaster></Toaster> -->
