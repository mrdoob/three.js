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

export default {
	entry: 'test/Three.Unit.js',
	indent: '\t',
	plugins: [
		glsl()
	],
	// sourceMap: true,
	targets: [
		{
			format: 'umd',
			moduleName: 'THREE',
			dest: 'test/unit/three.unit.js'
		}
	]
};
