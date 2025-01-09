<script lang="ts">
	import {
		CodeEditor,
		Game,
		json_to_code_string,
		REPLACER,
		Scene,
		template_json_code
	} from 'roguelighter-core';

	let code = json_to_code_string(template_json_code);

	for (let [to_be_replaced, new_value] of REPLACER) {
		code = code.replace(to_be_replaced, new_value);
	}

	let project = {
		name: 'whatever',
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
		code: code
	};
	let agent_asset_urls = new Map([
		['player', '/elf_idle.png'],
		['coin', '/coin.png']
	]);
	let bg_asset_urls = new Map([['floor', '/floors/floor_1.png']]);

	// @ts-expect-error
	project.scenes = new Map(project.scenes);
	// @ts-expect-error
	let scene = project.scenes.get(0) as Scene;
	scene.backgrounds = new Map(scene?.backgrounds);
	scene.agents = new Map(scene?.agents);
	scene.portals = new Map();
</script>

<!-- <CodeEditor {project} view="code" save_file={() => {}}></CodeEditor> -->
<Game {project} {bg_asset_urls} {agent_asset_urls}></Game>
