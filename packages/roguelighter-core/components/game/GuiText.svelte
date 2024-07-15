<script lang="ts">
  export let text: string;
  export let variables;
  console.log(variables);
  const regex = /\$variables\(([^)]+)\)/g;
  const variable_name = text.replace(regex, '$1');
  $: modified_text = text.replace(`$variables(${variable_name})`, variables[variable_name]);
  console.log(text, modified_text);
</script>

<span>{modified_text}</span>
