import {
  LinearFilter,
  Mesh,
  OrthographicCamera,
  PlaneBufferGeometry,
  RGBFormat,
  Scene,
  ShaderMaterial,
  UniformsUtils,
  WebGLRenderTarget
} from '../../../build/three.module.js';
import {
  CopyShader
} from '../../shaders/CopyShader.js';
import {
  Pass
} from '../EffectComposer.js';
/**
 * @author alteredq / http://alteredqualia.com/
 */

var SavePass = function ( renderTarget ) {

	Pass.call( this );

	if ( CopyShader === undefined )
		console.error( "THREE.SavePass relies on THREE.CopyShader" );

	var shader = CopyShader;

	this.textureID = "tDiffuse";

	this.uniforms = UniformsUtils.clone( shader.uniforms );

	this.material = new ShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader

	} );

	this.renderTarget = renderTarget;

	if ( this.renderTarget === undefined ) {

		this.renderTarget = new WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: LinearFilter, magFilter: LinearFilter, format: RGBFormat, stencilBuffer: false } );
		this.renderTarget.texture.name = "SavePass.rt";

	}

	this.needsSwap = false;

	this.camera = new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	this.scene = new Scene();

	this.quad = new Mesh( new PlaneBufferGeometry( 2, 2 ), null );
	this.quad.frustumCulled = false; // Avoid getting clipped
	this.scene.add( this.quad );

};

SavePass.prototype = Object.assign( Object.create( Pass.prototype ), {

	constructor: SavePass,

	render: function ( renderer, writeBuffer, readBuffer ) {

		if ( this.uniforms[ this.textureID ] ) {

			this.uniforms[ this.textureID ].value = readBuffer.texture;

		}

		this.quad.material = this.material;

		renderer.setRenderTarget( this.renderTarget );
		if ( this.clear ) renderer.clear();
		renderer.render( this.scene, this.camera );

	}

} );

export {
  SavePass
};