import { RenderTarget, HalfFloatType, TempNode, QuadMesh, NodeMaterial, RendererUtils, Vector2, Vector3, Vector4, Color, DataTexture, RGBAFormat, FloatType, RepeatWrapping, NearestFilter } from 'three/webgpu';
import { Fn, float, vec2, vec3, vec4, int, uv, uniform, uniformArray, Loop, texture, passTexture, NodeUpdateType, If, abs, max, min, exp, sqrt, pow, mix, dot, cross, normalize, clamp, fract, cos, sin, screenCoordinate } from 'three/tsl';

const _quadMesh = /*@__PURE__*/ new QuadMesh();
const _size = /*@__PURE__*/ new Vector2();

let _rendererState;

const _GOLDEN_RATIO = ( 1 + Math.sqrt( 5 ) ) / 2;
const _MAX_SAMPLES = 64;

/**
 * Numerically inverts the Burley normalized diffusion CDF using Halley's method.
 * Used to importance-sample the diffusion profile by mapping uniform random
 * values to radial distances.
 *
 * @param {number} u - Uniform sample in (0, 1).
 * @param {number} s - Burley shape parameter (controls falloff width).
 * @param {number} [iterations=12] - Number of Halley iterations.
 * @returns {number} Radial distance r such that CDF(r) ≈ u.
 */
function _invertBurleyCDF( u, s, iterations = 12 ) {

	let r = - Math.log( Math.max( 1 - u, 1e-10 ) ) / s;

	for ( let i = 0; i < iterations; i ++ ) {

		const esr = Math.exp( - s * r );
		const esr3 = Math.exp( ( - s * r ) / 3 );
		const f = 1 - 0.25 * esr - 0.75 * esr3 - u;
		const fp = ( s / 4 ) * ( esr + esr3 );
		const fpp = ( ( - s * s ) / 4 ) * esr + ( ( - s * s ) / 12 ) * esr3;
		const denom = 2 * fp * fp - f * fpp;
		if ( Math.abs( denom ) < 1e-14 ) break;
		const delta = ( 2 * f * fp ) / denom;
		r -= delta;
		r = Math.max( r, 0 );
		if ( Math.abs( delta ) < 1e-10 ) break;

	}

	return r;

}

/**
 * Precomputes a Fibonacci-spiral disk of importance-sampled Burley diffusion
 * profile offsets. Each entry is a `Vector3(x, y, r)` where `(x, y)` is the
 * unit-disk direction and `r` is the radial distance drawn from the profile CDF.
 *
 * @param {number} numSamples - Number of samples to generate.
 * @returns {Vector3[]} Array of sample offsets.
 */
function _precomputeSamples( numSamples ) {

	const s = 1.0;
	const samples = [];

	for ( let i = 0; i < numSamples; i ++ ) {

		const u = ( i + 0.5 ) / numSamples;
		const r = _invertBurleyCDF( u, s );
		const phi = 2 * Math.PI * ( ( i / _GOLDEN_RATIO ) % 1 );
		samples.push( new Vector3( r * Math.cos( phi ), r * Math.sin( phi ), r ) );

	}

	return samples;

}

/**
 * Generates a tiling texture of per-texel white-noise scalars in `[0, 1)`, read
 * from the red channel to seed the per-pixel rotation of the sample disk and break
 * up structured blur patterns.
 *
 * @param {number} [size=64] - Width and height of the square texture in texels.
 * @returns {DataTexture} RGBA float texture (the scalar is stored in rgb, alpha = 1).
 */
function _generateWhiteNoiseTexture( size = 64 ) {

	const data = new Float32Array( size * size * 4 );

	for ( let i = 0; i < size * size; i ++ ) {

		const v = Math.random();
		data[ i * 4 ] = v;
		data[ i * 4 + 1 ] = v;
		data[ i * 4 + 2 ] = v;
		data[ i * 4 + 3 ] = 1;

	}

	const tex = new DataTexture( data, size, size, RGBAFormat, FloatType );
	tex.wrapS = RepeatWrapping;
	tex.wrapT = RepeatWrapping;
	tex.minFilter = NearestFilter;
	tex.magFilter = NearestFilter;
	tex.needsUpdate = true;
	return tex;

}

const TEXTURING_MODE = {
	NONE: 0,
	PRE_AND_POST_SCATTER: 1,
	POST_SCATTER: 2,
};

