import { EPSILON, Fn, If, abs, convertToTexture, dFdx, dFdy, dot, exp, float, floor, fwidth, getViewPosition, ivec2, luminance, max, min, mix, nodeObject, normalize, passTexture, screenCoordinate, select, smoothstep, sqrt, struct, texture, textureLoad, uniform, unpackRGBToNormal, uv, vec2, vec3, vec4, velocity } from 'three/tsl';
import { DepthTexture, HalfFloatType, Matrix4, NodeMaterial, NodeUpdateType, QuadMesh, RenderTarget, RendererUtils, TempNode, Vector2, Vector3 } from 'three/webgpu';
import { ENV_RAY_LENGTH, ENV_RAY_LENGTH_THRESHOLD } from '../utils/SpecularHelpers.js';

// Reprojection helpers

/**
 * Maps a resolve (screen) texel to the corresponding beauty-input texel when resolutions differ.
 *
 * @tsl
 */
const beautyTexelFromScreen = Fn( ( [ screenTexel, beautySize, resolveSize ] ) => {

	return ivec2( floor( vec2( screenTexel ).mul( beautySize ).div( resolveSize ) ) );

} ).setLayout( {
	name: 'beautyTexelFromScreen',
	type: 'ivec2',
	inputs: [
		{ name: 'screenTexel', type: 'ivec2' },
		{ name: 'beautySize', type: 'vec2' },
		{ name: 'resolveSize', type: 'vec2' }
	]
} );

/**
 * Projects a world-space position into previous-frame UV coordinates.
 *
 * @tsl
 */
const projectWorldToUV = Fn( ( [ worldPos, previousViewMatrix, previousProjectionMatrix ] ) => {

	const resultUV = vec2( - 1 ).toVar();
	const viewSpace = previousViewMatrix.mul( vec4( worldPos, 1.0 ) );
	const clipSpace = previousProjectionMatrix.mul( viewSpace ).toVar();
	const clipW = clipSpace.w.toVar();

	If( abs( clipW ).greaterThan( float( 1e-5 ) ), () => {

		const ndc = clipSpace.xyz.div( clipW );
		resultUV.assign( ndc.xy.mul( 0.5 ).add( 0.5 ) );
		resultUV.y.assign( resultUV.y.oneMinus() );

	} );

	return resultUV;

} ).setLayout( {
	name: 'projectWorldToUV',
	type: 'vec2',
	inputs: [
		{ name: 'worldPos', type: 'vec3' },
		{ name: 'previousViewMatrix', type: 'mat4' },
		{ name: 'previousProjectionMatrix', type: 'mat4' }
	]
} );

// YCoCg variance clipping

/**
 * @param {Node<vec3>} c
 * @returns {Node<vec3>}
 */
const rgbToYCoCg = ( c ) => vec3(
	dot( c, vec3( 0.25, 0.5, 0.25 ) ),
	dot( c, vec3( 0.5, 0.0, - 0.5 ) ),
	dot( c, vec3( - 0.25, 0.5, - 0.25 ) )
);

/**
 * @param {Node<vec3>} c
 * @returns {Node<vec3>}
 */
const ycocgToRGB = ( c ) => vec3(
	c.x.add( c.y ).sub( c.z ),
	c.x.add( c.z ),
	c.x.sub( c.y ).sub( c.z )
);

const VARIANCE_CLIP_LUMA_SCALE = 10;

/**
 * Inverse-luminance compression for HDR variance clipping (Karis-style).
 * Bright samples contribute less to neighbourhood moments so sun pixels do not
 * inflate the YCoCg AABB and cause aggressive clipping flicker.
 *
 * @param {Node<vec3>} rgb
 * @param {Node<float>} flickerSuppression
 * @returns {Node<vec3>}
 */
const dampenForVarianceClip = ( rgb, flickerSuppression ) => {

	const scale = luminance( rgb ).mul( flickerSuppression ).mul( VARIANCE_CLIP_LUMA_SCALE ).add( 1 );
	return rgb.div( scale );

};

/**
 * Clips the history sample to the neighbourhood AABB by projecting it toward the box centre.
 * Reference: https://github.com/playdeadgames/temporal
 *
 * @tsl
 */
const clipToAABB = Fn( ( [ history, boxMin, boxMax ] ) => {

	const pClip = boxMax.add( boxMin ).mul( 0.5 );
	const eClip = boxMax.sub( boxMin ).mul( 0.5 ).add( 1e-7 );
	const vClip = history.sub( pClip );
	const vUnit = vClip.div( eClip );
	const absUnit = vUnit.abs();
	const maxUnit = max( absUnit.x, absUnit.y, absUnit.z );

	return maxUnit.greaterThan( 1 ).select( pClip.add( vClip.div( maxUnit ) ), history );

} ).setLayout( {
	name: 'clipToAABB',
	type: 'vec3',
	inputs: [
		{ name: 'history', type: 'vec3' },
		{ name: 'boxMin', type: 'vec3' },
		{ name: 'boxMax', type: 'vec3' }
	]
} );

