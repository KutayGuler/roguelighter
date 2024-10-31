<script module>
  interface Props {
    text: string;
    variables: any;
  }
</script>

<script lang="ts">
  import { variables_regex } from '../../constants';

  let { text, variables = $bindable() }: Props = $props();
  const matches = Array.from(text.matchAll(variables_regex));

  let modified_text = $derived.by(() => {
    let modified = text;
    
    for (let match of matches) {
      modified = modified.replace(match[0], variables[match[1]]);
    }

    return modified;
  })
</script>

<span>{modified_text}</span>
