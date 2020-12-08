import {
	LinearFilter,
	RGBFormat,
	ShaderMaterial,
	UniformsUtils,
	WebGLRenderTarget
} from '../../../build/three.module.js';
import { Pass } from '../postprocessing/Pass.js';
import { CopyShader } from '../shaders/CopyShader.js';

var SavePass = function ( renderTarget ) {

	Pass.call( this );

	if ( CopyShader === undefined )
		console.error( 'THREE.SavePass relies on CopyShader' );

	var shader = CopyShader;

	this.textureID = 'tDiffuse';

	this.uniforms = UniformsUtils.clone( shader.uniforms );

	this.material = new ShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader

	} );

	this.renderTarget = renderTarget;

	if ( this.renderTarget === undefined ) {

		this.renderTarget = new WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: LinearFilter, magFilter: LinearFilter, format: RGBFormat } );
		this.renderTarget.texture.name = 'SavePass.rt';

	}

	this.needsSwap = false;

	this.fsQuad = new Pass.FullScreenQuad( this.material );

};

SavePass.prototype = Object.assign( Object.create( Pass.prototype ), {

	constructor: SavePass,

	render: function ( renderer, writeBuffer, readBuffer ) {

		if ( this.uniforms[ this.textureID ] ) {

			this.uniforms[ this.textureID ].value = readBuffer.texture;

		}

		renderer.setRenderTarget( this.renderTarget );
		if ( this.clear ) renderer.clear();
		this.fsQuad.render( renderer );

	}

} );

export { SavePass };
