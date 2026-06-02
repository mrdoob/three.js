import { RenderTarget, Vector2, TempNode, QuadMesh, NodeMaterial, RendererUtils, RedFormat, FloatType, NearestFilter, LinearFilter } from 'three/webgpu';
import { reference, logarithmicDepthToViewZ, viewZToPerspectiveDepth, perspectiveDepthToViewZ, getNormalFromDepth, getScreenPosition, getViewPosition, nodeObject, Fn, float, NodeUpdateType, uv, uniform, Loop, vec2, vec3, vec4, int, dot, max, min, pow, abs, exp, If, textureSize, sin, cos, PI, texture, passTexture, mat3, add, normalize, cross, mix, acos, clamp } from 'three/tsl';
import { generateBlueNoiseTexture } from '../../math/BlueNoise.js';

const _quadMesh = /*@__PURE__*/ new QuadMesh();
const _size = /*@__PURE__*/ new Vector2();

// From Activision GTAO paper: https://www.activision.com/cdn/research/s2016_pbs_activision_occlusion.pptx
const _temporalRotations = [ 60, 300, 180, 240, 120, 0 ];

let _rendererState;

/**
 * Post processing node for applying Ground Truth Ambient Occlusion (GTAO) to a scene.
 * ```js
 * const renderPipeline = new THREE.RenderPipeline( renderer );
 *
 * const scenePass = pass( scene, camera );
 * scenePass.setMRT( mrt( {
 * 	output: output,
 * 	normal: normalView
 * } ) );
 *
 * const scenePassColor = scenePass.getTextureNode( 'output' );
 * const scenePassNormal = scenePass.getTextureNode( 'normal' );
 * const scenePassDepth = scenePass.getTextureNode( 'depth' );
 *
 * const aoPass = ao( scenePassDepth, scenePassNormal, camera );
 * const aoPassOutput = aoPass.getTextureNode();
 *
 * renderPipeline.outputNode = scenePassColor.mul( vec4( vec3( aoPassOutput.r ), 1 ) );
 * ```
 *
 * Reference: [Practical Real-Time Strategies for Accurate Indirect Occlusion](https://www.activision.com/cdn/research/Practical_Real_Time_Strategies_for_Accurate_Indirect_Occlusion_NEW%20VERSION_COLOR.pdf).
 *
 * @augments TempNode
 * @three_import import { ao } from 'three/addons/tsl/display/GTAONode.js';
 */
class GTAONode extends TempNode {

	static get type() {

		return 'GTAONode';

	}

	/**
	 * Constructs a new GTAO node.
	 *
	 * @param {Node<float>} depthNode - A node that represents the scene's depth.
	 * @param {?Node<vec3>} normalNode - A node that represents the scene's normals.
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
		 * A node that represents the scene's normals. If no normals are passed to the
		 * constructor (because MRT is not available), normals can be automatically
		 * reconstructed from depth values in the shader.
		 *
		 * @type {?Node<vec3>}
		 */
		this.normalNode = normalNode;

		/**
		 * Backing field for {@link GTAONode#resolutionScale}.
		 *
		 * @private
		 * @type {number}
		 */
		this._resolutionScale = 1;

		/**
		 * The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node renders
		 * its effect once per frame in `updateBefore()`.
		 *
		 * @type {string}
		 * @default 'frame'
		 */
		this.updateBeforeType = NodeUpdateType.FRAME;