const neighborhoodStruct = struct( {
	mean: 'vec3',
	stdColor: 'vec3',
	rayLength: 'float',
	envProbability: 'float',
	stdDevRayLength: 'float'
} );

/**
 * Single 3×3 neighbourhood pass over the beauty buffer. One textureLoad per tap feeds both the
 * YCoCg variance-clipping box (colour) and the SSR ray-length statistics (alpha), which previously
 * required two separate 3×3 fetches of the same texture.
 *
 * Sampling is done on the beauty-texel grid (`beautyTexel + offset`), so the taps are distinct
 * source texels even when the beauty buffer is lower resolution than the resolve pass (upscaling).
 *
 * @tsl
 */
const collectNeighborhood = Fn( ( [ beautyTexture, beautyTexel, inputColor, flickerSuppression ] ) => {

	const offsets = [
		[ - 1, - 1 ],
		[ - 1, 1 ],
		[ 1, - 1 ],
		[ 1, 1 ],
		[ 1, 0 ],
		[ 0, - 1 ],
		[ 0, 1 ],
		[ - 1, 0 ],
	];

	// Colour moments (YCoCg) — centre reuses the already-fetched inputColor.
	const center = rgbToYCoCg( dampenForVarianceClip( inputColor.rgb, flickerSuppression ) );
	const moment1 = center.toVar();
	const moment2 = center.pow2().toVar();

	// Ray-length statistics (Welford) over screen-space hits only.
	const rayLengthSum = float( 0 ).toVar();
	const rayLengthCount = float( 0 ).toVar();
	const meanRayLength = float( 0 ).toVar();
	const m2RayLength = float( 0 ).toVar();

	const accumulateRayLength = ( alpha ) => {

		If( alpha.lessThan( ENV_RAY_LENGTH_THRESHOLD ), () => {

			rayLengthSum.addAssign( alpha );
			rayLengthCount.addAssign( 1 );

			const delta = alpha.sub( meanRayLength ).toVar();
			meanRayLength.addAssign( delta.div( rayLengthCount ) );
			m2RayLength.addAssign( delta.mul( alpha.sub( meanRayLength ) ) );

		} );

	};

	accumulateRayLength( inputColor.a );

	for ( const [ x, y ] of offsets ) {

		const neighbor = textureLoad( beautyTexture, beautyTexel.add( ivec2( x, y ) ) ).max( 0 ).toVar();

		const c = rgbToYCoCg( dampenForVarianceClip( neighbor.rgb, flickerSuppression ) );
		moment1.addAssign( c );
		moment2.addAssign( c.pow2() );

		accumulateRayLength( neighbor.a );

	}

	const N = float( offsets.length + 1 );
	const mean = moment1.div( N );
	const stdColor = moment2.div( N ).sub( mean.pow2() ).max( 0 ).sqrt();

	// Continuous environment probability: fraction of the 3×3 neighbourhood that missed in screen space
	// and fell back to env (0 = all hits, 1 = all env), for smooth reflection/environment transitions.
	const envProbability = rayLengthCount.div( float( 9 ) ).oneMinus();
	const rayLength = rayLengthCount.lessThan( 0.5 ).select( float( ENV_RAY_LENGTH ), rayLengthSum.div( max( rayLengthCount, float( 1e-4 ) ) ) );
	const stdDevRayLength = sqrt( m2RayLength.div( max( rayLengthCount, float( 1.0 ) ) ) ).max( 1e-3 );

	return neighborhoodStruct( mean, stdColor, rayLength, envProbability, stdDevRayLength );

} );

/**
 * Variance clipping in YCoCg space (Salvi, GDC 2016). Uses the colour moments gathered by
 * {@link collectNeighborhood}; `gamma` widens the AABB and is kept out of the gather so the
 * neighbourhood pass stays independent of the per-pixel motion factor.
 *
 * @tsl
 */
const applyVarianceClipping = Fn( ( [ historyColor, mean, stdColor, gamma, flickerSuppression ] ) => {

	const stddev = stdColor.mul( gamma );
	const boxMin = mean.sub( stddev );
	const boxMax = mean.add( stddev );

	const historyRGB = historyColor.rgb.toVar();
	const historyScale = luminance( historyRGB ).mul( flickerSuppression ).mul( VARIANCE_CLIP_LUMA_SCALE ).add( 1 );
	const clipped = clipToAABB( rgbToYCoCg( historyRGB.div( historyScale ) ), boxMin, boxMax );

	return ycocgToRGB( clipped ).mul( historyScale );

} );

// History sampling

const bilinearTapStruct = struct( { color: 'vec4', weight: 'float', confidence: 'float' } );
const historyResultStruct = struct( { color: 'vec4', tapConfidence: 'float', minConfidence: 'float' } );

/**
 * Single bilinear history tap with plane-distance and normal confidence.
 *
 * @tsl
 */
