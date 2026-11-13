import { FloatType, HalfFloatType, Matrix4, Node, NodeMaterial, NodeUpdateType, QuadMesh, RendererUtils, RenderTarget, RGFormat, Vector2 } from 'three/webgpu';
import { Fn, If, Loop, abs, atan, convertToTexture, dot, exp, float, floor, getNormalFromDepth, getViewPosition, isBackgroundDepth, ivec2, length, luminance, max, min, mix, nodeObject, outputStruct, passTexture, pow, screenCoordinate, sqrt, struct, texture, textureSize, uniform, vec2, vec3, vec4 } from 'three/tsl';

const _quadMesh = /*@__PURE__*/ new QuadMesh();

let _rendererState;

// the frames after which the temporal variance of a pixel is trusted over its spatial estimate ( SVGF )
const HISTORY_FIX = 4;

// the length of the fast history of the color anti-lag ( ReLAX )
const FAST_FRAMES = 4;

// the distance to the tangent plane, relative to the view depth, beyond which a history texel is another surface
const PLANE_TOLERANCE = 0.02;

// specular: how fast the weight of a neighbor falls with its difference of roughness and of hit distance factor
const ROUGHNESS_PHI = 20;
const HIT_DISTANCE_PHI = 8;

/**
 * Denoises the noisy output of a screen-space effect, e.g. AO, GI or reflections, or a texture, e.g. a light map,
 * with the edge-aware à-trous wavelet filter of SVGF. In screen space, `temporalDenoise()` also accumulates the input
 * in time. In texture space, the filter is guided by textures of the world-space position and normal.
 *
 * SVGF delivers high quality but is designed for desktop-class hardware and its cost can be very noticeable on mobile
 * devices. Performance-restricted use cases should avoid per-frame denoising with this node and rely on the basic
 * denoising of TAA instead, see {@link TRAANode}. {@link BilateralBlurNode} is a performant alternative as well. Both
 * come at the cost of lower denoise quality.
 *
 * The noise of the input should be independent between neighboring pixels. Samples that are correlated across pixels,
 * e.g. one sequence shifted by a smooth function of the pixel coordinates, leave structure such as bands that neither
 * the accumulation in time nor the edge-aware filter removes. A low-discrepancy sequence in time, rotated by a random
 * or stratified offset per pixel ( Cranley-Patterson rotation ), works well.
 *
 * ```js
 * // SSGI, accumulated in time before TRAA: GI in rgb and AO in alpha
 * const denoised = temporalDenoise( vec4( giPass.getGINode().rgb, giPass.getAONode().r ), { depth, normal, camera, velocity, alpha: true } );
 *
 * // SSR: lobe-aware, with the roughness and the hit distance of each pixel
 * const denoised = temporalDenoise( ssrPass, { depth, normal, camera, velocity, roughness, hitDistance } );
 *
 * // SSR with coverage in alpha: texels without coverage do not darken the radiance
 * const denoised = temporalDenoise( reflections, { depth, normal, camera, velocity, coverage: true } );
 *
 * // a light map, filtered once when the bake is done
 * const denoiseNode = denoise( lightMapper.getTextureNode( 'color' ), {
 * 	position: lightMapper.getTextureNode( 'position' ),
 * 	normal: lightMapper.getTextureNode( 'normal' ),
 * 	variance: lightMapper.getTextureNode( 'variance' ),
 * 	quality: 'quality'
 * } );
 * denoiseNode.autoUpdate = false;
 * material.lightMapNode = denoiseNode;
 * ```
 *
 * References:
 * - {@link https://research.nvidia.com/publication/2017-07_spatiotemporal-variance-guided-filtering-real-time-reconstruction-path-traced}
 * - {@link https://github.com/NVIDIA-RTX/NRD}
 *
 * @augments Node
 * @three_import import { denoise, temporalDenoise } from 'three/addons/tsl/display/DenoiseNode.js';
 */
class DenoiseNode extends Node {

	static get type() {

		return 'DenoiseNode';

	}