		/**
		 * The render target the ambient occlusion is rendered into.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._aoRenderTarget = new RenderTarget( 1, 1, { depthBuffer: false, format: RedFormat } );
		this._aoRenderTarget.texture.name = 'GTAONode.AO';

		/**
		 * Render target the denoise pass writes into; the public output texture
		 * always reads from this target. When {@link GTAONode#denoise} is `false`
		 * the AO pass writes directly here and the denoise pass is skipped, so
		 * consumers see the same texture binding regardless of the toggle.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._denoiseRenderTarget = new RenderTarget( 1, 1, { depthBuffer: false, format: RedFormat } );
		this._denoiseRenderTarget.texture.name = 'GTAONode.Denoise';
		this._denoiseRenderTarget.texture.minFilter = LinearFilter;
		this._denoiseRenderTarget.texture.magFilter = LinearFilter;

		// Half-res depth target, populated by the downsample pass when
		// resolutionScale < 1. Depth uses Float32 because perspective depth values
		// cluster near 1.0 where Float16 quantizes horizon angles into visible rings.
		this._depthHalfRT = new RenderTarget( 1, 1, { depthBuffer: false, format: RedFormat, type: FloatType } );
		this._depthHalfRT.texture.name = 'GTAONode.DepthHalf';
		this._depthHalfRT.texture.minFilter = NearestFilter;
		this._depthHalfRT.texture.magFilter = NearestFilter;

		// uniforms

		/**
		 * The radius of the ambient occlusion.
		 *
		 * @type {UniformNode<float>}
		 */
		this.radius = uniform( 0.25 );

		/**
		 * The resolution of the effect. Can be scaled via
		 * `resolutionScale`.
		 *
		 * @type {UniformNode<vec2>}
		 */
		this.resolution = uniform( new Vector2() );

		/**
		 * Full screen resolution; used by the downsample passes to map each half-res
		 * texel to its full-res footprint.
		 *
		 * @private
		 * @type {UniformNode<vec2>}
		 */
		this._fullResolution = uniform( new Vector2() );

		/**
		 * The thickness of the ambient occlusion.
		 *
		 * @type {UniformNode<float>}
		 */
		this.thickness = uniform( 1 );

		/**
		 * @deprecated Since the switch to quadratic ray stepping with sphere falloff,
		 * step distribution is fixed at `t²` and this uniform has no effect. Kept for
		 * backward compatibility and will be removed in a future release.
		 *
		 * @type {UniformNode<float>}
		 */
		this.distanceExponent = uniform( 1 );

		/**
		 * @deprecated Replaced by the sphere falloff `mix( max( h, sH ), h, (dist/radius)² )`,
		 * which has no tunable parameter. Kept for backward compatibility and will be
		 * removed in a future release.
		 *
		 * @type {UniformNode<float>}
		 */
		this.distanceFallOff = uniform( 1 );

		/**
		 * The scale of the ambient occlusion.
		 *
		 * @type {UniformNode<float>}
		 */
		this.scale = uniform( 1 );

		/**
		 * How many samples are used to compute the AO.
		 * A higher value results in better quality but also
		 * in a more expensive runtime behavior.
		 *
		 * @type {UniformNode<float>}
		 */
		this.samples = uniform( 16 );

		/**
		 * Whether to use temporal filtering or not. Setting this property to
		 * `true` requires the usage of `TRAANode`. This will help to reduce noise
		 * although it introduces typical TAA artifacts like ghosting and temporal
		 * instabilities.
		 *
		 * If setting this property to `false`, a manual denoise via `DenoiseNode`
		 * might be required.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.useTemporalFiltering = false;

		/**
		 * Controls the 3×3 cross-bilateral filter applied to the raw AO output.
		 * Each tap is weighted by (spatial Gaussian) × (view-Z similarity) ×
		 * (normal angle similarity), so the filter smooths horizon-scan noise
		 * within a surface but rejects neighbors across silhouettes.
		 *
		 * Unlike `resolutionScale`, this filter runs at any resolution and is
		 * gated purely by this flag.
		 *
		 * Cross-bilateral reconstruction as described in the Activision GTAO
		 * paper, Section 5.5 (and slides 94–96 of the accompanying deck).
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.denoise = false;

		/**
		 * Blue-noise texture sampled for the slice rotation and step jitter.
		 * Generated by Ulichney's void-and-cluster method (see
		 * {@link generateBlueNoiseTexture}); 64×64 two-channel, tileable. Channel
		 * R drives the slice rotation, G drives the per-step phase jitter — both
		 * read from a single texture fetch.
		 *
		 * @private
		 * @type {TextureNode}
		 */
		this._noiseNode = texture( generateBlueNoiseTexture( 64, 2 ) );

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
		 * Temporal direction that influences the rotation angle for each slice.
		 *
		 * @private
		 * @type {UniformNode<float>}
		 */
		this._temporalDirection = uniform( 0 );

