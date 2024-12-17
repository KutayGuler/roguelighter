<script lang="ts">
	import {
		get_tailwind_classes,
		json_to_code_string,
		template_json_code,
		type GameData
	} from 'roguelighter-core/utils';
	import { Game } from 'roguelighter-core';
	import type { Scene } from 'roguelighter-core';
	import RunCSS from 'runcss';
	const { processClasses: process_classes } = RunCSS();
	// process_classes(Array.from(get_tailwind_classes((parsed as GameData).gui).values()).join(' '));

	let project = {
		scenes: [
			[
				0,
				{
					name: 'tutorial',
					backgrounds: [
						[0, 'floor'],
						[1, 'floor'],
						[2, 'floor'],
						[3, 'floor'],
						[4, 'floor'],
						[5, 'floor'],
						[6, 'floor'],
						[7, 'floor'],
						[8, 'floor']
					],
					portals: [],
					agents: [[0, 'player']],
					width: 3,
					height: 3
				}
			]
		],
		agent_asset_urls: [['player', 'run2.png']],
		bg_asset_urls: [['floor', '/floors/floor_1.png']]
	};

	const overrides: Partial<GameData> = {
		settings: {
			fps: 8,
			easing: 'sineOut',
			duration: 400,
			camera: {
				zoom: 8
			},
			scene: {
				background: 'black'
			}
		},
		agents: {
			player: {
				states: {
					idle: {
						frame_count: 8
					}
				}
			}
		},
		variables: {
			count: 0,
			count_smaller_than_five: '$var(count) < 5'
		},
		gui: {
			$pause_menu: template_json_code.gui.$pause_menu,
			inventory: {
				tokens: ['absolute', 'bottom-0', 'w-1/2', 'max-w-xl', 'h-24', 'bg-gray-500']
			}
		}
	} as const;

	process_classes(Array.from(get_tailwind_classes(template_json_code.gui).values()).join(' '));
	if (overrides.gui) {
		process_classes(Array.from(get_tailwind_classes(overrides.gui).values()).join(' '));
	}

	const template_code_string = json_to_code_string({
		...template_json_code,
		...overrides
	});

	// @ts-expect-error
	project.code = template_code_string;
	// @ts-expect-error
	project.scenes = new Map(project.scenes);
	let scene = project.scenes.get(0) as Scene;
	scene.backgrounds = new Map(scene?.backgrounds);
	scene.agents = new Map(scene?.agents);
	scene.portals = new Map();
	// @ts-expect-error
	project.agent_asset_urls = new Map(project.agent_asset_urls);
	// @ts-expect-error
	project.bg_asset_urls = new Map(project.bg_asset_urls);
</script>

<Game
	{project}
	on_exit={() => {}}
	agent_asset_urls={project.agent_asset_urls}
	bg_asset_urls={project.bg_asset_urls}
	current_scene_id={0}
></Game>
