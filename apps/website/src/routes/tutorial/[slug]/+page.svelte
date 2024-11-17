<script lang="ts">
  import { confetti } from '@neoconfetti/svelte';
  import {
    code_string_to_json,
    CodeEditor,
    Game,
    generate_template_data,
    get_tailwind_classes,
    json_to_code_string,
    template_json_code
  } from 'roguelighter-core';
  import { marked } from 'marked';
  import type { GameData } from 'roguelighter-core';
  import { HANDLE, DOMAIN, TUTORIAL_URL } from '$lib/constants';
  import RunCSS from 'runcss';
  const { processClasses } = RunCSS();

  // TODO: update stuff when page is changed

  let { data } = $props();
  let tutorial = $state(data.tutorial);
  tutorial.project.code = json_to_code_string(template_json_code);
  let markdown = $derived(data.markdown);

  let solved = $state(false);
  let code_editor: undefined = $state();

  function check(obj: GameData) {
    let _val = structuredClone(obj);

    for (let i = 0; i < tutorial.solution_tuples.length; i++) {
      let [path, answer] = tutorial.solution_tuples[i];
      let path_array = path.split('.');
      let val = _val[path_array[0]];

      for (let i = 1; i < path_array.length; i++) {
        val = val[path_array[i]];
        if (val === undefined) return false;
      }

      if (val !== answer) return false;
    }

    return true;
  }

  function on_content_changed() {
    let parsed = code_string_to_json(tutorial.project.code);

    if (typeof parsed == 'object') {
      processClasses(Array.from(get_tailwind_classes(parsed.gui).values()).join(' '));
      solved = check(parsed);
    }
  }

  // const agent_asset_urls: AgentAssetUrls = new Map([
  //   [
  //     'player',
  //     {
  //       default: '/elf_idle.png',
  //       walk: '/elf_run.png',
  //     },
  //   ],
  // ]);

  // const bg_asset_urls: BackgroundAssetUrls = new Map([
  //   ['floor', '/floors/floor_1.png'],
  //   ['floor_2', '/floors/floor_2.png'],
  // ]);

  function show_solution() {
    tutorial.project.code = json_to_code_string(
      Object.assign(template_json_code, tutorial.solution_object)
    );
    code_editor?.set_code(tutorial.project.code);
  }

  function reset() {
    tutorial.project.code = json_to_code_string(template_json_code);
    code_editor?.set_code(tutorial.project.code);
  }
</script>

<svelte:head>
  <title>{tutorial.title} • Roguelighter Tutorial</title>

  <meta name="twitter:title" content="{tutorial.title} • Roguelighter Tutorial" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:site" content={HANDLE} />
  <meta name="twitter:creator" content={HANDLE} />
  <!-- LATER: -->
  <!-- <meta name="twitter:image" content="https://svelte.dev/images/twitter-thumbnail.jpg" /> -->
  <meta property="twitter:domain" content={DOMAIN} />
  <meta property="twitter:url" content={TUTORIAL_URL} />

  <meta property="og:title" content="{tutorial.title} • Roguelighter Tutorial" />
  <meta property="og:url" content={TUTORIAL_URL} />
  <meta property="og:type" content="website" />
  <!-- LATER: -->
  <!-- <meta property="og:image" content="https://roguelighter.dev/images/twitter-thumbnail.jpg" /> -->
</svelte:head>

<main class="flex flex-row gap-2 h-full overflow-hidden">
  <div class="flex flex-col h-full w-1/2 px-4">
    <!-- <h3 class="serif">{tutorial.title}</h3> -->
    <!-- TODO: render markdown -->
    <div id="markdown">
      {@html marked.parse(data.markdown)}
    </div>

    <div class="flex-grow"></div>
    <div class="flex flex-row justify-between gap-2">
      <button onclick={solved ? reset : show_solution} class="btn-amber px-4"
        >{solved ? 'Reset' : 'Show solution'}</button
      >
      {#if tutorial.prev}
        <a href="/tutorial/{tutorial.prev}" class="link p-2 underline">Prev</a>
      {/if}
      {#if tutorial.next}
        <a href="/tutorial/{tutorial.next}" class="link p-2 underline">Next</a>
      {/if}
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
      <CodeEditor
        {on_content_changed}
        bind:project={tutorial.project}
        bind:this={code_editor}
        view="code"
        save_file={() => {}}
      ></CodeEditor>
    </div>
    <div class="h-1/2 w-full">
      <!-- {#key project.code} -->
      <!-- <Game
        project={tutorial.project}
        agent_asset_urls={tutorial.agent_asset_urls}
        bg_asset_urls={tutorial.bg_asset_urls}
        current_scene_id={crypto.randomUUID()}
      ></Game> -->
      <!-- {/key} -->
    </div>
  </div>
</main>
