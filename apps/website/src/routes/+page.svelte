<script lang="ts">
  const features = [
    ['Single file', 'All your game data in a single file.'],
    ['Low code', 'Write minimal code to create roguelike games.'],
    ['Typesafe', 'Autocomplete your way through.']
  ];
</script>

<main class="flex flex-col items-center justify-center w-full h-full overflow-y-auto">
  <div class="flex flex-col gap-16 max-w-6xl w-full pb-20">
    <div class="flex flex-row relative">
      <div class="z-10">
        <h1>The sveltest game <br /> engine for everyone</h1>
        <p class="text-lg pt-4 text-base-400">
          Roguelighter is a free, open-source, low-code game engine <br /> for 2D game development.
        </p>
        <div class="w-full flex flex-row gap-4 pt-16">
          <a
            href="/examples"
            class="py-4 px-8 text-sm border border-primary-900 rounded-lg hover:bg-emerald-800/20"
            >Check out the examples</a
          >
          <button class="btn-primary !px-8">Download the latest version</button>
        </div>
      </div>
      <img
        src="/witch3.png"
        alt=""
        class="absolute -bottom-12 right-36 w-1/3 brightness-50 scale-125"
      />
    </div>
    <!-- <div class="flex flex-row gap-8 z-10">
      {#each features as [title, description]}
        <div class="w-1/3 flex flex-col rounded">
          <div class="w-full bg-[#0a0012] h-40 rounded-t"></div>
          <div class="bg-[#1f0037] p-4 flex-grow rounded-b">
            <h4 class="h4">{title}</h4>
            <p class="text-base-400">{description}</p>
          </div>
        </div>
      {/each}
    </div> -->
  </div>
</main>
