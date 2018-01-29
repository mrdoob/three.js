'use strict';

/**
 * Screen-space ambient occlusion pass.
 *
 * Has the following parameters
 *  - radius
 *  	- Ambient occlusion shadow radius (numeric value).
 *  - onlyAO
 *  	- Display only ambient occlusion result (boolean value).
 *  - aoClamp
 *  	- Ambient occlusion clamp (numeric value).
 *  - lumInfluence
 *  	- Pixel luminosity influence in AO calculation (numeric value).
 * 
 * To output to screen set renderToScreens true
 *
 * @author alteredq / http://alteredqualia.com/
 * @author tentone
 * @class SSAOPass
 */
THREE.SSAOPass = function ( scene, camera, width, height ) {

	if ( THREE.SSAOShader === undefined) {

		console.warn( 'THREE.SSAOPass depends on THREE.SSAOShader' );
		return new THREE.ShaderPass();

	}

	THREE.ShaderPass.call( this, THREE.SSAOShader );

	this.width = ( width !== undefined ) ? width : 512;
	this.height = ( height !== undefined ) ? height : 256;

	this.renderToScreen = false;

	this.camera2 = camera;
	this.scene2 = scene;

	//Depth material
	this.depthMaterial = new THREE.MeshDepthMaterial();
	this.depthMaterial.depthPacking = THREE.RGBADepthPacking;
	this.depthMaterial.blending = THREE.NoBlending;

	//Depth render target
	this.depthRenderTarget = new THREE.WebGLRenderTarget( this.width, this.height, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter } );
	//this.depthRenderTarget.texture.name = 'SSAOShader.rt';
	
	//Shader uniforms
	this.uniforms[ 'tDepth' ].value = this.depthRenderTarget.texture;
	this.uniforms[ 'size' ].value.set( this.width, this.height );
	this.uniforms[ 'cameraNear' ].value = this.camera2.near;
	this.uniforms[ 'cameraFar' ].value = this.camera2.far;

	this.uniforms[ 'radius' ].value = 4;
	this.uniforms[ 'onlyAO' ].value = false;
	this.uniforms[ 'aoClamp' ].value = 0.25;
	this.uniforms[ 'lumInfluence' ].value = 0.7;

	//Setters and getters for uniforms
	var self = this;
	Object.defineProperties(this, {

		radius: {
			get: function() { return this.uniforms[ 'radius' ].value; },
			set: function( value ) { this.uniforms[ 'radius' ].value = value; }
		},

		onlyAO: {
			get: function() { return this.uniforms[ 'onlyAO' ].value; },
			set: function( value ) { this.uniforms[ 'onlyAO' ].value = value; }
		},

		aoClamp: {
			get: function() { return this.uniforms[ 'aoClamp' ].value; },
			set: function( value ) { this.uniforms[ 'aoClamp' ].value = value; }
		},

		lumInfluence: {
			get: function() { return this.uniforms[ 'lumInfluence' ].value; },
			set: function( value ) { this.uniforms[ 'lumInfluence' ].value = value; }
		},

	});
}

THREE.SSAOPass.prototype = Object.create( THREE.ShaderPass.prototype );

/**
 * Render using this pass.
 * 
 * @method render
 * @param {WebGLRenderer} renderer
 * @param {WebGLRenderTarget} writeBuffer Buffer to write output.
 * @param {WebGLRenderTarget} readBuffer Input buffer.
 * @param {Number} delta Delta time in milliseconds.
 * @param {Boolean} maskActive Not used in this pass.
 */
THREE.SSAOPass.prototype.render = function( renderer, writeBuffer, readBuffer, delta, maskActive ) {

	//Render depth into depthRenderTarget
	this.scene2.overrideMaterial = this.depthMaterial;
	
	renderer.render( this.scene2, this.camera2, this.depthRenderTarget, true );
	
	this.scene2.overrideMaterial = null;


	//SSAO shaderPass
	THREE.ShaderPass.prototype.render.call( this, renderer, writeBuffer, readBuffer, delta, maskActive );

};

/**
 * Change scene to be renderer by this render pass.
 *
 * @method setScene
 * @param {Scene} scene
 */
THREE.SSAOPass.prototype.setScene = function(scene) {
	
	this.scene2 = scene;

};

/**
 * Set camera used by this render pass.
 *
 * @method setCamera
 * @param {Camera} camera
 */
THREE.SSAOPass.prototype.setCamera = function( camera ) {

	this.camera2 = camera;

	this.uniforms[ 'cameraNear' ].value = this.camera2.near;
	this.uniforms[ 'cameraFar' ].value = this.camera2.far;

};

/**
 * Set resolution of this render pass.
 * 
 * @method setSize
 * @param {Number} width
 * @param {Number} height
 */
THREE.SSAOPass.prototype.setSize = function( width, height ) {

	this.width = width;
	this.height = height;

	this.uniforms[ 'size' ].value.set( this.width, this.height );
	this.depthRenderTarget.setSize( this.width, this.height );

};
