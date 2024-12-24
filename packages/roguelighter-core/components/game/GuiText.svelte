<script module>
  interface Props {
    index: number;
    get_variable_value: (variable_name: string) => any;
    text: string;
  }
</script>

<script lang="ts">
  import { variables_regex } from '../../constants';

  let { index, text, get_variable_value }: Props = $props();
  const matches = Array.from(text.matchAll(variables_regex));

  let modified_text = $derived.by(() => {
    let modified = text;

    for (let match of matches) {
      let variable_name = match[1];
      modified = modified.replace(
        match[0],
        variable_name === '$index' ? index : get_variable_value(variable_name)
      );
    }

    return modified;
  });
</script>

<span>{modified_text}</span>
