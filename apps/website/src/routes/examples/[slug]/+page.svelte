<script lang="ts">
  import {
    code_string_to_json,
    CodeEditor,
    ERROR_MESSAGES,
    extract_tailwind_classes,
    Game,
    Modal,
    TOAST_SETTINGS
  } from 'roguelighter-core';
  import type { OnError, Setup } from 'roguelighter-core';
  import { HANDLE, DOMAIN, EXAMPLES_URL } from '$lib/constants';
  import { afterNavigate, goto } from '$app/navigation';
  import { page } from '$app/state';
  import toast from '$lib/svelte-french-toast/core/toast.js';
  import { createDialog } from 'svelte-headlessui';

  let help_dialog = $state(createDialog({ label: '' }));
  $inspect(help_dialog);

  // TODO: try to fix the ownership_invalid stuff

  afterNavigate((e) => {
    if (e.type == 'goto' && data.example) {
      example = data.example;
      code_editor.set_code(example.project.code);
      code_editor.format_document();
    }
  });

  let { data } = $props();
  let example = $state(data.example);
  let current_example = $state(page.params.slug);

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

  const on_error: OnError = (type, e) => {
    toast.error(ERROR_MESSAGES[type], TOAST_SETTINGS);
  };

  const agents = ['big_zombie.png', 'elf_idle.png', 'elf_run.png', 'orc.png', 'run.png'];

  const floors = [
    'floor_1.png',
    'floor_2.png',
    'floor_3.png',
    'floor_4.png',
    'floor_5.png',
    'floor_6.png',
    'floor_7.png',
    'floor_8.png',
    'floor_ladder.png'
  ];

  const globals = [
    ['_', 'Variables'],
    ['$', 'Functions']
    // [
    //   'PROCESS',
    //   'The process object, currently there is only the <code class="py-px px-2 bg-black/30 rounded">exit</code> function'
    // ]
  ];
</script>

<svelte:head>
  <title>{example.title} • Roguelighter Examples</title>

  <meta name="twitter:title" content="{example.title} • Roguelighter Examples" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:site" content={HANDLE} />
  <meta name="twitter:creator" content={HANDLE} />
  <meta property="twitter:domain" content={DOMAIN} />
  <meta property="twitter:url" content={EXAMPLES_URL} />

  <meta property="og:title" content="{example.title} • Roguelighter Examples" />
  <meta property="og:url" content={EXAMPLES_URL} />
  <meta property="og:type" content="website" />
</svelte:head>

<main class="flex flex-col gap-2 h-full w-full overflow-hidden">
  <div class="serif pt-2">
    <div class="flex flex-row gap-2 items-center text-2xl text-base-500">
      <span class="rotate-180">&#10165;</span>
      <div class="bg-base-600 flex-grow h-px"></div>
      <span class="text-xl">EXAMPLES</span>
      <div class="bg-base-600 flex-grow h-px"></div>
      <span>&#10165;</span>
    </div>
    <div class="flex flex-row gap-2 items-center">
      <select
        class="text-xl my-2"
        onchange={(e) => {
          goto('/examples/' + current_example);
        }}
        bind:value={current_example}
      >
        <optgroup label="GUI">
          <option value="gui-text">Text</option>
          <option value="gui-variable-text">Variable as text</option>
          <option value="gui-computed-variable-text">Computed variable as text</option>
          <option value="gui-element-types">Element types</option>
          <option value="gui-element-modifiers">Element modifiers</option>
          <option value="gui-event-handlers">Element event handlers</option>
          <option value="gui-if-syntax">$if syntax</option>
          <option value="gui-for-syntax">$for syntax</option>
        </optgroup>
        <optgroup label="Window">
          <option value="window-event-handlers">Window event handlers</option>
          <option value="window-pause-menu">Pause menu</option>
        </optgroup>
        <optgroup label="Functions">
          <option value="functions-pause-menu">Pause menu</option>
        </optgroup>
        <optgroup label="Settings">
          <option value="settings-fps">FPS</option>
          <option value="settings-zoom">Zoom</option>
          <option value="settings-background">Background</option>
        </optgroup>
        <optgroup label="Step">
          <option value="step-player-movement">Player movement</option>
        </optgroup>
      </select>
      <button
        onclick={() => {
          help_dialog.open();
          console.log($help_dialog);
        }}
        class="text-2xl text-center size-9 border-2 rounded-full border-secondary-600 text-secondary-600"
        >?</button
      >
    </div>
  </div>
  <section class="flex flex-row gap-4 h-full w-full">
    <div class="relative w-1/2 h-full">
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
        <p class="p-4 mt-4 bg-red-500">Cannot render due to parsing error</p>
      {:else}
        {#key rerender}
          <svelte:boundary>
            <Game
              on_exit={() => {}}
              project={example.project}
              agent_asset_urls={new Map(example.agent_asset_urls)}
              bg_asset_urls={new Map(example.bg_asset_urls)}
              {on_error}
            ></Game>

            {#snippet failed(error, reset)}
              <div class="pl-4 pt-16">
                <p>An error occured while running the game</p>
                <pre class="text-xs">{error}</pre>
                <button class="self-start btn-secondary !px-8 mt-4" onclick={reset}>Retry</button>
              </div>
            {/snippet}
          </svelte:boundary>
        {/key}
      {/if}
    </div>
  </section>
</main>

<Modal bind:dialog={help_dialog}>
  <div class="flex flex-col gap-8">
    <div class="bg-red-800 p-2 border border-red-600 rounded serif">
      Accessing the <code>setup</code> variable directly will probably crash the game, use the specified
      globals instead.
    </div>
    <div>
      <h2 class="text-emerald-400 pb-1">Globals</h2>
      <div class="flex flex-col gap-1">
        {#each globals as [_code, _explanation]}
          <div class="flex flex-row gap-2 text-lg items-start">
            <code>{_code}</code>
            <span class="serif">{@html _explanation}</span>
          </div>
        {/each}
      </div>
    </div>
    <div>
      <h2 class="text-emerald-400 pb-1">Assets</h2>
      <div class="mono p-2 overflow-auto h-64 border border-emerald-600 rounded bg-base-800">
        <div>/assets</div>
        <div class="pl-4">/agents</div>
        {#each agents as agent}
          <span class="pl-12 flex items-center gap-2">
            <img class="h-10" src="/agents/{agent}" alt={agent} />
            {agent}
          </span>
        {/each}
        <div class="pl-4">/backgrounds</div>
        <div class="pl-8">/floors</div>
        {#each floors as floor}
          <span class="pl-12 flex items-center gap-2">
            <img class="size-10" src="/backgrounds/floors/{floor}" alt={floor} />
            {floor}
          </span>
        {/each}
      </div>
      <div class="serif pt-4">
        Assets taken from <a
          class="underline text-emerald-400"
          href="https://0x72.itch.io/dungeontileset-ii">https://0x72.itch.io/dungeontileset-ii</a
        >
      </div>
    </div>
  </div>
</Modal>

<style>
  code {
    @apply py-px px-2 bg-black/30 rounded;
  }

  img {
    image-rendering: pixelated;
  }
</style>
