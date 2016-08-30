
var outro = `
Object.defineProperty( exports, 'AudioContext', {
	get: function () {
		return exports.getAudioContext();
	}
});`;

function glsl () {
	return {
		transform ( code, id ) {
			if ( !/\.glsl$/.test( id ) ) return;

			return 'export default ' + JSON.stringify(
				code
					.replace( /[ \t]*\/\/.*\n/g, '' )
					.replace( /[ \t]*\/\*[\s\S]*?\*\//g, '' )
					.replace( /\n{2,}/g, '\n' )
			) + ';';
		}
	};
}

export default {
	entry: 'src/Three.js',
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
			dest: 'build/three.jsnext.js'
		}
	],
	outro: outro
};
