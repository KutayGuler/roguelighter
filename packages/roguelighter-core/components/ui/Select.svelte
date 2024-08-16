<script lang="ts">
  import clsx from 'clsx';
  export let value: any;
  let multiple = false;
  let classes = clsx([
    // Basic layout
    'relative block w-full appearance-none rounded-lg py-[calc(theme(spacing[2.5])-1px)] sm:py-[calc(theme(spacing[1.5])-1px)]',
    // Horizontal padding
    multiple
      ? 'px-[calc(theme(spacing[3.5])-1px)] sm:px-[calc(theme(spacing.3)-1px)]'
      : 'pl-[calc(theme(spacing[3.5])-1px)] pr-[calc(theme(spacing.10)-1px)] sm:pl-[calc(theme(spacing.3)-1px)] sm:pr-[calc(theme(spacing.9)-1px)]',
    // Options (multi-select)
    '[&_optgroup]:font-semibold',
    // Typography
    'text-base/6 text-zinc-950 placeholder:text-zinc-500 sm:text-sm/6 dark:text-white dark:*:text-white',
    // Border
    'border border-zinc-950/10 hover:border-zinc-950/20 dark:border-white/10 dark:hover:border-white/20',
    // Background color
    'bg-transparent dark:bg-white/5 dark:*:bg-zinc-800',
    // Hide default focus styles
    'focus:outline-none',
    // Invalid state
    'invalid:border-red-500 invalid:hover:border-red-500 invalid:dark:border-red-600 invalid:hover:dark:border-red-600',
    // Disabled state
    'disabled:border-zinc-950/20 disabled:opacity-100 dark:hover:disabled:border-white/15 disabled:dark:border-white/15 disabled:dark:bg-white/[2.5%]'
  ]);
</script>

<select class={classes} bind:value>
  <slot></slot>
  <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
    <svg
      class="size-5 stroke-zinc-500 group-has-[[data-disabled]]:stroke-zinc-600 sm:size-4 dark:stroke-zinc-400 forced-colors:stroke-[CanvasText]"
      viewBox="0 0 16 16"
      aria-hidden="true"
      fill="none"
    >
      <path
        d="M5.75 10.75L8 13L10.25 10.75"
        stroke-width={1.5}
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M10.25 5.25L8 3L5.75 5.25"
        stroke-width={1.5}
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </span>
</select>