	/**
	 * Constructs a new denoise node.
	 *
	 * @param {TextureNode} inputNode - The noisy input.
	 * @param {Object} [options={}] - The guides and options.
	 * @param {?TextureNode} [options.depth=null] - Screen space: the depth of the scene.
	 * @param {?Node<vec3>} [options.normal=null] - Screen space: the view-space normals of the scene, a node with `sample( uv )`, else they are reconstructed from the depth. Texture space: the world-space normal of each texel.
	 * @param {?Camera} [options.camera=null] - Screen space: the camera the scene is rendered with.
	 * @param {?TextureNode} [options.position=null] - Texture space: the world-space position of each texel, with the id of its surface in alpha, 0 without a surface.
	 * @param {?TextureNode} [options.variance=null] - Texture space: the variance of the luminance of each texel in red, negative without data.
	 * @param {?Node<vec2>} [options.velocity=null] - Screen space, temporal: the velocity of the scene.
	 * @param {?Node<float>} [options.roughness=null] - Screen space, reflections: the roughness of the scene, a node with `sample( uv )`.
	 * @param {?Node<float>} [options.hitDistance=null] - Screen space, reflections: the hit distance of each pixel of the input, a node with `sample( uv )`, with `roughness`.
	 * @param {boolean} [options.alpha=false] - Screen space: whether alpha is a second signal to filter, e.g. AO next to GI.
	 * @param {boolean} [options.coverage=false] - Screen space: whether the input is radiance with its coverage in alpha.
	 * @param {boolean} [options.temporal=false] - Screen space: whether to accumulate the input in time, see `temporalDenoise()`.
	 * @param {('fast'|'quality')} [options.quality='fast'] - The preset of the filter.
	 */
	constructor( inputNode, options = {} ) {

		super( 'vec4' );

		const {
			depth = null, normal = null, camera = null, position = null, variance = null, velocity = null,
			roughness = null, hitDistance = null, alpha = false, coverage = false, temporal = false, quality = 'fast'
		} = options;

		const screenSpace = position === null;

		if ( screenSpace && ( depth === null || camera === null || variance !== null ) ) throw new Error( 'THREE.DenoiseNode: Screen space needs depth and camera, and supports no variance.' );
		if ( ! screenSpace && ( normal === null || alpha || coverage || temporal ) ) throw new Error( 'THREE.DenoiseNode: Texture space needs normals, and supports neither alpha, coverage nor temporal.' );
		if ( temporal && velocity === null ) throw new Error( 'THREE.DenoiseNode: Temporal needs velocity.' );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isDenoiseNode = true;

		/**
		 * The noisy input.
		 *
		 * @type {TextureNode}
		 */
		this.inputNode = inputNode;

		/**
		 * Screen space: the depth of the scene.
		 *
		 * @type {?TextureNode}
		 */
		this.depthNode = depth;

		/**
		 * The view-space normals of the scene in screen space, the world-space normal of each texel in texture space.
		 *
		 * @type {?Node<vec3>}
		 */
		this.normalNode = normal;

		/**
		 * Screen space: the camera the scene is rendered with.
		 *
		 * @type {?Camera}
		 */
		this.camera = camera;

		/**
		 * Texture space: the world-space position of each texel, with the id of its surface in alpha.
		 *
		 * @type {?TextureNode}
		 */
		this.positionNode = position;

		/**
		 * Texture space: the variance of the luminance of each texel in red, negative without data.
		 *
		 * @type {?TextureNode}
		 */
		this.varianceNode = variance;

		/**
		 * Screen space, temporal: the velocity of the scene.
		 *
		 * @type {?Node<vec2>}
		 */
		this.velocityNode = velocity;

		/**
		 * Screen space, reflections: the roughness of the scene.
		 *
		 * @type {?Node<float>}
		 */
		this.roughnessNode = roughness;

		/**
		 * Screen space, reflections: the hit distance of each pixel of the input.
		 *
		 * @type {?Node<float>}
		 */
		this.hitDistanceNode = hitDistance;

		/**
		 * Whether alpha is a second signal to filter, e.g. AO next to GI. Otherwise the alpha of the output is 1, or with
		 * `temporal` the weight of the current frame in the history, `1 / history length`, which damps the feedback of
		 * multi-bounce reflections where the history is short, see {@link SSRNode#setHistory}.
		 *
		 * @type {boolean}
		 * @readonly
		 */
		this.alpha = alpha || coverage;

		/**
		 * Whether the input is radiance with its coverage in alpha: the node filters the radiance weighted by
		 * coverage, so that texels without coverage do not darken it, and returns the radiance with the filtered
		 * coverage in alpha.
		 *
		 * @type {boolean}
		 * @readonly
		 */
		this.coverage = coverage;

		/**
		 * Whether the node accumulates the input in time.
		 *
		 * @type {boolean}
		 * @readonly
		 */
		this.temporal = temporal;

		/**
		 * The preset of the filter, `'fast'` or `'quality'`.
		 *
		 * @type {('fast'|'quality')}
		 * @readonly
		 */
		this.quality = quality;

		/**
		 * The number of filter passes. The filter spans `3^iterations` texels with the `'fast'` preset, and
		 * `2^(iterations + 1) - 1` texels with the `'quality'` preset.
		 *
		 * @type {number}
		 * @default 2
		 */
		this.iterations = quality === 'fast' ? 2 : ( screenSpace ? 3 : 4 );

		/**
		 * How many standard deviations of the noise luminance differences may span before texels stop being
		 * averaged. Higher values remove more noise and blur more detail.
		 *
		 * @type {UniformNode<float>}
		 */
		this.luminancePhi = uniform( 3 );

		/**
		 * The exponent of the normal similarity weight.
		 *
		 * @type {UniformNode<float>}
		 */
		this.normalPhi = uniform( 64 );

		/**
		 * The sine of the angle to the tangent plane at which neighbors lose most of their weight.
		 *
		 * @type {UniformNode<float>}
		 */
		this.planePhi = uniform( 0.2 );

		/**
		 * Texture space without a variance: the relative noise of the texels, the standard deviation of their
		 * luminance over their luminance.
		 *
		 * @type {UniformNode<float>}
		 */
		this.relativeNoise = uniform( 0.05 );

		/**
		 * Temporal: the maximum length of the history in frames. Longer histories have less noise and more lag.
		 *
		 * @type {UniformNode<float>}
		 */
		this.maxFrames = uniform( 8 );

		/**
		 * Whether the node filters every frame in which it is used. Otherwise it filters once when
		 * {@link DenoiseNode#textureNeedsUpdate} is set, e.g. when a light map is baked.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.autoUpdate = true;

		/**
		 * Whether the node filters in the next frame in which it is used, also when `autoUpdate` is off.
		 * It is reset once the node has filtered.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.textureNeedsUpdate = true;

		/**
		 * The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node filters once per frame in
		 * `updateBefore()`.
		 *
		 * @type {string}
		 * @default 'frame'
		 */
		this.updateBeforeType = NodeUpdateType.FRAME;

		// screen space, reflections: the filter follows the footprint of the reflection lobe

		this._specular = hitDistance !== null && roughness !== null;

		// fast and temporal: the first filter pass reads the history, without a prepare pass

		this._direct = quality === 'fast' && temporal;

		// the render targets: the filter passes ping-pong the value with the standard deviation of its noise in alpha,
		// or -1 for texels without data, and with alpha the second signal with its standard deviation. In screen space,
		// the guides are a compact copy of the G-buffer at the resolution of the input: the view depth ( 0 for the
		// background ) with the surface id * 256 + the history length, and the octahedral view normal, with the
		// roughness and the hit distance factor h / ( h + d ) for reflections

		const values = this.alpha ? [ 'value', 'alpha' ] : [ 'value' ];
		const guides = [ 'depth', this.roughnessNode !== null ? 'normalSpecular' : 'normal' ];

		this._targets = [ createTarget( values ), createTarget( values ) ];

		if ( screenSpace ) {

			// the output, and the input of the filter where it is not the history

			this._renderTarget = createTarget( [ 'output' ] );
			this._prepareTarget = ( temporal === false || ( this.alpha && ! this._direct ) ) ? createTarget( temporal ? values : [ ...values, ...guides ] ) : null;

			// the history ( color, and the fast history of the color with the temporal variance of the luminance ) and
			// the guides of the frame they belong to; the current one is the input of the filter

			this._historyTargets = temporal ? [ createTarget( [ 'color', 'fast', ...guides ] ), createTarget( [ 'color', 'fast', ...guides ] ) ] : null;

		} else {

			// texture space: the output is the target that the last filter pass does not read

			this._renderTarget = null;
			this._prepareTarget = null;
			this._historyTargets = null;

			for ( const target of this._targets ) target.texture.channel = inputNode.value.channel;

		}

		this._size = uniform( new Vector2() );
		this._step = uniform( 1, 'int' );
		this._blurDeviation = uniform( false, 'bool' );
		this._footprintScale = uniform( 1 );
		this._viewHeight = uniform( 1 );

		this._input = texture( this._targets[ 0 ].textures[ 0 ] );
		this._inputAlpha = this.alpha ? texture( this._targets[ 0 ].textures[ 1 ] ) : null;

		if ( temporal ) {

			const [ current, previous ] = this._historyTargets;

			this._guideDepth = texture( current.textures[ 2 ] );
			this._guideNormal = texture( current.textures[ 3 ] );
			this._currentColor = texture( current.textures[ 0 ] );
			this._currentFast = texture( current.textures[ 1 ] );
			this._historyColor = texture( previous.textures[ 0 ] );
			this._historyFast = texture( previous.textures[ 1 ] );
			this._historyDepth = texture( previous.textures[ 2 ] );
			this._historyNormal = texture( previous.textures[ 3 ] );

		} else if ( screenSpace ) {

			this._guideDepth = texture( this._prepareTarget.textures[ values.length ] );
			this._guideNormal = texture( this._prepareTarget.textures[ values.length + 1 ] );

		}

		this._cameraProjectionMatrixInverse = screenSpace ? uniform( camera.projectionMatrixInverse ) : null;
		this._cameraWorldMatrix = uniform( new Matrix4() );
		this._previousViewMatrix = uniform( new Matrix4() );
		this._previousProjectionMatrix = uniform( new Matrix4() );
		this._previousProjectionMatrixInverse = uniform( new Matrix4() );
		this._jitter = new Vector2();
		this._jitterDelta = uniform( new Vector2() );
		this._historyValid = uniform( false, 'bool' );
		this._inputsReady = false;

		this._temporalMaterial = null;
		this._prepareMaterial = null;
		this._filterMaterials = [ null, null, null, null ]; // by final + 2 * direct
		this._resolveMaterial = null;

		this._textureNode = passTexture( this, this._getOutput().texture );
		if ( ! screenSpace ) this._textureNode.uvNode = inputNode.uvNode;

	}

	/**
	 * Returns the denoised result as a texture node.
	 *
	 * @return {PassTextureNode} The denoised result.
	 */
	getTextureNode() {

		return this._textureNode;

	}

	/**
	 * Returns the denoised result as a texture, e.g. the history of multi-bounce reflections.
	 *
	 * @return {Texture} The denoised result.
	 */
	getTexture() {

		return this._getOutput().texture;

	}

	/**
	 * Sets the size of the internal render targets, the size of the input.
	 *
	 * @param {number} width - The width.
	 * @param {number} height - The height.
	 */
	setSize( width, height ) {

		if ( width === this._targets[ 0 ].width && height === this._targets[ 0 ].height ) return;

		for ( const target of this._targets ) target.setSize( width, height );
		if ( this._renderTarget !== null ) this._renderTarget.setSize( width, height );
		if ( this._prepareTarget !== null ) this._prepareTarget.setSize( width, height );
		if ( this._historyTargets !== null ) for ( const target of this._historyTargets ) target.setSize( width, height );

		this._size.value.set( width, height );
		this._historyValid.value = false;

	}

