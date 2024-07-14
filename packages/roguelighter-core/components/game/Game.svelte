<script lang="ts">
  import { Canvas } from '@threlte/core';
  import GuiElement from './GuiElement.svelte';
  import Scene from './Scene.svelte';
  import type {
    WritableProps,
    _,
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
  import { split } from 'string-ts';
  import { exit } from '@tauri-apps/api/process';
  import { code_string_to_json, pos_to_xy } from '../../utils';

  export let project: RoguelighterProject;
  export let current_scene_id: number;
  export let bg_asset_urls: BackgroundAssetUrls;
  export let agent_asset_urls: AgentAssetUrls;

  let { variables, agents, settings, events, gui, keybindings, collisions } = code_string_to_json(
    project.code
  ) as GameData;

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

  function opm() {
    window.dispatchEvent(new Event('paused'));
    _.v.$pause_menu = true;
    game_paused = true;
  }

  function cpm() {
    window.dispatchEvent(new Event('unpaused'));
    _.v.$pause_menu = false;
    game_paused = false;
  }

  const f = {
    async wait(ms = DURATION) {
      return new Promise((res) => setTimeout(res, ms));
    },
    $open_pause_menu: opm,
    $close_pause_menu: cpm,
    $toggle_pause_menu() {
      if (game_paused) {
        cpm();
      } else {
        opm();
      }
    },
    toggle(str: WritableProps<typeof variables>) {
      _.v[str] = !_.v[str];
    },
    set(str: WritableProps<typeof variables>, val: any) {
      const [type, prop] = split(str, '.');
      // @ts-expect-error
      _[type][prop] = val;
    },
    async move(axis: PlayerPositions, val: any, animation: string) {
      let player = scene.agents.get(player_pos);
      if (!player) return;

      let x = axis == 'x' ? val : 0;
      let y = axis == 'y' ? val : 0;
      let next_pos = player.x + x + (player.y + y) * scene.height * -1;
      let bg = scene.backgrounds.get(next_pos);
      let x_out_of_bounds =
        (next_pos % scene.width == scene.width - 1 && x == -1) ||
        (next_pos % scene.width == 0 && x == 1);

      if (x_out_of_bounds || !bg || collisions.includes(bg) || scene.agents.has(next_pos)) {
        return;
      }

      if (animation) {
        this.play(animation);
      }

      if (axis == 'x') {
        camera_x_tween.set(player[axis] + val);
      } else {
        camera_y_tween.set(player[axis] + val);
      }

      // @ts-expect-error
      await scene.agents.get(player_pos)[
        `${axis}_tween`
        // @ts-expect-error
      ].set(scene.agents.get(player_pos)[axis] + val);
      // @ts-expect-error
      scene.agents.set(next_pos, scene.agents.get(player_pos));
      scene.agents.delete(player_pos);
      player_pos = next_pos;
      scene_just_changed = false;
    },
    play(str: string, val: any) {
      // @ts-expect-error
      scene.agents.get(player_pos).state = str;
      // @ts-expect-error
      scene.agents.get(player_pos).revert_state_in = val || 1;
    },
    add(str: WritableProps<typeof variables>, val: any) {
      let [type, prop] = split(str, '.');

      // @ts-expect-error
      _[type][prop] += val;
    },
    async $exit() {
      await exit();
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
    $close_pause_menu: f.$close_pause_menu
  });

  let _: _ = {
    v: variables,
    e: {}
  };

  for (let [key, event_expression] of Object.entries(events)) {
    if (key[0] == '$') {
      // @ts-expect-error
      _.e[key] = events[key];
      continue;
    }

    // binding keys to events
    _.e[key] = async () => {
      const [str, _args] = event_expression;
      const split = str.split(' ');
      const type = split[0];
      split.shift();
      // @ts-expect-error
      await f[type](...split, _args);
    };
  }

  function handle(kbd_event: KeyboardEvent) {
    const event_name = keybindings[kbd_event.code as KeyboardEventCode] as string;
    if (!event_name) return;

    if (special_keys.includes(kbd_event.code as KeyboardEventCode)) {
      _.e[event_name]();
      return;
    }

    if (game_paused) return;
    _.e[event_name]();
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
      <GuiElement events={_.e} {name} variables={_.v} {guiElement} />
    {/each}
  </section>
</main>
