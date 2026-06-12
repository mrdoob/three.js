import { StorageTexture, Vector2, TempNode, LinearFilter, RendererUtils } from 'three/webgpu';
import { nodeObject, Fn, float, int, NodeUpdateType, uniform, Loop, vec2, vec3, vec4, dot, normalize, max, clamp, abs, sin, cos, acos, PI, textureStore, passTexture, instanceIndex, uvec2, If, cross, select, mul, div, pow, mix, mat3 } from 'three/tsl';

const _size = /*@__PURE__*/ new Vector2();

/**
 * Compute-shader ambient occlusion based on the GTAO algorithm (Jimenez et al. 2016).
 *
 * Uses `renderer.compute()` with `StorageTexture` for the AO sampling pass instead
 * of fragment shader quad rendering as in {@link GTAONode}. Same algorithm — GTAO
 * horizon tracing with cosine-weighted integral (Eq. 7) — dispatched via GPU compute.
 *
 * **Performance note:** This node requires an additional scene render pass to produce
 * a linear depth buffer as a float color texture, because compute shaders in the
 * current Three.js WebGPU backend cannot sample from `DepthTexture` or `PassNode`
 * internal render targets. This adds roughly one extra draw call per frame at the
 * cost of the scene's vertex processing. When Three.js adds native compute access
 * to depth buffers, this extra pass can be eliminated.
 *
 * **StorageTexture read limitation:** The compute output (`StorageTexture`) is not
 * directly readable by `RenderPipeline` texture bindings in the same frame. Use
 * `convertToTexture()` to render a quad copy that materializes the compute output
 * as a standard texture. This is a framework-level synchronization gap, not specific
 * to this node.
 *
 * ```js
 * const aoPass = aoCompute( depthTextureNode, normalTextureNode, camera );
 * aoPass.setDepthPass( depthRT, depthMaterial, scene );
 *
 * const aoResolved = convertToTexture( aoPass.getTextureNode() );
 * renderPipeline.outputNode = scenePass.mul( vec4( vec3( aoResolved.r ), 1 ) );
 * ```
 *
 * Reference: {@link https://www.activision.com/cdn/research/Practical_Real_Time_Strategies_for_Accurate_Indirect_Occlusion_NEW%20VERSION_COLOR.pdf Jimenez et al. 2016}.
 *
 * @augments TempNode
 * @three_import import { aoCompute } from 'three/addons/tsl/display/GTAOComputeNode.js';
 */
class GTAOComputeNode extends TempNode {

	static get type() {

		return 'GTAOComputeNode';

	}

