import * as TypeDoc from 'typedoc';

async function main() {
  // Application.bootstrap also exists, which will not load plugins
  // Also accepts an array of option readers if you want to disable
  // TypeDoc's tsconfig.json/package.json/typedoc.json option readers
  const app = await TypeDoc.Application.bootstrapWithPlugins({
    entryPoints: ['src/lib/index.ts']
  });

  const project = await app.convert();

  if (project) {
    // Project may not have converted correctly
    const outputDir = 'src/routes/(website)/docs';

    // Alternatively generate JSON output
    await app.generateJson(project, outputDir + '/documentation.json');
  }
}

main().catch(console.error);