	/**
	 * Forgets the history, e.g. after a camera cut.
	 */
	reset() {

		this._historyValid.value = false;

	}

	/**
	 * Filters the input, once per frame if `autoUpdate` is on, else if `textureNeedsUpdate` is set.
	 *
	 * @param {NodeFrame} frame - The current node frame.
	 */
	updateBefore( frame ) {

		if ( this.autoUpdate === false && this.textureNeedsUpdate === false ) return;

		const { renderer } = frame;

		// in screen space, the inputs are usually passes that update when they are first used by the passes of this
		// node, so they are updated first to know their size; not in the first frame, before they are set up

		if ( this._inputsReady === true ) {

			for ( const node of [ this.inputNode, this.depthNode ] ) {

				if ( node === null ) continue;
				if ( node.isPassTextureNode === true ) frame.updateBeforeNode( node.passNode );
				else if ( node.isRTTNode === true ) frame.updateBeforeNode( node );

			}

		}

		this._inputsReady = true;

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		const { width, height } = this.inputNode.value.image;
		this._filter( renderer, width, height );

		// in the first frame, the inputs render while this node filters, maybe at another size: filter again

		const image = this.inputNode.value.image;
		if ( image.width !== width || image.height !== height ) this._filter( renderer, image.width, image.height );

		RendererUtils.restoreRendererState( renderer, _rendererState );

		this.textureNeedsUpdate = false;

	}

	/**
	 * Renders the passes of the filter.
	 *
	 * @private
	 * @param {Renderer} renderer - The renderer.
	 * @param {number} width - The width of the input.
	 * @param {number} height - The height of the input.
	 */
	_filter( renderer, width, height ) {

		const screenSpace = this.positionNode === null;

		this.setSize( width, height );

		if ( this.temporal ) this._renderTemporal( renderer );

		const iterations = this.iterations;

		if ( screenSpace ) {

			// the input of the first pass: the history, or the prepared input

			if ( this._prepareTarget !== null ) {

				_quadMesh.material = this._prepareMaterial;
				_quadMesh.name = 'Denoise [ Prepare ]';
				renderer.setRenderTarget( this._prepareTarget );
				_quadMesh.render( renderer );

			}

			for ( let i = 0; i < iterations; i ++ ) {

				const source = i > 0 ? this._targets[ ( i - 1 ) % 2 ] : ( this._prepareTarget !== null ? this._prepareTarget : this._historyTargets[ 0 ] );
				const direct = this._direct && this.alpha && i === 0;
				const final = i === iterations - 1;

				this._input.value = source.textures[ 0 ];
				if ( this.alpha && ! direct ) this._inputAlpha.value = source.textures[ 1 ];
				this._step.value = this.quality === 'fast' ? 3 ** i : 1 << i;
				this._blurDeviation.value = i === 0 && this._prepareTarget === null && ! this._direct;

				_quadMesh.material = this._getFilterMaterial( final, direct );
				_quadMesh.name = 'Denoise [ Filter ]';
				renderer.setRenderTarget( final ? this._renderTarget : this._targets[ i % 2 ] );
				_quadMesh.render( renderer );

			}

		} else {

			// texture space: prepare, filter and resolve ping-pong between two targets

			_quadMesh.material = this._prepareMaterial;
			_quadMesh.name = 'Denoise [ Prepare ]';
			renderer.setRenderTarget( this._targets[ 0 ] );
			_quadMesh.render( renderer );

			_quadMesh.material = this._getFilterMaterial( false, false );
			_quadMesh.name = 'Denoise [ Filter ]';

			for ( let i = 0; i < iterations; i ++ ) {

				this._input.value = this._targets[ i % 2 ].texture;
				this._step.value = this.quality === 'fast' ? 3 ** i : 1 << i;

				renderer.setRenderTarget( this._targets[ ( i + 1 ) % 2 ] );
				_quadMesh.render( renderer );

			}

			this._input.value = this._targets[ iterations % 2 ].texture;

			_quadMesh.material = this._resolveMaterial;
			_quadMesh.name = 'Denoise [ Resolve ]';
			renderer.setRenderTarget( this._getOutput() );
			_quadMesh.render( renderer );

			this._textureNode.value = this._getOutput().texture;

		}

	}

	/**
	 * This method is used to setup the effect's TSL code.
	 *
	 * @return {PassTextureNode} The denoised result.
	 */
	setup() {

		if ( this._temporalMaterial === null && this._prepareMaterial === null ) {

			if ( this.temporal ) this._temporalMaterial = this._createTemporalMaterial();
			if ( this.positionNode !== null || this._prepareTarget !== null ) this._prepareMaterial = this._createPrepareMaterial();
			if ( this.positionNode !== null ) this._resolveMaterial = this._createResolveMaterial();

		}

		return this._textureNode;

	}

	/**
	 * Frees internal resources. This method should be called when the node is no longer required.
	 */
	dispose() {

		for ( const target of [ ...this._targets, this._renderTarget, this._prepareTarget, ...( this._historyTargets || [] ) ] ) {

			if ( target !== null ) target.dispose();

		}

		for ( const material of [ this._temporalMaterial, this._prepareMaterial, ...this._filterMaterials, this._resolveMaterial ] ) {

			if ( material !== null ) material.dispose();

		}

		super.dispose();

	}

	/**
	 * Returns the render target of the denoised result: in texture space, the one that the last filter pass does
	 * not read.
	 *
	 * @private
	 * @return {RenderTarget} The render target.
	 */
	_getOutput() {

		return this._renderTarget !== null ? this._renderTarget : this._targets[ ( this.iterations + 1 ) % 2 ];

	}

	/**
	 * Swaps the histories and renders the temporal pass into the current one.
	 *
	 * @private
	 * @param {Renderer} renderer - The renderer.
	 */
	_renderTemporal( renderer ) {

		this._historyTargets.reverse();
		const [ current, previous ] = this._historyTargets;

		this._historyColor.value = previous.textures[ 0 ];
		this._historyFast.value = previous.textures[ 1 ];
		this._historyDepth.value = previous.textures[ 2 ];
		this._historyNormal.value = previous.textures[ 3 ];
		this._currentColor.value = current.textures[ 0 ];
		this._currentFast.value = current.textures[ 1 ];
		this._guideDepth.value = current.textures[ 2 ];
		this._guideNormal.value = current.textures[ 3 ];

		const camera = this.camera;
		const e = camera.projectionMatrix.elements;

		// reflections: the texels per unit of the hit distance factor, per radian for perspective cameras, and across the
		// height of the view for orthographic cameras, whose factor is relative to that height

		this._viewHeight.value = 2 / e[ 5 ];
		this._footprintScale.value = camera.isOrthographicCamera ? this._size.value.y : e[ 5 ] * this._size.value.y / 2;

		// the jitter of the projection, e.g. of TRAA, in uv: the history moves with its change. It lands in the depth
		// column of perspective projections and in the translation of orthographic projections

		this._jitterDelta.value.copy( this._jitter );

		if ( camera.isOrthographicCamera ) {

			this._jitter.set( e[ 12 ] * 0.5, - e[ 13 ] * 0.5 );

		} else {

			this._jitter.set( - e[ 8 ] * 0.5, e[ 9 ] * 0.5 );

		}

		this._jitterDelta.value.sub( this._jitter );

		this._cameraWorldMatrix.value.copy( camera.matrixWorld );

		_quadMesh.material = this._temporalMaterial;
		_quadMesh.name = 'Denoise [ Temporal ]';
		renderer.setRenderTarget( current );
		_quadMesh.render( renderer );

		this._previousViewMatrix.value.copy( camera.matrixWorldInverse );
		this._previousProjectionMatrix.value.copy( camera.projectionMatrix );
		this._previousProjectionMatrixInverse.value.copy( camera.projectionMatrixInverse );
		this._historyValid.value = true;

	}

