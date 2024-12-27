<script lang="ts">
	// import *
	import { CodeEditor, json_to_code_string, template_json_code } from 'roguelighter-core';

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
		agent_asset_urls: [['player', 'run2.png']],
		bg_asset_urls: [['floor', '/floors/floor_1.png']],
		code: json_to_code_string(template_json_code)
	};

	// @ts-expect-error
	project.scenes = new Map(project.scenes);
	// @ts-expect-error
	let scene = project.scenes.get(0) as Scene;
	scene.backgrounds = new Map(scene?.backgrounds);
	scene.agents = new Map(scene?.agents);
	scene.portals = new Map();
	// @ts-expect-error
	project.agent_asset_urls = new Map(project.agent_asset_urls);
	// @ts-expect-error
	project.bg_asset_urls = new Map(project.bg_asset_urls);
</script>

<CodeEditor {project} view="code" save_file={() => {}}></CodeEditor>