/**
 * Screen-space subsurface scattering (SSSS) post-processing node.
 *
 * Blurs the lit scene color using a Burley normalized diffusion profile sampled
 * in screen space, with optional albedo-aware texturing modes.
 *
 * Requires the scene to be rendered with an MRT that exposes a separate albedo
 * attachment (rgb = base color, a = SSS slot index, 0 = no SSS). Declare the
 * attachment with `a = 0` as the non-SSS default; {@link MeshSubsurfaceNodeMaterial}
 * writes its assigned slot into `albedo.a` automatically.
 *
 * ```js
 * const renderPipeline = new RenderPipeline( renderer );
 * const scenePass = pass( scene, camera );
 * scenePass.setMRT( mrt( {
 * 	output: output,
 * 	albedo: vec4( diffuseColor.rgb, 0.0 ),
 * } ) );
 *
 * const sss = subsurfaceScattering(
 * 	scenePass.getTextureNode( 'output' ),
 * 	scenePass.getTextureNode( 'depth' ),
 * 	scenePass.getTextureNode( 'albedo' ),
 * 	camera, scene
 * );
 *
 * renderPipeline.outputNode = sss.getTextureNode();
 * ```
 *
 * References:
 * - {@link https://advances.realtimerendering.com/s2018/Efficient%20screen%20space%20subsurface%20scattering%20Siggraph%202018.pdf}
 * - {@link https://graphics.pixar.com/library/ApproxBSSRDF/}
 *
 * @augments TempNode
 * @three_import import { subsurfaceScattering } from 'three/addons/tsl/display/SSSSNode.js';
 */
class SSSSNode extends TempNode {

	static get type() {

		return 'SSSSNode';

	}