	/**
	 * Screen space: the texel of the scene's depth of a texel of the input, and its uv.
	 *
	 * @private
	 * @param {Node<ivec2>} coord - The texel of the input.
	 * @return {{guideCoord: Node<ivec2>, guideUV: Node<vec2>}} The texel and uv.
	 */
	_guideUV( coord ) {

		const guideSize = vec2( textureSize( this.depthNode ) );
		const guideCoord = ivec2( vec2( coord ).add( 0.5 ).mul( guideSize ).div( this._size ) );

		return { guideCoord, guideUV: vec2( guideCoord ).add( 0.5 ).div( guideSize ) };

	}

	/**
	 * Screen space: the view position of a texel of the input from its view depth.
	 *
	 * @private
	 * @param {Node<ivec2>} coord - The texel of the input.
	 * @param {Node<float>} z - The view depth.
	 * @param {UniformNode<mat4>} [projectionMatrixInverse] - The inverse projection matrix.
	 * @return {Node<vec3>} The view position.
	 */
	_viewPosition( coord, z, projectionMatrixInverse = this._cameraProjectionMatrixInverse ) {

		// a point on the ray through the texel, scaled to the depth for perspective cameras and moved along the view axis
		// for orthographic cameras

		const { guideUV } = this._guideUV( coord );
		const ray = getViewPosition( guideUV, float( 0.5 ), projectionMatrixInverse );

		return this.camera.isOrthographicCamera ? vec3( ray.xy, z ) : ray.mul( z.div( ray.z ) );

	}

	/**
	 * Screen space: the guides of a texel of the input from the scene, the view position with the surface id
	 * ( 0 for the background ) and the view normal with the roughness.
	 *
	 * @private
	 * @param {Node<ivec2>} coord - The texel of the input.
	 * @return {{position: Node<vec4>, normal: Node<vec4>, uv: Node<vec2>}} The guides.
	 */
	_gBuffer( coord ) {

		const { guideCoord, guideUV } = this._guideUV( coord );
		const depth = this.depthNode.load( guideCoord ).r.toVar();
		const position = getViewPosition( guideUV, depth, this._cameraProjectionMatrixInverse );
		const normal = this.normalNode !== null ? this.normalNode.sample( guideUV ).xyz : getNormalFromDepth( guideUV, this.depthNode.value, this._cameraProjectionMatrixInverse );
		const roughness = this.roughnessNode !== null ? float( this.roughnessNode.sample( guideUV ) ) : float( 1 );

		return { position: vec4( position, isBackgroundDepth( depth ).select( 0, 1 ) ), normal: vec4( normal, roughness ), uv: guideUV };

	}

	/**
	 * Screen space: packs the guides of a texel, see the constructor.
	 *
	 * @private
	 * @param {Object} guides - The guides of `_gBuffer()`.
	 * @param {Node<float>} [historyLength] - The history length.
	 * @param {Node<float>} [hitFactor] - The hit distance factor.
	 * @return {Array<Node<vec4>>} The depth and normal guides.
	 */
	_packGuides( guides, historyLength = float( 0 ), hitFactor = float( 1 ) ) {

		const id = guides.position.w;

		return [ vec4( id.greaterThan( 0 ).select( guides.position.z, 0 ), id.mul( 256 ).add( historyLength ), 0, 0 ), vec4( octEncode( guides.normal.xyz ), guides.normal.w, hitFactor ) ];

	}

	/**
	 * Temporal: the history length of a texel, from its depth guide.
	 *
	 * @private
	 * @param {Node<ivec2>} q - The texel.
	 * @return {Node<float>} The history length.
	 */
	_lengthAt( q ) {

		const y = this._guideDepth.load( q ).y;

		return y.sub( floor( y.div( 256 ) ).mul( 256 ) );

	}

	/**
	 * Screen space: a function for the view positions of the texels around a texel from their view depth. The rays
	 * through the texels, scaled to a view depth of 1 for perspective cameras or at a view depth of 0 for orthographic
	 * cameras, are affine in the texel, so they are interpolated from those of the texel and its neighbors instead of
	 * unprojecting each.
	 *
	 * @private
	 * @param {Node<ivec2>} coord - The texel.
	 * @return {Function} The function of a texel and its view depth.
	 */
	_rays( coord ) {

		const orthographic = this.camera.isOrthographicCamera === true;

		const ray = ( x, y ) => {

			const r = getViewPosition( vec2( coord ).add( vec2( x, y ) ).div( this._size ), float( 0.5 ), this._cameraProjectionMatrixInverse );
			return orthographic ? vec3( r.xy, 0 ) : r.div( r.z );

		};

		const origin = ray( 0.5, 0.5 ).toVar();
		const dx = ray( 1.5, 0.5 ).sub( origin ).toVar();
		const dy = ray( 0.5, 1.5 ).sub( origin ).toVar();

		return ( q, z ) => {

			const p = origin.add( dx.mul( float( q.x.sub( coord.x ) ) ) ).add( dy.mul( float( q.y.sub( coord.y ) ) ) );
			return orthographic ? vec3( p.xy, z ) : p.mul( z );

		};

	}

	/**
	 * The surface ( position, id ) of a texel and a function for its normal ( normal, roughness ), in either space.
	 *
	 * @private
	 * @param {Node<ivec2>} q - The texel.
	 * @param {Function} rays - Screen space: the rays of `_rays()`.
	 * @return {{surface: Node<vec4>, normal: Function}} The surface and normal.
	 */
	_texelAt( q, rays ) {

		if ( this.positionNode !== null ) return { surface: this.positionNode.load( q ), normal: () => vec4( this.normalNode.load( q ).xyz, 1 ) };

		const g = this._guideDepth.load( q ).xy.toVar();

		return {
			surface: vec4( rays( q, g.x ), floor( g.y.div( 256 ) ) ),
			normal: () => {

				const n = this._guideNormal.load( q );
				return vec4( octDecode( n.xy ), this.roughnessNode !== null ? n.z : 1 );

			}
		};

	}

