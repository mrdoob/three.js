import { Break, Continue, D_GGX, EnvironmentBRDF, F_Schlick, Fn, If, Loop, V_GGX_SmithCorrelated, abs, bool, cos, cross, distance, div, dot, float, getScreenPosition, getViewPosition, int, luminance, max, min, mix, mul, nodeObject, normalize, outputStruct, passTexture, property, reference, reflect, sin, sub, texture, textureSize, trunc, uniform, uv, vec2, vec3, vec4, context, isBackgroundDepth, projectionDepth, depthToViewZ } from 'three/tsl';
import { FloatType, HalfFloatType, LinearFilter, LinearMipmapLinearFilter, Matrix4, NodeMaterial, NodeUpdateType, QuadMesh, RenderTarget, RendererUtils, Node, Vector2, Vector3 } from 'three/webgpu';
import { bindHierarchicalHashedWeyl } from '../utils/HierarchicalHashedWeyl.js';
import { ENV_RAY_LENGTH, getSpecularDominantFactor, ggxReflectionSample } from '../utils/SpecularHelpers.js';
import { boxBlur } from './boxBlur.js';

const _quadMesh = /*@__PURE__*/ new QuadMesh();

// octahedral encoding of a unit vector in [-1,1]², for the directions of missed rays
const octEncode = ( n ) => {

	const p = n.xy.div( abs( n.x ).add( abs( n.y ) ).add( abs( n.z ) ) );
	return n.z.lessThan( 0 ).select( vec2( 1 ).sub( abs( p.yx ) ).mul( p.sign() ), p );

};

const octDecode = ( e ) => {

	const v = vec3( e, float( 1 ).sub( abs( e.x ) ).sub( abs( e.y ) ) ).toVar();

	If( v.z.lessThan( 0 ), () => v.xy.assign( vec2( 1 ).sub( abs( v.yx ) ).mul( v.xy.sign() ) ) );

	return v.normalize();

};

const _size = /*@__PURE__*/ new Vector2();
let _rendererState;

// Maximum ray-march step count; `quality` (0..1) scales it to a fixed per-ray count.
const MAX_STEPS = 64;

/**
 * @typedef {Object} SSRNodeOptions
 * @property {boolean} [stochastic=false] - When `false`, traces a single mirror reflection and softens roughness with a blur pass (first-generation SSR). When `true`, varies the reflection direction per pixel with stochastic GGX rays (second-generation SSR); higher quality on rough/glossy surfaces but noisier, so it expects a temporal/spatial denoiser downstream.
 * @property {Node<float>} [metalnessNode=null] - Per-pixel metalness. Drives GGX reflection sampling and, with `reflectNonMetals=false`, the non-metal early-out.
 * @property {Node<vec3>} [specularNode=null] - Stochastic mode only: material normal-incidence reflectance (F0), typically an MRT `specularColorBlended` attachment (it already includes IOR, specular intensity and metalness; raw `material.specularColor` reflects too brightly). Defaults to the metalness/base-color approximation.
 * @property {Node<float>} [specularF90Node=null] - Stochastic mode only: material grazing reflectance, typically an MRT `specularF90` attachment. Defaults to one.
 * @property {Node<float>} [roughnessNode=null] - Per-pixel roughness. Drives GGX sampling and the blur mip selection.
 * @property {boolean} [reflectNonMetals=false] - Only used when `stochastic=false`. When `false`, non-metallic surfaces are discarded for a noticeable performance gain; set `true` to also reflect dielectrics (e.g. marble, polished wood, plastic).
 * @property {Node} [diffuseNode=null] - Scene diffuse / base color. Defaults to `vec3(1)` in the shader when omitted.
 * @property {boolean} [applyBRDF=true] - Stochastic mode only: whether the reflections are weighted by the specular BRDF of the surface. Without it, they are the radiance reflected along the lobe, for materials to apply their own BRDF, e.g. with `builtinReflectionContext()`. Build-time only.
 * @property {boolean} [rayReuse=false] - Stochastic mode only: each pixel combines its ray with the rays of its neighbors, weighted by its own BRDF over their pdf (ray reuse of Frostbite's stochastic SSR), for several samples of its lobe per ray. Build-time only.
 * @property {boolean} [binaryRefine=false] - Sub-step binary-search refinement of detected hits. Compile-time constant (baked into the shader at construction).
 * @property {Camera} [camera=null] - Camera the scene is rendered with. Inferred from the color pass when omitted.
 */

/**
 * Post processing node for computing screen space reflections (SSR). The result holds the reflected
 * radiance in RGB and its coverage in alpha: where coverage is below one, the caller falls back to its
 * own indirect specular, e.g. the environment map.
 *
 * Reference: {@link https://lettier.github.io/3d-game-shaders-for-beginners/screen-space-reflection.html}
 *
 * @augments Node
 * @three_import import { ssr } from 'three/addons/tsl/display/SSRNode.js';
 */
class SSRNode extends Node {

	static get type() {

		return 'SSRNode';

	}