	/**
	 * Constructs a new SSSS node.
	 *
	 * @param {TextureNode} colorNode - Lit scene color from the scene pass.
	 * @param {TextureNode} depthNode - Scene depth texture.
	 * @param {TextureNode} albedoNode - MRT albedo attachment (rgb = base color, a = SSS slot index, 0 = no SSS).
	 * @param {PerspectiveCamera} camera - The scene camera.
	 * @param {Scene} scene - The scene to scan for {@link MeshSubsurfaceNodeMaterial} instances.
	 *   SSSSNode listens to `childadded` / `childremoved` events so materials are discovered
	 *   automatically as objects enter or leave the scene graph.
	 * @param {TextureNode|null} [normalNode=null] - Optional MRT view-space normals texture. When provided,
	 *   the blur disk is oriented on each pixel's tangent plane instead of screen-space, which improves
	 *   accuracy on oblique surfaces. Requires adding a `normals` slot to the scene MRT and passing
	 *   `scenePass.getTextureNode('normals')` here.
	 */
	constructor( colorNode, depthNode, albedoNode, camera, scene, normalNode = null ) {

		super( 'vec4' );

		this.colorNode = colorNode;
		this.depthNode = depthNode;
		this.albedoNode = albedoNode;
		this.normalNode = normalNode;

		this.updateBeforeType = NodeUpdateType.FRAME;

		/**
		 * Maximum blur samples per pixel. The effective tap count used each frame is
		 * this value scaled by {@link SSSSNode#resolutionScale}.
		 *
		 * @type {UniformNode<int>}
		 * @default 32
		 */
		this.samples = uniform( 32 );

		/**
		 * Output visualization mode: 0 = final result, 1 = amplified diff,
		 * 2 = blur only, 3 = depth, 4 = channel weights, 5 = albedo.
		 *
		 * @type {UniformNode<int>}
		 * @default 0
		 */
		this.outputMode = uniform( 0 );

		/**
		 * Fog type: 0 = none, 1 = linear (`THREE.Fog`), 2 = exp2 (`THREE.FogExp2`).
		 * Use `setFog( scene.fog )` to populate all fog uniforms at once.
		 *
		 * @type {UniformNode<float>}
		 * @default 0
		 */
		this.fogType = uniform( 0 );

		/**
		 * Fog color, matching `scene.fog.color`.
		 *
		 * @type {UniformNode<Color>}
		 */
		this.fogColor = uniform( new Color( 1, 1, 1 ) );

		/**
		 * Near distance for linear fog, matching `scene.fog.near`.
		 *
		 * @type {UniformNode<float>}
		 * @default 0
		 */
		this.fogNear = uniform( 0.0 );

		/**
		 * Far distance for linear fog, matching `scene.fog.far`.
		 *
		 * @type {UniformNode<float>}
		 * @default 100
		 */
		this.fogFar = uniform( 100.0 );

		/**
		 * Density for exp2 fog, matching `scene.fog.density`.
		 *
		 * @type {UniformNode<float>}
		 * @default 0.025
		 */
		this.fogDensity = uniform( 0.025 );

		/**
		 * Performance knob in the range `(0, 1]`. Scales the number of diffusion taps
		 * per pixel to `round( samples * resolutionScale )`, striding them across the
		 * full kernel so the blur radius stays the same and only gets noisier (enable
		 * {@link SSSSNode#jitter} with a `TRAANode` to resolve that noise). The output
		 * always stays full resolution.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.resolutionScale = 1;

		/**
		 * Whether to jitter the per-pixel sample rotation over time. Setting this
		 * property to `true` requires the usage of `TRAANode`, which resolves the
		 * resulting noise into a clean image while allowing a lower sample count.
		 * When `false`, the rotation is static so the raw output is stable without
		 * a temporal resolve.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.jitter = false;

		// private

		/**
		 * @private
		 * @type {PerspectiveCamera}
		 */
		this._camera = camera;

		/**
		 * @private
		 * @type {Scene}
		 */
		this._scene = scene;

		// Per-material SSS registry.
		// _sssSlots: sparse array indexed by slot (slot 0 = dummy for non-SSS pixels).
		// _materialSlots: WeakMap(material → slot) for O(1) lookup and GC-friendly storage.
		// _freeSSSSlots: recycled slots from disposed/removed materials.
		this._sssSlots = [ null ];
		this._materialSlots = new WeakMap();
		this._freeSSSSlots = [];
		this._sssBuffer = null;
		this._sssBufferNeedsRebuild = true;

		// Bind handlers so they can be added and removed by reference.
		this._onChildAdded = this._onChildAdded.bind( this );
		this._onChildRemoved = this._onChildRemoved.bind( this );

		/**
		 * @private
		 * @type {RenderTarget}
		 */
		this._sssRenderTarget = new RenderTarget( 1, 1, { depthBuffer: false, type: HalfFloatType } );
		this._sssRenderTarget.texture.name = 'SSSS';

		/**
		 * @private
		 * @type {UniformNode<vec2>}
		 */
		this._resolution = uniform( new Vector2() );

		/**
		 * Effective number of blur taps per pixel: `round( samples * resolutionScale )`,
		 * recomputed each frame. This is the knob `resolutionScale` turns on the
		 * expensive path.
		 *
		 * @private
		 * @type {UniformNode<float>}
		 */
		this._effectiveSamples = uniform( 32 );

		/**
		 * Spacing between consecutive taps within the precomputed kernel
		 * (`samples / effectiveSamples`). A stride > 1 spreads the reduced tap set
		 * across the full kernel so the blur radius stays constant as
		 * `resolutionScale` drops. Equals 1 at full resolution.
		 *
		 * @private
		 * @type {UniformNode<float>}
		 */
		this._sampleStride = uniform( 1.0 );

		/**
		 * @private
		 * @type {UniformNode<float>}
		 */
		this._projScale = uniform( 1.0 );

		/**
		 * Golden-ratio offset added to the per-pixel rotation seed when jitter is enabled,
		 * kept in the [0, 1) range. Stays 0 when jitter is disabled.
		 *
		 * @private
		 * @type {UniformNode<float>}
		 */
		this._temporalNoiseOffset = uniform( 0 );

		/**
		 * @private
		 * @type {UniformNode<float>}
		 */
		this._cameraNear = uniform( camera.near );

		/**
		 * @private
		 * @type {UniformNode<mat4>}
		 */
		this._cameraProjectionMatrix = uniform( camera.projectionMatrix );

		/**
		 * Packed projection matrix elements for cheap view-space position reconstruction.
		 * _projDepthParams: [p22, p23, p32, p33] — used to recover view-Z from NDC depth.
		 *   p32 = -1 (perspective) or 0 (orthographic) drives the unified formula.
		 * _projScaleXY: [1/p00, 1/p11] — precomputed reciprocals to recover view-X/Y.
		 * Works for any standard symmetric perspective or orthographic camera.
		 * @private
		 */
		this._projDepthParams = uniform( new Vector4() );
		this._projScaleXY = uniform( new Vector2() );

		const allSamples = _precomputeSamples( _MAX_SAMPLES );

		/**
		 * @private
		 * @type {UniformArrayNode}
		 */
		this._samplesU = uniformArray( allSamples, 'vec3' );

		/**
		 * @private
		 * @type {number}
		 */
		this._maxR = allSamples[ _MAX_SAMPLES - 1 ].z;

		/**
		 * White-noise rotation seed.
		 *
		 * @private
		 * @type {TextureNode}
		 */
		this._noiseNode = texture( _generateWhiteNoiseTexture() );

		/**
		 * @private
		 * @type {NodeMaterial}
		 */
		this._sssMaterial = new NodeMaterial();
		this._sssMaterial.name = 'SSSS';

		/**
		 * @private
		 * @type {PassTextureNode}
		 */
		this._textureNode = passTexture( this, this._sssRenderTarget.texture );

		// Initial scan: register existing SSS materials and attach childadded/childremoved
		// listeners to every existing node. Three.js has no 'descendantadded' event, so we
		// must propagate the listener manually to catch future nested additions/removals.
		scene.addEventListener( 'childadded', this._onChildAdded );
		scene.addEventListener( 'childremoved', this._onChildRemoved );
		scene.traverse( ( obj ) => {

			this._checkObject( obj );
			if ( obj !== scene ) {

				obj.addEventListener( 'childadded', this._onChildAdded );
				obj.addEventListener( 'childremoved', this._onChildRemoved );

			}

		} );

		this._rebuildSSSBuffer();

	}

