import * as chokidar from 'chokidar';
import fs from 'node:fs';

const types_dir = './packages/roguelighter-core/types/game.ts';
const generator_function_dir = './packages/roguelighter-core/generate_boilerplate_types.ts';
let writing = false;

// One-liner for current directory
chokidar.watch(types_dir).on('change', (event, path) => {
  if (writing) return;
  try {
    writing = true;
    let t = fs.readFileSync(types_dir, 'utf8');
    console.log(t);

    // FIXME: fs.readFileSync returns empty

    t = t.replaceAll('export', 'declare');
    t = t.replaceAll('`', '\\`');
    t = t.replaceAll('${', '\\${');
    // console.log(t);

    const function_data = fs.readFileSync(generator_function_dir, 'utf8');
    let output = function_data.replace(
      /\/\/\s*@start[\s\S]*?\/\/\s*@end/,
      '// @start\nconst static_types = `$rep`\n// @end'
    );
    // console.log('OUTPUT 1');
    // console.log(output);
    output = output.replace('$rep', t);
    // console.log('OUTPUT 2');
    // console.log(output);

    fs.writeFileSync(generator_function_dir, output, 'utf8');
    writing = false;
  } catch (err) {
    writing = false;
    console.error(err);
  }
});
