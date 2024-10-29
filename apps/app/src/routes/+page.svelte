<script lang="ts">
  import { beforeNavigate, goto } from '$app/navigation';
  import {
    ProjectCard,
    Modal,
    Toast,
    CROSS,
    PROJECTS_DIR,
    MAPS,
    baseDir,
    notifications,
    project_store,
    current_project_name as cpn,
    generate_template_data,
    type DialogController,
    DEFAULT_DIR
  } from 'roguelighter-core';
  import {
    readDir,
    exists,
    remove,
    writeTextFile,
    readTextFile,
    mkdir,
    type DirEntry
  } from '@tauri-apps/plugin-fs';
  import JSON5 from 'json5';
  import { PUBLIC_APP_VERSION } from '$env/static/public';

  let projects: Array<DirEntry> = $state([]);
  let current_project_name = $state('');
  let delete_project_modal: DialogController | undefined = $state();
  let new_project_name = $state('');
  let new_project_modal: DialogController | undefined = $state();
  let new_project_input_element: HTMLInputElement | undefined = $state();
  let loading_screen: DialogController | undefined = $state();

  // FIXME: forbidden to read images from disk

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
    new_project_modal?.close();
    open_project(new_project_name);
  }

  async function open_project(project_name: string) {
    const res = await readTextFile(`${PROJECTS_DIR}\\${project_name}\\data.json`, { baseDir });
    let parsed = JSON5.parse(res);
    parsed.scenes = parsed.scenes.length ? new Map(parsed.scenes) : new Map();

    for (let scene of parsed.scenes.values()) {
      for (let map of MAPS) {
        scene[map] =
          Array.isArray(scene[map]) && scene[map].length ? new Map(scene[map]) : new Map();
      }
    }

    project_store.set(parsed);
    cpn.set(project_name);
    goto('/project');
  }

  async function delete_project() {
    delete_project_modal?.close();
    await remove(`${PROJECTS_DIR}\\${current_project_name}`, {
      baseDir,
      recursive: true
    });
    projects = projects.filter(({ name }) => name != current_project_name);
    notifications.success(`Removed project [${current_project_name}] successfully.`);
  }

  async function get_projects() {
    if (!(await exists(DEFAULT_DIR, { baseDir }))) {
      await mkdir(DEFAULT_DIR, { baseDir });
    }

    if (!(await exists(PROJECTS_DIR, { baseDir }))) {
      await mkdir(PROJECTS_DIR, { baseDir });
    }

    projects = await readDir(PROJECTS_DIR, { baseDir });
  }

  async function on_project_open(project: DirEntry) {
    open_project(project.name as string);
  }
</script>

{#await get_projects() then _}
  <main class="flex flex-col items-center bg-zinc-700 w-full h-full text-zinc-200">
    <div class="w-full max-w-xl p-4">
      <div class="flex flex-row items-end justify-between">
        <h3>Projects</h3>
        <div class="inline-flex gap-2">
          <span class="text-xs self-end">v{PUBLIC_APP_VERSION}</span>
          <button
            class="btn-primary"
            onclick={() => {
              new_project_modal?.open();
            }}>New Project</button
          >
        </div>
      </div>
      <div class="flex flex-col gap-2 pt-4">
        {#each projects as project}
          <ProjectCard
            {project}
            open_project={() => on_project_open(project)}
            delete_project={() => {
              current_project_name = project.name;
              delete_project_modal?.open();
            }}
          ></ProjectCard>
        {:else}
          <p>You don't have any projects.</p>
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
      <button class="absolute top-2 right-4" onclick={() => new_project_modal?.close()}
        >{CROSS}</button
      >
    </Modal>

    <Modal bind:dialog={delete_project_modal}>
      <h3>Delete project "{current_project_name}"?</h3>
      <div class="flex flex-row gap-2 w-full justify-end pt-4">
        <button onclick={() => delete_project_modal?.close()} class=" btn-ghost">Cancel</button>
        <button class="btn-primary" onclick={delete_project}>Delete</button>
      </div>
    </Modal>

    <Modal bind:dialog={loading_screen} locked>Loading...</Modal>
    <Toast></Toast>
  </main>
{/await}