	/**
	 * The internal render target. Exposed so that nodes like TRAANode can read
	 * its dimensions via the standard `passNode.renderTarget` convention.
	 *
	 * @type {RenderTarget}
	 */
	get renderTarget() {

		return this._sssRenderTarget;

	}

	/**
	 * Returns the result of the effect as a texture node.
	 *
	 * @return {PassTextureNode} The output texture.
	 */
	getTextureNode() {

		return this._textureNode;

	}

	/**
	 * Reads fog parameters from a `THREE.Fog` or `THREE.FogExp2` instance and
	 * copies them into the corresponding uniforms. Call once after construction
	 * and again whenever the scene fog changes.
	 *
	 * @param {Fog|FogExp2|null} fog - `scene.fog`, or `null` to disable fog correction.
	 */
	setFog( fog ) {

		if ( ! fog ) {

			this.fogType.value = 0;

		} else if ( fog.isFogExp2 ) {

			this.fogType.value = 2;
			this.fogDensity.value = fog.density;
			this.fogColor.value.copy( fog.color );

		} else {

			this.fogType.value = 1;
			this.fogNear.value = fog.near;
			this.fogFar.value = fog.far;
			this.fogColor.value.copy( fog.color );

		}

	}

	_checkObject( obj ) {

		if ( obj.isMesh && obj.material && obj.material.isMeshSubsurfaceNodeMaterial ) {

			if ( ! this._materialSlots.has( obj.material ) ) {

				this._registerSSS( obj.material );

			}

		}

	}

	_onChildAdded( { child } ) {

		child.traverse( ( obj ) => {

			this._checkObject( obj );
			obj.addEventListener( 'childadded', this._onChildAdded );
			obj.addEventListener( 'childremoved', this._onChildRemoved );

		} );

	}

	_onChildRemoved( { child } ) {

		child.traverse( ( obj ) => {

			obj.removeEventListener( 'childadded', this._onChildAdded );
			obj.removeEventListener( 'childremoved', this._onChildRemoved );

		} );

	}

	_registerSSS( material ) {

		const reusingSlot = this._freeSSSSlots.length > 0;
		const slot = reusingSlot ? this._freeSSSSlots.pop() : this._sssSlots.length;
		this._sssSlots[ slot ] = material;
		this._materialSlots.set( material, slot );
		material.subsurfaceSlotNode.value = slot;
		material.addEventListener( 'dispose', () => this._unregisterSSS( material ) );
		if ( ! reusingSlot ) this._sssBufferNeedsRebuild = true;

	}

	_unregisterSSS( material ) {

		const slot = this._materialSlots.get( material );
		if ( slot === undefined ) return;
		this._sssSlots[ slot ] = null;
		this._materialSlots.delete( material );
		this._freeSSSSlots.push( slot );
		material.subsurfaceSlotNode.value = 0;

	}

