import { Vector2 } from 'three/webgpu';
import { Fn, float, getViewPosition, isBackgroundDepth, ivec2, positionPrevious, rtt, sample, textureSize, uniform, uv, vec2, vec3, vec4, velocity } from 'three/tsl';

/**
 * The view-space depth the surface had in the previous frame. It follows both camera
 * and object motion. {@link PreviousFrameSource} expects it in the alpha channel of
 * the velocity MRT attachment.
 *
 * @tsl
 * @type {Node<float>}
 */
export const previousViewZ = /*@__PURE__*/ velocity.previousCameraViewMatrix.mul( velocity.previousModelWorldMatrix ).mul( vec4( positionPrevious, 1 ) ).z.toVarying();

/**
 * Provides the previous frame's beauty as a trace source for screen-space effects
 * like SSR or SSGI, so they can run before the current frame is shaded.
 *
 * The previous frame is reprojected by the velocity and validated against the previous
 * depth, either per lookup ({@link PreviousFrameSource#node}) or once per frame into a
 * buffer ({@link PreviousFrameSource#bufferNode}). The buffer is cheaper for effects
 * that take many samples per pixel.
 *
 * ```js
 * scenePass.setMRT( mrt( { output, velocity: vec4( velocity, 0, previousViewZ ) } ) );
 *
 * const reflection = ssr( scenePassColor, scenePassDepth, sceneNormal, { camera } );
 * const traaPass = traa( reflection, scenePassDepth, scenePassVelocity, camera );
 *
 * const previousFrame = new PreviousFrameSource( scenePass, traaPass.reprojection );
 * reflection.colorNode = previousFrame.node;
 *
 * renderPipeline.render();
 * previousFrame.update( renderer );
 * ```
 *
 * Note: This class can only be used with `WebGPURenderer`.
 *
 * @three_import import { PreviousFrameSource, previousViewZ } from 'three/addons/tsl/utils/PreviousFrameSource.js';
 */
class PreviousFrameSource {

