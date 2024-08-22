<script lang="ts">
  import Modal from './Modal.svelte';
  import type { GameData } from '../../types/game';
  import { CROSS, DEFAULT_MAP_WIDTH } from '../../constants';
  import { createEventDispatcher, onMount } from 'svelte';
  import Dropdown from './Dropdown.svelte';
  import type {
    AgentAssetUrls,
    BackgroundAssetUrls,
    DialogController,
    Portal,
    RoguelighterProject,
    Scene
  } from '../../types/engine';
  import tippy from 'tippy.js';

  onMount(() => {
    tippy('[data-tippy-content]');
  });

  const dispatch = createEventDispatcher();

  export let project: RoguelighterProject;
  export let current_scene_id: number;
  export let bg_asset_urls: BackgroundAssetUrls;
  export let agent_asset_urls: AgentAssetUrls;
  export let agents: GameData['agents'];

  const backgrounds = Object.fromEntries(bg_asset_urls);

  let current_scene: Scene;
  $: current_scene = project.scenes.get(current_scene_id) as Scene;

  let fill_mode: 'bg' | 'agent' = 'bg';
  let holding = false;
  let show_pos = false;
  let portal_btn_disabled = false;
  let portal_modal: DialogController;
  let portal_remove_mode = false;
  let portal_from_pos = 0;
  let portal_to_id: number;
  let portal_to_pos = 0;
  $: portal_btn_disabled = (project.scenes?.size || 0) <= 1;

  async function create_portal() {
    current_scene.portals.set(portal_from_pos, {
      to_scene_id: portal_to_id,
      to_position: portal_to_pos
    });
    let portalled_scene = project.scenes.get(portal_to_id);
    portalled_scene?.portals.set(portal_to_pos, {
      to_scene_id: current_scene_id,
      to_position: portal_from_pos
    });
    current_scene = current_scene;
    portal_modal.close();
    dispatch('change');
    tippy('[data-tippy-content]');
  }

  async function delete_portal(pos: number) {
    if (!portal_remove_mode) return;
    const { to_scene_id, to_position } = current_scene.portals.get(pos) as Portal;
    current_scene.portals.delete(pos);
    let portalled_scene = project.scenes.get(to_scene_id);
    portalled_scene?.portals.delete(to_position);
    dispatch('change');
  }

  async function delete_current_scene() {
    project.scenes.delete(current_scene_id);
    project.scenes = project.scenes;
    // await project.scenes.delete(current_scene.id as IndexableType);
    // current_scene = undefined;
    // @ts-expect-error
    current_scene_id = undefined;
    // current_scene_name = '';
    delete_scene_modal.close();
    dispatch('change');
  }

  interface Brushes {
    bg: keyof typeof backgrounds | undefined;
    agent: keyof typeof agents | undefined;
  }

  let brushes: Brushes = {
    bg: undefined,
    agent: undefined
  };

  const fillers = {
    bg(pos: number) {
      if (brushes.bg) {
        current_scene.backgrounds.set(pos, brushes.bg as string);
      } else {
        current_scene.backgrounds.delete(pos);
      }
      current_scene = current_scene;
    },
    agent(pos: number) {
      if (brushes.agent) {
        if (brushes.agent == 'player') {
          for (let [_pos, val] of current_scene.agents.entries()) {
            if (val == 'player') {
              current_scene.agents.set(pos, val);
              current_scene.agents.delete(_pos);
              current_scene = current_scene;
              return;
            }
          }
        }

        current_scene.agents.set(pos, brushes.agent as string);
      } else {
        current_scene.agents.delete(pos);
      }
      current_scene = current_scene;
    }
  };

  function right_clicked(pos: number) {
    if (fill_mode == 'bg') {
      brushes.bg = current_scene?.backgrounds.get(pos);
    } else {
      brushes.agent = current_scene?.agents.get(pos);
    }
  }

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

  let new_scene_modal: DialogController;
  let delete_scene_modal: DialogController;

  let scene_name = '';
  let map_width = DEFAULT_MAP_WIDTH;
  let map_height = DEFAULT_MAP_WIDTH;

  function generate_id(increment_by = 0) {
    let scene_number = project.scenes.size + increment_by;
    let id = scene_number;
    let scene = project.scenes.get(id);

    if (scene) {
      return generate_id(1);
    }

    return id;
  }

  function create_scene() {
    let id = generate_id();
    project.scenes.set(id, {
      name: scene_name,
      backgrounds: new Map(),
      agents: new Map(),
      portals: new Map(),
      width: map_width,
      height: map_height
    });

    scene_name = '';
    current_scene_id = id;
    new_scene_modal.close();
    project.scenes = project.scenes;
  }

  function scene_name_input(e: Event) {
    if (
      [...project.scenes.values()]
        .map(({ name }) => name)
        // @ts-expect-error
        .includes(e.target.value)
    ) {
      name_input_element.setCustomValidity('There is already a scene with this name');
    } else {
      name_input_element.setCustomValidity('');
    }
  }

  let name_input_element: HTMLInputElement;

  const digit_selects = {
    agent: Object.keys(agents),
    bg: Object.keys(backgrounds)
  };

  function mouse_entered(pos: number) {
    if (holding && !show_pos) {
      fillers[fill_mode](pos);
      dispatch('change');
    }
  }

  function cell_clicked(pos: number) {
    if (!show_pos) {
      fillers[fill_mode](pos);
      dispatch('change');
    }
  }

  let must_be_replaced = {
    agent_names: new Set(),
    background_names: new Set()
  };

  function show_must_be_replaced_elements() {
    const agent_elements = document.getElementsByClassName('must-be-replaced-agent');
    const background_elements = document.getElementsByClassName('must-be-replaced-background');

    let agent_names = new Set();
    let background_names = new Set();

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
    dispatch('change');
  }