	_rebuildSSSBuffer() {

		const count = this._sssSlots.length;
		const entries = [];
		for ( let i = 0; i < count * 2; i ++ ) entries.push( new Vector4() );
		this._sssBuffer = uniformArray( entries, 'vec4' );
		this._sssBufferNeedsRebuild = false;
		if ( this._sssMaterial ) this._sssMaterial.needsUpdate = true;

	}

	_syncSSSBuffer() {

		const buf = this._sssBuffer.array;
		for ( let slot = 1; slot < this._sssSlots.length; slot ++ ) {

			const mat = this._sssSlots[ slot ];
			if ( mat === null ) continue;
			const sd = mat.scatteringDistanceNode.value;
			const sc = mat.scatteringColorNode.value;
			const i = slot * 2;
			buf[ i ].set( sd.r, sd.g, sd.b, mat.strengthNode.value );
			buf[ i + 1 ].set( sc.r, sc.g, sc.b, mat.texturingModeNode.value );

		}

		this._sssBuffer.needsUpdate = true;

	}

	/**
	 * Sets the size of the internal render target.
	 *
	 * @param {number} width - Output width in pixels.
	 * @param {number} height - Output height in pixels.
	 */
	setSize( width, height ) {

		this._resolution.value.set( width, height );

		// The output stays full resolution (single pass). `resolutionScale` only reduces
		// the per-pixel tap count (applied via `_effectiveSamples` in updateBefore); the
		// noise rotation is always evaluated at full resolution.
		this._sssRenderTarget.setSize( width, height );

	}

	/**
	 * Executes the SSS blur pass once per frame.
	 *
	 * @param {NodeFrame} frame - The current node frame.
	 */
	updateBefore( frame ) {

		const { renderer } = frame;

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		const size = renderer.getDrawingBufferSize( _size );
		this.setSize( size.width, size.height );

		// resolutionScale turns down the expensive path: fewer taps per pixel, strided
		// across the full kernel so the blur radius is unaffected (stride 1 at scale 1).
		const effectiveSamples = Math.max( 1, Math.round( this.samples.value * this.resolutionScale ) );
		this._effectiveSamples.value = effectiveSamples;
		this._sampleStride.value = this.samples.value / effectiveSamples;

		this._projScale.value = 0.5 * size.height * this._camera.projectionMatrix.elements[ 5 ];
		// Advance the noise rotation each frame so TRAA can accumulate distinct samples.
		// frameId is wrapped to keep the golden-ratio product small and precise.
		this._temporalNoiseOffset.value = this.jitter
			? ( ( frame.frameId % 4096 ) * ( _GOLDEN_RATIO % 1 ) ) % 1
			: 0;
		this._cameraNear.value = this._camera.near;
		this._cameraProjectionMatrix.value.copy( this._camera.projectionMatrix );
		const pe = this._camera.projectionMatrix.elements;
		this._projDepthParams.value.set( pe[ 10 ], pe[ 14 ], pe[ 11 ], pe[ 15 ] );
		this._projScaleXY.value.set( 1 / pe[ 0 ], 1 / pe[ 5 ] );

		if ( this._sssBufferNeedsRebuild ) this._rebuildSSSBuffer();
		this._syncSSSBuffer();

		_quadMesh.material = this._sssMaterial;
		renderer.setRenderTarget( this._sssRenderTarget );
		_quadMesh.render( renderer );

		RendererUtils.restoreRendererState( renderer, _rendererState );

	}

