<script module>
  interface Props {
    project: RoguelighterProject;
    current_scene_id: UUID | undefined;
    bg_asset_urls: BackgroundAssetUrls;
    agent_asset_urls: AgentAssetUrls;
    agents: Setup['agents'];
    unfocus_from_scene_editor: Function;
    switch_to_game: Function;
    save_file: Function;
  }
</script>

<script lang="ts">
  import Modal from './Modal.svelte';
  import type { Setup } from '../../types/game';
  import { CROSS, DEFAULT_MAP_WIDTH } from '../../constants';
  import { onMount } from 'svelte';
  import Dropdown from './Dropdown.svelte';
  import type {
    AgentAssetUrls,
    BackgroundAssetUrls,
    Portal,
    RoguelighterProject,
    Scene,
    UUID
  } from '../../types/engine';
  import tippy from 'tippy.js';
  import { SvelteMap, SvelteSet } from 'svelte/reactivity';
  import { createDialog } from 'svelte-headlessui';

  onMount(() => {
    setTimeout(() => {
      tippy('[data-tippy-content]');
    }, 100);
  });

  let {
    project = $bindable(),
    current_scene_id = $bindable(),
    agents = $bindable(),
    agent_asset_urls = $bindable(),
    bg_asset_urls = $bindable(),
    unfocus_from_scene_editor,
    switch_to_game,
    save_file
  }: Props = $props();

  let fill_mode: 'bg' | 'agent' = $state('bg');
  let holding = $state(false);
  let show_pos = $state(false);
  let portal_remove_mode = $state(false);
  let portal_from_pos = $state(0);
  let portal_to_id: UUID | undefined = $state();
  let portal_to_pos = $state(0);
  let scene_name = $state('');
  let map_width = $state(DEFAULT_MAP_WIDTH);
  let map_height = $state(DEFAULT_MAP_WIDTH);

  let portal_modal = $state(createDialog({ label: '' }));
  let new_scene_modal = $state(createDialog({ label: '' }));
  let delete_scene_modal = $state(createDialog({ label: '' }));

  // @ts-expect-error
  let current_scene: Scene = $derived(project.scenes.get(current_scene_id));
  let portal_btn_disabled = $derived((project.scenes?.size || 0) <= 1);

  interface Brushes {
    bg: keyof typeof backgrounds | undefined;
    agent: keyof typeof agents | undefined;
  }

  let brushes: Brushes = $state({
    bg: undefined,
    agent: undefined
  });

  let must_be_replaced = $state({
    agent_names: new SvelteSet(),
    background_names: new SvelteSet()
  });

  let name_input_element: HTMLInputElement | undefined = $state();

  const backgrounds = Object.fromEntries(bg_asset_urls);

  const fillers = {
    bg(pos: number) {
      if (brushes.bg) {
        current_scene.backgrounds.set(pos, brushes.bg as string);
      } else {
        current_scene.backgrounds.delete(pos);
      }
    },
    agent(pos: number) {
      if (brushes.agent) {
        if (brushes.agent == 'player') {
          for (let [_pos, val] of current_scene.agents.entries()) {
            if (val == 'player') {
              current_scene.agents.set(pos, val);
              current_scene.agents.delete(_pos);
              return;
            }
          }
        }

        current_scene.agents.set(pos, brushes.agent as string);
      } else {
        current_scene.agents.delete(pos);
      }
    }
  };

  const selects = {
    agent(key: keyof typeof agents) {
      fill_mode = 'agent';
      brushes.agent = brushes.agent == key ? undefined : key;
      brushes.bg = undefined;
    },
    bg(key: keyof typeof backgrounds) {
      fill_mode = 'bg';
      brushes.bg = brushes.bg == key ? undefined : key;
      brushes.agent = undefined;
    }
  };

  const digit_selects = {
    agent: Object.keys(agents),
    bg: Object.keys(backgrounds)
  };

  async function create_portal() {
    current_scene.portals.set(portal_from_pos, {
      to_scene_id: portal_to_id as UUID,
      to_position: portal_to_pos
    });
    let portalled_scene = project.scenes.get(portal_to_id as UUID);
    portalled_scene?.portals.set(portal_to_pos, {
      to_scene_id: current_scene_id as UUID,
      to_position: portal_from_pos
    });
    portal_modal?.close();
    save_file();
    tippy('[data-tippy-content]');
  }

  async function delete_portal(pos: number) {
    if (!portal_remove_mode) return;
    const { to_scene_id, to_position } = current_scene.portals.get(pos) as Portal;
    current_scene.portals.delete(pos);
    let portalled_scene = project.scenes.get(to_scene_id);
    portalled_scene?.portals.delete(to_position);
    save_file();
  }

  async function delete_current_scene(e: SubmitEvent) {
    e.preventDefault();
    // @ts-expect-error
    project.scenes.delete(current_scene_id);
    project.scenes = project.scenes;
    // await project.scenes.delete(current_scene.id as IndexableType);
    // current_scene = undefined;
    current_scene_id = undefined;
    // current_scene_name = '';
    delete_scene_modal?.close();
    save_file();
  }

  function right_clicked(pos: number) {
    if (fill_mode == 'bg') {
      brushes.bg = current_scene.backgrounds.get(pos);
    } else {
      brushes.agent = current_scene.agents.get(pos);
    }
  }

  function create_scene() {
    let id = crypto.randomUUID();
    project.scenes.set(id, {
      name: scene_name,
      backgrounds: new SvelteMap(),
      agents: new SvelteMap(),
      portals: new SvelteMap(),
      width: map_width,
      height: map_height
    });

    scene_name = '';
    current_scene_id = id;
    new_scene_modal?.close();
  }

  function scene_name_input(e: Event) {
    if (
      [...project.scenes.values()]
        .map(({ name }) => name)
        // @ts-expect-error
        .includes(e.target.value)
    ) {
      name_input_element?.setCustomValidity('There is already a scene with this name');
    } else {
      name_input_element?.setCustomValidity('');
    }
  }

  function mouse_entered(pos: number) {
    if (holding && !show_pos) {
      fillers[fill_mode](pos);
      save_file();
    }
  }

  function cell_clicked(pos: number) {
    if (!show_pos) {
      fillers[fill_mode](pos);
      save_file();
    }
  }

  function show_must_be_replaced_elements() {
    const agent_elements = document.getElementsByClassName('must-be-replaced-agent');
    const background_elements = document.getElementsByClassName('must-be-replaced-background');

    let agent_names = new SvelteSet();
    let background_names = new SvelteSet();

    for (let element of agent_elements) {
      agent_names.add(element.innerHTML);
    }

    for (let element of background_elements) {
      background_names.add(element.innerHTML);
    }

    must_be_replaced = {
      agent_names,
      background_names
    };
  }

  function replace_elements(e: SubmitEvent) {
    const formData = new FormData(e.target as HTMLFormElement);
    const type = formData.get('type') as 'backgrounds' | 'agents';
    const from = formData.get('from') as string;
    const to = formData.get('to') as string;

    for (let [key, value] of current_scene[type]) {
      if (value == from) {
        current_scene[type].set(key, to);
      }
    }

    current_scene[type] = current_scene[type];
    must_be_replaced.agent_names.clear();
    must_be_replaced.agent_names = must_be_replaced.agent_names;
    save_file();
  }
