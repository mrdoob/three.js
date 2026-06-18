import { abs, convertToTexture, cos, cross, Discard, dot, EPSILON, exp, float, Fn, getScreenPosition, getViewPosition, If, int, log, Loop, luminance, mix, nodeObject, NodeUpdateType, normalize, passTexture, property, reflect, sin, smoothstep, sqrt, tan, texture, uniform, unpackRGBToNormal, uv, vec2, vec3, vec4 } from 'three/tsl';
import { HalfFloatType, MathUtils, Matrix4, NodeMaterial, QuadMesh, RendererUtils, RenderTarget, TempNode, Vector2 } from 'three/webgpu';
import { bindBlueNoiseRotationMatrix, BLUE_NOISE_TEXTURE_SIZE, getBlueNoiseTexture } from '../utils/BlueNoise.js';
import { ENV_RAY_LENGTH_THRESHOLD } from '../utils/SpecularHelpers.js';

const _quadMesh = /*@__PURE__*/ new QuadMesh();
const _size = /*@__PURE__*/ new Vector2();

let _rendererState;

const KERNEL_SAMPLES = 8;
const BLUE_NOISE_ROTATION_SEED = 83;
const WORLD_RADIUS_SCALE = 0.1;

const NORMAL_WEIGHT_EDGE_MIN = 0.9;
const NORMAL_WEIGHT_EDGE_MAX = 0.99;
const NORMAL_DOT_SMOOTHSTEP_MAX = 0.999;

const AO_EDGE_STOPPING_BIAS = 0.05;
const AGGRESSIVITY_RADIUS_MIN = 0.001;
const DIFFUSE_CHROMA_WEIGHT = 2.0;
// Neighborhood luma coefficient-of-variation thresholds for gating the temporal inverse-luminance
// (firefly) suppression: below MIN the region is treated as flicker-free, above MAX as noisy.
const FLICKER_COV_GATE_MIN = 0.1;
const FLICKER_COV_GATE_MAX = 2;

/**
 * Golden-angle Vogel disk offset.
 *
 * @tsl
 */
const vogelDisk = Fn( ( [ i, radius ] ) => {

	const sampleCount = 8;
	const theta = i.add( 0.5 ).mul( 2.399827721492203 );
	const r = radius.mul( sqrt( i.add( 0.5 ).div( sampleCount ) ) );
	return vec2( cos( theta ), sin( theta ) ).mul( r );

} ).setLayout( {
	name: 'vogelDisk',
	type: 'vec2',
	inputs: [
		{ name: 'i', type: 'float' },
		{ name: 'radius', type: 'float' }
	]
} );

/**
 * Chromatic color-similarity distance between two linear base colors (albedo).
 *
 * @tsl
 */
const diffuseColorDistance = Fn( ( [ a, b, compressLuma ] ) => {

	const toYCoCg = ( c ) => vec3(
		dot( c, vec3( 0.25, 0.5, 0.25 ) ),
		c.r.sub( c.b ),
		c.g.sub( c.r.add( c.b ).mul( 0.5 ) )
	);

	const ya = toYCoCg( a );
	const yb = toYCoCg( b );

	// `compressLuma` (0/1) range-compresses the luma term with log(1+L) so a fixed lumaPhi gives
	// scale-invariant differences across the HDR range. 0 leaves luma linear (used for LDR albedo).
	const compress = ( L ) => mix( L, log( L.add( 1 ) ), compressLuma );

	const dLuma = abs( compress( ya.x ).sub( compress( yb.x ) ) );
	const dChroma = vec2( ya.y.sub( yb.y ), ya.z.sub( yb.z ) ).length();

	return dLuma.add( dChroma.mul( DIFFUSE_CHROMA_WEIGHT ) );

} ).setLayout( {
	name: 'diffuseColorDistance',
	type: 'float',
	inputs: [
		{ name: 'a', type: 'vec3' },
		{ name: 'b', type: 'vec3' },
		{ name: 'compressLuma', type: 'float' }
	]
} );

const _temporalWeight = Fn( ( [ x, denoisePower ] ) => float( 1 ).div( x.pow( denoisePower ) ) ).setLayout( {
	name: 'temporalWeight',
	type: 'float',
	inputs: [
		{ name: 'x', type: 'float' },
		{ name: 'denoisePower', type: 'float' }
	]
} );

