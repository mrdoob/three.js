import {
	HalfFloatType,
	WebGLRenderTarget
} from 'three';
import { SSAARenderPass } from './SSAARenderPass.js';

/**
 *
 * Temporal Anti-Aliasing Render Pass.
 *
 * When there is no motion in the scene, the TAA render pass accumulates jittered camera
 * samples across frames to create a high quality anti-aliased result.
 *
 * Note: This effect uses no reprojection so it is no TRAA implementation.
 *
 * ```js
 * const taaRenderPass = new TAARenderPass( scene, camera );
 * taaRenderPass.unbiased = false;
 * composer.addPass( taaRenderPass );
 * ```
 *
 * @augments SSAARenderPass
 */
class TAARenderPass extends SSAARenderPass {

	/**
	 * Constructs a new TAA render pass.
	 *
	 * @param {Scene} scene - The scene to render.
	 * @param {Camera} camera - The camera.
	 * @param {?(number|Color|string)} [clearColor=0x000000] - The clear color of the render pass.
	 * @param {?number} [clearAlpha=0] - The clear alpha of the render pass.
	 */
	constructor( scene, camera, clearColor, clearAlpha ) {

		super( scene, camera, clearColor, clearAlpha );

		/**
		 * Overwritten and set to 0 by default.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.sampleLevel = 0;

		/**
		 * Whether to accumulate frames or not. This enables
		 * the TAA.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.accumulate = false;

		/**
		 * The accumulation index.
		 *
		 * @type {number}
		 * @default -1
		 */
		this.accumulateIndex = - 1;

		// internals

		this._sampleRenderTarget = null;
		this._holdRenderTarget = null;

	}