	/**
	 * Constructs a new SSR node.
	 *
	 * @param {Node<vec4>} colorNode - The node that represents the beauty pass.
	 * @param {Node<float>} depthNode - A node that represents the beauty pass's depth.
	 * @param {Node<vec3>} normalNode - A node that represents the beauty pass's normals.
	 * @param {SSRNodeOptions} [options] - Optional inputs for material data.
	 */
	constructor( colorNode, depthNode, normalNode, options = {} ) {

		super( 'vec4' );

		const {
			stochastic = false,
			metalnessNode = null,
			specularNode = null,
			specularF90Node = null,
			roughnessNode = null,
			reflectNonMetals = false,
			diffuseNode = null,
			binaryRefine = false,
			rayReuse = false,
			applyBRDF = true
		} = options;

		let camera = options.camera ?? null;

		/**
		 * When `true`, the reflection direction is varied per pixel with stochastic GGX rays
		 * (second-generation SSR). When `false`, a single mirror reflection is traced and
		 * roughness is softened with a blur pass (first-generation SSR).
		 *
		 * @type {boolean}
		 */
		this.stochastic = stochastic;

		/**
		 * The node that represents the beauty pass. Its alpha scales the coverage of the reflections.
		 *
		 * @type {Node<vec4>}
		 */
		this.colorNode = colorNode;

		/**
		 * A node that represents the scene's diffuse color (typically the MRT `diffuseColor` attachment).
		 * When `null`, the shader uses `vec3(1)`.
		 *
		 * @type {?Node<vec4>}
		 */
		this.diffuseNode = diffuseNode !== null ? nodeObject( diffuseNode ) : null;

		/**
		 * A node that represents the beauty pass's depth.
		 *
		 * @type {Node<float>}
		 */
		this.depthNode = depthNode;

		/**
		 * A node that represents the beauty pass's normals.
		 *
		 * @type {Node<vec3>}
		 */
		this.normalNode = normalNode;

		/**
		 * Per-pixel metalness, used to drive the GGX reflection sampling and the non-metal
		 * early-out. When `null`, the shader treats surfaces as non-metallic.
		 *
		 * @type {?Node<float>}
		 */
		this.metalnessNode = metalnessNode;

		/**
		 * Stochastic mode only: per-pixel normal-incidence reflectance (F0), typically an MRT
		 * `specularColorBlended` attachment, which already includes IOR, specular intensity and
		 * metalness (raw `material.specularColor` reflects too brightly). When `null`, F0 is
		 * derived from metalness and the diffuse color.
		 *
		 * @type {?Node<vec3>}
		 * @default null
		 */
		this.specularNode = specularNode;

		/**
		 * Stochastic mode only: per-pixel grazing reflectance (F90), typically an MRT
		 * `specularF90` attachment. When `null`, the shader uses `1`.
		 *
		 * @type {?Node<float>}
		 * @default null
		 */
		this.specularF90Node = specularF90Node;

		/**
		 * Per-pixel roughness, used to drive the GGX reflection sampling and the blur mip
		 * selection. When `null`, the shader treats surfaces as fully smooth.
		 *
		 * @type {?Node<float>}
		 */
		this.roughnessNode = roughnessNode;

		/**
		 * Only used when {@link SSRNode#stochastic} is `false`. When `false`, non-metallic
		 * surfaces are discarded for a noticeable performance gain; set `true` to also
		 * reflect dielectrics. Baked into the shader as a compile-time constant; assigning a
		 * new value recompiles the SSR material.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this._reflectNonMetals = reflectNonMetals;

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
		 * The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node renders
		 * its effect once per frame in `updateBefore()`.
		 *
		 * @type {string}
		 * @default 'frame'
		 */
		this.updateBeforeType = NodeUpdateType.FRAME;

		/**
		 * Controls how far a fragment can reflect. Increasing this value result in more
		 * computational overhead but also increases the reflection distance.
		 *
		 * @type {UniformNode<float>}
		 */
		this.maxDistance = uniform( 1 );

		/**
		 * Controls the cutoff between what counts as a possible reflection hit and what does not.
		 *
		 * @type {UniformNode<float>}
		 */
		this.thickness = uniform( 0.1 );

		/**
		 * A multiplier for the overall reflection intensity. `1` leaves the
		 * reflections unchanged, lower values dim them and higher values boost them.
		 *
		 * @type {UniformNode<float>}
		 * @default 1
		 */
		this.intensity = uniform( 1 );

		/**
		 * Screen-edge fade width, in UV units. As a screen-space hit approaches a screen
		 * border, the reflection is faded over this distance — either by lowering its coverage
		 * ({@link SSRNode#screenEdgeFadeBlack} `false`) or to zero intensity (`true`). `0` disables it.
		 *
		 * @type {UniformNode<float>}
		 * @default 0.2
		 */
		this.screenEdgeFade = uniform( 0.2 );

		/**
		 * When `true`, SSR fades to zero near screen borders instead of lowering its coverage,
		 * so the caller's fallback does not show there. Hits are faded by the reflection sample
		 * UV; misses are faded by the surface pixel UV.
		 *
		 * Baked into the shader as a compile-time constant so the unused fade branch is
		 * eliminated; assigning a new value recompiles the SSR material.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this._screenEdgeFadeBlack = false;

		/**
		 * Absolute luminance cap of the reflection. Brighter samples are scaled down (hue preserved).
		 *
		 * @type {UniformNode<float>}
		 * @default 10
		 */
		this.maxLuminance = uniform( 10 );

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
		 */
		this.quality = uniform( 0.5 );

		/**
		 * Mirror bias for the stochastic GGX sampling. Concentrates the reflected rays toward
		 * the lobe's narrow (near-mirror) core, trading sampling bias for less noise.
		 * `0` samples the full VNDF lobe; values toward `1` tighten the cone. Range `[0,1]`.
		 *
		 * @type {UniformNode<float>}
		 * @default 0
		 */
		this.mirrorBias = uniform( 0 );

		/**
		 * The roughness above which no reflections are traced. The coverage fades out over the last 0.2 below it, so that
		 * the caller's fallback, e.g. the environment map, takes over on rough surfaces, like the max roughness of SSR in
		 * Unreal or the roughness threshold of AMD's SSSR. `1` traces all surfaces.
		 *
		 * @type {UniformNode<float>}
		 * @default 1
		 */
		this.maxRoughness = uniform( 1 );

		/**
		 * The quality of the blur. Must be an integer in the range `[1,3]`.
		 *
		 * Baked into the blur shader as a compile-time constant so the `(size*2+1)²`
		 * sample loop unrolls; assigning a new value recompiles the blur material.
		 *
		 * @type {number}
		 * @default 2
		 */
		this._blurQuality = 2;

		/**
		 * Enables sub-step binary-search refinement of a detected hit. When on, a coarse
		 * crossing is bisected toward the exact intersection (sharper hits, less step
		 * aliasing) at the cost of extra depth samples. Baked into the shader as a
		 * compile-time constant; assigning a new value rebuilds the SSR material.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this._binaryRefine = binaryRefine;

		/**
		 * Stochastic mode only: whether each pixel combines its ray with the rays of its neighbors (ray reuse,
		 * Stachowiak 2015), weighted by its own BRDF over their pdf. Fixed at construction time.
		 *
		 * @type {boolean}
		 * @readonly
		 */
		this.rayReuse = rayReuse && stochastic;

		/**
		 * Stochastic mode only: whether the reflections are weighted by the specular BRDF of the surface, or are the
		 * radiance reflected along its lobe, for materials to apply their own BRDF. Fixed at construction time.
		 *
		 * @type {boolean}
		 * @readonly
		 */
		this.applyBRDF = applyBRDF || ! stochastic;

		/**
		 * The radius in pixels within which rays are reused, see {@link SSRNode#rayReuse}.
		 *
		 * @type {UniformNode<float>}
		 * @default 3
		 */
		this.reuseRadius = uniform( 3 );

		/**
		 * Non-linear step distribution exponent. `1` = uniform steps; `> 1` concentrates
		 * samples near the ray origin — where most short-range reflections are missed — and
		 * spaces them out toward maxDistance, as `s = (i / steps) ^ stepExponent`.
		 *
		 * Baked into the shader as a compile-time constant so `pow()` folds to a few
		 * multiplies; assigning a new value recompiles the SSR material. Only used by the
		 * stochastic reflection path.
		 *
		 * @type {number}
		 * @default 2
		 */
		this._stepExponent = 2;

		//

		if ( camera === null ) {

			if ( this.colorNode.passNode && this.colorNode.passNode.isPassNode === true ) {

				camera = this.colorNode.passNode.camera;

			} else {

				throw new Error( 'THREE.SSRNode: No camera found. ssr() requires a camera.' );

			}

		}

		/**
		 * The camera the scene is rendered with.
		 *
		 * @type {Camera}
		 */
		this.camera = camera;

		/**
		 * The spread of the blur. Automatically set when generating mips.
		 *
		 * @private
		 * @type {UniformNode<int>}
		 */
		this._blurSpread = uniform( 1 );

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

		this._cameraWorldMatrix = uniform( new Matrix4().copy( camera.matrixWorld ) );
		this._cameraWorldPosition = uniform( new Vector3().copy( camera.position ) );

		this._cameraViewMatrix = uniform( new Matrix4().copy( camera.matrixWorld ) );
		this._cameraViewMatrixInverse = uniform( new Matrix4().copy( camera.matrixWorldInverse ) );

		/**
		 * The resolution of the pass.
		 *
		 * @private
		 * @type {UniformNode<vec2>}
		 */
		this._resolution = uniform( new Vector2() );

		this._noiseIndex = uniform( 0 );

		/**
		 * The render target the SSR is rendered into: the reflection with its coverage, and the hit distance.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._ssrRenderTarget = new RenderTarget( 1, 1, { depthBuffer: false, type: HalfFloatType, count: 2 } );
		this._ssrRenderTarget.textures[ 0 ].name = 'SSRNode.SSR';
		this._ssrRenderTarget.textures[ 1 ].name = 'SSRNode.Ray';
		this._ssrRenderTarget.textures[ 1 ].type = FloatType;

		/**
		 * With {@link SSRNode#rayReuse}, the render target of the reflections resolved from the rays of each
		 * pixel and its neighbors.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._resolveRenderTarget = new RenderTarget( 1, 1, { depthBuffer: false, type: HalfFloatType } );
		this._resolveRenderTarget.texture.name = 'SSRNode.Resolve';

		/**
		 * With {@link SSRNode#rayReuse}, the material that resolves the reflections.
		 *
		 * @private
		 * @type {NodeMaterial}
		 */
		this._resolveMaterial = new NodeMaterial();
		this._resolveMaterial.name = 'SSRNode.Resolve';

		/**
		 * The render target for the blurred SSR reflections.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._blurRenderTarget = new RenderTarget( 1, 1, { depthBuffer: false, type: HalfFloatType, minFilter: LinearMipmapLinearFilter, magFilter: LinearFilter } );
		this._blurRenderTarget.texture.name = 'SSRNode.Blur';
		this._blurRenderTarget.texture.mipmaps.push( {}, {}, {}, {}, {} );

		/**
		 * The material that is used to render the effect.
		 *
		 * @private
		 * @type {NodeMaterial}
		 */
		this._ssrMaterial = new NodeMaterial();
		this._ssrMaterial.name = 'SSRNode.SSR';

		/**
		 * The SSR fragment `Fn` and its shared context, captured in {@link SSRNode#setup}.
		 * Re-invoking the `Fn` produces a fresh node graph, which is how the baked
		 * compile-time constants are re-applied when they change (see {@link SSRNode#_buildSSRMaterial}).
		 *
		 * @private
		 */
		this._ssrFn = null;
		this._sharedContext = null;

		// the two outputs of the SSR material, assigned by the fragment `Fn`
		this._ssrOutput = property( 'vec4' );
		this._ssrRay = property( 'vec4' ); // hit distance, pdf, hit uv
		this._ssrOutputNode = outputStruct( this._ssrOutput, this._ssrRay );

		/**
		 * The blur material.
		 *
		 * @private
		 * @type {NodeMaterial}
		 */
		this._blurMaterial = new NodeMaterial();
		this._blurMaterial.name = 'SSRNode.Blur';

		/**
		 * The copy material.
		 *
		 * @private
		 * @type {NodeMaterial}
		 */
		this._copyMaterial = new NodeMaterial();
		this._copyMaterial.name = 'SSRNode.Copy';

		/**
		 * The result of the effect is represented as a separate texture node.
		 *
		 * @private
		 * @type {PassTextureNode}
		 */
		this._textureNode = passTexture( this, this._ssrRenderTarget.textures[ 0 ] );

		/**
		 * The hit distance of each pixel as a separate texture node.
		 *
		 * @private
		 * @type {PassTextureNode}
		 */
		this._hitDistanceNode = passTexture( this, this._ssrRenderTarget.textures[ 1 ] );
		this._resolveTextureNode = passTexture( this, this._resolveRenderTarget.texture );

		let blurredTextureNode = null;

		if ( this.stochastic === false && this.roughnessNode !== null ) {

			const mips = this._blurRenderTarget.texture.mipmaps.length - 1;
			const r = this.roughnessNode;
			const lod = r.mul( r ).mul( mips ).clamp( 0, mips );

			blurredTextureNode = passTexture( this, this._blurRenderTarget.texture ).level( lod );

		}

		/**
		 * Holds the blurred SSR reflections.
		 *
		 * @private
		 * @type {?PassTextureNode}
		 */
		this._blurredTextureNode = blurredTextureNode;

	}