const sampleBilinearTap = Fn( ( [
	historyTexture,
	previousDepthNode,
	previousNormalNode,
	resolution,
	previousProjectionMatrixInverse,
	previousCameraWorldMatrix,
	previousCameraViewMatrix,
	tapCoord,
	bilinearWeight,
	worldPosition,
	worldNormal
] ) => {

	const color = textureLoad( historyTexture, tapCoord ).max( 0 );
	const reprojDepth = textureLoad( previousDepthNode, tapCoord ).r;
	const reprojViewPos = getViewPosition( vec2( tapCoord ).add( 0.5 ).div( resolution ), reprojDepth, previousProjectionMatrixInverse );
	const reprojWorldPos = previousCameraWorldMatrix.mul( vec4( reprojViewPos, 1.0 ) ).xyz;
	const reprojWorldNorm = unpackRGBToNormal( textureLoad( previousNormalNode, tapCoord ).rgb ).transformDirection( previousCameraViewMatrix );

	const planeDiff = abs( dot( reprojWorldPos.sub( worldPosition ), worldNormal ) ).toVar();
	planeDiff.divAssign( abs( reprojViewPos.z ) );
	const normalConfidence = smoothstep( 0.95, 0.999, reprojWorldNorm.dot( worldNormal ) );
	const confidence = smoothstep( 0, 0.01, planeDiff ).oneMinus().mul( normalConfidence );
	const weight = bilinearWeight.mul( confidence );

	return bilinearTapStruct( color.mul( weight ), weight, confidence );

} );

/**
 * @param {Object} ctx - Shared {@link sampleBilinearTap} inputs plus `reprojICoord`.
 * @param {Node<ivec2>} tapOffset
 * @param {Node<float>} bilinearWeight
 */
function bilinearHistoryTap( ctx, tapOffset, bilinearWeight ) {

	return sampleBilinearTap(
		ctx.historyTexture,
		ctx.previousDepthNode,
		ctx.previousNormalNode,
		ctx.resolution,
		ctx.previousProjectionMatrixInverse,
		ctx.previousCameraWorldMatrix,
		ctx.previousCameraViewMatrix,
		ctx.reprojICoord.add( tapOffset ),
		bilinearWeight,
		ctx.worldPosition,
		ctx.worldNormal
	);

}

/**
 * Geometrically-weighted 4-tap bilinear history sample.
 *
 * @tsl
 */
const sampleHistory4Tap = Fn( ( [
	historyTexture,
	previousDepthNode,
	previousNormalNode,
	resolution,
	previousProjectionMatrixInverse,
	previousCameraWorldMatrix,
	previousCameraViewMatrix,
	reprojUV,
	worldPosition,
	worldNormal,
	inputColor
] ) => {

	const reprojPixelCoord = reprojUV.mul( resolution ).sub( 0.5 ).toVar();
	const reprojICoord = ivec2( floor( reprojPixelCoord ) );
	const fCoord = reprojPixelCoord.fract();

	const fx = fCoord.x;
	const fy = fCoord.y;
	const f00 = float( 1 ).sub( fx ).mul( float( 1 ).sub( fy ) );
	const f10 = fx.mul( float( 1 ).sub( fy ) );
	const f01 = float( 1 ).sub( fx ).mul( fy );
	const f11 = fx.mul( fy );

	const tapCtx = {
		historyTexture,
		previousDepthNode,
		previousNormalNode,
		resolution,
		previousProjectionMatrixInverse,
		previousCameraWorldMatrix,
		previousCameraViewMatrix,
		reprojICoord,
		worldPosition,
		worldNormal
	};

	const tap00 = bilinearHistoryTap( tapCtx, ivec2( 0, 0 ), f00 );
	const tap10 = bilinearHistoryTap( tapCtx, ivec2( 1, 0 ), f10 );
	const tap01 = bilinearHistoryTap( tapCtx, ivec2( 0, 1 ), f01 );
	const tap11 = bilinearHistoryTap( tapCtx, ivec2( 1, 1 ), f11 );

	const colorSum = tap00.get( 'color' ).add( tap10.get( 'color' ) ).add( tap01.get( 'color' ) ).add( tap11.get( 'color' ) );
	const weightSum = tap00.get( 'weight' ).add( tap10.get( 'weight' ) ).add( tap01.get( 'weight' ) ).add( tap11.get( 'weight' ) );
	const maxConf = max( max( tap00.get( 'confidence' ), tap10.get( 'confidence' ) ), max( tap01.get( 'confidence' ), tap11.get( 'confidence' ) ) );
	const minConf = min( min( tap00.get( 'confidence' ), tap10.get( 'confidence' ) ), min( tap01.get( 'confidence' ), tap11.get( 'confidence' ) ) );

	return historyResultStruct(
		select( weightSum.greaterThan( 0.01 ), colorSum.div( weightSum ), vec4( inputColor.rgb, float( 1 ) ) ),
		maxConf,
		minConf
	);

} );

