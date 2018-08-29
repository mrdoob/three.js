/**
 * @author HypnosNova / https://www.threejs.org.cn/gallery/
 */
import * as THREE from '../../../build/three.module.js';
import { Pass } from '../../modules/postprocessing/Pass.js';
import { AfterimageShader } from '../../modules/shaders/AfterimageShader.js';
var __AfterimagePass;

__AfterimagePass = function ( damp ) {

	Pass.call( this );

	if ( AfterimageShader === undefined )
		console.error( "__AfterimagePass relies on AfterimageShader" );

	this.shader = AfterimageShader;

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

__AfterimagePass.prototype = Object.assign( Object.create( Pass.prototype ), {

	constructor: __AfterimagePass,

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

export { __AfterimagePass as AfterimagePass };
