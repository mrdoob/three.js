/**
 * Generated from 'examples\modules\postprocessing\TexturePass.js'
 **/

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('../../../build/three.module.js'), require('./Pass.js'), require('../shaders/CopyShader.js')) :
	typeof define === 'function' && define.amd ? define(['exports', '../../../build/three.module.js', './Pass.js', '../shaders/CopyShader.js'], factory) :
	(factory((global.THREE = global.THREE || {}),global.THREE,global.THREE,global.THREE));
}(this, (function (exports,THREE,Pass_js,CopyShader_js) { 'use strict';

/**
 * @author alteredq / http://alteredqualia.com/
 */


exports.TexturePass = function ( map, opacity ) {

	Pass_js.Pass.call( this );

	if ( CopyShader_js.CopyShader === undefined )
		console.error( "__TexturePass relies on CopyShader" );

	var shader = CopyShader_js.CopyShader;

	this.map = map;
	this.opacity = ( opacity !== undefined ) ? opacity : 1.0;

	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	this.material = new THREE.ShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader,
		depthTest: false,
		depthWrite: false

	} );

	this.needsSwap = false;

	this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	this.scene  = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.quad.frustumCulled = false; // Avoid getting clipped
	this.scene.add( this.quad );

};

exports.TexturePass.prototype = Object.assign( Object.create( Pass_js.Pass.prototype ), {

	constructor: exports.TexturePass,

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		var oldAutoClear = renderer.autoClear;
		renderer.autoClear = false;

		this.quad.material = this.material;

		this.uniforms[ "opacity" ].value = this.opacity;
		this.uniforms[ "tDiffuse" ].value = this.map;
		this.material.transparent = ( this.opacity < 1.0 );

		renderer.render( this.scene, this.camera, this.renderToScreen ? null : readBuffer, this.clear );

		renderer.autoClear = oldAutoClear;
	}

} );

Object.defineProperty(exports, '__esModule', { value: true });

})));
