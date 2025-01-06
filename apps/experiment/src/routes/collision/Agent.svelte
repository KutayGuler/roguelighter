<script lang="ts">
	import * as THREE from 'three';
	import { T, useTask } from '@threlte/core';

	let { is_first, thisBox: agent_box = $bindable(undefined), check_collision } = $props();

	let currentFrame = $state(1);

	const fps = 8;
	const frameCount = 4;

	const map = new THREE.TextureLoader().load('/elf_idle.png', (texture) => {
		texture.colorSpace = THREE.SRGBColorSpace;
		texture.minFilter = THREE.NearestFilter;
		texture.magFilter = THREE.NearestFilter;
		texture.wrapS = THREE.ClampToEdgeWrapping; // prevents texture bleeding
		texture.wrapT = THREE.ClampToEdgeWrapping; // prevents texture bleeding
		texture.repeat.set(1 / frameCount, currentFrame);
	});
	const spriteMaterial = new THREE.SpriteMaterial({ map: map, color: 0xffffff });

	let pressed = $state(new Set());
	let position = $state([0, 0, 0]);
	let t = $state(0);
	let box = $state(new THREE.Box3());
	let sprite = $state(new THREE.Sprite(spriteMaterial));

	sprite.scale.set(1, 1, 1);
	sprite.geometry.computeBoundingBox();

	function handleKeyup(event: KeyboardEvent) {
		pressed.delete(event.code);
	}

	function handleKeydown(event: KeyboardEvent) {
		pressed.add(event.code);
	}

	const { start, stop } = useTask((delta: number) => {
		t += delta;

		// event handling

		box.copy(sprite.geometry.boundingBox).applyMatrix4(sprite.matrixWorld);
		agent_box = box;
		check_collision();

		if (t > 1 / fps) {
			currentFrame = (currentFrame + 1) % 4;
			map.offset.x = currentFrame / frameCount;
			t = 0;
		}
	});

	if (is_first) {
		start();
	}
</script>

<svelte:window onkeydown={handleKeydown} onkeyup={handleKeyup} />

<T receiveShadow is={sprite} {position}></T>
