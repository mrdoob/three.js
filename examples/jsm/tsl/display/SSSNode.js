import { RedFormat, RenderTarget, Vector2, RendererUtils, QuadMesh, TempNode, NodeMaterial, NodeUpdateType, UnsignedByteType } from 'three/webgpu';
import { reference, viewZToPerspectiveDepth, logarithmicDepthToViewZ, getScreenPosition, getViewPosition, float, Break, Loop, int, max, abs, If, interleavedGradientNoise, screenCoordinate, Fn, passTexture, uv, uniform, perspectiveDepthToViewZ, orthographicDepthToViewZ, vec2, lightPosition, lightTargetPosition, fract, rand, mix } from 'three/tsl';

const _quadMesh = /*@__PURE__*/ new QuadMesh();
const _size = /*@__PURE__*/ new Vector2();

const _spatialOffsets = [ 0, 0.5, 0.25, 0.75 ];

let _rendererState;

/**
 * Post processing node for applying Screen-Space Shadows (SSS) to a scene.
 *
 * Screen-Space Shadows (also known as Contact Shadows) should ideally be used to complement
 * traditional shadow maps. They are best suited for rendering detailed shadows of smaller
 * objects at a closer scale like intricate shadowing on highly detailed models. In other words:
 * Use Shadow Maps for the foundation and Screen-Space Shadows for the details.
 *
 * The shadows produced by this implementation might have too hard edges for certain use cases.
 * Use a box, gaussian or hash blur to soften the edges before doing the composite with the
 * beauty pass. Code example:
 *
 * ```js
 * const sssPass = sss( scenePassDepth, camera, mainLight );
 *
 * const sssBlur = boxBlur( sssPass.r, { size: 2, separation: 1 } ); // optional blur
 * ```
 *
 * Limitations:
 *
 * - Ideally the maximum shadow length should not exceed `1` meter. Otherwise the effect gets
 * computationally very expensive since more samples during the ray marching process are evaluated.
 * You can mitigate this issue by reducing the `quality` paramter.
 * - The effect can only be used with a single directional light, the main light of your scene.
 * This main light usually represents the sun or daylight.
 * - Like other Screen-Space techniques SSS can only honor objects in the shadowing computation that
 * are currently visible within the camera's view.
 *
 * References:
 * - {@link https://panoskarabelas.com/posts/screen_space_shadows/}.
 * - {@link https://www.bendstudio.com/blog/inside-bend-screen-space-shadows/}.
 *
 * @augments TempNode
 * @three_import import { sss } from 'three/addons/tsl/display/SSSNode.js';
 */
class SSSNode extends TempNode {

	static get type() {

		return 'SSSNode';

	}

