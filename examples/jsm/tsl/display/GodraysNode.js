import { Frustum, Matrix4, RenderTarget, Vector2, RendererUtils, QuadMesh, TempNode, NodeMaterial, NodeUpdateType, Vector3, Plane, WebGPUCoordinateSystem } from 'three/webgpu';
import { cubeTexture, clamp, viewZToPerspectiveDepth, logarithmicDepthToViewZ, float, Loop, max, Fn, passTexture, uv, dot, uniformArray, If, getViewPosition, uniform, vec4, add, interleavedGradientNoise, screenCoordinate, round, mul, uint, mix, exp, vec3, distance, pow, reference, lightPosition, vec2, bool, texture, perspectiveDepthToViewZ, lightShadowMatrix } from 'three/tsl';

const _quadMesh = /*@__PURE__*/ new QuadMesh();
const _size = /*@__PURE__*/ new Vector2();

const _DIRECTIONS = [
	new Vector3( 1, 0, 0 ),
	new Vector3( - 1, 0, 0 ),
	new Vector3( 0, 1, 0 ),
	new Vector3( 0, - 1, 0 ),
	new Vector3( 0, 0, 1 ),
	new Vector3( 0, 0, - 1 ),
];

const _PLANES = _DIRECTIONS.map( () => new Plane() );
const _SCRATCH_VECTOR = new Vector3();
const _SCRATCH_MAT4 = new Matrix4();
const _SCRATCH_FRUSTUM = new Frustum();

let _rendererState;

/**
 * Post-Processing node for apply Screen-space raymarched godrays to a scene.
 *
 * After the godrays have been computed, it's recommened to apply a Bilateral
 * Blur to the result to mitigate raymarching and noise artifacts.
 *
 * The composite with the scene pass is ideally done with `depthAwareBlend()`,
 * which mitigates aliasing and light leaking.
 *
 * ```js
 * const godraysPass = godrays( scenePassDepth, camera, light );
 *
 * const blurPass = bilateralBlur( godraysPassColor ); // optional blur
 *
 * const outputBlurred = depthAwareBlend( scenePassColor, blurPassColor, scenePassDepth, camera, { blendColor, edgeRadius, edgeStrength } ); // composite
 * ```
 *
 * Limitations:
 *
 * - Only point and directional lights are currently supported.
 * - The effect requires a full shadow setup. Meaning shadows must be enabled in the renderer,
 * 3D objects must cast and receive shadows and the main light must cast shadows.
 *
 * Reference: This Node is a part of [three-good-godrays](https://github.com/Ameobea/three-good-godrays).
 *
 * @augments TempNode
 * @three_import import { godrays } from 'three/addons/tsl/display/GodraysNode.js';
 */
class GodraysNode extends TempNode {

	static get type() {

		return 'GodraysNode';

	}