	/**
	 * Constructs a new compute GTAO node.
	 *
	 * @param {Node<float>} depthNode - A texture node containing linear view-space Z values.
	 * @param {?Node<vec3>} normalNode - A texture node for view-space normals, or null to skip normal weighting.
	 * @param {Camera} camera - The camera the scene is rendered with.
	 */
	constructor( depthNode, normalNode, camera ) {

		super( 'float' );

		/**
		 * A texture node for linear view-space depth.
		 *
		 * @type {Node}
		 */
		this.depthNode = depthNode;

		/**
		 * A texture node for view-space normals. When provided, enables the
		 * cosine-weighted GTAO integral for physically correct occlusion.
		 * When null, uses simplified horizon-angle tracking (GTAO).
		 *
		 * @type {?Node}
		 */
		this.normalNode = normalNode;

		/**
		 * The resolution scale. `0.5` runs AO at half resolution.
		 *
		 * @type {number}
		 * @default 0.5
		 */
		this.resolutionScale = 0.5;

		/**
		 * The update type is set to `NodeUpdateType.FRAME`.
		 *
		 * @type {string}
		 * @default 'frame'
		 */
		this.updateBeforeType = NodeUpdateType.FRAME;

		/**
		 * World-space AO search radius.
		 *
		 * @type {UniformNode<float>}
		 */
		this.radius = uniform( 4.0 );

		/**
		 * Max Z delta for a valid occluder sample.
		 *
		 * @type {UniformNode<float>}
		 */
		this.thickness = uniform( 1.81 );

		/**
		 * Distance exponent for the step distribution.
		 * Higher values concentrate samples closer to the pixel.
		 *
		 * @type {UniformNode<float>}
		 */
		this.distanceExponent = uniform( 2.79 );

		/**
		 * Distance fall off value. Controls how quickly distant
		 * samples are attenuated in the horizon update. Range [0,1].
		 *
		 * @type {UniformNode<float>}
		 */
		this.distanceFallOff = uniform( 0.74 );

		/**
		 * AO strength as a power curve.
		 *
		 * @type {UniformNode<float>}
		 */
		this.scale = uniform( 1.62 );

		/**
		 * Number of angular directions to sample. Higher values reduce
		 * directional banding. Changing this triggers a compute pipeline rebuild.
		 *
		 * @type {number}
		 * @default 6
		 */
		this.directions = 6;

		/**
		 * Number of steps per direction. Higher values improve occlusion
		 * accuracy at the cost of performance. Changing this triggers a
		 * compute pipeline rebuild.
		 *
		 * @type {number}
		 * @default 8
		 */
		this.steps = 8;

		/**
		 * The resolution of the AO effect.
		 *
		 * @type {UniformNode<vec2>}
		 */
		this.resolution = uniform( new Vector2() );

		// internals

		this._camera = camera;
		this._projMat = uniform( camera.projectionMatrix );
		this._projMatInv = uniform( camera.projectionMatrixInverse );

		// Depth pass configuration (set via setDepthPass)
		this._depthRT = null;
		this._depthMaterial = null;
		this._scene = null;
		this._rendererState = undefined;

		// Track for change detection
		this._prevDirections = this.directions;
		this._prevSteps = this.steps;

		this._aoStorage = new StorageTexture( 1, 1 );
		this._aoStorage.name = 'GTAOCompute.AO';
		this._aoStorage.minFilter = LinearFilter;
		this._aoStorage.magFilter = LinearFilter;

		this._textureNode = passTexture( this, this._aoStorage );
		this._computeNode = null;
		this._needsRebuild = true;

	}

	/**
	 * Returns the AO result as a texture node.
	 *
	 * @return {TextureNode}
	 */
	getTextureNode() {

		return this._textureNode;

	}

	/**
	 * Sets the size of the effect.
	 *
	 * @param {number} width - The width in pixels.
	 * @param {number} height - The height in pixels.
	 */
	setSize( width, height ) {

		width = Math.round( this.resolutionScale * width );
		height = Math.round( this.resolutionScale * height );

		if ( this._aoStorage.image.width !== width || this._aoStorage.image.height !== height ) {

			this.resolution.value.set( width, height );
			this._aoStorage.dispose();
			this._aoStorage = new StorageTexture( width, height );
			this._aoStorage.name = 'GTAOCompute.AO';
			this._aoStorage.minFilter = LinearFilter;
			this._aoStorage.magFilter = LinearFilter;
			this._textureNode.value = this._aoStorage;
			this._needsRebuild = true;

		}

	}

