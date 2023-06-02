import {
	HalfFloatType,
	WebGLRenderTarget
} from 'three';
import { SSAARenderPass } from './SSAARenderPass.js';

/**
 *
 * Temporal Anti-Aliasing Render Pass
 *
 * When there is no motion in the scene, the TAA render pass accumulates jittered camera samples across frames to create a high quality anti-aliased result.
 *
 * References:
 *
 * TODO: Add support for motion vector pas so that accumulation of samples across frames can occur on dynamics scenes.
 *
 */

class TAARenderPass extends SSAARenderPass {

	constructor( scene, camera, clearColor, clearAlpha ) {

		super( scene, camera, clearColor, clearAlpha );

		this.sampleLevel = 0;
		this.accumulate = false;

	}

	render( renderer, writeBuffer, readBuffer, deltaTime ) {

		if ( this.accumulate === false ) {

			super.render( renderer, writeBuffer, readBuffer, deltaTime );

			this.accumulateIndex = - 1;
			return;

		}

		const jitterOffsets = _JitterVectors[ 5 ];

		if ( this.sampleRenderTarget === undefined ) {

			this.sampleRenderTarget = new WebGLRenderTarget( readBuffer.width, readBuffer.height, { type: HalfFloatType } );
			this.sampleRenderTarget.texture.name = 'TAARenderPass.sample';

		}

		if ( this.holdRenderTarget === undefined ) {

			this.holdRenderTarget = new WebGLRenderTarget( readBuffer.width, readBuffer.height, { type: HalfFloatType } );
			this.holdRenderTarget.texture.name = 'TAARenderPass.hold';

		}

		if ( this.accumulateIndex === - 1 ) {

			super.render( renderer, this.holdRenderTarget, readBuffer, deltaTime );

			this.accumulateIndex = 0;

		}

		const autoClear = renderer.autoClear;
		renderer.autoClear = false;

		renderer.getClearColor( this._oldClearColor );
		const oldClearAlpha = renderer.getClearAlpha();

		const sampleWeight = 1.0 / ( jitterOffsets.length );
		const accumulationWeight = this.accumulateIndex * sampleWeight;

		if ( this.accumulateIndex >= 0 && this.accumulateIndex < jitterOffsets.length ) {

			this.copyUniforms[ 'opacity' ].value = sampleWeight;
			this.copyUniforms[ 'tDiffuse' ].value = writeBuffer.texture;

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

				renderer.setRenderTarget( this.sampleRenderTarget );
				if ( this.accumulateIndex === 0 ) {

					renderer.setClearColor( 0x000000, 0.0 );
					renderer.clear();

				}

				this.fsQuad.render( renderer );

				this.accumulateIndex ++;

				if ( this.accumulateIndex >= jitterOffsets.length ) break;

			}

			if ( this.camera.clearViewOffset ) this.camera.clearViewOffset();

		}

		renderer.setClearColor( this.clearColor, this.clearAlpha );

		if ( accumulationWeight > 0 ) {

			this.copyUniforms[ 'opacity' ].value = 1.0;
			this.copyUniforms[ 'tDiffuse' ].value = this.sampleRenderTarget.texture;
			renderer.setRenderTarget( writeBuffer );
			renderer.clear();
			this.fsQuad.render( renderer );

		}

		if ( accumulationWeight < 1.0 ) {

			this.copyUniforms[ 'opacity' ].value = 1.0 - accumulationWeight;
			this.copyUniforms[ 'tDiffuse' ].value = this.holdRenderTarget.texture;
			renderer.setRenderTarget( writeBuffer );
			if ( accumulationWeight === 0 ) renderer.clear();
			this.fsQuad.render( renderer );

		}

		renderer.autoClear = autoClear;
		renderer.setClearColor( this._oldClearColor, oldClearAlpha );

	}

	dispose() {

		super.dispose();

		if ( this.sampleRenderTarget !== undefined ) this.sampleRenderTarget.dispose();
		if ( this.holdRenderTarget !== undefined ) this.holdRenderTarget.dispose();

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
