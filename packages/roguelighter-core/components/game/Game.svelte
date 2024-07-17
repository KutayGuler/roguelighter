<script lang="ts">
  import { Canvas } from '@threlte/core';
  import GuiElement from './GuiElement.svelte';
  import Scene from './Scene.svelte';
  import type {
    WritableProps,
    PlayerPositions,
    KeyboardEventCode,
    PlayableScene,
    RoguelighterProject,
    BackgroundAssetUrls,
    AgentAssetUrls,
    GameData
  } from '../../types';
  import { tweened, type Tweened } from 'svelte/motion';
  import * as easings from 'svelte/easing';
  import { DEFAULT_DURATION, DEFAULT_EASING } from '../../constants';
  import { exit } from '@tauri-apps/api/process';
  import { code_string_to_json, pos_to_xy } from '../../utils';
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';
  const dispatch = createEventDispatcher();

  export let project: RoguelighterProject;
  export let current_scene_id: number;
  export let bg_asset_urls: BackgroundAssetUrls;
  export let agent_asset_urls: AgentAssetUrls;
  export let DEV = true;

  let _ = code_string_to_json(project.code) as GameData;
  let { variables, agents, settings, events, gui, keybindings, collisions } = _;

  for (let [key, val] of Object.entries(events)) {
    if (typeof val === 'string') {
      const fn_str = val;
      const fn = new Function('return ' + fn_str)();
      events[key] = fn;
    }
  }

  const DURATION = settings.duration || DEFAULT_DURATION;
  const EASING = settings.easing || DEFAULT_EASING;

  let unmodified_scenes = structuredClone(project.scenes);
  let scene: PlayableScene;
  let scenes = new Map<number, PlayableScene>();

  function set_camera_tween(x: number, y: number) {
    camera_x_tween = tweened(x, {
      duration: DURATION,
      easing: easings[EASING]
    });
    camera_y_tween = tweened(y, {
      duration: DURATION,
      easing: easings[EASING]
    });
  }

  function transform_scenes() {
    for (let [id, scene] of unmodified_scenes) {
      // @ts-expect-error
      let transformed_scene: PlayableScene = structuredClone(scene);

      for (let [pos, name] of scene.agents.entries()) {
        let [x, y] = pos_to_xy(pos, scene.width);

        transformed_scene.agents.set(pos, {
          name,
          x,
          y,
          x_tween: tweened(x, {
            duration: agents[name].duration || DURATION,
            easing: easings[agents[name].easing || EASING]
          }),
          y_tween: tweened(y, {
            duration: agents[name].duration || DURATION,
            easing: easings[agents[name].easing || EASING]
          }),
          states: agents[name].states,
          state: 'default'
        });

        if (name == 'player') {
          if (id == current_scene_id) {
            player_pos = pos;
            set_camera_tween(x, y);
          } else {
            transformed_scene.agents.delete(pos);
          }
        }
      }

      scenes.set(id, transformed_scene);
    }

    scene = scenes.get(current_scene_id) as PlayableScene;
  }

  let player_pos = 0;

  let camera_x_tween: Tweened<number>;
  let camera_y_tween: Tweened<number>;

  let game_paused = false;

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
    $exit: async () => {
      if (DEV) {
        dispatch('exit');
      } else {
        await exit();
      }
    }
  } as const;

  let special_keys: Array<KeyboardEventCode> = [];

  for (let [key, event_name] of Object.entries(keybindings)) {
    if ((event_name as string)[0] == '$') {
      special_keys.push(key as KeyboardEventCode);
    }
  }

  let internal_variables = { $pause_menu: false };
  Object.assign(variables, internal_variables);
  Object.assign(events, {
    $toggle_pause_menu: f.$toggle_pause_menu,
    $open_pause_menu: f.$open_pause_menu,
    $close_pause_menu: f.$close_pause_menu,
    $exit: f.$exit
  });

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
    const event_name = keybindings[kbd_event.code as KeyboardEventCode] as string;
    if (!event_name) return;

    if (special_keys.includes(kbd_event.code as KeyboardEventCode)) {
      events[event_name](_);
      variables = variables;
      return;
    }

    if (game_paused) return;
    events[event_name](_);
    variables = variables;
  }

  let scene_just_changed = false;

  function change_scene(e: CustomEvent) {
    const { to_scene_id, to_position } = e.detail;
    let player = scene.agents.get(player_pos);
    if (!player) return;

    scene = scenes.get(to_scene_id) as PlayableScene;
    player_pos = to_position;
    let [x, y] = pos_to_xy(player_pos, scene.width);
    Object.assign(player, {
      name: 'player',
      x,
      y,
      x_tween: tweened(x, {
        duration: agents.player.duration || DURATION,
        easing: easings[agents.player.easing || EASING]
      }),
      y_tween: tweened(y, {
        duration: agents.player.duration || DURATION,
        easing: easings[agents.player.easing || EASING]
      })
    });
    scene.agents.set(to_position, player);
    set_camera_tween(x, y);
    scene_just_changed = true;
  }

  transform_scenes();
</script>

<svelte:window on:keydown={handle} />

<main class="flex items-center justify-center w-full h-full bg-black">
  <section class="relative flex flex-col w-full h-full">
    {#if scene}
      <Canvas>
        <Scene
          on:change_scene={change_scene}
          {player_pos}
          {camera_x_tween}
          {camera_y_tween}
          {settings}
          {scene}
          {scene_just_changed}
          {bg_asset_urls}
          {agent_asset_urls}
        />
      </Canvas>
    {/if}
    {#each Object.entries(gui) as [name, guiElement]}
      <GuiElement {events} {name} {variables} {guiElement} />
    {/each}
  </section>
</main>
