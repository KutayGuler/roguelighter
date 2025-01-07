<script lang="ts">
  import {
    code_string_to_json,
    CodeEditor,
    extract_tailwind_classes,
    Game
  } from 'roguelighter-core';
  import type { Setup } from 'roguelighter-core';
  import { HANDLE, DOMAIN, EXAMPLES_URL } from '$lib/constants';
  import { afterNavigate, goto } from '$app/navigation';
  import { page } from '$app/stores';

  afterNavigate((e) => {
    if (e.type == 'goto' && data.example) {
      example = data.example;
      code_editor?.set_code(example.project.code);
    }
  });

  let { data } = $props();
  let example = $state(data.example);
  let current_example = $state($page.params.slug);

  let code_editor: any = $state();
  let rerender = $state(0);
  let parsed = $derived.by(() => code_string_to_json(example.project.code));
  let cannot_render = $derived.by(() => {
    if ('error' in parsed) {
      return true;
    } else {
      return false;
    }
  });

  function on_content_changed() {
    if (!data.process_classes) return;
    if (!cannot_render) {
      data.process_classes(extract_tailwind_classes(JSON.stringify((parsed as Setup).gui)));
      rerender++;
    }
  }
</script>

<svelte:head>
  <title>{example.title} • Roguelighter Examples</title>

  <meta name="twitter:title" content="{example.title} • Roguelighter Examples" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:site" content={HANDLE} />
  <meta name="twitter:creator" content={HANDLE} />
  <!-- LATER: -->
  <!-- <meta name="twitter:image" content="https://svelte.dev/images/twitter-thumbnail.jpg" /> -->
  <meta property="twitter:domain" content={DOMAIN} />
  <meta property="twitter:url" content={EXAMPLES_URL} />

  <meta property="og:title" content="{example.title} • Roguelighter Examples" />
  <meta property="og:url" content={EXAMPLES_URL} />
  <meta property="og:type" content="website" />
  <!-- LATER: -->
  <!-- <meta property="og:image" content="https://roguelighter.dev/images/twitter-thumbnail.jpg" /> -->
</svelte:head>

<main class="flex flex-col gap-2 h-full w-full overflow-hidden">
  <div class="serif px-2 pt-2">
    <!-- <script lang="ts">
  /**
   * # settings #
   * fps -> change fps to change the animation speed
   * zoom -> change zoom to change the animation speed
   */

  /**
   * # variables #
   * straight up variables in markup
   * computed variables in markup
   *
   */

  /**
   * # functions #
   * click to increase count
   */

  /**
   * # window event handlers #
   * press on space to increase count
   * move character with arrow keys or wasd
   *
   */

  /**
   * # agents #
   * oncollision
   *
   *
   */

  /**
   * # gui #
   * styling
   * modifiers (hover)
   * $for template
   * $if template (pause menu)
   * gui transitions
   */
</script> -->
    <div class="flex flex-row gap-2 items-center text-2xl text-base-500">
      <span class="rotate-180">&#10165;</span>
      <div class="bg-base-600 flex-grow h-px"></div>
      <span class="text-xl">EXAMPLES</span>
      <div class="bg-base-600 flex-grow h-px"></div>
      <span>&#10165;</span>
    </div>
    <select
      class="text-xl my-2"
      onchange={(e) => {
        goto('/examples/' + current_example);
      }}
      bind:value={current_example}
    >
      <optgroup label="Settings">
        <option value="intro">FPS & Zoom & Background</option>
      </optgroup>
      <optgroup label="GUI">
        <option value="gui-text">Text</option>
        <option value="gui-variable-text">Variable as text</option>
        <option value="gui-computed-variable-text">Computed variable as text</option>
      </optgroup>
    </select>
  </div>
  <section class="flex flex-row gap-4 h-full w-full">
    <div class="relative w-1/2 h-full flex-grow">
      <CodeEditor
        {on_content_changed}
        bind:project={example.project}
        bind:this={code_editor}
        view="code"
        save_file={() => {}}
      ></CodeEditor>
    </div>
    <div
      class:bg-amber-400={cannot_render}
      class="flex flex-col items-center w-1/2 h-full gap-2 duration-500 ease-out p-2 rounded bg-emerald-400"
    >
      {#if cannot_render}
        <p>Cannot render</p>
      {:else}
        {#key rerender}
          <Game
            on_exit={() => {}}
            project={example.project}
            agent_asset_urls={new Map(example.agent_asset_urls)}
            bg_asset_urls={new Map(example.bg_asset_urls)}
            current_scene_id={0}
          ></Game>
        {/key}
      {/if}
    </div>
  </section>
</main>