	/**
	 * Non-linear step distribution exponent (compile-time constant). See the backing
	 * field for details. Assigning a new value recompiles the SSR material.
	 *
	 * @type {number}
	 */
	get stepExponent() {

		return this._stepExponent;

	}

	set stepExponent( value ) {

		if ( value !== this._stepExponent ) {

			this._stepExponent = value;
			this._buildSSRMaterial();

		}

	}

	/**
	 * Blur kernel size (compile-time constant). Assigning a new value recompiles the
	 * blur material.
	 *
	 * @type {number}
	 */
	get blurQuality() {

		return this._blurQuality;

	}

	set blurQuality( value ) {

		if ( value !== this._blurQuality ) {

			this._blurQuality = value;

			// The size is baked into the boxBlur node tree, so rebuild it (recompiles the material).
			if ( this.stochastic === false ) this._buildBlurMaterial();

		}

	}

	/**
	 * Builds (or rebuilds) the blur material's node graph, baking the current
	 * {@link SSRNode#blurQuality} as the kernel size so the sample loop unrolls.
	 *
	 * @private
	 */
	_buildBlurMaterial() {

		this._blurMaterial.fragmentNode = boxBlur( texture( this._ssrRenderTarget.texture ), { size: this._blurQuality, separation: this._blurSpread } );
		this._blurMaterial.needsUpdate = true;

	}