</script>

<svelte:window
  onmousedown={() => (holding = true)}
  onmouseup={() => (holding = false)}
  onkeydown={(e) => {
    // LATER: prevent triggering OS level shortcut
    if (e.code == 'Escape' && e.shiftKey) {
      unfocus_from_scene_editor();
      return;
    }

    if ($portal_modal?.expanded || $new_scene_modal?.expanded || $delete_scene_modal?.expanded) {
      return;
    }

    let digit_str = e.code.split('Digit')[1];

    if (digit_str) {
      let digit = +digit_str;
      selects[fill_mode](digit_selects[fill_mode][digit - 1]);
    }

    if (e.ctrlKey) {
      switch (e.code) {
        case 'KeyN':
          new_scene_modal?.open();
          break;
        case 'KeyT':
          switch_to_game();
          break;
        case 'KeyP':
          portal_modal?.open();
          break;
        case 'KeyR':
          portal_remove_mode = !portal_remove_mode;
          break;
      }
    } else {
      switch (e.code) {
        case 'KeyF':
          fill_mode = fill_mode == 'bg' ? 'agent' : 'bg';
          selects[fill_mode](digit_selects[fill_mode][0]);
          break;
      }
    }
  }}
/>

<main
  style:image-rendering={'pixelated'}
  class="absolute w-full flex flex-row gap-4 bg-base-900 px-4 pb-4 pt-16 h-screen"
