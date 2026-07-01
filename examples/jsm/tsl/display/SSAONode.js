import { RenderTarget, Vector2, TempNode, QuadMesh, NodeMaterial, RendererUtils, RedFormat } from 'three/webgpu';
import { reference, logarithmicDepthToViewZ, viewZToPerspectiveDepth, getViewPosition, getScreenPositionFromClip, vogelDiskSample, interleavedGradientNoise, nodeObject, Fn, float, NodeUpdateType, uv, uniform, Loop, vec4, int, dot, max, clamp, length, screenCoordinate, PI2, texture, passTexture } from 'three/tsl';
import { depthAwareBlur } from './depthAwareBlur.js';

const _quadMesh = /*@__PURE__*/ new QuadMesh();
const _size = /*@__PURE__*/ new Vector2();

let _rendererState;

/**
 * Post processing node for a fast, screen-space ambient occlusion (SSAO).
 *
 * It point-samples a per-pixel rotated Vogel disk and estimates obscurance with a single depth tap
 * per sample, trading the ground-truth accuracy of {@link GTAONode}'s horizon ray-marching for
 * lower cost. A built-in separable, depth-aware blur denoises the result so it can be used without
 * temporal accumulation.
 * ```js
 * const scenePass = pass( scene, camera );
 * scenePass.setMRT( mrt( { output, normal: normalView } ) );
 * const scenePassColor = scenePass.getTextureNode( 'output' );
 * const scenePassDepth = scenePass.getTextureNode( 'depth' );
 * const scenePassNormal = scenePass.getTextureNode( 'normal' );
 *
 * const aoPass = ssao( scenePassDepth, scenePassNormal, camera );
 *
 * renderPipeline.outputNode = scenePassColor.mul( aoPass.r );
 * ```
 *
 * @augments TempNode
 * @three_import import { ssao } from 'three/addons/tsl/display/SSAONode.js';
 */
class SSAONode extends TempNode {

	static get type() {

		return 'SSAONode';

	}