</script>

<svelte:window
  on:mousedown={() => (holding = true)}
  on:mouseup={() => (holding = false)}
  on:keydown={(e) => {
    if (e.code == 'Escape') {
      dispatch('unfocus');
      return;
    }

    if ($portal_modal.expanded || $new_scene_modal.expanded || $delete_scene_modal.expanded) {
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
          new_scene_modal.open();
          break;
        case 'KeyT':
          dispatch('switch_scene');
          break;
        case 'KeyP':
          portal_modal.open();
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
  class="absolute w-full flex flex-row gap-4 bg-zinc-900 px-4 pb-4 pt-16 h-screen"
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
        on:click={() => new_scene_modal.open()}
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
      on:click={() => dispatch('switch_view')}
      class="btn-primary mt-2"
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
      class="w-fit relative flex flex-col gap-8 mt-2 bg-zinc-700 text-white duration-150 ease-out p-4 rounded grow h-full select-none overflow-y-auto"
    >
      {#if current_scene_id != undefined}
        {#if agent_asset_urls.size}
          <div>
            <h4 class:text-emerald-400={fill_mode == 'agent'} class="h4 pb-2">
              Agents <span class="text-zinc-300 text-sm"
                >{fill_mode == 'bg' ? '(F to switch) ' : ''}</span
              >
            </h4>
            <div class="flex flex-wrap gap-x-8 gap-y-12 h-52 overflow-y-auto">
              {#each Object.entries(agents) as [key, val], i}
                <button
                  on:click={() => selects.agent(key)}
                  class="relative flex items-center justify-center w-16 h-16"
                  class:active={brushes.agent == key}
                  title={key}
                >
                  <span
                    style:width="64px"
                    style:height="64px"
                    style:background-size="cover"
                    style:background-repeat="no-repeat"
                    style:background-image="url({agent_asset_urls.get(key)?.default})"
                  />
                  <span class="absolute -bottom-6 bg-zinc-800 w-6 border border-zinc-500"
                    >{i + 1}</span
                  >
                </button>
              {/each}
            </div>
          </div>
        {:else}
          <p class="text-sm text-zinc-300">Agent assets not found.</p>
        {/if}
        {#if bg_asset_urls.size}
          <div>
            <h4 class:text-emerald-400={fill_mode == 'bg'} class="h4 pb-2">
              Backgrounds <span class="text-zinc-300 text-sm"
                >{fill_mode == 'agent' ? '(F to switch)' : ''}</span
              >
            </h4>
            <div class="flex flex-wrap gap-x-8 gap-y-12 h-52 overflow-y-auto">
              {#each Object.entries(backgrounds) as [key, val], i}
                <button
                  on:click={() => selects.bg(key)}
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
                  />
                  <span class="absolute -bottom-6 bg-zinc-800 w-6 border border-zinc-500"
                    >{i + 1}</span
                  >
                </button>
              {/each}
            </div>
          </div>
        {:else}
          <p class="text-sm text-zinc-300">Background assets not found.</p>
        {/if}
        <div class="flex-grow"></div>
        <div>
          <h4 class="h4">Portals</h4>
          <div class="flex flex-row gap-2 pt-2">
            <button
              data-tippy-content="Ctrl + R"
              class="btn-outline w-full"
              color="purple"
              on:click={() => (portal_remove_mode = !portal_remove_mode)}
              >{portal_remove_mode ? 'Cancel' : 'Remove Portal'}</button
            >
            <button
              data-tippy-content={portal_btn_disabled
                ? 'You need at least two scenes to place a portal'
                : 'Ctrl + P'}
              class="btn-secondary w-full"
              color="purple"
              on:click={() => {
                if (portal_btn_disabled) return;
                portal_remove_mode = false;
                portal_modal.open();
              }}>New Portal</button
            >
          </div>
        </div>
      {/if}
    </div>
  </section>
  <section class="flex flex-col gap-2 w-4/5 h-full group">
    <div
      class="relative h-11 bg-zinc-700 w-full rounded p-2 px-4 text-white flex flex-row justify-between"
    >
      <label class="cursor-pointer">
        <input type="checkbox" bind:checked={show_pos} />
        Show Positions
      </label>

      <Dropdown>
        <svg
          slot="button"
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
        <div slot="items" class="bg-zinc-700 rounded p-4 flex flex-col gap-2 items-start">
          <button
            on:click={() => {
              /** TODO **/
            }}
            class="hover:text-emerald-400 ease-out duration-150">Set as starting scene</button
          >
          <button
            on:click={() => delete_scene_modal.open()}
            class="hover:text-red-400 ease-out duration-150">Delete scene</button
          >
        </div>
      </Dropdown>
    </div>
    <div
      class="text-sm bg-amber-900 text-amber-50 border border-amber-200 p-2 group-has-[.must-be-replaced-agent,.must-be-replaced-background]:block hidden"
    >
      Some agents/backgrounds on the map have no asset references. Change them to elements with
      asset references.
      <button class=" py-0" on:click={show_must_be_replaced_elements}>Show</button>
      <div class="p-2 bg-amber-950 shadow-inner has-[form]:flex flex-col gap-4 hidden">
        {#each [...must_be_replaced.agent_names.values(), ...must_be_replaced.background_names.values()] as name}
          {@const is_agent = must_be_replaced.agent_names.has(name)}
          <form class="flex flex-row gap-2" on:submit={replace_elements}>
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
    <section class="w-full h-full overflow-auto bg-zinc-500 border">
      {#if current_scene}
        {#each { length: current_scene.height } as _, i}
          <div class="row flex flex-row w-max">
            {#each { length: current_scene.width } as __, j}
              {@const pos = i * current_scene.width + j}
              {@const agent = current_scene.agents.get(pos)}
              {@const bg = current_scene.backgrounds.get(pos)}
              {@const portal = current_scene.portals.get(pos)}
              {@const bg_url = bg ? bg_asset_urls.get(bg) : ''}
              {@const agent_url = agent ? agent_asset_urls.get(agent)?.default : ''}

              <!-- BACKLOG: arrow key navigation -->
              <button
                on:contextmenu|preventDefault={() => !show_pos && right_clicked(pos)}
                on:mouseenter={() => mouse_entered(pos)}
                on:click={() => cell_clicked(pos)}
                class="relative flex items-center justify-center size-16 focus:z-20"
              >
                {#if portal}
                  {@const to_scene = project.scenes.get(portal.to_scene_id)}
                  <button
                    on:click={() => delete_portal(pos)}
                    id="portal_{pos}"
                    data-tippy-content={`${to_scene?.name} #${portal.to_position}`}
                    class="absolute top-0 border-4 border-purple-600 w-full h-full z-20 {portal_remove_mode
                      ? 'hover:border-red-500'
                      : ''}"
                  />
                {/if}
                {#if show_pos}
                  <span>{pos}</span>
                {:else}
                  {#if bg_url}
                    <span
                      style:background-image="url({bg_url})"
                      class="sprite absolute w-full h-full z-10"
                    />
                  {:else if bg}
                    <span
                      class="must-be-replaced-background z-20 bg-zinc-200 px-2 py-0.5 rounded text-xs"
                      >{bg}</span
                    >
                  {/if}
                  {#if agent_url}
                    <span
                      style:background-image="url({agent_url})"
                      class="sprite absolute w-full h-full z-10"
                    />
                  {:else if agent}
                    <span
                      class="must-be-replaced-agent z-20 bg-zinc-200 px-2 py-0.5 rounded text-xs"
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

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<Modal bind:dialog={new_scene_modal}>
  <h3 class="pb-4">Create a new scene</h3>
  <form class="flex flex-col gap-4" on:submit={create_scene}>
    <label class="flex flex-col" for="name">
      Name
      <input
        on:input={scene_name_input}
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
    <button class="btn-primary">Create</button>
  </form>
  <button class="absolute top-2 right-4" on:click={() => new_scene_modal.close()}>{CROSS}</button>
</Modal>

<Modal bind:dialog={portal_modal}>
  <h3 class="h3 pb-4">Portal</h3>
  <form class="flex flex-col gap-4" on:submit={create_portal}>
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
        {#await project.scenes.get(portal_to_id)}
          Loading...
        {:then scene}
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
        {/await}
      {/if}
    </div>
    <button class="btn-primary">Create</button>
  </form>

  <button class="absolute top-2 right-4" on:click={() => portal_modal.close()}>{CROSS}</button>
</Modal>

<Modal bind:dialog={delete_scene_modal}>
  <h3 class="h3">Delete scene "{current_scene?.name}"?</h3>
  <form
    on:submit|preventDefault={delete_current_scene}
    class="flex flex-row gap-2 w-full justify-end pt-4"
  >
    <button type="button" on:click={() => delete_scene_modal.close()} class=" btn-ghost">
      Cancel
    </button>
    <button type="submit" class="btn-alert">Delete</button>
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
