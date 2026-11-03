import { DataTexture, FloatType, RGBAFormat, Vector2, Vector3, LightsNode, NodeUpdateType, NodeUtils, PointLightNode, SpotLightNode } from 'three/webgpu';

import {
	instancedArray, nodeProxy, int, float, vec3, vec4, ivec2, ivec4, uniform, Break, Loop, positionView,
	Fn, If, textureLoad, instanceIndex, screenCoordinate, directPointLight,
	renderGroup,
	min, max, pow, log, clamp, dot, smoothstep
} from 'three/tsl';

const _vector3 = /*@__PURE__*/ new Vector3();
const _direction = /*@__PURE__*/ new Vector3();
const _targetPosition = /*@__PURE__*/ new Vector3();
const _size = /*@__PURE__*/ new Vector2();

// light data texture rows

const POSITION_ROW = 0; // world position, cutoff distance
const COLOR_ROW = 1; // color * intensity, decay
const SPOT_ROW = 2; // scaled world spot direction, scaled cone cosine
const BOUNDS_ROW = 3; // world bounding sphere center, radius ( negative if unbounded )
const ROWS = 4;

/**
 * A custom version of `LightsNode` implementing Forward+ clustered shading:
 * the view frustum is subdivided into a 3D grid of clusters (X × Y screen tiles
 * times an exponentially-spaced set of Z depth slices), and each cluster holds
 * only the point and spot lights whose bounding spheres intersect it. At shading time each fragment
 * looks up its cluster and loops over just that cluster's lights. Unlike 2D tiled
 * lighting, clustered shading culls lights that share screen pixels but lie at
 * different depths — suitable for 3D scenes with real depth complexity.
 *
 * @augments LightsNode
 * @three_import import { clusteredLights } from 'three/addons/tsl/lighting/ClusteredLightsNode.js';
 */
class ClusteredLightsNode extends LightsNode {

	static get type() {

		return 'ClusteredLightsNode';

	}

	/**
	 * Constructs a new clustered lights node.
	 *
	 * @param {number} [maxLights=1024] - Maximum number of point and spot lights.
	 * @param {number} [tileSize=32] - Screen tile size in pixels (cluster XY size).
	 * @param {number} [zSlices=24] - Number of exponential depth slices.
	 * @param {number} [maxLightsPerCluster=64] - Per-cluster light-list capacity.
	 */
	constructor( maxLights = 1024, tileSize = 32, zSlices = 24, maxLightsPerCluster = 64 ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isClusteredLightsNode = true;

		this.materialLights = [];
		this.clusteredLights = [];

		this.maxLights = maxLights;
		this.tileSize = tileSize;
		this.zSlices = zSlices;
		this.maxLightsPerCluster = maxLightsPerCluster;

		this._chunksPerCluster = Math.ceil( maxLightsPerCluster / 4 );

		this._bufferSize = null;
		this._isWebGLBackend = false;
		this._needsRebuild = false;
		this._invocationsPerCluster = 1;
		this._lightIndexes = null;
		this._renderer = null;
		this._screenClusterIndex = null;
		this._compute = null;

		const lightsData = new Float32Array( maxLights * 4 * ROWS );
		this._lightsTexture = new DataTexture( lightsData, maxLights, ROWS, RGBAFormat, FloatType );

		// Per Z-slice light range for Z-culling (CPU-sorted, uploaded each frame)

		this._zSliceRangesData = new Float32Array( zSlices * 4 );
		this._zSliceRangesTexture = new DataTexture( this._zSliceRangesData, zSlices, 1, RGBAFormat, FloatType );

		this._lightViewZ = new Float32Array( maxLights );
		this._lightSortOrder = [];

		this._lightsCount = uniform( 0, 'int' );

		// Render-group uniforms: shared between compute and fragment passes,
		// updated manually each frame in updateBefore (compute lacks a camera context).
		this._cameraNear = uniform( 0 ).setName( 'clusteredCameraNear' ).setGroup( renderGroup );
		this._cameraFar = uniform( 0 ).setName( 'clusteredCameraFar' ).setGroup( renderGroup );
		this._cameraViewMatrix = uniform( 'mat4' ).setName( 'clusteredCameraViewMatrix' ).setGroup( renderGroup );
		this._cameraProjectionMatrix = uniform( 'mat4' ).setName( 'clusteredCameraProjectionMatrix' ).setGroup( renderGroup );

		this._gridDimensions = uniform( new Vector2() );

		this.updateBeforeType = NodeUpdateType.RENDER;

	}