	/**
	 * Whether SSR fades to black near screen borders (compile-time constant). Assigning
	 * a new value recompiles the SSR material.
	 *
	 * @type {boolean}
	 */
	get screenEdgeFadeBlack() {

		return this._screenEdgeFadeBlack;

	}

	set screenEdgeFadeBlack( value ) {

		if ( value !== this._screenEdgeFadeBlack ) {

			this._screenEdgeFadeBlack = value;
			this._buildSSRMaterial();

		}

	}

	/**
	 * Whether sub-step binary-search hit refinement is enabled (compile-time constant).
	 * Assigning a new value rebuilds the SSR material.
	 *
	 * @type {boolean}
	 */
	get binaryRefine() {

		return this._binaryRefine;

	}

	set binaryRefine( value ) {

		if ( value !== this._binaryRefine ) {

			this._binaryRefine = value;
			this._buildSSRMaterial();

		}

	}

	/**
	 * Whether dielectrics are reflected in the non-stochastic path (compile-time constant).
	 * Assigning a new value rebuilds the SSR material.
	 *
	 * @type {boolean}
	 */
	get reflectNonMetals() {

		return this._reflectNonMetals;

	}

	set reflectNonMetals( value ) {

		if ( value !== this._reflectNonMetals ) {

			this._reflectNonMetals = value;
			this._buildSSRMaterial();

		}

	}

	/**
	 * Rebuilds the SSR material's node graph by re-invoking the fragment `Fn`, which
	 * re-bakes the compile-time constants ({@link SSRNode#binaryRefine},
	 * {@link SSRNode#stepExponent}, {@link SSRNode#screenEdgeFadeBlack}) at their current
	 * values. A no-op until {@link SSRNode#setup} has captured the `Fn`.
	 *
	 * @private
	 */
	_buildSSRMaterial() {

		if ( this._ssrFn === null ) return;

		this._ssrMaterial.contextNode = context( this._sharedContext );
		this._ssrMaterial.colorNode = this._ssrFn();
		this._ssrMaterial.outputNode = this._ssrOutputNode;
		this._ssrMaterial.needsUpdate = true;

	}

	/**
	 * Returns the result of the effect as a texture node: the reflected radiance in RGB, not
	 * premultiplied, and its coverage in alpha.
	 *
	 * @return {PassTextureNode} A texture node that represents the result of the effect.
	 */
	getTextureNode() {

		if ( this.rayReuse ) return this._resolveTextureNode;

		return ( this.stochastic === false && this.roughnessNode !== null ) ? this._blurredTextureNode : this._textureNode;

	}

	/**
	 * Returns the world-space hit distance of each pixel in red, e.g. for the `hitDistance` of a
	 * {@link DenoiseNode}. Misses are far away, at `1e4`.
	 *
	 * @return {PassTextureNode} A texture node that represents the hit distance.
	 */
	getHitDistanceNode() {

		return this._hitDistanceNode;

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
		this._ssrRenderTarget.setSize( width, height );
		this._resolveRenderTarget.setSize( width, height );
		this._blurRenderTarget.setSize( width, height );

	}

