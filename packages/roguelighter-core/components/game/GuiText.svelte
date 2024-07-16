<script lang="ts">
  import { variables_regex } from '../../constants';
  export let text: string;
  export let variables: any;
  const matches = Array.from(text.matchAll(variables_regex));
  let modified_text = '';

  function update_text() {
    modified_text = text;
    for (let match of matches) {
      modified_text = modified_text.replace(match[0], variables[match[1]]);
    }
  }

  $: variables, update_text();
</script>

<span>{modified_text}</span>
