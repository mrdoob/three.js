/**
 * Generated from 'examples\modules\postprocessing\HalftonePass.js'
 **/

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('../../../build/three.module.js'), require('./Pass.js'), require('../shaders/HalftoneShader.js')) :
	typeof define === 'function' && define.amd ? define(['exports', '../../../build/three.module.js', './Pass.js', '../shaders/HalftoneShader.js'], factory) :
	(factory((global.THREE = global.THREE || {}),global.THREE,global.THREE,global.THREE));
}(this, (function (exports,THREE,Pass_js,HalftoneShader_js) { 'use strict';

/**
 * @author meatbags / xavierburrow.com, github/meatbags
 *
 * RGB Halftone pass for three.js effects composer. Requires HalftoneShader.
 *
 */


exports.HalftonePass = function ( width, height, params ) {

	Pass_js.Pass.call( this );

 	if ( HalftoneShader_js.HalftoneShader === undefined ) {

 		console.error( '__HalftonePass requires HalftoneShader' );

 	}

 	this.uniforms = THREE.UniformsUtils.clone( HalftoneShader_js.HalftoneShader.uniforms );
 	this.material = new THREE.ShaderMaterial( {
 		uniforms: this.uniforms,
 		fragmentShader: HalftoneShader_js.HalftoneShader.fragmentShader,
 		vertexShader: HalftoneShader_js.HalftoneShader.vertexShader
 	} );

	// set params
	this.uniforms.width.value = width;
	this.uniforms.height.value = height;

	for ( var key in params ) {

		if ( params.hasOwnProperty( key ) && this.uniforms.hasOwnProperty( key ) ) {

			this.uniforms[key].value = params[key];

		}

	}

 	this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
 	this.scene = new THREE.Scene();
 	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
 	this.quad.frustumCulled = false;
 	this.scene.add( this.quad );

 };

 exports.HalftonePass.prototype = Object.assign( Object.create( Pass_js.Pass.prototype ), {

	constructor: exports.HalftonePass,

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

 		this.material.uniforms[ "tDiffuse" ].value = readBuffer.texture;
 		this.quad.material = this.material;

 		if ( this.renderToScreen ) {

 			renderer.render( this.scene, this.camera );

		} else {

			renderer.render( this.scene, this.camera, writeBuffer, this.clear );

		}

 	},

 	setSize: function ( width, height ) {

 		this.uniforms.width.value = width;
 		this.uniforms.height.value = height;

 	}
} );

Object.defineProperty(exports, '__esModule', { value: true });

})));
