<script module>
  interface Props {
    // BACKLOG: portals can only go through their realms (dev_only, game_only)
    project: RoguelighterProject;
    current_scene_id: UUID | undefined;
    bg_asset_urls: BackgroundAssetUrls;
    agent_asset_urls: AgentAssetUrls;
    on_exit: Function;
    DEV?: boolean;
    exit_dev?: Function;
  }
</script>

<script lang="ts">
  // TODO LATER: introduce helpers
  import { Canvas } from '@threlte/core';
  import GuiElement from './GuiElement.svelte';
  import Scene from './Scene.svelte';
  import { World, Debug } from '@threlte/rapier';
  import type { KeyboardEventCode, GameData, GUI_Element, GUI } from '../../types/game';
  import { code_string_to_json, pos_to_xy } from '../../utils';
  import type {
    AgentAssetUrls,
    BackgroundAssetUrls,
    PlayableScene,
    Portal,
    RoguelighterProject,
    UUID
  } from '../../types/engine';
  import { TEMPLATE_FOR_LOOP, TEMPLATE_IF_STATEMENT } from '../../constants';
  import { SvelteSet } from 'svelte/reactivity';

  // BACKLOG: try catch for user defined functions
  // BACKLOG: introduce objects
  // BACKLOG: introduce agents[agent_name].props
  // BACKLOG: dev_only scenes

  let {
    project,
    current_scene_id,
    bg_asset_urls,
    agent_asset_urls,
    DEV = false,
    on_exit
  }: Props = $props();

  let _ = $state(code_string_to_json(project.code) as GameData);
  let { variables, agents, settings, events, gui, keybindings, collisions, __dev_only } = $state(_);

  let unmodified_scenes = structuredClone(project.scenes);
  let scene: PlayableScene = $state() as PlayableScene;
  let scenes = new Map<UUID, PlayableScene>();
  let scene_just_changed = $state(false);
  let player_pos = $state(0);
  let game_paused = $state(false);
  let special_keys: Array<KeyboardEventCode> = [];

  const internal_events = {
    $open_pause_menu() {
      window.dispatchEvent(new Event('paused'));
      variables.$pause_menu = true;
      game_paused = true;
    },
    $close_pause_menu() {
      window.dispatchEvent(new Event('unpaused'));
      variables.$pause_menu = false;
      game_paused = false;
    },
    $toggle_pause_menu() {
      if (game_paused) {
        internal_events.$close_pause_menu();
      } else {
        internal_events.$open_pause_menu();
      }
    },
    $exit: on_exit
  } as const;

  function transform_scenes() {
    for (let [id, scene] of unmodified_scenes) {
      // @ts-expect-error
      let transformed_scene: PlayableScene = structuredClone(scene);

      for (let [pos, name] of scene.agents.entries()) {
        let [x, y] = pos_to_xy(pos, scene.width);

        transformed_scene.agents.set(pos, {
          // @ts-expect-error
          name,
          x,
          y,
          states: agents[name].states,
          state: 'default'
        });

        if (name == 'player') {
          if (id == current_scene_id) {
            player_pos = pos;
          } else {
            transformed_scene.agents.delete(pos);
          }
        }
      }

      scenes.set(id, transformed_scene);
    }

    scene = scenes.get(current_scene_id as UUID) as PlayableScene;
  }

  let computed_variables = {};
  let computed_variable_names = new SvelteSet();

  function instantiate() {
    for (let [key, event_name] of Object.entries(keybindings)) {
      if ((event_name as string)[0] == '$') {
        special_keys.push(key as KeyboardEventCode);
      }
    }

    for (let [key, val] of Object.entries(events)) {
      if (typeof val === 'string') {
        const fn_str = val;
        const fn = new Function('return ' + fn_str)();
        events[key] = fn;
      }
    }

    for (let variable_name of Object.keys(variables)) {
      const fn_str_or_other = variables[variable_name];

      if (typeof fn_str_or_other == 'string' && fn_str_or_other.startsWith('function (_)')) {
        const modified_fn_str = fn_str_or_other.replace('(_)', '(variables)').replace('_.', ''); // will not work if "_.variables" is destructured
        const fn = new Function('return ' + modified_fn_str)(variables);
        // @ts-expect-error
        computed_variables[variable_name] = fn;
        computed_variable_names.add(variable_name);
      }
    }

    let internal_variables = { $pause_menu: false };
    Object.assign(variables, internal_variables);
    Object.assign(events, internal_events);
    transform_scenes();
  }

  function handle(kbd_event: KeyboardEvent) {
    let event_code = kbd_event.code;

    if (kbd_event.ctrlKey) {
      event_code = 'Control_' + kbd_event.code;
    } else if (kbd_event.shiftKey) {
      event_code = 'Shift_' + kbd_event.code;
    } else if (kbd_event.altKey) {
      event_code = 'Alt_' + kbd_event.code;
    }

    let event_name = keybindings[event_code as KeyboardEventCode];

    if (DEV && __dev_only?.keybindings && !event_name) {
      event_name = __dev_only?.keybindings[event_code as KeyboardEventCode];
    }

    if (!event_name || (game_paused && !event_name.includes('pause_menu'))) return;

    if (Array.isArray(event_name)) {
      const [fn_name, args] = [...event_name];
      events[fn_name](_, ...args);
    } else {
      events[event_name](_);
    }

    // BACKLOG: could be optimized by checking which variables are being updated
    window.dispatchEvent(new Event('fired_event'));
  }

  function change_scene(portal_info: Portal) {
    const { to_scene_id, to_position } = portal_info;
    let player = scene.agents.get(player_pos);
    if (!player) return;

    scene = scenes.get(to_scene_id) as PlayableScene;
    player_pos = to_position;
    let [x, y] = pos_to_xy(player_pos, scene.width);
    Object.assign(player, {
      name: 'player',
      x,
      y
    });
    scene.agents.set(to_position, player);
    scene_just_changed = true;
  }

  function get_variable_value(variable_name: string) {
    if (variable_name in computed_variables) {
      // @ts-expect-error
      return computed_variables[variable_name](variables);
    } else {
      return variables[variable_name];
    }
  }

  instantiate();

  // TODO: add new component (Collider or CollisionBox)
  // TODO: should fire events (on_contact, on_bla)
  $inspect(variables);
