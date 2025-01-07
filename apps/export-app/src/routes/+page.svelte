<script lang="ts">
  import { json_to_code_string, Game } from 'roguelighter-core';
  import type {
    AgentAssetUrls,
    BackgroundAssetUrls,
    Portal,
    RoguelighterProject
  } from 'roguelighter-core';
  import { exit } from '@tauri-apps/plugin-process';

  // LATER: zoom settings not working
  const id = crypto.randomUUID();

  const project: RoguelighterProject = {
    name: 'export-app',
    code: json_to_code_string({
      settings: {
        fps: 8,
        camera: {
          zoom: 20
        }
      },
      agents: {
        player: {
          states: {
            idle: {
              frame_count: 4
            },
            walk: {
              frame_count: 4
            }
          }
        }
      },
      variables: {
        variable_name: 3
      },
      events: {},
      keybindings: {},
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
    scenes: new Map([
      [
        id,
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

  const agent_asset_urls: AgentAssetUrls = new Map([]);
  const bg_asset_urls: BackgroundAssetUrls = new Map([['floor', '/floors/floor_1.png']]);
</script>

<Game {project} {bg_asset_urls} {agent_asset_urls} current_scene_id={id} on_exit={exit}></Game>
