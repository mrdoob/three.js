import * as fs from 'fs';

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
	dest: 'build/three.js',
	moduleName: 'THREE',
	format: 'umd',
	plugins: [
		glsl()
	],
	outro: outro
};