/**
 * Temporal accumulation variance factor in `[0, 1]`. Higher values mean more history confidence.
 *
 * @tsl
 */
const getTemporalVarianceFactor = Fn( ( [ frameNum, denoisePower ] ) => {

	return _temporalWeight( frameNum, denoisePower ).max( 0.05 );

} ).setLayout( {
	name: 'getTemporalVarianceFactor',
	type: 'float',
	inputs: [
		{ name: 'frameNum', type: 'float' },
		{ name: 'denoisePower', type: 'float' }
	]
} );

/**
 * World-space frustum height at `viewZ`. Algorithm originally from REBLUR (NRD).
 * `tanHalfFovY` is `tan( verticalFov / 2 )`, hoisted by the caller since it is loop-invariant.
 *
 * @tsl
 */
const computeFrustumSize = Fn( ( [ viewZ, tanHalfFovY ] ) => {

	return float( 2 ).mul( viewZ ).mul( tanHalfFovY );

} ).setLayout( {
	name: 'computeFrustumSize',
	type: 'float',
	inputs: [
		{ name: 'viewZ', type: 'float' },
		{ name: 'tanHalfFovY', type: 'float' }
	]
} );

/**
 * Maps world-space SSR ray length to `[0, 1]`. Environment rays (`worldRayLength == 0`) map to `1`.
 * Algorithm originally from REBLUR (NRD).
 *
 * @tsl
 */
const computeHitDistFactor = Fn( ( [ worldRayLength, viewZ, tanHalfFovY ] ) => {

	const frustumSize = computeFrustumSize( viewZ, tanHalfFovY );
	const factor = worldRayLength.div( frustumSize.max( 1e-6 ) ).clamp( 0, 1 );

	return worldRayLength.lessThan( 0.0001 ).select( float( 1 ), factor.mul( 0.1 ) );

} ).setLayout( {
	name: 'computeHitDistFactor',
	type: 'float',
	inputs: [
		{ name: 'worldRayLength', type: 'float' },
		{ name: 'viewZ', type: 'float' },
		{ name: 'tanHalfFovY', type: 'float' }
	]
} );

/**
 * Maps an AO factor for edge-stopping comparisons.
 *
 * @tsl
 */
const mapAo = Fn( ( [ aoVal ] ) => aoVal.pow( 0.1 ) );

/**
 * Specular dominant direction — smooth surfaces lean toward reflection, rough toward normal.
 *
 * @tsl
 */
const getSpecularDominantDirection = Fn( ( [ N, V, roughness ] ) => {

	return normalize( mix( N, reflect( V.negate(), N ), roughness.oneMinus() ) );

} ).setLayout( {
	name: 'getSpecularDominantDirection',
	type: 'vec3',
	inputs: [
		{ name: 'N', type: 'vec3' },
		{ name: 'V', type: 'vec3' },
		{ name: 'roughness', type: 'float' }
	]
} );

/**
 * View-space plane distance between two surface points (edge-stopping geometry term).
 *
 * @tsl
 */
const viewSpacePlaneDistance = Fn( ( [ viewPosition, nViewPosition, viewNormal, viewZScale ] ) => {

	return abs( dot( viewPosition.sub( nViewPosition ), viewNormal ) ).div( viewZScale.max( 0.001 ) );

} ).setLayout( {
	name: 'viewSpacePlaneDistance',
	type: 'float',
	inputs: [
		{ name: 'viewPosition', type: 'vec3' },
		{ name: 'nViewPosition', type: 'vec3' },
		{ name: 'viewNormal', type: 'vec3' },
		{ name: 'viewZScale', type: 'float' }
	]
} );

/**
 * Inverse-luminance temporal blend with optional adaptive trust (Karis-style).
 *
 * @tsl
 */
