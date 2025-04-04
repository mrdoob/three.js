import {
	AdditiveBlending,
	HalfFloatType,
	ShaderMaterial,
	UniformsUtils,
	Vector2,
	WebGLRenderTarget
} from 'three';
import { Pass, FullScreenQuad } from './Pass.js';
import { ConvolutionShader } from '../shaders/ConvolutionShader.js';

/**
 * A pass for a basic Bloom effect.
 *
 * {@link UnrealBloomPass} produces a more advanced Bloom but is also
 * more expensive.
 *
 * ```js
 * const effectBloom = new BloomPass( 0.75 );
 * composer.addPass( effectBloom );
 * ```
 *
 * @augments Pass
 * @three_import import { BloomPass } from 'three/addons/postprocessing/BloomPass.js';
 */
class BloomPass extends Pass {

	/**
	 * Constructs a new Bloom pass.
	 *
	 * @param {number} [strength=1] - The Bloom strength.
	 * @param {number} [kernelSize=25] - The kernel size.
	 * @param {number} [sigma=4] - The sigma.
	 */
	constructor( strength = 1, kernelSize = 25, sigma = 4 ) {

		super();

		// combine material

		/**
		 * The combine pass uniforms.
		 *
		 * @type {Object}
		 */
		this.combineUniforms = UniformsUtils.clone( CombineShader.uniforms );
		this.combineUniforms[ 'strength' ].value = strength;

		/**
		 * The combine pass material.
		 *
		 * @type {ShaderMaterial}
		 */
		this.materialCombine = new ShaderMaterial( {

			name: CombineShader.name,
			uniforms: this.combineUniforms,
			vertexShader: CombineShader.vertexShader,
			fragmentShader: CombineShader.fragmentShader,
			blending: AdditiveBlending,
			transparent: true

		} );

		// convolution material

		const convolutionShader = ConvolutionShader;

		/**
		 * The convolution pass uniforms.
		 *
		 * @type {Object}
		 */
		this.convolutionUniforms = UniformsUtils.clone( convolutionShader.uniforms );

		this.convolutionUniforms[ 'uImageIncrement' ].value = BloomPass.blurX;
		this.convolutionUniforms[ 'cKernel' ].value = buildKernel( sigma );

		/**
		 * The convolution pass material.
		 *
		 * @type {ShaderMaterial}
		 */
		this.materialConvolution = new ShaderMaterial( {

			name: convolutionShader.name,
			uniforms: this.convolutionUniforms,
			vertexShader: convolutionShader.vertexShader,
			fragmentShader: convolutionShader.fragmentShader,
			defines: {
				'KERNEL_SIZE_FLOAT': kernelSize.toFixed( 1 ),
				'KERNEL_SIZE_INT': kernelSize.toFixed( 0 )
			}

		} );

		/**
		 * Overwritten to disable the swap.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.needsSwap = false;

		// internals

		this._renderTargetX = new WebGLRenderTarget( 1, 1, { type: HalfFloatType } ); // will be resized later
		this._renderTargetX.texture.name = 'BloomPass.x';
		this._renderTargetY = new WebGLRenderTarget( 1, 1, { type: HalfFloatType } ); // will be resized later
		this._renderTargetY.texture.name = 'BloomPass.y';

		this._fsQuad = new FullScreenQuad( null );

	}

	/**
	 * Performs the Bloom pass.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer. This buffer is intended as the rendering
	 * destination for the pass.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer. The pass can access the result from the
	 * previous pass from this buffer.
	 * @param {number} deltaTime - The delta time in seconds.
	 * @param {boolean} maskActive - Whether masking is active or not.
	 */
	render( renderer, writeBuffer, readBuffer, deltaTime, maskActive ) {

		if ( maskActive ) renderer.state.buffers.stencil.setTest( false );

		// Render quad with blurred scene into texture (convolution pass 1)

		this._fsQuad.material = this.materialConvolution;

		this.convolutionUniforms[ 'tDiffuse' ].value = readBuffer.texture;
		this.convolutionUniforms[ 'uImageIncrement' ].value = BloomPass.blurX;

		renderer.setRenderTarget( this._renderTargetX );
		renderer.clear();
		this._fsQuad.render( renderer );


		// Render quad with blurred scene into texture (convolution pass 2)

		this.convolutionUniforms[ 'tDiffuse' ].value = this._renderTargetX.texture;
		this.convolutionUniforms[ 'uImageIncrement' ].value = BloomPass.blurY;

		renderer.setRenderTarget( this._renderTargetY );
		renderer.clear();
		this._fsQuad.render( renderer );

		// Render original scene with superimposed blur to texture

		this._fsQuad.material = this.materialCombine;

		this.combineUniforms[ 'tDiffuse' ].value = this._renderTargetY.texture;

		if ( maskActive ) renderer.state.buffers.stencil.setTest( true );

		renderer.setRenderTarget( readBuffer );
		if ( this.clear ) renderer.clear();
		this._fsQuad.render( renderer );

	}

	/**
	 * Sets the size of the pass.
	 *
	 * @param {number} width - The width to set.
	 * @param {number} height - The width to set.
	 */
	setSize( width, height ) {

		this._renderTargetX.setSize( width, height );
		this._renderTargetY.setSize( width, height );

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever the pass is no longer used in your app.
	 */
	dispose() {

		this._renderTargetX.dispose();
		this._renderTargetY.dispose();

		this.materialCombine.dispose();
		this.materialConvolution.dispose();

		this._fsQuad.dispose();

	}

}

const CombineShader = {

	name: 'CombineShader',

	uniforms: {

		'tDiffuse': { value: null },
		'strength': { value: 1.0 }

	},

	vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: /* glsl */`

		uniform float strength;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = strength * texel;

		}`

};

BloomPass.blurX = new Vector2( 0.001953125, 0.0 );
BloomPass.blurY = new Vector2( 0.0, 0.001953125 );


function gauss( x, sigma ) {

	return Math.exp( - ( x * x ) / ( 2.0 * sigma * sigma ) );

}

function buildKernel( sigma ) {

	// We loop off the sqrt(2 * pi) * sigma term, since we're going to normalize anyway.

	const kMaxKernelSize = 25;
	let kernelSize = 2 * Math.ceil( sigma * 3.0 ) + 1;

	if ( kernelSize > kMaxKernelSize ) kernelSize = kMaxKernelSize;

	const halfWidth = ( kernelSize - 1 ) * 0.5;

	const values = new Array( kernelSize );
	let sum = 0.0;
	for ( let i = 0; i < kernelSize; ++ i ) {

		values[ i ] = gauss( i - halfWidth, sigma );
		sum += values[ i ];

	}

	// normalize the kernel

	for ( let i = 0; i < kernelSize; ++ i ) values[ i ] /= sum;

	return values;

}

export { BloomPass };