		/**
		 * The material that is used to render the effect.
		 *
		 * @private
		 * @type {NodeMaterial}
		 */
		this._material = new NodeMaterial();
		this._material.name = 'GTAO';

		this._depthDownsampleMaterial = new NodeMaterial();
		this._depthDownsampleMaterial.name = 'GTAO.DepthDownsample';

		this._denoiseMaterial = new NodeMaterial();
		this._denoiseMaterial.name = 'GTAO.Denoise';

		/**
		 * The result of the effect is represented as a separate texture node.
		 * Points at the denoise render target — when the denoise pass is
		 * disabled the AO pass writes there directly, so this binding is fixed
		 * regardless of the toggle.
		 *
		 * @private
		 * @type {PassTextureNode}
		 */
		this._textureNode = passTexture( this, this._denoiseRenderTarget.texture );

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
	 * Render resolution as a fraction of the screen size (`1` = full, `0.5` = half).
	 * At `< 1`, a min-Z depth downsample runs first and the AO shader reads from that
	 * half-res target, which avoids the banding caused by silhouette-bleed when the
	 * AO is computed at half-res against the full-res depth input. Normals are still
	 * sampled at full resolution. Crossing the `1` ↔ `< 1` boundary triggers a shader
	 * recompile (the texture binding is decided at compile time).
	 *
	 * @type {number}
	 * @default 1
	 */
	get resolutionScale() {

		return this._resolutionScale;

	}

	set resolutionScale( value ) {

		if ( value === this._resolutionScale ) return;

		const crossedBoundary = ( value === 1 ) !== ( this._resolutionScale === 1 );
		this._resolutionScale = value;

		if ( crossedBoundary && this._material ) {

			this._material.needsUpdate = true;

		}

	}

	/**
	 * Sets the size of the effect.
	 *
	 * @param {number} width - The width of the effect.
	 * @param {number} height - The height of the effect.
	 */
	setSize( width, height ) {

		this._fullResolution.value.set( width, height );

		const lowW = Math.max( 1, Math.round( this._resolutionScale * width ) );
		const lowH = Math.max( 1, Math.round( this._resolutionScale * height ) );

		this.resolution.value.set( lowW, lowH );
		this._aoRenderTarget.setSize( lowW, lowH );
		this._denoiseRenderTarget.setSize( lowW, lowH );

		// Only resize the half-res RT when we'll actually use it. Shrinking it
		// here at scale=1 while the renderer holds cached bindings from a previous
		// scale<1 compile would corrupt later frames.
		if ( this._resolutionScale !== 1 ) {

			this._depthHalfRT.setSize( lowW, lowH );

		}

	}

