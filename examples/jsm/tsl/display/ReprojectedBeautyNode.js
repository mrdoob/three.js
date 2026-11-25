import { Node, Vector2 } from 'three/webgpu';
import { Fn, depthToViewZ, float, isBackgroundDepth, ivec2, positionPrevious, textureSize, uniform, uv, vec2, vec3, vec4, velocity } from 'three/tsl';
import { Reprojection } from '../../utils/Reprojection.js';

/**
 * The view-space depth the surface had in the previous frame. It follows both camera
 * and object motion. {@link ReprojectedBeautyNode} expects it in the alpha channel of
 * the velocity MRT attachment.
 *
 * @tsl
 * @type {Node<float>}
 */
export const previousViewZ = /*@__PURE__*/ velocity.previousCameraViewMatrix.mul( velocity.previousModelWorldMatrix ).mul( vec4( positionPrevious, 1 ) ).z.toVarying();

/**
 * Reprojects the previous frame's beauty into the current frame, so screen-space
 * effects like SSR or SSGI can trace it before the current frame is shaded.
 *
 * The history is validated against the previous depth. RGB holds the radiance and
 * alpha the valid bilinear support, both are zero where the history is missing.
 *
 * It reprojects at each `sample( uv )` call. Use `convertToTexture()` to cache it
 * for effects that read it many times per pixel.
 *
 * ```js
 * scenePass.setMRT( mrt( { output, velocity: vec4( velocity, 0, previousViewZ ) } ) );
 *
 * const beauty = reprojectedBeauty( scenePass );
 *
 * const reflection = ssr( beauty, scenePassDepth, sceneNormal, { camera } );
 * const gi = ssgi( convertToTexture( beauty ), scenePassDepth, sceneNormal, camera );
 * ```
 *
 * Note: This node can only be used with `WebGPURenderer`.
 *
 * @augments Node
 * @three_import import { reprojectedBeauty, previousViewZ } from 'three/addons/tsl/display/ReprojectedBeautyNode.js';
 */
class ReprojectedBeautyNode extends Node {

	static get type() {

		return 'ReprojectedBeautyNode';

	}

	/**
	 * Constructs a new reprojected beauty node.
	 *
	 * @param {PassNode} scenePass - The scene pass. Its `velocity` MRT attachment must
	 * hold {@link previousViewZ} in the alpha channel.
	 */
	constructor( scenePass ) {

		super( 'vec4' );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isReprojectedBeautyNode = true;

		/**
		 * The scene pass.
		 *
		 * @type {PassNode}
		 */
		this.scenePass = scenePass;

		/**
		 * Holds the previous frame's depth and camera matrices.
		 *
		 * @private
		 * @type {Reprojection}
		 */
		this._reprojection = new Reprojection( scenePass.getTextureNode( 'depth' ), scenePass.getTextureNode( 'velocity' ), scenePass.camera, scenePass.getPreviousTextureNode( 'depth' ) );

		/**
		 * The camera's near and far planes from the last scene render.
		 *
		 * @private
		 * @type {Vector2}
		 */
		this._cameraNearFar = new Vector2( scenePass.camera.near, scenePass.camera.far );

		/**
		 * The near and far planes used to encode the previous depth texture.
		 *
		 * @private
		 * @type {UniformNode<vec2>}
		 */
		this._previousCameraNearFar = uniform( this._cameraNearFar.clone() );

		/**
		 * The TRAA jitter of the previous frame relative to the current one, in UV space.
		 *
		 * @private
		 * @type {UniformNode<vec2>}
		 */
		this._jitterDelta = uniform( new Vector2() );

		/**
		 * Whether the history is valid. Its update advances the history once per frame.
		 *
		 * @private
		 * @type {UniformNode<bool>}
		 */
		this._historyValid = uniform( false ).onFrameUpdate( () => this._updateHistory() );

	}

	/**
	 * Reprojects at the default UV.
	 *
	 * @return {Node<vec4>} The reprojected beauty.
	 */
	setup() {

		return Fn( () => this.sample( uv() ) )();

	}

	/**
	 * Frees internal resources. This method should be called
	 * when the node is no longer required.
	 */
	dispose() {

		this._reprojection.dispose();

		super.dispose();

	}