	/**
	 * Constructs a new SSAO node.
	 *
	 * @param {Node<float>} depthNode - A node that represents the scene's depth.
	 * @param {Node<vec3>} normalNode - A node that represents the scene's normals.
	 * @param {Camera} camera - The camera the scene is rendered with.
	 */
	constructor( depthNode, normalNode, camera ) {

		super( 'float' );

		/**
		 * A node that represents the scene's depth.
		 *
		 * @type {Node<float>}
		 */
		this.depthNode = depthNode;

		/**
		 * A node that represents the scene's normals.
		 *
		 * @type {Node<vec3>}
		 */
		this.normalNode = normalNode;

		/**
		 * The resolution scale. The effect renders at a fraction of the drawing buffer
		 * for extra speed; `0.5` is a good default for a low-frequency signal like AO.
		 *
		 * @type {number}
		 * @default 0.5
		 */
		this.resolutionScale = 0.5;

		/**
		 * The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node renders
		 * its effect once per frame in `updateBefore()`.
		 *
		 * @type {string}
		 * @default 'frame'
		 */
		this.updateBeforeType = NodeUpdateType.FRAME;

		/**
		 * The world-space radius the occlusion is gathered within.
		 *
		 * @type {UniformNode<float>}
		 */
		this.radius = uniform( 0.5 );

		/**
		 * The strength of the occlusion.
		 *
		 * @type {UniformNode<float>}
		 */
		this.intensity = uniform( 1 );

		/**
		 * An angle bias that suppresses self-occlusion on near-flat surfaces.
		 *
		 * @type {UniformNode<float>}
		 */
		this.bias = uniform( 0.025 );

		/**
		 * How many samples are used to estimate the occlusion. A higher value
		 * results in a smoother result at a higher runtime cost.
		 *
		 * @type {UniformNode<float>}
		 */
		this.samples = uniform( 16 );

		/**
		 * Whether the depth-aware blur that denoises the raw AO is applied or not.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.blurEnabled = true;

		/**
		 * How strongly the blur rejects samples across depth discontinuities,
		 * relative to the AO radius. A higher value keeps edges crisper.
		 *
		 * @type {UniformNode<float>}
		 */
		this.blurSharpness = uniform( 2 );

		/**
		 * The resolution of the effect. Set from the drawing buffer size and `resolutionScale`.
		 *
		 * @type {Vector2}
		 */
		this.resolution = new Vector2();

		/**
		 * The render target the raw ambient occlusion is rendered into. Also holds the
		 * final result after the separable blur has ping-ponged back into it.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._aoRenderTarget = new RenderTarget( 1, 1, { depthBuffer: false, format: RedFormat } );
		this._aoRenderTarget.texture.name = 'SSAONode.AO';

		/**
		 * The render target the intermediate (horizontally blurred) result is rendered into.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._blurRenderTarget = new RenderTarget( 1, 1, { depthBuffer: false, format: RedFormat } );
		this._blurRenderTarget.texture.name = 'SSAONode.Blur';

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
		 * The camera the scene is rendered with.
		 *
		 * @private
		 * @type {Camera}
		 */
		this._camera = camera;

		/**
		 * The input texture the blur material reads from. Swapped between the two render
		 * targets to run the horizontal and vertical passes with a single material.
		 *
		 * @private
		 * @type {TextureNode}
		 */
		this._blurInput = texture( this._aoRenderTarget.texture );

		/**
		 * The blur direction (one texel along x or y).
		 *
		 * @private
		 * @type {UniformNode<vec2>}
		 */
		this._blurDirection = uniform( new Vector2() );

		/**
		 * The material that computes the raw ambient occlusion.
		 *
		 * @private
		 * @type {NodeMaterial}
		 */
		this._aoMaterial = new NodeMaterial();
		this._aoMaterial.name = 'SSAO.AO';

		/**
		 * The material that applies the separable, depth-aware blur.
		 *
		 * @private
		 * @type {NodeMaterial}
		 */
		this._blurMaterial = new NodeMaterial();
		this._blurMaterial.name = 'SSAO.Blur';

		/**
		 * The result of the effect is represented as a separate texture node.
		 *
		 * @private
		 * @type {PassTextureNode}
		 */
		this._textureNode = passTexture( this, this._aoRenderTarget.texture );

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

		width = Math.max( 1, Math.round( this.resolutionScale * width ) );
		height = Math.max( 1, Math.round( this.resolutionScale * height ) );

		this.resolution.set( width, height );
		this._aoRenderTarget.setSize( width, height );
		this._blurRenderTarget.setSize( width, height );

	}

