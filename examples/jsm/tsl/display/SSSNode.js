import { RedFormat, RenderTarget, Vector2, RendererUtils, QuadMesh, Node, NodeMaterial, NodeUpdateType, UnsignedByteType } from 'three/webgpu';
import { reference, getViewPosition, float, If, Fn, passTexture, uv, uniform, depthToViewZ, lightPosition, lightTargetPosition, mix, context, isBackgroundDepth, projectionDepth, getNormalFromDepth, sample, vec3 } from 'three/tsl';
import { LinearTracer, getRayPosition } from '../utils/traceLinear.js';

const _quadMesh = /*@__PURE__*/ new QuadMesh();
const _size = /*@__PURE__*/ new Vector2();

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
 * You can mitigate this issue by reducing the `quality` of the tracer.
 * - The effect can only be used with a single directional light, the main light of your scene.
 * This main light usually represents the sun or daylight.
 * - Like other Screen-Space techniques SSS can only honor objects in the shadowing computation that
 * are currently visible within the camera's view.
 *
 * References:
 * - {@link https://panoskarabelas.com/blog/posts/screen_space_shadows/}.
 * - {@link https://www.bendstudio.com/blog/inside-bend-screen-space-shadows/}.
 *
 * @augments Node
 * @three_import import { sss } from 'three/addons/tsl/display/SSSNode.js';
 */
class SSSNode extends Node {

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
		 * Returns the scene's unit normal in view space when sampled at a uv. Reconstructs it from the depth by default.
		 *
		 * @type {Node<vec3>}
		 */
		this.normalNode = sample( ( uv ) => getNormalFromDepth( uv, this.depthNode.value, this._cameraProjectionMatrixInverse ) );

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
		 * Traces the shadow rays through the depth.
		 *
		 * @type {LinearTracer}
		 */
		this.tracer = new LinearTracer();

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

		this.tracer.update( frame );

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		//

		const size = renderer.getDrawingBufferSize( _size );
		this.setSize( size.width, size.height );

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

		const sampleDepth = ( uv ) => projectionDepth( this.depthNode.sample( uv ).r, this._cameraNear, this._cameraFar );

		const sss = Fn( () => {

			const depth = sampleDepth( uvNode ).toVar();
			isBackgroundDepth( depth ).discard();

			// compute ray position and direction (in view-space)

			const rayStartPosition = getViewPosition( uvNode, depth, this._cameraProjectionMatrixInverse ).toVar( 'rayStartPosition' );
			const rayDirection = this._cameraViewMatrix.transformDirection( lightPosition( this._mainLight ).sub( lightTargetPosition( this._mainLight ) ) ).toConst( 'rayDirection' );
			const rayEndPosition = rayStartPosition.add( rayDirection.mul( this.maxDistance ) ).toVar( 'rayEndPosition' );

			// the ray ends at the near plane

			If( rayEndPosition.z.greaterThan( this._cameraNear.negate() ), () => {

				const t = this._cameraNear.negate().sub( rayStartPosition.z ).div( rayDirection.z ).mul( 0.999 );

				rayEndPosition.assign( rayStartPosition.add( rayDirection.mul( t ) ) );

			} );

			// the viewZ of the ray, its parameter is linear in screen space

			const rayZ = this._camera.isPerspectiveCamera === true
				? ( s ) => mix( rayStartPosition.z.reciprocal(), rayEndPosition.z.reciprocal(), s ).reciprocal()
				: ( s ) => mix( rayStartPosition.z, rayEndPosition.z, s );

			// an occluder is above the plane of the receiver by more than a pixel, otherwise a surface at a grazing
			// angle shadows itself: the depth of a pixel is constant, while its surface spans a range of depths

			const normal = this.normalNode.sample( uvNode ).toVar();
			const facing = normal.dot( rayStartPosition ).lessThan( 0 ).select( normal, normal.negate() ).toConst();
			const pixelSize = float( 2 ).div( this._cameraProjectionMatrix.element( 1 ).element( 1 ).mul( this._resolution.y ) );

			const occludes = ( uv, raw ) => {

				const position = getViewPosition( uv, projectionDepth( raw, this._cameraNear, this._cameraFar ), this._cameraProjectionMatrixInverse ).toConst();
				const bias = this._camera.isPerspectiveCamera === true ? pixelSize.mul( position.z.negate() ) : pixelSize;

				return position.sub( rayStartPosition ).dot( facing ).greaterThan( bias );

			};

			// the ray in uv and projected depth

			const near = this._cameraNear;
			const far = this._cameraFar;
			const reversed = builder.renderer.reversedDepthBuffer === true;

			const origin = vec3( uvNode, depth ).toConst();
			const end = getRayPosition( rayEndPosition, this._cameraProjectionMatrix ).toConst();

			// the distance of the ray behind a surface, an occluder is at most `thickness` in front of the ray

			const behind = ( s, raw ) => depthToViewZ( raw, near, far, this._camera ).sub( rayZ( s ) );

			// a surface facing away from the light shadows itself, no ray is traced

			const value = this.shadowIntensity.oneMinus().toVar();

			If( facing.dot( rayDirection ).greaterThan( 0 ), () => {

				const result = this.tracer.trace( this.depthNode, origin, end, {
					resolution: this._resolution,
					reversedDepth: reversed,
					projectDepth: ( raw ) => projectionDepth( raw, near, far ),
					acceptHit: ( uv, s, raw ) => behind( s, raw ).lessThan( this.thickness ).and( occludes( uv, raw ) )
				} );

				value.assign( result.hit.select( this.shadowIntensity.oneMinus(), 1 ) );

			} );

			return value;

		} );

		this._material.contextNode = context( builder.getSharedContext() );
		this._material.fragmentNode = sss();
		this._material.needsUpdate = true;

		return this._textureNode;

	}

	/**
	 * Frees internal resources. This method should be called
	 * when the effect is no longer required.
	 */
	dispose() {

		super.dispose();

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
