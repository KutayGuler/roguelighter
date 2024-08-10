import * as chokidar from 'chokidar';
import { readFile, writeFile } from 'node:fs/promises';

const types_dir = './packages/roguelighter-core/types/game.ts';
const generator_function_dir = './packages/roguelighter-core/generate_boilerplate_types.ts';
let writing = false;

console.log('Listening for changes on ' + types_dir);

// FIXME: fs.readFileSync returns empty (probably formatter gets in the way)
chokidar.watch(types_dir).on('change', async (event, path) => {
  if (writing) return;
  try {
    writing = true;
    let t = await readFile(types_dir, 'utf8');

    t = t.replaceAll('export', 'declare');
    t = t.replaceAll('`', '\\`');
    t = t.replaceAll('${', '\\${');

    const function_data = await readFile(generator_function_dir, 'utf8');
    let output = function_data.replace(
      /\/\/\s*@start[\s\S]*?\/\/\s*@end/,
      '// @start\nconst static_types = `$rep`\n// @end'
    );
    output = output.replace('$rep', t);
    await writeFile(generator_function_dir, output, 'utf8');
    writing = false;
  } catch (err) {
    writing = false;
    console.error(err);
  }
});
