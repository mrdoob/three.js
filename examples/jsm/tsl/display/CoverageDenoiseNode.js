import { HalfFloatType, NearestFilter, Matrix4, Node, NodeMaterial, NodeUpdateType, QuadMesh, RenderTarget, RendererUtils, Vector2 } from 'three/webgpu';
import { textureSize, fwidth, Fn, If, context, convertToTexture, float, getViewPosition, isBackgroundDepth, mix, outputStruct, packHalf2x16, passTexture, property, struct, texture, uniform, unpackHalf2x16, velocity as cameraVelocity, unpackRGBToNormal, uv, vec2, vec3, vec4 } from 'three/tsl';
import { getProjectionJitter, reprojectionStretchConfidence } from '../utils/TAAUtils.js';
import { ENV_RAY_LENGTH, ENV_RAY_LENGTH_THRESHOLD } from '../utils/SpecularHelpers.js';

const historySample = struct( { color: 'vec4', fast: 'vec4', weight: 'float', age: 'float' } );

/**
 * Spatio-temporal denoiser for sparse lighting with coverage. Input and output are
 * unweighted radiance in RGB and coverage in A, so misses never darken valid lighting.
 *
 * Reference: {@link https://diligentgraphics.github.io/docs/dc/dd9/DiligentFX_PostProcess_ScreenSpaceReflection_README.html}.
 *
 * @augments Node
 * @three_import import { coverageDenoise } from 'three/addons/tsl/display/CoverageDenoiseNode.js';
 */
class CoverageDenoiseNode extends Node {

	static get type() {

		return 'CoverageDenoiseNode';

	}

	/**
	 * @param {TextureNode} inputNode - Unweighted radiance and coverage.
	 * @param {Camera} camera - Scene camera.
	 * @param {Object} options - Geometry and motion guides.
	 * @param {TextureNode} options.depth - Device depth. Its resolution sets the reconstruction resolution.
	 * @param {TextureNode} options.normal - Packed view normal in RGB, roughness in A.
	 * @param {TextureNode} options.velocity - Current-minus-previous NDC motion vectors, as produced by `velocity`.
	 * @param {?Node<float>} [options.surfaceId=null] - Stable per-surface integer identity.
	 * @param {?Node<float>} [options.reactive=null] - Positive values reject history for moving reflected objects. Moving receivers are detected from velocity and keep surface history.
	 * @param {?Node<float>} [options.hitDistance=null] - World-space SSR hit distance. Omit for diffuse surface reprojection.
	 */
	constructor( inputNode, camera, { depth, normal, velocity, hitDistance = null, surfaceId = null, reactive = null } ) {

		super( 'vec4' );
		this.inputNode = inputNode;
		this.camera = camera;
		this.depthNode = depth;
		this.normalNode = normal;
		this.velocityNode = velocity;
		this.hitDistanceNode = hitDistance;
		this.surfaceIdNode = surfaceId;
		this.reactiveNode = reactive;
		this.roughnessThreshold = uniform( 0.04 );
		this.radius = uniform( 1.5 );
		this.maxFrames = uniform( 16 );
		/** Length of the short history that bounds the long one. */
		this.fastFrames = uniform( 6 );
		this.depthThreshold = uniform( 0.01 );
		/** Hit distance tolerance of the spatial filter, relative to the mean. */
		this.hitDistancePhi = uniform( 1 );
		this.curvatureScale = uniform( 20 );
		this.reflectionEdgeScale = uniform( 4 );
		this.useStretchRejection = uniform( true );
		this.useGatherConfidence = uniform( true );
		this.updateBeforeType = NodeUpdateType.FRAME;

		this._spatialTarget = new RenderTarget( 1, 1, { depthBuffer: false, type: HalfFloatType } );
		this._target = new RenderTarget( 1, 1, { depthBuffer: false, type: HalfFloatType, count: 4 } );
		// metadata is point sampled
		this._target.textures[ 2 ].minFilter = this._target.textures[ 2 ].magFilter = NearestFilter;
		this._historyTarget = this._target.clone();
		this._spatialTarget.texture.name = 'CoverageDenoise.spatial';
		for ( const target of [ this._target, this._historyTarget ] ) {

			target.textures[ 0 ].name = 'CoverageDenoise.radianceCoverage';
			target.textures[ 1 ].name = 'CoverageDenoise.geometry';
			target.textures[ 2 ].name = 'CoverageDenoise.metadata';
			target.textures[ 3 ].name = 'CoverageDenoise.fastHistory';

		}

		this._textureNode = passTexture( this, this._target.texture );
		this._metadataNode = passTexture( this, this._target.textures[ 2 ] );
		this._historyColor = texture( this._historyTarget.texture );
		this._historyGeometry = texture( this._historyTarget.textures[ 1 ] );
		this._historyAge = texture( this._historyTarget.textures[ 2 ] );
		this._historyFast = texture( this._historyTarget.textures[ 3 ] );
		this._spatialMaterial = new NodeMaterial();
		this._temporalMaterial = new NodeMaterial();
		this._quad = new QuadMesh();
		this._rendererState = {};
		this._resolution = uniform( new Vector2( 1, 1 ) );
		this._velocityNode = cameraVelocity;
		this._jitter = new Vector2();
		this._jitterDelta = uniform( new Vector2() );
		this._projectionInverse = uniform( new Matrix4() );
		this._world = uniform( new Matrix4() );
		this._previousView = uniform( new Matrix4() );
		this._previousProjection = uniform( new Matrix4() );
		this._previousProjectionInverse = uniform( new Matrix4() );
		this._historyValid = uniform( false );

	}