	/**
	 * Builds the TSL shader graph for the SSS blur pass.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {PassTextureNode}
	 */
	setup( builder ) {

		const { colorNode, depthNode, albedoNode, normalNode } = this;
		const sssBuffer = this._sssBuffer;
		const { outputMode } = this;
		const { fogType, fogNear, fogFar, fogDensity } = this;
		const fogColorUniform = this.fogColor;
		const { _projScale, _cameraNear, _resolution, _cameraProjectionMatrix, _projDepthParams, _projScaleXY, _samplesU, _noiseNode, _temporalNoiseOffset, _effectiveSamples, _sampleStride } = this;
		const maxR = this._maxR;

		const sampleColor = ( uvCoord ) => colorNode.sample( uvCoord );
		const sampleDepth = ( uvCoord ) => depthNode.sample( uvCoord ).r;
		const sampleAlbedo = ( uvCoord ) => albedoNode.sample( uvCoord ).rgb;

		const getViewPos = ( depthVal, coordVal ) => {

			const ndc = coordVal.mul( 2.0 ).sub( 1.0 );
			const ndcZ = depthVal.mul( 2.0 ).sub( 1.0 );
			// Unified formula valid for both perspective (p32=-1, p33=0) and
			// orthographic (p32=0, p33=1) cameras.
			const vz = _projDepthParams.y.sub( ndcZ.mul( _projDepthParams.w ) ).div( ndcZ.mul( _projDepthParams.z ).sub( _projDepthParams.x ) );
			const clipW = _projDepthParams.z.mul( vz ).add( _projDepthParams.w );
			return vec3( ndc.x.mul( clipW ).mul( _projScaleXY.x ), ndc.y.mul( clipW ).mul( _projScaleXY.y ), vz );

		};

		// Returns fog factor in [0,1]: 0 = no fog, 1 = full fog.
		const computeFogFactor = ( depth ) => {

			const linFactor = clamp( depth.sub( fogNear ).div( fogFar.sub( fogNear ) ), 0.0, 1.0 );
			const exp2Factor = float( 1.0 ).sub( clamp( exp( fogDensity.mul( fogDensity ).mul( depth ).mul( depth ).negate() ), 0.0, 1.0 ) );
			return fogType.greaterThan( 1.5 ).select( exp2Factor, fogType.greaterThan( 0.5 ).select( linFactor, float( 0.0 ) ) );

		};

		// Remove fog contribution so the blur operates on un-fogged irradiance.
		const defog = ( color, ff ) => {

			const opacity = max( float( 1.0 ).sub( ff ), 0.001 );
			return color.sub( fogColorUniform.mul( float( 1.0 ).sub( opacity ) ) ).div( opacity );

		};

		const ALBEDO_EPS = 0.0001;

		const sssFn = Fn( () => {

			const vuv = uv();
			const centerDepth = sampleDepth( vuv ).toVar();
			const centerColor = sampleColor( vuv ).toVar();
			const result = centerColor.toVar();

			If( centerDepth.lessThan( 1.0 ), () => {

				const centerAlbedoSample = albedoNode.sample( vuv ).toVar();
				const centerAlbedo = max( centerAlbedoSample.rgb, vec3( ALBEDO_EPS ) ).toVar();
				const sssMask = centerAlbedoSample.a.toVar();

				If( sssMask.greaterThanEqual( 0.5 ), () => {

					const centerViewPos = getViewPos( centerDepth, vuv ).toVar();
					const linearDepth = centerViewPos.z.negate().toVar();
					const centerFF = computeFogFactor( linearDepth ).toVar();
					const centerColorDefogged = defog( centerColor.rgb, centerFF ).toVar();

					const slot = int( sssMask ).toVar();
					const _p0 = sssBuffer.element( slot.mul( 2 ) ).toVar();
					const _p1 = sssBuffer.element( slot.mul( 2 ).add( 1 ) ).toVar();
					const pixelScatteringDistance = _p0.rgb;
					const pixelStrength = _p0.a;
					const pixelScatteringColor = _p1.rgb;
					const pixelTexturingMode = _p1.a;

					const scatterDist = pixelScatteringDistance.toVar();
					const sR = float( 3.67 ).div( max( scatterDist.x, 0.0001 ) ).toVar();
					const sG = float( 3.67 ).div( max( scatterDist.y, 0.0001 ) ).toVar();
					const sB = float( 3.67 ).div( max( scatterDist.z, 0.0001 ) ).toVar();
					const sMin = min( sR, min( sG, sB ) ).toVar();

					const worldRadius = float( maxR ).div( sMin ).toVar();
					const screenRadius = worldRadius.mul( _projScale ).div( linearDepth ).toVar();
					const effectiveMaxRadius = min( worldRadius.mul( _projScale ).div( _cameraNear ), _resolution.y.mul( 0.25 ) );
					const clampedRadius = min( screenRadius, effectiveMaxRadius ).toVar();
					const radiusScale = clampedRadius.div( float( maxR ) ).toVar();

					// Per-pixel white-noise rotation seed in [0,1), tiling every 64 px at full resolution.
					const base01 = _noiseNode.sample( screenCoordinate.xy.div( 64.0 ) ).r.toVar();

					// Advance the seed along a golden-ratio low-discrepancy sequence each frame
					// (offset is 0 unless `jitter` is enabled) so a temporal resolve accumulates
					// evenly distributed rotations while every frame stays spatially well distributed.
					const angle = fract( base01.add( _temporalNoiseOffset ) ).mul( 6.283185307179586 ).toVar();
					const cosA = cos( angle ).toVar();
					const sinA = sin( angle ).toVar();

					// Tangent-plane disk basis; falls back to screen-aligned disk when no normalNode.
					const centerNormal = normalNode
						? normalize( normalNode.sample( vuv ).rgb ).toVar()
						: vec3( 0.0, 0.0, 1.0 ).toVar();
					const seedUp = abs( centerNormal.y ).lessThan( 0.99 ).select( vec3( 0.0, 1.0, 0.0 ), vec3( 1.0, 0.0, 0.0 ) );
					const T = normalize( seedUp.sub( centerNormal.mul( dot( seedUp, centerNormal ) ) ) ).toVar();
					const B = cross( centerNormal, T ).toVar();
					const Trot = T.mul( cosA ).add( B.mul( sinA ) ).toVar();
					const Brot = T.mul( sinA.negate() ).add( B.mul( cosA ) ).toVar();
					const sampleWorldStep = radiusScale.mul( linearDepth ).div( _projScale ).toVar();

					const albedoExp = pixelTexturingMode.mul( 0.5 ).toVar();
					const outFactor = pow( centerAlbedo, vec3( albedoExp ) ).toVar();

					const totalR = float( 0.0 ).toVar();
					const totalG = float( 0.0 ).toVar();
					const totalB = float( 0.0 ).toVar();
					const weightSumR = float( 0.0 ).toVar();
					const weightSumG = float( 0.0 ).toVar();
					const weightSumB = float( 0.0 ).toVar();

					// `_effectiveSamples` = round( samples * resolutionScale ): the tap
					// count is where resolutionScale cheapens the expensive path.
					Loop( { start: int( 0 ), end: int( _effectiveSamples ), type: 'int', condition: '<' }, ( { i } ) => {

						// Stride across the full kernel so fewer taps still span the
						// whole blur radius (idx === i when resolutionScale is 1).
						const idx = int( float( i ).add( 0.5 ).mul( _sampleStride ) ).toVar();
						const sampleData = _samplesU.element( idx );
						const sx = sampleData.x.toVar();
						const sy = sampleData.y.toVar();
						const sr = sampleData.z.toVar();

						const viewOffset = Trot.mul( sx ).add( Brot.mul( sy ) ).mul( sampleWorldStep );
						const viewSamplePos = centerViewPos.add( viewOffset );
						const clipPos = _cameraProjectionMatrix.mul( vec4( viewSamplePos, 1.0 ) );
						const ndc = clipPos.xy.div( clipPos.w );
						const sampleUV = clamp( ndc.mul( 0.5 ).add( 0.5 ), vec2( 0.0 ), vec2( 1.0 ) );

						const sampledColor = sampleColor( sampleUV );
						const sampledDepth = sampleDepth( sampleUV ).toVar();
						const sampleViewPos = getViewPos( sampledDepth, sampleUV ).toVar();

						const sampleFF = computeFogFactor( sampleViewPos.z.negate() );
						const sampledColorDefogged = defog( sampledColor.rgb, sampleFF );
						const irradiance = sampledColorDefogged.toVar();

						If( albedoExp.greaterThan( 0.0 ), () => {

							const sampledAlbedo = max( sampleAlbedo( sampleUV ), vec3( ALBEDO_EPS ) );
							irradiance.assign( sampledColorDefogged.div( pow( sampledAlbedo, vec3( albedoExp ) ) ) );

						} );

						const worldR = sr.div( sMin ).toVar();
						const dx = centerViewPos.x.sub( sampleViewPos.x );
						const dy = centerViewPos.y.sub( sampleViewPos.y );
						const dz = centerViewPos.z.sub( sampleViewPos.z );
						const worldDist = sqrt( dx.mul( dx ).add( dy.mul( dy ) ).add( dz.mul( dz ) ) );
						const depthDiff = abs( centerViewPos.z.sub( sampleViewPos.z ) ).toVar();
						const d = max( worldDist, 0.00001 ).toVar();

						const sd = vec3( sR, sG, sB ).mul( d );
						const w = exp( sd.negate() ).add( exp( sd.div( 3.0 ).negate() ) );

						const valid = depthDiff
							.lessThan( worldR.mul( 2.0 ) )
							.and( sampledDepth.lessThan( 1.0 ) )
							.select( 1.0, 0.0 )
							.toVar();

						const v = w.mul( valid );

						totalR.addAssign( v.x.mul( irradiance.r ) );
						totalG.addAssign( v.y.mul( irradiance.g ) );
						totalB.addAssign( v.z.mul( irradiance.b ) );
						weightSumR.addAssign( v.x );
						weightSumG.addAssign( v.y );
						weightSumB.addAssign( v.z );

					} );

					const blurredIrradiance = vec3(
						totalR.div( max( weightSumR, 0.00001 ) ),
						totalG.div( max( weightSumG, 0.00001 ) ),
						totalB.div( max( weightSumB, 0.00001 ) ),
					);
					// Disney Diffuse Fresnel transmission at the exit point in the view direction [Burley 2015].
					// F_dt(v) = 1 - 0.5 * (1 - |n·v|)^5 — models light refracting out of the surface.
					const viewDir = normalize( centerViewPos.negate() );
					const NdotV = abs( dot( centerNormal, viewDir ) );
					const Fdt = float( 1.0 ).sub( float( 0.5 ).mul( pow( float( 1.0 ).sub( NdotV ), float( 5.0 ) ) ) );
					const blurred = blurredIrradiance.mul( outFactor ).mul( pixelScatteringColor ).mul( Fdt );
					const blendedColor = mix( centerColorDefogged, blurred, pixelStrength );

					const diff = blurred.sub( centerColorDefogged ).mul( 20.0 ).add( 0.5 );
					const depthVis = vec3( linearDepth.div( 10.0 ) );
					const weightsMax = max( weightSumR, max( weightSumG, weightSumB ) ).add( 0.0001 );
					const weightsVis = vec3(
						weightSumR.div( weightsMax ),
						weightSumG.div( weightsMax ),
						weightSumB.div( weightsMax ),
					);
					const albedoVis = centerAlbedo;

					const rawOut = outputMode
						.greaterThan( 4.5 )
						.select(
							albedoVis,
							outputMode.greaterThan( 3.5 ).select(
								weightsVis,
								outputMode.greaterThan( 2.5 ).select(
									depthVis,
									outputMode.greaterThan( 1.5 ).select( blurred, outputMode.greaterThan( 0.5 ).select( diff, blendedColor ) ),
								),
							),
						);

					// Re-apply fog at the center pixel's depth after the blur.
					const foggedOut = mix( rawOut, fogColorUniform, centerFF );
					result.assign( vec4( foggedOut, centerColor.a ) );

				} );

			} );

			return result;

		} );

		this._sssMaterial.fragmentNode = sssFn().context( builder.getSharedContext() );
		this._sssMaterial.needsUpdate = true;

		return this._textureNode;

	}

