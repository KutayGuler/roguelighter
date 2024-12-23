<script module>
  interface Props {
    get_variable_value: (variable_name: string) => any;
    text: string;
  }
</script>

<script lang="ts">
  import { variables_regex } from '../../constants';

  let { text, get_variable_value }: Props = $props();
  const matches = Array.from(text.matchAll(variables_regex));

  let modified_text = $derived.by(() => {
    let modified = text;

    for (let match of matches) {
      modified = modified.replace(match[0], get_variable_value(match[1]));
    }

    return modified;
  });
</script>

<span>{modified_text}</span>
