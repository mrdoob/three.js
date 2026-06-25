import { abs, atan, bool, convertToTexture, cos, cross, Discard, dot, EPSILON, exp, float, Fn, getScreenPosition, getViewPosition, If, int, log, Loop, luminance, mat2, max, mix, nodeObject, NodeUpdateType, normalize, passTexture, PI, property, reflect, sin, smoothstep, sqrt, tan, texture, uniform, unpackRGBToNormal, uv, vec2, vec3, vec4 } from 'three/tsl';
import { HalfFloatType, MathUtils, Matrix4, NodeMaterial, QuadMesh, RendererUtils, RenderTarget, TempNode, Vector2 } from 'three/webgpu';
import { bindAnalyticNoise } from '../utils/RNoise.js';
import { ENV_RAY_LENGTH_THRESHOLD } from '../utils/SpecularHelpers.js';

const _quadMesh = /*@__PURE__*/ new QuadMesh();
const _size = /*@__PURE__*/ new Vector2();

let _rendererState;

const KERNEL_SAMPLES = 8;
const NOISE_ROTATION_SEED = 83;
const WORLD_RADIUS_SCALE = 0.1;

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

const _temporalWeight = Fn( ( [ x, strength ] ) => float( 1 ).div( x.pow( strength ) ) ).setLayout( {
	name: 'temporalWeight',
	type: 'float',
	inputs: [
		{ name: 'x', type: 'float' },
		{ name: 'strength', type: 'float' }
	]
} );

/**
 * Temporal accumulation variance factor in `[0, 1]`. Higher values mean more history confidence.
 *
 * @tsl
 */