	/** Clears temporal validity without reallocating textures. */
	reset() {

		this._historyValid.value = false;

	}

	setSize( width, height ) {

		if ( this._target.width === width && this._target.height === height ) return;
		for ( const target of [ this._spatialTarget, this._target, this._historyTarget ] ) target.setSize( width, height );
		this._resolution.value.set( width, height );
		this.reset();

	}

	/**
	 * @param {'output'|'metadata'} [name='output'] - Reconstructed radiance and coverage, or
	 * diagnostics: history age in R, roughness in G, virtual-hit share of history in B, surface identity in A.
	 * @return {PassTextureNode} The texture node.
	 */
	getTextureNode( name = 'output' ) {

		return name === 'metadata' ? this._metadataNode : this._textureNode;

	}

	getRenderTarget() {

		return this._target;

	}

	updateBefore( frame ) {

		const { renderer } = frame;
		if ( this.depthNode.isPassTextureNode ) frame.updateBeforeNode( this.depthNode.passNode );
		const { width, height } = this.depthNode.value.image;
		this.setSize( width, height );

		// swap history
		const historyTarget = this._historyTarget;
		this._historyTarget = this._target;
		this._target = historyTarget;
		this._metadataNode.value = this._target.textures[ 2 ];
		this._historyColor.value = this._historyTarget.texture;
		this._historyGeometry.value = this._historyTarget.textures[ 1 ];
		this._historyAge.value = this._historyTarget.textures[ 2 ];
		this._historyFast.value = this._historyTarget.textures[ 3 ];

		this._jitterDelta.value.copy( this._jitter );
		getProjectionJitter( this.camera, this._velocityNode.projectionMatrix, this._jitter );
		this._jitterDelta.value.sub( this._jitter );
		this._projectionInverse.value.copy( this.camera.projectionMatrixInverse );
		this._world.value.copy( this.camera.matrixWorld );

		RendererUtils.resetRendererState( renderer, this._rendererState );
		try {

			renderer.setClearColor( 0, 0 );
			renderer.setRenderTarget( this._spatialTarget );
			this._quad.material = this._spatialMaterial;
			this._quad.name = 'Coverage Denoise [ Spatial ]';
			this._quad.render( renderer );

			renderer.setRenderTarget( this._target );
			this._quad.material = this._temporalMaterial;
			this._quad.name = 'Coverage Denoise [ Temporal ]';
			this._quad.render( renderer );

			this._textureNode.value = this._target.texture;

			this._previousView.value.copy( this.camera.matrixWorldInverse );
			this._previousProjection.value.copy( this.camera.projectionMatrix );
			this._previousProjectionInverse.value.copy( this.camera.projectionMatrixInverse );
			this._historyValid.value = true;

		} finally {

			RendererUtils.restoreRendererState( renderer, this._rendererState );

		}

	}