	/**
	 * This method is used to render the effect once per frame.
	 *
	 * @param {NodeFrame} frame - The current node frame.
	 */
	updateBefore( frame ) {

		const { renderer } = frame;

		this._cameraWorldMatrix.value.copy( this.camera.matrixWorld );
		this._cameraWorldPosition.value.copy( this.camera.position );

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		const ssrRenderTarget = this._ssrRenderTarget;
		const blurRenderTarget = this._blurRenderTarget;

		const size = renderer.getDrawingBufferSize( _size );

		_quadMesh.material = this._ssrMaterial;

		this.setSize( size.width, size.height );

		// Advance the noise index once per frame (matches SSGI / Denoise).
		this._noiseIndex.value = ( this._noiseIndex.value + 1 ) % 0x7fffffff;

		// clear

		renderer.setMRT( null );
		renderer.setClearColor( 0x000000, 0 );

		// ssr

		renderer.setRenderTarget( ssrRenderTarget );
		_quadMesh.name = 'SSR [ Reflections ]';
		_quadMesh.render( renderer );

		// ray reuse (optional)

		if ( this.rayReuse ) {

			_quadMesh.material = this._resolveMaterial;
			renderer.setRenderTarget( this._resolveRenderTarget );
			_quadMesh.name = 'SSR [ Resolve ]';
			_quadMesh.render( renderer );

		}

		// blur (optional)

		if ( this.stochastic === false && this.roughnessNode !== null ) {

			// blur mips but leave the base mip unblurred

			for ( let i = 0; i < blurRenderTarget.texture.mipmaps.length; i ++ ) {

				_quadMesh.material = ( i === 0 ) ? this._copyMaterial : this._blurMaterial;

				this._blurSpread.value = i;
				renderer.setRenderTarget( blurRenderTarget, 0, i );
				_quadMesh.name = 'SSR [ Blur Level ' + i + ' ]';
				_quadMesh.render( renderer );

			}

		}

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

		const pointToLineDistance = Fn( ( [ point, linePointA, linePointB ] ) => {

			// https://mathworld.wolfram.com/Point-LineDistance3-Dimensional.html

			return cross( point.sub( linePointA ), point.sub( linePointB ) ).length().div( linePointB.sub( linePointA ).length() );

		}, { point: 'vec3', linePointA: 'vec3', linePointB: 'vec3', return: 'float' } );

		const pointPlaneDistance = Fn( ( [ point, planePoint, planeNormal ] ) => {

			// https://mathworld.wolfram.com/Point-PlaneDistance.html
			// https://en.wikipedia.org/wiki/Plane_(geometry)
			// http://paulbourke.net/geometry/pointlineplane/

			// planeNormal is already normalized, so the denominator is 1.
			const d = mul( planeNormal.x, planePoint.x ).add( mul( planeNormal.y, planePoint.y ) ).add( mul( planeNormal.z, planePoint.z ) ).negate().toVar();
			const distance = mul( planeNormal.x, point.x ).add( mul( planeNormal.y, point.y ) ).add( mul( planeNormal.z, point.z ) ).add( d );
			return distance;

		}, { point: 'vec3', planePoint: 'vec3', planeNormal: 'vec3', return: 'float' } );

		const sampleDepth = ( uv ) => projectionDepth( this.depthNode.sample( uv ).r, this._cameraNear, this._cameraFar );

		const sampleMarchNoise = this.stochastic === true ? bindHierarchicalHashedWeyl( this._resolution, 47 ) : null;

		const computeScreenBorderFactor = Fn( ( [ uvCoord, borderWidth ] ) => {

			const border = borderWidth.max( 1e-4 );

			// Distance to the nearest screen edge — uniform falloff at corners.
			const edgeDist = min(
				min( uvCoord.x, float( 1 ).sub( uvCoord.x ) ),
				min( uvCoord.y, float( 1 ).sub( uvCoord.y ) )
			);

			// Two smoothsteps for a softer ease-in-out than a single ramp.
			const t = edgeDist.smoothstep( 0, border );

			return t.smoothstep( 0, 1 ).pow( 0.125 );

		}, { uvCoord: 'vec2', borderWidth: 'float', return: 'float' } );

		const ssr = Fn( () => {

			const noise = this.stochastic === true ? sampleMarchNoise( uvNode, this._noiseIndex ) : null;
			// reconstruct at the depth texel center

			const depthSize = vec2( textureSize( this.depthNode ) ).toConst();
			const uvPos = uvNode.mul( depthSize ).floor().add( 0.5 ).div( depthSize ).toVar();

			const depth = sampleDepth( uvPos ).toVar();

			// Skip background pixels (cleared far-plane depth); the target is cleared each frame.
			isBackgroundDepth( depth ).discard();

			const viewPosition = getViewPosition( uvPos, depth, this._cameraProjectionMatrixInverse ).toVar();
			const worldPosition = this._cameraWorldMatrix.mul( vec4( viewPosition, 1.0 ) ).xyz.toVar();
			const viewNormal = this.normalNode.rgb.normalize().toVar();

			const viewIncidentDir = ( ( this.camera.isPerspectiveCamera ) ? normalize( viewPosition ) : vec3( 0, 0, - 1 ) ).toVar();

			// The node system samples the metalness/roughness textures at the current uv,
			// so no explicit sample() is needed here.
			const metalness = float( this.metalnessNode );

			if ( this.stochastic === false && this._reflectNonMetals === false ) {

				metalness.lessThanEqual( 0.0 ).discard();

			}

			const roughness = float( this.roughnessNode );

			// too rough: no reflection, the fallback takes over
			roughness.greaterThan( this.maxRoughness ).discard();
			const glossiness = min( roughness.div( 0.25 ), 1 ).oneMinus();
			// Only the fade-to-black miss path reads this, and that path is baked out otherwise.
			const surfaceBorderFactor = this.screenEdgeFadeBlack ? computeScreenBorderFactor( uvPos, this.screenEdgeFade ) : null;
			const hitBorderWidth = this.screenEdgeFade.mul( glossiness );

			const V = viewIncidentDir.negate().normalize().toVar();

			let viewReflectDir, finalSampleWeight, specDominantFactor;
			const rayPdf = float( 0 ).toVar();
			const hitUV = vec2( 0 ).toVar();

			if ( this.stochastic === false ) {

				viewReflectDir = reflect( viewIncidentDir, viewNormal ).normalize().toVar();
				finalSampleWeight = vec3( metalness );
				specDominantFactor = float( 1 );

			} else {

				const Xi = noise.toVar();
				// mirror bias trades the unbiased GGX lobe for lower variance
				Xi.y.assign( mix( Xi.y, 0.0, this.mirrorBias.mul( Xi.w.sqrt() ) ) );

				// The base color only feeds the metalness F0 fallback.
				const albedo = ( this.specularNode === null && this.diffuseNode !== null ? this.diffuseNode.sample( uvPos ).rgb : vec3( 1 ) ).toVar();
				const ggxSample = ggxReflectionSample( viewNormal, V, roughness, metalness, albedo, Xi, this.specularNode, this.specularF90Node ?? 1 ).toVar();

				// Sometimes the GGX sample is facing away from the surface, so we need to re-sample.
				If( ggxSample.get( 'reflectDir' ).dot( viewNormal ).lessThan( 0 ), () => {

					ggxSample.assign( ggxReflectionSample( viewNormal, V, roughness, metalness, albedo, Xi.add( Xi.mul( 7 ) ).fract(), this.specularNode, this.specularF90Node ?? 1 ) );

				} );

				viewReflectDir = ggxSample.get( 'reflectDir' ).toVar();
				finalSampleWeight = ggxSample.get( 'sampleWeight' ).toVar();
				specDominantFactor = getSpecularDominantFactor( ggxSample.get( 'NdotV' ), roughness ).toVar();
				rayPdf.assign( ggxSample.get( 'pdf' ) );

			}

			// Fades a screen-space hit near the screen borders, using the hit sample UV (where the
			// screen-space data was read): to black, or by lowering the coverage.
			const applyHitEdgeFade = ( reflectColor, coverage, uvS, hitBorderWidth ) => {

				if ( this.screenEdgeFadeBlack ) {

					reflectColor.rgb.mulAssign( computeScreenBorderFactor( uvS, this.screenEdgeFade ) );

				} else {

					coverage.assign( computeScreenBorderFactor( uvS, hitBorderWidth ) );

				}

			};

			const maxReflectRayLen = this.maxDistance.div( dot( viewIncidentDir.negate(), viewNormal ).max( 1e-4 ) ).toVar();

			const d1viewPosition = viewPosition.add( viewReflectDir.mul( maxReflectRayLen ) ).toVar();

			// Camera type is fixed at build time, so guard the near-plane clamp with a JS branch
			// rather than a runtime uniform (the orthographic case compiles it out entirely).
			if ( this.camera.isPerspectiveCamera ) {

				If( d1viewPosition.z.greaterThan( this._cameraNear.negate() ), () => {

					const t = sub( this._cameraNear.negate(), viewPosition.z ).div( viewReflectDir.z );
					d1viewPosition.assign( viewPosition.add( viewReflectDir.mul( t ) ) );

				} );

			}

			const d0 = uvPos.mul( this._resolution ).xy.toVar();
			const d1 = getScreenPosition( d1viewPosition, this._cameraProjectionMatrix ).mul( this._resolution ).toVar();

			// clip the ray to the screen so all steps land on visible texels

			const extent = d1.sub( d0 ).toVar();
			const exitT = vec2(
				extent.x.greaterThanEqual( 0 ).select( this._resolution.x.sub( d0.x ), d0.x ),
				extent.y.greaterThanEqual( 0 ).select( this._resolution.y.sub( d0.y ), d0.y )
			).div( extent.abs().max( 1e-6 ) );
			const clipT = min( exitT.x, exitT.y ).min( 1 ).toConst();

			If( clipT.lessThan( 1 ), () => {

				d1.assign( d0.add( extent.mul( clipT ) ) );
				d1viewPosition.assign( this.camera.isPerspectiveCamera
					? mix( viewPosition.div( viewPosition.z ), d1viewPosition.div( d1viewPosition.z ), clipT ).div( mix( viewPosition.z.reciprocal(), d1viewPosition.z.reciprocal(), clipT ) )
					: mix( viewPosition, d1viewPosition, clipT ) );

			} );

			const xLen = d1.x.sub( d0.x ).toVar();
			const yLen = d1.y.sub( d0.y ).toVar();

			// dominant-axis ray length in texels (used for the per-step floor below)
			const rayLen = max( xLen.abs(), yLen.abs() ).max( 1 ).toVar();

			// Blur traces a single mirror ray, so spend steps in proportion to the ray's screen-space
			// length (cheap for the short rays that dominate). Scatter needs a fixed, bounded count for
			// coherent stochastic sampling; each step then spans the whole ray as rayVec / totalStep.
			const totalStep = int( this.stochastic === false
				? trunc( max( abs( xLen ), abs( yLen ) ).mul( this.quality.clamp() ) ).max( int( 1 ) ).toConst()
				: this.quality.clamp().mul( MAX_STEPS ).max( float( 1 ) ) ).toConst();

			const xSpan = xLen.div( totalStep ).toVar();
			const ySpan = yLen.div( totalStep ).toVar();

			const stepVec = vec2( xSpan, ySpan ).toVar();
			const invResolution = vec2( float( 1 ), float( 1 ) ).div( this._resolution ).toVar();
			const uvPixelStepX = vec2( invResolution.x, float( 0 ) ).toVar();

			const output = vec4( 0 ).toVar();
			const hitDistance = float( ENV_RAY_LENGTH ).toVar();
			const hit = float( 0 ).toVar();

			// Reflected-ray view-space Z at ray parameter s ∈ [0,1] (linear in 1/z for perspective),
			// hoisted so the march and refinement evaluate it identically.
			const recipVPZ = float( 1 ).div( viewPosition.z ).toConst();
			const recipD1VPZ = float( 1 ).div( d1viewPosition.z ).toConst();

			// Camera type is known at build time, so branch at compile time rather than via a runtime select.
			const reflectRayZAt = this.camera.isPerspectiveCamera
				? ( sVal ) => float( 1 ).div( recipVPZ.add( sVal.mul( recipD1VPZ.sub( recipVPZ ) ) ) )
				: ( sVal ) => viewPosition.z.add( sVal.mul( d1viewPosition.z.sub( viewPosition.z ) ) );

			// view-space point on the reflected ray at s

			const rayPointAt = this.camera.isPerspectiveCamera
				? ( sVal ) => mix( viewPosition.div( viewPosition.z ), d1viewPosition.div( d1viewPosition.z ), sVal ).mul( reflectRayZAt( sVal ) )
				: ( sVal ) => mix( viewPosition, d1viewPosition, sVal );

			// Screen-space position along the ray for a given s ∈ [0,1].
			const screenPosAt = ( sVal ) => d0.add( stepVec.mul( sVal.mul( totalStep ) ) );

			// Ray parameter s ∈ [0,1] for step `idx`. Blur marches uniformly (matching the original loop:
			// one ~texel step per iteration). Scatter uses an exponential remap `(idx/steps)^stepExponent`
			// that concentrates samples near the origin, floored to ≥1 texel/step; `jitter` dissolves banding.
			const sampleFraction = this.stochastic === false
				? ( idx ) => idx.div( totalStep )
				: ( idx ) => max(
					idx.add( noise.z.sub( 0.5 ) ).div( totalStep ).pow( this.stepExponent ),
					idx.div( rayLen )
				);

			// Carry the hit out of the loop so refinement runs after the march, not nested inside it (a
			// loop-inside-a-loop tripped shader-compiler bugs on some drivers). hitSLo/hitSHi bracket s.
			const foundHit = bool( false ).toVar();
			const hitSLo = float( 0 ).toVar();
			const hitSHi = float( 0 ).toVar();
			// Carry the coarse hit's UV/depth to skip a redundant fetch when refinement is off.
			const hitUvS = vec2( 0 ).toVar();
			const hitD = float( 0 ).toVar();
			const previousS = float( 0 ).toVar();
			const previousInFront = bool( true ).toVar();
			const canRefine = bool( false ).toVar();

			// March from d0 toward d1, looking for an intersection with the depth buffer.
			Loop( { start: int( 1 ), end: totalStep }, ( { i } ) => {

				// Exponentially-distributed ray parameter, shared by the sample position and ray depth.
				const s = sampleFraction( float( i ) ).toVar();

				If( s.greaterThan( 1 ), () => {

					Break();

				} );

				const xy = screenPosAt( s ).toVar();

				If( xy.x.lessThan( 0 ).or( xy.x.greaterThan( this._resolution.x ) ).or( xy.y.lessThan( 0 ) ).or( xy.y.greaterThan( this._resolution.y ) ), () => {

					Break();

				} );

				const uvS = xy.mul( invResolution ).toVar();
				const rawDepth = this.depthNode.sample( uvS ).r;
				const d = projectionDepth( rawDepth, this._cameraNear, this._cameraFar ).toVar();
				const vZ = depthToViewZ( rawDepth, this._cameraNear, this._cameraFar, this.camera ).toVar();

				const viewReflectRayZ = reflectRayZAt( s ).toVar();

				// Advance the previous sample before any Continue() so rejected samples still bound the next bracket.
				const lastS = previousS.toVar();
				const lastInFront = previousInFront.toVar();
				previousS.assign( s );
				previousInFront.assign( viewReflectRayZ.greaterThan( vZ ) );

				If( isBackgroundDepth( d ).not().and( viewReflectRayZ.lessThanEqual( vZ ) ), () => {

					// Depth crossing: ray went behind the depth buffer. Gate by thickness before stopping
					// so an occluder gap doesn't end the march prematurely.
					const vP = getViewPosition( uvS, d, this._cameraProjectionMatrixInverse ).toVar();
					const away = pointToLineDistance( vP, viewPosition, d1viewPosition ).toVar();

					const uvNeighbor = uvS.add( uvPixelStepX ).toVar();
					const vPNeighbor = getViewPosition( uvNeighbor, d, this._cameraProjectionMatrixInverse ).toVar();
					const minThickness = vPNeighbor.x.sub( vP.x ).mul( 3 ).toVar();
					// Only refinement may use a wider coarse tolerance.

					const stepLength = distance( rayPointAt( lastS ), rayPointAt( s ) );
					const tk = ( this.binaryRefine ? max( max( minThickness, this.thickness ), stepLength ) : max( minThickness, this.thickness ) ).toVar();

					If( away.lessThanEqual( tk ), () => {

						const vN = this.normalNode.sample( uvS ).rgb.normalize().toVar();

						// the reflected ray is pointing towards the same side as the fragment's normal (current ray position),
						// which means it wouldn't reflect off the surface. The loop continues to the next step for the next ray sample.
						If( dot( viewReflectDir, vN ).greaterThanEqual( 0 ), () => {

							Continue();

						} );

						if ( this.stochastic === false ) {

							// this distance represents the depth of the intersection point between the reflected ray and the scene.
							const distance = pointPlaneDistance( vP, viewPosition, viewNormal ).toVar();

							// Distance exceeding limit: The reflection is potentially too far away and
							// might not contribute significantly to the final color
							If( distance.greaterThan( this.maxDistance ), () => {

								Break();

							} );

						}

						foundHit.assign( true );
						hitUvS.assign( uvS );
						hitD.assign( d );

						if ( this.binaryRefine ) {

							// refine only front-to-back crossings

							canRefine.assign( lastInFront );
							hitSLo.assign( lastS );
							hitSHi.assign( s );

						}

						Break();


					} );

				} );

			} );

			If( foundHit, () => {

				// Bisect the bracketed crossing toward the exact intersection. Run after the march, not
				// nested (a loop-inside-a-loop tripped shader-compiler bugs on some drivers).
				if ( this.binaryRefine ) {

					If( canRefine, () => {

						Loop( { start: int( 0 ), end: int( 8 ), type: 'int', condition: '<' }, () => {

							const sMid = hitSLo.add( hitSHi ).mul( 0.5 ).toVar();
							const uvMid = screenPosAt( sMid ).mul( invResolution ).toConst();
							const sceneZMid = depthToViewZ( this.depthNode.sample( uvMid ).r, this._cameraNear, this._cameraFar, this.camera );
							const frontFacing = dot( viewReflectDir, this.normalNode.sample( uvMid ).rgb.normalize() ).lessThan( 0 );

							If( reflectRayZAt( sMid ).lessThanEqual( sceneZMid ).and( frontFacing ), () => {

								hitSHi.assign( sMid );

							} ).Else( () => {

								hitSLo.assign( sMid );

							} );

						} );

						// re-fetch UV/depth at the refined `s`

						hitUvS.assign( screenPosAt( hitSHi ).mul( invResolution ) );
						hitD.assign( sampleDepth( hitUvS ) );

					} );

				}

				// Shade the hit, reusing the depth fetched during the march (or refinement).
				const uvS = hitUvS;
				const vP = getViewPosition( uvS, hitD, this._cameraProjectionMatrixInverse ).toVar();

				// In blur mode the ratio² falloff re-grows past maxDistance, so over-range hits fall back
				// to env. The scatter path bounds reach via ray length, so every hit shades.
				const distancePointPlane = this.stochastic === false ? pointPlaneDistance( vP, viewPosition, viewNormal ).toVar() : float( 0 );
				const withinRange = distancePointPlane.lessThanEqual( this.maxDistance ).toVar();

				if ( this.binaryRefine ) {

					// bisection can land on a depth discontinuity, so validate the refined hit

					const neighbor = getViewPosition( uvS.add( uvPixelStepX ), hitD, this._cameraProjectionMatrixInverse );
					const tk = max( neighbor.x.sub( vP.x ).mul( 3 ), this.thickness );
					withinRange.assign( withinRange.and( isBackgroundDepth( hitD ).not() )
						.and( pointToLineDistance( vP, viewPosition, d1viewPosition ).lessThanEqual( tk ) ) );

					withinRange.assign( withinRange.and( dot( viewReflectDir, this.normalNode.sample( uvS ).rgb.normalize() ).lessThan( 0 ) ) );

				}

				If( withinRange, () => {

					const hitWorldPosition = this._cameraWorldMatrix.mul( vec4( vP, 1.0 ) ).xyz.toVar();
					const worldDistance = distance( worldPosition, hitWorldPosition ).mul( specDominantFactor ).toVar();

					const reflectColor = this.colorNode.sample( uvS ).toVar();

					// the alpha of the color scales the coverage, e.g. the share of valid history of a previous frame
					const coverage = reflectColor.a.toVar();

					if ( this.stochastic === true ) applyHitEdgeFade( reflectColor, coverage, uvS, hitBorderWidth );

					// The scatter (GGX) path bakes distance/grazing response into finalSampleWeight.
					// The mirror/blur path is a plain reflection, so reapply upstream's squared
					// distance attenuation and grazing Fresnel here to match its falloff.
					let weightedColor = reflectColor.rgb.mul( finalSampleWeight );

					if ( this.stochastic === false ) {

						const ratio = float( 1 ).sub( distancePointPlane.div( this.maxDistance ) ).toVar();
						const attenuation = ratio.mul( ratio ).toVar();
						const fresnelCoe = div( dot( viewIncidentDir, viewReflectDir ).add( 1 ), 2 ).toVar();
						weightedColor = weightedColor.mul( attenuation.mul( fresnelCoe ) );

					}

					hit.assign( 1 );
					hitDistance.assign( worldDistance );
					hitUV.assign( uvS );

					// ray reuse weighs the radiance of the hit per pixel in the resolve pass, materials without applyBRDF
					output.assign( vec4( this.rayReuse || ! this.applyBRDF ? reflectColor.rgb : weightedColor, coverage ) );

				} );

			} );

			// Screen-space ray missed: no coverage, except that fading to black claims the screen borders,
			// faded by the surface pixel UV (where the reflection is being shaded).
			if ( this.stochastic === true && this.screenEdgeFadeBlack ) {

				If( hit.equal( 0 ), () => {

					output.a.assign( surfaceBorderFactor.oneMinus() );

				} );

			}

			// with ray reuse, the resolve pass clamps and scales the weighted result
			if ( this.rayReuse === false ) {

				const lum = luminance( output.rgb ).max( 1e-4 ).toVar();
				output.rgb.mulAssign( this.maxLuminance.div( lum ).min( 1 ) );

				// scale the reflection color by the user-controlled intensity
				output.rgb.mulAssign( this.intensity );

			} else {

				// misses keep their direction for the resolve pass, hits their uv
				If( hit.equal( 0 ), () => {

					hitUV.assign( octEncode( viewReflectDir ) );

				} );

			}

			output.a.mulAssign( roughness.smoothstep( this.maxRoughness, this.maxRoughness.sub( 0.2 ) ) );

			this._ssrOutput.assign( output.max( 0 ) );
			this._ssrRay.assign( vec4( hitDistance, rayPdf, hitUV ) );

			return vec4( 0 );

		} );


		// ray reuse ( Stachowiak 2015 ): the radiance of the hits of the rays of the pixel and its neighbors, weighted by
		// the BRDF of the pixel over the pdf of each ray ( a ratio estimator ), times the pre-integrated BRDF of the pixel.
		// The coverage is the mean coverage of the rays

		if ( this.rayReuse ) {

			const radiances = texture( this._ssrRenderTarget.textures[ 0 ] );
			const rays = texture( this._ssrRenderTarget.textures[ 1 ] );
			const sampleReuseNoise = bindHierarchicalHashedWeyl( this._resolution, 61 );

			const resolve = Fn( () => {

				const depthSize = vec2( textureSize( this.depthNode ) ).toConst();
				const uvPos = uvNode.mul( depthSize ).floor().add( 0.5 ).div( depthSize ).toVar();
				const depth = sampleDepth( uvPos ).toVar();

				isBackgroundDepth( depth ).discard();

				const position = getViewPosition( uvPos, depth, this._cameraProjectionMatrixInverse ).toVar();
				const N = this.normalNode.sample( uvPos ).rgb.normalize().toVar();
				const V = ( this.camera.isPerspectiveCamera ? position.normalize().negate() : vec3( 0, 0, 1 ) ).toVar();
				const roughness = float( this.roughnessNode ).toVar();
				const alpha = roughness.mul( roughness ).max( 0.001 ).toVar();
				const NdotV = dot( N, V ).max( 1e-4 ).toVar();

				const metalness = float( this.metalnessNode );
				const albedo = this.diffuseNode !== null ? this.diffuseNode.sample( uvPos ).rgb : vec3( 1 );
				const f0 = this.specularNode !== null ? this.specularNode.sample( uvPos ).rgb : mix( vec3( 0.04 ), albedo, metalness );
				const f90 = float( this.specularF90Node ?? 1 );

				const sumRadiance = vec3( 0 ).toVar();
				const sumWeight = float( 0 ).toVar();
				const sumHitWeight = float( 0 ).toVar();

				const angle = sampleReuseNoise( uvPos, this._noiseIndex ).x.mul( Math.PI * 2 ).toVar();
				const invResolution = vec2( 1 ).div( this._resolution ).toConst();

				// the pixel and 7 neighbors on a rotated spiral

				for ( let i = 0; i < 8; i ++ ) {

					const radius = this.reuseRadius.mul( Math.sqrt( i / 7 ) );
					const theta = angle.add( i * 2.39996 );
					// at a texel center: a filtered fetch would blend the rays of different texels
					const q = uvPos.add( vec2( cos( theta ), sin( theta ) ).mul( radius ).mul( invResolution ) ).mul( this._resolution ).floor().add( 0.5 ).mul( invResolution ).toVar();

					If( q.greaterThanEqual( vec2( 0 ) ).all().and( q.lessThanEqual( vec2( 1 ) ).all() ), () => {

						const sample = radiances.sample( q ).toVar();
						const ray = rays.sample( q ).toVar();

						If( ray.y.greaterThan( 0 ), () => {

							// the direction from this pixel: to the hit point of a hit, the direction of a miss
							const isHit = ray.x.lessThan( 1e3 );
							const hitPosition = getViewPosition( ray.zw, sampleDepth( ray.zw ), this._cameraProjectionMatrixInverse );
							const L = isHit.select( hitPosition.sub( position ).normalize(), octDecode( ray.zw ) ).toVar();
							const NdotL = dot( N, L ).toVar();

							If( NdotL.greaterThan( 0 ), () => {

								const H = V.add( L ).normalize();
								const brdf = D_GGX( { alpha, dotNH: dot( N, H ).max( 0 ) } ).mul( V_GGX_SmithCorrelated( { alpha, dotNL: NdotL, dotNV: NdotV } ) );
								const fresnel = luminance( F_Schlick( { f0, f90, dotVH: dot( V, H ).max( 0 ) } ) );
								const weight = brdf.mul( fresnel ).mul( NdotL ).div( ray.y ).toVar();
								const coverage = isHit.select( sample.a, 0 );

								sumWeight.addAssign( weight );
								sumHitWeight.addAssign( weight.mul( coverage ) );
								sumRadiance.addAssign( sample.rgb.mul( weight.mul( coverage ) ) );

							} );

						} );

					} );

				}

				const radiance = sumHitWeight.greaterThan( 0 ).select( sumRadiance.div( sumHitWeight ), vec3( 0 ) );
				const albedoBRDF = EnvironmentBRDF( { dotNV: NdotV, specularColor: f0, specularF90: f90, roughness } );
				const output = ( this.applyBRDF ? radiance.mul( albedoBRDF ) : radiance ).toVar();

				const lum = luminance( output ).max( 1e-4 );
				output.mulAssign( this.maxLuminance.div( lum ).min( 1 ).mul( this.intensity ) );

				return vec4( output, sumHitWeight.div( sumWeight.max( 1e-6 ) ) );

			} );

			this._resolveMaterial.contextNode = context( builder.getSharedContext() );
			this._resolveMaterial.fragmentNode = resolve();
			this._resolveMaterial.needsUpdate = true;

		}

		this._ssrFn = ssr;
		this._sharedContext = builder.getSharedContext();
		this._buildSSRMaterial();

		const reflectionBuffer = texture( this._ssrRenderTarget.texture );

		if ( this.stochastic === false ) {

			this._buildBlurMaterial();

		}

		this._copyMaterial.fragmentNode = reflectionBuffer;
		this._copyMaterial.needsUpdate = true;

		//

		return this.getTextureNode();

	}

	getRenderTarget() {

		return this._ssrRenderTarget;

	}

	/**
	 * Frees internal resources. This method should be called
	 * when the effect is no longer required.
	 */
	dispose() {

		super.dispose();

		this._ssrRenderTarget.dispose();
		this._resolveRenderTarget.dispose();
		this._resolveMaterial.dispose();
		this._blurRenderTarget.dispose();

		this._ssrMaterial.dispose();
		this._blurMaterial.dispose();
		this._copyMaterial.dispose();

	}

}

export default SSRNode;

/**
 * TSL function for creating screen space reflections (SSR).
 *
 * @tsl
 * @function
 * @param {Node<vec4>} colorNode - The node that represents the beauty pass.
 * @param {Node<float>} depthNode - A node that represents the beauty pass's depth.
 * @param {Node<vec3>} normalNode - A node that represents the beauty pass's normals.
 * @param {SSRNodeOptions} [options] - Optional inputs for material data.
 * @returns {SSRNode}
 */
export const ssr = ( colorNode, depthNode, normalNode, options = {} ) => new SSRNode(
	nodeObject( colorNode ),
	nodeObject( depthNode ),
	nodeObject( normalNode ),
	options
);
