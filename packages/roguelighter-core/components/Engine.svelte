<script module>
  import type { ParseErrorObject, RoguelighterProject, UUID } from '../types/engine';

  interface Props {
    DEV?: boolean;
    isWeb?: boolean;
    project: RoguelighterProject;
    document_path: string;
    on_no_scene_is_selected: Function;
    process_classes: Function;
    exportCSS: Function;
  }
</script>

<script lang="ts">
  import JSON5 from 'json5';
  import CodeEditor from './ide/CodeEditor.svelte';
  import SceneEditor from './editor/SceneEditor.svelte';
  import Game from './game/Game.svelte';
  import {
    code_string_to_json,
    generate_asset_urls,
    process_entries_recursively,
    extract_tailwind_classes
  } from '../utils';
  import { EXPORT_DIR, MAPS, PROJECTS_DIR, baseDir } from '../constants';
  import { exit } from '@tauri-apps/plugin-process';
  import { readDir, watchImmediate, writeTextFile } from '@tauri-apps/plugin-fs';
  import { join } from '@tauri-apps/api/path';
  import { Command } from '@tauri-apps/plugin-shell';
  import type { RoguelighterDataFile, View } from '../types/engine';
  import type { Setup } from '../types/game';
  import { onDestroy } from 'svelte';

  // BACKLOG: sometimes editor styles not loading

  let {
    project = $bindable(),
    DEV = true,
    isWeb = false,
    document_path,
    on_no_scene_is_selected,
    process_classes,
    exportCSS
  }: Props = $props();
  let current_scene_id: UUID | undefined = $state();
  let view: View = $state('code');
  let previousView: View = $state('scene');
  let code_button: HTMLButtonElement | undefined = $state();
  let scene_button: HTMLButtonElement | undefined = $state();
  // @ts-expect-error
  let agents: Setup['agents'] = $state();
  let code_editor: any = $state();
  let initialized = $state(false);
  let code_with_errors = $state('');
  let error_line = $state(0);
  let parse_errors: ParseErrorObject = $state({ code: '', json_string: '', error: '' });
  let agents_file_path = '';
  let bg_file_path = '';
  let bg_entries, agents_entries;

  function switch_to_game() {
    // @ts-expect-error
    let current_scene = project.scenes.get(current_scene_id);
    if (view == 'scene') {
      if (!current_scene) {
        on_no_scene_is_selected();
        return;
      }

      // if (![...current_scene.agents.values()].includes('player')) {
      //   _in_scene();
      //   return;
      // }
    }

    change_view('game');
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
          code_editor.format_document();
          recalculate();
          save_file();
          break;
        }
      }
    }
  }

  let bg_asset_urls = $state(new Map<string, string>());
  let agent_asset_urls = $state(new Map<string, any>());

  function save_file(code?: string) {
    let scenes = structuredClone(project.scenes);

    for (let scene of scenes.values()) {
      for (let map of MAPS) {
        // @ts-expect-error
        scene[map] = Array.from(scene[map]);
      }
    }

    let obj: RoguelighterDataFile = { code: code || project.code, scenes: Array.from(scenes) };
    let file_contents = JSON5.stringify(obj);

    writeTextFile(`${PROJECTS_DIR}\\${project.name}\\data.json`, file_contents, {
      baseDir
    });
  }

  // function save_edited

  const commands: Array<string> = [
    // BACKLOG:
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
    const project_path = await join(document_path, `${PROJECTS_DIR}/${project.name}`);
    // TODO: error handling
    // create UI for export

    const bat_name = 'export';
    const bat_content = `
cd ../..

if not exist "${EXPORT_DIR}" (
  mkdir "${EXPORT_DIR}"
  cd "${EXPORT_DIR}"
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
      let c = Command.create('cmd', ['/C', command], { cwd: project_path, encoding: 'utf-8' });
      c.on('close', (data) => {
        console.log(`command finished with code ${data.code} and signal ${data.signal}`);
      });
      c.on('error', (error) => console.error(`command error: "${error}"`));
      c.stdout.on('data', (line) => console.log(`command stdout: "${line}"`));
      c.stderr.on('data', (line) => console.log(`command stderr: "${line}"`));
      await c.execute();
    }
  }

  async function recalculate() {
    let parsed = code_string_to_json(project.code);
    if (!parsed) throw new Error('Parsing result is undefined');

    if ((parsed as ParseErrorObject).error) {
      parse_errors = parsed as ParseErrorObject;
      code_with_errors = (parsed as ParseErrorObject).code;
      error_line = parseInt(parse_errors.error?.split('at')[1]?.split(':')[0]) || 0;
      return;
    }

    const extracted_classes = extract_tailwind_classes(JSON.stringify((parsed as Setup).gui));
    // console.log(extracted_classes);
    process_classes(extracted_classes);
    // console.log(exportCSS());

    [agent_asset_urls, bg_asset_urls] = await Promise.all([
      generate_asset_urls(project.name, 'agents', document_path),
      generate_asset_urls(project.name, 'backgrounds', document_path)
    ]);
    agents = (parsed as Setup).agents;
    initialized = true;
  }

  function change_view(v: View) {
    previousView = view;
    view = v;
    save_file();
    recalculate();
  }

  function highlight(pre: HTMLPreElement) {
    const lines = pre.textContent?.split('\n');
    if (!lines || !parse_errors.error || !parse_errors.error.includes('at')) return;

    let line_number = parseInt(parse_errors?.error?.split('at')[1].split(':')[0]) || 0;

    const line = lines[line_number - 1];

    if (line) {
      let text = pre.innerHTML?.replace(
        line,
        `<span id="error" class="bg-red-600 w-full">${line}</span>`
      );
      pre.innerHTML = text;
    }
  }

  function unfocus_from_code_editor() {
    code_button?.focus();
  }

  function unfocus_from_scene_editor() {
    scene_button?.focus();
  }

  let unwatch: any;

  (async () => {
    if (!isWeb) {
      agents_file_path = await join(
        document_path as string,
        `${PROJECTS_DIR}/${project.name}/assets/agents`
      );
      bg_file_path = await join(
        document_path as string,
        `${PROJECTS_DIR}/${project.name}/assets/backgrounds`
      );
    }

    unwatch = await watchImmediate(
      [bg_file_path, agents_file_path],
      async () => {
        if (code_editor) {
          [bg_entries, agents_entries] = await Promise.all([
            process_entries_recursively(bg_file_path, await readDir(bg_file_path), 'backgrounds'),
            process_entries_recursively(agents_file_path, await readDir(agents_file_path), 'agents')
          ]);

          code_editor.process_and_update(bg_entries, agents_entries);
        }
      },
      {
        recursive: true
      }
    );
  })();
  onDestroy(() => unwatch());

  recalculate();
</script>

<svelte:window onkeydown={handle} />

{#if initialized}
  <main class="relative flex flex-col w-full h-full overflow-hidden select-none">
    <nav
      class:opacity-50={view == 'game'}
      class="absolute top-0 z-40 bg-base-800 w-full h-12 flex flex-row items-center justify-between p-2 px-4 text-base-200"
    >
      <a aria-label="Home" href="/" class=""
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
      <div class="flex flex-row gap-2">
        <button
          bind:this={code_button}
          class:btn-primary={view == 'code'}
          class="btn-outline"
          onclick={() => {
            previousView = view;
            change_view('code');
          }}
          >Code
        </button>

        <!-- <button
          class:btn-primary={view == 'gui'}
          class="btn-outline"
          on:click={() => {
            change_view('gui')
          }}
          >GUI
        </button> -->
        <button
          bind:this={scene_button}
          class:btn-primary={view == 'scene'}
          class="btn-outline"
          onclick={() => {
            change_view('scene');
          }}>Scene</button
        >
        <!-- <button
          class:btn-primary={view == 'logs'}
          class="btn-outline"
          onclick={() => {
            change_view('logs');
          }}
          >Logs
        </button> -->
      </div>
      <span></span>
    </nav>
    {#if view == 'scene'}
      <SceneEditor
        bind:agents
        bind:project
        bind:bg_asset_urls
        bind:agent_asset_urls
        bind:current_scene_id
        {save_file}
        {switch_to_game}
        {unfocus_from_scene_editor}
      />
    {:else if view == 'game'}
      <Game
        DEV
        {project}
        {bg_asset_urls}
        {agent_asset_urls}
        {current_scene_id}
        on_exit={DEV ? () => change_view('scene') : exit}
      />
    {/if}
    <div
      class="absolute top-12 left-0 h-screen w-screen {view == 'code' ? 'z-10' : '-z-10 hidden'}"
    >
      <CodeEditor
        bind:view
        bind:project
        bind:this={code_editor}
        {unfocus_from_code_editor}
        {save_file}
      ></CodeEditor>
    </div>
  </main>
{:else}
  <main class="bg-base-700 h-full text-white p-4 flex flex-col gap-2">
    <p>Engine has failed no initialize.</p>
    <a href="/" class="text-emerald-400 underline">Back to home</a>
    {#if parse_errors.error}
      {@const line_count = parse_errors.code.split('\n').length}
      <div
        class="relative overflow-y-auto overflow-x-hidden h-full w-full bg-base-800 rounded p-2 pl-12"
      >
        <pre
          class="absolute top-4 left-12 bg-transparent z-[10] w-full"
          contenteditable
          use:highlight
          bind:innerText={code_with_errors}></pre>
        {#each { length: line_count } as _, i}
          <div
            id={i.toString()}
            class:is_error_line={error_line == i}
            class="z-[9] absolute left-2 text-sm mono text-base-500 w-full"
            style="top: {i * 24 + 16}px;"
          >
            {i}
          </div>
        {/each}
      </div>

      <div class="inline-flex justify-between">
        <p class="text-red-400">{parse_errors.error}</p>
        <a class="btn-outline" href="#{error_line}">Show error line </a>
      </div>
      <button
        onclick={() => {
          project.code = code_with_errors;
          save_file();
          recalculate();
        }}>Save changes</button
      >
    {/if}
  </main>
{/if}

<style>
  .is_error_line {
    @apply bg-red-400/50;
  }
</style>