	/**
	 * Overwrites the default {@link LightsNode#customCacheKey} implementation by
	 * including the node identity and resource version into the cache key.
	 *
	 * @return {number} The custom cache key.
	 */
	customCacheKey() {

		// First use allocates the grid after material cache keys have been computed.
		// Keep that allocation stable, but never share bindings between lights nodes.
		return NodeUtils.hash( this.id, this.version, super.customCacheKey() );

	}

	/**
	 * Updates the light data and the light ranges of the depth slices.
	 *
	 * @private
	 * @param {Camera} camera - The camera.
	 */
	_updateLightsTexture( camera ) {

		const { _lightsTexture: lightsTexture, clusteredLights } = this;

		const data = lightsTexture.image.data;
		const lineSize = lightsTexture.image.width * 4;
		const count = Math.min( clusteredLights.length, this.maxLights );

		this._lightsCount.value = count;

		// Sort lights by the view-space depth of their bounding spheres for Z-culling

		const viewZ = this._lightViewZ;
		const order = this._lightSortOrder;

		for ( let i = 0; i < count; i ++ ) {

			this._getBoundingSphereCenter( clusteredLights[ i ], _vector3 );
			_vector3.applyMatrix4( camera.matrixWorldInverse );
			viewZ[ i ] = _vector3.z;
			order[ i ] = i;

		}

		order.length = count;
		order.sort( ( a, b ) => viewZ[ a ] - viewZ[ b ] );

		// Write sorted lights to texture

		for ( let i = 0; i < count; i ++ ) {

			const light = clusteredLights[ order[ i ] ];

			const offset = i * 4;

			_vector3.setFromMatrixPosition( light.matrixWorld );

			let rowOffset = lineSize * POSITION_ROW + offset;

			data[ rowOffset + 0 ] = _vector3.x;
			data[ rowOffset + 1 ] = _vector3.y;
			data[ rowOffset + 2 ] = _vector3.z;
			data[ rowOffset + 3 ] = light.distance;

			rowOffset = lineSize * COLOR_ROW + offset;

			data[ rowOffset + 0 ] = light.color.r * light.intensity;
			data[ rowOffset + 1 ] = light.color.g * light.intensity;
			data[ rowOffset + 2 ] = light.color.b * light.intensity;
			data[ rowOffset + 3 ] = light.decay;

			// The spot attenuation smoothstep( coneCos, penumbraCos, dot( L, direction ) ) is stored
			// as smoothstep( 0, 1, dot( L, direction * scale ) - coneCos * scale ) with
			// scale = 1 / ( penumbraCos - coneCos ). Point lights store a constant attenuation of 1.

			rowOffset = lineSize * SPOT_ROW + offset;

			if ( light.isSpotLight === true ) {

				const coneCos = Math.cos( light.angle );
				const penumbraCos = Math.cos( light.angle * ( 1 - light.penumbra ) );
				const scale = 1 / Math.max( penumbraCos - coneCos, 1e-4 );

				this._getSpotDirection( light, _direction ).multiplyScalar( scale );

				data[ rowOffset + 0 ] = _direction.x;
				data[ rowOffset + 1 ] = _direction.y;
				data[ rowOffset + 2 ] = _direction.z;
				data[ rowOffset + 3 ] = coneCos * scale;

			} else {

				data[ rowOffset + 0 ] = 0;
				data[ rowOffset + 1 ] = 0;
				data[ rowOffset + 2 ] = 0;
				data[ rowOffset + 3 ] = - 1;

			}

			this._getBoundingSphereCenter( light, _vector3 );

			rowOffset = lineSize * BOUNDS_ROW + offset;

			data[ rowOffset + 0 ] = _vector3.x;
			data[ rowOffset + 1 ] = _vector3.y;
			data[ rowOffset + 2 ] = _vector3.z;
			data[ rowOffset + 3 ] = this._getBoundingSphereRadius( light );

		}

		lightsTexture.needsUpdate = true;

		// Compute per Z-slice light ranges

		const zRanges = this._zSliceRangesData;

		const near = camera.near;
		const far = camera.far;
		const NZ = this.zSlices;

		for ( let z = 0; z < NZ; z ++ ) {

			// Exponential Z-slice bounds (view-space, negative values)
			const sliceNear = - ( near * Math.pow( far / near, z / NZ ) );
			const sliceFar = - ( near * Math.pow( far / near, ( z + 1 ) / NZ ) );

			let rangeStart = count;
			let rangeEnd = 0;

			for ( let i = 0; i < count; i ++ ) {

				const vz = viewZ[ order[ i ] ];
				const r = data[ lineSize * BOUNDS_ROW + i * 4 + 3 ];
				const radius = r >= 0 ? r : far;

				// Bounding sphere Z: [vz - radius, vz + radius]
				// Slice Z: [sliceFar, sliceNear] (both negative, sliceFar < sliceNear)
				if ( vz + radius >= sliceFar && vz - radius <= sliceNear ) {

					if ( i < rangeStart ) rangeStart = i;
					if ( i + 1 > rangeEnd ) rangeEnd = i + 1;

				}

			}

			if ( rangeStart >= count ) {

				rangeStart = 0;
				rangeEnd = 0;

			}

			zRanges[ z * 4 ] = rangeStart;
			zRanges[ z * 4 + 1 ] = rangeEnd;

		}

		this._zSliceRangesTexture.needsUpdate = true;

	}

