<script lang="ts">
  import { page } from '$app/stores';
  console.log($page);
</script>

<div class="flex flex-col items-center justify-center h-full pb-64">
  <h3 class="text-purple-400">{$page.status}</h3>
  <h1 class="serif">Whoopsie!</h1>
  <p class="text-sm text-base-400 pt-4">{$page.error?.message}</p>
</div>