const karisTemporalBlend = Fn( ( [ denoisedRgb, denoisedRaw, a, flickerSuppression, adaptiveTrust, nbhdMeanLuma, nbhdStddevLuma ] ) => {

	const localCoV = nbhdStddevLuma.div( nbhdMeanLuma.max( 1e-4 ) );
	const trustSuppress = localCoV.mul( adaptiveTrust ).mul( a.oneMinus() ).clamp( 0, 0.9 );
	const aTrust = a.mul( trustSuppress.oneMinus() );

	// In flicker-free neighborhoods, back off the inverse-luminance weighting so valid bright highlights
	// keep their energy. Scaled by adaptiveTrust so the default (0) path is unchanged.
	const noisy = smoothstep( FLICKER_COV_GATE_MIN, FLICKER_COV_GATE_MAX, localCoV );
	const effFlicker = flickerSuppression.mul( mix( adaptiveTrust.oneMinus(), float( 1 ), noisy ) );

	const wHist = float( 1 ).sub( aTrust ).div( luminance( denoisedRgb ).mul( effFlicker ).mul( 10 ).add( 1 ) );
	const wRaw = aTrust.div( luminance( denoisedRaw ).mul( effFlicker ).mul( 10 ).add( 1 ) );
	return denoisedRgb.mul( wHist ).add( denoisedRaw.mul( wRaw ) ).div( wHist.add( wRaw ).max( EPSILON ) );

} ).setLayout( {
	name: 'karisTemporalBlend',
	type: 'vec3',
	inputs: [
		{ name: 'denoisedRgb', type: 'vec3' },
		{ name: 'denoisedRaw', type: 'vec3' },
		{ name: 'a', type: 'float' },
		{ name: 'flickerSuppression', type: 'float' },
		{ name: 'adaptiveTrust', type: 'float' },
		{ name: 'nbhdMeanLuma', type: 'float' },
		{ name: 'nbhdStddevLuma', type: 'float' }
	]
} );

const toRawTexture = ( raw ) => {

	if ( raw === null ) return null;
	if ( raw.isTextureNode === true || raw.isSampleNode === true ) return raw;
	if ( raw.isTexture === true ) return texture( raw );
	return convertToTexture( raw );

};

/**
 * @typedef {'diffuse'|'specular'} DenoiseMode
 */

/**
 * @typedef {'raylength'|'ao'|'none'} DenoiseAlphaSource
 */

/**
 * @typedef {Object} RecurrentDenoiseNodeOptions
 * @property {?Node<float>} [depth=null] - Scene depth buffer for view-space edge stopping.
 * @property {?Node<vec3>} [normal=null] - View-space normals for geometric edge stopping.
 * @property {?Node<vec4>} [metalRoughness=null] - Roughness/metalness G-buffer for specular edge stopping.
 * @property {?Node<vec4>} [diffuse=null] - Scene base color (albedo) G-buffer for chromatic edge stopping.
 * @property {?Node<vec4>} [raw=null] - Unfiltered input (e.g. raw SSR/SSGI) for secondary sampling and temporal blend.
 * @property {DenoiseMode} [mode='diffuse'] - Denoising kernel type.
 * @property {boolean} [accumulate=true] - When `true`, temporally blend the spatially-denoised result
 * (Karis-style) and write frame weight to alpha for feedback loops. When `false`, only spatial filtering is applied.
 */

/**
 * Post processing node for denoising temporally-accumulated screen-space effects
 * such as SSGI (ambient occlusion / indirect diffuse) and SSR (specular reflections).
 *
 * The denoising kernel is selected at construction time via `mode`:
 * `'diffuse'` (SSGI) or `'specular'` (SSR). The kernel uses a fixed 8-sample Vogel disk.
 *
 * @augments TempNode
 * @three_import import { recurrentDenoise } from 'three/addons/tsl/display/RecurrentDenoiseNode.js';
 */
class RecurrentDenoiseNode extends TempNode {

	static get type() {

		return 'RecurrentDenoiseNode';

	}

