<script module>
  type Frame = {
    frame: { x: number; y: number; w: number; h: number };
    spriteSourceSize: { x: number; y: number; w: number; h: number };
    sourceSize: { w: number; h: number };
    duration?: number;
  };

  type FrameTag = {
    name: string;
    from: number;
    to: number;
    direction: string;
  };

  type SpriteJsonHashData = {
    frames: Record<string, Frame>;
    meta: {
      app: string;
      image: string;
      version: string;
      format: string;
      size: { w: number; h: number };
      scale: number;
      frameTags: FrameTag[];
    };
  };

  type AnimatedSpriteProps = Props<Material> & {
    /** The URL of the spritesheet texture image. */
    textureUrl: string;

    /** The URL of the spritesheet JSON. */
    dataUrl?: string;

    /** The current playing animation name. */
    animation?: string;

    /**
     * Whether or not the current animation should loop.
     *
     * @default true
     */
    loop?: boolean;

    /**
     * Controls whether or not to automatically run an animation on load.
     *
     * @default true
     */
    autoplay?: boolean;

    /**
     * The desired frames per second of the animation
     *
     * This will override any frame durations specified in JSON
     */
    fps?: number;

    /**
     * The texture filtering applied to the spritesheet.
     *
     * @default 'nearest'
     */
    filter?: 'nearest' | 'linear';

    /**
     * Sets the alpha value to be used when running an alpha test.
     *
     * @see https://threejs.org/docs/#api/en/materials/Material.alphaTest
     *
     * @default 0.1
     */
    alphaTest?: number;

    /**
     * Delay the start of the animation in ms.
     *
     * @default 0
     */
    delay?: number;

    /**
     * Whether or not the material should be transparent.
     *
     * @default true
     */
    transparent?: boolean;

    /**
     * Whether or not the Sprite should flip sides on the x-axis.
     *
     * @default false
     */
    flipX?: boolean;

    /**
     * The start frame of the current animation.
     *
     * @default 0
     */
    startFrame?: number;

    /**
     * The end frame of the current animation.
     *
     * @default rows * columns - 1
     */
    endFrame?: number;

    /**
     * The total number of frames in the spritesheet.
     */
    totalFrames?: number;

    /**
     * The number of rows in the spritesheet.
     *
     * @default 1
     */
    rows?: number;

    /**
     * The number of columns in the spritesheet.
     *
     * @default 1
     */
    columns?: number;

    /** Fires when all resources have loaded. */
    onload?: () => void;

    /** Fires when an animation starts. */
    onstart?: () => void;

    /** Fires when an animation ends. */
    onend?: () => void;

    /** Fires when an animation loop completes. */
    onloop?: () => void;
  };
</script>

