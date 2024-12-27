<script lang="ts">
  import { confetti } from '@neoconfetti/svelte';
  import {
    code_string_to_json,
    CodeEditor,
    extract_tailwind_classes,
    Game
  } from 'roguelighter-core';
  import { marked } from 'marked';
  import type { Setup } from 'roguelighter-core';
  import { HANDLE, DOMAIN, TUTORIAL_URL } from '$lib/constants';
  import { afterNavigate } from '$app/navigation';
  import { processClasses } from '$lib/state.svelte.js';

  afterNavigate((e) => {
    if (e.type == 'link' && data.tutorial) {
      tutorial = data.tutorial;
      set_code('template_code_string');
    }
  });

  let { data } = $props();
  let tutorial = $state(data.tutorial);
  let code_editor: any = $state();
  let rerender = $state(0);
  let parsed = $derived.by(() => code_string_to_json(tutorial.project.code));
  let cannot_render = $derived.by(() => {
    if ('error' in parsed) {
      return true;
    } else {
      return false;
    }
  });
  let solved = $derived(cannot_render ? false : check(parsed as Setup));

  function check(obj: Setup) {
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
    if (!cannot_render) {
      processClasses.fn(extract_tailwind_classes(JSON.stringify((parsed as Setup).gui)));
      rerender++;
    }
  }

  function set_code(str: 'solution_code_string' | 'template_code_string') {
    tutorial.project.code = data[str];
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
    <div id="markdown">
      {@html marked.parse(data.markdown)}
    </div>

    <div class="flex-grow"></div>
    <div class="flex flex-row justify-between gap-2">
      <button
        onclick={() => set_code(solved ? 'template_code_string' : 'solution_code_string')}
        class="btn-secondary !px-4">{solved ? 'Reset' : 'Show solution'}</button
      >
      <div class="flex flex-row gap-1">
        {#if tutorial.prev}
          <a href="/tutorial/{tutorial.prev}" class="link p-2 underline serif text-xl">Prev</a>
        {/if}
        {#if tutorial.next}
          <a href="/tutorial/{tutorial.next}" class="link p-2 underline serif text-xl">Next</a>
        {/if}
      </div>
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
    <div class="h-1/2 w-full border border-black overflow-hidden bg-black">
      {#if cannot_render}
        <p>Cannot render</p>
      {:else}
        {#key rerender}
          <Game
            on_exit={() => {}}
            project={tutorial.project}
            agent_asset_urls={tutorial.agent_asset_urls}
            bg_asset_urls={tutorial.bg_asset_urls}
            current_scene_id={0}
          ></Game>
        {/key}
      {/if}
    </div>
  </div>
</main>