	/**
	 * Creates the material of the temporal pass, which writes the history: the color ( with the standard deviation of
	 * its noise in alpha without `alpha` ), the fast history with the temporal variance of the luminance, and the guides.
	 *
	 * @private
	 * @return {NodeMaterial} The material.
	 */
	_createTemporalMaterial() {

		const size = this._size;
		const input = this.inputNode;
		const alpha = this.alpha;
		const coverage = this.coverage;

		// the input, premultiplied by coverage in coverage mode, so that texels without coverage add nothing

		const load = ( q ) => {

			const value = input.load( q );
			return coverage ? vec4( value.rgb.mul( value.a.clamp() ), value.a.clamp() ) : vec4( value.rgb, alpha ? value.a : 1 );

		};

		const temporal = () => {

			const coord = ivec2( screenCoordinate.xy );
			const uv = vec2( coord ).add( 0.5 ).div( size ).toVar();
			const guides = this._gBuffer( coord );
			const surface = guides.position.toVar();
			const normal = guides.normal.toVar();
			const current = load( coord ).toVar();

			const result = current.toVar();
			const fast = current.rgb.toVar();
			const variance = float( 0 ).toVar();
			const historyLength = float( 1 ).toVar();

			// reflections: the hit distance factor h / ( h + d ) with the distance d of the surface ( the height of the view
			// for orthographic cameras ), 1 for misses, accumulated like the color

			const hitFactor = float( 1 ).toVar();

			if ( this._specular ) {

				const h = float( this.hitDistanceNode.sample( uv ) );
				hitFactor.assign( h.lessThan( 1e3 ).and( h.greaterThan( 0 ) ).select( h.div( h.add( this.camera.isOrthographicCamera ? this._viewHeight : length( surface.xyz ) ) ), 1 ) );

			}

			const currentHitFactor = hitFactor.toConst();

			// the 3x3 neighborhood of the input: its range bounds the fast history, its moments are the spatial
			// variance of short histories

			const m1 = float( 0 ).toVar();
			const m2 = float( 0 ).toVar();
			const currentMin = current.toVar();
			const currentMax = current.toVar();

			for ( const [ dx, dy ] of [[ 1, 0 ], [ - 1, 0 ], [ 0, 1 ], [ 0, - 1 ], [ 1, 1 ], [ - 1, - 1 ], [ 1, - 1 ], [ - 1, 1 ], [ 0, 0 ]] ) {

				const n = ( dx === 0 && dy === 0 ) ? current : load( coord.add( ivec2( dx, dy ) ).clamp( ivec2( 0 ), ivec2( size ).sub( 1 ) ) ).toVar();
				const l = luminance( n.rgb );
				m1.addAssign( l );
				m2.addAssign( l.mul( l ) );
				currentMin.assign( currentMin.min( n ) );
				currentMax.assign( currentMax.max( n ) );

			}

			m1.divAssign( 9 );
			m2.divAssign( 9 );

			If( surface.w.greaterThan( 0 ).and( this._historyValid ), () => {

				// the current surface in the previous view

				const world = this._cameraWorldMatrix.mul( vec4( surface.xyz, 1 ) );
				const previous = this._previousViewMatrix.mul( world ).xyz.toVar();
				const previousNormal = this._previousViewMatrix.mul( this._cameraWorldMatrix.mul( vec4( normal.xyz, 0 ) ) ).xyz.normalize().toVar();

				// the motion of the surface, or of the reflected point for glossy reflections ( virtual motion )

				const velocity = this.velocityNode.sample( guides.uv ).xy;
				const historyUV = uv.sub( velocity.mul( vec2( 0.5, - 0.5 ) ) ).add( this._jitterDelta ).toVar();

				if ( this._specular ) {

					const hitDistance = float( this.hitDistanceNode.sample( uv ) ).toVar();
					const viewDirection = this.camera.isOrthographicCamera ? vec3( 0, 0, - 1 ) : surface.xyz.normalize();
					const virtualPosition = surface.xyz.add( viewDirection.mul( hitDistance ) );

					// the previous projection includes the previous jitter, so the history uv needs no jitter delta

					const clip = this._previousProjectionMatrix.mul( this._previousViewMatrix.mul( this._cameraWorldMatrix.mul( vec4( virtualPosition, 1 ) ) ) ).toVar();
					const virtualUV = clip.xy.div( clip.w ).mul( vec2( 0.5, - 0.5 ) ).add( 0.5 );
					const smooth = float( 1 ).sub( normal.w.mul( 2 ) ).clamp().mul( hitDistance.greaterThan( 0 ).and( hitDistance.lessThan( 1e3 ) ).and( clip.w.greaterThan( 0 ) ).select( 1, 0 ) );
					historyUV.assign( mix( historyUV, virtualUV, smooth ) );

				}

				// a bilinear filter of the history without the texels of other surfaces; the range of the fast history
				// over its taps bounds the long one

				const p = historyUV.mul( size ).sub( 0.5 ).toVar();
				const base = ivec2( floor( p ) ).toVar();
				const f = p.sub( floor( p ) ).toVar();
				const tolerance = abs( previous.z ).mul( PLANE_TOLERANCE ).toVar();

				const sumColor = vec4( 0 ).toVar();
				const sumFast = vec4( 0 ).toVar();
				const sumLength = float( 0 ).toVar();
				const sumHit = float( 0 ).toVar();
				const sumWeight = float( 0 ).toVar();
				const fastMin = vec3( 1e9 ).toVar();
				const fastMax = vec3( - 1e9 ).toVar();

				for ( let y = 0; y <= 1; y ++ ) {

					for ( let x = 0; x <= 1; x ++ ) {

						const q = base.add( ivec2( x, y ) ).toVar();
						const inside = q.x.greaterThanEqual( 0 ).and( q.y.greaterThanEqual( 0 ) ).and( q.x.lessThan( ivec2( size ).x ) ).and( q.y.lessThan( ivec2( size ).y ) );

						If( inside, () => {

							const g = this._historyDepth.load( q ).xy.toVar();
							const tapId = floor( g.y.div( 256 ) );
							const tap = this._viewPosition( q, g.x, this._previousProjectionMatrixInverse );
							const tapNormal = this._historyNormal.load( q ).toVar();
							const plane = abs( dot( octDecode( tapNormal.xy ), tap.sub( previous ) ) );
							const valid = tapId.equal( surface.w ).and( plane.lessThan( tolerance ) ).and( dot( octDecode( tapNormal.xy ), previousNormal ).greaterThan( 0.9 ) );

							If( valid, () => {

								const wx = x === 0 ? f.x.oneMinus() : f.x;
								const wy = y === 0 ? f.y.oneMinus() : f.y;
								const w = wx.mul( wy ).toVar();
								const tapFast = this._historyFast.load( q ).toVar();

								sumColor.addAssign( this._historyColor.load( q ).mul( w ) );
								sumFast.addAssign( tapFast.mul( w ) );
								sumLength.addAssign( g.y.sub( tapId.mul( 256 ) ).mul( w ) );
								if ( this._specular ) sumHit.addAssign( tapNormal.w.mul( w ) );
								sumWeight.addAssign( w );
								fastMin.assign( fastMin.min( tapFast.rgb ) );
								fastMax.assign( fastMax.max( tapFast.rgb ) );

							} );

						} );

					}

				}

				If( sumWeight.greaterThan( 0.01 ), () => {

					const previousColor = sumColor.div( sumWeight ).toVar();
					const previousFast = sumFast.div( sumWeight ).toVar();
					const age = min( sumLength.div( sumWeight ).add( 1 ), this.maxFrames ).toVar();

					// color anti-lag ( ReLAX ): a short fast history, loosely bounded by the range of the current
					// neighborhood, bounds the long history; where they diverge beyond the spread of the fast history,
					// the long history is dropped

					const fastAge = age.min( FAST_FRAMES );
					const range = currentMax.rgb.sub( currentMin.rgb );
					fast.assign( mix( current.rgb, previousFast.rgb.clamp( currentMin.rgb.sub( range ), currentMax.rgb.add( range ) ), fastAge.sub( 1 ).div( fastAge ) ) );

					const spread = fastMax.sub( fastMin ).max( range ).max( fast.mul( 0.05 ) ).add( 1e-3 );
					const excess = previousColor.rgb.sub( fast ).abs().div( spread );
					const lag = max( excess.x, excess.y, excess.z ).smoothstep( 1, 2 ).toVar();

					age.assign( mix( age, 1, lag ) );
					fast.assign( mix( fast, current.rgb, lag ) );

					const minimum = fastMin.min( fast ).min( current.rgb );
					const maximum = fastMax.max( fast ).max( current.rgb );
					const alphaRange = currentMax.a.sub( currentMin.a );
					const bounded = vec4( previousColor.rgb.clamp( minimum, maximum ), alpha ? previousColor.a.clamp( currentMin.a.sub( alphaRange ), currentMax.a.add( alphaRange ) ) : 1 );

					const a = float( 1 ).div( age ).toVar();
					result.assign( mix( bounded, current, a ) );

					// the exponential moving variance of the luminance, stable in half floats

					const d = luminance( current.rgb ).sub( luminance( previousColor.rgb ) );
					variance.assign( float( 1 ).sub( a ).mul( previousFast.w.add( a.mul( d ).mul( d ) ) ) );
					historyLength.assign( age );

					if ( this._specular ) hitFactor.assign( mix( sumHit.div( sumWeight ), currentHitFactor, a ) );

				} );

			} );

			// the variance of the frames: temporal for long histories, spatial for short ones ( the 3x3 neighborhood )

			const frameVariance = mix( max( m2.sub( m1.mul( m1 ) ), 0 ), variance, historyLength.sub( 1 ).div( HISTORY_FIX - 1 ).clamp() );

			// without alpha, the color is the input of the filter: the standard deviation of its noise in alpha, -1
			// without data. With alpha, the fast history has it, for the first pass of the 'fast' preset

			if ( ! alpha ) result.a.assign( surface.w.greaterThan( 0 ).select( sqrt( frameVariance ), - 1 ) );

			return [ result, vec4( fast, this._direct ? frameVariance : variance ), ...this._packGuides( guides, surface.w.greaterThan( 0 ).select( historyLength, 0 ), hitFactor ) ];

		};

		return createMaterial( 'Denoise.temporal', 4, temporal );

	}

