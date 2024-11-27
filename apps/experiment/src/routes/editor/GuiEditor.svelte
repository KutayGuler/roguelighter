<script lang="ts">
	import * as monaco from 'monaco-editor';
	import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
	import { editorBackground } from 'monaco-editor/esm/vs/platform/theme/common/colorRegistry';
	import { onMount } from 'svelte';

	let editorElement: HTMLDivElement | undefined = $state();
	let editor: monaco.editor.IStandaloneCodeEditor;
	let model: monaco.editor.ITextModel;

	function load_code(code: string) {
		model = monaco.editor.createModel(code, 'html');
		monaco.editor.defineTheme('default', {
			base: 'vs-dark',
			inherit: true,
			rules: [
				{
					token: 'globals',
					foreground: 'fda4af'
				},
				{
					token: 'vardec',
					foreground: '10b981'
				},
				{
					token: 'kwClass',
					foreground: 'c084fc'
				},
				{
					token: 'kwProps',
					foreground: 'bae6fd'
				},
				{
					token: 'identifier',
					foreground: 'bae6fd'
				},
				{ token: 'constant', foreground: '2E1065' },
				{ token: 'type', foreground: '38bdf8' },
				{ token: 'keyword', foreground: '60a5fa' },
				{ token: 'comment', foreground: '608B4E' },
				{ token: 'number', foreground: 'a3e635' },
				{ token: 'string', foreground: 'fde68a' }
			],
			colors: {
				[editorBackground]: '#18181b'
			}
		});
		monaco.editor.setTheme('default');
		editor.setModel(model);
		model.setValue(code);
	}

	onMount(async () => {
		// monaco.languages.html.htmlDefaults;

		// compiler options
		// monaco.languages.html.htmlDefaults.setCompilerOptions({
		// 	target: monaco.languages.html.ScriptTarget.Latest,
		// 	allowNonTsExtensions: true
		// });

		monaco.editor.createModel('', 'html');

		editor = monaco.editor.create(editorElement as HTMLDivElement, {
			automaticLayout: true,
			theme: 'vs-dark',
			tabSize: 2,
			autoIndent: 'full',
			formatOnPaste: true,
			formatOnType: true
		});

		load_code('');
	});
</script>

<div class="h-screen w-full" bind:this={editorElement}></div>