	/**
	 * Constructs a new Godrays node.
	 *
	 * @param {TextureNode} depthNode - A texture node that represents the scene's depth.
	 * @param {Camera} camera - The camera the scene is rendered with.
	 * @param {(DirectionalLight|PointLight)} light - The light the godrays are rendered for.
	 */
	constructor( depthNode, camera, light ) {

		super( 'vec4' );

		/**
		 * A node that represents the beauty pass's depth.
		 *
		 * @type {TextureNode}
		 */
		this.depthNode = depthNode;

		/**
		 * The number of raymarching steps
		 *
		 * @type {UniformNode<uint>}
		 * @default 60
		 */
		this.raymarchSteps = uniform( uint( 60 ) );

		/**
		 * The rate of accumulation for the godrays.  Higher values roughly equate to more humid air/denser fog.
		 *
		 * @type {UniformNode<float>}
		 * @default 0.7
		 */
		this.density = uniform( float( 0.7 ) );

		/**
		 * The maximum density of the godrays.  Limits the maximum brightness of the godrays.
		 *
		 * @type {UniformNode<float>}
		 * @default 0.5
		 */
		this.maxDensity = uniform( float( 0.5 ) );

		/**
		 * Higher values decrease the accumulation of godrays the further away they are from the light source.
		 *
		 * @type {UniformNode<float>}
		 * @default 2
		 */
		this.distanceAttenuation = uniform( float( 2 ) );

		/**
		 * The resolution scale.
		 *
		 * @type {number}
		 */
		this.resolutionScale = 0.5;

		/**
		 * The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node renders
		 * its effect once per frame in `updateBefore()`.
		 *
		 * @type {string}
		 * @default 'frame'
		 */
		this.updateBeforeType = NodeUpdateType.FRAME;

		// private uniforms

		/**
		 * Represents the world matrix of the scene's camera.
		 *
		 * @private
		 * @type {UniformNode<mat4>}
		 */
		this._cameraMatrixWorld = uniform( camera.matrixWorld );

		/**
		 * Represents the inverse projection matrix of the scene's camera.
		 *
		 * @private
		 * @type {UniformNode<mat4>}
		 */
		this._cameraProjectionMatrixInverse = uniform( camera.projectionMatrixInverse );

		/**
		 * Represents the inverse projection matrix of the scene's camera.
		 *
		 * @private
		 * @type {UniformNode<mat4>}
		 */
		this._premultipliedLightCameraMatrix = uniform( new Matrix4() );

		/**
		 * Represents the world position of the scene's camera.
		 *
		 * @private
		 * @type {UniformNode<mat4>}
		 */
		this._cameraPosition = uniform( new Vector3() );

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
		 * The near value of the shadow camera.
		 *
		 * @private
		 * @type {ReferenceNode<float>}
		 */
		this._shadowCameraNear = reference( 'near', 'float', light.shadow.camera );

		/**
		 * The far value of the shadow camera.
		 *
		 * @private
		 * @type {ReferenceNode<float>}
		 */
		this._shadowCameraFar = reference( 'far', 'float', light.shadow.camera );

		this._fNormals = uniformArray( _DIRECTIONS.map( () => new Vector3() ) );
		this._fConstants = uniformArray( _DIRECTIONS.map( () => 0 ) );

		/**
		 * The light the godrays are rendered for.
		 *
		 * @private
		 * @type {(DirectionalLight|PointLight)}
		 */
		this._light = light;

		/**
		 * The camera the scene is rendered with.
		 *
		 * @private
		 * @type {Camera}
		 */
		this._camera = camera;

		/**
		 * The render target the godrays are rendered into.
		 *
		 * @private
		 * @type {RenderTarget}
		 */
		this._godraysRenderTarget = new RenderTarget( 1, 1, { depthBuffer: false } );
		this._godraysRenderTarget.texture.name = 'Godrays';

		/**
		 * The material that is used to render the effect.
		 *
		 * @private
		 * @type {NodeMaterial}
		 */
		this._material = new NodeMaterial();
		this._material.name = 'Godrays';

		/**
		 * The result of the effect is represented as a separate texture node.
		 *
		 * @private
		 * @type {PassTextureNode}
		 */
		this._textureNode = passTexture( this, this._godraysRenderTarget.texture );


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
	 * Sets the size of the effect.
	 *
	 * @param {number} width - The width of the effect.
	 * @param {number} height - The height of the effect.
	 */
	setSize( width, height ) {

		width = Math.round( this.resolutionScale * width );
		height = Math.round( this.resolutionScale * height );

		this._godraysRenderTarget.setSize( width, height );

	}

	/**
	 * This method is used to render the effect once per frame.
	 *
	 * @param {NodeFrame} frame - The current node frame.
	 */
	updateBefore( frame ) {

		const { renderer } = frame;

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		//

		const size = renderer.getDrawingBufferSize( _size );
		this.setSize( size.width, size.height );

		//

		_quadMesh.material = this._material;
		_quadMesh.name = 'Godrays';

		this._updateLightParams();

		this._cameraPosition.value.setFromMatrixPosition( this._camera.matrixWorld );

		// clear

		renderer.setClearColor( 0xffffff, 1 );

		// godrays

		renderer.setRenderTarget( this._godraysRenderTarget );
		_quadMesh.render( renderer );

		// restore

		RendererUtils.restoreRendererState( renderer, _rendererState );

	}

	_updateLightParams() {

		const light = this._light;
		const shadowCamera = light.shadow.camera;

		this._premultipliedLightCameraMatrix.value.multiplyMatrices( shadowCamera.projectionMatrix, shadowCamera.matrixWorldInverse );

		if ( light.isPointLight ) {

			for ( let i = 0; i < _DIRECTIONS.length; i ++ ) {

				const direction = _DIRECTIONS[ i ];
				const plane = _PLANES[ i ];

				_SCRATCH_VECTOR.copy( light.position );
				_SCRATCH_VECTOR.addScaledVector( direction, shadowCamera.far );
				plane.setFromNormalAndCoplanarPoint( direction, _SCRATCH_VECTOR );

				this._fNormals.array[ i ].copy( plane.normal );
				this._fConstants.array[ i ] = plane.constant;

			}

		} else if ( light.isDirectionalLight ) {

			_SCRATCH_MAT4.multiplyMatrices( shadowCamera.projectionMatrix, shadowCamera.matrixWorldInverse );
			_SCRATCH_FRUSTUM.setFromProjectionMatrix( _SCRATCH_MAT4 );

			for ( let i = 0; i < 6; i ++ ) {

				const plane = _SCRATCH_FRUSTUM.planes[ i ];

				this._fNormals.array[ i ].copy( plane.normal ).multiplyScalar( - 1 );
				this._fConstants.array[ i ] = plane.constant * - 1;

			}

		}

	}

	/**
	 * This method is used to setup the effect's TSL code.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {PassTextureNode}
	 */
	setup( builder ) {

		const { renderer } = builder;

		const uvNode = uv();
		const lightPos = lightPosition( this._light );

		const sampleDepth = ( uv ) => {

			const depth = this.depthNode.sample( uv ).r;

			if ( builder.renderer.logarithmicDepthBuffer === true ) {

				const viewZ = logarithmicDepthToViewZ( depth, this._cameraNear, this._cameraFar );

				return viewZToPerspectiveDepth( viewZ, this._cameraNear, this._cameraFar );

			}

			return depth;

		};

		const sdPlane = ( p, n, h ) => {

			return dot( p, n ).add( h );

		};

		const intersectRayPlane = ( rayOrigin, rayDirection, planeNormal, planeDistance ) => {

			const denom = dot( planeNormal, rayDirection );
			return sdPlane( rayOrigin, planeNormal, planeDistance ).div( denom ).negate();

		};

		const computeShadowCoord = ( worldPos ) => {

			const shadowPosition = lightShadowMatrix( this._light ).mul( worldPos );
			const shadowCoord = shadowPosition.xyz.div( shadowPosition.w );
			let coordZ = shadowCoord.z;

			if ( renderer.coordinateSystem === WebGPUCoordinateSystem ) {

				coordZ = coordZ.mul( 2 ).sub( 1 ); // WebGPU: Conversion [ 0, 1 ] to [ - 1, 1 ]

			}

			return vec3( shadowCoord.x, shadowCoord.y.oneMinus(), coordZ );

		};

		const inShadow = ( worldPos ) => {

			if ( this._light.isPointLight ) {

				const lightToPos = worldPos.sub( lightPos ).toConst();

				const shadowPositionAbs = lightToPos.abs().toConst();
				const viewZ = shadowPositionAbs.x.max( shadowPositionAbs.y ).max( shadowPositionAbs.z ).negate();

				const depth = viewZToPerspectiveDepth( viewZ, this._shadowCameraNear, this._shadowCameraFar );

				const result = cubeTexture( this._light.shadow.map.depthTexture, lightToPos ).compare( depth ).r;

				return vec2( result.oneMinus().add( 0.005 ), viewZ.negate() );

			} else if ( this._light.isDirectionalLight ) {

				const shadowCoord = computeShadowCoord( worldPos ).toConst();

				const frustumTest = shadowCoord.x.greaterThanEqual( 0 )
					.and( shadowCoord.x.lessThanEqual( 1 ) )
					.and( shadowCoord.y.greaterThanEqual( 0 ) )
					.and( shadowCoord.y.lessThanEqual( 1 ) )
					.and( shadowCoord.z.greaterThanEqual( 0 ) )
					.and( shadowCoord.z.lessThanEqual( 1 ) );

				const output = vec2( 1, 0 );

				If( frustumTest.equal( true ), () => {

					const result = texture( this._light.shadow.map.depthTexture, shadowCoord.xy ).compare( shadowCoord.z ).r;

					const viewZ = perspectiveDepthToViewZ( shadowCoord.z, this._shadowCameraNear, this._shadowCameraFar );

					output.assign( vec2( result.oneMinus(), viewZ.negate() ) );

				} );

				return output;

			} else {

				throw new Error( 'GodraysNode: Unsupported light type.' );

			}

		};

		const godrays = Fn( () => {

			const output = vec4( 0, 0, 0, 1 ).toVar();
			const isEarlyOut = bool( false );

			const depth = sampleDepth( uvNode ).toConst();
			const viewPosition = getViewPosition( uvNode, depth, this._cameraProjectionMatrixInverse ).toConst();
			const worldPosition = this._cameraMatrixWorld.mul( viewPosition );

			const inBoxDist = float( - 10000.0 ).toVar();

			Loop( 6, ( { i } ) => {

				inBoxDist.assign( max( inBoxDist, sdPlane( this._cameraPosition, this._fNormals.element( i ), this._fConstants.element( i ) ) ) );

			} );

			const startPosition = this._cameraPosition.toVar();

			If( inBoxDist.lessThan( 0 ), () => {

				// If the ray target is outside the shadow box, move it to the nearest
				// point on the box to avoid marching through unlit space

				Loop( 6, ( { i } ) => {

					If( sdPlane( worldPosition, this._fNormals.element( i ), this._fConstants.element( i ) ).greaterThan( 0 ), () => {

						const direction = worldPosition.sub( this._cameraPosition ).toConst();

						const t = intersectRayPlane( this._cameraPosition, direction, this._fNormals.element( i ), this._fConstants.element( i ) );

						worldPosition.assign( this._cameraPosition.add( t.mul( direction ) ) );

					} );

				} );

			} ).Else( () => {

				// Find the first point where the ray intersects the shadow box (startPos)

				const direction = worldPosition.sub( this._cameraPosition ).toConst();

				const minT = float( 10000 ).toVar();

				Loop( 6, ( { i } ) => {

					const t = intersectRayPlane( this._cameraPosition, direction, this._fNormals.element( i ), this._fConstants.element( i ) );

					If( t.lessThan( minT ).and( t.greaterThan( 0 ) ), () => {

						minT.assign( t );

					} );

				} );

				If( minT.equal( 10000 ), () => {

					isEarlyOut.assign( true );

				} ).Else( () => {

					startPosition.assign( this._cameraPosition.add( minT.add( 0.001 ).mul( direction ) ) );

					// If the ray target is outside the shadow box, move it to the nearest
					// point on the box to avoid marching through unlit space

					const endInBoxDist = float( - 10000 ).toVar();

					Loop( 6, ( { i } ) => {

						endInBoxDist.assign( max( endInBoxDist, sdPlane( worldPosition, this._fNormals.element( i ), this._fConstants.element( i ) ) ) );

					} );


					If( endInBoxDist.greaterThanEqual( 0 ), () => {

						const minT = float( 10000 ).toVar();

						Loop( 6, ( { i } ) => {

							If( sdPlane( worldPosition, this._fNormals.element( i ), this._fConstants.element( i ) ).greaterThan( 0 ), () => {

								const t = intersectRayPlane( startPosition, direction, this._fNormals.element( i ), this._fConstants.element( i ) );

								If( t.lessThan( minT ).and( t.greaterThan( 0 ) ), () => {

									minT.assign( t );

								} );

							} );

						} );

						If( minT.lessThan( worldPosition.distance( startPosition ) ), () => {

							worldPosition.assign( startPosition.add( minT.mul( direction ) ) );

						} );

					} );

				} );

			} );

			If( isEarlyOut.equal( false ), () => {

				const illum = float( 0 ).toVar();

				const noise = interleavedGradientNoise( screenCoordinate ).toConst();
				const samplesFloat = round( add( this.raymarchSteps, mul( this.raymarchSteps.div( 8 ).add( 2 ), noise ) ) ).toConst();
				const samples = uint( samplesFloat ).toConst();

				Loop( samples, ( { i } ) => {

					const samplePos = mix( startPosition, worldPosition, float( i ).div( samplesFloat ) ).toConst();
					const shadowInfo = inShadow( samplePos );
					const shadowAmount = shadowInfo.x.oneMinus().toConst();

					illum.addAssign( shadowAmount.mul( distance( startPosition, worldPosition ).mul( this.density.div( 100 ) ) ).mul( pow( shadowInfo.y.div( this._shadowCameraFar ).oneMinus(), this.distanceAttenuation ) ) );

				} );

				illum.divAssign( samplesFloat );

				output.assign( vec4( vec3( clamp( exp( illum.negate() ).oneMinus(), 0, this.maxDensity ) ), depth ) );


			} );

			return output;

		} );

		this._material.fragmentNode = godrays().context( builder.getSharedContext() );
		this._material.needsUpdate = true;

		return this._textureNode;

	}

	/**
	 * Frees internal resources. This method should be called
	 * when the effect is no longer required.
	 */
	dispose() {

		this._godraysRenderTarget.dispose();

		this._material.dispose();

	}

}

export default GodraysNode;

/**
 * TSL function for creating a Godrays effect.
 *
 * @tsl
 * @function
 * @param {TextureNode} depthNode - A texture node that represents the scene's depth.
 * @param {Camera} camera - The camera the scene is rendered with.
 * @param {(DirectionalLight|PointLight)} light - The light the godrays are rendered for.
 * @returns {GodraysNode}
 */
export const godrays = ( depthNode, camera, light ) => new GodraysNode( depthNode, camera, light );
