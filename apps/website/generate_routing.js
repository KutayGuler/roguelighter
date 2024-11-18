import * as fs from 'fs';

const tutorial_path = './src/tutorials';
const tutorials = fs.readdirSync(tutorial_path, () => {});

for (let i = 0; i < tutorials.length; i++) {
  const tutorial = tutorials[i];
  const json_path = `${tutorial_path}/${tutorial}/index.json`;
  const content = fs.readFileSync(json_path, { encoding: 'utf-8' });

  let obj = JSON.parse(content);
  delete obj.prev;
  delete obj.next;

  const prev = (tutorials[i - 1] || '...').slice(3);
  const next = (tutorials[i + 1] || '...').slice(3);

  if (i == 0) {
    obj.next = next;
  } else if (i == tutorials.length) {
    obj.prev = prev;
  } else {
    obj.prev = prev;
    obj.next = next;
  }

  fs.writeFileSync(json_path, JSON.stringify(obj, null, 2));
}