const getTemporalVarianceFactor = Fn( ( [ frameNum, strength ] ) => {

	return _temporalWeight( frameNum, strength ).max( 0.05 );

} ).setLayout( {
	name: 'getTemporalVarianceFactor',
	type: 'float',
	inputs: [
		{ name: 'frameNum', type: 'float' },
		{ name: 'strength', type: 'float' }
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

	return factor;

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
 * GGX inverse-CDF: half-angle tangent enclosing `percent` of the specular lobe volume.
 * `roughness` is perceptual (alpha = roughness²).
 *
 * @tsl
 */
const specularLobeTanHalfAngle = Fn( ( [ roughness, percent ] ) => {

	const alpha = roughness.mul( roughness );
	return alpha.mul( sqrt( percent.div( float( 1 ).sub( percent ).max( 1e-6 ) ) ) );

} ).setLayout( {
	name: 'specularLobeTanHalfAngle',
	type: 'float',
	inputs: [
		{ name: 'roughness', type: 'float' },
		{ name: 'percent', type: 'float' }
	]
} );

const EXP_WEIGHT_SCALE = 4;
const NORMAL_ENCODING_ERROR = 1.5 / 255;

/**
 * Loop-invariant part of the adaptive normal edge-stopping weight: the Gaussian falloff
 * constant `2·EXP_WEIGHT_SCALE / lobeHalfAngle²`. `roughness`/`aggressivity`/`invNormalPhi`
 * are constant across the kernel, so this is hoisted out of the tap loop and evaluated once
 * per pixel. Lobe half-angle from REBLUR (NRD).
 *
 * @tsl
 */
const lobeNormalFalloff = Fn( ( [ roughness, aggressivity, invNormalPhi ] ) => {

	const percent = mix( invNormalPhi.pow2(), float( 0 ), aggressivity.sqrt() ).clamp( 0.1, 0.99 );
	const tanHalfAngle = specularLobeTanHalfAngle( roughness, percent );
	const lobeHalfAngle = max( atan( tanHalfAngle ), float( NORMAL_ENCODING_ERROR ) );

	const invHalfAngle = float( 1 ).div( lobeHalfAngle );
	return invHalfAngle.mul( invHalfAngle ).mul( 2 * EXP_WEIGHT_SCALE );

} ).setLayout( {
	name: 'lobeNormalFalloff',
	type: 'float',
	inputs: [
		{ name: 'roughness', type: 'float' },
		{ name: 'aggressivity', type: 'float' },
		{ name: 'invNormalPhi', type: 'float' }
	]
} );

/**
 * Adaptive lobe normal edge-stopping weight
 *
 * Evaluated entirely in cosine space: with `angle² ≈ 2(1 − cosθ)`, the original
 * `exp( −SCALE·angle/halfAngle )` becomes a Gaussian `exp( falloff·(cosθ − 1) )`, so a
 * single `exp` replaces the per-tap `acos`. Matches the original at the half-angle for
 * narrow lobes and is slightly more permissive for wide (diffuse) ones.
 *
 * @tsl
 */
const lobeNormalWeight = Fn( ( [ viewNormal, nNormalV, lobeFalloff ] ) => {

	const cosA = dot( viewNormal, nNormalV );

	return exp( cosA.sub( 1 ).mul( lobeFalloff ) );

} ).setLayout( {
	name: 'lobeNormalWeight',
	type: 'float',
	inputs: [
		{ name: 'viewNormal', type: 'vec3' },
		{ name: 'nNormalV', type: 'vec3' },
		{ name: 'lobeFalloff', type: 'float' }
	]
} );

/**
 * View-space plane distance between two surface points (edge-stopping geometry term).
 *
 * @tsl
 */
const planeDistance = Fn( ( [ position, nPosition, normal ] ) => {

	return abs( dot( position.sub( nPosition ), normal ) );

} ).setLayout( {
	name: 'planeDistance',
	type: 'float',
	inputs: [
		{ name: 'position', type: 'vec3' },
		{ name: 'nPosition', type: 'vec3' },
		{ name: 'normal', type: 'vec3' },
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

const toTextureNode = ( value ) => {

	if ( value === null ) return null;

	if ( value.isTexture === true ) return texture( value );

	return convertToTexture( value.getTextureNode?.() ?? value );

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
		this.rawNode = toTextureNode( raw );
		this.roughnessMetalnessNode = metalRoughness !== null ? nodeObject( metalRoughness ) : null;
		this.diffuseNode = diffuse !== null ? nodeObject( diffuse ) : null;

		this._noiseIndex = uniform( 0 );

		this.lumaPhi = uniform( 5 );
		this.depthPhi = uniform( 5 );
		this.normalPhi = uniform( 5 );
		this.radius = uniform( 5 );
		this.alphaPhi = uniform( 1 );
		this.roughnessPhi = uniform( 100 );
		this.diffusePhi = uniform( 100 );
		this.adapt = uniform( 0.5 );
		this.smoothDisocclusions = uniform( true, 'bool' );
		this.strength = uniform( 0.25 );
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
		this._viewMatrix = uniform( new Matrix4().copy( camera.matrixWorldInverse ) );

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
		this._viewMatrix.value.copy( this.camera.matrixWorldInverse );

		if ( this.camera.isPerspectiveCamera ) {

			this._fovY.value = MathUtils.degToRad( this.camera.fov );

		}

		if ( frame.frameId !== undefined ) this._noiseIndex.value = frame.frameId;

		// Denoise renders via an internal _quadMesh, not through the RenderPipeline output graph.
		// Upstream passes (e.g. TemporalReprojectNode) referenced by a PassTextureNode input are
		// otherwise never scheduled, their updateBefore() would not run and this pass would sample
		// a stale/empty render target.
		if ( this.textureNode.isPassTextureNode === true ) frame.updateBeforeNode( this.textureNode.passNode );

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

		const sampleAnalyticNoise = bindAnalyticNoise( this._resolution, NOISE_ROTATION_SEED );

		const noiseRotationMatrix = Fn( ( [ r ] ) => {

			const angle = r.mul( 2 ).mul( PI );
			return mat2( cos( angle ), sin( angle ).negate(), sin( angle ), cos( angle ) );

		} );

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
			const hasEnvRay = bool( false ).toVar();

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
						hasEnvRay.assign( true );

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
			return vec4( avgRayLength, meanLuma, stddevLuma, hasEnvRay.toFloat() );

		} ).setLayout( {
			name: 'getNeighborhoodStats',
			type: 'vec4',
			inputs: [
				{ name: 'uvCoord', type: 'vec2' },
				{ name: 'centerSample', type: 'vec4' }
			]
		} );

		const denoiseFn = Fn( ( [ uvCoord ] ) => {

			const result = property( 'vec4' );

			const depth = sampleDepth( uvCoord ).toConst();

			const runDenoise = () => {

				const viewNormal = sampleNormal( uvCoord ).toConst();
				const worldNormal = viewNormal.transformDirection( this._viewMatrix ).toConst();
				const texel = sampleTexture( uvCoord ).max( 0 ).toConst();

				const viewPosition = getViewPosition( uvCoord, depth, this._cameraProjectionMatrixInverse ).toConst();
				const roughnessMetalness = sampleRoughnessMetalness( uvCoord ).toConst();
				const roughness = roughnessMetalness.g;
				const metalness = roughnessMetalness.r;

				const noiseTexel = sampleAnalyticNoise( uvCoord, this._noiseIndex );
				const rotationMatrix = noiseRotationMatrix( noiseTexel.r );

				const frameNum = float( 1 ).div( texel.a );
				const varianceFactor = getTemporalVarianceFactor( frameNum, this.strength.oneMinus() );
				const aggressivity = varianceFactor.oneMinus();

				const raw = sampleRaw( uvCoord ).toConst();

				const viewZ = abs( viewPosition.z );
				const rl = float( 1 ).toVar();
				const nbhdMeanLuma = float( 0 ).toVar();
				const nbhdStddevLuma = float( 0 ).toVar();
				const hasEnvRay = bool( false ).toVar();

				if ( this.alphaSource === 'raylength' ) {

					const stats = getNeighborhoodStats( uvCoord, raw );
					rl.assign( stats.x );
					nbhdMeanLuma.assign( stats.y );
					nbhdStddevLuma.assign( stats.z );
					hasEnvRay.assign( stats.w.greaterThan( 0.5 ) );

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
					worldRadius.mulAssign( roughness.sqrt().max( 0.01 ) );

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

				// Directional analog of radiusShrink: an accumulated tangent-space shift that skews
				// subsequent taps toward directions that yielded high weight (related geometry).
				const polarBias = vec2( 0 ).toVar();

				const depthWeightScale = this.depthPhi.mul( 500 ).mul( viewNormal.z.abs() ).div( viewPosition.z.abs() );

				// Lobe geometry depends only on per-pixel terms, so compute its falloff constant once here.
				const lobeFalloff = lobeNormalFalloff( roughness, aggressivity, this.normalPhi.oneMinus() ).toConst();

				Loop( { start: int( 0 ), end: int( KERNEL_SAMPLES ), type: 'int', condition: '<', name: 'i' }, ( { i } ) => {

					const baseOffset = vogelDisk( float( i ), 1 ).toVar();
					const sampleDir = baseOffset.normalize().toConst();

					// Blend the tap direction toward the polar bias, then restore the Vogel radius and shrink.
					const skewedDir = mix( sampleDir, polarBias.max( EPSILON ).normalize(), this.adapt.mul( aggressivity )
						.mul( polarBias.dot( polarBias ).greaterThan( 0.001 ).select( 1, 0 ) ) );
					const offset = rotationMatrix.mul( skewedDir.mul( baseOffset.length().mul( radiusShrink ) ) ).toVar();

					// Exact per-sample view-space projection (both paths)
					const sampleViewPos = viewPosition.add( B.mul( offset.x ).add( T.mul( offset.y ) ) );
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

						const rayLengthFactor = hdfDiff.mul( this.alphaPhi ).div( viewPosition.z.abs() );

						// Env rays are harder to compare so we accept if this sample is an env ray and there is an env ray in the neighborhood
						kernelDiff.addAssign( rawNeighborColor.a.greaterThan( ENV_RAY_LENGTH_THRESHOLD ).and( hasEnvRay ).select( 1, rayLengthFactor ) );

					}

					// Roughness edge stopping
					if ( this.mode === 'specular' ) kernelDiff.addAssign( ( abs( roughness.sub( sampleRoughnessMetalness( sampleUv ).g ) ).mul( this.roughnessPhi ) ) );

					const nViewNormal = sampleNormal( sampleUv );
					const nWorldNormal = nViewNormal.transformDirection( this._viewMatrix );
					const distToPlane = planeDistance( viewPosition, nViewPosition, viewNormal );

					// Geometric edge stopping (depth and normal)
					const depthDiff = distToPlane.mul( depthWeightScale );
					const normalW = lobeNormalWeight( worldNormal, nWorldNormal, lobeFalloff );

					// Sum every negative-exponent edge-stopping term (kernel + depth/plane, plus the SSR hit-distance term)
					const w = exp( kernelDiff.mul( aggressivity ).add( depthDiff ).negate() ).mul( normalW ).toVar();

					// Feedback to shrink radius based on the weight
					radiusShrink.assign( mix( radiusShrink, w, this.adapt ) );

					// Polar feedback: skew subsequent taps toward high-weight directions (related geometry)
					polarBias.assign( mix( polarBias, sampleDir.mul( w.sub( 0.5 ) ), 0.5 ) );

					// to mitigate the effect of fireflies and high variance in recently disoccluded regions, we weigh by the inverse luminance for the first 5 frames
					w.mulAssign( mix( float( 1 ).div( luminance( rawNeighborColor.rgb ).pow( 2 ).add( 0.01 ) ), 1, frameNum.div( 5 ).min( 1 ) ) );

					denoisedRaw.addAssign( rawNeighborColor.rgb.mul( w ) );
					totalWeightRaw.addAssign( w );

					denoised.addAssign( neighborColor.rgb.mul( w ) );
					totalWeight.addAssign( w );

					// Denoising the alpha (accumulation speed), to get smoother disocclusion transitions
					If( this.smoothDisocclusions, () => {

						const neighborAWeight = neighborColor.a.greaterThan( texel.a ).select( w.mul( 0.33 ), 0 );
						denoisedFrame.addAssign( float( 1 ).div( neighborColor.a ).mul( neighborAWeight ) );
						totalFrameWeight.addAssign( neighborAWeight );

					} );

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

			If( depth.greaterThanEqual( 1.0 ), () => {

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
	toTextureNode( inputTexture ),
	camera,
	options
) );