	/**
	 * Constructs a new previous frame source.
	 *
	 * @param {PassNode} scenePass - The scene pass.
	 * @param {Reprojection} reprojection - The previous frame's depth and camera matrices, usually shared
	 * with the TRAA (`traaPass.reprojection`). Its velocity must hold {@link previousViewZ} in the alpha channel.
	 */
	constructor( scenePass, reprojection ) {

		const { depthNode, velocityNode, camera } = reprojection;

		/**
		 * Holds the previous frame's depth and camera matrices.
		 *
		 * @private
		 * @type {Reprojection}
		 */
		this._reprojection = reprojection;

		/**
		 * The version of the reprojection after the last update.
		 *
		 * @private
		 * @type {number}
		 */
		this._reprojectionVersion = reprojection.version;

		/**
		 * The TRAA jitter of the current frame in UV space.
		 *
		 * @private
		 * @type {Vector2}
		 */
		this._jitter = new Vector2();

		/**
		 * The TRAA jitter of the previous frame in UV space.
		 *
		 * @private
		 * @type {Vector2}
		 */
		this._previousJitter = new Vector2();

		/**
		 * Whether the source has been sampled in the current frame.
		 *
		 * @private
		 * @type {boolean}
		 */
		this._used = false;

		/**
		 * Whether the previous frame has been stored.
		 *
		 * @private
		 * @type {boolean}
		 */
		this._hasHistory = false;

		// the scene buffers carry TRAA jitter, the velocity does not

		const jitterDelta = uniform( new Vector2() );

		const historyValid = uniform( false ).onRenderUpdate( () => {

			const e = camera.projectionMatrix.elements;

			this._jitter.set( - e[ 8 ] * 0.5, e[ 9 ] * 0.5 );
			jitterDelta.value.copy( this._previousJitter ).sub( this._jitter );

			this._used = true;

			return this._hasHistory && reprojection.needsHistoryReset() === false;

		} );

		const reproject = ( uv ) => Fn( () => {

			// the history is only allocated when the source is compiled for the first time

			const previousColor = scenePass.getPreviousTextureNode( 'output' );
			const previousDepth = reprojection.previousDepthNode;

			// load motion and expected depth from one surface at silhouettes

			const motionSize = ivec2( textureSize( velocityNode ) );
			const motionTexel = ivec2( uv.mul( vec2( motionSize ) ) ).clamp( ivec2( 0 ), motionSize.sub( 1 ) );
			const historyUV = reprojection.getHistoryUV( uv, motionTexel ).add( jitterDelta ).toConst();
			const expectedZ = velocityNode.load( motionTexel ).w.toConst();

			// the depth slope per pixel, taken from the flatter side so it does not cross silhouettes

			const flatter = ( a, b ) => a.abs().lessThan( b.abs() ).select( a, b );
			const neighborZ = ( x, y ) => velocityNode.load( motionTexel.add( ivec2( x, y ) ) ).w;
			const slope = vec2(
				flatter( neighborZ( 1, 0 ).sub( expectedZ ), expectedZ.sub( neighborZ( - 1, 0 ) ) ),
				flatter( neighborZ( 0, 1 ).sub( expectedZ ), expectedZ.sub( neighborZ( 0, - 1 ) ) )
			).toConst();
			const texelOffset = uv.mul( vec2( motionSize ) ).sub( 0.5 ).sub( vec2( motionTexel ) ).toConst();

			const size = vec2( textureSize( previousDepth ) );
			const pixel = historyUV.mul( size ).sub( 0.5 );
			const base = pixel.floor();
			const fraction = pixel.fract();
			const inBounds = ( p ) => p.greaterThanEqual( 0 ).all().and( p.lessThanEqual( 1 ).all() );
			const valid = historyValid.and( inBounds( historyUV ) )
				.and( isBackgroundDepth( depthNode.sample( uv ).r ).not() )
				.and( expectedZ.lessThan( camera.near * - 1 ) );

			// allow a small pixel footprint for curved surfaces, plus half-float rounding

			const pixelDepth = reprojection.previousCameraProjectionMatrixInverse.element( 1 ).y.abs().mul( expectedZ.abs() ).mul( 3 ).div( size.y );
			const tolerance = pixelDepth.max( expectedZ.abs().mul( 0.002 ) ).max( 0.001 );
			const radiance = vec3( 0 ).toVar();
			const support = float( 0 ).toVar();

			// validate each bilinear tap so interpolation cannot pull color across an occlusion edge

			for ( let y = 0; y <= 1; y ++ ) {

				for ( let x = 0; x <= 1; x ++ ) {

					const tapUV = base.add( vec2( x, y ) ).add( 0.5 ).div( size ).toConst();
					const depth = previousDepth.sample( tapUV ).r;
					const viewZ = getViewPosition( tapUV, depth, reprojection.previousCameraProjectionMatrixInverse ).z;
					const tapZ = expectedZ.add( slope.dot( vec2( x, y ).sub( fraction ).add( texelOffset ) ) );
					const accepted = valid.and( inBounds( tapUV ) ).and( isBackgroundDepth( depth ).not() )
						.and( viewZ.sub( tapZ ).abs().lessThanEqual( tolerance ) );
					const weightX = x === 0 ? fraction.x.oneMinus() : fraction.x;
					const weightY = y === 0 ? fraction.y.oneMinus() : fraction.y;
					const weight = weightX.mul( weightY ).mul( accepted ).toConst();

					radiance.addAssign( previousColor.sample( tapUV ).rgb.mul( weight ) );
					support.addAssign( weight );

				}

			}

			return vec4( radiance.div( support.max( 1e-6 ) ), support );

		} )();

		/**
		 * The previous frame's beauty, reprojected per lookup. `sample( uv )` returns
		 * the radiance in RGB and the valid bilinear support in alpha. Missing history
		 * returns zero.
		 *
		 * @type {Node<vec4>}
		 */
		this.node = sample( reproject );

		// the radiance is stored premultiplied by its support so filtering weights valid texels only

		const buffer = rtt( Fn( () => {

			const history = reproject( uv() ).toConst();

			return vec4( history.rgb.mul( history.a ), history.a );

		} )() );

		buffer.value.name = 'PreviousFrameSource.buffer';

		/**
		 * The previous frame's beauty, reprojected once per frame into a buffer.
		 * Returns the same as {@link PreviousFrameSource#node} for a single texture lookup.
		 *
		 * @type {Node<vec4>}
		 */
		this.bufferNode = sample( ( uv ) => {

			const history = buffer.sample( uv ).toConst();

			return vec4( history.rgb.div( history.a.max( 1e-4 ) ), history.a );

		} );

		/**
		 * The buffer of {@link PreviousFrameSource#bufferNode}.
		 *
		 * @private
		 * @type {RTTNode}
		 */
		this._buffer = buffer;

	}

	/**
	 * Stores the jitter for the next frame. Call it once per frame after rendering.
	 * It also stores the reprojection when its owner did not render this frame.
	 *
	 * @param {Renderer} renderer - The renderer.
	 */
	update( renderer ) {

		const reprojection = this._reprojection;

		if ( this._used === true ) {

			if ( reprojection.version === this._reprojectionVersion ) reprojection.update( renderer );

			this._previousJitter.copy( this._jitter );

		}

		this._hasHistory = this._used;
		this._reprojectionVersion = reprojection.version;
		this._used = false;

	}

	/**
	 * Frees internal resources. This method should be called
	 * when the source is no longer required.
	 */
	dispose() {

		this._buffer.dispose();

	}

}

export { PreviousFrameSource };
