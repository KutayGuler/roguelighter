<script lang="ts">
	import * as ts from 'typescript';

	function createParameterAppendTransformer() {
		return (context: ts.TransformationContext) => {
			// Helper function to create the additional parameters
			const createAdditionalParameters = () => {
				return [
					ts.factory.createIdentifier('_'),
					ts.factory.createIdentifier('$'),
					ts.factory.createIdentifier('PROCESS')
				];
			};

			const visit: ts.Visitor = (node: ts.Node): ts.Node => {
				// First, recursively transform any child nodes
				// This ensures we transform nested calls from the inside out
				node = ts.visitEachChild(node, visit, context);

				// Then check if the current node is a call expression
				if (ts.isCallExpression(node)) {
					// Get the called expression (e.g., $.toggle_pause)
					const callee = node.expression;

					// Check if it's a property access expression (e.g., $.something)
					if (ts.isPropertyAccessExpression(callee)) {
						// Get the object being accessed (e.g., $ in $.toggle_pause)
						const object = callee.expression;

						// Check if the object is $ (using identifier check)
						if (ts.isIdentifier(object) && object.text === '$') {
							// Get existing arguments - they might already contain transformed nested calls
							const existingArgs = Array.from(node.arguments);

							// Create new argument list combining existing and additional parameters
							const newArgs = ts.factory.createNodeArray([
								...existingArgs,
								...createAdditionalParameters()
							]);

							// Create a new call expression with the updated arguments
							return ts.factory.createCallExpression(callee, node.typeArguments, newArgs);
						}
					}
				}

				return node;
			};

			return (node: ts.Node) => ts.visitNode(node, visit);
		};
	}

	// Helper function to apply the transformer to source code
	function transformCode(sourceCode: string): string {
		// Create a source file
		const sourceFile = ts.createSourceFile('temp.ts', sourceCode, ts.ScriptTarget.Latest, true);

		// Create and apply the transformer
		const result = ts.transform(sourceFile, [createParameterAppendTransformer()]);
		const transformedSourceFile = result.transformed[0];

		// Print the transformed code
		const printer = ts.createPrinter({
			newLine: ts.NewLineKind.LineFeed,
			removeComments: false,
			omitTrailingSemicolon: false
		});

		const transformedCode = printer.printNode(
			ts.EmitHint.Unspecified,
			transformedSourceFile,
			sourceFile
		);

		result.dispose();
		return transformedCode;
	}

	// Example usage demonstrating nested calls
	const sourceCode = `
// Simple case with no parameters
$.toggle_pause();

// Case with one parameter
$.toggle_pause(x);

// Case with multiple parameters
$.toggle_pause(x, y);

// Case with non-$ object (should not be transformed)
otherObject.toggle_pause();

// Complex case with nested calls
$.outer($.inner(), x);

// Even more complex nested calls
$.a($.b($.c()));

// Mixed nested calls
$.x(y, $.y(z), $.z());
`;

	console.log(transformCode(sourceCode));
</script>
