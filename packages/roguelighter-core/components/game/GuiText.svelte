<script lang="ts">
  import { run } from 'svelte/legacy';

  import { variables_regex } from '../../constants';
  interface Props {
    text: string;
    variables: any;
  }

  let { text, variables }: Props = $props();
  const matches = Array.from(text.matchAll(variables_regex));
  let modified_text = $state('');

  function update_text() {
    modified_text = text;
    for (let match of matches) {
      modified_text = modified_text.replace(match[0], variables[match[1]]);
    }
  }

  run(() => {
    variables, update_text();
  });
</script>

<span>{modified_text}</span>
