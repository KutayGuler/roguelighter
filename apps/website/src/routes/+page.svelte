<script lang="ts">
  const features = [
    ['Single file', 'All your game data in a single file.'],
    ['Low code', 'Write minimal code to create roguelike games.'],
    ['Typesafe', 'Autocomplete your way through.']
  ];
</script>

<main class="flex flex-col items-center w-full h-full overflow-y-auto">
  <div class="flex flex-col gap-16 max-w-6xl">
    <div class="flex flex-row relative pb-20 pt-12 overflow-visible">
      <div class="z-10">
        <h1>
          The game engine <br /> for roguelikes.
        </h1>
        <p class="text-xl pt-4">
          Roguelighter is a free, open-source, low-code game engine <br /> specifically designed for
          developing roguelike games.
        </p>
        <div class="w-full flex flex-row gap-4 pt-16">
          <a href="/tutorial" class="btn-success-ghost px-8 py-4">Play with interactive tutorial</a>
          <button class="btn-primary !px-8">Download latest version</button>
        </div>
      </div>
      <img
        src="/witch3.png"
        alt=""
        class="absolute bottom-16 right-16 w-1/3 brightness-50 scale-125"
      />
    </div>
    <div class="flex flex-row gap-8 z-10">
      {#each features as [title, description]}
        <div class="w-1/3 flex flex-col rounded">
          <div class="w-full bg-[#0a0012] h-40 rounded-t"></div>
          <div class="bg-[#1f0037] p-4 flex-grow rounded-b">
            <h4 class="h4">{title}</h4>
            <p class="text-base-400">{description}</p>
          </div>
        </div>
      {/each}
    </div>
    <!-- <footer class="w-full p-4 bg-base-900">
      <div>© 2023 Kutay Güler</div>
      <div>Website source code on github</div>
    </footer> -->
  </div>
</main>