// Diffuse reprojection

/**
 * Reprojection-stretch confidence — detects history magnification (surface stretching).
 *
 * Differentiates the per-pixel history UV with hardware screen-space derivatives to form the
 * reprojection Jacobian `J = ∂(historyPixel)/∂(screenPixel)`, then returns its **minimum
 * singular value**, clamped to `[0,1]`.
 *
 * `σ_min < 1` means the most-stretched axis magnifies history — a few history pixels are smeared
 * over many current pixels (e.g. a surface seen at grazing in the previous frame, face-on now), so
 * history is undersampled and its confidence should be reduced. `σ_min ≥ 1` (history minified) is
 * safe and clamps to 1. Using the minimum singular value rather than the Jacobian determinant
 * catches anisotropic 1-D stretch that an area-only measure would smear out.
 *
 * Works for any reprojection (surface-velocity or parallax hit-point) since it differentiates the
 * final history UV, so the same factor applies to both the diffuse and specular paths.
 *
 * @tsl
 */
const reprojectionStretchConfidence = Fn( ( [ historyUV, resolution ] ) => {

	// Jacobian columns in pixels: how the history sample position moves per screen pixel.
	const jx = dFdx( historyUV ).mul( resolution ).toVar();
	const jy = dFdy( historyUV ).mul( resolution ).toVar();

	// Singular values of the 2×2 J are sqrt( eigenvalues of JᵀJ ), with
	// trace( JᵀJ ) = ‖J‖²_F and det( JᵀJ ) = det( J )².
	const det = jx.x.mul( jy.y ).sub( jx.y.mul( jy.x ) );
	const fro2 = dot( jx, jx ).add( dot( jy, jy ) );
	const disc = fro2.mul( fro2 ).mul( 0.25 ).sub( det.mul( det ) ).max( 0 ).sqrt();
	const sigMin = fro2.mul( 0.5 ).sub( disc ).max( 0 ).sqrt();

	return sigMin.saturate();

} );

// Specular reprojection

/**
 * Parallax-corrected hit-point reprojection into previous-frame UVs.
 *
 * @tsl
 */
const reprojectHitPoint = Fn( ( [
	rayOrig,
	rayLength,
	cameraWorldPosition,
	previousViewMatrix,
	previousProjectionMatrix
] ) => {

	const cameraRay = normalize( rayOrig.sub( cameraWorldPosition ) ).toVar();
	const parallaxHitPoint = rayOrig.add( cameraRay.mul( rayLength ) );

	return projectWorldToUV( parallaxHitPoint, previousViewMatrix, previousProjectionMatrix );

} );

/**
 * Converts screen-space velocity (NDC derivative) to a UV reprojection offset.
 *
 * @tsl
 */
const velocityToUVOffset = Fn( ( [ velocity ] ) => {

	return velocity.mul( vec2( 0.5, - 0.5 ) );

} ).setLayout( {
	name: 'velocityToUVOffset',
	type: 'vec2',
	inputs: [ { name: 'velocity', type: 'vec2' } ]
} );

/**
 * Current and previous-frame camera matrices for temporal reprojection passes.
 *
 * @param {Camera} camera
 */
function bindTemporalCameraUniforms( camera ) {

	const worldMatrix = uniform( new Matrix4().copy( camera.matrixWorld ) );
	const viewMatrix = uniform( new Matrix4().copy( camera.matrixWorldInverse ) );
	const projectionMatrix = uniform( new Matrix4().copy( camera.projectionMatrix ) );
	const projectionMatrixInverse = uniform( new Matrix4().copy( camera.projectionMatrixInverse ) );
	const worldPosition = uniform( new Vector3().copy( camera.position ) );

	const previousWorldMatrix = uniform( new Matrix4().copy( camera.matrixWorld ) );
	const previousViewMatrix = uniform( new Matrix4().copy( camera.matrixWorldInverse ) );
	const previousProjectionMatrix = uniform( new Matrix4().copy( camera.projectionMatrix ) );
	const previousProjectionMatrixInverse = uniform( new Matrix4().copy( camera.projectionMatrixInverse ) );

	/**
	 * @param {Camera} cam
	 */
	function updateFromCamera( cam ) {

		previousWorldMatrix.value.copy( worldMatrix.value );
		previousViewMatrix.value.copy( viewMatrix.value );
		previousProjectionMatrix.value.copy( projectionMatrix.value );
		previousProjectionMatrixInverse.value.copy( projectionMatrixInverse.value );

		worldMatrix.value.copy( cam.matrixWorld );
		viewMatrix.value.copy( cam.matrixWorldInverse );
		projectionMatrix.value.copy( cam.projectionMatrix );
		projectionMatrixInverse.value.copy( cam.projectionMatrixInverse );
		worldPosition.value.copy( cam.position );

	}

	return {
		worldMatrix,
		viewMatrix,
		projectionMatrix,
		projectionMatrixInverse,
		worldPosition,
		previousWorldMatrix,
		previousViewMatrix,
		previousProjectionMatrix,
		previousProjectionMatrixInverse,
		updateFromCamera
	};

}

