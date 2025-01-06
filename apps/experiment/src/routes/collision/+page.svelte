<script lang="ts">
	import { Canvas, T } from '@threlte/core';
	import { World, useRapier, Debug } from '@threlte/rapier';
	import Agent from './Agent.svelte';
	import { Game, json_to_code_string, REPLACER, template_json_code } from 'roguelighter-core';
	let second = $state(false);
	let firstBox = $state();
	let secondBox = $state();

	let intersecting = $state();

	function check_collision() {
		if (!firstBox || !secondBox) {
			intersecting = false;
			return;
		}

		intersecting = firstBox.intersectsBox(secondBox);
	}

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
					agents: [
						[0, 'player'],
						[2, 'coin']
						// [2, 'player']
					],
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

<button
	onclick={() => {
		second = !second;
	}}>{second ? 'despawn' : 'spawn'}</button
>
<div>{intersecting}</div>

<Game {project} current_scene_id={0} {bg_asset_urls} {agent_asset_urls}></Game>
