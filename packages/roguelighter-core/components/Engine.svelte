<script lang="ts">
  import 'svooltip/styles.css';
  import CodeEditor from './ide/CodeEditor.svelte';
  import Game from './game/Game.svelte';
  import SceneEditor from './editor/SceneEditor.svelte';
  import Toast from './editor/Toast.svelte';
  import { current_project_name, notifications } from '../store';
  import {
    debounce,
    get_asset_urls,
    get_tailwind_classes,
    code_string_to_json,
    processClasses
  } from '../utils';
  import type { GameData, RoguelighterDataFile, RoguelighterProject } from '../types';
  import { writeTextFile } from '@tauri-apps/api/fs';
  import { DEFAULT_DIR, DEFAULT_EXPORT_DIR, MAPS, dir } from '../constants';
  import { Command } from '@tauri-apps/api/shell';

  export let project: RoguelighterProject;
  let current_scene_id = 0;
  let view: 'code' | 'scene' | 'game' = 'code';
  let code_changed = false;

  function switch_to_game() {
    let current_scene = project.scenes.get(current_scene_id);
    if (view == 'scene') {
      if (!current_scene) {
        notifications.danger('No scene is selected, cannot start the game');
        return;
      }

      if (![...current_scene.agents.values()].includes('player')) {
        notifications.danger('Player is not in the scene, cannot start the game');
        return;
      }
    }

    view = 'game';
  }

  function handle(e: KeyboardEvent) {
    if (e.ctrlKey) {
      switch (e.code) {
        case 'KeyT': {
          if (view == 'scene') {
            switch_to_game();
          } else if (view == 'game') {
            view = 'scene';
          }
          break;
        }
        case 'KeyS': {
          recalculate();
          save_file();
          break;
        }
      }
    }
  }

  let bg_asset_urls = new Map<string, string>();
  let agent_asset_urls = new Map<string, any>();

  async function calc_asset_urls() {
    try {
      ({ backgrounds: bg_asset_urls, agents: agent_asset_urls } = await get_asset_urls(
        $current_project_name,
        (code_string_to_json(project.code) as GameData).agents
      ));
    } catch (e) {
      console.log(e);
    }
  }

  function save_file() {
    let scenes = structuredClone(project.scenes);

    for (let scene of scenes.values()) {
      for (let map of MAPS) {
        // @ts-expect-error
        scene[map] = Array.from(scene[map]);
      }
    }

    let obj: RoguelighterDataFile = { code: project.code, scenes: Array.from(scenes) };
    let file_contents = JSON.stringify(obj);

    writeTextFile(`${DEFAULT_DIR}\\${$current_project_name}\\data.json`, file_contents, { dir });

    code_changed = false;
  }

  import { join, documentDir } from '@tauri-apps/api/path';
  import Agent from './game/Agent.svelte';

  const commands: Array<string> = [
    // TODO:
    // # Create Roguelighter Exports/cache
    // # git clone --filter=blob:none --sparse https://github.com/roguelighter
    // # git sparse-checkout add apps/export-app
    // # npm i
    // # git sparse-checkout add packages/roguelighter-core
    // # manipulate apps/export-app/src/routes/+page.svelte to match the project (reset every time)
    // # delete everything in static, copy assets from original project to static, generate asset_urls
    // # get to the root of export-app
    // # npm run tauri build
    // # wait for build
    // # cd src-tauri/target/release
    // # copy roguelighter-export-app.exe to Roguelighter Projects/[project]/export/[platform]
    'export'
    // 'export'
  ];

  async function export_game() {
    const documents = await documentDir();
    const project_path = await join(documents, `${DEFAULT_DIR}/${$current_project_name}`);

    const bat_name = 'export';
    const bat_content = `
cd ../..

if not exist "${DEFAULT_EXPORT_DIR}" (
  mkdir "${DEFAULT_EXPORT_DIR}"
  cd "${DEFAULT_EXPORT_DIR}"
  git clone --filter=blob:none --sparse https://github.com/roguelighterengine/roguelighter cache
  cd cache
  git sparse-checkout add apps/export-app
  git sparse-checkout add packages/roguelighter-core
  npm i
  cd apps/export-app

  cd ${project_path}
  del ${bat_name}.bat
) else (
  cd ${project_path}
  del ${bat_name}.bat
)
`;

    await writeTextFile(project_path + '/' + bat_name + '.bat', bat_content);

    for (let command of commands) {
      let c = new Command('cmd', ['/C', command], { cwd: project_path, encoding: 'utf-8' });
      c.on('close', (data) => {
        console.log(`command finished with code ${data.code} and signal ${data.signal}`);
      });
      c.on('error', (error) => console.error(`command error: "${error}"`));
      c.stdout.on('data', (line) => console.log(`command stdout: "${line}"`));
      c.stderr.on('data', (line) => console.log(`command stderr: "${line}"`));
      await c.execute();
    }
  }

  function recalculate() {
    let parsed = code_string_to_json(project.code);

    if (typeof parsed == 'object') {
      processClasses(Array.from(get_tailwind_classes(parsed.gui).values()).join(' '));
      calc_asset_urls();
    }
  }

  $: view, save_file(), recalculate();
</script>

<svelte:window on:keydown={handle} />

{#await calc_asset_urls() then _}
  <main class="relative flex flex-col w-full h-full overflow-hidden select-none">
    <nav
      class="absolute top-0 z-50 bg-zinc-800 w-full h-12 flex flex-row items-center justify-center gap-2 p-2 px-4 text-zinc-200"
    >
      <a href="/" class="absolute top-3 left-3"
        ><svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6 hover:text-emerald-400 duration-150 ease-out"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125
           1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
          />
        </svg>
      </a>
      <button
        title={code_changed ? 'The code has unsaved changes' : ''}
        class="{view == 'code'
          ? 'btn-view-selected'
          : 'btn-view'} btn-md text-sm text-white flex items-center"
        on:click={() => (view = 'code')}>Code {code_changed ? '*' : ''}</button
      >
      <button
        class="{view != 'code'
          ? 'btn-view-selected'
          : 'btn-view'} btn-md text-sm text-white flex items-center"
        on:click={() => {
          view = 'scene';
        }}>Scene</button
      >
      <!-- <button on:click={export_game}>Export</button> -->
    </nav>
    {#if view == 'scene'}
      <SceneEditor
        bind:bg_asset_urls
        bind:agent_asset_urls
        bind:current_scene_id
        bind:project
        on:change={debounce(save_file, 100)}
        on:switch_view={switch_to_game}
      />
    {:else if view == 'game'}
      <Game bind:bg_asset_urls bind:agent_asset_urls bind:current_scene_id bind:project />
    {/if}
    <div class="absolute top-12 left-0 h-screen w-screen {view == 'code' ? 'z-10' : '-z-10'}">
      <CodeEditor bind:code={project.code} on:change={() => (code_changed = true)}></CodeEditor>
    </div>
    <Toast />
  </main>
{/await}