const _quadMesh = /*@__PURE__*/ new QuadMesh();
const _size = /*@__PURE__*/ new Vector2();

let _rendererState;

const DEFAULT_MAX_VELOCITY_LENGTH = 128;
const VARIANCE_GAMMA_MIN = 0.5;
const VARIANCE_GAMMA_MAX = 1;

/**
 * @typedef {'diffuse' | 'specular'} TemporalReprojectMode
 */

/**
 * @typedef {Object} TemporalReprojectNodeOptions
 * @property {TemporalReprojectMode} [mode='diffuse'] - `diffuse` for SSGI/scene colour; `specular` for SSR reflections.
 * @property {boolean} [hitPointReprojection] - Parallax hit-point reprojection (specular mode only). Defaults to `true` in specular mode.
 * @property {boolean} [accumulate=false] - When `true`, history is stored in this pass (classic temporal resolve). When `false`,
 * use {@link TemporalReprojectNode#setHistoryTexture} to read history from another pass (e.g. denoise output).
 */

/**
 * Temporal reprojection pass for denoising screen-space effects (SSGI, SSR, etc.).
 *
 * Both modes share geometrically-weighted 4-tap bilinear history sampling and YCoCg variance clipping.
 * Surface velocity reprojection is always sampled first. Specular mode then blends in
 * hit-point parallax history on top of that surface result.
 * Diffuse mode applies velocity-field divergence to detect surface stretching.
 *
 * Unlike jitter-based TAA/TAAU, this node does not apply camera sub-pixel jitter — it only
 * reprojects and accumulates history using motion vectors.
 *
 * References:
 * - {@link https://alextardif.com/TAA.html}
 * - {@link https://www.elopezr.com/temporal-aa-and-the-quest-for-the-holy-trail/}
 *
 * @augments TempNode
 * @three_import import { temporalReproject } from 'three/addons/tsl/display/TemporalReprojectNode.js';
 */
class TemporalReprojectNode extends TempNode {

	static get type() {

		return 'TemporalReprojectNode';

	}

	/**
	 * @param {TextureNode} beautyNode
	 * @param {TextureNode} depthNode
	 * @param {TextureNode} normalNode
	 * @param {TextureNode} velocityNode
	 * @param {Camera} camera
	 * @param {TemporalReprojectNodeOptions} [options]
	 */
	constructor( beautyNode, depthNode, normalNode, velocityNode, camera, options = {} ) {

		super( 'vec4' );

		const {
			mode = 'diffuse',
			hitPointReprojection = mode === 'specular',
			accumulate = false
		} = options;

		if ( mode !== 'specular' && mode !== 'diffuse' ) {

			throw new Error( 'TemporalReprojectNode: `mode` must be `diffuse` or `specular`.' );

		}

		this.isTemporalReprojectNode = true;
		this.updateBeforeType = NodeUpdateType.FRAME;

		this.beautyNode = beautyNode;
		this.depthNode = depthNode;
		this.normalNode = normalNode;
		this.velocityNode = velocityNode;
		this.camera = camera;

		/**
		 * @type {TemporalReprojectMode}
		 */
		this.mode = mode;

		/**
		 * When `true`, resolve output is copied into the internal history buffer each frame.
		 * When `false`, history is supplied externally via {@link TemporalReprojectNode#setHistoryTexture}.
		 *
		 * @type {boolean}
		 */
		this.accumulate = accumulate;

		this.maxVelocityLength = DEFAULT_MAX_VELOCITY_LENGTH;

		this._resolution = uniform( new Vector2() );

		this._cameraUniforms = bindTemporalCameraUniforms( camera );

		this.maxFrames = uniform( 32 );
		this.hitPointReprojection = uniform( hitPointReprojection, 'bool' );
		this.clampIntensity = uniform( 1 );
		this.flickerSuppression = uniform( 1 );

		this._historyRenderTarget = new RenderTarget( 1, 1, { depthBuffer: false, type: HalfFloatType, depthTexture: new DepthTexture() } );
		this._historyRenderTarget.texture.name = 'TemporalReprojectNode.history';
		this._historyTextureNode = texture( this._historyRenderTarget.texture );

		this._resolveRenderTarget = new RenderTarget( 1, 1, { depthBuffer: false, type: HalfFloatType } );
		this._resolveRenderTarget.texture.name = 'TemporalReprojectNode.resolve';

		this._resolveMaterial = new NodeMaterial();
		this._resolveMaterial.name = 'TemporalReproject.resolve';

		this._seedMaterial = new NodeMaterial();
		this._seedMaterial.name = 'TemporalReproject.seed';

		this._textureNode = passTexture( this, this._resolveRenderTarget.texture );

		this._originalProjectionMatrix = new Matrix4();

		this._placeholderPreviousDepthTexture = new DepthTexture( 1, 1 );
		this._previousDepthNode = texture( this._placeholderPreviousDepthTexture );
		this._previousNormalTexture = normalNode.value.clone();
		this._previousNormalNode = texture( this._previousNormalTexture );

		this._needsPostProcessingSync = false;
		this._externalHistoryTexture = null;

		this._syncHistoryTextureBinding();

	}