	/**
	 * Builds the compute node for the current resolution.
	 *
	 * @private
	 */
	_buildCompute() {

		// Release previous compute pipeline state
		this._computeNode = null;

		const depthNode = this.depthNode;
		const normalNode = this.normalNode;
		const radiusUniform = this.radius;
		const thicknessUniform = this.thickness;
		const distExpUniform = this.distanceExponent;
		const distFallUniform = this.distanceFallOff;
		const scaleUniform = this.scale;
		const hasNormals = this.normalNode !== null;
		const storage = this._aoStorage;
		const w = storage.image.width;
		const h = storage.image.height;
		const projMat = this._projMat;
		const projMatInv = this._projMatInv;

		// Reconstruct view position from linear Z + UV + inverse projection
		function makeViewPos( pixelUV, linearZ ) {

			const ndc = vec2( pixelUV.x.mul( 2 ).sub( 1 ), float( 1 ).sub( pixelUV.y ).mul( 2 ).sub( 1 ) );
			return vec3(
				ndc.x.mul( projMatInv.element( 0 ).element( 0 ) ).mul( linearZ ),
				ndc.y.mul( projMatInv.element( 1 ).element( 1 ) ).mul( linearZ ),
				linearZ.negate()
			);

		}

		// Project view-space position to screen UV
		function viewToScreen( vp ) {

			const cx = vp.x.mul( projMat.element( 0 ).element( 0 ) ).div( vp.z.negate() );
			const cy = vp.y.mul( projMat.element( 1 ).element( 1 ) ).div( vp.z.negate() );
			return vec2( cx.mul( 0.5 ).add( 0.5 ), cy.mul( - 0.5 ).add( 0.5 ) );

		}

		const computeFn = Fn( ( { storageTexture } ) => {

			const px = instanceIndex.mod( w );
			const py = instanceIndex.div( w );
			const coord = uvec2( px, py );
			const pixelUV = vec2(
				float( px ).add( 0.5 ).div( float( w ) ),
				float( py ).add( 0.5 ).div( float( h ) )
			);

			const linearZ = depthNode.sample( pixelUV ).r.toVar();

			If( linearZ.lessThanEqual( 0.001 ), () => {

				textureStore( storageTexture, coord, vec4( 1, 1, 1, 1 ) ).toWriteOnly();

			} ).Else( () => {

				const viewPos = makeViewPos( pixelUV, linearZ ).toVar();
				const viewDir = normalize( viewPos.negate() ).toVar();

				// Normal: from texture if available, else face camera
				// Unpack normals from [0,1] → [-1,1] (reverses packNormalToRGB)
				const viewNormal = hasNormals
					? normalNode.sample( pixelUV ).rgb.mul( 2.0 ).sub( 1.0 ).normalize().toVar()
					: viewDir.toVar();

				const DIRECTIONS = int( this.directions );
				const STEPS = int( this.steps );

				// Per-pixel noise rotation (IGN hash)
				// Per-pixel noise: two independent IGN evaluations for rotation and radial jitter
				const noiseVal = float( 52.9829189 ).mul(
					float( 0.06711056 ).mul( float( px ) ).add( float( 0.00583715 ).mul( float( py ) ) ).fract()
				).fract();
				const noiseVal2 = float( 52.9829189 ).mul(
					float( 0.06711056 ).mul( float( px ).add( 47 ) ).add( float( 0.00583715 ).mul( float( py ).add( 17 ) ) ).fract()
				).fract();
				const noiseAngle = noiseVal.mul( PI.mul( 2.0 ) );
				const noiseJitter = float( 0.5 ).add( noiseVal2.mul( 0.5 ) ); // independent radial jitter [0.5, 1.0]
				const noiseTangent = vec3( cos( noiseAngle ), sin( noiseAngle ), 0.0 ).normalize().toVar();
				const noiseBitangent = vec3( noiseTangent.y.negate(), noiseTangent.x, 0.0 ).toVar();
				const kernelMatrix = mat3( noiseTangent, noiseBitangent, vec3( 0, 0, 1 ) );

				const ao = float( 0 ).toVar();

				Loop( { start: int( 0 ), end: DIRECTIONS, type: 'int', condition: '<' }, ( { i } ) => {

					// Slice direction: evenly spaced, rotated by noise kernel
					const sliceAngle = float( i ).div( float( DIRECTIONS ) ).mul( PI );
					const rawDir = vec3( cos( sliceAngle ), sin( sliceAngle ), 0 );
					const sampleDir3 = normalize( kernelMatrix.mul( rawDir ) ).toVar();

					// Build slice frame (Jimenez et al. Section 3.2)
					const sliceBitangent = normalize( cross( sampleDir3, viewDir ) ).toVar();
					const sliceTangent = cross( sliceBitangent, viewDir ).toVar();

					// Project normal onto slice plane
					const projNRaw = viewNormal.sub( sliceBitangent.mul( dot( viewNormal, sliceBitangent ) ) ).toVar();
					const projNLen = projNRaw.length().toVar();
					const projN = projNRaw.div( max( projNLen, 0.0001 ) ).toVar();

					// γ — signed angle of projected normal in the slice
					const nSin = dot( projN, sliceTangent ).toVar();
					const nCos = clamp( dot( projN, viewDir ), 0, 1 ).toVar();
					const signNSin = select( nSin.greaterThanEqual( 0 ), float( 1 ), float( - 1 ) );
					const angleN = signNSin.mul( acos( nCos ) ).toVar();

					// Initialize cosine horizons from tangent-to-normal
					const tToN = cross( projN, sliceBitangent ).toVar();
					const cosHorizons = vec2(
						dot( viewDir, tToN ),
						dot( viewDir, tToN.negate() )
					).toVar();

					// March in VIEW SPACE, project to screen for depth sampling
					Loop( { end: STEPS, type: 'int', name: 'j', condition: '<' }, ( { j } ) => {

						const stepScale = pow( div( float( j ).add( 1.0 ), float( STEPS ) ), distExpUniform );
						const viewOffset = sampleDir3.mul( radiusUniform ).mul( noiseJitter ).mul( stepScale );

						// Positive direction: offset in view space, project to screen
						const samplePosP = viewPos.add( viewOffset );
						const sampleUVP = viewToScreen( samplePosP );
						const szP = depthNode.sample( sampleUVP ).r.toVar();

						If( szP.greaterThan( 0.0 ), () => {

							const sceneP = makeViewPos( sampleUVP, szP );
							const deltaP = sceneP.sub( viewPos ).toVar();
							const zRatioP = abs( deltaP.z ).div( thicknessUniform );

							// Smooth thickness falloff: full contribution at z=0,
							// fades to zero at z=thickness, no hard cutoff
							const thickWeightP = clamp( float( 1 ).sub( zRatioP.mul( zRatioP ) ), 0, 1 );

							If( thickWeightP.greaterThan( 0.001 ), () => {

								const cosSample = dot( viewDir, normalize( deltaP ) );
								cosHorizons.x.addAssign( max( 0, mul(
									cosSample.sub( cosHorizons.x ),
									mix( 1.0, float( 2.0 ).div( float( j ).add( 2 ) ), distFallUniform )
								).mul( thickWeightP ) ) );

							} );

						} );

						// Negative direction
						const samplePosN = viewPos.sub( viewOffset );
						const sampleUVN = viewToScreen( samplePosN );
						const szN = depthNode.sample( sampleUVN ).r.toVar();

						If( szN.greaterThan( 0.0 ), () => {

							const sceneN = makeViewPos( sampleUVN, szN );
							const deltaN = sceneN.sub( viewPos ).toVar();
							const zRatioN = abs( deltaN.z ).div( thicknessUniform );
							const thickWeightN = clamp( float( 1 ).sub( zRatioN.mul( zRatioN ) ), 0, 1 );

							If( thickWeightN.greaterThan( 0.001 ), () => {

								const cosSample = dot( viewDir, normalize( deltaN ) );
								cosHorizons.y.addAssign( max( 0, mul(
									cosSample.sub( cosHorizons.y ),
									mix( 1.0, float( 2.0 ).div( float( j ).add( 2 ) ), distFallUniform )
								).mul( thickWeightN ) ) );

							} );

						} );

					} );

					// Closed-form cosine-weighted integral (Eq. 7)
					// sliceTangent is opposite to sampleDir, so
					// +sampleDir horizons → cosHorizons.x → hNeg side
					// -sampleDir horizons → cosHorizons.y → hPos side
					const hPos = acos( clamp( cosHorizons.y, - 1, 1 ) ).toVar();
					const hNeg = acos( clamp( cosHorizons.x, - 1, 1 ) ).negate().toVar();

					const termPos = cos( hPos.mul( 2 ).sub( angleN ) ).negate().add( nCos ).add( hPos.mul( 2 ).mul( nSin ) );
					const termNeg = cos( hNeg.mul( 2 ).sub( angleN ) ).negate().add( nCos ).add( hNeg.mul( 2 ).mul( nSin ) );
					const sliceAO = termPos.add( termNeg ).mul( 0.25 );

					ao.addAssign( projNLen.mul( sliceAO ) );

				} );

				ao.assign( clamp( ao.div( float( DIRECTIONS ) ), 0, 1 ) );
				ao.assign( pow( ao, scaleUniform ) );
				textureStore( storageTexture, coord, vec4( ao, ao, ao, 1 ) ).toWriteOnly();

			} );

		} );

		this._computeNode = computeFn( { storageTexture: storage } ).compute( w * h );

	}

