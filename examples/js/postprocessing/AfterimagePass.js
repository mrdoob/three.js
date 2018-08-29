/**
 * Generated from 'examples\modules\postprocessing\AfterimagePass.js'
 **/

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('../../../build/three.module.js'), require('./Pass.js'), require('../shaders/AfterimageShader.js')) :
	typeof define === 'function' && define.amd ? define(['exports', '../../../build/three.module.js', './Pass.js', '../shaders/AfterimageShader.js'], factory) :
	(factory((global.THREE = global.THREE || {}),global.THREE,global.THREE,global.THREE));
}(this, (function (exports,THREE,Pass_js,AfterimageShader_js) { 'use strict';

/**
 * @author HypnosNova / https://www.threejs.org.cn/gallery/
 */


exports.AfterimagePass = function ( damp ) {

	Pass_js.Pass.call( this );

	if ( AfterimageShader_js.AfterimageShader === undefined )
		console.error( "__AfterimagePass relies on AfterimageShader" );

	this.shader = AfterimageShader_js.AfterimageShader;

	this.uniforms = THREE.UniformsUtils.clone( this.shader.uniforms );

	this.uniforms[ "damp" ].value = damp !== undefined ? damp : 0.96;

	this.textureComp = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, {

		minFilter: THREE.LinearFilter,
		magFilter: THREE.NearestFilter,
		format: THREE.RGBAFormat

	} );

	this.textureOld = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, {

		minFilter: THREE.LinearFilter,
		magFilter: THREE.NearestFilter,
		format: THREE.RGBAFormat

	} );

	this.shaderMaterial = new THREE.ShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: this.shader.vertexShader,
		fragmentShader: this.shader.fragmentShader

	} );

	this.sceneComp = new THREE.Scene();
	this.scene = new THREE.Scene();

	this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
	this.camera.position.z = 1;

	var geometry = new THREE.PlaneBufferGeometry( 2, 2 );

	this.quadComp = new THREE.Mesh( geometry, this.shaderMaterial );
	this.sceneComp.add( this.quadComp );

	var material = new THREE.MeshBasicMaterial( { 
		map: this.textureComp.texture
	} );

	var quadScreen = new THREE.Mesh( geometry, material );
	this.scene.add( quadScreen );

};

exports.AfterimagePass.prototype = Object.assign( Object.create( Pass_js.Pass.prototype ), {

	constructor: exports.AfterimagePass,

	render: function ( renderer, writeBuffer, readBuffer ) {

		this.uniforms[ "tOld" ].value = this.textureOld.texture;
		this.uniforms[ "tNew" ].value = readBuffer.texture;

		this.quadComp.material = this.shaderMaterial;

		renderer.render( this.sceneComp, this.camera, this.textureComp );
		renderer.render( this.scene, this.camera, this.textureOld );
		
		if ( this.renderToScreen ) {
			
			renderer.render( this.scene, this.camera );
			
		} else {
			
			renderer.render( this.scene, this.camera, writeBuffer, this.clear );
			
		}

	}

} );

Object.defineProperty(exports, '__esModule', { value: true });

})));