	/**
	 * Constructs a new SSS node.
	 *
	 * @param {TextureNode} depthNode - A texture node that represents the scene's depth.
	 * @param {Camera} camera - The camera the scene is rendered with.
	 * @param {DirectionalLight} mainLight - The main directional light of the scene.
	 */
	constructor( depthNode, camera, mainLight ) {

		super( 'float' );

		/**
		 * A node that represents the beauty pass's depth.
		 *
		 * @type {TextureNode}
		 */
		this.depthNode = depthNode;

		/**
		 * Maximum shadow length in world units. Longer shadows result in more computational
		 * overhead.
		 *
		 * @type {UniformNode<float>}
		 * @default 0.1
		 */
		this.maxDistance = uniform( 0.1, 'float' );

		/**
		 * Depth testing thickness.
		 *
		 * @type {UniformNode<float>}
		 * @default 0.01
		 */
		this.thickness = uniform( 0.01, 'float' );

		/**
		 * Shadow intensity. Must be in the range `[0, 1]`.
		 *
		 * @type {UniformNode<float>}
		 * @default 1.0
		 */
		this.shadowIntensity = uniform( 1.0, 'float' );

		/**
		 * This parameter controls how detailed the raymarching process works.
		 * The value ranges is `[0,1]` where `1` means best quality (the maximum number
		 * of raymarching iterations/samples) and `0` means no samples at all.
		 *
		 * A quality of `0.5` is usually sufficient for most use cases. Try to keep
		 * this parameter as low as possible. Larger values result in noticeable more
		 * overhead.
		 *
		 * @type {UniformNode<float>}
		 * @default 0.5
		 */
		this.quality = uniform( 0.5 );

		/**
		 * The resolution scale. Valid values are in the range
		 * `[0,1]`. `1` means best quality but also results in
		 * more computational overhead. Setting to `0.5` means
		 * the effect is computed in half-resolution.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.resolutionScale = 1;

		/**
		 * Whether to use temporal filtering or not. Setting this property to
		 * `true` requires the usage of `TRAANode`. This will help to reduce noice
		 * although it introduces typical TAA artifacts like ghosting and temporal
		 * instabilities.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.useTemporalFiltering = false;

		/**
		 * The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node renders
		 * its effect once per frame in `updateBefore()`.
		 *
		 * @type {string}
		 * @default 'frame'
		 */
		this.updateBeforeType = NodeUpdateType.FRAME;

		// private uniforms

		/**
		 * Represents the view matrix of the scene's camera.
		 *
		 * @private
		 * @type {UniformNode<mat4>}
		 */
		this._cameraViewMatrix = uniform( camera.matrixWorldInverse );

		/**
		 * Represents the projection matrix of the scene's camera.
		 *
		 * @private
		 * @type {UniformNode<mat4>}
		 */
		this._cameraProjectionMatrix = uniform( camera.projectionMatrix );

		/**
		 * Represents the inverse projection matrix of the scene's camera.
		 *
		 * @private
		 * @type {UniformNode<mat4>}
		 */
		this._cameraProjectionMatrixInverse = uniform( camera.projectionMatrixInverse );

		/**
		 * Represents the near value of the scene's camera.
		 *
		 * @private
		 * @type {ReferenceNode<float>}
		 */
		this._cameraNear = reference( 'near', 'float', camera );

		/**
		 * Represents the far value of the scene's camera.
		 *
		 * @private
		 * @type {ReferenceNode<float>}
		 */
		this._cameraFar = reference( 'far', 'float', camera );

		/**
		 * The resolution of the pass.
		 *
		 * @private
		 * @type {UniformNode<vec2>}
		 */
		this._resolution = uniform( new Vector2() );

		/**
		 * Temporal offset added to the initial ray step.
		 *
		 * @private
		 * @type {UniformNode<float>}
		 */
		this._temporalOffset = uniform( 0 );

		/**
		 * The frame ID use when temporal filtering is enabled.
		 *
		 * @private
		 * @type {UniformNode<uint>}
		 */
		this._frameId = uniform( 0 );

		/**
		 * A reference to the scene's main light.
		 *
		 * @private
		 * @type {DirectionalLight}
		 */
		this._mainLight = mainLight;

		/**
		 * The camera the scene is rendered with.
		 *
		 * @private
		 * @type {Camera}
		 */
		this._camera = camera;

		/**
		 * The render target the SSS is rendered into.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._sssRenderTarget = new RenderTarget( 1, 1, { depthBuffer: false, format: RedFormat, type: UnsignedByteType } );
		this._sssRenderTarget.texture.name = 'SSS';

		/**
		 * The material that is used to render the effect.
		 *
		 * @private
		 * @type {NodeMaterial}
		 */
		this._material = new NodeMaterial();
		this._material.name = 'SSS';

		/**
		 * The result of the effect is represented as a separate texture node.
		 *
		 * @private
		 * @type {PassTextureNode}
		 */
		this._textureNode = passTexture( this, this._sssRenderTarget.texture );


	}

	/**
	 * Returns the result of the effect as a texture node.
	 *
	 * @return {PassTextureNode} A texture node that represents the result of the effect.
	 */
	getTextureNode() {

		return this._textureNode;

	}

	/**
	 * Sets the size of the effect.
	 *
	 * @param {number} width - The width of the effect.
	 * @param {number} height - The height of the effect.
	 */
	setSize( width, height ) {

		width = Math.round( this.resolutionScale * width );
		height = Math.round( this.resolutionScale * height );

		this._resolution.value.set( width, height );
		this._sssRenderTarget.setSize( width, height );

	}

	/**
	 * This method is used to render the effect once per frame.
	 *
	 * @param {NodeFrame} frame - The current node frame.
	 */
	updateBefore( frame ) {

		const { renderer } = frame;

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		//

		const size = renderer.getDrawingBufferSize( _size );
		this.setSize( size.width, size.height );

		// update temporal uniforms

		if ( this.useTemporalFiltering === true ) {

			const frameId = frame.frameId;

			this._temporalOffset.value = _spatialOffsets[ frameId % 4 ];
			this._frameId = frame.frameId;

		} else {

			this._temporalOffset.value = 0;
			this._frameId = 0;

		}

		//

		_quadMesh.material = this._material;
		_quadMesh.name = 'SSS';

		// clear

		renderer.setClearColor( 0xffffff, 1 );

		// sss

		renderer.setRenderTarget( this._sssRenderTarget );
		_quadMesh.render( renderer );

		// restore

		RendererUtils.restoreRendererState( renderer, _rendererState );

	}

