<script lang="ts">
  import { page } from '$app/stores';
  import { confetti } from '@neoconfetti/svelte';
  import {
    Game,
    CodeEditor,
    get_tailwind_classes,
    json_to_code_string,
    code_string_to_json,
    processClasses
  } from 'roguelighter-core';
  import type { AssetUrls, GameData } from 'roguelighter-core';
  import { tutorials } from './tutorials';
  let tutorial = structuredClone(tutorials[$page.params.name]);
  let { project, solution, header, description, solution_tuple } = tutorial;
  let solved = false;
  let code_editor: CodeEditor;

  function check(obj: GameData) {
    let val = structuredClone(obj);
    let path = solution_tuple[0].split('.');
    // @ts-expect-error
    path.forEach((partial_path) => (val = val[partial_path]));

    return val === solution_tuple[1];
  }

  // @ts-expect-error
  const asset_urls: AssetUrls = new Map([
    [
      'player',
      {
        default: '/elf_idle.png',
        walk: '/elf_run.png'
      }
    ],
    ['floor', '/floors/floor_1.png'],
    ['floor_2', '/floors/floor_2.png']
  ]);

  function show_solution() {
    project.code = json_to_code_string(solution);
    code_editor.set_code(project.code);
  }

  function reset() {
    tutorial = structuredClone(tutorials[$page.params.name]);
    ({ project } = tutorial);
    code_editor.set_code(project.code);
  }

  $: {
    let parsed = code_string_to_json(project.code);

    if (typeof parsed == 'object') {
      processClasses(Array.from(get_tailwind_classes(parsed.gui).values()).join(' '));
      project.parsed_code = parsed;
      solved = check(project.parsed_code);
    }
  }
</script>

<main class="flex flex-row gap-2 h-full overflow-hidden">
  <div class="flex flex-col h-full w-1/2 px-4">
    <h3 class="h3 young-serif">{header}</h3>
    <!-- <p>{description}</p> -->
    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Est, nemo. Atque officia blanditiis
      ducimus debitis consequatur a quasi iure delectus.
    </p>
    <br />
    <p>
      Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quo cum accusamus molestias, vel
      eius ducimus iusto praesentium. Nesciunt dolor repellat cupiditate blanditiis. Nostrum rem
      voluptate voluptatem illo quam similique at omnis. Quos labore possimus cupiditate.
    </p>
    <br />
    <p>
      Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nisi dolorem temporibus enim
      blanditiis ducimus, quaerat quae tempore asperiores qui non eius, quas voluptates?
    </p>
    <div class="flex-grow"></div>
    <div class="flex flex-row justify-between gap-2">
      <button on:click={solved ? reset : show_solution} class="btn-amber px-4"
        >{solved ? 'Reset' : 'Show solution'}</button
      >
      <a href="/" class="link p-2 underline">Next</a>
    </div>
  </div>
  <div
    class="flex flex-col items-center w-1/2 h-full gap-2 duration-500 ease-out p-2 rounded {solved
      ? 'bg-emerald-400'
      : 'bg-amber-200'}"
  >
    <div class="h-1/2 w-full">
      {#if solved}
        <div
          use:confetti={{
            particleCount: 50,
            particleSize: 6,
            duration: 2500,
            stageWidth: 500
          }}
          class="absolute left-[50%] top-12"
        ></div>
      {/if}
      <CodeEditor bind:code={project.code} bind:this={code_editor}></CodeEditor>
    </div>
    <div class="h-1/2 w-full">
      {#key project.code}
        <Game {project} {asset_urls} current_scene_id={0}></Game>
      {/key}
    </div>
  </div>
</main>