	/**
	 * Advances the history state by one frame.
	 *
	 * @private
	 * @return {boolean} Whether the previous frame matches the current one.
	 */
	_updateHistory() {

		const reprojection = this._reprojection;
		const { camera } = reprojection;
		const valid = reprojection.needsHistoryReset() === false;

		reprojection.advance();
		this._previousCameraNearFar.value.copy( this._cameraNearFar );
		this._cameraNearFar.set( camera.near, camera.far );

		// the scene buffers carry TRAA jitter, the velocity does not

		const current = camera.projectionMatrix.elements;
		const previous = reprojection.previousCameraProjectionMatrix.value.elements;

		this._jitterDelta.value.set( current[ 8 ] - previous[ 8 ], previous[ 9 ] - current[ 9 ] ).multiplyScalar( 0.5 );

		return valid;

	}

	/**
	 * Reprojects the previous frame's beauty at the given UV. Must be called inside a `Fn()`.
	 *
	 * @param {Node<vec2>} uvNode - The UV in the current frame.
	 * @return {Node<vec4>} The radiance in RGB and the valid bilinear support in alpha.
	 */
	sample( uvNode ) {

		const { scenePass } = this;
		const reprojection = this._reprojection;

		const velocityNode = reprojection.velocityNode;
		const previousColor = scenePass.getPreviousTextureNode( 'output' );
		const previousDepth = reprojection.previousDepthNode;
		const projectionMatrixInverse = reprojection.previousCameraProjectionMatrixInverse;

		const cameraNearFar = this._previousCameraNearFar;

		const size = vec2( textureSize( velocityNode ) ).toConst();
		const texel = ivec2( uvNode.mul( size ) ).toConst();
		const historyUV = reprojection.getHistoryUV( uvNode, texel ).add( this._jitterDelta ).toConst();
		const expectedZ = velocityNode.load( texel ).w.toConst();

		// the depth slope per pixel, taken from the flatter side so it does not cross silhouettes

		const flatter = ( a, b ) => a.abs().lessThan( b.abs() ).select( a, b );
		const neighborZ = ( x, y ) => velocityNode.load( texel.add( ivec2( x, y ) ) ).w;
		const slope = vec2(
			flatter( neighborZ( 1, 0 ).sub( expectedZ ), expectedZ.sub( neighborZ( - 1, 0 ) ) ),
			flatter( neighborZ( 0, 1 ).sub( expectedZ ), expectedZ.sub( neighborZ( 0, - 1 ) ) )
		).toConst();

		const pixel = historyUV.mul( size ).sub( 0.5 ).toConst();
		const base = pixel.floor();
		const fraction = pixel.fract();
		const valid = this._historyValid.and( expectedZ.lessThan( 0 ) )
			.and( historyUV.greaterThanEqual( 0 ).all() ).and( historyUV.lessThanEqual( 1 ).all() ).toConst();

		// allow a small pixel footprint for curved surfaces, plus half-float rounding

		const pixelDepth = projectionMatrixInverse.element( 1 ).y.abs().mul( expectedZ.abs() ).mul( 3 ).div( size.y );
		const tolerance = pixelDepth.max( expectedZ.abs().mul( 0.002 ) ).max( 0.001 ).toConst();
		const radiance = vec3( 0 ).toVar();
		const support = float( 0 ).toVar();

		// validate each bilinear tap so interpolation cannot pull color across an occlusion edge

		for ( let y = 0; y <= 1; y ++ ) {

			for ( let x = 0; x <= 1; x ++ ) {

				const tapUV = base.add( vec2( x, y ) ).add( 0.5 ).div( size ).toConst();
				const depth = previousDepth.sample( tapUV ).r.toConst();
				const viewZ = depthToViewZ( depth, cameraNearFar.x, cameraNearFar.y, scenePass.camera );
				const tapZ = expectedZ.add( slope.dot( vec2( x, y ).sub( fraction ) ) );
				const accepted = valid.and( isBackgroundDepth( depth ).not() ).and( viewZ.sub( tapZ ).abs().lessThanEqual( tolerance ) );
				const weightX = x === 0 ? fraction.x.oneMinus() : fraction.x;
				const weightY = y === 0 ? fraction.y.oneMinus() : fraction.y;
				const weight = weightX.mul( weightY ).mul( accepted ).toConst();

				radiance.addAssign( previousColor.sample( tapUV ).rgb.mul( weight ) );
				support.addAssign( weight );

			}

		}

		return vec4( radiance.div( support.max( 1e-6 ) ), support );

	}

}

export default ReprojectedBeautyNode;

/**
 * TSL function for creating a reprojected beauty node.
 *
 * @tsl
 * @function
 * @param {PassNode} scenePass - The scene pass. Its `velocity` MRT attachment must
 * hold {@link previousViewZ} in the alpha channel.
 * @returns {ReprojectedBeautyNode}
 */
export const reprojectedBeauty = ( scenePass ) => new ReprojectedBeautyNode( scenePass );