	/**
	 * Creates the material that estimates the noise of each texel and writes the input of the filter, with the
	 * guides in screen space without `temporal`.
	 *
	 * @private
	 * @return {NodeMaterial} The material.
	 */
	_createPrepareMaterial() {

		const size = this._size;
		const alpha = this.alpha;

		// the variance of the noise of a texel, spatially: from the second differences of the luminance ( and alpha ) of
		// the texels around it on the same surface, which do not see gradients of the signal, unlike the variance of
		// a window

		const spatialVariance = ( coord, surface, load ) => {

			// the 21 taps of a 5x5 window without its corners, each loaded once

			const taps = {};
			const tap = ( x, y ) => {

				const key = x + ',' + y;

				if ( taps[ key ] === undefined ) {

					const other = load( coord.add( ivec2( x, y ) ).clamp( ivec2( 0 ), ivec2( size ).sub( 1 ) ) );
					const same = other.surface.w.equal( surface.w ).and( abs( other.surface.z.sub( surface.z ) ).lessThan( abs( surface.z ).mul( 0.05 ).add( 1e-6 ) ) );
					taps[ key ] = { signal: vec2( luminance( other.value.rgb ), other.value.a ).toVar(), same: same.toVar() };

				}

				return taps[ key ];

			};

			const sum = vec3( 0 ).toVar(); // sums of dl^2, da^2, count

			for ( let y = - 1; y <= 1; y ++ ) {

				for ( let x = - 1; x <= 1; x ++ ) {

					const c = tap( x, y );

					for ( const [ dx, dy ] of [[ 1, 0 ], [ 0, 1 ]] ) {

						const a = tap( x - dx, y - dy );
						const b = tap( x + dx, y + dy );

						If( c.same.and( a.same ).and( b.same ), () => {

							const d = a.signal.add( b.signal ).sub( c.signal.mul( 2 ) );
							sum.addAssign( vec3( d.mul( d ), 1 ) );

						} );

					}

				}

			}

			// the second difference of independent noise has 6 times its variance

			const variance = sum.xy.div( sum.z.mul( 6 ).max( 1e-6 ) ).toVar();

			If( sum.z.equal( 0 ), () => {

				variance.assign( tap( 0, 0 ).signal.pow2() );

			} );

			return variance;

		};

		let prepare;

		if ( this.temporal ) {

			// the 'quality' preset with alpha: the accumulated color with the standard deviations of both signals

			const accumulated = this._currentColor;
			const fastHistory = this._currentFast;

			prepare = () => {

				const coord = ivec2( screenCoordinate.xy );
				const value = accumulated.load( coord ).toVar();
				const rays = this._rays( coord );
				const surface = this._texelAt( coord, rays ).surface.toVar();
				const historyLength = this._lengthAt( coord ).max( 1 ).toVar();

				// short histories: a spatial estimate of the variance of the frames, the temporal variance of the luminance
				// takes over as the history grows

				const load = ( q ) => ( { surface: this._texelAt( q, rays ).surface, value: accumulated.load( q ) } );
				const frameVariance = spatialVariance( coord, surface, load ).mul( historyLength );
				const variance = vec2( mix( frameVariance.x, fastHistory.load( coord ).w, historyLength.sub( 1 ).div( HISTORY_FIX - 1 ).clamp() ), frameVariance.y );
				const deviation = sqrt( variance ).toVar();
				const noData = surface.w.equal( 0 );

				return [ vec4( value.rgb, noData.select( - 1, deviation.x ) ), vec4( value.a, noData.select( - 1, deviation.y ), 0, 0 ) ];

			};

		} else if ( this.positionNode === null ) {

			// screen space: the input ( premultiplied by coverage ) with the standard deviations, and the guides

			const loadValue = ( q ) => {

				const v = this.inputNode.load( q );
				return this.coverage ? vec4( v.rgb.mul( v.a.clamp() ), v.a.clamp() ) : v;

			};

			prepare = () => {

				const coord = ivec2( screenCoordinate.xy );
				const guides = this._gBuffer( coord );
				const surface = guides.position.toVar();
				const value = loadValue( coord ).toVar();

				const load = ( q ) => ( { surface: this._gBuffer( q ).position, value: loadValue( q ) } );
				const variance = spatialVariance( coord, surface, load ).toVar();
				const deviation = sqrt( variance ).toVar();
				const noData = surface.w.equal( 0 );

				const outputs = [ vec4( value.rgb, noData.select( - 1, deviation.x ) ) ];
				if ( alpha ) outputs.push( vec4( value.a, noData.select( - 1, deviation.y ), 0, 0 ) );
				outputs.push( ...this._packGuides( guides ) );

				return outputs;

			};

		} else {

			// texture space: the color with the standard deviation of its noise, -1 for texels without data

			const input = this.inputNode;
			const variance = this.varianceNode;

			prepare = () => {

				const coord = ivec2( screenCoordinate.xy );
				const value = input.load( coord ).rgb.toVar();

				if ( variance === null ) return vec4( value, luminance( value ).mul( this.relativeNoise ) );

				// the variance blurred over the 3x3 texels of the same surface like in SVGF, so that a single lucky sample
				// does not stop the filter

				const id = this.positionNode.load( coord ).w.toVar();
				const sum = vec2( 0 ).toVar();

				Loop( { start: - 1, end: 1, condition: '<=', name: 'y' }, { start: - 1, end: 1, condition: '<=', name: 'x' }, ( { x, y } ) => {

					const q = coord.add( ivec2( x, y ) ).clamp( ivec2( 0 ), ivec2( size ).sub( 1 ) ).toVar();
					const v = variance.load( q ).r.toVar();
					const weight = float( 2 ).sub( abs( float( x ) ) ).mul( float( 2 ).sub( abs( float( y ) ) ) );

					If( v.greaterThanEqual( 0 ).and( this.positionNode.load( q ).w.equal( id ) ), () => {

						sum.addAssign( vec2( v.mul( weight ), weight ) );

					} );

				} );

				return vec4( value, variance.load( coord ).r.lessThan( 0 ).select( - 1, sqrt( sum.x.div( sum.y.max( 1e-6 ) ) ) ) );

			};

		}

		const count = this.temporal || this.positionNode !== null ? this._targets[ 0 ].textures.length : this._prepareTarget.textures.length;

		return createMaterial( 'Denoise.prepare', count, prepare );

	}

	/**
	 * Returns the material of a filter pass, see `_createFilterMaterial()`.
	 *
	 * @private
	 * @param {boolean} final - Whether the pass writes the output.
	 * @param {boolean} direct - Whether the pass reads the history directly.
	 * @return {NodeMaterial} The material.
	 */
	_getFilterMaterial( final, direct ) {

		const key = ( final ? 1 : 0 ) + ( direct ? 2 : 0 );
		if ( this._filterMaterials[ key ] === null ) this._filterMaterials[ key ] = this._createFilterMaterial( final, direct );

		return this._filterMaterials[ key ];

	}