	/**
	 * Configures a depth render pass that runs automatically before
	 * the compute dispatch in `updateBefore`.
	 *
	 * @param {RenderTarget} depthRT - Float render target for linear depth.
	 * @param {NodeMaterial} depthMaterial - Material that writes linear view-Z.
	 * @param {Scene} scene - The scene to render depth from.
	 */
	setDepthPass( depthRT, depthMaterial, scene ) {

		this._depthRT = depthRT;
		this._depthMaterial = depthMaterial;
		this._scene = scene;

	}

	/**
	 * Called once per frame by the render pipeline. Renders depth,
	 * dispatches compute AO, all within the pipeline's frame so
	 * DenoiseNode's subsequent updateBefore sees current-frame output.
	 *
	 * @param {NodeFrame} frame - The current node frame.
	 */
	updateBefore( frame ) {

		const { renderer } = frame;
		const size = renderer.getDrawingBufferSize( _size );

		this.setSize( size.width, size.height );

		// Detect directions/steps changes
		if ( this.directions !== this._prevDirections || this.steps !== this._prevSteps ) {

			this._prevDirections = this.directions;
			this._prevSteps = this.steps;
			this._needsRebuild = true;

		}

		if ( this._needsRebuild ) {

			this._buildCompute();
			this._needsRebuild = false;

		}

		if ( this._computeNode ) {

			this._projMat.value.copy( this._camera.projectionMatrix );
			this._projMatInv.value.copy( this._camera.projectionMatrixInverse );

			// Render depth pass if configured
			if ( this._depthRT && this._depthMaterial && this._scene ) {

				this._rendererState = RendererUtils.resetRendererAndSceneState( renderer, this._scene, this._rendererState );

				this._scene.overrideMaterial = this._depthMaterial;
				renderer.setRenderTarget( this._depthRT );
				renderer.render( this._scene, this._camera );

				RendererUtils.restoreRendererAndSceneState( renderer, this._scene, this._rendererState );

			}

			renderer.compute( this._computeNode );

		}

	}

	/**
	 * Returns the texture node for use in the render graph.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {TextureNode}
	 */
	setup( /* builder */ ) {

		return this._textureNode;

	}

	/**
	 * Frees GPU resources held by this node.
	 */
	dispose() {

		this._aoStorage.dispose();
		this._computeNode = null;

	}

}

export default GTAOComputeNode;

/**
 * TSL helper to create a compute GTAO node.
 *
 * @param {Node} depthNode - Texture node for linear view-space depth.
 * @param {?Node} normalNode - Texture node for normals, or null.
 * @param {Camera} camera - The scene camera.
 * @returns {GTAOComputeNode}
 */
export const aoCompute = ( depthNode, normalNode, camera ) => nodeObject( new GTAOComputeNode( nodeObject( depthNode ), normalNode ? nodeObject( normalNode ) : null, camera ) );