	/**
	 * Returns the normalized world-space direction pointing from the spot light's
	 * target to the spot light.
	 *
	 * @private
	 * @param {SpotLight} light - The spot light.
	 * @param {Vector3} target - The target vector.
	 * @return {Vector3} The direction.
	 */
	_getSpotDirection( light, target ) {

		_targetPosition.setFromMatrixPosition( light.target.matrixWorld );

		return target.setFromMatrixPosition( light.matrixWorld ).sub( _targetPosition ).normalize();

	}

	/**
	 * Returns the world-space center of the light's bounding sphere. For spot lights,
	 * this is the center of the smallest sphere enclosing the cone.
	 *
	 * @private
	 * @param {PointLight|SpotLight} light - The light.
	 * @param {Vector3} target - The target vector.
	 * @return {Vector3} The bounding sphere center.
	 */
	_getBoundingSphereCenter( light, target ) {

		target.setFromMatrixPosition( light.matrixWorld );

		if ( light.isSpotLight === true && light.distance > 0 ) {

			const angle = Math.min( light.angle, Math.PI / 2 );
			const offset = angle > Math.PI / 4 ? light.distance * Math.cos( angle ) : light.distance / ( 2 * Math.cos( angle ) );

			// _getSpotDirection() points away from the cone, so step backwards

			target.addScaledVector( this._getSpotDirection( light, _direction ), - offset );

		}

		return target;

	}

	/**
	 * Returns the radius of the light's bounding sphere.
	 *
	 * @private
	 * @param {PointLight|SpotLight} light - The light.
	 * @return {number} The bounding sphere radius. `-1` if the light has no cutoff distance.
	 */
	_getBoundingSphereRadius( light ) {

		if ( light.distance <= 0 ) return - 1;

		if ( light.isSpotLight === true ) {

			const angle = Math.min( light.angle, Math.PI / 2 );

			return angle > Math.PI / 4 ? light.distance * Math.sin( angle ) : light.distance / ( 2 * Math.cos( angle ) );

		}

		return light.distance;

	}

	/**
	 * Updates the light data and assigns the lights to the clusters.
	 *
	 * @param {NodeFrame} frame - A reference to the current node frame.
	 */
	updateBefore( frame ) {

		const { renderer, camera } = frame;

		this._initGrid( renderer );

		this._updateLightsTexture( camera );

		this._cameraNear.value = camera.near;
		this._cameraFar.value = camera.far;
		this._cameraViewMatrix.value = camera.matrixWorldInverse;
		this._cameraProjectionMatrix.value = camera.projectionMatrix;

		renderer.compute( this._compute );

	}