	/**
	 * Creates the material of a filter pass, which filters `_input` with holes of `_step` texels.
	 *
	 * @private
	 * @param {boolean} final - Whether the pass writes the output.
	 * @param {boolean} direct - Whether the pass reads the history directly ( the first pass of the 'fast' preset in time
	 * with alpha ): the deviation of the luminance comes from the fast history, and alpha has no edge stop of its own.
	 * @return {NodeMaterial} The material.
	 */
	_createFilterMaterial( final, direct ) {

		const size = ivec2( this._size );
		const input = this._input;
		const inputAlpha = this._inputAlpha;
		const step = this._step;
		const alpha = this.alpha;
		const roughness = this.roughnessNode !== null;

		// 'fast': a flat kernel, at strides 1 and 3 two passes tile one 9x9 box, where a peaked kernel would leave a
		// grid; 'quality': the weights 1/4, 1/2 and 1/4 along each axis, and a linear fit

		const fit = this.quality !== 'fast';
		const kernel = ( t ) => fit ? float( 2 ).sub( t ).div( 4 ) : float( 1 );

		const filter = () => {

			const coord = ivec2( screenCoordinate.xy );
			const loaded = input.load( coord ).toVar();
			const rays = this.positionNode === null ? this._rays( coord ) : null;
			const centerTexel = this._texelAt( coord, rays );
			const surface = centerTexel.surface.toVar();
			const center = direct ? vec4( loaded.rgb, surface.w.greaterThan( 0 ).select( sqrt( this._currentFast.load( coord ).w.max( 0 ) ), - 1 ) ).toVar() : loaded;
			const centerAlpha = alpha ? ( direct ? vec4( loaded.a, 0, 0, 0 ) : inputAlpha.load( coord ) ).toVar() : null;
			const result = center.toVar();
			const resultAlpha = alpha ? centerAlpha.toVar() : null;

			If( surface.w.greaterThan( 0 ).and( center.a.greaterThanEqual( 0 ) ), () => {

				const normalRoughness = centerTexel.normal().toVar();
				const normal = normalRoughness.xyz;
				const centerLuminance = luminance( center.rgb ).toVar();

				// SVGF: the deviation of a texel is blurred over the 3x3 texels of the same surface first, where it was not
				// yet, so that a single lucky sample does not stop the filter

				const centerDeviation = center.a.toVar();

				If( this._blurDeviation, () => {

					const sum = vec2( 0 ).toVar();

					Loop( { start: - 1, end: 1, condition: '<=', name: 'y' }, { start: - 1, end: 1, condition: '<=', name: 'x' }, ( { x, y } ) => {

						const q = coord.add( ivec2( x, y ) ).clamp( ivec2( 0 ), size.sub( 1 ) ).toVar();
						const v = input.load( q ).a.toVar();
						const k = float( 2 ).sub( abs( float( x ) ) ).mul( float( 2 ).sub( abs( float( y ) ) ) );

						If( v.greaterThanEqual( 0 ).and( this._texelAt( q, rays ).surface.w.equal( surface.w ) ), () => {

							sum.addAssign( vec2( v.mul( v ).mul( k ), k ) );

						} );

					} );

					centerDeviation.assign( sqrt( sum.x.div( sum.y.max( 1e-6 ) ) ) );

				} );

				const luminanceScale = float( 1 ).div( this.luminancePhi.mul( centerDeviation ).add( 1e-6 ) ).toVar();
				const alphaScale = alpha && ! direct ? float( 1 ).div( this.luminancePhi.mul( centerAlpha.y ).add( 1e-6 ) ).toVar() : null;

				// glossy surfaces: a narrower normal lobe, from the roughness

				let normalPhi = this.normalPhi;
				let footprint = null, centerHit = null;

				if ( roughness ) {

					const a = normalRoughness.w.mul( normalRoughness.w );
					const lobe = max( atan( a.mul( 1.5 ) ), 0.02 );
					normalPhi = max( this.normalPhi, min( float( 1.386 ).div( lobe.mul( lobe ) ), 2048 ) ).toVar();

					if ( this._specular && this.temporal ) {

						// the footprint of the reflection lobe on screen in texels ( ReBLUR, ReLAX ): the tangent of the
						// lobe angle times the hit distance factor, times the texels per unit of the factor

						centerHit = this._guideNormal.load( coord ).w.toVar();
						footprint = a.mul( 1.7 ).mul( centerHit ).mul( this._footprintScale ).max( 0.5 ).toVar();

					}

				}

				const moments = vec3( 0 ).toVar(); // sums of w, w x, w y
				const spread = vec3( 0 ).toVar(); // sums of w x x, w x y, w y y
				const sum = vec3( 0 ).toVar();
				const sumX = vec3( 0 ).toVar();
				const sumY = vec3( 0 ).toVar();
				const noise = vec3( 0 ).toVar(); // sums of w w s s, times 1, x, y
				const noiseSpread = vec3( 0 ).toVar(); // times x x, x y, y y
				const sumA = alpha ? float( 0 ).toVar() : null;
				const noiseA = alpha ? float( 0 ).toVar() : null;

				// the taps are loops, unrolled ones would make shaders that take seconds to compile on some platforms

				Loop( { start: - 1, end: 1, condition: '<=', name: 'y' }, { start: - 1, end: 1, condition: '<=', name: 'x' }, ( { x, y } ) => {

					const fx = float( x ).toVar();
					const fy = float( y ).toVar();
					const kernelWeight = kernel( abs( fx ) ).mul( kernel( abs( fy ) ) ).toVar();
					const q = coord.add( ivec2( x, y ).mul( step ) ).toVar();

					If( q.x.greaterThanEqual( 0 ).and( q.y.greaterThanEqual( 0 ) ).and( q.x.lessThan( size.x ) ).and( q.y.lessThan( size.y ) ), () => {

						const texel = this._texelAt( q, rays );
						const other = texel.surface.toVar();
						const tapLoaded = input.load( q ).toVar();
						const value = direct ? vec4( tapLoaded.rgb, centerDeviation ) : tapLoaded;

						// a tap counts if it has data and lies on the same surface, e.g. the same chart

						If( other.w.equal( surface.w ).and( value.a.greaterThanEqual( 0 ) ), () => {

							const otherNormal = texel.normal().toVar();
							const offset = other.xyz.sub( surface.xyz );
							const plane = abs( dot( normal, offset ) ).div( length( offset ).add( 1e-9 ) );
							const similarity = pow( max( dot( normal, otherNormal.xyz ), 0 ), normalPhi );
							const difference = abs( luminance( value.rgb ).sub( centerLuminance ) ).mul( luminanceScale ).toVar();

							const valueAlpha = alpha ? ( direct ? vec4( tapLoaded.a, 0, 0, 0 ) : inputAlpha.load( q ) ).toVar() : null;
							if ( alpha && ! direct ) difference.addAssign( abs( valueAlpha.x.sub( centerAlpha.x ) ).mul( alphaScale ) );

							let exponent = plane.div( this.planePhi ).add( difference );
							if ( roughness ) exponent = exponent.add( abs( otherNormal.w.sub( normalRoughness.w ) ).mul( ROUGHNESS_PHI ) );

							if ( footprint !== null ) {

								// taps outside the lobe footprint and with other hit distances count less

								const distance = vec2( fx, fy ).mul( float( step ) );
								exponent = exponent.add( dot( distance, distance ).div( footprint.mul( footprint ) ) );
								exponent = exponent.add( abs( this._guideNormal.load( q ).w.sub( centerHit ) ).mul( HIT_DISTANCE_PHI ) );

							}

							const weight = similarity.mul( exp( exponent.negate() ) ).mul( kernelWeight ).toVar();
							const deviation2 = weight.pow2().mul( value.a.pow2() ).toVar();

							moments.addAssign( vec3( weight, weight.mul( fx ), weight.mul( fy ) ) );
							sum.addAssign( value.rgb.mul( weight ) );
							noise.addAssign( vec3( deviation2, deviation2.mul( fx ), deviation2.mul( fy ) ) );

							if ( fit ) {

								spread.addAssign( vec3( weight.mul( fx.mul( fx ) ), weight.mul( fx.mul( fy ) ), weight.mul( fy.mul( fy ) ) ) );
								sumX.addAssign( value.rgb.mul( weight.mul( fx ) ) );
								sumY.addAssign( value.rgb.mul( weight.mul( fy ) ) );
								noiseSpread.addAssign( vec3( deviation2.mul( fx.mul( fx ) ), deviation2.mul( fx.mul( fy ) ), deviation2.mul( fy.mul( fy ) ) ) );

							}

							if ( alpha ) {

								sumA.addAssign( weight.mul( valueAlpha.x ) );
								noiseA.addAssign( weight.pow2().mul( valueAlpha.y.pow2() ) );

							}

						} );

					} );

				} );

				if ( fit ) {

					// a weighted linear fit over the taps, in units of the step: the first row of the inverse of the
					// regularized normal matrix

					const ridge = moments.x.mul( 0.1 );
					const a = moments.x, b = moments.y, c = moments.z;
					const d = spread.x.add( ridge ), e = spread.y, f = spread.z.add( ridge );
					const row = vec3( d.mul( f ).sub( e.pow2() ), c.mul( e ).sub( b.mul( f ) ), b.mul( e ).sub( c.mul( d ) ) ).toVar();
					const determinant = a.mul( row.x ).add( b.mul( row.y ) ).add( c.mul( row.z ) );
					row.assign( row.div( determinant ) );

					const value = sum.mul( row.x ).add( sumX.mul( row.y ) ).add( sumY.mul( row.z ) ).max( 0 );
					const valueNoise = row.x.pow2().mul( noise.x ).add( row.y.pow2().mul( noiseSpread.x ) ).add( row.z.pow2().mul( noiseSpread.z ) )
						.add( row.x.mul( row.y ).mul( noise.y ).mul( 2 ) ).add( row.x.mul( row.z ).mul( noise.z ).mul( 2 ) ).add( row.y.mul( row.z ).mul( noiseSpread.y ).mul( 2 ) );

					// the noise of the fit, with independent noise of the taps

					result.assign( vec4( value, sqrt( valueNoise.max( 0 ) ) ) );

				} else {

					result.assign( vec4( sum.div( moments.x ), sqrt( noise.x ).div( moments.x ) ) );

				}

				// alpha: the weighted mean; after a direct pass, without an edge stop

				if ( alpha ) resultAlpha.assign( vec4( sumA.div( moments.x ), direct ? float( 1e3 ) : sqrt( noiseA ).div( moments.x ), 0, 0 ) );

			} );

			if ( final ) {

				// coverage: the radiance again, the weighted mean of the radiance of the texels with coverage

				if ( this.coverage ) return vec4( resultAlpha.x.greaterThan( 1e-4 ).select( result.rgb.div( resultAlpha.x.max( 1e-4 ) ), vec3( 0 ) ), resultAlpha.x.clamp() );

				if ( alpha ) return vec4( result.rgb, resultAlpha.x );

				// in time: the weight of the current frame in the history, e.g. for the feedback of multi-bounce reflections

				return vec4( result.rgb, this.temporal ? float( 1 ).div( this._lengthAt( coord ).max( 1 ) ) : 1 );

			}

			if ( alpha ) return [ result, resultAlpha ];

			return result;

		};

		return createMaterial( final ? 'Denoise.final' : 'Denoise.filter', final || ! alpha ? 1 : 2, filter );

	}

