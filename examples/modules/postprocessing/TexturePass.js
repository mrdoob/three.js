/**
 * @author alteredq / http://alteredqualia.com/
 */
import * as THREE from '../../../build/three.module.js';
import { Pass } from '../../modules/postprocessing/Pass.js';
import { CopyShader } from '../../modules/shaders/CopyShader.js';
var __TexturePass;

__TexturePass = function ( map, opacity ) {

	Pass.call( this );

	if ( CopyShader === undefined )
		console.error( "__TexturePass relies on CopyShader" );

	var shader = CopyShader;

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

__TexturePass.prototype = Object.assign( Object.create( Pass.prototype ), {

	constructor: __TexturePass,

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

export { __TexturePass as TexturePass };