	/**
	 * @param {TextureNode} inputTexture - Temporally filtered input to denoise (e.g. TRAA output).
	 * @param {Camera} camera
	 * @param {RecurrentDenoiseNodeOptions} [options={}]
	 */
	constructor( inputTexture, camera, options = {} ) {

		super( 'vec4' );

		const {
			depth = null,
			normal = null,
			metalRoughness = null,
			diffuse = null,
			raw = null,
			mode = 'diffuse',
			accumulate = true,
		} = options;

		this.isRecurrentDenoiseNode = true;
		this.camera = camera;

		/**
		 * Denoising kernel type.
		 *
		 * @type {DenoiseMode}
		 */
		this.mode = mode;

		/**
		 * When `true`, apply temporal blending after spatial denoising. When `false`, output spatially
		 * filtered colour only (alpha is passed through from the input temporal pass).
		 *
		 * @type {boolean}
		 */
		this.accumulate = accumulate;

		this.textureNode = inputTexture;
		this.depthNode = depth !== null ? nodeObject( depth ) : null;
		this.normalNode = normal !== null ? nodeObject( normal ) : null;
		this.rawNode = toRawTexture( raw );
		this.roughnessMetalnessNode = metalRoughness !== null ? nodeObject( metalRoughness ) : null;
		this.diffuseNode = diffuse !== null ? nodeObject( diffuse ) : null;

		/**
		 * Noise source. When `true`, uses the shared generated blue-noise texture (best quality);
		 * when `false`, uses procedural R² noise with the same tile-shift indexing (no texture).
		 *
		 * @type {UniformNode<bool>}
		 * @default true
		 */
		this.useBlueNoise = uniform( true, 'bool' );

		this._blueNoiseTexture = getBlueNoiseTexture();
		this._blueNoiseTextureNode = texture( this._blueNoiseTexture );
		this._blueNoiseSize = uniform( new Vector2( BLUE_NOISE_TEXTURE_SIZE, BLUE_NOISE_TEXTURE_SIZE ) );
		this._blueNoiseIndex = uniform( 0 );

		this.lumaPhi = uniform( 5 );
		this.depthPhi = uniform( 5 );
		this.normalPhi = uniform( 5 );
		this.radius = uniform( 5 );
		this.alphaPhi = uniform( 1 );
		this.roughnessPhi = uniform( 100 );
		this.diffusePhi = uniform( 100 );
		this.adaptRadius = uniform( 0.95 );
		this.denoiseAlpha = uniform( true, 'bool' );
		this.denoisePower = uniform( 0.25 );
		this.maxFrames = uniform( 32 );

		/**
		 * Which channel of the raw texture drives alpha-based edge stopping.
		 * `'raylength'` — alpha encodes SSR ray length; `'ao'` — alpha encodes AO factor;
		 * `'none'` — skip alpha-based edge stopping.
		 *
		 * @type {DenoiseAlphaSource}
		 * @default 'raylength'
		 */
		this.alphaSource = 'raylength';

		this.flickerSuppression = uniform( 1 );
		this.adaptiveTrust = uniform( 0 );

		this.updateBeforeType = NodeUpdateType.FRAME;

		this._resolution = uniform( new Vector2() );
		this._fovY = uniform( MathUtils.degToRad( camera.fov ) );
		this._cameraProjectionMatrixInverse = uniform( new Matrix4().copy( camera.projectionMatrixInverse ) );
		this._cameraProjectionMatrix = uniform( new Matrix4().copy( camera.projectionMatrix ) );

		this._renderTarget = new RenderTarget( 1, 1, { depthBuffer: false, type: HalfFloatType } );
		this._renderTarget.texture.name = 'RecurrentDenoiseNode.output';

		this._material = new NodeMaterial();
		this._material.name = 'RecurrentDenoise';

		this._textureNode = passTexture( this, this._renderTarget.texture );

	}

	setSize( width, height ) {

		if ( width === null || height === null ) return;

		this._renderTarget.setSize( width, height );
		this._resolution.value.set( width, height );

	}

	getTextureNode() {

		return this._textureNode;

	}

	/**
	 * Returns the internal output render target (e.g. for temporal reprojection/SSGI temporal feedback loops).
	 *
	 * @returns {RenderTarget}
	 */
	getRenderTarget() {

		return this._renderTarget;

	}

