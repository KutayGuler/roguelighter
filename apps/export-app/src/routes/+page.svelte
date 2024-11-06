<script lang="ts">
  import { json_to_code_string, template_json_code, Game } from 'roguelighter-core';
  import type { AgentAssetUrls, BackgroundAssetUrls, GameData, Portal } from 'roguelighter-core';
  // LATER: zoom settings not working
  // LATER: $exit not working
  const project = {
    code: json_to_code_string({
      settings: {
        fps: 8,
        easing: 'sineOut',
        duration: 400,
        camera: {
          zoom: 20
        }
      },
      collisions: ['floor_2'],
      agents: {
        player: {
          states: {
            default: {
              source: 'elf_idle.png',
              frame_count: 4
            },
            walk: {
              source: 'elf_run.png',
              frame_count: 4
            }
          }
        },
        orc: {
          states: {
            default: {
              source: 'orc.png'
            }
          }
        }
      },
      variables: {
        variable_name: 3
      },
      events: {
        move_up: [
          ['move', 'y', 1, 'walk']
          // ['move', 'x', 1, 'walk']
          // how to do simulatenous axis movement? using arrays and promise.all
          // how to check if all the functions are going to work?
          // skip invalid functions?
        ],
        move_down: [['move', 'y', -1, 'walk']],
        move_right: [['move', 'x', 1, 'walk']],
        move_left: [['move', 'x', -1, 'walk']]
      },
      keybindings: {
        Escape: '$toggle_pause_menu',
        ArrowUp: 'move_up',
        ArrowRight: 'move_right',
        ArrowDown: 'move_down',
        ArrowLeft: 'move_left'
      },
      conditions: {
        // something: ['x', '==', 'v.variable_name']
      },
      gui: {
        $pause_menu: {
          tokens: ['absolute', 'bottom-0', 'w-full', 'h-full', 'bg-black/50'],
          transition: { type: 'fade' },
          children: {
            continue: {
              type: 'button',
              tokens: ['bg-amber-200', 'font-bold', 'p-4', 'hover:bg-red-200'],
              onclick: '$close_pause_menu',
              text: 'Continue' // add variable {v.var_name}
            },
            exit: {
              type: 'button',
              tokens: ['bg-amber-200', 'font-bold', 'p-4', 'hover:bg-red-200'],
              onclick: '$exit',
              text: 'Exitto' // add variable {v.var_name}
            }
          }
        }
      }
    }),
    parsed_code: template_json_code as GameData,
    scenes: new Map([
      [
        0,
        {
          name: 'whatever',
          backgrounds: new Map<number, string>([
            [0, 'floor'],
            [1, 'floor'],
            [10, 'floor'],
            [11, 'floor'],
            [12, 'floor']
          ]),
          agents: new Map<number, string>([[0, 'player']]),
          portals: new Map<number, Portal>(),
          width: 10,
          height: 10
        }
      ]
    ])
  };

  const agent_asset_urls: AgentAssetUrls = new Map([
    [
      'player',
      {
        default: '/elf_idle.png',
        walk: '/elf_run.png'
      }
    ]
  ]);

  const bg_asset_urls: BackgroundAssetUrls = new Map([['floor', '/floors/floor_1.png']]);
</script>

<main class="w-screen h-screen">
  <Game {project} {bg_asset_urls} {agent_asset_urls} current_scene_id={0}></Game>
</main>