	/**
	 * This method is used to render the effect once per frame.
	 *
	 * @param {NodeFrame} frame - The current node frame.
	 */
	updateBefore( frame ) {

		const { renderer } = frame;

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		// update temporal uniforms

		if ( this.useTemporalFiltering === true ) {

			const frameId = frame.frameId;

			this._temporalDirection.value = _temporalRotations[ frameId % 6 ] / 360;

		} else {

			this._temporalDirection.value = 0;

		}

		//

		const size = renderer.getDrawingBufferSize( _size );
		this.setSize( size.width, size.height );

		// clear

		renderer.setClearColor( 0xffffff, 1 );

		// Downsample depth to half-res (min-Z foreground-priority) so the AO horizon
		// search runs on a consistent low-res grid and doesn't band on silhouettes
		// from bilinear bleed in the full-res depth input.

		if ( this._resolutionScale !== 1 ) {

			_quadMesh.material = this._depthDownsampleMaterial;
			_quadMesh.name = 'GTAO.DepthDownsample';
			renderer.setRenderTarget( this._depthHalfRT );
			_quadMesh.render( renderer );

		}

		// AO horizon search.
		const aoTarget = this.denoise ? this._aoRenderTarget : this._denoiseRenderTarget;

		_quadMesh.material = this._material;
		_quadMesh.name = 'AO';
		renderer.setRenderTarget( aoTarget );
		_quadMesh.render( renderer );

		// Cross-bilateral denoise of the raw AO. Reads _aoRenderTarget, writes
		// _denoiseRenderTarget at the same resolution. Depth + normal edge-aware
		// weights smooth horizon-scan noise within a surface without bleeding
		// across silhouettes.

		if ( this.denoise ) {

			_quadMesh.material = this._denoiseMaterial;
			_quadMesh.name = 'GTAO.Denoise';
			renderer.setRenderTarget( this._denoiseRenderTarget );
			_quadMesh.render( renderer );

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

		// At scale<1 the AO shader reads depth from the half-res RT populated by the
		// downsample pass; at scale=1 it samples the source node directly. The choice
		// is compile-time — the resolutionScale setter triggers a recompile when
		// crossing the boundary. Normals are always sampled at full-res.
		const useHalfRes = this._resolutionScale !== 1;
		const depthSourceNode = useHalfRes ? texture( this._depthHalfRT.texture ) : this.depthNode;
		const normalSourceNode = this.normalNode;
		const fallbackDepthForNormal = useHalfRes ? this._depthHalfRT.texture : this.depthNode.value;

		const sampleDepth = ( uv ) => {

			const depth = depthSourceNode.sample( uv ).r;

			if ( builder.renderer.logarithmicDepthBuffer === true ) {

				const viewZ = logarithmicDepthToViewZ( depth, this._cameraNear, this._cameraFar );

				return viewZToPerspectiveDepth( viewZ, this._cameraNear, this._cameraFar );

			}

			return depth;

		};

		const sampleNoise = ( uv ) => this._noiseNode.sample( uv );
		const sampleNormal = ( uv ) => ( normalSourceNode !== null )
			? normalSourceNode.sample( uv ).rgb.normalize()
			: getNormalFromDepth( uv, fallbackDepthForNormal, this._cameraProjectionMatrixInverse );

		const ao = Fn( () => {

			const depth = sampleDepth( uvNode ).toVar();

			depth.greaterThanEqual( 1.0 ).discard();

			const viewPosition = getViewPosition( uvNode, depth, this._cameraProjectionMatrixInverse ).toVar();
			const viewNormal = sampleNormal( uvNode ).toVar();

			const radiusToUse = this.radius;

			// Tile the blue-noise texture across the screen at its native resolution.
			const noiseResolution = textureSize( this._noiseNode, 0 );
			const noiseUv = uvNode.mul( this.resolution.div( noiseResolution ) );

			// R and G are independent blue-noise patterns generated with different
			// seeds, so one fetch gives a decorrelated pair. `noise1` → slice
			// rotation, `noise2` → per-step phase jitter.
			const noiseSample = sampleNoise( noiseUv );
			const noise1 = noiseSample.r;
			const noise2 = noiseSample.g;

			// Random tangent direction from noise1, used to rotate the per-slice azimuth.
			const tangentAngle = noise1.mul( PI ).mul( 2.0 );
			const tangent = vec3( cos( tangentAngle ), sin( tangentAngle ), 0.0 );
			const bitangent = vec3( tangent.y.mul( - 1.0 ), tangent.x, 0.0 );
			const kernelMatrix = mat3( tangent, bitangent, vec3( 0.0, 0.0, 1.0 ) );

			const DIRECTIONS = this.samples.lessThan( 30 ).select( 3, 5 ).toVar();
			const STEPS = add( this.samples, DIRECTIONS.sub( 1 ) ).div( DIRECTIONS ).toVar();

			const ao = float( 0 ).toVar();

			// Each iteration analyzes one vertical "slice" of the 3D space around the fragment.

			// Per-step phase jitter for spatio-temporal decorrelation.
			// (Activision GTAO slides 86, 92–93 "Noise Distribution".)
			const stepJitter = noise2.toVar();

			Loop( { start: int( 0 ), end: DIRECTIONS, type: 'int', condition: '<' }, ( { i } ) => {

				const angle = float( i ).div( float( DIRECTIONS ) ).mul( PI ).add( this._temporalDirection ).toVar();
				const sampleDir = vec3( cos( angle ), sin( angle ), 0 ).toVar();
				sampleDir.assign( normalize( kernelMatrix.mul( sampleDir ) ) );

				const viewDir = normalize( viewPosition.xyz.negate() ).toVar();
				const sliceBitangent = normalize( cross( sampleDir, viewDir ) ).toVar();
				const sliceTangent = cross( sliceBitangent, viewDir ).toVar();

				// Project the view normal onto the slice plane (remove component along sliceBitangent).
				// The unnormalized length is the foreshortening weight applied at slice integration.
				// (Activision GTAO paper, Section 3.2 "Per-pixel sampling".)
				const projNRaw = viewNormal.sub( sliceBitangent.mul( dot( viewNormal, sliceBitangent ) ) ).toVar();
				const projNLen = projNRaw.length().toVar();
				const projN = projNRaw.div( max( projNLen, float( 0.0001 ) ) ).toVar();

				// γ — angle of projN within the slice plane, signed by the tangent direction.
				const nSin = dot( projN, sliceTangent ).toVar();
				const nCos = clamp( dot( projN, viewDir ), 0, 1 ).toVar();
				const signNSin = nSin.greaterThanEqual( 0 ).select( float( 1 ), float( - 1 ) );
				const angleN = signNSin.mul( acos( nCos ) ).toVar();

				const tangentToNormalInSlice = cross( projN, sliceBitangent ).toVar();
				const cosHorizons = vec2( dot( viewDir, tangentToNormalInSlice ), dot( viewDir, tangentToNormalInSlice.negate() ) ).toVar();

				// For each slice, the inner loop performs ray marching to find the horizons.

				Loop( { end: STEPS, type: 'int', name: 'j', condition: '<' }, ( { j } ) => {

					// Quadratic step distribution ( sampleDist = t² ) concentrates samples in the
					// near-field. (Blender's Eevee adaptation)
					const t = float( j ).add( 1.0 ).add( stepJitter ).div( STEPS ).toVar();
					const sampleDist = t.mul( t );
					const sampleViewOffset = sampleDir.mul( radiusToUse ).mul( sampleDist );

					// The loop marches in two opposite directions (x and y) along the slice's line to find the horizon on both sides.

					// x

					const sampleScreenPositionX = getScreenPosition( viewPosition.add( sampleViewOffset ), this._cameraProjectionMatrix ).toVar();
					const sampleDepthX = sampleDepth( sampleScreenPositionX ).toVar();
					const sampleSceneViewPositionX = getViewPosition( sampleScreenPositionX, sampleDepthX, this._cameraProjectionMatrixInverse ).toVar();
					const viewDeltaX = sampleSceneViewPositionX.sub( viewPosition ).toVar();
					const lenX = viewDeltaX.length().toVar();

					// Manual normalize guards against zero-length delta.
					const sHX = dot( viewDir, viewDeltaX.div( max( lenX, float( 0.0001 ) ) ) );

					// Sphere falloff: ( dist / radius )² fades the sample's horizon contribution
					// back toward the prior horizon as it approaches the radius boundary.
					// (squared variant of the paper's near-field attenuation;
					// Activision GTAO paper, Section 4.3 "Bounding the sampling area")
					const distFacX = clamp( lenX.div( radiusToUse ), 0, 1 );
					const distFacSqX = distFacX.mul( distFacX );

					If( abs( viewDeltaX.z ).lessThan( this.thickness ), () => {

						cosHorizons.x.assign( mix( max( cosHorizons.x, sHX ), cosHorizons.x, distFacSqX ) );

					} );

					// y

					const sampleScreenPositionY = getScreenPosition( viewPosition.sub( sampleViewOffset ), this._cameraProjectionMatrix ).toVar();
					const sampleDepthY = sampleDepth( sampleScreenPositionY ).toVar();
					const sampleSceneViewPositionY = getViewPosition( sampleScreenPositionY, sampleDepthY, this._cameraProjectionMatrixInverse ).toVar();
					const viewDeltaY = sampleSceneViewPositionY.sub( viewPosition ).toVar();
					const lenY = viewDeltaY.length().toVar();

					const sHY = dot( viewDir, viewDeltaY.div( max( lenY, float( 0.0001 ) ) ) );

					const distFacY = clamp( lenY.div( radiusToUse ), 0, 1 );
					const distFacSqY = distFacY.mul( distFacY );

					If( abs( viewDeltaY.z ).lessThan( this.thickness ), () => {

						cosHorizons.y.assign( mix( max( cosHorizons.y, sHY ), cosHorizons.y, distFacSqY ) );

					} );

				} );

				// Cosine-weighted inner integral, closed-form (Activision GTAO paper, Eq. 7).
				// Per horizon h_i:    term_i = −cos( 2 h_i − γ ) + cos( γ ) + 2 h_i sin( γ )
				// The 0.25 factor is ½ (integral normalization) × ½ (averaging the two horizons).
				//
				// In this slice setup `sliceTangent = cross( sliceBitangent, viewDir )` works out
				// opposite to `sampleDir`, so the +sampleDir samples (cosHorizons.x) live on the
				// −T side of the slice and −sampleDir samples (cosHorizons.y) on the +T side.
				// γ is signed by +T (sliceTangent), so hPos must read from cosHorizons.y.

				const hPos = acos( cosHorizons.y ).toVar();
				const hNeg = acos( cosHorizons.x ).negate().toVar();

				const termPos = cos( hPos.mul( 2 ).sub( angleN ) ).negate().add( nCos ).add( hPos.mul( 2 ).mul( nSin ) );
				const termNeg = cos( hNeg.mul( 2 ).sub( angleN ) ).negate().add( nCos ).add( hNeg.mul( 2 ).mul( nSin ) );
				const a = termPos.add( termNeg ).mul( 0.25 );

				// |projN| is the foreshortening weight from the per-slice normal projection.
				ao.addAssign( projNLen.mul( a ) );

			} );

			ao.assign( clamp( ao.div( DIRECTIONS ), 0, 1 ) );
			ao.assign( pow( ao, this.scale ) );

			return ao;

		} );

		this._material.fragmentNode = ao().context( builder.getSharedContext() );
		this._material.needsUpdate = true;

		// ─── Cross-bilateral denoise ───────────────────────────────────────────
		//
		// 3×3 spatial filter over the raw AO. Each tap is weighted by
		// (spatial Gaussian) × (view-Z similarity) × (normal angle similarity).
		// The center pixel is included with full weight (1×1×1). Sky neighbors
		// (depth ≥ 1.0) are naturally rejected by the depth weight because
		// their view-Z sits at −far.
		//
		// Operates at the AO target's resolution and reads the same depth /
		// normal sources the AO pass uses (full-res when resolutionScale = 1,
		// the half-res RTs otherwise), so the depth / normal at each tap stays
		// aligned with the AO texel it produced. The material is always built so
		// the `denoise` flag can be toggled at runtime without a recompile.
		//
		// Cross-bilateral reconstruction as described in the Activision GTAO
		// paper, Section 5.5, and slides 94–96 of the accompanying deck
		// (https://www.activision.com/cdn/research/s2016_pbs_activision_occlusion.pptx),
		// which present the spatial bilateral filter and its depth/normal edge guards.

		const aoTextureNode = texture( this._aoRenderTarget.texture );

		const denoise = Fn( () => {

			const centerDepth = sampleDepth( uvNode ).toVar();

			// Sky pixels short-circuit. The render target clears to white (set in
			// updateBefore via setClearColor( 0xffffff, 1 )), so discarding here
			// leaves the sky reading as visibility = 1 (no occlusion).
			centerDepth.greaterThanEqual( 1.0 ).discard();

			const centerViewZ = perspectiveDepthToViewZ( centerDepth, this._cameraNear, this._cameraFar ).toVar();
			const centerNormal = sampleNormal( uvNode ).toVar();
			const texelSize = vec2( 1 ).div( this.resolution ).toVar();

			const totalAO = float( 0 ).toVar();
			const totalW = float( 0 ).toVar();

			for ( let dy = - 1; dy <= 1; dy ++ ) {

				for ( let dx = - 1; dx <= 1; dx ++ ) {

					const sUv = uvNode.add( vec2( dx, dy ).mul( texelSize ) );
					const sDepth = sampleDepth( sUv ).toVar();
					const sAO = aoTextureNode.sample( sUv ).r;
					const sViewZ = perspectiveDepthToViewZ( sDepth, this._cameraNear, this._cameraFar );
					const sNormal = sampleNormal( sUv );

					// Spatial Gaussian, σ ≈ 1 texel. dx / dy are loop-unrolled
					// compile-time constants, so this folds to a literal float.
					const spatialW = float( Math.exp( - 0.5 * ( dx * dx + dy * dy ) ) );

					// View-Z difference falloff — rejects neighbors more than
					// ~0.5 view-space units away at the chosen sharpness.
					const depthDiff = abs( centerViewZ.sub( sViewZ ) );
					const depthW = exp( depthDiff.negate().mul( 2.0 ) );

					// Normal angle similarity. pow( ·, 8 ) sharpens the cutoff
					// so a ~30° normal difference roughly halves the weight.
					const normalW = pow( max( dot( centerNormal, sNormal ), 0 ), float( 8 ) );

					const w = spatialW.mul( depthW ).mul( normalW );

					totalAO.addAssign( sAO.mul( w ) );
					totalW.addAssign( w );

				}

			}

			return vec4( totalAO.div( max( totalW, float( 0.0001 ) ) ), 0, 0, 1 );

		} );

		this._denoiseMaterial.fragmentNode = denoise().context( builder.getSharedContext() );
		this._denoiseMaterial.needsUpdate = true;

		// At scale=1 the downsample passes are skipped, so building their fragment
		// nodes is dead work. Recompile when crossing the boundary picks the right path.
		if ( ! useHalfRes ) {

			return this._textureNode;

		}

		// Each half-res output texel covers ratio×ratio full-res texels (ratio =
		// fullRes / lowRes). Sample at integer-pixel-center UVs so `.sample()` reads
		// the exact texel with no bilinear bleed and stays valid on multisampled depth.
		const computeFullResFootprint = () => {

			const ratio = this._fullResolution.div( this.resolution );
			const baseFull = uv().mul( this.resolution ).floor().mul( ratio );
			const sampleAt = ( i, j ) => baseFull.add( vec2( i, j ).mul( ratio.sub( 1 ).max( 0 ) ) ).add( 0.5 ).div( this._fullResolution );
			return { sampleAt };

		};

		// Depth: min-Z over the 2×2 footprint (foreground priority — half-res depth
		// is always a real surface depth, never a phantom mid-silhouette value).
		const depthDownsample = Fn( () => {

			const { sampleAt } = computeFullResFootprint();
			const d00 = this.depthNode.sample( sampleAt( 0, 0 ) ).r.toVar();
			const d10 = this.depthNode.sample( sampleAt( 1, 0 ) ).r.toVar();
			const d01 = this.depthNode.sample( sampleAt( 0, 1 ) ).r.toVar();
			const d11 = this.depthNode.sample( sampleAt( 1, 1 ) ).r.toVar();
			return vec4( min( min( d00, d10 ), min( d01, d11 ) ), 0, 0, 1 );

		} );

		this._depthDownsampleMaterial.fragmentNode = depthDownsample().context( builder.getSharedContext() );
		this._depthDownsampleMaterial.needsUpdate = true;

		return this._textureNode;

	}

	/**
	 * Frees internal resources. This method should be called
	 * when the effect is no longer required.
	 */
	dispose() {

		this._aoRenderTarget.dispose();
		this._depthHalfRT.dispose();
		this._denoiseRenderTarget.dispose();

		this._material.dispose();
		this._depthDownsampleMaterial.dispose();
		this._denoiseMaterial.dispose();

	}

}

export default GTAONode;

/**
 * TSL function for creating a Ground Truth Ambient Occlusion (GTAO) effect.
 *
 * @tsl
 * @function
 * @param {Node<float>} depthNode - A node that represents the scene's depth.
 * @param {?Node<vec3>} normalNode - A node that represents the scene's normals.
 * @param {Camera} camera - The camera the scene is rendered with.
 * @returns {GTAONode}
 */
export const ao = ( depthNode, normalNode, camera ) => new GTAONode( nodeObject( depthNode ), nodeObject( normalNode ), camera );
