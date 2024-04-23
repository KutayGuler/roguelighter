<script lang="ts">
  import { goto } from '$app/navigation';
  import { navigating } from '$app/stores';
  import {
    ProjectCard,
    Modal,
    Toast,
    CROSS,
    DEFAULT_DIR,
    MAPS,
    dir,
    notifications,
    project_store,
    current_project_name as cpn,
    generate_template_data
  } from 'roguelighter-core';
  import {
    createDir,
    readDir,
    exists,
    removeDir,
    writeTextFile,
    readTextFile,
    type FileEntry
  } from '@tauri-apps/api/fs';
  import { Command } from '@tauri-apps/api/shell';

  let projects: Array<FileEntry> = [];
  let current_project_name = '';
  let delete_project_modal = false;
  let new_project_name = '';
  let new_project_modal = false;
  let new_project_input_element: HTMLInputElement;
  let loading_screen = false;
  $: loading_screen = $navigating == null ? false : true;

  function trimEnds(str: string) {
    return str.trimEnd().trimStart();
  }

  function on_new_project_input(e: Event) {
    if (
      projects
        .map(({ name }) => name)
        // @ts-expect-error
        .includes(trimEnds(e.target.value))
    ) {
      new_project_input_element.setCustomValidity('There is already a project with this name');
    } else {
      new_project_input_element.setCustomValidity('');
    }
  }

  async function create_project() {
    await createDir(`${DEFAULT_DIR}\\${new_project_name}`, {
      dir,
      recursive: true
    });
    await createDir(`${DEFAULT_DIR}\\${new_project_name}\\assets`, {
      dir,
      recursive: true
    });
    await writeTextFile(
      `${DEFAULT_DIR}\\${new_project_name}\\data.json`,
      generate_template_data(),
      { dir }
    );
    new_project_modal = false;
    open_project(new_project_name);
  }

  async function open_project(project_name: string) {
    const res = await readTextFile(`${DEFAULT_DIR}\\${project_name}\\data.json`, { dir });
    let parsed = JSON.parse(res);
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
    delete_project_modal = false;
    await removeDir(`${DEFAULT_DIR}\\${current_project_name}`, {
      dir,
      recursive: true
    });
    projects = projects.filter(({ name }) => name != current_project_name);
    notifications.success(`Removed project [${current_project_name}] successfully.`);
  }

  async function get_projects() {
    let _exists = await exists(DEFAULT_DIR, { dir });
    if (!_exists) {
      await createDir(DEFAULT_DIR, { dir, recursive: true });
      return;
    }

    projects = await readDir(DEFAULT_DIR, { dir, recursive: true });
  }

  async function on_project_open(project: FileEntry) {
    open_project(project.name as string);
  }

  // TODO: copy contents, create UI for exporting

  const commands: Array<[string, { cwd: string }]> = [
    // ['rd /s /q export', { cwd: '../../../' }],
    // ['mkdir export', { cwd: '../../../' }],
    // [
    //   'git clone https://github.com/roguelighterengine/roguelighter.git .',
    //   { cwd: '../../../export' }
    // ],
    // ['npm install', { cwd: '../../../export' }],
    [
      'npm run tauri build',
      {
        cwd: '../../../export/apps/export-app'
      }
    ]
  ];

  async function exec() {
    for (let [command, opts] of commands) {
      let c = new Command('cmd', ['/C', command], opts);
      c.on('close', (data) => {
        console.log(`command finished with code ${data.code} and signal ${data.signal}`);
      });
      c.on('error', (error) => console.error(`command error: "${error}"`));
      c.stdout.on('data', (line) => console.log(`command stdout: "${line}"`));
      c.stderr.on('data', (line) => console.log(`command stderr: "${line}"`));
      await c.execute();
    }
  }
</script>

<!-- <button class="btn-success" on:click={exec}>execute</button> -->

{#await get_projects() then _}
  <main class="flex flex-col items-center bg-zinc-700 w-full h-full text-zinc-200">
    <div class="w-full max-w-xl p-4">
      <div class="flex flex-row items-end justify-between">
        <h3 class="h3">Projects</h3>
        <button on:click={() => (new_project_modal = true)} class="btn-success btn-md btn-md"
          >New Project</button
        >
      </div>
      <div class="flex flex-col gap-2 pt-4">
        {#each projects as project}
          <ProjectCard
            {project}
            on:open={() => on_project_open(project)}
            on:delete={() => {
              current_project_name = project.name;
              delete_project_modal = true;
            }}
          ></ProjectCard>
        {/each}
      </div>
    </div>

    <Modal bind:visible={delete_project_modal}>
      <h3 class="h3">Delete project "{current_project_name}"?</h3>
      <div class="flex flex-row gap-2 w-full justify-end pt-4">
        <button on:click={() => (delete_project_modal = false)} class="btn-md btn-ghost"
          >Cancel</button
        >
        <button on:click={delete_project} class="btn-md btn-alert">Delete</button>
      </div>
    </Modal>

    <Modal bind:visible={new_project_modal}>
      <h3 class="h3 pb-4">Create a new project</h3>
      <form class="flex flex-col gap-4" on:submit|preventDefault={create_project}>
        <label class="flex flex-col" for="name">
          Name
          <input
            class="input"
            required
            type="text"
            on:input={on_new_project_input}
            bind:value={new_project_name}
            bind:this={new_project_input_element}
          />
        </label>
        <button class="btn-success btn-md w-full">Create</button>
      </form>
      <button class="absolute top-2 right-4" on:click={() => (new_project_modal = false)}
        >{CROSS}</button
      >
    </Modal>
    <Modal bind:visible={loading_screen} locked>Loading...</Modal>
    <Toast></Toast>
  </main>
{/await}