	getTextureNode() {

		return this._textureNode;

	}

	setSize( width, height ) {

		if ( width === null || height === null ) return;

		this._historyRenderTarget.setSize( width, height );
		this._resolveRenderTarget.setSize( width, height );

		this._resolution.value.set( width, height );

	}

	setViewOffset() {

		this.camera.updateProjectionMatrix();
		this._originalProjectionMatrix.copy( this.camera.projectionMatrix );
		velocity.setProjectionMatrix( this._originalProjectionMatrix );

	}

	clearViewOffset() {

		velocity.setProjectionMatrix( null );

	}

	updateBefore( frame ) {

		const { renderer } = frame;

		this._cameraUniforms.updateFromCamera( this.camera );

		const drawingBufferSize = renderer.getDrawingBufferSize( _size );
		const width = drawingBufferSize.width;
		const height = drawingBufferSize.height;

		if ( this._needsPostProcessingSync === true ) {

			this.setViewOffset();
			this._needsPostProcessingSync = false;

		}

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		const needsRestart = this._historyRenderTarget.width !== width || this._historyRenderTarget.height !== height;
		this.setSize( width, height );

		let historySwappedForRestart = false;

		if ( needsRestart === true ) {

			renderer.initRenderTarget( this._historyRenderTarget );
			renderer.initRenderTarget( this._resolveRenderTarget );

			this._previousNormalTexture.dispose();
			this._previousNormalTexture = this.normalNode.value.clone();
			this._previousNormalNode.value = this._previousNormalTexture;

			// External history (e.g. denoise feedback) is stale at the old resolution — use
			// freshly seeded internal history for this frame instead.
			if ( this.accumulate === false && this._externalHistoryTexture !== null ) {

				this._historyTextureNode.value = this._historyRenderTarget.texture;
				historySwappedForRestart = true;

			}

			renderer.setRenderTarget( this._historyRenderTarget );
			_quadMesh.material = this._seedMaterial;
			_quadMesh.name = 'TemporalReproject.seed';
			_quadMesh.render( renderer );
			renderer.setRenderTarget( null );

		}

		renderer.setRenderTarget( this._resolveRenderTarget );

		_quadMesh.material = this._resolveMaterial;
		_quadMesh.name = 'TemporalReproject';
		_quadMesh.render( renderer );
		renderer.setRenderTarget( null );

		if ( historySwappedForRestart === true ) {

			this._syncHistoryTextureBinding();

		} else if ( this.accumulate === true ) {

			renderer.copyTextureToTexture( this._resolveRenderTarget.texture, this._historyRenderTarget.texture );

		}

		const currentDepth = this.depthNode.value;
		const srcW = currentDepth.image !== null && currentDepth.image !== undefined ? currentDepth.image.width : 0;
		const srcH = currentDepth.image !== null && currentDepth.image !== undefined ? currentDepth.image.height : 0;

		if ( srcW > 0 && srcH > 0 ) {

			renderer.copyTextureToTexture( currentDepth, this._historyRenderTarget.depthTexture );
			renderer.copyTextureToTexture( this.normalNode.value, this._previousNormalTexture );

			this._previousDepthNode.value = this._historyRenderTarget.depthTexture;

		}

		RendererUtils.restoreRendererState( renderer, _rendererState );

	}

	setup( builder ) {

		const renderPipeline = builder.context.renderPipeline;

		if ( renderPipeline ) {

			this._needsPostProcessingSync = true;

			renderPipeline.context.onBeforeRenderPipeline = () => {

				this.setViewOffset();

			};

			renderPipeline.context.onAfterRenderPipeline = () => {

				this.clearViewOffset();

			};

		}

		this._resolveMaterial.fragmentNode = this._buildResolve( builder );
		this._resolveMaterial.needsUpdate = true;

		this._buildSeed( builder );

		return this._textureNode;

	}

	_buildSeed( builder ) {

		const seed = Fn( () => {

			const screenTexel = ivec2( floor( screenCoordinate.xy.sub( 0.5 ) ) );
			const beautySize = this.beautyNode.size();
			const beautyTexel = beautyTexelFromScreen( screenTexel, beautySize, this._resolution );

			return textureLoad( this.beautyNode, beautyTexel ).max( 0 );

		} );

		this._seedMaterial.fragmentNode = seed().context( builder.getSharedContext() );
		this._seedMaterial.needsUpdate = true;

	}

