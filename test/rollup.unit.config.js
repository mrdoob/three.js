function glsl() {

	return {

		transform( code, id ) {

			if ( /\.glsl$/.test( id ) === false ) return;

			var transformedCode = 'export default ' + JSON.stringify(
				code
					.replace( /[ \t]*\/\/.*\n/g, '' )
					.replace( /[ \t]*\/\*[\s\S]*?\*\//g, '' )
					.replace( /\n{2,}/g, '\n' )
			) + ';';
			return {
				code: transformedCode,
				map: { mappings: '' }
			};

		}

	};

}

export default [
	// editor unit conf
	{
		entry: 'test/three.editor.unit.js',
		indent: '\t',
		plugins: [
			glsl()
		],
		// sourceMap: true,
		targets: [
			{
				format: 'umd',
				moduleName: 'THREE',
				dest: 'test/unit/three.editor.unit.js',
				intro: 'QUnit.module( "Editor", () => {',
				outro: '} );',
			}
		]
	},
	// example unit conf
	{
		entry: 'test/three.example.unit.js',
		indent: '\t',
		plugins: [
			glsl()
		],
		// sourceMap: true,
		targets: [
			{
				format: 'umd',
				moduleName: 'THREE',
				dest: 'test/unit/three.example.unit.js',
				intro: 'QUnit.module( "Example", () => {',
				outro: '} );',
			}
		]
	},
	// source unit conf
	{
		entry: 'test/three.source.unit.js',
		indent: '\t',
		plugins: [
			glsl()
		],
		// sourceMap: true,
		targets: [
			{
				format: 'umd',
				moduleName: 'THREE',
				dest: 'test/unit/three.source.unit.js',
				intro: 'QUnit.module( "Source", () => {',
				outro: '} );',
			}
		]
	},
];