	/**
	 * Configures this node with an array of lights. Point and spot lights without
	 * shadows are clustered (except lights with a `colorNode`, spot lights with a
	 * projected `map` and light types with their own light node, like `IESSpotLight`
	 * or `ProjectorLight`), all other lights use the default lighting.
	 *
	 * @param {Array<Light>} lights - An array of lights.
	 * @return {ClusteredLightsNode} A reference to this node.
	 */
	setLights( lights ) {

		const { clusteredLights, materialLights } = this;

		let materialIndex = 0;
		let clusteredIndex = 0;

		for ( const light of lights ) {

			if ( this._isClusteredLight( light ) ) {

				clusteredLights[ clusteredIndex ++ ] = light;

			} else {

				materialLights[ materialIndex ++ ] = light;

			}

		}

		materialLights.length = materialIndex;
		clusteredLights.length = clusteredIndex;

		return super.setLights( lights );

	}

	/**
	 * Returns `true` if the given light can be clustered.
	 *
	 * @private
	 * @param {Light} light - The light.
	 * @return {boolean} Whether the light is clustered or not.
	 */
	_isClusteredLight( light ) {

		// Shadows, color nodes (any light) and projected maps (spot lights) are not supported.

		if ( light.castShadow === true || light.colorNode ) return false;

		// Only lights shaded by the plain point and spot light nodes are clustered. Subclasses
		// registered with their own light node (e.g. IESSpotLight, ProjectorLight) keep the
		// default lighting, since clustering would shade them as plain spot lights.

		if ( light._lightNode === PointLightNode ) return true;

		return light._lightNode === SpotLightNode && ! light.map;

	}

	/**
	 * Returns the lights that are not clustered.
	 *
	 * @return {Array<Light>} The lights using the default lighting.
	 */
	getBuiltinLights() {

		return this.materialLights;

	}

	/**
	 * Returns the light index stored at the given slot of the fragment's cluster.
	 *
	 * @private
	 * @param {number|Node<int>} element - The slot.
	 * @return {Node<int>} The 1-based light index. `0` marks the end of the list.
	 */
	_getTile( element ) {

		element = int( element );

		const stride = int( 4 );
		const chunkOffset = element.div( stride );
		const idx = this._screenClusterIndex.mul( int( this._chunksPerCluster ) ).add( chunkOffset );

		return this._lightIndexes.element( idx ).element( element.mod( stride ) );

	}

	/**
	 * Returns the number of lights in the fragment's cluster. Useful for debugging.
	 *
	 * @param {Node<int>} zSliceNode - The depth slice to inspect. A negative value selects the fragment's own cluster.
	 * @return {Node<int>} The light count.
	 */
	getClusterLightCount( zSliceNode ) {

		const getCount = Fn( ( [ zSliceNode ] ) => {

			const count = int( 0 ).toVar();

			const debugClusterIndex = this._screenClusterIndex.toVar();

			If( zSliceNode.greaterThanEqual( int( 0 ) ), () => {

				const tileSize = int( this.tileSize );
				const screenTile = screenCoordinate.div( tileSize ).floor();
				const NX = int( this._gridDimensions.x );
				const NY = int( this._gridDimensions.y );

				debugClusterIndex.assign(
					int( screenTile.x )
						.add( int( screenTile.y ).mul( NX ) )
						.add( zSliceNode.mul( NX.mul( NY ) ) )
				);

			} );

			Loop( this.maxLightsPerCluster, ( { i } ) => {

				const element = int( i );
				const stride = int( 4 );
				const chunkOffset = element.div( stride );
				const idx = debugClusterIndex.mul( int( this._chunksPerCluster ) ).add( chunkOffset );
				const lightIndex = this._lightIndexes.element( idx ).element( element.mod( stride ) );

				If( lightIndex.equal( int( 0 ) ), () => {

					Break();

				} );

				count.addAssign( int( 1 ) );

			} );

			return count;

		} );

		return getCount( zSliceNode );

	}

