import {
	HalfFloatType,
	ShaderMaterial,
	WebGLRenderTarget
} from 'three';
import { FullScreenQuad, Pass } from './Pass.js';

/**
 * A special type of render pass for implementing transition effects.
 * When active, the pass will transition from scene A to scene B.
 *
 * ```js
 * const renderTransitionPass = new RenderTransitionPass( fxSceneA.scene, fxSceneA.camera, fxSceneB.scene, fxSceneB.camera );
 * renderTransitionPass.setTexture( textures[ 0 ] );
 * composer.addPass( renderTransitionPass );
 * ```
 *
 * @augments Pass
 * @three_import import { RenderTransitionPass } from 'three/addons/postprocessing/RenderTransitionPass.js';
 */
class RenderTransitionPass extends Pass {

	/**
	 * Constructs a render transition pass.
	 *
	 * @param {Scene} sceneA - The first scene.
	 * @param {Camera} cameraA - The camera of the first scene.
	 * @param {Scene} sceneB - The second scene.
	 * @param {Camera} cameraB - The camera of the second scene.
	 */
	constructor( sceneA, cameraA, sceneB, cameraB ) {

		super();

		/**
		 * The first scene.
		 *
		 * @type {Scene}
		 */
		this.sceneA = sceneA;


		/**
		 * The camera of the first scene.
		 *
		 * @type {Camera}
		 */
		this.cameraA = cameraA;

		/**
		 * The second scene.
		 *
		 * @type {Scene}
		 */
		this.sceneB = sceneB;

		/**
		 * The camera of the second scene.
		 *
		 * @type {Camera}
		 */
		this.cameraB = cameraB;

		/**
		 * The pass material.
		 *
		 * @type {ShaderMaterial}
		 */
		this.material = this._createMaterial();

		// internals

		this._renderTargetA = new WebGLRenderTarget();
		this._renderTargetA.texture.type = HalfFloatType;
		this._renderTargetB = new WebGLRenderTarget();
		this._renderTargetB.texture.type = HalfFloatType;

		this._fsQuad = new FullScreenQuad( this.material );

	}

	/**
	 * Sets the transition factor. Must be in the range `[0,1]`.
	 * This value determines to what degree both scenes are mixed.
	 *
	 * @param {boolean|number} value - The transition factor.
	 */
	setTransition( value ) {

		this.material.uniforms.mixRatio.value = value;

	}

	/**
	 * Toggles the usage of a texture for the effect.
	 *
	 * @param {boolean} value - Whether to use a texture for the transition effect or not.
	 */
	useTexture( value ) {

		this.material.uniforms.useTexture.value = value ? 1 : 0;

	}

	/**
	 * Sets the effect texture.
	 *
	 * @param {Texture} value - The effect texture.
	 */
	setTexture( value ) {

		this.material.uniforms.tMixTexture.value = value;

	}

	/**
	 * Sets the texture threshold. This value defined how strong the texture effects
	 * the transition. Must be in the range `[0,1]` (0 means full effect, 1 means no effect).
	 *
	 * @param {boolean|number} value - The threshold value.
	 */
	setTextureThreshold( value ) {

		this.material.uniforms.threshold.value = value;

	}

	/**
	 * Sets the size of the pass.
	 *
	 * @param {number} width - The width to set.
	 * @param {number} height - The width to set.
	 */
	setSize( width, height ) {

		this._renderTargetA.setSize( width, height );
		this._renderTargetB.setSize( width, height );

	}

	/**
	 * Performs the transition pass.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer. This buffer is intended as the rendering
	 * destination for the pass.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer. The pass can access the result from the
	 * previous pass from this buffer.
	 * @param {number} deltaTime - The delta time in seconds.
	 * @param {boolean} maskActive - Whether masking is active or not.
	 */
	render( renderer, writeBuffer/*, readBuffer , deltaTime, maskActive */ ) {

		renderer.setRenderTarget( this._renderTargetA );
		renderer.render( this.sceneA, this.cameraA );
		renderer.setRenderTarget( this._renderTargetB );
		renderer.render( this.sceneB, this.cameraB );

		const uniforms = this._fsQuad.material.uniforms;
		uniforms.tDiffuse1.value = this._renderTargetA.texture;
		uniforms.tDiffuse2.value = this._renderTargetB.texture;

		if ( this.renderToScreen ) {

			renderer.setRenderTarget( null );
			renderer.clear();

		} else {

			renderer.setRenderTarget( writeBuffer );
			if ( this.clear ) renderer.clear();

		}

		this._fsQuad.render( renderer );

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever the pass is no longer used in your app.
	 */
	dispose() {

		this.material.dispose();

		this._renderTargetA.dispose();
		this._renderTargetB.dispose();
		this._fsQuad.dispose();

	}

	// internals

	_createMaterial() {

		return new ShaderMaterial( {
			uniforms: {
				tDiffuse1: {
					value: null
				},
				tDiffuse2: {
					value: null
				},
				mixRatio: {
					value: 0.0
				},
				threshold: {
					value: 0.1
				},
				useTexture: {
					value: 1
				},
				tMixTexture: {
					value: null
				}
			},
			vertexShader: /* glsl */`
				varying vec2 vUv;

				void main() {

					vUv = vec2( uv.x, uv.y );
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}
			`,
			fragmentShader: /* glsl */`
				uniform float mixRatio;

				uniform sampler2D tDiffuse1;
				uniform sampler2D tDiffuse2;
				uniform sampler2D tMixTexture;

				uniform int useTexture;
				uniform float threshold;

				varying vec2 vUv;

				void main() {

					vec4 texel1 = texture2D( tDiffuse1, vUv );
					vec4 texel2 = texture2D( tDiffuse2, vUv );

					if (useTexture == 1) {

						vec4 transitionTexel = texture2D( tMixTexture, vUv );
						float r = mixRatio * ( 1.0 + threshold * 2.0 ) - threshold;
						float mixf = clamp( ( transitionTexel.r - r ) * ( 1.0 / threshold ), 0.0, 1.0 );

						gl_FragColor = mix( texel1, texel2, mixf );

					} else {

						gl_FragColor = mix( texel2, texel1, mixRatio );

					}

				}
			`
		} );

	}

}

export { RenderTransitionPass };
