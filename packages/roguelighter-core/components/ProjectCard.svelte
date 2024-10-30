<script module>
    interface Props {
    project: DirEntry;
    delete_project: Function
  }
</script>

<script lang="ts">
  import type { DirEntry } from '@tauri-apps/plugin-fs';
  import Dropdown from './editor/Dropdown.svelte';
  let { project, delete_project }: Props = $props();
</script>

<div class="relative flex flex-row justify-between items-center bg-zinc-800 rounded p-4 shadow-lg">
  <span>{project.name}</span>
  <div class="flex flex-row items-center justify-center gap-2">
    <a aria-label="Project {project.name}" href="/projects/{project.name}" class="btn-ghost">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z"
        />
      </svg>
    </a>

    <Dropdown>
      {#snippet button()}
            <svg
          
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
          />
        </svg>
          {/snippet}
      {#snippet items()}
            <div
          class="bg-zinc-700 rounded p-4 flex flex-col gap-2 items-start shadow-lg z-10"
          
        >
          <button onclick={() => delete_project()} class="hover:text-red-400 ease-out duration-150"
            >Delete project</button
          >
        </div>
          {/snippet}
    </Dropdown>
  </div>
</div>