	/**
	 * Texture space: creates the material that writes the output and fills the texels without data with the mean of
	 * the denoised texels within two texels, like `LightMapper` fills the padding of the charts.
	 *
	 * @private
	 * @return {NodeMaterial} The material.
	 */
	_createResolveMaterial() {

		const input = this._input;
		const size = ivec2( this._size );

		const resolve = () => {

			const coord = ivec2( screenCoordinate.xy );
			const center = input.load( coord ).toVar();
			const result = vec4( center.rgb, 1 ).toVar();

			If( center.a.lessThan( 0 ), () => {

				const sum = vec4( 0 ).toVar();

				Loop( { start: - 2, end: 2, condition: '<=', name: 'y' }, { start: - 2, end: 2, condition: '<=', name: 'x' }, ( { x, y } ) => {

					const value = input.load( coord.add( ivec2( x, y ) ).clamp( ivec2( 0 ), size.sub( 1 ) ) ).toVar();

					If( value.a.greaterThanEqual( 0 ), () => {

						sum.addAssign( vec4( value.rgb, 1 ) );

					} );

				} );

				If( sum.a.greaterThan( 0 ), () => {

					result.assign( vec4( sum.rgb.div( sum.a ), 1 ) );

				} );

			} );

			return result;

		};

		return createMaterial( 'Denoise.resolve', 1, resolve );

	}

}

export default DenoiseNode;

// a half float render target with one texture per entry of the layout, see the constructor

function createTarget( layout ) {

	const target = new RenderTarget( 1, 1, { type: HalfFloatType, depthBuffer: false, count: layout.length } );

	layout.forEach( ( kind, i ) => {

		const t = target.textures[ i ];
		t.name = 'DenoiseNode.' + kind;

		if ( kind === 'alpha' || kind === 'normal' ) {

			t.format = RGFormat;

		} else if ( kind === 'depth' ) {

			t.format = RGFormat;
			t.type = FloatType;

		}

	} );

	return target;

}

// the octahedral encoding of unit normals

const signNotZero = ( v ) => vec2( v.x.greaterThanEqual( 0 ).select( 1, - 1 ), v.y.greaterThanEqual( 0 ).select( 1, - 1 ) );

const octEncode = ( n ) => {

	const p = n.xy.div( abs( n.x ).add( abs( n.y ) ).add( abs( n.z ) ) );
	return n.z.lessThan( 0 ).select( float( 1 ).sub( abs( p.yx ) ).mul( signNotZero( p ) ), p );

};

const octDecode = ( e ) => {

	const n = vec3( e.xy, float( 1 ).sub( abs( e.x ) ).sub( abs( e.y ) ) ).toVar();
	const t = max( n.z.negate(), 0 );
	n.x.addAssign( n.x.greaterThanEqual( 0 ).select( t.negate(), t ) );
	n.y.addAssign( n.y.greaterThanEqual( 0 ).select( t.negate(), t ) );
	return n.normalize();

};

// the material of a full-screen pass, whose body returns a vec4, or an array of them for multiple render targets

function createMaterial( name, count, body ) {

	const material = new NodeMaterial();
	material.name = name;

	if ( count === 1 ) {

		material.fragmentNode = Fn( () => {

			const value = body();
			return Array.isArray( value ) ? value[ 0 ] : value;

		} )();

		return material;

	}

	const layout = {};
	for ( let i = 0; i < count; i ++ ) layout[ 'm' + i ] = 'vec4';

	const outputs = struct( layout );

	const result = Fn( () => outputs( ...body().slice( 0, count ) ) )().toConst();

	material.fragmentNode = outputStruct( ...Object.keys( layout ).map( ( name ) => result.get( name ) ) );

	return material;

}

/**
 * TSL function for creating a denoise node that filters a single noisy frame or texture, see {@link DenoiseNode}.
 *
 * @tsl
 * @function
 * @param {Node} node - The noisy input.
 * @param {Object} [options={}] - The guides and options, see {@link DenoiseNode}.
 * @returns {DenoiseNode}
 */
export const denoise = ( node, options = {} ) => new DenoiseNode( convertToTexture( nodeObject( node ) ), { ...options, temporal: false } );

/**
 * TSL function for creating a denoise node that accumulates a noisy screen-space effect in time before filtering it,
 * see {@link DenoiseNode}. It needs `velocity`.
 *
 * @tsl
 * @function
 * @param {Node} node - The noisy input.
 * @param {Object} [options={}] - The guides and options, see {@link DenoiseNode}.
 * @returns {DenoiseNode}
 */
export const temporalDenoise = ( node, options = {} ) => new DenoiseNode( convertToTexture( nodeObject( node ) ), { ...options, temporal: true } );