	/**
	 * This method is used to setup the effect's TSL code.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {PassTextureNode}
	 */
	setup( builder ) {

		const uvNode = uv();

		const getViewZ = Fn( ( [ depth ] ) => {

			let viewZNode;

			if ( this._camera.isPerspectiveCamera ) {

				viewZNode = perspectiveDepthToViewZ( depth, this._cameraNear, this._cameraFar );

			} else {

				viewZNode = orthographicDepthToViewZ( depth, this._cameraNear, this._cameraFar );

			}

			return viewZNode;

		} );

		const sampleDepth = ( uv ) => {

			const depth = this.depthNode.sample( uv ).r;

			if ( builder.renderer.logarithmicDepthBuffer === true ) {

				const viewZ = logarithmicDepthToViewZ( depth, this._cameraNear, this._cameraFar );

				return viewZToPerspectiveDepth( viewZ, this._cameraNear, this._cameraFar );

			}

			return depth;

		};

		const sss = Fn( () => {

			const depth = sampleDepth( uvNode ).toVar();
			depth.greaterThanEqual( 1.0 ).discard();

			// compute ray position and direction (in view-space)

			const rayStartPosition = getViewPosition( uvNode, depth, this._cameraProjectionMatrixInverse ).toVar( 'rayStartPosition' );
			const rayDirection = this._cameraViewMatrix.transformDirection( lightPosition( this._mainLight ).sub( lightTargetPosition( this._mainLight ) ) ).toConst( 'rayDirection' );
			const rayEndPosition = rayStartPosition.add( rayDirection.mul( this.maxDistance ) ).toConst( 'rayEndPosition' );

			// d0 and d1 are the start and maximum points of the ray in screen space
			const d0 = screenCoordinate.xy.toVar();
			const d1 = getScreenPosition( rayEndPosition, this._cameraProjectionMatrix ).mul( this._resolution ).toVar();

			// below variables are used to control the raymarching process

			// total length of the ray
			const totalLen = d1.sub( d0 ).length().toVar();

			// offset in x and y direction
			const xLen = d1.x.sub( d0.x ).toVar();
			const yLen = d1.y.sub( d0.y ).toVar();

			// determine the larger delta
			// The larger difference will help to determine how much to travel in the X and Y direction each iteration and
			// how many iterations are needed to travel the entire ray
			const totalStep = int( max( abs( xLen ), abs( yLen ) ).mul( this.quality.clamp() ) ).toConst();

			// step sizes in the x and y directions
			const xSpan = xLen.div( totalStep ).toVar();
			const ySpan = yLen.div( totalStep ).toVar();

			// compute noise based ray offset
			const noise = interleavedGradientNoise( screenCoordinate );
			const offset = fract( noise.add( this._temporalOffset ) ).add( rand( uvNode.add( this._frameId ) ) ).toConst( 'offset' );

			const occlusion = float( 0 ).toVar();

			Loop( totalStep, ( { i } ) => {

				// advance on the ray by computing a new position in screen coordinates
				const xy = vec2( d0.x.add( xSpan.mul( float( i ).add( offset ) ) ), d0.y.add( ySpan.mul( float( i ).add( offset ) ) ) ).toVar();

				// stop processing if the new position lies outside of the screen
				If( xy.x.lessThan( 0 ).or( xy.x.greaterThan( this._resolution.x ) ).or( xy.y.lessThan( 0 ) ).or( xy.y.greaterThan( this._resolution.y ) ), () => {

					Break();

				} );

				// compute new uv, depth and viewZ for the next fragment

				const uvNode = xy.div( this._resolution );
				const fragmentDepth = sampleDepth( uvNode ).toConst();
				const fragmentViewZ = getViewZ( fragmentDepth ).toConst( 'fragmentViewZ' );

				const s = xy.sub( d0 ).length().div( totalLen ).toVar();
				const rayPosition = mix( rayStartPosition, rayEndPosition, s );

				const depthDelta = rayPosition.z.sub( fragmentViewZ ).negate(); // Port note: viewZ values are negative in three

				// check if the camera can't "see" the ray (ray depth must be larger than the camera depth, so positive depth_delta)

				If( depthDelta.greaterThan( 0 ).and( depthDelta.lessThan( this.thickness ) ), () => {

					// mark as occluded

					occlusion.assign( this.shadowIntensity );

					Break();

				} );


			} );

			return occlusion.oneMinus();

		} );

		this._material.fragmentNode = sss().context( builder.getSharedContext() );
		this._material.needsUpdate = true;

		return this._textureNode;

	}

	/**
	 * Frees internal resources. This method should be called
	 * when the effect is no longer required.
	 */
	dispose() {

		this._sssRenderTarget.dispose();

		this._material.dispose();

	}

}

export default SSSNode;

/**
 * TSL function for creating a SSS effect.
 *
 * @tsl
 * @function
 * @param {TextureNode} depthNode - A texture node that represents the scene's depth.
 * @param {Camera} camera - The camera the scene is rendered with.
 * @param {DirectionalLight} mainLight - The main directional light of the scene.
 * @returns {SSSNode}
 */
export const sss = ( depthNode, camera, mainLight ) => new SSSNode( depthNode, camera, mainLight );
