import * as fs from 'fs';
import string from 'rollup-plugin-string';

var outro = `
Object.defineProperty( exports, 'AudioContext', {
	get: function () {
		return exports.getAudioContext();
	}
});`;

var footer = fs.readFileSync( 'src/Three.Legacy.js', 'utf-8' );

export default {
	entry: 'src/Three.js',
	dest: 'build/three.js',
	moduleName: 'THREE',
	format: 'umd',
	plugins: [
		string({
			include: '**/*.glsl'
		})
	],

	outro: outro,
	footer: footer
};