	updateBefore( frame ) {

		const { renderer } = frame;

		const drawingBufferSize = renderer.getDrawingBufferSize( _size );
		const width = drawingBufferSize.width;
		const height = drawingBufferSize.height;

		const needsRestart = this._renderTarget.width !== width || this._renderTarget.height !== height;
		this.setSize( width, height );

		this._cameraProjectionMatrix.value.copy( this.camera.projectionMatrix );
		this._cameraProjectionMatrixInverse.value.copy( this.camera.projectionMatrixInverse );

		if ( this.camera.isPerspectiveCamera ) {

			this._fovY.value = MathUtils.degToRad( this.camera.fov );

		}

		if ( frame.frameId !== undefined ) this._blueNoiseIndex.value = frame.frameId;

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		if ( needsRestart === true ) {

			renderer.initRenderTarget( this._renderTarget );
			renderer.setRenderTarget( this._renderTarget );
			renderer.clear();
			renderer.setRenderTarget( null );

		}

		renderer.setRenderTarget( this._renderTarget );
		_quadMesh.material = this._material;
		_quadMesh.name = 'RecurrentDenoise';
		_quadMesh.render( renderer );
		renderer.setRenderTarget( null );

		RendererUtils.restoreRendererState( renderer, _rendererState );

	}

	setup( builder ) {

		const blueNoiseRotationMatrix = bindBlueNoiseRotationMatrix(
			this._blueNoiseTextureNode,
			this._resolution,
			this._blueNoiseSize,
			this._blueNoiseIndex,
			BLUE_NOISE_ROTATION_SEED,
			this.useBlueNoise
		);

		const sampleTexture = ( uvCoord ) => texture( this.textureNode, uvCoord ).max( 0 );
		const sampleRaw = ( uvCoord ) => this.rawNode?.sample( uvCoord )?.max( 0 ) ?? vec3( 0 ).max( 0 );
		const sampleDepth = ( uvCoord ) => this.depthNode?.sample( uvCoord )?.x ?? float( 0.5 );
		const sampleNormal = ( uvCoord ) => unpackRGBToNormal( this.normalNode?.sample( uvCoord )?.rgb ?? vec3( 0, 0, 1 ) );
		const sampleRoughnessMetalness = ( uvCoord ) => this.roughnessMetalnessNode?.sample( uvCoord )?.rg ?? vec2( 0, 1 );
		const sampleDiffuse = ( uvCoord ) => this.diffuseNode?.sample( uvCoord )?.rgb ?? vec3( 0 );

		// Neighborhood luma moments for the adaptive-trust (firefly) gating of the temporal blend.
		const getNeighborhoodStats = Fn( ( [ uvCoord, centerSample ] ) => {

			const rlSum = float( 0 ).toVar();
			const rlSumW = float( 0 ).toVar();
			const meanLuma = float( 0 ).toVar();
			const m2Luma = float( 0 ).toVar();
			const lumaCount = float( 0 ).toVar();

			// 4-tap cross (pre-sampled center + 4 axis neighbors) instead of a full 3×3 — about half the fetches.
			// The center tap reuses the caller's already-sampled raw texel.
			const accumulate = ( dx, dy, sample ) => {

				const neighbor = sample !== undefined
					? sample
					: texture( this.rawNode, uvCoord.add( vec2( dx, dy ).div( this._resolution ) ) ).max( 0 ).toConst();

				if ( this.alphaSource === 'raylength' ) {

					const sampleRl = neighbor.a.toVar();
					If( sampleRl.greaterThan( ENV_RAY_LENGTH_THRESHOLD ), () => {

						sampleRl.assign( 0.25 );

					} );
					const w = float( 1 ).div( sampleRl.add( 0.001 ) );
					rlSum.addAssign( sampleRl.mul( w ) );
					rlSumW.addAssign( w );

				}

				If( this.adaptiveTrust.greaterThan( 0 ), () => {

					const nLuma = luminance( neighbor.rgb );
					lumaCount.addAssign( 1 );
					const delta = nLuma.sub( meanLuma ).toConst();
					meanLuma.addAssign( delta.div( lumaCount ) );
					m2Luma.addAssign( delta.mul( nLuma.sub( meanLuma ) ) );

				} );

			};

			accumulate( 0, 0, centerSample );
			accumulate( - 1, 0 );
			accumulate( 1, 0 );
			accumulate( 0, - 1 );
			accumulate( 0, 1 );

			const avgRayLength = this.alphaSource === 'raylength' ? rlSum.div( rlSumW ) : float( 1 );
			const stddevLuma = sqrt( m2Luma.div( lumaCount.max( 1 ) ) );

			// vec3( avgRayLength, meanLuma, stddevLuma )
			return vec3( avgRayLength, meanLuma, stddevLuma );

		} ).setLayout( {
			name: 'getNeighborhoodStats',
			type: 'vec3',
			inputs: [
				{ name: 'uvCoord', type: 'vec2' },
				{ name: 'centerSample', type: 'vec4' }
			]
		} );

		const denoiseFn = Fn( ( [ uvCoord ] ) => {

			const result = property( 'vec4' );

			const depth = sampleDepth( uvCoord ).toConst();
			const viewNormal = sampleNormal( uvCoord ).toConst();
			const texel = sampleTexture( uvCoord ).max( 0 ).toConst();

			const runDenoise = () => {

				const viewPosition = getViewPosition( uvCoord, depth, this._cameraProjectionMatrixInverse ).toConst();
				const roughnessMetalness = sampleRoughnessMetalness( uvCoord ).toConst();
				const roughness = roughnessMetalness.g;
				const metalness = roughnessMetalness.r;

				const rotationMatrix = blueNoiseRotationMatrix( uvCoord );

				const frameNum = float( 1 ).div( texel.a );
				const varianceFactor = getTemporalVarianceFactor( frameNum, this.denoisePower );
				const aggressivity = varianceFactor.oneMinus();

				const raw = sampleRaw( uvCoord ).toConst();

				const viewZ = abs( viewPosition.z );
				const rl = float( 1 ).toVar();
				const nbhdMeanLuma = float( 0 ).toVar();
				const nbhdStddevLuma = float( 0 ).toVar();

				if ( this.alphaSource === 'raylength' ) {

					const stats = getNeighborhoodStats( uvCoord, raw );
					rl.assign( stats.x );
					nbhdMeanLuma.assign( stats.y );
					nbhdStddevLuma.assign( stats.z );

				} else {

					If( this.adaptiveTrust.greaterThan( 0 ), () => {

						const stats = getNeighborhoodStats( uvCoord, raw );
						nbhdMeanLuma.assign( stats.y );
						nbhdStddevLuma.assign( stats.z );

					} );

				}

				const tanHalfFovY = this.alphaSource === 'raylength' ? tan( this._fovY.mul( 0.5 ) ).toConst() : null;
				const hitDistFactor = this.alphaSource === 'raylength'
					? computeHitDistFactor( rl, viewZ, tanHalfFovY ).toConst()
					: float( 1 );

				const denoised = texel.rgb.toVar();
				const totalWeight = float( 1 ).toVar();
				const denoisedFrame = frameNum.toVar();
				const totalFrameWeight = float( 1 ).toVar();

				const denoisedRaw = raw.rgb.toVar();
				const totalWeightRaw = float( 1 ).toVar();

				If( raw.rgb.length().lessThan( 0.0001 ), () => {

					denoisedRaw.assign( vec3( 0 ) );
					totalWeightRaw.assign( 0 );

				} );

				const avgAo = this.alphaSource === 'ao' ? raw.a.toConst() : float( 1 );
				const mappedAvgAo = this.alphaSource === 'ao' ? mapAo( avgAo ) : float( 0 );

				const worldRadius = this.radius.mul( WORLD_RADIUS_SCALE ).toVar();

				if ( this.mode === 'specular' ) {

					worldRadius.mulAssign( rl.mul( viewPosition.z.abs() ) );
					worldRadius.mulAssign( roughness.pow2() );

				} else {

					worldRadius.mulAssign( avgAo.pow( 2 ).mul( viewPosition.z.abs() ) );

				}

				worldRadius.mulAssign( mix( 1, AGGRESSIVITY_RADIUS_MIN, aggressivity ) );

				const T = vec3( 0 ).toVar();
				const B = vec3( 0 ).toVar();

				if ( this.mode === 'specular' ) {

					const V = normalize( viewPosition ).negate();
					const D = getSpecularDominantDirection( viewNormal, V, roughness );
					const R = reflect( D.negate(), viewNormal );
					const Tv = normalize( cross( viewNormal, R ) );
					const Bv = cross( R, Tv );
					const viewAngle = abs( viewNormal.z ).acos().div( float( Math.PI * 0.5 ) ).clamp( 0, 1 );
					const skewFactor = mix( 1.0, roughness, viewAngle );
					T.assign( Tv.mul( skewFactor ) );
					B.assign( Bv );

				} else {

					const up = vec3( 0, 0, 1 );
					const Tv = cross( up, viewNormal ).normalize().toVar();
					If( Tv.length().lessThan( EPSILON ), () => {

						Tv.assign( cross( vec3( 0, 1, 0 ), viewNormal ).normalize() );

					} );
					T.assign( Tv );
					B.assign( cross( viewNormal, Tv ).normalize() );

				}

				T.mulAssign( worldRadius );
				B.mulAssign( worldRadius );

				const centerDiffuse = sampleDiffuse( uvCoord ).toConst();
				const radiusShrink = float( 1 ).toVar();

				// Loop-invariant edge-stopping factors (hoisted out of the kernel loop).
				const normalWeightEdge = mix( NORMAL_WEIGHT_EDGE_MIN, NORMAL_WEIGHT_EDGE_MAX, frameNum.div( this.maxFrames ).pow( this.normalPhi.oneMinus().max( 1e-4 ) ).clamp() );
				const depthWeightScale = this.depthPhi.mul( mix( 1, 100, aggressivity ) ).div( viewZ.abs() );
				const recipViewZ = float( 1 ).div( viewZ ).toConst();

				Loop( { start: int( 0 ), end: int( KERNEL_SAMPLES ), type: 'int', condition: '<', name: 'i' }, ( { i } ) => {

					const offsetUv = vogelDisk( float( i ), 1 ).toVar();
					offsetUv.assign( rotationMatrix.mul( radiusShrink ).mul( offsetUv ) );

					// Exact per-sample view-space projection (both paths)
					const sampleViewPos = viewPosition.add( B.mul( offsetUv.x ).add( T.mul( offsetUv.y ) ) );
					const sampleUv = getScreenPosition( sampleViewPos, this._cameraProjectionMatrix ).toVar();
					sampleUv.assign( sampleUv.abs().oneMinus().abs().oneMinus().clamp() );

					const neighborColor = sampleTexture( sampleUv ).max( 0 ).toConst();

					// When no raw texture is bound, sampleRaw falls back to the filtered texture at the same UV.
					const rawNeighborColor = sampleRaw( sampleUv ).max( 0 ).toVar();
					// if ( this.mode === 'diffuse' ) rawNeighborColor.rgb.assign( mix( neighborColor.rgb, rawNeighborColor.rgb, neighborColor.a ) );

					const nDepth = sampleDepth( sampleUv );
					const nViewPosition = getViewPosition( sampleUv, nDepth, this._cameraProjectionMatrixInverse ).toConst();
					const nViewZ = abs( nViewPosition.z ).toConst();

					const kernelDiff = float( 0 ).toVar();

					// Luma edge stopping
					kernelDiff.addAssign( luminance( rawNeighborColor.rgb ).sub( luminance( raw.rgb ) ).abs().mul( this.lumaPhi ).mul( 10 ) );

					// Diffuse edge stopping (only relevant for specular mode)
					if ( this.diffuseNode !== null ) {

						kernelDiff.addAssign( ( diffuseColorDistance( centerDiffuse, sampleDiffuse( sampleUv ), float( 0 ) ).mul( this.diffusePhi ).mul( metalness ) ) );

					}

					// AO edge stopping
					if ( this.alphaSource === 'ao' ) {

						const neighborMappedAo = mapAo( rawNeighborColor.a );
						// We multiply here with aggressivity as well, since early application of aoW yields noise
						const aoW = mappedAvgAo.div( mappedAvgAo.add( neighborMappedAo ).add( AO_EDGE_STOPPING_BIAS ) ).mul( this.alphaPhi ).mul( aggressivity );

						kernelDiff.addAssign( ( aoW ) );


					} else if ( this.alphaSource === 'raylength' ) {

						// Ray length edge stopping

						const neighborHitDistFactor = computeHitDistFactor( rawNeighborColor.a, nViewZ, tanHalfFovY );
						const hdfDiff = hitDistFactor.sub( neighborHitDistFactor ).abs();

						const rayLengthFactor = hdfDiff.mul( this.alphaPhi ).mul( 20 ).div( viewPosition.z.abs() );

						kernelDiff.addAssign( rayLengthFactor );

					}

					// Roughness edge stopping
					if ( this.mode === 'specular' ) kernelDiff.addAssign( ( abs( roughness.sub( sampleRoughnessMetalness( sampleUv ).g ) ).mul( this.roughnessPhi ) ) );

					const nViewNormal = sampleNormal( sampleUv );
					const distToPlane = viewSpacePlaneDistance( viewPosition, nViewPosition, nViewNormal, nViewZ );
					const normalDot = dot( viewNormal, nViewNormal ).pow( recipViewZ ).max( 0 );

					// Geometric edge stopping (depth and normal)
					const depthW = distToPlane.mul( depthWeightScale );
					const normalW = smoothstep( normalWeightEdge, NORMAL_DOT_SMOOTHSTEP_MAX, normalDot );

					// Sum every negative-exponent edge-stopping term (kernel + depth/plane, plus the SSR hit-distance term)
					const w = exp( kernelDiff.mul( aggressivity ).add( depthW ).negate() ).mul( normalW ).toVar();

					// to mitigate the effect of fireflies and high variance in recently disoccluded regions, we weigh by the inverse luminance for the first 4 frames
					// if ( this.mode === 'diffuse' ) w.mulAssign( mix( float( 1 ).div( luminance( neighborColor.rgb ).max( 1e-4 ) ), 1, frameNum.div( 4 ).min( 1 ) ) );

					denoisedRaw.addAssign( rawNeighborColor.rgb.mul( w ) );
					totalWeightRaw.addAssign( w );

					denoised.addAssign( neighborColor.rgb.mul( w ) );
					totalWeight.addAssign( w );

					// Denoising the alpha (accumulation speed), to get smoother disocclusion transitions
					If( this.denoiseAlpha, () => {

						const neighborAWeight = neighborColor.a.greaterThan( texel.a ).select( normalW.mul( 0.25 ), 0 );
						denoisedFrame.addAssign( float( 1 ).div( neighborColor.a ).mul( neighborAWeight ) );
						totalFrameWeight.addAssign( neighborAWeight );

					} );

					// Feedback to shrink radius based on the weight
					radiusShrink.assign( mix( radiusShrink, w, this.adaptRadius ) );


				} );

				denoised.divAssign( totalWeight.max( EPSILON ) );
				denoised.assign( denoised.max( EPSILON ) );
				denoisedRaw.divAssign( totalWeightRaw.max( EPSILON ) );

				if ( this.accumulate ) {

					const computedFrame = denoisedFrame.div( totalFrameWeight.max( EPSILON ) );
					const a = float( 1 ).div( computedFrame.max( EPSILON ) ).toConst();

					if ( this.rawNode !== null ) {

						const blended = karisTemporalBlend(
							denoised,
							denoisedRaw,
							a,
							this.flickerSuppression,
							this.adaptiveTrust,
							nbhdMeanLuma,
							nbhdStddevLuma
						);

						result.assign( vec4( blended, a ) );

					} else {

						const finalDenoised = mix( denoised, denoisedRaw, a );
						result.assign( vec4( finalDenoised, a ) );

					}

				} else {

					result.assign( vec4( denoised, texel.a ) );

				}

			};

			If( depth.greaterThanEqual( 1.0 ).or( dot( viewNormal, viewNormal ).equal( 0.0 ) ), () => {

				Discard();

			} ).Else( runDenoise );

			return result;

		} );

		this._material.fragmentNode = denoiseFn( uv() ).context( builder.getSharedContext() );
		this._material.needsUpdate = true;

		return this._textureNode;

	}

	dispose() {

		this._renderTarget.dispose();
		this._material.dispose();
		// _blueNoiseTexture is the shared generated texture — not disposed here.

	}

}

export default RecurrentDenoiseNode;

/**
 * @tsl
 * @param {Node} inputTexture - Temporally filtered input to denoise (e.g. TRAA output).
 * @param {Camera} camera
 * @param {RecurrentDenoiseNodeOptions} [options={}]
 * @returns {RecurrentDenoiseNode}
 */
export const recurrentDenoise = ( inputTexture, camera, options = {} ) => nodeObject( new RecurrentDenoiseNode(
	convertToTexture( inputTexture ),
	camera,
	options
) );
