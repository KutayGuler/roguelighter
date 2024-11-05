<script>
  import 'roguelighter-core/styles.css';
  import 'tippy.js/dist/tippy.css'; // optional for styling
  import '../app.css';
  import Toaster from '$lib/svelte-french-toast/components/Toaster.svelte';
  import { onMount } from 'svelte';
  import { document_path } from '$lib/state.svelte'
  import { documentDir } from '@tauri-apps/api/path';
  let { children } = $props();
  onMount(async () => {
    document_path.value = await documentDir() 
  })
</script>

{@render children()}

<Toaster></Toaster>