	_buildResolve( builder ) {

		const isSpecular = this.mode === 'specular';
		const cameraUniforms = this._cameraUniforms;

		const resolve = Fn( () => {

			const uvNode = uv();

			const screenTexel = ivec2( floor( screenCoordinate.xy.sub( 0.5 ) ) );
			const depth = textureLoad( this.depthNode, screenTexel ).r.toVar();
			depth.greaterThanEqual( 1.0 ).discard();

			const beautySize = this.beautyNode.size();
			const beautyTexel = beautyTexelFromScreen( screenTexel, beautySize, this._resolution );

			const inputColor = textureLoad( this.beautyNode, beautyTexel ).max( 0 ).toVar();
			const viewNormal = unpackRGBToNormal( textureLoad( this.normalNode, screenTexel ).rgb ).toVar();

			// Shared 3×3 beauty fetch: feeds both the variance-clip box and the SSR ray-length stats.
			const neighborhood = collectNeighborhood( this.beautyNode, beautyTexel, inputColor, this.flickerSuppression );
			const worldNormal = viewNormal.transformDirection( cameraUniforms.viewMatrix ).toVar();

			const viewPosition = getViewPosition( uvNode, depth, cameraUniforms.projectionMatrixInverse ).toVar();
			const worldPosition = cameraUniforms.worldMatrix.mul( vec4( viewPosition, 1.0 ) ).xyz.toVar();

			const sampleHistory = ( reprojUV ) => sampleHistory4Tap(
				this._historyTextureNode,
				this._previousDepthNode,
				this._previousNormalNode,
				this._resolution,
				cameraUniforms.previousProjectionMatrixInverse,
				cameraUniforms.previousWorldMatrix,
				cameraUniforms.previousViewMatrix,
				reprojUV,
				worldPosition,
				worldNormal,
				inputColor.rgb
			);

			// Surface-velocity reprojection — the base history for both modes. `historyUV` is
			// reused below for the stretch guard, so it is computed once here.
			const velocityOff = velocityToUVOffset( textureLoad( this.velocityNode, screenTexel ).xy ).toVar();
			const motionFactor = velocityOff.mul( this._resolution ).length().div( float( this.maxVelocityLength ) ).saturate();

			const historyUV = uvNode.sub( velocityOff ).toVar();
			const surf = sampleHistory( historyUV );

			const historyColor = surf.get( 'color' ).toVar();
			const totalConfidence = float( 1 ).toVar();
			const historyTrust = float( 0 ).toVar();

			// Specular: blend parallax hit-point history on top of the surface result. Returns the resolved
			// color (rgb from the blend, alpha from the surface tap), its confidence, and the hit-vs-surface trust.
			const resolveSpecularHistory = () => {

				const surfValid = historyUV.x.greaterThanEqual( 0 ).and( historyUV.x.lessThanEqual( 1 ) )
					.and( historyUV.y.greaterThanEqual( 0 ) ).and( historyUV.y.lessThanEqual( 1 ) );

				const historyUV_hit = reprojectHitPoint(
					worldPosition,
					neighborhood.get( 'rayLength' ),
					cameraUniforms.worldPosition,
					cameraUniforms.previousViewMatrix,
					cameraUniforms.previousProjectionMatrix
				).toVar();

				const hitValid = historyUV_hit.x.greaterThanEqual( 0 ).and( historyUV_hit.x.lessThanEqual( 1 ) )
					.and( historyUV_hit.y.greaterThanEqual( 0 ) ).and( historyUV_hit.y.lessThanEqual( 1 ) )
					.and( this.hitPointReprojection );

				const hit = sampleHistory( historyUV_hit );

				const hcHit = hit.get( 'color' ).rgb.max( 0 );
				const hcSurf = surf.get( 'color' ).rgb.max( 0 );

				const confHit = hitValid.select( hit.get( 'tapConfidence' ), float( 0 ) );
				const confSurf = surfValid.select( surf.get( 'tapConfidence' ), float( 0 ) );
				const minConfHit = hit.get( 'minConfidence' );

				const reflectionEdgeFactor = neighborhood.get( 'stdDevRayLength' );
				reflectionEdgeFactor.assign( reflectionEdgeFactor.mul( motionFactor.mul( 100 ).min( 1 ) ).mul( 3.5 ).min( 1 ).oneMinus() );

				const curvatureFactor = fwidth( worldNormal.xyz ).length().mul( 50 ).clamp();

				const envProbability = neighborhood.get( 'envProbability' );

				const wHitRaw = minConfHit
					.mul( reflectionEdgeFactor )
					.mul( curvatureFactor.oneMinus() )
					.mul( confHit ).toConst();

				const wHit = wHitRaw.mul( envProbability.pow2().oneMinus() );
				const wSurf = wHit.oneMinus().mul( confSurf );
				const wSum = max( wHit.add( wSurf ), float( EPSILON ) );

				const color = vec4(
					hcHit.mul( wHit ).add( hcSurf.mul( wSurf ) ).div( wSum ),
					surf.get( 'color' ).a
				).toVar();
				const confidence = confHit.mul( wHit ).add( confSurf.mul( wSurf ) ).div( wSum );

				// Near-black blend means neither tap was usable — fall back to the current frame.
				If( color.rgb.length().lessThan( EPSILON ), () => {

					color.assign( vec4( inputColor.rgb, 1 ) );

				} );

				return { color, confidence, trust: wHitRaw }; // without env probability

			};

			if ( isSpecular ) {

				const spec = resolveSpecularHistory();
				historyColor.assign( spec.color );
				totalConfidence.assign( spec.confidence );
				historyTrust.assign( spec.trust );

			}

			const a = historyColor.a.max( EPSILON );

			// Universal stretch guard: reduce confidence where a "small area" is projected over a "large area".
			const stretchConfidence = reprojectionStretchConfidence( historyUV, this._resolution );
			totalConfidence.mulAssign( stretchConfidence.pow( 2 ) );

			const varianceGamma = mix( float( VARIANCE_GAMMA_MIN ), float( VARIANCE_GAMMA_MAX ), motionFactor.oneMinus().pow2() );

			const clippedRGB = applyVarianceClipping(
				historyColor,
				neighborhood.get( 'mean' ),
				neighborhood.get( 'stdColor' ),
				varianceGamma,
				this.flickerSuppression
			).toVar();

			const clampIntensity = this.clampIntensity.mul( max( motionFactor.mul( 10 ).min( 1 ), 0.25 ) ).mul(
				float( 1 ).add( stretchConfidence.oneMinus().add( historyTrust.oneMinus() ).clamp() )
			);
			const originalHistoryColor = vec3( historyColor.rgb );
			historyColor.rgb.assign( mix( historyColor.rgb, clippedRGB, clampIntensity ) );

			totalConfidence.mulAssign( exp( originalHistoryColor.sub( clippedRGB ).length().mul( clampIntensity ).mul( 30 ).negate() ) );
			totalConfidence.mulAssign( mix( float( 1 ), historyTrust.mul( 0.05 ).add( 0.95 ), motionFactor.mul( 100 ).clamp() ) );

			If( totalConfidence.lessThan( EPSILON ), () => {

				historyColor.assign( vec4( inputColor.rgb, 1 ) );

			} );

			const currentFrameCount = float( 1 ).div( a ).mul( totalConfidence ).add( 1 ).min( this.maxFrames ).toVar();

			if ( isSpecular ) {

				// A black current sample means no reflection was found this frame (a miss, not dark).
				// Since no valid sample was found, decrement the frame count (as the next accumulating pass will increase it).
				If( inputColor.rgb.length().lessThan( EPSILON ), () => {

					currentFrameCount.assign( currentFrameCount.sub( 1 ).max( 1 ) );

				} );

			}

			return vec4( historyColor.rgb, float( 1 ).div( currentFrameCount ) );

		} );

		return resolve().context( builder.getSharedContext() );

	}

