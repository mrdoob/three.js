/**
 * Generated from 'examples\modules\shaders\GammaCorrectionShader.js'
 **/

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.THREE = global.THREE || {})));
}(this, (function (exports) { 'use strict';

/**
 * @author WestLangley / http://github.com/WestLangley
 *
 * Gamma Correction Shader
 * http://en.wikipedia.org/wiki/gamma_correction
 */


exports.GammaCorrectionShader = {

	uniforms: {

		"tDiffuse": { value: null }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 tex = texture2D( tDiffuse, vec2( vUv.x, vUv.y ) );",

			"gl_FragColor = LinearToGamma( tex, float( GAMMA_FACTOR ) );",

		"}"

	].join( "\n" )

};

Object.defineProperty(exports, '__esModule', { value: true });

})));