	/**
	 * Performs the TAA render pass.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer. This buffer is intended as the rendering
	 * destination for the pass.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer. The pass can access the result from the
	 * previous pass from this buffer.
	 * @param {number} deltaTime - The delta time in seconds.
	 * @param {boolean} maskActive - Whether masking is active or not.
	 */
	render( renderer, writeBuffer, readBuffer, deltaTime/*, maskActive*/ ) {

		if ( this.accumulate === false ) {

			super.render( renderer, writeBuffer, readBuffer, deltaTime );

			this.accumulateIndex = - 1;
			return;

		}

		const jitterOffsets = _JitterVectors[ 5 ];

		if ( this._sampleRenderTarget === null ) {

			this._sampleRenderTarget = new WebGLRenderTarget( readBuffer.width, readBuffer.height, { type: HalfFloatType } );
			this._sampleRenderTarget.texture.name = 'TAARenderPass.sample';

		}

		if ( this._holdRenderTarget === null ) {

			this._holdRenderTarget = new WebGLRenderTarget( readBuffer.width, readBuffer.height, { type: HalfFloatType } );
			this._holdRenderTarget.texture.name = 'TAARenderPass.hold';

		}

		if ( this.accumulateIndex === - 1 ) {

			super.render( renderer, this._holdRenderTarget, readBuffer, deltaTime );

			this.accumulateIndex = 0;

		}

		const autoClear = renderer.autoClear;
		renderer.autoClear = false;

		renderer.getClearColor( this._oldClearColor );
		const oldClearAlpha = renderer.getClearAlpha();

		const sampleWeight = 1.0 / ( jitterOffsets.length );

		if ( this.accumulateIndex >= 0 && this.accumulateIndex < jitterOffsets.length ) {

			this._copyUniforms[ 'opacity' ].value = sampleWeight;
			this._copyUniforms[ 'tDiffuse' ].value = writeBuffer.texture;

			// render the scene multiple times, each slightly jitter offset from the last and accumulate the results.
			const numSamplesPerFrame = Math.pow( 2, this.sampleLevel );
			for ( let i = 0; i < numSamplesPerFrame; i ++ ) {

				const j = this.accumulateIndex;
				const jitterOffset = jitterOffsets[ j ];

				if ( this.camera.setViewOffset ) {

					this.camera.setViewOffset( readBuffer.width, readBuffer.height,
						jitterOffset[ 0 ] * 0.0625, jitterOffset[ 1 ] * 0.0625, // 0.0625 = 1 / 16
						readBuffer.width, readBuffer.height );

				}

				renderer.setRenderTarget( writeBuffer );
				renderer.setClearColor( this.clearColor, this.clearAlpha );
				renderer.clear();
				renderer.render( this.scene, this.camera );

				renderer.setRenderTarget( this._sampleRenderTarget );
				if ( this.accumulateIndex === 0 ) {

					renderer.setClearColor( 0x000000, 0.0 );
					renderer.clear();

				}

				this._fsQuad.render( renderer );

				this.accumulateIndex ++;

				if ( this.accumulateIndex >= jitterOffsets.length ) break;

			}

			if ( this.camera.clearViewOffset ) this.camera.clearViewOffset();

		}

		renderer.setClearColor( this.clearColor, this.clearAlpha );
		const accumulationWeight = this.accumulateIndex * sampleWeight;

		if ( accumulationWeight > 0 ) {

			this._copyUniforms[ 'opacity' ].value = 1.0;
			this._copyUniforms[ 'tDiffuse' ].value = this._sampleRenderTarget.texture;
			renderer.setRenderTarget( writeBuffer );
			renderer.clear();
			this._fsQuad.render( renderer );

		}

		if ( accumulationWeight < 1.0 ) {

			this._copyUniforms[ 'opacity' ].value = 1.0 - accumulationWeight;
			this._copyUniforms[ 'tDiffuse' ].value = this._holdRenderTarget.texture;
			renderer.setRenderTarget( writeBuffer );
			this._fsQuad.render( renderer );

		}

		renderer.autoClear = autoClear;
		renderer.setClearColor( this._oldClearColor, oldClearAlpha );

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever the pass is no longer used in your app.
	 */
	dispose() {

		super.dispose();

		if ( this._holdRenderTarget ) this._holdRenderTarget.dispose();

	}

}

const _JitterVectors = [
	[
		[ 0, 0 ]
	],
	[
		[ 4, 4 ], [ - 4, - 4 ]
	],
	[
		[ - 2, - 6 ], [ 6, - 2 ], [ - 6, 2 ], [ 2, 6 ]
	],
	[
		[ 1, - 3 ], [ - 1, 3 ], [ 5, 1 ], [ - 3, - 5 ],
		[ - 5, 5 ], [ - 7, - 1 ], [ 3, 7 ], [ 7, - 7 ]
	],
	[
		[ 1, 1 ], [ - 1, - 3 ], [ - 3, 2 ], [ 4, - 1 ],
		[ - 5, - 2 ], [ 2, 5 ], [ 5, 3 ], [ 3, - 5 ],
		[ - 2, 6 ], [ 0, - 7 ], [ - 4, - 6 ], [ - 6, 4 ],
		[ - 8, 0 ], [ 7, - 4 ], [ 6, 7 ], [ - 7, - 8 ]
	],
	[
		[ - 4, - 7 ], [ - 7, - 5 ], [ - 3, - 5 ], [ - 5, - 4 ],
		[ - 1, - 4 ], [ - 2, - 2 ], [ - 6, - 1 ], [ - 4, 0 ],
		[ - 7, 1 ], [ - 1, 2 ], [ - 6, 3 ], [ - 3, 3 ],
		[ - 7, 6 ], [ - 3, 6 ], [ - 5, 7 ], [ - 1, 7 ],
		[ 5, - 7 ], [ 1, - 6 ], [ 6, - 5 ], [ 4, - 4 ],
		[ 2, - 3 ], [ 7, - 2 ], [ 1, - 1 ], [ 4, - 1 ],
		[ 2, 1 ], [ 6, 2 ], [ 0, 4 ], [ 4, 4 ],
		[ 2, 5 ], [ 7, 5 ], [ 5, 6 ], [ 3, 7 ]
	]
];

export { TAARenderPass };
