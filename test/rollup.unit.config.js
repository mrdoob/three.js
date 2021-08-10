try {

	require( 'qunit' );

} catch {

	console.log( '\x1b[31mError! You not installed dependencies. Please run `npm i --prefix test`\x1b[37m' );
	process.exit( 1 );

}


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
	// example unit conf
	{
		input: 'unit/three.example.unit.js',
		plugins: [
			glsl()
		],
		// sourceMap: true,
		output: [
			{
				format: 'umd',
				name: 'THREE',
				file: 'unit/build/three.example.unit.js',
				intro: 'QUnit.module( "Example", () => {',
				outro: '} );',
				indent: '\t',
			}
		]
	},
	// source unit conf
	{
		input: 'unit/three.source.unit.js',
		plugins: [
			glsl()
		],
		// sourceMap: true,
		output: [
			{
				format: 'umd',
				name: 'THREE',
				file: 'unit/build/three.source.unit.js',
				intro: 'QUnit.module( "Source", () => {',
				outro: '} );',
				indent: '\t',
			}
		]
	},
];