	/**
	 * Returns the shading data of the light at the given index.
	 *
	 * @private
	 * @param {number|Node<int>} index - The light index.
	 * @return {Object} The light's view position, distance, color, decay, view-space spot direction and spot offset.
	 */
	_getLightData( index ) {

		index = int( index );

		const dataA = textureLoad( this._lightsTexture, ivec2( index, POSITION_ROW ) );
		const dataB = textureLoad( this._lightsTexture, ivec2( index, COLOR_ROW ) );
		const dataC = textureLoad( this._lightsTexture, ivec2( index, SPOT_ROW ) );

		const viewPosition = this._cameraViewMatrix.mul( vec4( dataA.xyz, 1.0 ) ).xyz;
		const distance = dataA.w;
		const color = dataB.rgb;
		const decay = dataB.w;
		const spotDirection = this._cameraViewMatrix.mul( vec4( dataC.xyz, 0.0 ) ).xyz;
		const spotOffset = dataC.w;

		return {
			viewPosition,
			distance,
			color,
			decay,
			spotDirection,
			spotOffset
		};

	}

	/**
	 * Returns the culling data of the light at the given index.
	 *
	 * @private
	 * @param {number|Node<int>} index - The light index.
	 * @return {Object} The view-space center and the radius of the light's bounding sphere. A negative radius marks an unbounded light.
	 */
	_getLightBounds( index ) {

		const data = textureLoad( this._lightsTexture, ivec2( int( index ), BOUNDS_ROW ) );

		const center = this._cameraViewMatrix.mul( vec4( data.xyz, 1.0 ) ).xyz;
		const radius = data.w;

		return { center, radius };

	}

	/**
	 * Sets up the default lights and the clustered point and spot lights.
	 *
	 * @param {NodeBuilder} builder - A reference to the current node builder.
	 * @param {Array<LightingNode>} lightNodes - An array of lighting nodes.
	 */
	setupLights( builder, lightNodes ) {

		this._initGrid( builder.renderer );

		//

		const lightingModel = builder.context.reflectedLight;

		lightingModel.directDiffuse.toStack();
		lightingModel.directSpecular.toStack();

		super.setupLights( builder, lightNodes );

		Fn( () => {

			Loop( this.maxLightsPerCluster, ( { i } ) => {

				const lightIndex = this._getTile( i );

				If( lightIndex.equal( int( 0 ) ), () => {

					Break();

				} );

				const { color, decay, viewPosition, distance, spotDirection, spotOffset } = this._getLightData( lightIndex.sub( 1 ) );

				const lightVector = viewPosition.sub( positionView );

				// spot cone attenuation, always 1 for point lights
				const spotAttenuation = smoothstep( 0, 1, dot( lightVector.normalize(), spotDirection ).sub( spotOffset ) ).toVar();

				// Early-out: skip full BRDF if fragment is beyond the light's cutoff or outside the spot cone
				const inRange = distance.equal( 0 ).or( dot( lightVector, lightVector ).lessThanEqual( distance.mul( distance ) ) );

				If( inRange.and( spotAttenuation.greaterThan( 0 ) ), () => {

					builder.lightsNode.setupDirectLight( builder, this, directPointLight( {
						color: color.mul( spotAttenuation ),
						lightVector,
						cutoffDistance: distance,
						decayExponent: decay
					} ) );

				} );

			} );

		}, 'void' )();

	}

	/**
	 * Rounds the given size up to a multiple of the tile size.
	 *
	 * @private
	 * @param {number} value - The size.
	 * @return {number} The fitted size.
	 */
	_getBufferFitSize( value ) {

		const multiple = this.tileSize;

		return Math.ceil( value / multiple ) * multiple;

	}

	/**
	 * Sets the size of the cluster grid. Must be called outside of rendering. Not required
	 * with {@link ClusteredLighting}, which fits the grid at the beginning of each render.
	 *
	 * @param {number} width - The drawing buffer width.
	 * @param {number} height - The drawing buffer height.
	 * @return {ClusteredLightsNode} A reference to this node.
	 */
	setSize( width, height ) {

		this._resize( this._getBufferFitSize( width ), this._getBufferFitSize( height ) );

		return this;

	}

	/**
	 * Fits the cluster grid to the framebuffer of the render that is about to start. Called by
	 * {@link ClusteredLighting} before the render objects of the render are prepared. Since each
	 * render depth has its own node, no pending command buffer uses the resources of this node at
	 * this point, so a rebuild can free the replaced resources immediately.
	 */
	updateSize() {

		if ( this._renderer !== null ) this._fitToRenderer( this._renderer );

	}

