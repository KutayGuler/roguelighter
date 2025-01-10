function generate_mapper() {
  const tutorials = import.meta.glob('/src/tutorials/*/*.md');

  let mapper: Record<string, string> = {};

  for (let key of Object.keys(tutorials)) {
    let indexedKey = key
      .replace('/src/tutorials/', '')
      .replace('/index.md', '');
    let unindexedKey = indexedKey.slice(3);
    mapper[unindexedKey] = indexedKey;
  }

  return mapper;
}

export const mapper = generate_mapper();
