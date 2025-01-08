<script lang="ts">
  import { page } from '$app/stores';
</script>

<div class="flex flex-col items-center justify-center h-full pb-64">
  <h3 class="text-purple-500">{$page.status}</h3>
  <h1 class="serif">Whoops!</h1>
  <p class="text-sm text-base-400 pt-4">{$page.error?.message}</p>
</div>