	setup( builder ) {

		this._velocityNode = builder.context.velocity || cameraVelocity;

		// radius and clipping neighborhoods are measured in input texels
		const inputResolution = this.inputNode.isTextureNode ? vec2( textureSize( this.inputNode ) ) : this._resolution;
		const guideResolution = vec2( textureSize( this.depthNode ) );
		const guideCoordinate = coordinate => coordinate.mul( guideResolution ).floor().add( 0.5 ).div( guideResolution );
		const viewPosition = coordinate => {

			const guideUV = guideCoordinate( coordinate );
			return getViewPosition( guideUV, this.depthNode.sample( guideUV ).r, this._projectionInverse );

		};

		const normal = coordinate => unpackRGBToNormal( this.normalNode.sample( guideCoordinate( coordinate ) ).rgb );
		const hitDistanceAt = coordinate => this.hitDistanceNode.isSampleNode || this.hitDistanceNode.isTextureNode ? this.hitDistanceNode.sample( coordinate ) : this.hitDistanceNode;
		const roughnessAt = coordinate => this.normalNode.sample( guideCoordinate( coordinate ) ).a;
		const toWeighted = value => vec4( value.rgb.mul( value.a ), value.a );
		const fromWeighted = value => vec4( value.a.greaterThan( 1e-6 ).select( value.rgb.div( value.a.max( 1e-6 ) ), vec3( 0 ) ), value.a.clamp() );
		const inBounds = coordinate => coordinate.x.greaterThanEqual( 0 ).and( coordinate.x.lessThanEqual( 1 ) )
			.and( coordinate.y.greaterThanEqual( 0 ) ).and( coordinate.y.lessThanEqual( 1 ) );
		const inputCoordinate = coordinate => coordinate.mul( inputResolution ).floor().add( 0.5 ).div( inputResolution );
		const isHit = distance => distance.greaterThan( 0 ).and( distance.lessThan( ENV_RAY_LENGTH_THRESHOLD ) );

		// hit distance moments over 3x3 input texels, point sampled to avoid blending in misses
		const hitMoments = coordinate => {

			const moments = vec3( 0 ).toVar();
			for ( let y = - 1; y <= 1; y ++ ) {

				for ( let x = - 1; x <= 1; x ++ ) {

					const tapUV = coordinate.mul( inputResolution ).add( vec2( x, y ) ).floor().add( 0.5 ).div( inputResolution );
					const distance = float( hitDistanceAt( tapUV ) );
					const weight = this.inputNode.sample( tapUV ).a.mul( isHit( distance ) ).mul( inBounds( tapUV ) );
					const bounded = distance.min( ENV_RAY_LENGTH_THRESHOLD );
					moments.addAssign( vec3( bounded, bounded.pow2(), 1 ).mul( weight ) );

				}

			}

			return moments;

		};

		const momentsMean = moments => moments.z.greaterThan( 1e-6 ).select( moments.x.div( moments.z.max( 1e-6 ) ), float( ENV_RAY_LENGTH ) );

		// edge-aware 3x3 reconstruction with taps `stride` input texels apart
		const filter = ( read, grid, coordinate, stride ) => {

			const centerPosition = viewPosition( coordinate ).toConst();
			const centerNormal = normal( coordinate ).toConst();
			const roughness = roughnessAt( coordinate ).toConst();
			const radiance = vec4( 0 ).toVar();
			const coverage = vec2( 0 ).toVar();
			// hit distance weights apply to radiance only, otherwise coverage would favour misses
			const centerHit = this.hitDistanceNode !== null ? momentsMean( hitMoments( coordinate ) ).toConst() : null;
			const tolerance = centerPosition.z.abs().mul( this.depthThreshold ).max( 0.001 );

			for ( let y = - 1; y <= 1; y ++ ) {

				for ( let x = - 1; x <= 1; x ++ ) {

					const tapUV = coordinate.add( vec2( x, y ).mul( stride ).div( inputResolution ) ).mul( grid ).floor().add( 0.5 ).div( grid ).toConst();
					const tap = read( tapUV ).toConst();
					const planeDistance = viewPosition( tapUV ).sub( centerPosition ).dot( centerNormal ).abs();
					const depthWeight = planeDistance.div( tolerance ).pow2().negate().exp();
					const normalWeight = normal( tapUV ).dot( centerNormal ).max( 0 ).pow( 32 );
					const roughnessWeight = roughnessAt( tapUV ).sub( roughness ).abs().mul( - 64 ).exp();
					let hitWeight = float( 1 );
					if ( this.hitDistanceNode !== null ) {

						const tapHit = float( hitDistanceAt( inputCoordinate( tapUV ) ) );
						const bothHits = tap.a.greaterThan( 0 ).and( isHit( centerHit ) ).and( isHit( tapHit ) );
						const scale = centerHit.min( tapHit ).mul( this.hitDistancePhi ).add( tolerance ).max( 1e-4 );
						hitWeight = bothHits.select( tapHit.sub( centerHit ).div( scale ).pow2().negate().exp(), 1 );

					}

					const weight = depthWeight.mul( normalWeight ).mul( roughnessWeight ).mul( Math.exp( - 0.5 * ( x * x + y * y ) ) ).mul( inBounds( tapUV ) ).toConst();
					radiance.addAssign( toWeighted( vec4( tap.rgb, tap.a.clamp() ) ).mul( weight.mul( hitWeight ) ) );
					coverage.addAssign( vec2( tap.a.clamp(), 1 ).mul( weight ) );

				}

			}

			return vec4( fromWeighted( radiance ).rgb, coverage.x.div( coverage.y.max( 1e-6 ) ) );

		};

		const spatial = Fn( () => {

			const coordinate = uv();
			isBackgroundDepth( this.depthNode.sample( coordinate ).r ).discard();
			const stride = this.radius.mul( roughnessAt( coordinate ).sqrt().max( 0.25 ) );
			return filter( tapUV => this.inputNode.sample( tapUV ), inputResolution, coordinate, stride );

		} );

		const spatialTexture = texture( this._spatialTarget.texture );
		const colorField = property( 'vec4' );
		const ageField = property( 'float' );
		const fastField = property( 'vec4' );
		const virtualField = property( 'float' );
		const temporal = Fn( () => {

			const coordinate = uv();
			const current = spatialTexture.sample( coordinate ).toConst();
			const currentWeighted = toWeighted( current ).toConst();
			const result = currentWeighted.toVar();
			const fast = currentWeighted.toVar();
			const age = float( 1 ).toVar();
			virtualField.assign( 0 );
			const position = viewPosition( coordinate ).toConst();
			const worldPosition = this._world.mul( vec4( position, 1 ) ).xyz.toConst();
			const worldNormal = normal( coordinate ).transformDirection( this._world ).toConst();
			const previousPosition = this._previousView.mul( vec4( worldPosition, 1 ) ).xyz.toConst();
			const previousNormal = worldNormal.transformDirection( this._previousView ).toConst();
			const historyTolerance = previousPosition.z.abs().mul( this.depthThreshold ).max( 0.001 );
			const velocityUV = this.velocityNode.sample( coordinate ).xy.mul( vec2( 0.5, - 0.5 ) );
			const surfaceUV = coordinate.sub( velocityUV ).add( this._jitterDelta ).toConst();

			const surfaceStretch = reprojectionStretchConfidence( surfaceUV, this._resolution ).toConst();
			const roughness = roughnessAt( coordinate ).toConst();
			// compare history roughness against the 3x3 range since the raster jitters
			const roughnessMin = roughness.toVar();
			const roughnessMax = roughness.toVar();
			for ( let y = - 1; y <= 1; y ++ ) {

				for ( let x = - 1; x <= 1; x ++ ) {

					if ( x === 0 && y === 0 ) continue;
					const neighbor = roughnessAt( coordinate.add( vec2( x, y ).div( guideResolution ) ) );
					roughnessMin.assign( roughnessMin.min( neighbor ) );
					roughnessMax.assign( roughnessMax.max( neighbor ) );

				}

			}

			const surfaceId = this.surfaceIdNode !== null ? float( this.surfaceIdNode ).toConst() : float( 0 );
			// metadata is half precision
			const storedId = unpackHalf2x16( packHalf2x16( vec2( surfaceId, 0 ) ) ).x.toConst();
			const reactive = this.reactiveNode !== null ? float( this.reactiveNode ).toConst() : float( 0 );
			const curvature = fwidth( worldNormal ).length().mul( this.curvatureScale ).clamp().toConst();
			const moments = this.hitDistanceNode !== null ? hitMoments( coordinate ).toConst() : vec3( 0 );
			const rayLength = momentsMean( moments ).toConst();
			const virtualPosition = position.add( position.normalize().mul( rayLength.min( ENV_RAY_LENGTH_THRESHOLD ) ) );
			const virtualPrevious = this._previousView.mul( this._world.mul( vec4( virtualPosition, 1 ) ) );
			const virtualClip = this._previousProjection.mul( virtualPrevious );
			const virtualUV = virtualClip.xy.div( virtualClip.w.max( 1e-6 ) ).mul( vec2( 0.5, - 0.5 ) ).add( 0.5 ).toConst();
			const virtualStretch = reprojectionStretchConfidence( virtualUV, this._resolution ).toConst();

			// manual bilinear gather so invalid taps are rejected before interpolation
			const gather = Fn( ( [ historyUV ] ) => {

				const pixel = historyUV.mul( this._resolution ).sub( 0.5 );
				const base = pixel.floor();
				const fraction = pixel.fract();
				const sum = vec4( 0 ).toVar();
				const fastSum = vec4( 0 ).toVar();
				const total = float( 0 ).toVar();
				const ageSum = float( 0 ).toVar();
				for ( let y = 0; y <= 1; y ++ ) {

					for ( let x = 0; x <= 1; x ++ ) {

						const tapUV = base.add( vec2( x, y ) ).add( 0.5 ).div( this._resolution ).toConst();
						const geometry = this._historyGeometry.sample( tapUV ).toConst();
						const metadata = this._historyAge.sample( tapUV ).toConst();
						// plane distance instead of depth, which fails at grazing angles
						const clipDepth = this._previousProjection.mul( vec4( 0, 0, geometry.w, 1 ) );
						const tapPosition = getViewPosition( tapUV, clipDepth.z.div( clipDepth.w ), this._previousProjectionInverse );
						const planeDistance = tapPosition.sub( previousPosition ).dot( previousNormal ).abs();
						const valid = inBounds( tapUV ).and( worldNormal.dot( geometry.xyz ).greaterThan( 0.9 ) )
							.and( planeDistance.lessThanEqual( historyTolerance ) )
							.and( metadata.g.greaterThanEqual( roughnessMin.sub( this.roughnessThreshold ) ) )
							.and( metadata.g.lessThanEqual( roughnessMax.add( this.roughnessThreshold ) ) );
						const identityValid = this.surfaceIdNode !== null ? metadata.a.equal( storedId ) : float( 1 );
						const wx = x === 0 ? fraction.x.oneMinus() : fraction.x;
						const wy = y === 0 ? fraction.y.oneMinus() : fraction.y;
						const weight = wx.mul( wy ).mul( valid ).mul( identityValid ).toConst();
						sum.addAssign( toWeighted( this._historyColor.sample( tapUV ) ).mul( weight ) );
						fastSum.addAssign( toWeighted( this._historyFast.sample( tapUV ) ).mul( weight ) );
						total.addAssign( weight );
						ageSum.addAssign( metadata.r.mul( weight ) );

					}

				}

				return historySample( sum.div( total.max( 1e-6 ) ), fastSum.div( total.max( 1e-6 ) ), total, ageSum.div( total.max( 1e-6 ) ) );

			} );

			If( this._historyValid.and( reactive.lessThan( 0.01 ) ), () => {

				const history = gather( surfaceUV ).toVar();
				if ( this.hitDistanceNode !== null ) {

					const mean = moments.x.div( moments.z.max( 1e-6 ) );
					const deviation = moments.y.div( moments.z.max( 1e-6 ) ).sub( mean.pow2() ).max( 0 ).sqrt();
					const edgeConfidence = deviation.div( mean.max( 1e-3 ) ).mul( this.reflectionEdgeScale ).negate().exp();
					const validVirtual = rayLength.greaterThan( 0 ).and( rayLength.lessThan( ENV_RAY_LENGTH_THRESHOLD ) )
						.and( current.a.greaterThan( 0 ) ).and( virtualClip.w.greaterThan( 0 ) ).and( inBounds( virtualUV ) );
					// moving receivers only keep surface history
					const cameraClip = this._previousProjection.mul( vec4( previousPosition, 1 ) );
					const cameraUV = cameraClip.xy.div( cameraClip.w.max( 1e-6 ) ).mul( vec2( 0.5, - 0.5 ) ).add( 0.5 );
					const receiverStatic = surfaceUV.sub( cameraUV ).mul( this._resolution ).length().smoothstep( 0.25, 0.75 ).oneMinus();
					const trust = edgeConfidence.mul( curvature.oneMinus() ).mul( roughness.pow2().oneMinus() ).mul( validVirtual ).mul( receiverStatic ).toConst();
					const hit = historySample( vec4( 0 ), vec4( 0 ), float( 0 ), float( 0 ) ).toVar();
					If( trust.greaterThan( 1e-3 ), () => {

						hit.assign( gather( virtualUV ) );

					} );
					const hitStretch = this.useStretchRejection.select( virtualStretch.pow2(), 1 );
					const surfStretch = this.useStretchRejection.select( surfaceStretch.pow2(), 1 );
					const hitWeight = hit.get( 'weight' ).mul( trust ).mul( hitStretch ).toConst();
					const surfaceWeight = history.get( 'weight' ).mul( trust.oneMinus() ).mul( surfStretch ).toConst();
					const total = hitWeight.add( surfaceWeight ).toConst();
					virtualField.assign( hitWeight.div( total.max( 1e-6 ) ) );
					const color = history.get( 'color' ).mul( surfaceWeight ).add( hit.get( 'color' ).mul( hitWeight ) ).div( total.max( 1e-6 ) );
					const fast = history.get( 'fast' ).mul( surfaceWeight ).add( hit.get( 'fast' ).mul( hitWeight ) ).div( total.max( 1e-6 ) );
					const blendedAge = history.get( 'age' ).mul( surfaceWeight ).add( hit.get( 'age' ).mul( hitWeight ) ).div( total.max( 1e-6 ) );
					history.assign( historySample( color, fast, total, blendedAge ) );

				}

				if ( this.hitDistanceNode === null ) {

					const confidence = this.useStretchRejection.select( surfaceStretch.pow2(), 1 );
					history.assign( historySample( history.get( 'color' ), history.get( 'fast' ), history.get( 'weight' ).mul( confidence ), history.get( 'age' ) ) );

				}

				// clamp the long history to the fast history's neighborhood, not the sparse current frame
				const fastUV = virtualField.greaterThan( 0.5 ).select( virtualUV, surfaceUV ).toConst();
				const fastMin = vec4( 1e9 ).toVar();
				const fastMax = vec4( - 1e9 ).toVar();
				const currentMin = currentWeighted.toVar();
				const currentMax = currentWeighted.toVar();
				for ( let y = - 1; y <= 1; y ++ ) {

					for ( let x = - 1; x <= 1; x ++ ) {

						const currentUV = coordinate.add( vec2( x, y ).div( inputResolution ) ).mul( this._resolution ).floor().add( 0.5 ).div( this._resolution );
						const currentValue = toWeighted( spatialTexture.sample( currentUV ) );
						currentMin.assign( currentMin.min( currentValue ) );
						currentMax.assign( currentMax.max( currentValue ) );
						const tapUV = fastUV.add( vec2( x, y ).div( this._resolution ) ).mul( this._resolution ).floor().add( 0.5 ).div( this._resolution );
						const value = toWeighted( this._historyFast.sample( tapUV ) );
						fastMin.assign( fastMin.min( value ) );
						fastMax.assign( fastMax.max( value ) );

					}

				}

				const minimum = fastMin.min( currentWeighted ).toVar();
				const maximum = fastMax.max( currentWeighted ).toVar();

				If( history.get( 'weight' ).greaterThan( 0 ), () => {

					const previousAge = history.get( 'age' ).toVar();
					If( this.useGatherConfidence, () => {

						previousAge.mulAssign( history.get( 'weight' ).clamp() );

					} );
					age.assign( previousAge.add( 1 ).min( this.maxFrames.max( 1 ) ) );
					const fastAge = age.min( this.fastFrames.max( 1 ) ).toConst();
					// clamp the fast history loosely to the widened current range
					const currentRange = currentMax.sub( currentMin );
					fast.assign( mix( currentWeighted, history.get( 'fast' ).clamp( currentMin.sub( currentRange ), currentMax.add( currentRange ) ), fastAge.sub( 1 ).div( fastAge ) ) );
					minimum.assign( minimum.min( fast ) );
					maximum.assign( maximum.max( fast ) );
					// anti-lag (ReBLUR): shorten stale long history to the fast length
					const spread = fastMax.sub( fastMin ).max( currentRange ).max( fast.mul( 0.05 ) ).add( 1e-3 );
					const excess = history.get( 'color' ).sub( fast ).abs().div( spread );
					const lag = excess.x.max( excess.y ).max( excess.z ).max( excess.w ).smoothstep( 1, 2 );
					age.assign( mix( age, fastAge, lag ) );
					const historyWeight = age.sub( 1 ).div( age );
					result.assign( mix( currentWeighted, history.get( 'color' ).clamp( minimum, maximum ), historyWeight ) );

				} );

			} );

			colorField.assign( fromWeighted( result ) );
			fastField.assign( fromWeighted( fast ) );
			ageField.assign( age );
			return colorField;

		} );

		const geometry = Fn( () => vec4( normal( uv() ).transformDirection( this._world ), viewPosition( uv() ).z ) );
		this._spatialMaterial.contextNode = context( builder.getSharedContext() );
		this._spatialMaterial.fragmentNode = spatial();
		this._spatialMaterial.needsUpdate = true;
		this._temporalMaterial.contextNode = context( builder.getSharedContext() );
		this._temporalMaterial.colorNode = temporal();
		this._temporalMaterial.outputNode = outputStruct( colorField, geometry(), vec4( ageField, roughnessAt( uv() ), virtualField, this.surfaceIdNode !== null ? float( this.surfaceIdNode ) : float( 0 ) ), fastField );
		this._temporalMaterial.needsUpdate = true;
		return this._textureNode;

	}

	dispose() {

		super.dispose();
		for ( const target of [ this._spatialTarget, this._target, this._historyTarget ] ) target.dispose();
		this._spatialMaterial.dispose();
		this._temporalMaterial.dispose();

	}

}

export default CoverageDenoiseNode;

/**
 * @tsl
 * @param {Node<vec4>} input - Unweighted radiance and coverage.
 * @param {Camera} camera - Scene camera.
 * @param {Object} options - Depth, packed normal/roughness, velocity and optional hit distance.
 * @return {CoverageDenoiseNode} The coverage-aware reflection denoiser.
 */
export const coverageDenoise = ( input, camera, options ) => new CoverageDenoiseNode( convertToTexture( input ), camera, options );
