import { RenderTarget, Vector2, TempNode, QuadMesh, NodeMaterial, RendererUtils, RedFormat, RGBAFormat, HalfFloatType, FloatType, NearestFilter } from 'three/webgpu';
import { reference, logarithmicDepthToViewZ, viewZToPerspectiveDepth, getNormalFromDepth, getScreenPosition, getViewPosition, nodeObject, Fn, float, NodeUpdateType, uv, uniform, Loop, vec2, vec3, vec4, int, dot, max, min, pow, abs, If, textureSize, sin, cos, PI, texture, passTexture, normalize, mul, cross, mix, acos, clamp } from 'three/tsl';
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
 * The integration uses two perpendicular slices with the cosine-weighted closed-form
 * inner integral (Eq. 7) and per-slice normal projection from the Activision paper.
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

		// Half-res depth / normal targets, populated by the downsample passes when
		// resolutionScale < 1. Depth uses Float32 because perspective depth values
		// cluster near 1.0 where Float16 quantizes horizon angles into visible rings.
		this._depthHalfRT = new RenderTarget( 1, 1, { depthBuffer: false, format: RedFormat, type: FloatType } );
		this._depthHalfRT.texture.name = 'GTAONode.DepthHalf';
		this._depthHalfRT.texture.minFilter = NearestFilter;
		this._depthHalfRT.texture.magFilter = NearestFilter;

		this._normalHalfRT = new RenderTarget( 1, 1, { depthBuffer: false, format: RGBAFormat, type: HalfFloatType } );
		this._normalHalfRT.texture.name = 'GTAONode.NormalHalf';
		this._normalHalfRT.texture.minFilter = NearestFilter;
		this._normalHalfRT.texture.magFilter = NearestFilter;

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
		 * Total ray-march sample budget used to compute the AO.
		 * The implementation uses 2 perpendicular slices, so each slice marches
		 * `samples / 2` steps. A higher value yields better quality at higher cost.
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
		 * Blue-noise texture sampled for the slice direction and step jitter.
		 * Generated by Ulichney's void-and-cluster method (see
		 * {@link generateBlueNoiseTexture}); 64×64 single-channel, tileable.
		 *
		 * @private
		 * @type {TextureNode}
		 */
		this._noiseNode = texture( generateBlueNoiseTexture( 64 ) );

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

		this._normalDownsampleMaterial = new NodeMaterial();
		this._normalDownsampleMaterial.name = 'GTAO.NormalDownsample';

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
	 * Render resolution as a fraction of the screen size (`1` = full, `0.5` = half).
	 * At `< 1`, a min-Z depth + matching normal downsample runs first and the AO
	 * shader reads from those half-res targets. Crossing the `1` ↔ `< 1` boundary
	 * triggers a shader recompile (texture binding is decided at compile time).
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

		// Only resize the half-res RTs when we'll actually use them. Shrinking them
		// here at scale=1 while the renderer holds cached bindings from a previous
		// scale<1 compile would corrupt later frames.
		if ( this._resolutionScale !== 1 ) {

			this._depthHalfRT.setSize( lowW, lowH );
			this._normalHalfRT.setSize( lowW, lowH );

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

		renderer.setClearColor( 0xffffff, 1 );

		// Downsample depth + normal to half-res (min-Z foreground-priority) so the
		// AO horizon search runs on a consistent low-res grid.
		if ( this._resolutionScale !== 1 ) {

			_quadMesh.material = this._depthDownsampleMaterial;
			_quadMesh.name = 'GTAO.DepthDownsample';
			renderer.setRenderTarget( this._depthHalfRT );
			_quadMesh.render( renderer );

			if ( this.normalNode !== null ) {

				_quadMesh.material = this._normalDownsampleMaterial;
				_quadMesh.name = 'GTAO.NormalDownsample';
				renderer.setRenderTarget( this._normalHalfRT );
				_quadMesh.render( renderer );

			}

		}

		// ao

		_quadMesh.material = this._material;
		_quadMesh.name = 'AO';

		renderer.setRenderTarget( this._aoRenderTarget );
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

		// At scale<1 the AO shader reads from half-res RTs populated by Pass A / B;
		// at scale=1 it samples the source nodes directly. The choice is compile-time
		// — the resolutionScale setter triggers a recompile when crossing the boundary.
		const useHalfRes = this._resolutionScale !== 1;
		const depthSourceNode = useHalfRes ? texture( this._depthHalfRT.texture ) : this.depthNode;
		const normalSourceNode = ( this.normalNode !== null )
			? ( useHalfRes ? texture( this._normalHalfRT.texture ) : this.normalNode )
			: null;
		const fallbackDepthForNormal = useHalfRes ? this._depthHalfRT.texture : this.depthNode.value;

		const sampleDepth = ( uv ) => {

			const depth = depthSourceNode.sample( uv ).r;

			if ( builder.renderer.logarithmicDepthBuffer === true ) {

				const viewZ = logarithmicDepthToViewZ( depth, this._cameraNear, this._cameraFar );

				return viewZToPerspectiveDepth( viewZ, this._cameraNear, this._cameraFar );

			}

			return depth;

		};

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

			// Single-channel blue noise: take two samples with a half-texture UV offset
			// for a decorrelated second channel. `noise1` → slice azimuth, `noise2` →
			// per-step phase jitter.
			const noise1 = this._noiseNode.sample( noiseUv ).r;
			const noise2 = this._noiseNode.sample( noiseUv.add( vec2( 0.5, 0.5 ) ) ).r;

			// View direction (perspective camera: normalize( -viewPosition )).
			const viewDir = normalize( viewPosition.xyz.negate() ).toVar();

			// Initial slice azimuth, randomized via the noise texture and a temporal offset.
			// Two perpendicular slices cover the [0, π) azimuth range, so a quarter turn (π/2)
			// of jitter is sufficient to randomize across frames.
			const sliceAngle = noise1.add( this._temporalDirection ).mul( PI ).mul( 0.5 ).toVar();
			const sliceDir = vec2( cos( sliceAngle ), sin( sliceAngle ) ).toVar();

			// Phase-shifted per-step jitter: shifts the step index by [0, 0.5) of a step
			// interval before the t² distribution is applied. This gives sub-step
			// temporal decorrelation without compressing the near-field samples.
			// (Activision GTAO paper, Section 5.4; matches Blender EEVEE-Next.)
			const stepJitter = mul( 0.5, noise2 ).toVar();

			// Two perpendicular slices total. STEPS is per-slice, so total marches ≈ samples
			// (preserves the legacy semantics of the `samples` uniform).
			const STEPS = max( this.samples.div( 2 ), float( 1 ) ).toVar();

			const visibility = float( 0 ).toVar();

			// Hemisphere clamp: ±( π/2 − ε ) around the projected normal angle. The 0.05 rad bias
			// reduces self-shadowing artifacts at grazing angles. (Activision GTAO paper, Fig. 11.)
			const HEMISPHERE_MAX_ANGLE = float( Math.PI * 0.5 - 0.05 );

			// Each iteration analyzes one azimuthal slice of the 3D space around the fragment.

			Loop( { start: int( 0 ), end: int( 2 ), type: 'int', condition: '<' }, () => {

				// Per-slice orthonormal basis in view space:
				//   T: tangent along the slice direction
				//   B: bitangent (slice plane normal)
				// T is re-orthogonalized against viewDir so the slice plane contains viewDir exactly.
				const T_init = normalize( vec3( sliceDir, 0 ) ).toVar();
				const B = normalize( cross( viewDir, T_init ) ).toVar();
				const T = normalize( cross( B, viewDir ) ).toVar();

				// Project the view normal onto the slice plane (remove component along B).
				// The unnormalized length is the foreshortening weight applied at slice integration.
				// (Activision GTAO paper, Section 3.2 "Per-pixel sampling".)
				const projNRaw = viewNormal.sub( B.mul( dot( viewNormal, B ) ) ).toVar();
				const projNLen = projNRaw.length().toVar();
				const projN = projNRaw.div( max( projNLen, float( 0.0001 ) ) ).toVar();

				// γ — angle of projN within the slice plane, signed by the tangent direction.
				const nSin = dot( projN, T ).toVar();
				const nCos = clamp( dot( projN, viewDir ), 0, 1 ).toVar();
				const signNSin = nSin.greaterThanEqual( 0 ).select( float( 1 ), float( - 1 ) );
				const angleN = signNSin.mul( acos( nCos ) ).toVar();

				// Horizon cosines (one per direction along T). Initialized to cos( π ) = −1 (no occluder).
				const cosHPos = float( - 1 ).toVar();
				const cosHNeg = float( - 1 ).toVar();

				// Inner loop ray-marches both directions of the slice to find the horizons.

				Loop( { end: STEPS, type: 'int', name: 'j', condition: '<' }, ( { j } ) => {

					// Quadratic step distribution: t = ( j + 1 + jitter ) / STEPS, sampleDist = t².
					// Concentrates samples in the near-field where AO detail matters and lets the
					// far end of the ray reach the full radius. (Activision GTAO paper, Section 5.3.)
					const t = float( j ).add( 1.0 ).add( stepJitter ).div( STEPS ).toVar();
					const sampleDist = t.mul( t );
					const sampleOffset = T.mul( radiusToUse ).mul( sampleDist );

					// Positive direction along T.

					const sampleScreenPositionX = getScreenPosition( viewPosition.add( sampleOffset ), this._cameraProjectionMatrix ).toVar();
					const sampleDepthX = sampleDepth( sampleScreenPositionX ).toVar();
					const sampleSceneViewPositionX = getViewPosition( sampleScreenPositionX, sampleDepthX, this._cameraProjectionMatrixInverse ).toVar();
					const omegaX = sampleSceneViewPositionX.sub( viewPosition ).toVar();
					const lenX = omegaX.length().toVar();

					// Horizon angle cosine. Manual normalize guards against zero-length omega.
					const sHX = dot( viewDir, omegaX.div( max( lenX, float( 0.0001 ) ) ) );

					// Sphere falloff: squared normalized distance to the radius boundary.
					// distFac² = ( clamp( dist / radius, 0, 1 ) )² — 0 at the fragment, 1 at the radius.
					const distFacX = clamp( lenX.div( radiusToUse ), 0, 1 );
					const distFacSqX = distFacX.mul( distFacX );

					If( abs( omegaX.z ).lessThan( this.thickness ), () => {

						// Smoothly relax the new horizon contribution back to the prior horizon as
						// the sample approaches the radius boundary. At distFac=0 the sample is
						// fully considered ( max( h, sH ) ); at distFac=1 it has no effect.
						cosHPos.assign( mix( max( cosHPos, sHX ), cosHPos, distFacSqX ) );

					} );

					// Negative direction along T.

					const sampleScreenPositionY = getScreenPosition( viewPosition.sub( sampleOffset ), this._cameraProjectionMatrix ).toVar();
					const sampleDepthY = sampleDepth( sampleScreenPositionY ).toVar();
					const sampleSceneViewPositionY = getViewPosition( sampleScreenPositionY, sampleDepthY, this._cameraProjectionMatrixInverse ).toVar();
					const omegaY = sampleSceneViewPositionY.sub( viewPosition ).toVar();
					const lenY = omegaY.length().toVar();

					const sHY = dot( viewDir, omegaY.div( max( lenY, float( 0.0001 ) ) ) );

					const distFacY = clamp( lenY.div( radiusToUse ), 0, 1 );
					const distFacSqY = distFacY.mul( distFacY );

					If( abs( omegaY.z ).lessThan( this.thickness ), () => {

						cosHNeg.assign( mix( max( cosHNeg, sHY ), cosHNeg, distFacSqY ) );

					} );

				} );

				// Convert horizon cosines to angles. The negative-side horizon is negated to express
				// it on the opposite side of T (so hPos > 0 > hNeg).
				const hPos = acos( cosHPos ).toVar();
				const hNeg = acos( cosHNeg ).negate().toVar();

				// Clamp horizons to the hemisphere around the (projected) shading normal.
				const hPosLimit = angleN.add( HEMISPHERE_MAX_ANGLE );
				hPos.assign( hPos.lessThan( hPosLimit ).select( hPos, hPosLimit ) );

				const hNegLimit = angleN.sub( HEMISPHERE_MAX_ANGLE );
				hNeg.assign( hNeg.greaterThan( hNegLimit ).select( hNeg, hNegLimit ) );

				// Cosine-weighted inner integral, closed-form (Activision GTAO paper, Eq. 7).
				// Per horizon h_i:    term_i = −cos( 2 h_i − γ ) + cos( γ ) + 2 h_i sin( γ )
				// The 0.25 factor is ½ (integral normalization) × ½ (averaging the two horizons).
				const termPos = cos( hPos.mul( 2 ).sub( angleN ) ).negate().add( nCos ).add( hPos.mul( 2 ).mul( nSin ) );
				const termNeg = cos( hNeg.mul( 2 ).sub( angleN ) ).negate().add( nCos ).add( hNeg.mul( 2 ).mul( nSin ) );
				const a = termPos.add( termNeg ).mul( 0.25 );

				// |projN| is the foreshortening weight from the per-slice normal projection.
				visibility.addAssign( projNLen.mul( a ) );

				// Rotate slice direction 90° for the perpendicular second slice.
				sliceDir.assign( vec2( sliceDir.y.negate(), sliceDir.x ) );

			} );

			// Average over the 2 slices, clamp, and apply user-tunable scale (power curve).
			visibility.assign( clamp( visibility.mul( 0.5 ), 0, 1 ) );
			visibility.assign( pow( visibility, this.scale ) );

			return visibility;

		} );

		this._material.fragmentNode = ao().context( builder.getSharedContext() );
		this._material.needsUpdate = true;

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

		// Normal: pick the normal at the texel whose depth wins min-Z, so depth +
		// normal stay on the same surface.
		if ( this.normalNode !== null ) {

			const normalDownsample = Fn( () => {

				const { sampleAt } = computeFullResFootprint();
				const uv00 = sampleAt( 0, 0 ), uv10 = sampleAt( 1, 0 ), uv01 = sampleAt( 0, 1 ), uv11 = sampleAt( 1, 1 );
				const d00 = this.depthNode.sample( uv00 ).r.toVar();
				const d10 = this.depthNode.sample( uv10 ).r.toVar();
				const d01 = this.depthNode.sample( uv01 ).r.toVar();
				const d11 = this.depthNode.sample( uv11 ).r.toVar();
				const n00 = this.normalNode.sample( uv00 ).rgb;
				const n10 = this.normalNode.sample( uv10 ).rgb;
				const n01 = this.normalNode.sample( uv01 ).rgb;
				const n11 = this.normalNode.sample( uv11 ).rgb;

				const winLeft = d00.lessThanEqual( d01 );
				const dLeft = winLeft.select( d00, d01 );
				const nLeft = winLeft.select( n00, n01 );
				const winRight = d10.lessThanEqual( d11 );
				const dRight = winRight.select( d10, d11 );
				const nRight = winRight.select( n10, n11 );
				return vec4( dLeft.lessThanEqual( dRight ).select( nLeft, nRight ), 1 );

			} );

			this._normalDownsampleMaterial.fragmentNode = normalDownsample().context( builder.getSharedContext() );
			this._normalDownsampleMaterial.needsUpdate = true;

		}

		return this._textureNode;

	}

	/**
	 * Frees internal resources. This method should be called
	 * when the effect is no longer required.
	 */
	dispose() {

		this._aoRenderTarget.dispose();
		this._depthHalfRT.dispose();
		this._normalHalfRT.dispose();

		this._noiseNode.value.dispose();

		this._material.dispose();
		this._depthDownsampleMaterial.dispose();
		this._normalDownsampleMaterial.dispose();

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
