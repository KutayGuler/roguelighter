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
    on_step_function_failed: Function;
    on_window_handler_failed: Function;
  }
</script>

<script lang="ts">
  // LATER: introduce helpers
  import { Canvas } from '@threlte/core';
  import GuiElement from './GuiElement.svelte';
  import Scene from './Scene.svelte';
  // import { World, Debug } from '@threlte/rapier';
  import type {
    Setup,
    GUI_Element,
    GUI,
    Functions,
    WindowHandlers as TWindowHandlers
  } from '../../types/game';
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
    on_exit,
    on_step_function_failed,
    on_window_handler_failed
  }: Props = $props();

  let {
    variables: variables_obj,
    agents,
    settings,
    functions: functions_obj,
    window: window_handlers_obj,
    step: step_fn_str,
    gui,
    __dev_only
  } = $state(code_string_to_json(project.code) as Setup);

  let step = new Function('return ' + step_fn_str)();
  let functions: Functions = $state({});
  let window_handlers: TWindowHandlers = $state({});
  let variables = $state({});
  let computed_variable_names = $state(new SvelteSet());

  let unmodified_scenes = structuredClone(project.scenes);
  let scene: PlayableScene = $state() as PlayableScene;
  let scenes = new Map<UUID, PlayableScene>();
  let scene_just_changed = $state(false);
  let player_pos = $state(0);

  const PROCESS = {
    exit: on_exit
  };

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

  function instantiate() {
    for (let [key, fn_str] of Object.entries(window_handlers_obj)) {
      // @ts-expect-error
      window_handlers[key] = new Function('return ' + fn_str)();
    }

    for (let [key, fn_str] of Object.entries(functions_obj)) {
      functions[key] = new Function('return ' + fn_str)();
    }

    for (let [variable_name, value] of Object.entries(variables_obj)) {
      if (typeof value == 'string' && value.startsWith('function')) {
        const fn = new Function('return ' + value)();
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
    transform_scenes();
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
      return variables[variable_name](variables, functions, PROCESS);
    } else {
      // @ts-expect-error
      return variables[variable_name];
    }
  }

  instantiate();
</script>

<WindowHandlers {window_handlers} bind:variables bind:functions {PROCESS} {on_window_handler_failed}
></WindowHandlers>

{#if scene}
  <main class="relative w-full h-full" style:background={settings.scene?.background || 'black'}>
    <Canvas>
      <Scene
        {step}
        {change_scene}
        {player_pos}
        {settings}
        {scene}
        {scene_just_changed}
        {bg_asset_urls}
        {agent_asset_urls}
        bind:variables
        bind:functions
        {PROCESS}
        {on_step_function_failed}
      />
    </Canvas>

    {#snippet children_handler(nested_obj: GUI | GUI_Element)}
      {#each Object.entries(nested_obj) as [name, element_or_if_or_for]}
        {#if [TEMPLATE_IF_STATEMENT, TEMPLATE_FOR_LOOP].includes(name)}
          {@const is_in_if_block = name == TEMPLATE_IF_STATEMENT}
          {@const is_in_for_block = name == TEMPLATE_FOR_LOOP}
          {#each Object.entries(element_or_if_or_for) as [name, gui_element]}
            <GuiElement
              bind:variables
              bind:functions
              {PROCESS}
              {is_in_if_block}
              {is_in_for_block}
              {get_variable_value}
              {children_handler}
              {name}
              {gui_element}
            />
          {/each}
        {:else}
          <GuiElement
            bind:variables
            bind:functions
            {PROCESS}
            gui_element={element_or_if_or_for}
            {get_variable_value}
            {children_handler}
            {name}
          />
        {/if}
      {/each}
    {/snippet}

    {@render children_handler(gui)}
  </main>
{/if}
