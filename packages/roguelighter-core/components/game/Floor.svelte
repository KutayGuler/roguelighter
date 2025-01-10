<script module>
  interface Props {
    box: THREE.Box3;
    settings: Settings;
    texture_url: string;
    position: [number, number, number];
    position_calculated: Function;
  }
</script>

<script lang="ts">
  import { T, useTask } from '@threlte/core';
  import * as THREE from 'three';
  import type { Settings, SpatialData } from '../../types/game';

  let {
    box = $bindable(),
    settings,
    texture_url,
    position: initial_position,
    position_calculated
  }: Props = $props();

  let spatial_data: SpatialData = $state({
    position: initial_position,
    rotation: [0, 0, 0]
  });

  let filter = $derived(settings?.filter || 'nearest');

  let map = new THREE.TextureLoader().load(texture_url, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = filter == 'nearest' ? THREE.NearestFilter : THREE.LinearFilter;
    texture.magFilter = filter == 'nearest' ? THREE.NearestFilter : THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping; // prevents texture bleeding
    texture.wrapT = THREE.ClampToEdgeWrapping; // prevents texture bleeding
  });

  let _box = $state(new THREE.Box3());
  let sprite = $state(new THREE.Sprite(new THREE.SpriteMaterial({ map: map, color: 0xffffff })));

  sprite.scale.set(1, 1, 1);
  sprite.geometry.computeBoundingBox();

  let t = $state(0);

  const { stop } = useTask(() => {
    t++;

    // @ts-expect-error
    _box.copy(sprite.geometry.boundingBox).applyMatrix4(sprite.matrixWorld);
    box = _box;

    // useTask needs to run at least one frame to
    // calculate the collision box position correctly
    if (t > 1) {
      position_calculated();
      stop();
    }
  });
</script>

<T is={sprite} position={spatial_data.position} rotation={spatial_data.rotation}></T>