<script lang="ts">
  import type { Props } from '@threlte/core';
  import { ClampToEdgeWrapping, Material } from 'three';
  import {
    asyncWritable,
    type AsyncWritable,
    isInstanceOf,
    T,
    useLoader,
    useParent,
    useTask,
    watch
  } from '@threlte/core';
  import {
    DoubleSide,
    FileLoader,
    LinearFilter,
    MeshBasicMaterial,
    NearestFilter,
    RepeatWrapping,
    RGBADepthPacking,
    SpriteMaterial,
    type Texture
  } from 'three';
  import { useTexture } from '@threlte/extras';
  import { useSuspense } from '@threlte/extras';
  import type { AnimatedSpriteProps, Frame, FrameTag, SpriteJsonHashData } from './types';

  let {
    textureUrl,
    dataUrl = '',
    animation = '',
    loop = true,
    autoplay = true,
    fps = 10,
    filter = 'nearest',
    alphaTest = 0.1,
    delay = 0,
    transparent = true,
    flipX = false,
    startFrame = 0,
    endFrame = undefined,
    rows = 1,
    columns = undefined,
    totalFrames = 0,
    is = $bindable(),
    ref = $bindable(),

    onload,
    onstart,
    onend,
    onloop,

    ...props
  }: AnimatedSpriteProps = $props();

  const parent = useParent();

  const supportedDirections = ['forward', 'reverse'] as const;
  const isSupportedDirection = (
    value: string | undefined
  ): value is (typeof supportedDirections)[number] => {
    const isSupported = supportedDirections.includes(value as (typeof supportedDirections)[number]);
    if (!isSupported) {
      console.warn(`Unsupported sprite animation direction "${value}"`);
    }
    return isSupported;
  };

  let timerOffset = 0;
  let currentFrame = startFrame;
  let numFrames = 0;
  let flipOffset = flipX ? -1 : 1;
  let frameWidth = 0;
  let frameHeight = 0;
  let texture: Texture | undefined = $state();
  let json: SpriteJsonHashData | undefined;
  let frameNames: string[] = [];
  let direction: (typeof supportedDirections)[number] = 'forward';
  let frameTag: FrameTag | undefined;
  let spritesheetSize = { w: 0, h: 0 };

  let fpsInterval = 0;
  let isMesh = $state(false);

  $effect.pre(() => {
    isMesh = $parent !== undefined && isInstanceOf($parent, 'Mesh');
  });
  $effect.pre(() => {
    fpsInterval = 1000 / fps;
  });

  is ??= isMesh ? new MeshBasicMaterial() : new SpriteMaterial();

  const suspend = useSuspense();

  const textureStore = suspend(
    useTexture(textureUrl, {
      transform: (value: Texture) => {
        value.matrixAutoUpdate = false;
        value.generateMipmaps = false;
        value.premultiplyAlpha = false;
        value.wrapS = value.wrapT = RepeatWrapping;
        value.magFilter = value.minFilter = filter === 'nearest' ? NearestFilter : LinearFilter;
        console.log(value);
        return value;
      }
    })
  );

  const jsonStore: AsyncWritable<SpriteJsonHashData | undefined> = suspend(
    dataUrl
      ? useLoader(FileLoader).load(dataUrl, {
          transform: (file) => {
            if (typeof file !== 'string') return;
            try {
              return JSON.parse(file);
            } catch {
              return;
            }
          }
        })
      : asyncWritable<SpriteJsonHashData>(
          new Promise((resolve) => {
            const unsub = textureStore.subscribe((value) => {
              if (!value) return;
              unsub();
              resolve(createData(value));
            });
          })
        )
  );

  /**
   * Creates metadata if no JSON file is supplied.
   */
  const createData = (texture: Texture) => {
    const { width, height } = texture.image;
    const cols = columns ?? totalFrames;

    numFrames = totalFrames;

    const frameWidth = width / cols;
    const frameHeight = height / rows;
    const data: SpriteJsonHashData = {
      frames: {},
      meta: {
        app: '',
        image: '',
        format: '',
        frameTags: [],
        version: '1.0',
        size: { w: width, h: height },
        scale: 1
      }
    };

    for (let i = 0; i < numFrames; i += 1) {
      // Calculate the row and column for the current frame
      const row = Math.floor(i / cols);
      const col = i % cols;

      // Calculate the x, y coordinates of the frame within the sprite sheet
      const x = col * frameWidth;
      const y = row * frameHeight;

      data.frames[`${i}`] = {
        frame: { x, y, w: frameWidth, h: frameHeight },
        spriteSourceSize: { x: 0, y: 0, w: frameWidth, h: frameHeight },
        sourceSize: { w: frameWidth, h: frameHeight }
      };
    }

    return data;
  };

  const setFrame = (frame: Frame['frame']) => {
    const horizontalFrames = spritesheetSize.w / frameWidth;
    const verticalFrames = spritesheetSize.h / frameHeight;
    const frameOffsetX = 1 / horizontalFrames;
    const frameOffsetY = 1 / verticalFrames;

    const x =
      flipOffset > 0
        ? frameOffsetX * (frame.x / frameWidth)
        : frameOffsetX * (frame.x / frameHeight) - texture!.repeat.x;
    const y = Math.abs(1 - frameOffsetY) - frameOffsetY * (frame.y / frameHeight);

    texture?.offset.set(x, y);
    texture?.updateMatrix();
  };

  const setAnimation = (name: string) => {
    if (!json) return;

    frameTag = json?.meta.frameTags.find((tag) => tag.name === name);
    direction = isSupportedDirection(frameTag?.direction) ? frameTag.direction : 'forward';

    currentFrame =
      direction === 'forward' ? (frameTag?.from ?? 0) : (frameTag?.to ?? numFrames - 1);

    setFrame(json.frames[frameNames[currentFrame]].frame);

    onstart?.();
  };

  let playQueued = false;

  /**
   * Plays the animation.
   */
  export const play = async () => {
    playQueued = true;
    await Promise.all([textureStore, jsonStore]);
    if (!playQueued) return;
    timerOffset = performance.now() - delay;
    start();
  };

  /**
   * Pauses the animation.
   */
  export const pause = () => {
    playQueued = false;
    stop();
  };

  const { start, stop } = useTask(
    () => {
      if (!json) return;
      const now = performance.now();
      const diff = now - timerOffset;

      const name = frameNames[currentFrame];
      if (!json.frames[name]) return;
      const { frame, duration } = json.frames[name];
      const interval = duration ?? fpsInterval;

      if (diff <= interval) return;
      timerOffset = now - (diff % interval);

      // start and end are the first and last frames of the animation respectively
      const start =
        direction === 'forward'
          ? (frameTag?.from ?? startFrame ?? 0)
          : (frameTag?.to ?? endFrame ?? numFrames - 1);
      const end =
        direction === 'forward'
          ? (frameTag?.to ?? endFrame ?? numFrames - 1)
          : (frameTag?.from ?? startFrame ?? 0);

      setFrame(frame);

      switch (direction) {
        case 'forward':
          currentFrame += 1;
          break;
        case 'reverse':
          currentFrame -= 1;
          break;
        default:
          break;
      }

      if (
        (direction === 'forward' && currentFrame > end) ||
        (direction === 'reverse' && currentFrame < end)
      ) {
        currentFrame = start;

        if (loop) {
          onloop?.();
        } else {
          pause();
          onend?.();
        }
      }
    },
    { autoStart: false }
  );

  watch([textureStore, jsonStore], ([nextTexture, nextJson]) => {
    if (nextTexture === undefined || nextJson === undefined) return;

    texture = nextTexture.clone();
    json = nextJson;
    frameNames = Object.keys(json.frames);
    numFrames = frameNames.length;
    spritesheetSize = json.meta.size;

    const { sourceSize } = Object.values(json.frames)[0];
    frameWidth = sourceSize.w;
    frameHeight = sourceSize.h;

    texture.repeat.set(
      (1 * flipOffset) / (spritesheetSize.w / frameWidth),
      1 / (spritesheetSize.h / frameHeight)
    );

    setAnimation(animation);

    onload?.();

    if (autoplay) {
      play();
    }
  });

  $effect.pre(() => {
    setAnimation(animation);
    if (autoplay) {
      play();
    }
  });
</script>

{#if texture && isMesh}
  <T
    {is}
    bind:ref
    map={texture}
    toneMapped={false}
    side={DoubleSide}
    shadowSide={DoubleSide}
    {transparent}
    {alphaTest}
    {...props}
  />
  <T.MeshDepthMaterial
    attach="customDepthMaterial"
    depthPacking={RGBADepthPacking}
    map={texture}
    {alphaTest}
  />
{:else if texture}
  <T {is} bind:ref map={texture} toneMapped={false} {transparent} {alphaTest} {...props} />
{/if}
