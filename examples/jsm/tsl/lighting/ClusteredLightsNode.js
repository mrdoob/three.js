import { DataTexture, FloatType, RGBAFormat, Vector2, Vector3, LightsNode, NodeUpdateType } from 'three/webgpu';

import {
	attributeArray, nodeProxy, int, float, vec3, vec4, ivec2, ivec4, uniform, Break, Loop, positionView,
	Fn, If, Return, textureLoad, instanceIndex, screenCoordinate, directPointLight,
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

		this.materialLights = [];
		this.clusteredLights = [];

		this.maxLights = maxLights;
		this.tileSize = tileSize;
		this.zSlices = zSlices;
		this.maxLightsPerCluster = maxLightsPerCluster;

		this._chunksPerCluster = Math.ceil( maxLightsPerCluster / 4 );

		this._bufferSize = null;
		this._lightIndexes = null;
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
	 * including the cluster grid into the cache key.
	 *
	 * @return {number} The custom cache key.
	 */
	customCacheKey() {

		return ( this._compute ? this._compute.getCacheKey() : 0 ) + super.customCacheKey();

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

		this._updateProgram( renderer );

		this._updateLightsTexture( camera );

		this._cameraNear.value = camera.near;
		this._cameraFar.value = camera.far;
		this._cameraViewMatrix.value = camera.matrixWorldInverse;
		this._cameraProjectionMatrix.value = camera.projectionMatrix;

		renderer.compute( this._compute );

	}

	/**
	 * Configures this node with an array of lights. Point and spot lights without
	 * shadows are clustered (except spot lights with projected textures), all other
	 * lights use the default lighting.
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

		if ( light.castShadow === true ) return false;

		if ( light.isPointLight === true ) return true;

		return light.isSpotLight === true && ! light.map && ! light.colorNode;

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

		this._updateProgram( builder.renderer );

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
	 * Sets the size of the cluster grid. Must be called with the new drawing buffer
	 * size whenever the renderer is resized.
	 *
	 * @param {number} width - The drawing buffer width.
	 * @param {number} height - The drawing buffer height.
	 * @return {ClusteredLightsNode} A reference to this node.
	 */
	setSize( width, height ) {

		width = this._getBufferFitSize( width );
		height = this._getBufferFitSize( height );

		if ( ! this._bufferSize || this._bufferSize.width !== width || this._bufferSize.height !== height ) {

			const lightIndexes = this._lightIndexes;

			this._create( width, height );

			// dispose storage if light indices have changed

			if ( lightIndexes !== null && lightIndexes !== this._lightIndexes ) lightIndexes.value.dispose();

		}

		return this;

	}

	/**
	 * Creates the cluster grid on first use and recreates it when the drawing buffer size changes.
	 *
	 * @private
	 * @param {Renderer} renderer - The renderer.
	 */
	_updateProgram( renderer ) {

		renderer.getDrawingBufferSize( _size );

		const width = this._getBufferFitSize( _size.width );
		const height = this._getBufferFitSize( _size.height );

		if ( this._bufferSize === null ) {

			this._create( width, height );

		} else if ( this._bufferSize.width !== width || this._bufferSize.height !== height ) {

			this._create( width, height );

		}

	}

	/**
	 * Creates the cluster grid, the light index storage and the compute node for the given size.
	 *
	 * @private
	 * @param {number} width - The fitted width.
	 * @param {number} height - The fitted height.
	 */
	_create( width, height ) {

		const { tileSize, zSlices, maxLightsPerCluster, _chunksPerCluster: chunksPerCluster } = this;

		const bufferSize = new Vector2( width, height );

		const NX = Math.floor( bufferSize.width / tileSize );
		const NY = Math.floor( bufferSize.height / tileSize );
		const NZ = zSlices;
		const clusterCount = NX * NY * NZ;

		this._gridDimensions.value.set( NX, NY );

		// release the compute pipeline and bindings built for the previous grid

		if ( this._compute !== null ) this._compute.dispose();

		// Per-cluster light-index storage (ivec4 chunks).

		const lightIndexesLength = clusterCount * chunksPerCluster * 4;

		let lightIndexes = this._lightIndexes;

		if ( lightIndexes === null || lightIndexes.value.array.length < lightIndexesLength ) {

			const lightIndexesArray = new Int32Array( lightIndexesLength );
			lightIndexes = attributeArray( lightIndexesArray, 'ivec4' ).setName( 'lightIndexes' );

		}

		// compute-side accessors (use instanceIndex)

		const getClusterChunk = ( chunkIdx ) => {

			const idx = instanceIndex.mul( int( chunksPerCluster ) ).add( int( chunkIdx ) );

			return lightIndexes.element( idx );

		};

		const getClusterSlot = ( slotIdx ) => {

			slotIdx = int( slotIdx );

			const stride = int( 4 );
			const chunkOffset = slotIdx.div( stride );
			const idx = instanceIndex.mul( int( chunksPerCluster ) ).add( chunkOffset );

			return lightIndexes.element( idx ).element( slotIdx.mod( stride ) );

		};

		// compute: one thread per cluster

		const compute = Fn( () => {

			// view-space scale factors derived from the projection matrix:
			//   view_x = ndc_x * (-view_z) / focal_x = ndc_x * (-view_z) * invFocalX
			//   view_y = ndc_y * (-view_z) / focal_y = ndc_y * (-view_z) * invFocalY
			// where focal_x = projMatrix[0][0] and focal_y = projMatrix[1][1].
			const invFocalX = float( 1 ).div( this._cameraProjectionMatrix.element( 0 ).element( 0 ) );
			const invFocalY = float( 1 ).div( this._cameraProjectionMatrix.element( 1 ).element( 1 ) );

			// 3D cluster coordinates from instanceIndex
			const cx = instanceIndex.mod( NX );
			const cy = instanceIndex.div( NX ).mod( NY );
			const cz = instanceIndex.div( NX * NY );

			// NDC X/Y bounds of the cluster.
			// Y is flipped: cy=0 is the top screen row (fragment y=0), which is NDC y=+1.
			const ndcXmin = float( cx ).mul( 2.0 / NX ).sub( 1.0 );
			const ndcXmax = float( cx.add( int( 1 ) ) ).mul( 2.0 / NX ).sub( 1.0 );
			const ndcYmax = float( 1 ).sub( float( cy ).mul( 2.0 / NY ) );
			const ndcYmin = float( 1 ).sub( float( cy.add( int( 1 ) ) ).mul( 2.0 / NY ) );

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

			// clear stale data from previous frame
			Loop( chunksPerCluster, ( { i } ) => {

				getClusterChunk( i ).assign( ivec4( 0 ) );

			} );

			const index = int( 0 ).toVar();

			// Z-culling: only test lights that can reach this cluster's Z-slice
			const zRange = textureLoad( this._zSliceRangesTexture, ivec2( cz, 0 ) );
			const rangeStart = int( zRange.x );
			const rangeEnd = int( zRange.y );

			Loop( this.maxLights, ( { i } ) => {

				const lightIdx = rangeStart.add( i );

				If( index.greaterThanEqual( int( maxLightsPerCluster ) ).or( lightIdx.greaterThanEqual( rangeEnd ) ), () => {

					Return();

				} );

				const { center, radius } = this._getLightBounds( lightIdx );

				// sphere-AABB intersection in view space
				const closest = max( aabbMin, min( center, aabbMax ) );
				const diff = center.sub( closest );
				const distSq = dot( diff, diff );

				If( radius.lessThan( 0 ).or( distSq.lessThanEqual( radius.mul( radius ) ) ), () => {

					getClusterSlot( index ).assign( lightIdx.add( int( 1 ) ) );
					index.addAssign( int( 1 ) );

				} );

			} );

		} )().compute( clusterCount ).setName( 'Update Clustered Lights' );

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
				.add( int( screenTile.y ).mul( int( NX ) ) )
				.add( int( zSlice ).mul( int( NX * NY ) ) );

		} );

		const screenClusterIndex = getScreenClusterIndex().toVar();

		// assigns

		this._bufferSize = bufferSize;
		this._lightIndexes = lightIndexes;
		this._screenClusterIndex = screenClusterIndex;
		this._compute = compute;

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
