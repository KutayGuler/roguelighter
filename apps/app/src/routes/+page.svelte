<script lang="ts">
  import { beforeNavigate, goto, invalidate } from '$app/navigation';
  import {
    Modal,
    CROSS,
    PROJECTS_DIR,
    baseDir,
    generate_template_data,
    TOAST_SETTINGS
  } from 'roguelighter-core';
  import { writeTextFile, mkdir, type DirEntry, remove } from '@tauri-apps/plugin-fs';
  import { PUBLIC_APP_VERSION } from '$env/static/public';
  import { createDialog } from 'svelte-headlessui';
  import { watch } from '@tauri-apps/plugin-fs';
  import toast from '$lib/svelte-french-toast/core/toast.js';
  import ProjectCard from '$lib/ProjectCard.svelte';

  // BACKLOG: cannot select any project after returning to home from a project

  let { data } = $props();

  let projects: Array<DirEntry> = $derived(data.projects);
  let current_project_name = $state('');
  let new_project_name = $state('');
  let new_project_input_element: HTMLInputElement | undefined = $state();

  let delete_project_modal = $state(createDialog({ label: '' }));
  let new_project_modal = $state(createDialog({ label: '' }));
  let loading_screen = $state(createDialog({ label: '' }));

  beforeNavigate(() => {
    if ($loading_screen) {
      $loading_screen.expanded = true;
    }
  });

  function trimEnds(str: string) {
    return str.trimEnd().trimStart();
  }

  function on_new_project_input(e: Event) {
    // @ts-expect-error
    if (projects.map(({ name }) => name).includes(trimEnds(e.target.value))) {
      new_project_input_element?.setCustomValidity('There is already a project with this name');
    } else {
      new_project_input_element?.setCustomValidity('');
    }
  }

  async function create_project(e: SubmitEvent) {
    // BACKLOG: any of the following steps could fail?
    e.preventDefault();
    await mkdir(`${PROJECTS_DIR}\\${new_project_name}`, {
      baseDir
    });
    await mkdir(`${PROJECTS_DIR}\\${new_project_name}\\assets`, {
      baseDir
    });
    await Promise.all([
      mkdir(`${PROJECTS_DIR}\\${new_project_name}\\assets\\backgrounds`, {
        baseDir
      }),
      mkdir(`${PROJECTS_DIR}\\${new_project_name}\\assets\\agents`, {
        baseDir
      })
    ]);
    await writeTextFile(
      `${PROJECTS_DIR}\\${new_project_name}\\data.json`,
      generate_template_data(),
      { baseDir }
    );
    new_project_modal.close();
    goto('/projects/' + new_project_name + '?initial=true');
  }

  async function delete_project() {
    delete_project_modal.close();

    try {
      await remove(`${PROJECTS_DIR}\\${current_project_name}`, {
        baseDir,
        recursive: true
      });
      // BACKLOG: make the current_project_name bold
      toast.success(`Removed project ${current_project_name} successfully.`, TOAST_SETTINGS);
      invalidate('page:projects');
    } catch (e) {
      toast.error('Failed to remove the project');
    }
  }

  // BACKLOG: getting VM level TypeError: window["_" + 12312323] is not a function
  watch(
    data.projects_dir,
    async (e) => {
      try {
        if (e.type) {
          await invalidate('page:projects');
        }
      } catch (e) {
        console.log(e);
      }
    },
    {
      delayMs: 200
    }
  );
</script>

<main class="flex flex-col items-center w-full h-full">
  <div class="w-full max-w-xl p-4">
    <div class="flex flex-row items-end justify-between">
      <h3>Projects</h3>
      <div class="relative inline-flex gap-2">
        <span class="text-xs self-end">v{PUBLIC_APP_VERSION}</span>
        <button
          class="btn-primary"
          onclick={() => {
            new_project_modal?.open();
          }}>New Project</button
        >
        <a href="/settings" aria-labelledby="settings" class="absolute top-1 -right-10">
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
              d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
        </a>
      </div>
    </div>
    <div class="flex flex-col gap-2 pt-4">
      {#each projects as project}
        <ProjectCard
          {project}
          delete_project={() => {
            current_project_name = project.name;
            delete_project_modal?.open();
          }}
        ></ProjectCard>
      {:else}
        <p class="text-base-300">You don't have any projects.</p>
      {/each}
    </div>
  </div>

  <Modal bind:dialog={new_project_modal}>
    <h3 class="pb-4">Create a new project</h3>
    <form class="flex flex-col gap-4" onsubmit={create_project}>
      <label class="flex flex-col" for="name">
        Name
        <input
          required
          type="text"
          oninput={on_new_project_input}
          bind:value={new_project_name}
          bind:this={new_project_input_element}
        />
      </label>
      <button class="btn-primary">Create</button>
    </form>
    <button class="absolute top-2 right-4" onclick={() => new_project_modal.close()}>{CROSS}</button
    >
  </Modal>

  <Modal bind:dialog={delete_project_modal}>
    <h3>Delete project "{current_project_name}"?</h3>
    <div class="flex flex-row gap-2 w-full justify-end pt-4">
      <button onclick={() => delete_project_modal.close()} class=" btn-ghost">Cancel</button>
      <button class="btn-danger" onclick={delete_project}>Delete</button>
    </div>
  </Modal>

  <Modal bind:dialog={loading_screen} locked>Loading...</Modal>
</main>
