import * as fs from 'fs';

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

	outro: outro,
	footer: footer
};
