function glsl () {
	return {
		transform ( code, id ) {
			if ( !/\.glsl$/.test( id ) ) return;

			var transformedCode = 'export default ' + JSON.stringify(
				code
					.replace( /[ \t]*\/\/.*\n/g, '' )
					.replace( /[ \t]*\/\*[\s\S]*?\*\//g, '' )
					.replace( /\n{2,}/g, '\n' )
			) + ';';
			return {
				code: transformedCode,
				map: { mappings: '' }
			}
		}
	};
}

export default {
	entry: 'src/Three.js',
	indent: '\t',
	plugins: [
		glsl()
	],
	targets: [
		{
			format: 'umd',
			moduleName: 'THREE',
			dest: 'build/three.js'
		},
		{
			format: 'es',
			dest: 'build/three.module.js'
		}
	]
};