	_syncHistoryTextureBinding() {

		if ( this.accumulate === true || this._externalHistoryTexture === null ) {

			this._historyTextureNode.value = this._historyRenderTarget.texture;

		} else {

			this._historyTextureNode.value = this._externalHistoryTexture;

		}

	}

	/**
	 * Supplies an external history source (e.g. a {@link RecurrentDenoiseNode} or its
	 * texture). Only used when {@link TemporalReprojectNode#accumulate} is `false`.
	 *
	 * @param {?(Object|Texture)} source
	 */
	setHistoryTexture( source ) {

		this._externalHistoryTexture = ( source && typeof source.getRenderTarget === 'function' )
			? source.getRenderTarget().texture
			: source;
		this._syncHistoryTextureBinding();

	}

	dispose() {

		this._previousNormalTexture.dispose();

		if ( this._previousDepthNode.value !== this._historyRenderTarget.depthTexture ) {

			this._previousDepthNode.value.dispose();

		}

		if ( this._placeholderPreviousDepthTexture !== this._historyRenderTarget.depthTexture ) {

			this._placeholderPreviousDepthTexture.dispose();

		}

		this._historyRenderTarget.dispose();
		this._resolveRenderTarget.dispose();
		this._resolveMaterial.dispose();
		this._seedMaterial.dispose();

	}

}

export default TemporalReprojectNode;

/**
 * @param {TextureNode} beautyNode
 * @param {TextureNode} depthNode
 * @param {TextureNode} normalNode
 * @param {TextureNode} velocityNode
 * @param {Camera} camera
 * @param {TemporalReprojectNodeOptions} [options]
 * @returns {TemporalReprojectNode}
 */
export const temporalReproject = ( beautyNode, depthNode, normalNode, velocityNode, camera, options = {} ) => nodeObject( new TemporalReprojectNode(
	convertToTexture( beautyNode ),
	nodeObject( depthNode ),
	nodeObject( normalNode ),
	nodeObject( velocityNode ),
	camera,
	options
) );
