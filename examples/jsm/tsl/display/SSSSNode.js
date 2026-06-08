import { RenderTarget, HalfFloatType, TempNode, QuadMesh, NodeMaterial, RendererUtils, Vector2, Vector3, Vector4, Color, DataTexture, RGBAFormat, FloatType, RepeatWrapping, NearestFilter } from 'three/webgpu';
import { Fn, float, vec2, vec3, vec4, int, uv, uniform, uniformArray, Loop, texture, passTexture, NodeUpdateType, If, abs, max, min, exp, sqrt, pow, mix, dot, cross, normalize, clamp } from 'three/tsl';

const _quadMesh = /*@__PURE__*/ new QuadMesh();
const _size = /*@__PURE__*/ new Vector2();

let _rendererState;

const _GOLDEN_RATIO = ( 1 + Math.sqrt( 5 ) ) / 2;
const _MAX_SAMPLES = 64;

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

function _generateNoiseTexture( size = 64 ) {

	const data = new Float32Array( size * size * 4 );

	for ( let i = 0; i < size * size; i ++ ) {

		const angle = Math.random() * Math.PI * 2;
		data[ i * 4 ] = Math.cos( angle );
		data[ i * 4 + 1 ] = Math.sin( angle );
		data[ i * 4 + 2 ] = 0;
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
 * Requires the scene to be rendered with an MRT that exposes a separate
 * albedo attachment (rgb = base color, a = SSS mask: 1 = SSS on, 0 = skip).
 *
 * ```js
 * const renderPipeline = new RenderPipeline( renderer );
 * const scenePass = pass( scene, camera );
 * scenePass.setMRT( mrt( {
 * 	output: output,
 * 	albedo: metalness.mix( vec4( 0 ), vec4( diffuseColor.rgb, 1 ) ),
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

	static TEXTURING_MODE = TEXTURING_MODE;

	/**
	 * Constructs a new SSSS node.
	 *
	 * @param {TextureNode} colorNode - Lit scene color from the scene pass.
	 * @param {TextureNode} depthNode - Scene depth texture.
	 * @param {TextureNode} albedoNode - MRT albedo attachment (rgb = base color, a = SSS mask).
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
		 * Maximum blur samples per pixel. The actual count scales down
		 * with the LOD factor for small screen-space disks.
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
		 * Fraction of full resolution at which the SSS blur runs.
		 * Values below 1 trade quality for performance.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.resolutionScale = 1;

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
		this._sssRenderTarget.texture.name = 'SSSS.LowRes';

		/**
		 * @private
		 * @type {RenderTarget}
		 */
		/**
		 * @private
		 * @type {UniformNode<vec2>}
		 */
		this._resolution = uniform( new Vector2() );

		/**
		 * @private
		 * @type {UniformNode<vec2>}
		 */
		this._lowResolution = uniform( new Vector2() );

		/**
		 * @private
		 * @type {UniformNode<float>}
		 */
		this._projScale = uniform( 1.0 );

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
		 * @private
		 * @type {UniformNode<mat4>}
		 */
		this._cameraProjectionMatrixInverse = uniform( camera.projectionMatrixInverse );

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
		 * @private
		 * @type {TextureNode}
		 */
		this._noiseNode = texture( _generateNoiseTexture() );

		/**
		 * @private
		 * @type {NodeMaterial}
		 */
		this._sssMaterial = new NodeMaterial();
		this._sssMaterial.name = 'SSSS';

		/**
		 * @private
		 * @type {NodeMaterial}
		 */
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
	 * Sets the size of the internal render targets.
	 *
	 * @param {number} width - Output width in pixels.
	 * @param {number} height - Output height in pixels.
	 */
	setSize( width, height ) {

		this._resolution.value.set( width, height );

		const w = Math.max( 1, Math.round( this.resolutionScale * width ) );
		const h = Math.max( 1, Math.round( this.resolutionScale * height ) );
		this._lowResolution.value.set( w, h );
		// Output render target must stay at full resolution — without a separate
		// composite pass there is no way to upscale a low-res SSS blur back to full
		// res. resolutionScale only affects the noise UV tiling (_lowResolution).
		this._sssRenderTarget.setSize( width, height );

	}

	/**
	 * Executes the SSS blur and bilateral upsample passes once per frame.
	 *
	 * @param {NodeFrame} frame - The current node frame.
	 */
	updateBefore( frame ) {

		const { renderer } = frame;

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		const size = renderer.getDrawingBufferSize( _size );
		this.setSize( size.width, size.height );

		this._projScale.value = 0.5 * size.height * this._camera.projectionMatrix.elements[ 5 ];
		this._cameraNear.value = this._camera.near;
		this._cameraProjectionMatrix.value.copy( this._camera.projectionMatrix );
		this._cameraProjectionMatrixInverse.value.copy( this._camera.projectionMatrixInverse );

		if ( this._sssBufferNeedsRebuild ) this._rebuildSSSBuffer();
		this._syncSSSBuffer();

		_quadMesh.material = this._sssMaterial;
		renderer.setRenderTarget( this._sssRenderTarget );
		_quadMesh.render( renderer );

		RendererUtils.restoreRendererState( renderer, _rendererState );

	}

	/**
	 * Builds the TSL shader graph for both passes.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {PassTextureNode}
	 */
	setup( builder ) {

		const { colorNode, depthNode, albedoNode, normalNode } = this;
		const sssBuffer = this._sssBuffer;
		const { samples, outputMode } = this;
		const { fogType, fogNear, fogFar, fogDensity } = this;
		const fogColorUniform = this.fogColor;
		const { _lowResolution, _projScale, _cameraNear, _resolution, _cameraProjectionMatrix, _cameraProjectionMatrixInverse, _samplesU, _noiseNode } = this;
		const maxR = this._maxR;

		const sampleColor = ( uvCoord ) => colorNode.sample( uvCoord );
		const sampleDepth = ( uvCoord ) => depthNode.sample( uvCoord ).r;
		const sampleAlbedo = ( uvCoord ) => albedoNode.sample( uvCoord ).rgb;

		const getViewPos = ( depthVal, coordVal ) => {

			const z = depthVal.mul( 2.0 ).sub( 1.0 );
			const clipPos = vec4( coordVal.mul( 2.0 ).sub( 1.0 ), z, 1.0 );
			const viewPos = _cameraProjectionMatrixInverse.mul( clipPos );
			return viewPos.xyz.div( viewPos.w );

		};

		const evalWeight = ( d, s ) => exp( s.mul( d ).negate() ).add( exp( s.mul( d ).div( 3.0 ).negate() ) );

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

				const skipBlur = sssMask.lessThan( 0.5 ).toVar();
				const effectiveSamples = skipBlur.select( int( 0 ), int( samples ) ).toVar();
				const effectiveStrength = pixelStrength.mul( skipBlur.select( float( 0.0 ), float( 1.0 ) ) ).toVar();

				const noiseUV = vuv.mul( _lowResolution ).div( 64.0 );
				const noiseVal = _noiseNode.sample( noiseUV );
				const cosA = noiseVal.r.toVar();
				const sinA = noiseVal.g.toVar();

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

				Loop( { start: int( 0 ), end: effectiveSamples, type: 'int', condition: '<' }, ( { i } ) => {

					const sampleData = _samplesU.element( i );
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
					const sampledAlbedo = max( sampleAlbedo( sampleUV ), vec3( ALBEDO_EPS ) ).toVar();
					const sampleViewPos = getViewPos( sampledDepth, sampleUV ).toVar();

					const sampleFF = computeFogFactor( sampleViewPos.z.negate() );
					const sampledColorDefogged = defog( sampledColor.rgb, sampleFF );
					const inFactorSample = pow( sampledAlbedo, vec3( albedoExp ) );
					const irradiance = sampledColorDefogged.div( inFactorSample ).toVar();

					const worldR = sr.div( sMin ).toVar();
					const dx = centerViewPos.x.sub( sampleViewPos.x );
					const dy = centerViewPos.y.sub( sampleViewPos.y );
					const dz = centerViewPos.z.sub( sampleViewPos.z );
					const worldDist = sqrt( dx.mul( dx ).add( dy.mul( dy ) ).add( dz.mul( dz ) ) );
					const depthDiff = abs( centerViewPos.z.sub( sampleViewPos.z ) ).toVar();
					const d = max( worldDist, 0.00001 ).toVar();

					const wR = evalWeight( d, sR ).toVar();
					const wG = evalWeight( d, sG ).toVar();
					const wB = evalWeight( d, sB ).toVar();

					const valid = depthDiff
						.lessThan( worldR.mul( 2.0 ) )
						.and( sampledDepth.lessThan( 1.0 ) )
						.select( 1.0, 0.0 )
						.toVar();

					const vR = wR.mul( valid ).toVar();
					const vG = wG.mul( valid ).toVar();
					const vB = wB.mul( valid ).toVar();

					totalR.addAssign( vR.mul( irradiance.r ) );
					totalG.addAssign( vG.mul( irradiance.g ) );
					totalB.addAssign( vB.mul( irradiance.b ) );
					weightSumR.addAssign( vR );
					weightSumG.addAssign( vG );
					weightSumB.addAssign( vB );

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
				const blendedColor = mix( centerColorDefogged, blurred, effectiveStrength );

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
 * @param {TextureNode} albedoNode - MRT albedo attachment (rgb = base color, a = SSS mask).
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
