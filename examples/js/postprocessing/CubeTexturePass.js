/**
 * Generated from 'examples\modules\postprocessing\CubeTexturePass.js'
 **/

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('../../../build/three.module.js'), require('./Pass.js')) :
	typeof define === 'function' && define.amd ? define(['exports', '../../../build/three.module.js', './Pass.js'], factory) :
	(factory((global.THREE = global.THREE || {}),global.THREE,global.THREE));
}(this, (function (exports,THREE,Pass_js) { 'use strict';

/**
 * @author bhouston / http://clara.io/
 */


exports.CubeTexturePass = function ( camera, envMap, opacity ) {

	Pass_js.Pass.call( this );

	this.camera = camera;

	this.needsSwap = false;

	this.cubeShader = THREE.ShaderLib[ 'cube' ];
	this.cubeMesh = new THREE.Mesh(
		new THREE.BoxBufferGeometry( 10, 10, 10 ),
		new THREE.ShaderMaterial( {
			uniforms: this.cubeShader.uniforms,
			vertexShader: this.cubeShader.vertexShader,
			fragmentShader: this.cubeShader.fragmentShader,
			depthTest: false,
			depthWrite: false,
			side: THREE.BackSide
		} )
	);

	this.envMap = envMap;
	this.opacity = ( opacity !== undefined ) ? opacity : 1.0;

	this.cubeScene = new THREE.Scene();
	this.cubeCamera = new THREE.PerspectiveCamera();
	this.cubeScene.add( this.cubeMesh );

};

exports.CubeTexturePass.prototype = Object.assign( Object.create( Pass_js.Pass.prototype ), {

	constructor: exports.CubeTexturePass,

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		var oldAutoClear = renderer.autoClear;
		renderer.autoClear = false;

		this.cubeCamera.projectionMatrix.copy( this.camera.projectionMatrix );
		this.cubeCamera.quaternion.setFromRotationMatrix( this.camera.matrixWorld );

		this.cubeMesh.material.uniforms[ "tCube" ].value = this.envMap;
		this.cubeMesh.material.uniforms[ "opacity" ].value = this.opacity;
		this.cubeMesh.material.transparent = ( this.opacity < 1.0 );

		renderer.render( this.cubeScene, this.cubeCamera, this.renderToScreen ? null : readBuffer, this.clear );

		renderer.autoClear = oldAutoClear;

	}

} );

Object.defineProperty(exports, '__esModule', { value: true });

})));
