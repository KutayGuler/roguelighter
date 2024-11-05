export function store(initial: any) {
  let value = $state(initial);

  return {
    get value() {
      return value;
    },
    set value(v) {
      value = v;
    }
  };
}

export const document_path = store('');