	/**
	 * Creates the cluster grid on first use. While rendering, the grid is never rebuilt: the
	 * replaced resources could still be used by a command buffer that was not submitted yet.
	 *
	 * @private
	 * @param {Renderer} renderer - The renderer.
	 */
	_initGrid( renderer ) {

		this._renderer = renderer;

		if ( this._compute === null ) this._fitToRenderer( renderer );

	}

	/**
	 * Fits the cluster grid to the framebuffer the renderer is rendering to.
	 *
	 * @private
	 * @param {Renderer} renderer - The renderer.
	 */
	_fitToRenderer( renderer ) {

		// the grid must match the framebuffer being rendered: a render target (e.g. a reflector
		// with a resolution scale) can differ from the drawing buffer

		const renderTarget = renderer.getRenderTarget();

		if ( renderTarget !== null ) {

			_size.set( renderTarget.width, renderTarget.height );

		} else {

			renderer.getDrawingBufferSize( _size );

		}

		// the compute differs per backend, so a backend change requires a rebuild

		const isWebGLBackend = renderer.backend.isWebGLBackend === true;

		if ( this._compute !== null && this._isWebGLBackend !== isWebGLBackend ) this._needsRebuild = true;

		this._isWebGLBackend = isWebGLBackend;

		this._resize( this._getBufferFitSize( _size.width ), this._getBufferFitSize( _size.height ) );

	}

	/**
	 * Resizes the cluster grid. The grid dimensions are uniforms, so resizing only updates
	 * them and the compute count; the compute and the storage are rebuilt only when the
	 * storage has to grow (or the backend changed).
	 *
	 * @private
	 * @param {number} width - The fitted width.
	 * @param {number} height - The fitted height.
	 */
	_resize( width, height ) {

		if ( this._needsRebuild === false && this._bufferSize !== null && this._bufferSize.width === width && this._bufferSize.height === height ) return;

		const NX = Math.floor( width / this.tileSize );
		const NY = Math.floor( height / this.tileSize );
		const clusterCount = NX * NY * this.zSlices;

		const requiredElements = clusterCount * this._chunksPerCluster;

		if ( this._needsRebuild === true || this._compute === null || this._lightIndexes.value.array.length / 4 < requiredElements ) {

			this._create( clusterCount );

		}

		this._gridDimensions.value.set( NX, NY );
		this._compute.count = clusterCount * this._invocationsPerCluster;

		if ( this._bufferSize === null ) this._bufferSize = new Vector2();

		this._bufferSize.set( width, height );

	}

