import { json_to_code_string, template_json_code } from 'roguelighter-core';
import type { GameData, Portal, RoguelighterProject } from 'roguelighter-core';

interface Tutorial {
  header: string;
  description: string;
  project: RoguelighterProject;
  solution: GameData;
  solution_tuple: [string, any];
}

export const tutorials: { [key: string]: Tutorial } = {
  intro: {
    header: 'Header',
    description: 'description',
    solution: Object.assign(structuredClone(template_json_code), {
      settings: {
        fps: 8,
        easing: 'sineOut',
        duration: 400,
        camera: {
          zoom: 10
        }
      }
    }),
    project: {
      code: json_to_code_string(template_json_code),
      parsed_code: template_json_code as GameData,
      scenes: new Map([
        [
          0,
          {
            name: 'whatever',
            backgrounds: new Map<number, string>([
              [0, 'floor'],
              [1, 'floor_2'],
              [2, 'floor'],
              [10, 'floor'],
              [11, 'floor_2'],
              [12, 'floor'],
              [20, 'floor'],
              [21, 'floor'],
              [22, 'floor']
            ]),
            agents: new Map<number, string>([[0, 'player']]),
            portals: new Map<number, Portal>(),
            width: 10,
            height: 10
          }
        ]
      ])
    },
    solution_tuple: ['settings.camera.zoom', 10]
  }
};
