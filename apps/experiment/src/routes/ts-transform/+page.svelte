<script lang="ts">
	import ts from 'typescript';

	const code = `setup = {
	settings: {
		fps: 8,
		easing: "sineOut",
		duration: 400,
		camera: {
			zoom: 9
		}
	},
	collisions: [
		"floor_2"
	],
	agents: {
		player: {
			states: {
				idle: {
					frame_count: 1
				}
			}
		}
		
	},
	variables: {
		paused: false,
		x: 3,
		y: () => {
			return _.x * 2;
		},
	},
	handlers: {
		// bla: (x: number, y?: number) => {
		// console.log(x, y);
		// },
		window: {
			// "onclick": (e) => {

			// },
			onkeydown: (e) => {
				// if (e.code == "Escape") {
				//	_.paused = !_.paused
				// }
			}
		}
	},
	gui: {
		$if: {
			paused: {
				classes: {
					default:
						[
							"absolute",
							"bottom-0",
							"w-full",
							"h-full",
							"bg-black/50",
							"flex",
							"flex-col",
							"items-center",
							"gap-2",
							"pt-8"
						]
				},
				transition: {
					type: "fade"
				},
				children: {
					continue: {
						type: "button",
						classes: {
							default: [
								"bg-amber-200",
								"font-bold",
								"p-4",
								"hover:bg-purple-200",
								"text-amber-600",
								"w-1/2",
								"rounded"
							]
						},
						text: "Continue",
					},
					exit: {
						type: "button",
						classes: {
							default: [
								"bg-amber-200",
								"font-bold",
								"p-4",
								"hover:bg-purple-200",
								"text-amber-600",
								"w-1/2",
								"rounded"
							]
						},
						text: "{x} {y}",
						onclick: (e) => {
							console.log(e, _, $)
						}
					}
				}
			}
		}
	},
}`;

	const code2 = `
x = {
  onclick: function (e) {
    console.log(e, _, $);
  }
}
`;

	const sourceFile = ts.createSourceFile('code.ts', code, ts.ScriptTarget.Latest, true);

	const transformer = (context: ts.TransformationContext) => {
		const visit: ts.Visitor = (node) => {
			// Transform FunctionDeclaration nodes into VariableStatements with arrow functions

			if (ts.isFunctionExpression(node)) {
				return ts.factory.createStringLiteral(node.getText(sourceFile).trim());
			}

			// Recursively visit child nodes
			return ts.visitEachChild(node, visit, context);
		};

		return (node: ts.SourceFile) => ts.visitNode(node, visit);
	};

	const result = ts.transpileModule(code, {
		transformers: { after: [transformer] },
		compilerOptions: { removeComments: true }
	});
</script>

<pre>
	{result.outputText}
</pre>
