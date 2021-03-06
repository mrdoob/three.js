import {
	FloatType,
	HalfFloatType,
	LinearFilter,
	MeshBasicMaterial,
	NearestFilter,
	RGBAFormat,
	ShaderMaterial,
	TetrahedronGeometry,
	UniformsUtils,
	WebGLRenderTarget
} from '../../../build/three.module.js';
import { Pass } from '../postprocessing/Pass.js';
import { MovingAverageAccumulationShader } from '../shaders/ProgressiveShadowsShader.js';

var ProgressiveShadowsPass = function ( averagingWindow ) {

	Pass.call( this );

	if ( MovingAverageAccumulationShader === undefined )
		console.error( 'THREE.ProgressiveShadowsPass relies on ProgressiveShadowsShader' );

	this.shader = MovingAverageAccumulationShader;

	this.uniforms = UniformsUtils.clone( this.shader.uniforms );

	this.uniforms[ 'averagingWindow' ].value = averagingWindow !== undefined ? averagingWindow : 100;

	this.textureComp = new WebGLRenderTarget( window.innerWidth, window.innerHeight, {

		minFilter: LinearFilter,
		magFilter: NearestFilter,
		format: RGBAFormat,
		type: FloatType

	} );

	this.textureOld = new WebGLRenderTarget( window.innerWidth, window.innerHeight, {

		minFilter: LinearFilter,
		magFilter: NearestFilter,
		format: RGBAFormat,
		type: FloatType

	} );

	this.shaderMaterial = new ShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: this.shader.vertexShader,
		fragmentShader: this.shader.fragmentShader

	} );

	this.compFsQuad = new Pass.FullScreenQuad( this.shaderMaterial );

	var material = new MeshBasicMaterial();
	this.copyFsQuad = new Pass.FullScreenQuad( material );

};

ProgressiveShadowsPass.prototype = Object.assign( Object.create( Pass.prototype ), {

	constructor: ProgressiveShadowsPass,

	render: function ( renderer, writeBuffer, readBuffer ) {

		this.uniforms[ 'tOld' ].value = this.textureOld.texture;
		this.uniforms[ 'tNew' ].value = readBuffer.texture;

		renderer.setRenderTarget( this.textureComp );
		this.compFsQuad.render( renderer );

		this.copyFsQuad.material.map = this.textureComp.texture;

		if ( this.renderToScreen ) {

			renderer.setRenderTarget( null );
			this.copyFsQuad.render( renderer );

		} else {

			renderer.setRenderTarget( writeBuffer );

			if ( this.clear ) renderer.clear();

			this.copyFsQuad.render( renderer );

		}

		// Swap buffers.
		var temp = this.textureOld;
		this.textureOld = this.textureComp;
		this.textureComp = temp;
		// Now textureOld contains the latest image, ready for the next frame.

	},

	setSize: function ( width, height ) {

		this.textureComp.setSize( width, height );
		this.textureOld .setSize( width, height );

	}

} );

export { ProgressiveShadowsPass };