	/**
	 * This method is used to render the effect once per frame.
	 *
	 * @param {NodeFrame} frame - The current node frame.
	 */
	updateBefore( frame ) {

		const { renderer } = frame;

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		const size = renderer.getDrawingBufferSize( _size );
		this.setSize( size.width, size.height );

		renderer.setClearColor( 0xffffff, 1 );

		// ambient occlusion

		_quadMesh.material = this._aoMaterial;
		_quadMesh.name = 'SSAO.AO';
		renderer.setRenderTarget( this._aoRenderTarget );
		_quadMesh.render( renderer );

		// separable, depth-aware blur: horizontal ( AO -> blur ) then vertical ( blur -> AO )

		if ( this.blurEnabled === true ) {

			_quadMesh.material = this._blurMaterial;
			_quadMesh.name = 'SSAO.Blur';

			this._blurInput.value = this._aoRenderTarget.texture;
			this._blurDirection.value.set( 1 / this.resolution.x, 0 );
			renderer.setRenderTarget( this._blurRenderTarget );
			_quadMesh.render( renderer );

			this._blurInput.value = this._blurRenderTarget.texture;
			this._blurDirection.value.set( 0, 1 / this.resolution.y );
			renderer.setRenderTarget( this._aoRenderTarget );
			_quadMesh.render( renderer );

		}

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

		const sampleDepth = ( uv ) => {

			const depth = this.depthNode.sample( uv ).r;

			if ( builder.renderer.logarithmicDepthBuffer === true ) {

				const viewZ = logarithmicDepthToViewZ( depth, this._cameraNear, this._cameraFar );

				return viewZToPerspectiveDepth( viewZ, this._cameraNear, this._cameraFar );

			}

			return depth;

		};

		// ambient occlusion

		const ao = Fn( () => {

			const depth = sampleDepth( uvNode ).toVar();

			depth.greaterThanEqual( 1.0 ).discard();

			const viewPosition = getViewPosition( uvNode, depth, this._cameraProjectionMatrixInverse ).toVar();
			const viewNormal = this.normalNode.sample( uvNode ).rgb.normalize().toVar();

			// a low-discrepancy Vogel disk rotated per-pixel decorrelates the samples spatially,
			// so a small blur is enough to hide the sampling pattern

			const phi = interleavedGradientNoise( screenCoordinate ).mul( PI2 ).toVar();
			const samples = this.samples;

			// the fragment's clip position is loop-invariant; projection is linear, so each
			// sample only has to project its (view-plane) offset and add it

			const clipPosition = this._cameraProjectionMatrix.mul( vec4( viewPosition, 1.0 ) ).toVar();

			const occlusion = float( 0 ).toVar();

			Loop( { start: int( 0 ), end: samples, type: 'int', condition: '<' }, ( { i } ) => {

				// disk offset in the view-aligned plane at the fragment's depth, then reprojected

				const offset = vogelDiskSample( i, samples, phi ).mul( this.radius );
				const clipOffset = this._cameraProjectionMatrix.mul( vec4( offset, 0.0, 0.0 ) );
				const sampleUv = getScreenPositionFromClip( clipPosition.add( clipOffset ) );

				const sampleViewPosition = getViewPosition( sampleUv, sampleDepth( sampleUv ), this._cameraProjectionMatrixInverse );

				// normalized obscurance: only occluders above the tangent plane count, faded by distance

				const v = sampleViewPosition.sub( viewPosition ).toVar();
				const dist = length( v ).toVar();
				const cosAngle = dot( v, viewNormal ).div( max( dist, float( 0.0001 ) ) );
				const falloff = this.radius.div( this.radius.add( dist ) );

				occlusion.addAssign( max( cosAngle.sub( this.bias ), 0.0 ).mul( falloff ) );

			} );

			return clamp( occlusion.div( samples ).mul( this.intensity ).oneMinus(), 0.0, 1.0 );

		} );

		this._aoMaterial.fragmentNode = ao().context( builder.getSharedContext() );
		this._aoMaterial.needsUpdate = true;

		// separable, depth-aware blur ( run horizontally then vertically via `_blurDirection` )

		this._blurMaterial.fragmentNode = depthAwareBlur( this._blurInput, this.depthNode, this._blurDirection, this._camera, this.blurSharpness, this.radius ).context( builder.getSharedContext() );
		this._blurMaterial.needsUpdate = true;

		return this._textureNode;

	}

	/**
	 * Frees internal resources. This method should be called
	 * when the effect is no longer required.
	 */
	dispose() {

		this._aoRenderTarget.dispose();
		this._blurRenderTarget.dispose();

		this._aoMaterial.dispose();
		this._blurMaterial.dispose();

	}

}

export default SSAONode;

/**
 * TSL function for creating a fast screen-space ambient occlusion (SSAO) effect.
 *
 * @tsl
 * @function
 * @param {Node<float>} depthNode - A node that represents the scene's depth.
 * @param {Node<vec3>} normalNode - A node that represents the scene's normals.
 * @param {Camera} camera - The camera the scene is rendered with.
 * @returns {SSAONode}
 */
export const ssao = ( depthNode, normalNode, camera ) => new SSAONode( nodeObject( depthNode ), nodeObject( normalNode ), camera );