	/**
	 * Frees internal resources. Call when the effect is no longer needed.
	 */
	dispose() {

		this._scene.removeEventListener( 'childadded', this._onChildAdded );
		this._scene.removeEventListener( 'childremoved', this._onChildRemoved );
		this._scene.traverse( ( obj ) => {

			if ( obj !== this._scene ) {

				obj.removeEventListener( 'childadded', this._onChildAdded );
				obj.removeEventListener( 'childremoved', this._onChildRemoved );

			}

		} );

		this._sssRenderTarget.dispose();
		this._sssMaterial.dispose();

	}

}

export default SSSSNode;

/**
 * TSL function for creating a screen-space subsurface scattering effect.
 *
 * @tsl
 * @function
 * @param {TextureNode} colorNode - Lit scene color texture.
 * @param {TextureNode} depthNode - Scene depth texture.
 * @param {TextureNode} albedoNode - MRT albedo attachment (rgb = base color, a = SSS slot index, 0 = no SSS).
 * @param {PerspectiveCamera} camera - The scene camera.
 * @param {Scene} scene - The scene to scan for {@link MeshSubsurfaceNodeMaterial} instances.
 * @param {TextureNode|null} [normalNode=null] - Optional MRT view-space normals texture. When provided,
 *   the blur disk is oriented on each pixel's tangent plane instead of screen-space, which improves
 *   accuracy on oblique surfaces. Requires adding a `normals` slot to the scene MRT and passing
 *   `scenePass.getTextureNode('normals')` here.
 * @returns {SSSSNode}
 */
export const subsurfaceScattering = ( colorNode, depthNode, albedoNode, camera, scene, normalNode = null ) => new SSSSNode( colorNode, depthNode, albedoNode, camera, scene, normalNode );

export { TEXTURING_MODE };
