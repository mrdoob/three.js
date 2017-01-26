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

	entry: (function () {

		var env = process.env.BUILD;

		if( env === 'production' ) {

			return 'src/Three.js';

		} else if( env === 'test' ){

			return 'test/Three.Unit.js';

		} else {

			console.error("Invalid BUILD environment variable: " + env);
			return null;

		}

	})(),
	indent: '\t',
	plugins: [
		glsl()
	],
	// sourceMap: true,
	targets: (function () {

		var env = process.env.BUILD;

		if( env === 'production' ) {

			return [
				{
					format: 'umd',
					moduleName: 'THREE',
					dest: 'build/three.js'
				},
				{
					format: 'es',
					dest: 'build/three.module.js'
				}
			];

		} else if( env === 'test' ){

			return [
				{
					format: 'umd',
					moduleName: 'THREE',
					dest: 'test/unit/three.unit.js'
				}
			];

		} else {

			console.error("Invalid BUILD environment variable: " + env);
			return null;

		}

	})()
};