	/**
	 * Creates the light index storage, the compute node and the fragment cluster lookup.
	 * The storage is allocated with headroom so that most resizes do not need a rebuild.
	 *
	 * @private
	 * @param {number} clusterCount - The number of clusters of the current grid.
	 */
	_create( clusterCount ) {

		const { tileSize, zSlices, _chunksPerCluster: chunksPerCluster } = this;

		const NZ = zSlices;

		// grid dimensions as uniforms: shaders do not depend on the drawing buffer size

		const grid = this._gridDimensions;
		const NX = int( grid.x );
		const NY = int( grid.y );

		// Per-cluster light-index storage (ivec4 chunks), grown geometrically.

		const requiredElements = clusterCount * chunksPerCluster;
		const previousElements = this._lightIndexes !== null ? this._lightIndexes.value.array.length / 4 : 0;
		const elements = previousElements === 0 ? Math.ceil( requiredElements * 1.5 ) : Math.max( requiredElements, previousElements * 2 );

		// rebuilds only happen outside of rendering (see _initGrid()), so the replaced resources can be freed

		if ( this._compute !== null ) {

			// Replacing storage requires new material bindings. The initial allocation does not.
			this.needsUpdate = true;

			this._compute.dispose();
			this._lightIndexes.value.dispose();

		}

		// instanced storage: WebGL computes use gl_InstanceID as instanceIndex; PBO: random access in the fragment stage
		const lightIndexes = instancedArray( new Int32Array( elements * 4 ), 'ivec4' ).setPBO( true ).setName( 'lightIndexes' );

		// view-space AABB of the given cluster

		const getClusterBounds = ( clusterIndex ) => {

			// view-space scale factors derived from the projection matrix:
			//   view_x = ndc_x * (-view_z) / focal_x = ndc_x * (-view_z) * invFocalX
			//   view_y = ndc_y * (-view_z) / focal_y = ndc_y * (-view_z) * invFocalY
			// where focal_x = projMatrix[0][0] and focal_y = projMatrix[1][1].
			const invFocalX = float( 1 ).div( this._cameraProjectionMatrix.element( 0 ).element( 0 ) );
			const invFocalY = float( 1 ).div( this._cameraProjectionMatrix.element( 1 ).element( 1 ) );

			// 3D cluster coordinates
			const cx = clusterIndex.mod( NX );
			const cy = clusterIndex.div( NX ).mod( NY );
			const cz = clusterIndex.div( NX.mul( NY ) );

			// NDC X/Y bounds of the cluster.
			// Y is flipped: cy=0 is the top screen row (fragment y=0), which is NDC y=+1.
			const ndcXmin = float( cx ).mul( 2.0 ).div( grid.x ).sub( 1.0 );
			const ndcXmax = float( cx.add( int( 1 ) ) ).mul( 2.0 ).div( grid.x ).sub( 1.0 );
			const ndcYmax = float( 1 ).sub( float( cy ).mul( 2.0 ).div( grid.y ) );
			const ndcYmin = float( 1 ).sub( float( cy.add( int( 1 ) ) ).mul( 2.0 ).div( grid.y ) );

			// View-space Z bounds (negative, exponential slicing)
			const farOverNear = this._cameraFar.div( this._cameraNear );
			const zNearCluster = this._cameraNear.mul( pow( farOverNear, float( cz ).mul( 1.0 / NZ ) ) ).negate();
			const zFarCluster = this._cameraNear.mul( pow( farOverNear, float( cz.add( int( 1 ) ) ).mul( 1.0 / NZ ) ) ).negate();

			const scaleNearX = zNearCluster.negate().mul( invFocalX );
			const scaleFarX = zFarCluster.negate().mul( invFocalX );
			const scaleNearY = zNearCluster.negate().mul( invFocalY );
			const scaleFarY = zFarCluster.negate().mul( invFocalY );

			const xMinNear = ndcXmin.mul( scaleNearX );
			const xMaxNear = ndcXmax.mul( scaleNearX );
			const xMinFar = ndcXmin.mul( scaleFarX );
			const xMaxFar = ndcXmax.mul( scaleFarX );

			const yMinNear = ndcYmin.mul( scaleNearY );
			const yMaxNear = ndcYmax.mul( scaleNearY );
			const yMinFar = ndcYmin.mul( scaleFarY );
			const yMaxFar = ndcYmax.mul( scaleFarY );

			// AABB of the 8 view-space corners (tile boundaries can straddle the view axis)
			const aabbMinX = min( xMinNear, xMinFar );
			const aabbMaxX = max( xMaxNear, xMaxFar );
			const aabbMinY = min( yMinNear, yMinFar );
			const aabbMaxY = max( yMaxNear, yMaxFar );

			const aabbMin = vec3( aabbMinX, aabbMinY, zFarCluster );
			const aabbMax = vec3( aabbMaxX, aabbMaxY, zNearCluster );

			return { cz, aabbMin, aabbMax };

		};

		// sphere-AABB intersection in view space

		const intersectsCluster = ( lightIdx, aabbMin, aabbMax ) => {

			const { center, radius } = this._getLightBounds( lightIdx );

			const closest = max( aabbMin, min( center, aabbMax ) );
			const diff = center.sub( closest );
			const distSq = dot( diff, diff );

			return radius.lessThan( 0 ).or( distSq.lessThanEqual( radius.mul( radius ) ) );

		};

		// Each invocation fills `chunksPerInvocation` ivec4 chunks of one cluster. WebGL computes
		// run via transform feedback and can only write their own element, so there each
		// invocation fills a single chunk; WebGPU uses one invocation per cluster.

		const chunksPerInvocation = this._isWebGLBackend ? 1 : chunksPerCluster;
		const invocationsPerCluster = chunksPerCluster / chunksPerInvocation;

		this._invocationsPerCluster = invocationsPerCluster;

		const compute = Fn( () => {

			const clusterIndex = int( instanceIndex.div( invocationsPerCluster ) );
			const firstChunk = int( instanceIndex.mod( invocationsPerCluster ) ).mul( chunksPerInvocation );
			const firstSlot = firstChunk.mul( 4 );
			const lastSlot = firstSlot.add( chunksPerInvocation * 4 );

			const { cz, aabbMin, aabbMax } = getClusterBounds( clusterIndex );

			const chunks = ivec4( 0 ).toArray( chunksPerInvocation ).toVar();
			const index = int( 0 ).toVar();

			// Z-culling: only test lights that can reach this cluster's Z-slice
			const zRange = textureLoad( this._zSliceRangesTexture, ivec2( cz, 0 ) );
			const rangeStart = int( zRange.x );
			const rangeEnd = int( zRange.y );

			Loop( this.maxLights, ( { i } ) => {

				const lightIdx = rangeStart.add( i );

				If( index.greaterThanEqual( lastSlot ).or( lightIdx.greaterThanEqual( rangeEnd ) ), () => {

					Break();

				} );

				If( intersectsCluster( lightIdx, aabbMin, aabbMax ), () => {

					// slots before firstSlot belong to other invocations of this cluster
					If( index.greaterThanEqual( firstSlot ), () => {

						const slot = index.sub( firstSlot );

						chunks.element( slot.div( 4 ) ).element( slot.mod( 4 ) ).assign( lightIdx.add( int( 1 ) ) );

					} );

					index.addAssign( int( 1 ) );

				} );

			} );

			const firstElement = clusterIndex.mul( chunksPerCluster ).add( firstChunk );

			const writeChunks = () => {

				Loop( chunksPerInvocation, ( { i } ) => {

					lightIndexes.element( firstElement.add( i ) ).assign( chunks.element( i ) );

				} );

			};

			if ( this._isWebGLBackend === true ) {

				// WebGL binds the transform feedback buffers per compute program, and programs are shared by
				// identical code. The (always true) capacity and node id constants give each node and storage
				// allocation its own program, so a compute never writes to the storage of another one.

				If( firstElement.lessThan( int( elements ) ).and( int( this.id ).notEqual( int( - 1 ) ) ), writeChunks );

			} else {

				writeChunks();

			}

		} )().compute( clusterCount * invocationsPerCluster ).setName( 'Update Clustered Lights' );

		// shading-side: fragment → cluster index

		const getScreenClusterIndex = Fn( () => {

			const screenTile = screenCoordinate.div( tileSize ).floor();

			// view-space depth from positionView (negative in front); take magnitude
			const viewDepth = positionView.z.negate();

			// exponential Z slice: tz = floor( log(depth/near) / log(far/near) * NZ )
			const invLogFarOverNear = float( 1 ).div( log( this._cameraFar.div( this._cameraNear ) ) );
			const sliceFloat = log( viewDepth.div( this._cameraNear ) ).mul( invLogFarOverNear ).mul( float( NZ ) );
			const zSlice = clamp( sliceFloat.floor(), float( 0 ), float( NZ - 1 ) );

			return int( screenTile.x )
				.add( int( screenTile.y ).mul( NX ) )
				.add( int( zSlice ).mul( NX.mul( NY ) ) );

		} );

		const screenClusterIndex = getScreenClusterIndex().toVar();

		// assigns

		this._lightIndexes = lightIndexes;
		this._screenClusterIndex = screenClusterIndex;
		this._compute = compute;
		this._needsRebuild = false;

	}

	/**
	 * Frees the GPU resources allocated by this node.
	 */
	dispose() {

		if ( this._compute !== null ) this._compute.dispose();
		if ( this._lightIndexes !== null ) this._lightIndexes.value.dispose();

		this._lightsTexture.dispose();
		this._zSliceRangesTexture.dispose();

		super.dispose();

	}

}

export default ClusteredLightsNode;

/**
 * TSL function that creates a clustered lights node.
 *
 * @tsl
 * @function
 * @param {number} [maxLights=1024] - Maximum number of point and spot lights.
 * @param {number} [tileSize=32] - Screen tile size in pixels.
 * @param {number} [zSlices=24] - Depth slice count.
 * @param {number} [maxLightsPerCluster=64] - Per-cluster light-list capacity.
 * @return {ClusteredLightsNode} The clustered lights node.
 */
export const clusteredLights = /*@__PURE__*/ nodeProxy( ClusteredLightsNode );