>
  <section class="flex flex-col min-w-60 max-w-96">
    <div class="flex flex-row gap-2">
      <!-- <select class="select" bind:value={current_scene_id}>
        <option disabled value="">Select a scene</option>
        {#each project.scenes.entries() as [id, { name }]}
          <option value={id}>{name}</option>
        {/each}
      </select> -->
      <select class="w-full" bind:value={current_scene_id}>
        <optgroup label="Scenes">
          {#each project.scenes.entries() as [id, { name }]}
            <option value={id}>{name}</option>
          {/each}
        </optgroup>
        <optgroup label="Dev Only Scenes">
          <!--  -->
        </optgroup>
      </select>
      <button
        data-tippy-content="Ctrl + N"
        class="btn-primary w-full"
        onclick={() => new_scene_modal?.open()}
        ><svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>&nbsp; New scene
      </button>
    </div>
    <button
      data-tippy-content="Ctrl + T"
      onclick={() => switch_to_game()}
      class="btn-primary mt-2 group-has-[.must-be-replaced-agent,.must-be-replaced-background]:disabled"
      ><svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-5 h-5 pb-1 fill-white"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
        />
      </svg>
      Test Scene</button
    >
    <div
      class="w-full relative flex flex-col gap-8 mt-2 bg-base-700 text-white duration-150 ease-out p-4 rounded grow h-full select-none overflow-y-auto"
    >
      {#if current_scene_id != undefined}
        {#if agent_asset_urls.size}
          <div>
            <h3 class:text-emerald-400={fill_mode == 'agent'}>
              Agents <span class="text-base-300 text-sm"
                >{fill_mode == 'bg' ? '(F to switch) ' : ''}</span
              >
            </h3>
            <div
              class="flex flex-wrap gap-x-8 gap-y-12 h-52 overflow-y-auto shadow-inner px-4 pt-4 pb-8 border border-white/10"
            >
              {#each Object.entries(agents) as [key, val], i}
                <button
                  onclick={() => selects.agent(key)}
                  class="relative flex items-center justify-center w-16 h-16"
                  class:active={brushes.agent == key}
                  title={key}
                >
                  <span
                    style:width="64px"
                    style:height="64px"
                    style:background-size="cover"
                    style:background-repeat="no-repeat"
                    style:background-image="url({agent_asset_urls.get(key)})"
                  ></span>
                  <span class="text-xs absolute -bottom-6 bg-base-800 w-6 border border-base-500"
                    >{i + 1}
                  </span>
                </button>
              {/each}
            </div>
          </div>
        {:else}
          <p class="text-sm text-base-300">Agent assets not found.</p>
        {/if}
        {#if bg_asset_urls.size}
          <div>
            <h3 class:text-emerald-400={fill_mode == 'bg'}>
              Backgrounds <span class="text-base-300 text-sm regular"
                >{fill_mode == 'agent' ? '(F to switch)' : ''}</span
              >
            </h3>
            <div
              class="flex flex-wrap gap-x-8 gap-y-12 h-52 overflow-y-auto shadow-inner px-4 pt-4 pb-8 border border-white/10"
            >
              {#each Object.entries(backgrounds) as [key, val], i}
                <button
                  onclick={() => selects.bg(key)}
                  class="relative flex items-center justify-center w-16 h-16"
                  class:active={brushes.bg == key}
                  title={key}
                >
                  <span
                    style:width="64px"
                    style:height="64px"
                    style:background-size="contain"
                    style:background-repeat="no-repeat"
                    style:background-image="url({bg_asset_urls.get(key)})"
                  ></span>
                  <span class="absolute -bottom-6 bg-base-800 w-6 border border-base-500"
                    >{i + 1}</span
                  >
                </button>
              {/each}
            </div>
          </div>
        {:else}
          <p class="text-sm text-base-300">Background assets not found.</p>
        {/if}
        <div class="flex-grow"></div>
        <div>
          <h3>Portals</h3>
          <div class="flex flex-row gap-2 pt-2">
            <button
              disabled={current_scene?.portals?.size == 0}
              data-tippy-content="Ctrl + R"
              class="btn-outline w-full disabled:cursor-not-allowed"
              color="purple"
              onclick={() => (portal_remove_mode = !portal_remove_mode)}
              >{portal_remove_mode ? 'Cancel' : 'Remove Portal'}</button
            >
            <!-- BACKLOG: make the popover work when button is disabled -->
            <button
              data-tippy-content={portal_btn_disabled
                ? 'You need at least two scenes to place a portal'
                : 'Ctrl + P'}
              class="btn-secondary w-full"
              color="purple"
              onclick={() => {
                if (portal_btn_disabled) return;
                portal_remove_mode = false;
                portal_modal?.open();
              }}>New Portal</button
            >
          </div>
        </div>
      {/if}
    </div>
  </section>
  <section class="flex flex-col gap-2 w-4/5 h-full group">
    <div
      class="relative h-11 bg-base-700 w-full rounded p-2 px-4 text-white flex flex-row justify-between"
    >
      <label class="cursor-pointer">
        <input type="checkbox" bind:checked={show_pos} />
        Show Positions
      </label>

      <Dropdown>
        {#snippet button()}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
            />
          </svg>
        {/snippet}
        {#snippet items()}
          <div class="bg-base-700 rounded p-4 flex flex-col gap-2 items-start">
            <button
              onclick={() => {
                /** TODO **/
              }}
              class="hover:text-emerald-400 ease-out duration-150">Set as starting scene</button
            >
            <button
              onclick={() => delete_scene_modal?.open()}
              class="hover:text-red-400 ease-out duration-150">Delete scene</button
            >
          </div>
        {/snippet}
      </Dropdown>
    </div>
    <div
      class="text-sm bg-purple-900 text-amber-50 border border-purple-600 p-2 group-has-[.must-be-replaced-agent,.must-be-replaced-background]:block hidden"
    >
      Some agents/backgrounds on the map have no asset references. Change them to elements with
      asset references.
      <button class=" py-0" onclick={show_must_be_replaced_elements}>Show</button>
      <div class="p-2 bg-amber-950 shadow-inner has-[form]:flex flex-col gap-4 hidden">
        {#each [...must_be_replaced.agent_names.values(), ...must_be_replaced.background_names.values()] as name}
          {@const is_agent = must_be_replaced.agent_names.has(name)}
          <form class="flex flex-row gap-2" onsubmit={replace_elements}>
            Replace [{name}] with
            <input hidden type="text" name="type" value={is_agent ? 'agents' : 'backgrounds'} />
            <input hidden type="text" name="from" value={name} />
            <select class="text-black" name="to">
              {#each Object.keys(is_agent ? agents : backgrounds).filter((x) => x != 'player') as value}
                <option {value}>{value}</option>
              {/each}
            </select>
            <button class="btn btn-success py-0 px-2">Replace</button>
          </form>
        {/each}
      </div>
    </div>
    <section class="w-full h-full overflow-auto bg-base-500 border">
      {#if current_scene}
        {#each { length: current_scene.height } as _, i}
          <div class="row flex flex-row w-max">
            {#each { length: current_scene.width } as __, j}
              {@const pos = i * current_scene.width + j}
              {@const agent = current_scene.agents.get(pos)}
              {@const bg = current_scene.backgrounds.get(pos)}
              {@const portal = current_scene.portals.get(pos)}
              {@const bg_url = bg ? bg_asset_urls.get(bg) : ''}
              {@const agent_url = agent ? agent_asset_urls.get(agent) : ''}
              <button
                oncontextmenu={(e) => {
                  e.preventDefault();
                  !show_pos && right_clicked(pos);
                }}
                onmouseenter={() => mouse_entered(pos)}
                onclick={() => cell_clicked(pos)}
                class="relative flex items-center justify-center size-16 focus:z-20"
              >
                {#if portal}
                  {@const to_scene = project.scenes.get(portal.to_scene_id)}
                  <button
                    onclick={() => delete_portal(pos)}
                    id="portal_{pos}"
                    data-tippy-content={`${to_scene?.name} #${portal.to_position}`}
                    class="absolute top-0 border-4 border-purple-600 w-full h-full z-20 {portal_remove_mode
                      ? 'hover:border-red-500'
                      : ''}"
                  ></button>
                {/if}
                {#if show_pos}
                  <span>{pos}</span>
                {:else}
                  {#if bg_url}
                    <span
                      style:background-image="url({bg_url})"
                      class="sprite absolute w-full h-full z-10"
                    ></span>
                  {:else if bg}
                    <span
                      class="must-be-replaced-background z-20 bg-base-200 px-2 py-0.5 rounded text-xs"
                      >{bg}</span
                    >
                  {/if}
                  {#if agent_url}
                    <span
                      style:background-image="url({agent_url})"
                      class="sprite absolute w-full h-full z-10"
                    ></span>
                  {:else if agent}
                    <span
                      class="must-be-replaced-agent z-20 bg-base-200 px-2 py-0.5 rounded text-xs"
                      >{agent}</span
                    >
                  {/if}
                {/if}
              </button>
            {/each}
          </div>
        {/each}
      {/if}
    </section>
  </section>
</main>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<Modal bind:dialog={new_scene_modal}>
  <h3 class="pb-4">Create a new scene</h3>
  <form class="flex flex-col gap-4" onsubmit={create_scene}>
    <label class="flex flex-col" for="name">
      Name
      <input
        oninput={scene_name_input}
        required
        type="text"
        bind:value={scene_name}
        bind:this={name_input_element}
      />
    </label>
    <label for="dimensions">
      Dimensions (width, height)
      <div class="flex flex-row gap-2 pb-2">
        <input required min="0" max="100" bind:value={map_width} type="number" />
        <input required min="0" max="100" bind:value={map_height} type="number" />
      </div>
    </label>
    <label class="flex flex-row gap-2 items-center">
      <input type="checkbox" />
      Dev only
    </label>
    <button class="btn-primary">Create</button>
  </form>
  <button class="absolute top-2 right-4" onclick={() => new_scene_modal?.close()}>{CROSS}</button>
</Modal>

<Modal bind:dialog={portal_modal}>
  <h3 class="h3 pb-4">Portal</h3>
  <form class="flex flex-col gap-4" onsubmit={create_portal}>
    <div class="flex flex-row w-full gap-4">
      <label class="flex flex-col w-1/2" for="name">
        From
        <select class="select" disabled value={current_scene_id}>
          {#each project.scenes.entries() as [id, { name: scene }]}
            <option value={id}>{scene}</option>
          {/each}
        </select>
      </label>
      {#if current_scene}
        <label class="flex flex-col w-1/2">
          Position
          <input
            required
            type="number"
            min={0}
            max={current_scene.width * current_scene.height - 1}
            bind:value={portal_from_pos}
          />
        </label>
      {/if}
    </div>
    <div class="flex flex-row w-full gap-4">
      <label class="flex flex-col w-1/2" for="name">
        To
        <select class="select" required bind:value={portal_to_id}>
          {#each project.scenes.entries() as [id, { name }]}
            {#if name != current_scene?.name}
              <option value={id}>{name}</option>
            {/if}
          {/each}
        </select>
      </label>
      {#if typeof portal_to_id === 'number'}
        {@const scene = project.scenes.get(portal_to_id)}
        {#if scene}
          <label class="flex flex-col w-1/2">
            Position
            <input
              required
              type="number"
              min={0}
              max={scene.width * scene.height - 1}
              bind:value={portal_to_pos}
            />
          </label>
        {/if}
      {/if}
    </div>
    <button class="btn-primary">Create</button>
  </form>

  <button class="absolute top-2 right-4" onclick={() => portal_modal?.close()}>{CROSS}</button>
</Modal>

<Modal bind:dialog={delete_scene_modal}>
  <h3 class="h3">Delete scene "{current_scene?.name}"?</h3>
  <form onsubmit={delete_current_scene} class="flex flex-row gap-2 w-full justify-end pt-4">
    <button type="button" onclick={() => delete_scene_modal?.close()} class=" btn-ghost">
      Cancel
    </button>
    <button type="submit" class="btn-danger">Delete</button>
  </form>
</Modal>

<style>
  .active {
    outline: 4px solid #34d399;
  }

  .sprite {
    background-repeat: no-repeat;
    background-size: cover;
  }
</style>