</script>

<svelte:window onkeydown={handle} />

<!-- FIXME: top-12 issue (could show/hide the top bar with a key)-->

<svelte:boundary>
  {#if scene}
    <main class="w-full h-full" style:background={settings.scene?.background}>
      <Canvas>
        <World>
          <Debug />

          <Scene
            {change_scene}
            {player_pos}
            {settings}
            {scene}
            {scene_just_changed}
            {bg_asset_urls}
            {agent_asset_urls}
          />
        </World>
      </Canvas>
    </main>
  {/if}

  {#snippet failed(error, reset)}
    <div class="pl-4 pt-16">
      <p>An error occured while rendering the canvas</p>
      <pre class="text-xs">{error}</pre>
      <button class="self-start btn-secondary !px-8 mt-4" onclick={reset}>Retry</button>
    </div>
  {/snippet}
</svelte:boundary>
<!-- <svelte:boundary> -->

{#snippet children_handler(nested_obj: GUI | GUI_Element)}
  {#each Object.entries(nested_obj) as [name, element_or_if_or_for]}
    {#if name == TEMPLATE_IF_STATEMENT}
      {#each Object.entries(element_or_if_or_for) as [name, gui_element]}
        <GuiElement
          {get_variable_value}
          {children_handler}
          is_in_if_block
          {events}
          {name}
          {gui_element}
        />
      {/each}
    {:else if name == TEMPLATE_FOR_LOOP}
      {#each Object.entries(element_or_if_or_for) as [name, gui_element]}
        <GuiElement
          {get_variable_value}
          {children_handler}
          is_in_for_block
          {events}
          {name}
          {gui_element}
        />
      {/each}
    {:else}
      <GuiElement
        {get_variable_value}
        {children_handler}
        {events}
        {name}
        gui_element={element_or_if_or_for}
      />
    {/if}
  {/each}
{/snippet}

{@render children_handler(gui)}

<!-- {#each Object.entries(gui) as [name, element_or_if_or_for]}
  {#if name == TEMPLATE_IF_STATEMENT}
    {#each Object.entries(element_or_if_or_for) as [name, gui_element]}
      <GuiElement is_in_if_block {events} {name} {gui_element} bind:variables />
    {/each}
  {:else if name == TEMPLATE_FOR_LOOP}
    {#each Object.entries(element_or_if_or_for) as [name, gui_element]}
      <GuiElement is_in_for_block {events} {name} {gui_element} bind:variables />
    {/each}
  {:else}
    <GuiElement {events} {name} gui_element={element_or_if_or_for} bind:variables />
  {/if}
{/each} -->

<!-- {#snippet failed(error, reset)}
    <div class="pl-4 pt-16">
      <p>An error occured while rendering the GUI</p>
      <pre class="text-xs">{error}</pre>
      <button class="self-start btn-secondary !px-8 mt-4" onclick={reset}>Retry</button>
    </div>
  {/snippet} -->
<!-- </svelte:boundary> -->
