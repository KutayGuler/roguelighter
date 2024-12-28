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
  // LATER: introduce helpers
  import { Canvas } from '@threlte/core';
  import GuiElement from './GuiElement.svelte';
  import Scene from './Scene.svelte';
  import { World, Debug } from '@threlte/rapier';
  import type { Setup, GUI_Element, GUI, Handlers } from '../../types/game';
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
  import WindowHandlers from './WindowHandlers.svelte';

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

  let _$_ = $state(code_string_to_json(project.code) as Setup);
  let {
    variables: variables_obj,
    agents,
    settings,
    handlers: handlers_obj,
    gui,
    __dev_only
  } = $state(_$_);
  let handlers: Handlers = $state({});
  let variables = $state({});
  let computed_variable_names = $state(new SvelteSet());

  let unmodified_scenes = structuredClone(project.scenes);
  let scene: PlayableScene = $state() as PlayableScene;
  let scenes = new Map<UUID, PlayableScene>();
  let scene_just_changed = $state(false);
  let player_pos = $state(0);
  let game_paused = $state(false);

  const internal_events = {
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

  let instantiated = $state(false);

  function instantiate() {
    for (let [key, fn_str] of Object.entries(handlers_obj)) {
      if (key == 'window') {
        handlers.window = {};

        // @ts-expect-error
        for (let [window_key, window_fn_str] of Object.entries(handlers_obj.window)) {
          // @ts-expect-error
          handlers.window[window_key] = new Function(
            // @ts-expect-error
            'return ' + window_fn_str.replace('(e)', '(e, _, $)')
          )();
        }
      } else {
        // @ts-expect-error
        handlers[key] = new Function('return ' + fn_str.replace('()', '(_, $)'))();
      }
    }

    console.log(handlers);

    for (let [variable_name, value] of Object.entries(variables_obj)) {
      if (typeof value == 'string' && value.startsWith('function ()')) {
        const modified_fn_str = value.replace('()', '(_, $)');
        const fn = new Function('return ' + modified_fn_str)(variables, handlers);
        // @ts-expect-error
        variables[variable_name] = fn;
        computed_variable_names.add(variable_name);
      } else {
        // @ts-expect-error
        variables[variable_name] = value;
      }
    }

    let internal_variables = {};
    Object.assign(variables_obj, internal_variables);
    Object.assign(handlers, internal_events);
    transform_scenes();
    instantiated = true;
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
    if (computed_variable_names.has(variable_name)) {
      // @ts-expect-error
      return variables[variable_name](variables, handlers);
    } else {
      // @ts-expect-error
      return variables[variable_name];
    }
  }

  instantiate();

  // TODO: add new component (Collider or CollisionBox)
  // TODO: should fire handlers (on_contact, on_bla)
</script>

<WindowHandlers window_handlers={handlers.window} bind:variables bind:handlers></WindowHandlers>

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

{#snippet children_handler(nested_obj: GUI | GUI_Element)}
  {#each Object.entries(nested_obj) as [name, element_or_if_or_for]}
    {#if name == TEMPLATE_IF_STATEMENT}
      {#each Object.entries(element_or_if_or_for) as [name, gui_element]}
        <GuiElement
          bind:variables
          bind:handlers
          is_in_if_block
          {get_variable_value}
          {children_handler}
          {name}
          {gui_element}
        />
      {/each}
    {:else if name == TEMPLATE_FOR_LOOP}
      {#each Object.entries(element_or_if_or_for) as [name, gui_element]}
        <GuiElement
          bind:variables
          bind:handlers
          is_in_for_block
          {get_variable_value}
          {children_handler}
          {name}
          {gui_element}
        />
      {/each}
    {:else}
      <GuiElement
        bind:variables
        bind:handlers
        gui_element={element_or_if_or_for}
        {get_variable_value}
        {children_handler}
        {name}
      />
    {/if}
  {/each}
{/snippet}

{#if instantiated}
  {@render children_handler(gui)}
{/if}

<!-- <svelte:boundary>
 {#snippet failed(error, reset)}
    <div class="pl-4 pt-16">
      <p>An error occured while rendering the GUI</p>
      <pre class="text-xs">{error}</pre>
      <button class="self-start btn-secondary !px-8 mt-4" onclick={reset}>Retry</button>
    </div>
  {/snippet}
</svelte:boundary> -->
