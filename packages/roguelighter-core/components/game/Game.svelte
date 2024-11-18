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
  // @ts-expect-error
  import Scene from './Scene.svelte';
  import type { KeyboardEventCode, GameData } from '../../types/game';
  import { code_string_to_json, pos_to_xy } from '../../utils';
  import type {
    AgentAssetUrls,
    BackgroundAssetUrls,
    PlayableScene,
    Portal,
    RoguelighterProject,
    UUID
  } from '../../types/engine';

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

  const f = {
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
        f.$close_pause_menu();
      } else {
        f.$open_pause_menu();
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

    let internal_variables = { $pause_menu: false };
    Object.assign(variables, internal_variables);
    Object.assign(events, f);
    transform_scenes();
  }

  // for (let [key, fn] of Object.entries(events)) {
  //   if (key[0] == '$') {
  //     _.e[key] = events[key];
  //     continue;
  //   }

  //   // binding keys to events
  //   _.e[key] = async () => {
  //     const [str, _args] = fn;
  //     const split = str.split(' ');
  //     const type = split[0];
  //     split.shift();
  //     // @ts-expect-error
  //     await f[type](...split, _args);
  //   };
  // }

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

    if (!event_name || game_paused) return;

    if (Array.isArray(event_name)) {
      const [fn_name, args] = [...event_name];
      events[fn_name](_, ...args);
    } else {
      events[event_name](_);
    }
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

  instantiate();
</script>

<svelte:window onkeydown={handle} />

<!-- FIXME: top-12 issue -->

<main class="flex items-center justify-center w-full h-full bg-black">
  <section class="relative flex flex-col w-full h-full top-12">
    {#if scene}
      <Canvas>
        <Scene
          {change_scene}
          {player_pos}
          {settings}
          {scene}
          {scene_just_changed}
          {bg_asset_urls}
          {agent_asset_urls}
        />
      </Canvas>
    {/if}
    {#each Object.entries(gui) as [name, guiElement]}
      <GuiElement {events} {name} {guiElement} bind:variables />
    {/each}
  </section>
</main>
