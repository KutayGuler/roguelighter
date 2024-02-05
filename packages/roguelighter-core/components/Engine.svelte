<script lang="ts">
  // import RunCSS from 'runcss';
  // const { processClasses, stopWatching } = RunCSS();
  import 'svooltip/styles.css';
  import CodeEditor from './ide/CodeEditor.svelte';
  import Game from './game/Game.svelte';
  import SceneEditor from './editor/SceneEditor.svelte';
  import Toast from './editor/Toast.svelte';
  import { current_project_name, notifications } from '../store';
  import {
    debounce,
    get_asset_asset_urls,
    get_tailwind_classes,
    parse_code,
    processClasses
  } from '../utils';
  import type { RoguelighterProject } from '../types';
  import { writeTextFile } from '@tauri-apps/api/fs';
  import { DEFAULT_DIR, MAPS, dir } from '../constants';

  export let project: RoguelighterProject;
  let current_scene_id = 0;
  let view: 'code' | 'scene' | 'game' = 'code';

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

  const handle = false
    ? () => {}
    : (e: KeyboardEvent) => {
        if (e.ctrlKey && e.code == 'KeyT') {
          if (view == 'scene') {
            switch_to_game();
          } else if (view == 'game') {
            view = 'scene';
          }
        }
      };

  $: {
    let parsed = parse_code(project.code);

    if (typeof parsed == 'object') {
      processClasses(Array.from(get_tailwind_classes(parsed.gui).values()).join(' '));
      project.parsed_code = parsed;
      calc_asset_urls();
    }
  }

  let asset_urls = new Map<string, string>();

  async function calc_asset_urls() {
    asset_urls = await get_asset_asset_urls(
      $current_project_name,
      project.parsed_code.agents,
      project.parsed_code.backgrounds
    );
  }

  function save_file() {
    let scenes = structuredClone(project.scenes);

    for (let scene of scenes.values()) {
      for (let map of MAPS) {
        // @ts-expect-error
        scene[map] = Array.from(scene[map]);
      }
    }

    let obj = { code: project.code, scenes: Array.from(scenes) };
    let file_contents = JSON.stringify(obj);

    writeTextFile(`${DEFAULT_DIR}\\${$current_project_name}\\data.json`, file_contents, { dir });
  }

  $: view, save_file();
</script>

<svelte:window on:keydown={handle} />

{#await calc_asset_urls() then _}
  <main class="relative flex flex-col w-full h-full overflow-hidden">
    <div
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
        class="{view == 'code'
          ? 'btn-view-selected'
          : 'btn-view'} btn-md text-sm text-white flex items-center"
        on:click={() => (view = 'code')}>Code</button
      >
      <button
        class="{view != 'code'
          ? 'btn-view-selected'
          : 'btn-view'} btn-md text-sm text-white flex items-center"
        on:click={() => {
          view = 'scene';
        }}>Scene</button
      >
    </div>
    {#if view == 'scene'}
      <SceneEditor
        bind:asset_urls
        bind:current_scene_id
        bind:project
        on:change={debounce(save_file, 100)}
        on:switch_view={switch_to_game}
      />
    {:else if view == 'game'}
      <Game bind:asset_urls bind:current_scene_id bind:project />
    {/if}
    <div class="absolute top-12 left-0 h-screen w-screen {view == 'code' ? 'z-10' : '-z-10'}">
      <CodeEditor bind:code={project.code} on:change={debounce(save_file, 200)}></CodeEditor>
    </div>
    <Toast />
  </main>
{/await}
