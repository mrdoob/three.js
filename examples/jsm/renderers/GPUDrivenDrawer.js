import {
	Drawer,
	OptimizedDrawer,
	IndexNode,
	RenderTarget,
	DepthTexture,
	Scene,
	StorageBufferAttribute,
	IndirectStorageBufferAttribute,
	BufferGeometry,
	Float32BufferAttribute,
	Mesh,
	Sphere,
	Vector2,
	Vector3,
	Vector4,
	Matrix4,
	FrontSide,
	BackSide,
	NoBlending,
	VSMShadowMap,
	NodeMaterial,
	MeshBasicNodeMaterial
} from 'three/webgpu';

import {
	Fn, If, Loop, vec3, vec4, uvec4, int, uint, float, max, min, clamp, ceil, log2, select, dot, bool, distance, length, normalize, textureLoad, ivec2,
	storage, uniform, uniformArray, instanceIndex, vertexIndex, varying, context as contextNode, overrideNodes, Return,
	modelWorldMatrix, modelWorldMatrixInverse, modelNormalMatrix, modelPosition, modelViewPosition, mat3,
	positionLocal, positionPrevious, normalLocal, transformNormal, velocity,
	cameraViewMatrix, atomicAdd, atomicStore
} from 'three/tsl';

import { createClusters, ready as clusterProcessingReady, CLUSTER_SIZE } from '../utils/ClusterGeometryUtils.js';

const MAX_INSTANCES = 1 << 20;
const MAX_WORK_ITEMS = 1 << 20;
const MAX_UNUSED_PROJECTIONS = 60;

// the shared attribute of the vertex pulling geometries, the number of vertices limits the hardware draws of the visibility buffer drawer

const PULLED_VERTICES = 65536 * 3;

// node material properties which change the geometry, the coverage or the output of the draw

const UNSUPPORTED_NODES = [
	'vertexNode', 'geometryNode', 'depthNode', 'fragmentNode', 'outputNode',
	'contextNode', 'backdropNode', 'backdropAlphaNode', 'alphaTestNode', 'castShadowNode', 'maskShadowNode'
];

const _sphere = /*@__PURE__*/ new Sphere();
const _size = /*@__PURE__*/ new Vector2();
const _vector4 = /*@__PURE__*/ new Vector4();
const _cameraPosition = /*@__PURE__*/ new Vector3();

// the distance range of objects which are not levels of LOD objects

const NO_LEVEL_DISTANCE = 3.4e38;
const _instanceMatrix = /*@__PURE__*/ new Matrix4();
const _matrix = /*@__PURE__*/ new Matrix4();

// the instance index of the draws, a distinct node from the instance index of materials, which is
// replaced by the index of the drawn instance of an instanced mesh

const drawInstanceIndex = /*@__PURE__*/ new IndexNode( IndexNode.INSTANCE );

// returns the components of a vec4 node used by an attribute of the given item size

const swizzle = ( node, itemSize ) => itemSize === 1 ? node.x : itemSize === 2 ? node.xy : itemSize === 3 ? node.xyz : node;

let _pulledPositionAttribute = null;

// hashes an id into a bright color

const hashColor = /*@__PURE__*/ Fn( ( [ id ] ) => {

	const hash = uint( id ).mul( uint( 747796405 ) ).add( uint( 289559509 ) ).toVar();

	hash.assign( hash.shiftRight( 16 ).bitXor( hash ).mul( uint( 277803737 ) ) );
	hash.assign( hash.shiftRight( 16 ).bitXor( hash ) );

	const r = float( hash.bitAnd( uint( 255 ) ) ).div( 255.0 );
	const g = float( hash.shiftRight( 8 ).bitAnd( uint( 255 ) ) ).div( 255.0 );
	const b = float( hash.shiftRight( 16 ).bitAnd( uint( 255 ) ) ).div( 255.0 );

	return vec4( r.mul( 0.8 ).add( 0.2 ), g.mul( 0.8 ).add( 0.2 ), b.mul( 0.8 ).add( 0.2 ), 1.0 );

} );

/**
 * Creates an unlit material which colors each cluster of each object differently.
 *
 * @private
 * @param {Node<uint>} cluster - The cluster index.
 * @param {Node<uint>} instance - The object index in the batch.
 * @return {MeshBasicNodeMaterial} The debug material.
 */
function createDebugMaterial( cluster, instance ) {

	const material = new MeshBasicNodeMaterial();
	material.colorNode = hashColor( cluster.add( instance.mul( 7919 ) ) );
	material.toneMapped = false;
	material.fog = false;

	return material;

}

/**
 * Creates the node material that draws the merged objects. Node materials are cloned so they keep
 * their node graph, other materials are converted like the renderer does without sharing listeners.
 *
 * @private
 * @param {Material} source - The material of the merged objects.
 * @param {Renderer} renderer - The renderer.
 * @return {NodeMaterial} The node material.
 */
function createDrawMaterial( source, renderer ) {

	if ( source.isNodeMaterial === true ) return source.clone();

	const NodeMaterialClass = renderer.library.getMaterialNodeClass( source.type );
	const material = new NodeMaterialClass();

	for ( const key in source ) {

		if ( key === '_listeners' || key === 'uuid' ) continue;

		material[ key ] = source[ key ];

	}

	return material;

}

/**
 * Returns `true` if objects with the given material can be drawn by the GPU-driven pipeline. The material
 * must be opaque and its nodes must not change the geometry, the coverage or the output of the draw.
 *
 * @private
 * @param {Material} material - The material.
 * @param {Renderer} renderer - The renderer.
 * @return {boolean} Whether the material is supported or not.
 */
function isSupportedMaterial( material, renderer ) {

	if ( material.isNodeMaterial !== true && renderer.library.getMaterialNodeClass( material.type ) === null ) return false;

	if ( material.transparent === true || material.transmission > 0 || material.alphaTest > 0 || material.alphaHash === true || material.alphaToCoverage === true ) return false;
	if ( material.side !== FrontSide || material.vertexColors === true || material.flatShading === true || material.wireframe === true ) return false;
	if ( material.displacementMap ) return false;
	if ( material.clippingPlanes !== null && material.clippingPlanes.length > 0 ) return false;
	if ( material.depthTest === false || material.depthWrite === false || material.colorWrite === false || material.polygonOffset === true ) return false;

	for ( const key in material ) {

		const value = material[ key ];

		if ( value !== null && typeof value === 'object' && value.isTexture === true && value.channel !== 0 ) return false;

	}

	if ( material.isNodeMaterial === true ) {

		for ( const key of UNSUPPORTED_NODES ) {

			if ( material[ key ] !== null && material[ key ] !== undefined ) return false;

		}

	}

	return true;

}

/**
 * Returns the key of an entry of objects sharing geometry and material.
 *
 * @private
 * @param {boolean} receiveShadow - Whether the objects receive shadows.
 * @param {boolean} instanced - Whether the objects are instanced meshes.
 * @param {?Material} farMaterial - The material beyond the switch distance of merged levels.
 * @return {string} The key.
 */
function getEntryKey( receiveShadow, instanced, farMaterial ) {

	return ( receiveShadow ? 1 : 0 ) + ( instanced ? 2 : 0 ) + ( farMaterial !== null ? ':' + farMaterial.id : '' );

}

/**
 * Returns `true` if the given object can be drawn by the GPU-driven pipeline. The instances of instanced
 * meshes are drawn as objects of the batch.
 *
 * @private
 * @param {Object3D} object - The 3D object.
 * @param {BufferGeometry} geometry - The geometry.
 * @param {?Object} group - The geometry group.
 * @return {boolean} Whether the object is supported or not.
 */
function isSupportedObject( object, geometry, group ) {

	if ( object.isMesh !== true || object.isSkinnedMesh === true || object.isBatchedMesh === true ) return false;
	if ( group !== null || Array.isArray( object.material ) || object.occlusionTest === true ) return false;

	if ( object.isInstancedMesh === true ) {

		// the instances are drawn as objects of the batch. instance matrices written on the GPU and instance colors are not supported

		if ( object.instanceMatrix.isStorageInstancedBufferAttribute === true || object.instanceColor !== null || object.morphTexture !== null || object.count === 0 ) return false;

	} else if ( object.count > 1 ) {

		return false;

	}

	if ( object.morphTargetInfluences !== undefined && object.morphTargetInfluences.length > 0 ) return false;
	if ( object.onBeforeRender !== Mesh.prototype.onBeforeRender || object.onAfterRender !== Mesh.prototype.onAfterRender ) return false;

	// the rasterizer culls back faces by winding, mirrored objects would flip it

	if ( object.matrixWorld.determinant() <= 0 ) return false;

	const { position, normal } = geometry.attributes;

	if ( position === undefined || normal === undefined || position.itemSize !== 3 ) return false;
	if ( geometry.drawRange.start !== 0 || geometry.drawRange.count !== Infinity ) return false;
	if ( Object.keys( geometry.morphAttributes ).length > 0 ) return false;

	return true;

}


// the maximum number of levels of the hierarchical depth, enough for 65536 pixels

const MAX_HZB_LEVELS = 16;

/**
 * Creates the occlusion data of a view: the depth of the clusters visible in the last frame and its
 * hierarchical depth. Each level stores the maximum depth of 2x2 texels of the previous level, the first
 * level covers 2x2 pixels. The levels are stored in one storage buffer.
 *
 * @private
 * @param {number} width - The width of the view in pixels.
 * @param {number} height - The height of the view in pixels.
 * @return {Object} The occlusion data.
 */
function createOcclusion( width, height ) {

	const depthTexture = new DepthTexture( width, height );
	const target = new RenderTarget( width, height, { depthTexture } );

	const levels = [];

	let levelWidth = width;
	let levelHeight = height;
	let size = 0;

	do {

		levelWidth = Math.ceil( levelWidth / 2 );
		levelHeight = Math.ceil( levelHeight / 2 );

		levels.push( { offset: size, width: levelWidth, height: levelHeight } );

		size += levelWidth * levelHeight;

	} while ( levelWidth > 1 || levelHeight > 1 );

	const hzbAttribute = new StorageBufferAttribute( new Float32Array( size ), 1 );
	const hzbWrite = storage( hzbAttribute, 'float', size );

	// the texels at the border cover the remaining pixels, so odd sizes stay conservative

	const computeNodes = levels.map( ( level, i ) => {

		const source = i > 0 ? levels[ i - 1 ] : { offset: 0, width, height };

		return Fn( () => {

			If( instanceIndex.lessThan( level.width * level.height ), () => {

				const x = instanceIndex.mod( level.width );
				const y = instanceIndex.div( level.width );

				const depth = float( 0 ).toVar();

				for ( let j = 0; j < 4; j ++ ) {

					const sourceX = min( x.mul( 2 ).add( j & 1 ), uint( source.width - 1 ) );
					const sourceY = min( y.mul( 2 ).add( j >> 1 ), uint( source.height - 1 ) );

					const value = i === 0 ? textureLoad( depthTexture, ivec2( sourceX, sourceY ) ).x : hzbWrite.element( sourceY.mul( source.width ).add( sourceX ).add( source.offset ) );

					depth.assign( max( depth, value ) );

				}

				hzbWrite.element( instanceIndex.add( level.offset ) ).assign( depth );

			} );

		} )().compute( level.width * level.height ).setName( 'GPUDrivenDrawer HZB' );

	} );

	const levelData = [];

	for ( let i = 0; i < MAX_HZB_LEVELS; i ++ ) {

		const level = levels[ Math.min( i, levels.length - 1 ) ];

		levelData.push( new Vector4( level.offset, level.width, level.height, 0 ) );

	}

	return {
		target,
		scene: new Scene(),
		hzb: storage( hzbAttribute, 'float', size ).toReadOnly(),
		hzbLevels: uniformArray( levelData, 'vec4' ),
		hzbLevelCount: uniform( levels.length, 'uint' ),
		hzbSize: uniform( new Vector2( width, height ) ),
		computeNodes,
		dispose() {

			for ( const computeNode of computeNodes ) computeNode.dispose();

			target.dispose();
			depthTexture.dispose();
			hzbAttribute.dispose();

		}
	};

}

/**
 * All objects of one render list sharing geometry and material, drawn by one GPU-driven pipeline: GPU
 * culling and level of detail selection per object and cluster, and one indirect draw of the visible
 * clusters through the hardware rasterizer. Subclasses can replace the draw by overriding `setupDraw()`.
 *
 * @private
 */
class GPUDrivenBatch {

	/**
	 * Constructs a new batch.
	 *
	 * @param {Object} clusters - The cluster data of the geometry.
	 * @param {Material} material - The material of the objects.
	 * @param {boolean} receiveShadow - Whether the objects receive shadows.
	 * @param {number} capacity - The maximum number of objects.
	 * @param {Renderer} renderer - The renderer.
	 * @param {Object} [parameters] - The configuration parameter.
	 * @param {boolean} [parameters.debug=false] - Whether the clusters are shown instead of the material.
	 * @param {number} [parameters.lodCount=clusters.lodCount] - The number of levels of detail used.
	 * @param {?Object} [parameters.view=null] - The view of the render list, if the draw needs one.
	 * @param {boolean} [parameters.shadow=false] - Whether the batch draws the shadow casters of a shadow pass.
	 * @param {?Object} [parameters.occlusion=null] - The occlusion data of the view, if the clusters are occlusion culled.
	 * @param {boolean} [parameters.depthPrepass=false] - Whether the depth of the clusters is drawn before the material.
	 * @param {boolean} [parameters.instanced=false] - Whether the objects are instanced meshes, whose instances are drawn as objects.
	 * @param {?Material} [parameters.farMaterial=null] - The material of the objects beyond their switch distance, the levels of
	 * LOD objects sharing the geometry. Shadow casters ignore it.
	 */
	constructor( clusters, material, receiveShadow, capacity, renderer, { debug = false, lodCount = clusters.lodCount, view = null, shadow = false, occlusion = null, depthPrepass = false, instanced = false, farMaterial = null } = {} ) {

		this.clusters = clusters;
		this.material = material;
		this.materialVersion = material.version;
		this.farMaterial = shadow === false ? farMaterial : null;
		this.farMaterialVersion = farMaterial !== null ? farMaterial.version : - 1;
		this.debug = debug;
		this.shadow = shadow;
		this.occlusion = occlusion;
		this.depthPrepass = depthPrepass;
		this.instanced = instanced;
		this.capacity = capacity;
		this.count = 0;
		this.view = view;

		this.attributes = [];
		this.ownedGeometries = [];
		this.meshes = [];

		const createAttribute = ( array, itemSize, Type = StorageBufferAttribute ) => {

			const attribute = new Type( array, itemSize );
			this.attributes.push( attribute );

			return attribute;

		};

		const { position, normal, uv: vertexUv, indexBuffer, chunkBounds: getChunkBounds, chunkCone: getChunkCone, lodOffsets, maxChunks } = clusters;

		// the world matrices of the draw are followed by the matrices of the previous frame, for the velocity
		// of temporal effects like TRAA. shadow casters don't need them

		const history = shadow === false;
		const worldCapacity = history === true ? capacity * 2 : capacity;

		this.history = history;

		// per-object data

		this.instanceWorldArray = new Float32Array( ( instanced === true ? capacity : worldCapacity ) * 16 );
		this.instanceBoundsArray = new Float32Array( capacity * 4 );

		this.instanceWorldAttribute = createAttribute( this.instanceWorldArray, 16 );
		this.instanceBoundsAttribute = createAttribute( this.instanceBoundsArray, 4 );

		const instanceWorld = storage( this.instanceWorldAttribute, 'mat4', instanced === true ? capacity : worldCapacity ).toReadOnly();
		const instanceBounds = storage( this.instanceBoundsAttribute, 'vec4', capacity ).toReadOnly();
		const instanceMvp = storage( createAttribute( new Float32Array( capacity * 16 ), 16 ), 'mat4', capacity );

		// levels of LOD objects: the position of the LOD object and the distance range of the level

		this.instanceLevelArray = new Float32Array( capacity * 8 );
		this.instanceLevelAttribute = createAttribute( this.instanceLevelArray, 4 );

		const instanceLevel = storage( this.instanceLevelAttribute, 'vec4', capacity * 2 ).toReadOnly();

		// instanced meshes: the world matrix of the mesh and the matrix of the instance, like the regular instancing
		// of node materials, and per instance its index and the instanced attributes of the geometry

		let objectWorld = null;
		let instanceLocal = null;
		let instanceData = null;

		this.instanceDataStride = 1 + clusters.instancedAttributes.length;

		if ( instanced === true ) {

			const stride = this.instanceDataStride;

			this.objectWorldArray = new Float32Array( worldCapacity * 16 );
			this.instanceLocalArray = new Float32Array( worldCapacity * 16 );
			this.instanceDataArray = new Float32Array( capacity * stride * 4 );

			this.objectWorldAttribute = createAttribute( this.objectWorldArray, 16 );
			this.instanceLocalAttribute = createAttribute( this.instanceLocalArray, 16 );
			this.instanceDataAttribute = createAttribute( this.instanceDataArray, 4 );

			objectWorld = storage( this.objectWorldAttribute, 'mat4', worldCapacity ).toReadOnly();
			instanceLocal = storage( this.instanceLocalAttribute, 'mat4', worldCapacity ).toReadOnly();
			instanceData = storage( this.instanceDataAttribute, 'vec4', capacity * stride ).toReadOnly();

		}

		this.historyAttributes = history === false ? [] : instanced === true ? [ this.objectWorldAttribute, this.instanceLocalAttribute ] : [ this.instanceWorldAttribute ];
		this.historyPending = false;

		// camera

		this.projScreenMatrix = uniform( new Matrix4() );
		this.frustumPlanes = uniformArray( [ new Vector4(), new Vector4(), new Vector4(), new Vector4(), new Vector4(), new Vector4() ], 'vec4' );
		this.cameraPosition = uniform( new Vector3() );

		// the view selecting the level of detail, orthographic views select it independent of the distance

		this.lodPosition = uniform( new Vector3() );
		this.lodScale = uniform( 1.0 );
		this.lodPerspective = uniform( 1.0 );
		this.cameraZoom = uniform( 1.0 );

		// position nodes can move the vertices out of the bounds of the clusters

		this.deformed = material.isNodeMaterial === true && material.positionNode !== null && material.positionNode !== undefined;
		this.boundsMargin = uniform( 0.0 );

		const { boundsMargin } = this;
		this.viewSize = uniform( new Vector2() );
		this.lodThreshold = uniform( 1.0 );

		const { projScreenMatrix, frustumPlanes, cameraPosition, lodPosition, lodScale, lodPerspective, viewSize, lodThreshold } = this;

		// work queue — one item is a cluster of one visible object

		const maxWorkItemCount = Math.min( capacity * maxChunks, MAX_WORK_ITEMS );
		const maxWorkItems = uniform( maxWorkItemCount, 'uint' );

		// objects beyond the switch distance of the far material have their own queue, after the first one

		const far = this.farMaterial !== null;
		const queueCount = far === true ? 2 : 1;

		const workQueueCountAttribute = createAttribute( new Uint32Array( queueCount ), 1 );
		const workQueueCountAtomic = storage( workQueueCountAttribute, 'uint', queueCount ).toAtomic();
		const workQueueCountRead = storage( workQueueCountAttribute, 'uint', queueCount ).toReadOnly();
		const workQueue = storage( createAttribute( new Uint32Array( maxWorkItemCount * queueCount * 4 ), 4 ), 'uvec4', maxWorkItemCount * queueCount );

		const computeReset = Fn( () => {

			atomicStore( workQueueCountAtomic.element( 0 ), uint( 0 ) );

			if ( far === true ) atomicStore( workQueueCountAtomic.element( 1 ), uint( 0 ) );

		} )().compute( 1 ).setName( 'GPUDrivenDrawer Reset' );

		// culling, level of detail and work allocation in two passes: one thread per object selects the
		// level of detail, then one thread per object and cluster tests the clusters — a loop over all clusters
		// per object would leave the GPU idle for few objects with many clusters

		const boundingRadius = uniform( clusters.boundingSphere.radius );
		const lodLevels = uniform( lodCount, 'uint' );
		const clustersPerObject = uniform( maxChunks, 'uint' );

		// the selected level of each object, or CULLED if the object is outside of the frustum

		const CULLED = 255;
		const LOD_MASK = 255;
		const OCCLUDED = 256;
		const FAR = 512;
		const instanceLod = storage( createAttribute( new Uint32Array( capacity ), 1 ), 'uint', capacity );

		const computeCull = Fn( () => {

			const bounds = instanceBounds.element( instanceIndex );
			const center = bounds.xyz;
			const scale = bounds.w.abs();
			const radius = scale.mul( boundingRadius ).add( boundsMargin );

			const visible = bool( true ).toVar();

			Loop( { start: 0, end: 6 }, ( { i } ) => {

				const plane = frustumPlanes.element( i );

				If( dot( plane.xyz, center ).add( plane.w ).lessThan( radius.negate() ), () => {

					visible.assign( false );

				} );

			} );

			// the level of a LOD object is selected by the distance of the camera to the LOD object, like LOD.update()

			const levelData = instanceLevel.element( instanceIndex.mul( 2 ) );
			const levelFar = instanceLevel.element( instanceIndex.mul( 2 ).add( 1 ) ).x;
			const levelDistance = distance( cameraPosition, levelData.xyz ).div( this.cameraZoom );

			If( levelDistance.lessThan( levelData.w ).or( levelDistance.greaterThanEqual( levelFar ) ), () => {

				visible.assign( false );

			} );

			const lodLevel = uint( CULLED ).toVar();

			If( visible, () => {

				// screen-space projected error: pixelError = errorWorld / dist * cotHalfFov * screenHeight / 2,
				// orthographic views: pixelError = errorWorld * 2 / frustumHeight * screenHeight / 2

				const lodDistance = select( lodPerspective.greaterThan( 0.5 ), max( 0.01, distance( lodPosition, center ) ), float( 1.0 ) );
				const pixelFactor = lodScale.div( lodDistance );

				// the errors grow with the level, so the last level within the threshold is the simplest acceptable one

				lodLevel.assign( 0 );

				Loop( { name: 'lod', type: 'uint', start: uint( 1 ), end: lodLevels, condition: '<' }, ( { lod } ) => {

					If( lodOffsets.element( lod ).w.mul( scale ).mul( pixelFactor ).lessThanEqual( lodThreshold ), () => {

						lodLevel.assign( lod );

					} );

				} );

				instanceMvp.element( instanceIndex ).assign( projScreenMatrix.mul( instanceWorld.element( instanceIndex ) ) );

				// the far material beyond the switch distance

				if ( far === true ) {

					If( levelDistance.greaterThanEqual( instanceLevel.element( instanceIndex.mul( 2 ).add( 1 ) ).y ), () => {

						lodLevel.assign( lodLevel.bitOr( FAR ) );

					} );

				}

			} );

			instanceLod.element( instanceIndex ).assign( lodLevel );

		} )().compute( capacity ).setName( 'GPUDrivenDrawer Cull' );

		// occlusion culling in two phases: the first phase draws the clusters visible in the last frame, which
		// are rendered into the depth of the occlusion view. the second phase tests all clusters against the
		// hierarchical depth of this depth and adds the newly visible clusters. a cluster stores its level of
		// detail + 1 if it was visible, the clusters of another level are tested in the second phase

		const clusterVisibility = occlusion !== null ? storage( createAttribute( new Uint32Array( capacity * maxChunks ), 1 ), 'uint', capacity * maxChunks ) : null;

		// returns true if the sphere is behind the hierarchical depth, the matrix projects the space of the sphere

		const isOccluded = ( mvp, sphere ) => {

			const { hzb, hzbLevels, hzbLevelCount, hzbSize } = occlusion;

			const minX = float( 1e9 ).toVar(), minY = float( 1e9 ).toVar(), minZ = float( 1e9 ).toVar();
			const maxX = float( - 1e9 ).toVar(), maxY = float( - 1e9 ).toVar();
			const behind = bool( false ).toVar();

			// the corners of the box around the sphere bound its projection

			for ( let i = 0; i < 8; i ++ ) {

				const corner = vec3( i & 1 ? 1 : - 1, i & 2 ? 1 : - 1, i & 4 ? 1 : - 1 ).mul( sphere.w ).add( sphere.xyz );
				const clip = mvp.mul( vec4( corner, 1.0 ) ).toVar();

				If( clip.w.lessThanEqual( 0.0 ), () => {

					behind.assign( true );

				} ).Else( () => {

					const ndc = clip.xyz.div( clip.w );

					minX.assign( min( minX, ndc.x ) );
					minY.assign( min( minY, ndc.y ) );
					minZ.assign( min( minZ, ndc.z ) );
					maxX.assign( max( maxX, ndc.x ) );
					maxY.assign( max( maxY, ndc.y ) );

				} );

			}

			const occluded = bool( false ).toVar();

			// spheres crossing the camera plane are visible

			If( behind.not(), () => {

				// pixel rectangle, the framebuffer origin is the top left corner

				const width = hzbSize.x;
				const height = hzbSize.y;

				const x0 = int( clamp( minX.mul( 0.5 ).add( 0.5 ).mul( width ), 0.0, width.sub( 1.0 ) ) );
				const x1 = int( clamp( maxX.mul( 0.5 ).add( 0.5 ).mul( width ), 0.0, width.sub( 1.0 ) ) );
				const y0 = int( clamp( float( 0.5 ).sub( maxY.mul( 0.5 ) ).mul( height ), 0.0, height.sub( 1.0 ) ) );
				const y1 = int( clamp( float( 0.5 ).sub( minY.mul( 0.5 ) ).mul( height ), 0.0, height.sub( 1.0 ) ) );

				// the level whose texels cover 2^( level + 1 ) pixels, so the rectangle overlaps at most 2x2 texels

				const span = max( x1.sub( x0 ), y1.sub( y0 ) ).add( 1 );
				const level = clamp( int( ceil( log2( float( span ) ) ) ).sub( 1 ), int( 0 ), int( hzbLevelCount ).sub( 1 ) );
				const shift = uint( level.add( 1 ) );

				const levelData = hzbLevels.element( level );
				const offset = uint( levelData.x );
				const levelWidth = uint( levelData.y );

				const tx0 = uint( x0 ).shiftRight( shift );
				const tx1 = uint( x1 ).shiftRight( shift );
				const ty0 = uint( y0 ).shiftRight( shift );
				const ty1 = uint( y1 ).shiftRight( shift );

				const depth = max(
					max( hzb.element( offset.add( ty0.mul( levelWidth ) ).add( tx0 ) ), hzb.element( offset.add( ty0.mul( levelWidth ) ).add( tx1 ) ) ),
					max( hzb.element( offset.add( ty1.mul( levelWidth ) ).add( tx0 ) ), hzb.element( offset.add( ty1.mul( levelWidth ) ).add( tx1 ) ) )
				);

				occluded.assign( minZ.greaterThan( depth ) );

			} );

			return occluded;

		};

		const createClusterCull = ( phase ) => Fn( () => {

			const instance = instanceIndex.div( clustersPerObject );
			const chunk = instanceIndex.mod( clustersPerObject );
			const lodValue = instanceLod.element( instance ).toVar();
			const lodLevel = lodValue.bitAnd( LOD_MASK );

			If( lodLevel.notEqual( uint( CULLED ) ), () => {

				// the clusters of objects occluded as a whole are not visible, without testing each of them

				if ( phase === 'second' ) {

					If( lodValue.bitAnd( OCCLUDED ).notEqual( uint( 0 ) ), () => {

						clusterVisibility.element( instanceIndex ).assign( uint( 0 ) );

						Return();

					} );

				}


				const lodData = lodOffsets.element( lodLevel );
				const lodTriangleStart = uint( lodData.x );
				const lodNumTriangles = uint( lodData.y );
				const lodChunkStart = uint( lodData.z );

				If( chunk.lessThan( lodNumTriangles.div( CLUSTER_SIZE ) ), () => {

					const matrixWorld = instanceWorld.element( instance );
					const objectScale = instanceBounds.element( instance ).w;

					const chunkBounds = getChunkBounds( lodChunkStart.add( chunk ) ).toVar();
					const chunkCenter = matrixWorld.mul( vec4( chunkBounds.xyz, 1.0 ) ).xyz.toVar();
					const chunkRadius = chunkBounds.w.mul( objectScale.abs() ).add( boundsMargin ).toVar();

					const chunkVisible = bool( true ).toVar();

					// cone culling: all triangles of the cluster face away from the camera. the normal cone is
					// transformed by the world matrix, which requires a uniform scale ( positive object scale ).
					// shadow passes draw the back faces

					if ( shadow === false && this.deformed === false ) {

						If( objectScale.greaterThan( 0.0 ), () => {

							const cone = getChunkCone( lodChunkStart.add( chunk ) );
							const coneAxis = normalize( matrixWorld.mul( vec4( cone.xyz, 0.0 ) ).xyz );
							const toCluster = chunkCenter.sub( cameraPosition );

							If( dot( toCluster, coneAxis ).greaterThanEqual( cone.w.mul( length( toCluster ) ).add( chunkRadius ) ), () => {

								chunkVisible.assign( false );

							} );

						} );

					}

					Loop( { name: 'plane', start: 0, end: 6 }, ( { plane: planeIndex } ) => {

						const plane = frustumPlanes.element( planeIndex );

						If( dot( plane.xyz, chunkCenter ).add( plane.w ).lessThan( chunkRadius.negate() ), () => {

							chunkVisible.assign( false );

						} );

					} );

					const enqueue = () => {

						if ( far === true ) {

							const queue = select( lodValue.bitAnd( FAR ).notEqual( uint( 0 ) ), uint( 1 ), uint( 0 ) ).toVar();
							const item = atomicAdd( workQueueCountAtomic.element( queue ), 1 );

							If( item.lessThan( maxWorkItems ), () => {

								workQueue.element( queue.mul( maxWorkItems ).add( item ) ).assign( uvec4( instance, lodTriangleStart, lodNumTriangles, chunk ) );

							} );

						} else {

							const item = atomicAdd( workQueueCountAtomic.element( 0 ), 1 );

							If( item.lessThan( maxWorkItems ), () => {

								workQueue.element( item ).assign( uvec4( instance, lodTriangleStart, lodNumTriangles, chunk ) );

							} );

						}

					};

					If( chunkVisible, () => {

						if ( phase === 'all' ) {

							enqueue();

						} else {

							const visibilityValue = lodLevel.add( 1 );
							const wasVisible = clusterVisibility.element( instanceIndex ).equal( visibilityValue ).toVar();

							if ( phase === 'first' ) {

								If( wasVisible, enqueue );

							} else {

								// the projection is computed again, the object matrices of the cull pass would exceed the storage buffers per stage

								const occluded = isOccluded( projScreenMatrix.mul( matrixWorld ), vec4( chunkBounds.xyz, chunkBounds.w.add( boundsMargin.div( objectScale.abs() ) ) ) );

								If( occluded.not().and( wasVisible.not() ), enqueue );

								clusterVisibility.element( instanceIndex ).assign( select( occluded, uint( 0 ), visibilityValue ) );

							}

						}

					} );

				} );

			} );

		} )().compute( capacity * maxChunks ).setName( 'GPUDrivenDrawer Cluster Cull' );

		this.computeCull = computeCull;
		this.clustersPerObject = maxChunks;

		if ( occlusion === null ) {

			this.computeClusterCulls = [ createClusterCull( 'all' ) ];

			this.cullNodes = [ computeReset, computeCull, this.computeClusterCulls[ 0 ] ];
			this.computeNodes = [];

		} else {

			const computeClusterCullFirst = createClusterCull( 'first' );
			const computeClusterCullSecond = createClusterCull( 'second' );

			// indirect draw of the clusters of the first phase into the depth of the occlusion view

			const prepassDrawAttributes = [];

			for ( let queue = 0; queue < queueCount; queue ++ ) prepassDrawAttributes.push( createAttribute( new Uint32Array( 4 ), 4, IndirectStorageBufferAttribute ) );

			const computePrepassArgs = Fn( () => {

				for ( let queue = 0; queue < queueCount; queue ++ ) {

					const prepassDrawBuffer = storage( prepassDrawAttributes[ queue ], 'uint', 4 );

					prepassDrawBuffer.element( 0 ).assign( uint( CLUSTER_SIZE * 3 ) );
					prepassDrawBuffer.element( 1 ).assign( min( workQueueCountRead.element( queue ), maxWorkItems ) );
					prepassDrawBuffer.element( 2 ).assign( uint( 0 ) );
					prepassDrawBuffer.element( 3 ).assign( uint( 0 ) );

				}

			} )().compute( 1 ).setName( 'GPUDrivenDrawer Occlusion Args' );

			// one thread per object tests its bounding sphere, so the clusters of objects occluded as a whole skip their tests

			const computeObjectOcclusion = Fn( () => {

				const lodValue = instanceLod.element( instanceIndex );

				If( lodValue.notEqual( uint( CULLED ) ), () => {

					const bounds = instanceBounds.element( instanceIndex );
					const radius = bounds.w.abs().mul( boundingRadius ).add( boundsMargin );

					If( isOccluded( projScreenMatrix, vec4( bounds.xyz, radius ) ), () => {

						instanceLod.element( instanceIndex ).assign( lodValue.bitOr( OCCLUDED ) );

					} );

				} );

			} )().compute( capacity ).setName( 'GPUDrivenDrawer Object Occlusion' );

			this.computeObjectOcclusion = computeObjectOcclusion;
			this.computeClusterCulls = [ computeClusterCullFirst, computeClusterCullSecond ];

			this.cullNodes = [ computeReset, computeCull, computeClusterCullFirst, computePrepassArgs ];
			this.computeNodes = [ computeObjectOcclusion, computeClusterCullSecond ];

			this.prepassDrawAttributes = prepassDrawAttributes;

		}

		// one draw instance per cluster of 64 triangles

		const workItem = workQueue.element( drawInstanceIndex );

		const clusterSource = {
			instance: workItem.x,
			triangle: workItem.y.add( workItem.w.mul( CLUSTER_SIZE ) ).add( vertexIndex.div( 3 ) ),
			corner: vertexIndex.mod( 3 )
		};

		// the clusters of the far queue

		const farWorkItem = workQueue.element( drawInstanceIndex.add( maxWorkItemCount ) );

		const farClusterSource = far === true ? {
			instance: farWorkItem.x,
			triangle: farWorkItem.y.add( farWorkItem.w.mul( CLUSTER_SIZE ) ).add( vertexIndex.div( 3 ) ),
			corner: vertexIndex.mod( 3 )
		} : null;

		const shared = {
			createAttribute, clusters, material, renderer, receiveShadow, debug, shadow, depthPrepass, capacity,
			position, normal, vertexUv, indexBuffer, instanceWorld, instanceMvp, instanced, objectWorld, instanceLocal, instanceData,
			workQueue, workQueueCountRead, maxWorkItems, projScreenMatrix, viewSize, clusterSource, farClusterSource
		};

		this.setupDraw( shared );

		// the clusters of the first phase, drawn into the depth of the occlusion view

		this.prepassMeshes = [];

		if ( occlusion !== null ) {

			this.prepassMeshes.push( this.createDepthMesh( this.prepassDrawAttributes[ 0 ], clusterSource, shared, FrontSide ) );

			if ( far === true ) this.prepassMeshes.push( this.createDepthMesh( this.prepassDrawAttributes[ 1 ], farClusterSource, { ...shared, material: this.farMaterial }, FrontSide ) );

		}

	}

	/**
	 * Creates the draw of the visible clusters: one draw instance per cluster of 64 triangles, drawn by the
	 * hardware rasterizer through vertex pulling. Adds the compute nodes and meshes of the draw.
	 *
	 * @param {Object} shared - The nodes and resources of the batch.
	 */
	setupDraw( shared ) {

		const { createAttribute, workQueueCountRead, maxWorkItems, clusterSource, farClusterSource } = shared;

		// one draw per queue: the material, and the far material beyond the switch distance

		const queues = [ { source: clusterSource, material: shared.material } ];

		if ( farClusterSource !== null ) queues.push( { source: farClusterSource, material: this.farMaterial } );

		const drawAttributes = queues.map( () => createAttribute( new Uint32Array( 4 ), 4, IndirectStorageBufferAttribute ) );

		const computeDrawArgs = Fn( () => {

			for ( let queue = 0; queue < queues.length; queue ++ ) {

				const drawBuffer = storage( drawAttributes[ queue ], 'uint', 4 );

				drawBuffer.element( 0 ).assign( uint( CLUSTER_SIZE * 3 ) );
				drawBuffer.element( 1 ).assign( min( workQueueCountRead.element( queue ), maxWorkItems ) );
				drawBuffer.element( 2 ).assign( uint( 0 ) );
				drawBuffer.element( 3 ).assign( uint( 0 ) );

			}

		} )().compute( 1 ).setName( 'GPUDrivenDrawer Draw Args' );

		this.computeNodes.push( computeDrawArgs );

		for ( let queue = 0; queue < queues.length; queue ++ ) {

			const mesh = this.createPulledMesh( drawAttributes[ queue ], queues[ queue ].source, { ...shared, material: queues[ queue ].material } );

			this.meshes.push( mesh );

			if ( mesh.depthMesh !== undefined ) this.meshes.push( mesh.depthMesh );

			if ( queue === 0 ) this.clusterMesh = mesh;

		}

	}

	/**
	 * Creates the geometry of a mesh drawing pulled vertices with the given indirect draw arguments.
	 *
	 * @param {IndirectStorageBufferAttribute} drawAttribute - The indirect draw arguments.
	 * @return {BufferGeometry} The geometry.
	 */
	createPulledGeometry( drawAttribute ) {

		if ( _pulledPositionAttribute === null ) _pulledPositionAttribute = new Float32BufferAttribute( new Float32Array( PULLED_VERTICES * 3 ), 3 );

		const geometry = new BufferGeometry();
		geometry.setAttribute( 'position', _pulledPositionAttribute );

		// the normals are provided by the context, the attribute enables normal based features like the geometry roughness

		geometry.setAttribute( 'normal', _pulledPositionAttribute );
		geometry.setIndirect( drawAttribute );
		geometry.boundingSphere = new Sphere( new Vector3(), Infinity );

		this.ownedGeometries.push( geometry );

		return geometry;

	}

	/**
	 * Returns a context which feeds pulled vertices into the regular vertex stage of node materials: the
	 * attributes of the geometry are read from the cluster data and the model matrices from the objects of
	 * the batch. The nodes of the material, including position nodes, run as for the regular meshes. The instances
	 * of instanced meshes are transformed like the regular instancing of node materials, before the position node.
	 *
	 * @param {Object} source - The object, triangle and corner nodes of the current vertex.
	 * @param {Object} shared - The nodes and resources of the batch.
	 * @return {{context: ContextNode, positionNode: ?Node<vec3>}} The context node and the position node of the materials.
	 */
	createPulledContext( source, shared ) {

		const { clusters, material, position, normal, vertexUv, indexBuffer, instanceWorld, instanced, objectWorld, instanceLocal, instanceData, capacity } = shared;

		const vertex = indexBuffer.element( source.triangle.mul( 3 ).add( source.corner ) );

		// the object of the vertex, the fragments read it through a flat varying

		const instance = varying( source.instance, 'vGPUDrivenInstance' );

		let matrixWorld = instanceWorld.element( instance );
		let previousMatrixWorld = this.history === true ? instanceWorld.element( instance.add( capacity ) ) : matrixWorld;
		let instanceIndexNode = uint( 0 );
		let positionNode = material.positionNode || null;

		if ( instanced === true ) {

			const stride = this.instanceDataStride;
			const instanceMatrix = instanceLocal.element( instance );
			const previousInstanceMatrix = this.history === true ? instanceLocal.element( instance.add( capacity ) ) : instanceMatrix;
			const userPositionNode = positionNode;

			matrixWorld = objectWorld.element( instance );
			previousMatrixWorld = this.history === true ? objectWorld.element( instance.add( capacity ) ) : matrixWorld;
			instanceIndexNode = uint( instanceData.element( instance.mul( stride ) ).x );

			positionNode = Fn( ( builder ) => {

				positionLocal.assign( instanceMatrix.mul( positionLocal ).xyz );

				if ( builder.hasGeometryAttribute( 'normal' ) ) normalLocal.assign( transformNormal( normalLocal, instanceMatrix ) );

				if ( builder.needsPreviousData() ) positionPrevious.assign( previousInstanceMatrix.mul( positionPrevious ).xyz );

				return userPositionNode !== null ? userPositionNode : positionLocal;

			} )();

		}

		const worldPosition = matrixWorld.mul( vec4( 0.0, 0.0, 0.0, 1.0 ) ).xyz;
		const instancedAttributes = clusters.instancedAttributes;

		const attributes = {
			position: position( vertex ),
			normal: normal( vertex ),
			uv: vertexUv( vertex )
		};

		const getAttribute = ( name ) => {

			let node = attributes[ name ];

			if ( node === undefined && clusters.hasAttribute( name ) ) node = clusters.attribute( name, vertex );

			// the instanced attributes of instanced meshes

			const index = instancedAttributes.findIndex( ( attribute ) => attribute.name === name );

			if ( node === undefined && instanced === true && index !== - 1 ) {

				node = swizzle( instanceData.element( instance.mul( this.instanceDataStride ).add( 1 + index ) ), instancedAttributes[ index ].itemSize );

			}

			// pulled in the vertex stage, interpolated if read by the fragment stage

			return node !== undefined ? varying( node ) : null;

		};

		const context = overrideNodes( [
			[ instanceIndex, instanceIndexNode ],
			[ modelWorldMatrix, matrixWorld ],
			[ modelWorldMatrixInverse, matrixWorld.inverse() ],
			[ modelNormalMatrix, mat3( matrixWorld ).inverse().transpose() ],
			[ modelPosition, worldPosition ],
			[ modelViewPosition, cameraViewMatrix.mul( vec4( worldPosition, 1.0 ) ).xyz ],
			[ velocity.previousModelWorldMatrix, previousMatrixWorld ]
		], contextNode( { getAttribute } ) );

		return { context, positionNode };

	}

	/**
	 * Creates a mesh which only draws the depth of pulled triangles, for shadow passes and the occlusion view.
	 * The position node of the material is applied.
	 *
	 * @param {IndirectStorageBufferAttribute} drawAttribute - The indirect draw arguments.
	 * @param {Object} source - The object, triangle and corner nodes of the current vertex.
	 * @param {Object} shared - The nodes and resources of the batch.
	 * @param {number} side - The side of the triangles to draw.
	 * @return {Mesh} The mesh.
	 */
	createDepthMesh( drawAttribute, source, shared, side ) {

		const pulled = this.createPulledContext( source, shared );

		const material = new NodeMaterial();
		material.colorNode = vec4( 0, 0, 0, 1 );
		material.positionNode = pulled.positionNode;
		material.maskNode = shared.material.maskNode || null;
		material.contextNode = pulled.context;
		material.blending = NoBlending;
		material.fog = false;
		material.side = side;

		// the shadow material of the renderer would replace the pulled context

		material.allowOverride = false;

		const mesh = new Mesh( this.createPulledGeometry( drawAttribute ), material );
		mesh.frustumCulled = false;

		return mesh;

	}

	/**
	 * Creates a mesh which draws triangles through the hardware rasterizer by vertex pulling. The source
	 * provides the object, the triangle and the corner of the current vertex.
	 *
	 * @param {IndirectStorageBufferAttribute} drawAttribute - The indirect draw arguments.
	 * @param {Object} source - The object, triangle and corner nodes of the current vertex.
	 * @param {Object} shared - The nodes and resources of the batch.
	 * @return {Mesh} The mesh.
	 */
	createPulledMesh( drawAttribute, source, shared ) {

		const { material, renderer, receiveShadow, debug, shadow, depthPrepass } = shared;

		if ( shadow === true ) {

			// the shadow pass draws the back faces like the shadow material of the renderer

			const side = ( material.shadowSide !== null && material.shadowSide !== undefined ) ? material.shadowSide : BackSide;

			const mesh = this.createDepthMesh( drawAttribute, source, shared, side );
			mesh.castShadow = true;

			return mesh;

		}

		const geometry = this.createPulledGeometry( drawAttribute );
		const pulled = this.createPulledContext( source, shared );

		let drawMaterial;

		if ( debug === true ) {

			// clusters are stored as blocks of 64 triangles, so the cluster of a triangle is its index divided by 64

			drawMaterial = createDebugMaterial( varying( source.triangle.div( CLUSTER_SIZE ) ), varying( source.instance ) );

		} else {

			drawMaterial = createDrawMaterial( material, renderer );

		}

		drawMaterial.positionNode = pulled.positionNode;
		drawMaterial.maskNode = material.maskNode || null;
		drawMaterial.contextNode = pulled.context;

		const mesh = new Mesh( geometry, drawMaterial );
		mesh.frustumCulled = false;
		mesh.receiveShadow = receiveShadow;

		if ( depthPrepass === true ) {

			// the depth is drawn first with the same vertex nodes, so the material only shades the visible surface

			const depthMaterial = new NodeMaterial();
			depthMaterial.colorWrite = false;
			depthMaterial.fog = false;
			depthMaterial.positionNode = pulled.positionNode;
			depthMaterial.maskNode = material.maskNode || null;
			depthMaterial.contextNode = pulled.context;

			const depthMesh = new Mesh( geometry, depthMaterial );
			depthMesh.frustumCulled = false;
			depthMesh.renderOrder = - 1;

			drawMaterial.depthWrite = false;

			mesh.depthMesh = depthMesh;

		}

		return mesh;

	}

	/**
	 * Uploads the transforms of the objects and the camera state for the current projection.
	 *
	 * @param {Array<Object3D>} objects - The objects of the batch.
	 * @param {Camera} camera - The camera.
	 * @param {Matrix4} projScreenMatrix - The view projection matrix.
	 * @param {Frustum} frustum - The camera frustum.
	 * @param {number} width - The width of the view in pixels.
	 * @param {number} height - The height of the view in pixels.
	 * @param {GPUDrivenDrawer} drawer - The drawer.
	 * @param {boolean} [upload=true] - Whether the transforms of the objects changed and must be uploaded.
	 * @param {?Array<?Object>} [levels=null] - The distance ranges of the objects which are levels of LOD objects.
	 */
	update( objects, camera, projScreenMatrix, frustum, width, height, drawer, upload = true, levels = null ) {

		const instanced = this.instanced;

		let count = objects.length;

		if ( instanced === true ) {

			count = 0;

			for ( let i = 0, l = objects.length; i < l; i ++ ) count += objects[ i ].count;

		}

		const previousCount = this.count;
		const historyOffset = this.capacity * 16;

		if ( upload === true ) {

			// the matrices of the last frame become the previous matrices

			for ( const attribute of this.historyAttributes ) attribute.array.copyWithin( historyOffset, 0, Math.min( previousCount, count ) * 16 );

			const { instanceWorldArray, instanceBoundsArray } = this;
			const boundingSphere = this.clusters.boundingSphere;

			// the world matrices of the objects, of the instances of instanced meshes

			const matrices = [];

			if ( instanced === true ) {

				const { objectWorldArray, instanceLocalArray, instanceDataArray, instanceDataStride: stride } = this;
				const instancedAttributes = this.clusters.instancedAttributes;

				let slot = 0;

				for ( const object of objects ) {

					const attributes = instancedAttributes.map( ( { name } ) => object.geometry.attributes[ name ] );

					for ( let i = 0; i < object.count; i ++ ) {

						_instanceMatrix.fromArray( object.instanceMatrix.array, i * 16 );

						objectWorldArray.set( object.matrixWorld.elements, slot * 16 );
						instanceLocalArray.set( _instanceMatrix.elements, slot * 16 );

						instanceDataArray[ slot * stride * 4 ] = i;

						for ( let a = 0; a < attributes.length; a ++ ) {

							const attribute = attributes[ a ];

							for ( let c = 0; c < attribute.itemSize; c ++ ) instanceDataArray[ ( slot * stride + 1 + a ) * 4 + c ] = attribute.getComponent( i, c );

						}

						matrices.push( _matrix.multiplyMatrices( object.matrixWorld, _instanceMatrix ).clone() );

						slot ++;

					}

				}

				this.objectWorldAttribute.needsUpdate = true;
				this.instanceLocalAttribute.needsUpdate = true;
				this.instanceDataAttribute.needsUpdate = true;

			} else {

				for ( const object of objects ) matrices.push( object.matrixWorld );

			}

			// the distance range of each object, shared by the instances of instanced meshes

			const { instanceLevelArray } = this;

			let slot = 0;

			for ( let o = 0; o < objects.length; o ++ ) {

				const level = levels !== null ? levels[ o ] : null;
				const instances = instanced === true ? objects[ o ].count : 1;

				for ( let i = 0; i < instances; i ++, slot ++ ) {

					if ( level !== null ) {

						instanceLevelArray[ slot * 8 + 0 ] = level.position.x;
						instanceLevelArray[ slot * 8 + 1 ] = level.position.y;
						instanceLevelArray[ slot * 8 + 2 ] = level.position.z;
						instanceLevelArray[ slot * 8 + 3 ] = level.near;
						instanceLevelArray[ slot * 8 + 4 ] = level.far;
						instanceLevelArray[ slot * 8 + 5 ] = level.switchDistance;

					} else {

						instanceLevelArray[ slot * 8 + 3 ] = - NO_LEVEL_DISTANCE;
						instanceLevelArray[ slot * 8 + 4 ] = NO_LEVEL_DISTANCE;
						instanceLevelArray[ slot * 8 + 5 ] = NO_LEVEL_DISTANCE;

					}

				}

			}

			this.instanceLevelAttribute.needsUpdate = true;

			for ( let i = 0, l = matrices.length; i < l; i ++ ) {

				const matrixWorld = matrices[ i ];
				const e = matrixWorld.elements;

				instanceWorldArray.set( e, i * 16 );

				_sphere.center.copy( boundingSphere.center ).applyMatrix4( matrixWorld );

				instanceBoundsArray[ i * 4 + 0 ] = _sphere.center.x;
				instanceBoundsArray[ i * 4 + 1 ] = _sphere.center.y;
				instanceBoundsArray[ i * 4 + 2 ] = _sphere.center.z;
				// the maximum scale, negative if the scale is not uniform

				const scaleX = Math.hypot( e[ 0 ], e[ 1 ], e[ 2 ] );
				const scaleY = Math.hypot( e[ 4 ], e[ 5 ], e[ 6 ] );
				const scaleZ = Math.hypot( e[ 8 ], e[ 9 ], e[ 10 ] );
				const maxScale = Math.max( scaleX, scaleY, scaleZ );
				const uniformScale = maxScale - Math.min( scaleX, scaleY, scaleZ ) <= maxScale * 1e-4;

				instanceBoundsArray[ i * 4 + 3 ] = uniformScale ? maxScale : - maxScale;

			}

			this.instanceWorldAttribute.needsUpdate = true;
			this.instanceBoundsAttribute.needsUpdate = true;

			// added objects didn't move

			for ( const attribute of this.historyAttributes ) {

				if ( count > previousCount ) attribute.array.copyWithin( historyOffset + previousCount * 16, previousCount * 16, count * 16 );

				attribute.needsUpdate = true;

			}

			this.historyPending = this.historyAttributes.length > 0;

		} else if ( this.historyPending === true ) {

			// objects which didn't move since the last upload have the same previous matrices

			for ( const attribute of this.historyAttributes ) {

				attribute.array.copyWithin( historyOffset, 0, count * 16 );
				attribute.needsUpdate = true;

			}

			this.historyPending = false;

		}

		this.count = count;
		this.computeCull.count = count;

		for ( const computeClusterCull of this.computeClusterCulls ) computeClusterCull.count = count * this.clustersPerObject;

		if ( this.computeObjectOcclusion !== undefined ) this.computeObjectOcclusion.count = count;

		this.projScreenMatrix.value.copy( projScreenMatrix );
		const lodView = drawer._lodView;

		this.cameraPosition.value.setFromMatrixPosition( camera.matrixWorld );
		this.cameraZoom.value = camera.zoom;
		this.lodPosition.value.copy( lodView.position );
		this.lodScale.value = lodView.scale;
		this.lodPerspective.value = lodView.perspective;
		this.viewSize.value.set( width, height );
		this.lodThreshold.value = lodView.threshold;
		this.boundsMargin.value = this.deformed === true ? drawer.boundsMargin : 0;

		const planes = frustum.planes;

		for ( let i = 0; i < 6; i ++ ) {

			this.frustumPlanes.array[ i ].set( planes[ i ].normal.x, planes[ i ].normal.y, planes[ i ].normal.z, planes[ i ].constant );

		}

	}

	/**
	 * Frees the GPU-related resources of the batch.
	 */
	dispose() {

		for ( const computeNode of this.cullNodes ) computeNode.dispose();
		for ( const computeNode of this.computeNodes ) computeNode.dispose();
		for ( const mesh of this.meshes ) mesh.material.dispose();
		for ( const mesh of this.prepassMeshes ) mesh.material.dispose();
		for ( const geometry of this.ownedGeometries ) geometry.dispose();
		for ( const attribute of this.attributes ) attribute.dispose();

	}

}

/**
 * A drawer that renders compatible meshes with a GPU-driven pipeline. Geometries are processed once into
 * clusters (meshlets) of 64 triangles with a chain of simplified levels of detail. Every frame, compute
 * shaders select the level of detail per object and cull the objects and clusters against the frustum,
 * and the visible clusters of all objects sharing geometry and material are drawn in one indirect draw
 * through the hardware rasterizer.
 *
 * The node graph of the material is evaluated on the pulled vertices (position, normal, model matrices and
 * the attributes of the geometry), so custom nodes, lights, shadows and the environment work as usual.
 * Supported are opaque meshes using front side rendering whose material nodes don't change the geometry,
 * the coverage or the output of the draw. All other objects, and all objects in render calls using a custom
 * render object function like shadow passes, are drawn by {@link OptimizedDrawer}. Objects are drawn by the
 * regular pipeline until their geometry is processed.
 *
 * MRT outputs of the render call and of the materials are evaluated like for the regular meshes. The matrices
 * of the objects in the previous frame are kept on the GPU, so the velocity of temporal effects like TRAA
 * includes the motion of the objects and the instances.
 *
 * Objects are culled on the GPU, but the CPU still traverses the scene and uploads the transforms every frame.
 * The content of a static {@link BundleGroup} is kept on the GPU instead: the group is captured once, the
 * transforms of its meshes are uploaded once and the group is not traversed again until `needsUpdate` is set.
 * Changes inside of the group, like transforms or added objects, require `needsUpdate` as with render bundles.
 *
 * ```js
 * renderer.drawer = new GPUDrivenDrawer();
 *
 * const city = new BundleGroup();
 * city.add( ...buildings );
 * scene.add( city );
 * ```
 *
 * This class is experimental and its interface might change.
 *
 * @augments OptimizedDrawer
 */
class GPUDrivenDrawer extends OptimizedDrawer {

	/**
	 * Constructs a new GPU-driven drawer.
	 *
	 * @param {Object} [parameters] - The configuration parameter.
	 * @param {boolean} [parameters.instancing=true] - Whether the objects drawn by the regular pipeline should be merged into instanced draws or not.
	 * @param {number} [parameters.lodThreshold=1] - The projected error in pixels below which a simpler level of detail is selected.
	 * @param {number} [parameters.shadowLodThreshold=1] - The projected error in shadow map texels below which a simpler level of detail is selected for shadow casters.
	 * @param {number} [parameters.boundsMargin=0] - The margin in world units added to the bounds of objects whose material has a position node.
	 * @param {boolean} [parameters.debug=false] - Whether the clusters should be shown with a flat color each instead of the material.
	 * @param {boolean} [parameters.occlusionCulling=true] - Whether the clusters hidden by other clusters should be culled.
	 * @param {boolean} [parameters.depthPrepass=false] - Whether the depth of the clusters should be drawn before their material.
	 */
	constructor( { instancing = true, lodThreshold = 1, shadowLodThreshold = 1, boundsMargin = 0, debug = false, occlusionCulling = true, depthPrepass = false } = {} ) {

		super( { instancing } );

		/**
		 * The projected error in pixels below which a simpler level of detail is selected.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.lodThreshold = lodThreshold;

		/**
		 * The projected error in shadow map texels below which a simpler level of detail is selected for the
		 * shadow casters. The level of detail of shadow passes doesn't depend on the camera, so shadow maps
		 * which are not updated every frame stay valid when the camera moves.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.shadowLodThreshold = shadowLodThreshold;

		/**
		 * The margin in world units added to the bounds of the objects and clusters whose material has a position
		 * node. Position nodes run after the culling, so vertices moved out of the bounds of the geometry can be
		 * culled at the borders of the view or behind occluders. Cone culling is disabled for these materials.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.boundsMargin = boundsMargin;

		/**
		 * Whether the clusters (meshlets) of the objects drawn by the GPU-driven pipeline should be shown
		 * with a flat color each, instead of shading them with their material. Each object uses different
		 * colors, and the clusters of all levels of detail are distinct.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.debug = debug;

		/**
		 * Whether the clusters hidden by other clusters of the GPU-driven pipeline should be culled. The clusters
		 * visible in the last frame are rendered into a depth buffer first, the other clusters are tested
		 * against its hierarchical depth. Shadow passes are not occlusion culled.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.occlusionCulling = occlusionCulling;

		/**
		 * Whether the depth of the clusters drawn by the hardware rasterizer should be drawn before their material,
		 * so the material is only evaluated once per pixel. Reduces the overdraw of expensive materials at the cost
		 * of drawing the clusters twice.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.depthPrepass = depthPrepass;

		this._occlusionDrawer = new Drawer();

		this._ready = false;
		this._gpuDrivenEnabled = false;
		this._camera = null;
		this._depth = 0;
		this._gpuProjectionId = 0;

		this._clusters = new WeakMap();
		this._materials = new WeakMap();
		this._pendingGeometry = null;
		this._renderListBatches = new WeakMap();
		this._capture = null;
		this._lodRange = null;
		this._lodRanges = new WeakMap();
		this._gpuDrivenSupported = false;
		this._shadowPass = false;
		this._sceneProjected = false;
		this._lodView = { position: new Vector3(), scale: 1, perspective: 1, threshold: 1 };

		clusterProcessingReady.then( () => {

			this._ready = true;

		} );

	}

	/**
	 * The maximum number of objects drawn by the GPU-driven pipeline per render list.
	 *
	 * @type {number}
	 * @readonly
	 */
	get maxInstances() {

		return MAX_INSTANCES;

	}

	begin( camera ) {

		super.begin( camera );

		const renderer = this.renderer;
		const renderTarget = renderer.getRenderTarget();

		this._gpuDrivenSupported = this._ready === true &&
			renderer.backend.isWebGPUBackend === true &&
			renderer.logarithmicDepthBuffer !== true &&
			renderer.reversedDepthBuffer !== true &&
			renderer.localClippingEnabled !== true &&
			( renderer.clippingPlanes === undefined || renderer.clippingPlanes.length === 0 ) &&
			camera.isArrayCamera !== true &&
			( renderTarget === null || ( renderTarget.isCubeRenderTarget !== true && renderTarget.depth <= 1 ) );

		// render calls with a custom render object function are only supported for shadow passes, see project()

		this._gpuDrivenEnabled = this._gpuDrivenSupported === true && renderer.getRenderObjectFunction() === null && camera.isPerspectiveCamera === true;
		this._shadowPass = false;
		this._sceneProjected = false;

		this._camera = camera;
		this._gpuProjectionId ++;

	}

	beginRenderList( renderList ) {

		super.beginRenderList( renderList );

		this._depth ++;

	}

	project( object, camera, groupOrder, renderList, clippingContext ) {

		if ( this._sceneProjected === false && object.isScene === true ) {

			this._sceneProjected = true;

			// shadow passes draw the shadow casters with the shadow material of the scene and a custom render object function

			const renderer = this.renderer;
			const overrideMaterial = object.overrideMaterial;

			if ( this._gpuDrivenSupported === true && renderer.getRenderObjectFunction() !== null &&
				overrideMaterial !== null && overrideMaterial.isShadowPassMaterial === true && renderer.shadowMap.type !== VSMShadowMap &&
				( camera.isPerspectiveCamera === true || camera.isOrthographicCamera === true ) ) {

				this._gpuDrivenEnabled = true;
				this._shadowPass = true;

			}

		}

		// the levels of LOD objects are selected per object on the GPU

		if ( object.isLOD === true && this._gpuDrivenEnabled === true && object.levels.length > 0 ) {

			if ( object.visible === false ) return;

			this._projectLOD( object, camera, groupOrder, renderList, clippingContext );

			return;

		}

		if ( object.isBundleGroup === true ) {

			// static bundle groups keep the supported meshes on the GPU and the other objects in the render bundle

			if ( this._capture === null && object.static === true && this._gpuDrivenEnabled === true && this._depth === 1 && this.renderer.backend.beginBundle !== undefined ) {

				if ( object.visible === false ) return;

				this._projectStaticGroup( object, camera, groupOrder, renderList, clippingContext );

				return;

			}

			// bundle groups inside of a captured group are part of it

			if ( this._capture !== null ) {

				if ( object.visible === false ) return;

				if ( object.layers.test( camera.layers ) ) groupOrder = object.renderOrder;

				const children = object.children;

				for ( let i = 0, l = children.length; i < l; i ++ ) {

					this.project( children[ i ], camera, groupOrder, renderList, clippingContext );

				}

				return;

			}

		}

		super.project( object, camera, groupOrder, renderList, clippingContext );

	}

	/**
	 * Projects a LOD object. Instead of selecting a level on the CPU, all levels are projected with the distance
	 * range of the level: the objects of the GPU-driven pipeline are culled outside of it on the GPU, the other
	 * objects are culled by the CPU. The distance is measured like {@link LOD#update}, without hysteresis.
	 *
	 * Two consecutive levels which are the same geometry with different materials are drawn as one object: the
	 * object selects the material of the second level beyond its distance, without a second batch.
	 *
	 * @private
	 * @param {LOD} lod - The LOD object.
	 * @param {Camera} camera - The camera.
	 * @param {number} groupOrder - The group order.
	 * @param {RenderList} renderList - The render list.
	 * @param {ClippingContext} clippingContext - The clipping context.
	 */
	_projectLOD( lod, camera, groupOrder, renderList, clippingContext ) {

		const levels = lod.levels;

		let ranges = this._lodRanges.get( lod );

		if ( ranges === undefined ) {

			ranges = [];
			this._lodRanges.set( lod, ranges );

		}

		const previousRange = this._lodRange;

		for ( let i = 0; i < levels.length; i ++ ) {

			let range = ranges[ i ];

			if ( range === undefined ) {

				range = ranges[ i ] = { position: new Vector3(), near: 0, far: 0, switchDistance: NO_LEVEL_DISTANCE, farMaterial: null };

			}

			const level = levels[ i ].object;
			const next = i < levels.length - 1 ? levels[ i + 1 ].object : null;
			const merged = next !== null && this._canMergeLevels( level, next );
			const last = merged === true ? i + 1 : i;

			range.position.setFromMatrixPosition( lod.matrixWorld );
			range.near = i === 0 ? - NO_LEVEL_DISTANCE : levels[ i ].distance;
			range.far = last < levels.length - 1 ? levels[ last + 1 ].distance : NO_LEVEL_DISTANCE;
			range.switchDistance = merged === true ? levels[ i + 1 ].distance : NO_LEVEL_DISTANCE;
			range.farMaterial = merged === true ? next.material : null;

			// the visibility set by previous updates of the LOD object is ignored

			const visible = level.visible;

			level.visible = true;

			this._lodRange = range;
			this.project( level, camera, groupOrder, renderList, clippingContext );

			level.visible = visible;

			i = last;

		}

		this._lodRange = previousRange;

		// children which are not levels

		const children = lod.children;

		for ( let i = 0, l = children.length; i < l; i ++ ) {

			const child = children[ i ];

			if ( levels.some( ( level ) => level.object === child ) === false ) this.project( child, camera, groupOrder, renderList, clippingContext );

		}

	}

	/**
	 * Returns `true` if two consecutive levels of a LOD object can be drawn as one object of the GPU-driven pipeline,
	 * which selects the material per object: the same geometry and transform with another supported material.
	 *
	 * @private
	 * @param {Object3D} level - The level.
	 * @param {Object3D} next - The next level.
	 * @return {boolean} Whether the levels can be merged.
	 */
	_canMergeLevels( level, next ) {

		return level.isMesh === true && next.isMesh === true && level.isInstancedMesh !== true && next.isInstancedMesh !== true &&
			level.geometry === next.geometry && level.material !== next.material && Array.isArray( next.material ) === false &&
			level.receiveShadow === next.receiveShadow && level.castShadow === next.castShadow && next.children.length === 0 &&
			level.layers.mask === next.layers.mask && level.matrixWorld.equals( next.matrixWorld ) &&
			this._isGPUDriven( level, level.geometry, level.material, null ) === true && this._isGPUDriven( next, next.geometry, next.material, null ) === true;

	}

	/**
	 * Returns `true` if the camera is inside of the given distance range of a level of a LOD object.
	 *
	 * @private
	 * @param {?Object} range - The distance range, or `null` if the object is not a level.
	 * @param {Camera} camera - The camera.
	 * @return {boolean} Whether the level is selected or not.
	 */
	_isLevelSelected( range, camera ) {

		if ( range === null ) return true;

		const levelDistance = _cameraPosition.setFromMatrixPosition( camera.matrixWorld ).distanceTo( range.position ) / camera.zoom;

		return levelDistance >= range.near && levelDistance < range.far;

	}

	isCulled( object, camera ) {

		// objects of the GPU-driven pipeline are culled on the GPU, per object and per cluster. the objects
		// captured from a static bundle group are culled every frame

		if ( this._isGPUDriven( object, object.geometry, object.material, null ) === true && ( this._capture !== null || this._clusters.has( object.geometry ) === true ) ) return false;

		return super.isCulled( object, camera );

	}

	pushRenderItem( renderList, object, geometry, material, groupOrder, z, group, clippingContext ) {

		if ( this._capture !== null && this._captureRenderItem( object, geometry, material, groupOrder, z, group, clippingContext ) === true ) {

			return null;

		}

		// levels of LOD objects drawn by the regular pipeline in a captured group are selected every frame, outside of the render bundle

		if ( this._capture !== null && this._lodRange !== null ) {

			this._capture.data.items.push( { object, geometry, material, groupOrder, group, clippingContext, range: this._lodRange } );

			return null;

		}

		if ( this._capture === null && this._isGPUDriven( object, geometry, material, group ) === true ) {

			const clusters = this._getClusters( geometry );

			if ( clusters !== null ) {

				const record = this._getRecord( renderList );

				// the instances of instanced meshes are drawn as objects

				const count = object.isInstancedMesh === true ? object.count : 1;

				if ( record.instanceCount + count <= this.maxInstances ) {

					const entry = this._getEntry( record, clusters, material, object.receiveShadow, object.isInstancedMesh === true, this._getFarMaterial() );

					if ( entry.objects.length === 0 ) {

						entry.groupOrder = groupOrder;
						entry.z = z;
						entry.clippingContext = clippingContext;

					}

					entry.objects.push( object );
					entry.levels.push( this._lodRange );
					entry.count += count;
					record.instanceCount += count;

					return null;

				}

				// the object skipped the culling on the CPU, but the GPU-driven pipeline of the render list is full

				if ( super.isCulled( object, this._camera ) === true ) return null;

			}

		}

		// levels of LOD objects drawn by the regular pipeline are selected by the CPU

		if ( this._isLevelSelected( this._lodRange, this._camera ) === false ) return null;

		return super.pushRenderItem( renderList, object, geometry, material, groupOrder, z, group, clippingContext );

	}

	/**
	 * Draws a static bundle group. When the render bundle of the group is recorded, the supported meshes are
	 * captured into the GPU-driven pipeline: they get fixed slots in its buffers and their transforms are
	 * uploaded once. The other objects are recorded into the render bundle as usual.
	 *
	 * @private
	 * @param {BundleGroup} bundleGroup - The bundle group.
	 * @param {Camera} camera - The camera.
	 * @param {number} groupOrder - The group order.
	 * @param {RenderList} renderList - The render list.
	 * @param {ClippingContext} clippingContext - The clipping context.
	 */
	_projectStaticGroup( bundleGroup, camera, groupOrder, renderList, clippingContext ) {

		const renderer = this.renderer;
		const record = this._getRecord( renderList );

		let data = record.staticGroups.get( bundleGroup );
		let capture = false;

		if ( data === undefined ) {

			data = {
				captureId: 0,
				pending: false,
				entries: [],
				lookup: new Map(),
				items: [],
				instanceCount: 0,
				projectionId: - 1,
				unusedProjections: 0
			};

			record.staticGroups.set( bundleGroup, data );

			// the render bundle might be recorded without the meshes of the GPU-driven pipeline

			capture = true;

		}

		// capture again while geometries of the group are processed, one per projection

		if ( data.pending === true ) capture = true;

		const renderBundle = renderer._bundles.get( bundleGroup, camera, renderer._currentRenderContext );
		const bundleNeedsUpdate = renderer._bundleNeedsUpdate( bundleGroup, renderer.backend.get( renderBundle ) );

		if ( capture === true || bundleNeedsUpdate === true ) {

			// the objects leaving the GPU-driven pipeline are recorded into the render bundle

			if ( bundleNeedsUpdate === false ) bundleGroup.needsUpdate = true;

			data.pending = false;
			data.captureId ++;
			data.instanceCount = 0;
			data.items.length = 0;

			for ( const entry of data.entries ) {

				entry.objects.length = 0;
				entry.levels.length = 0;
				entry.count = 0;
				entry.version = data.captureId;

			}

			this._capture = { data, clippingContext };

		}

		super.project( bundleGroup, camera, groupOrder, renderList, clippingContext );

		this._capture = null;

		for ( const item of data.items ) {

			if ( this._isLevelSelected( item.range, camera ) === true ) this._pushCapturedItem( renderList, camera, item );

		}

		if ( record.instanceCount + data.instanceCount <= this.maxInstances ) {

			data.projectionId = this._gpuProjectionId;
			record.instanceCount += data.instanceCount;

		} else {

			// the GPU-driven pipeline of the render list is full

			for ( const entry of data.entries ) {

				for ( let i = 0; i < entry.objects.length; i ++ ) {

					const object = entry.objects[ i ];

					if ( this._isLevelSelected( entry.levels[ i ], camera ) === false ) continue;

					this._pushCapturedItem( renderList, camera, { object, geometry: object.geometry, material: entry.material, groupOrder: entry.groupOrder, group: null, clippingContext: entry.clippingContext } );

				}

			}

		}

	}

	/**
	 * Captures a render item of the static bundle group being recorded into the GPU-driven pipeline,
	 * if supported.
	 *
	 * @private
	 * @param {Object3D} object - The 3D object.
	 * @param {BufferGeometry} geometry - The geometry.
	 * @param {Material} material - The material.
	 * @param {number} groupOrder - The group order.
	 * @param {number} z - The depth of the object.
	 * @param {?Object} group - The geometry group.
	 * @param {ClippingContext} clippingContext - The clipping context.
	 * @return {boolean} Whether the render item was captured, otherwise it is recorded into the render bundle.
	 */
	_captureRenderItem( object, geometry, material, groupOrder, z, group, clippingContext ) {

		const { data } = this._capture;

		// objects inside of clipping groups are clipped by the regular pipeline

		if ( clippingContext !== this._capture.clippingContext || this._isGPUDriven( object, geometry, material, group ) === false ) return false;

		const clusters = this._getClusters( geometry );

		if ( clusters === null ) {

			data.pending = true;

			return false;

		}

		const count = object.isInstancedMesh === true ? object.count : 1;
		const entry = this._getStaticEntry( data, clusters, material, object.receiveShadow, object.isInstancedMesh === true, this._getFarMaterial() );

		if ( entry.objects.length === 0 ) {

			entry.groupOrder = groupOrder;
			entry.z = z;
			entry.clippingContext = clippingContext;

		}

		entry.objects.push( object );
		entry.levels.push( this._lodRange );
		entry.count += count;
		data.instanceCount += count;

		return true;

	}

	/**
	 * Pushes a captured render item which can not be drawn by the GPU-driven pipeline, culled by the CPU.
	 *
	 * @private
	 * @param {RenderList} renderList - The render list.
	 * @param {Camera} camera - The camera.
	 * @param {Object} item - The captured render item.
	 */
	_pushCapturedItem( renderList, camera, item ) {

		const { object, geometry, material, groupOrder, group, clippingContext } = item;

		if ( super.isCulled( object, camera ) === true ) return;

		if ( this.renderer.sortObjects === true ) {

			if ( object.isSprite === true ) {

				_vector4.setFromMatrixPosition( object.matrixWorld );

			} else {

				if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

				_vector4.copy( geometry.boundingSphere.center ).applyMatrix4( object.matrixWorld );

			}

			_vector4.w = 1;
			_vector4.applyMatrix4( this._projScreenMatrix );

		}

		super.pushRenderItem( renderList, object, geometry, material, groupOrder, _vector4.z, group, clippingContext );

	}

	/**
	 * Returns the entry of a static bundle group collecting the objects of the given geometry, material and
	 * shadow state. The entries keep their batches between captures.
	 *
	 * @private
	 * @param {Object} data - The data of the static bundle group.
	 * @param {Object} clusters - The cluster data of the geometry.
	 * @param {Material} material - The material.
	 * @param {boolean} receiveShadow - Whether the objects receive shadows.
	 * @param {boolean} instanced - Whether the objects are instanced meshes.
	 * @param {?Material} farMaterial - The material beyond the switch distance of merged levels.
	 * @return {Object} The entry.
	 */
	_getStaticEntry( data, clusters, material, receiveShadow, instanced, farMaterial ) {

		let byClusters = data.lookup.get( material );

		if ( byClusters === undefined ) {

			byClusters = new Map();
			data.lookup.set( material, byClusters );

		}

		let byShadow = byClusters.get( clusters );

		if ( byShadow === undefined ) {

			byShadow = new Map();
			byClusters.set( clusters, byShadow );

		}

		const key = getEntryKey( receiveShadow, instanced, farMaterial );

		let entry = byShadow.get( key );

		if ( entry === undefined ) {

			entry = {
				clusters,
				material,
				farMaterial,
				receiveShadow,
				instanced,
				key,
				objects: [],
				levels: [],
				count: 0,
				groupOrder: 0,
				z: 0,
				clippingContext: null,
				batch: null,
				version: data.captureId
			};

			byShadow.set( key, entry );
			data.entries.push( entry );

		}

		return entry;

	}

	/**
	 * Returns `true` if the given object can be drawn by the GPU-driven pipeline in the current render call.
	 * Render lists of render bundles are recorded once, so only the objects of the top level render list
	 * and the objects captured from static bundle groups are drawn by the GPU-driven pipeline, which runs
	 * every frame.
	 *
	 * @private
	 * @param {Object3D} object - The 3D object.
	 * @param {BufferGeometry} geometry - The geometry.
	 * @param {Material|Array<Material>} material - The material.
	 * @param {?Object} group - The geometry group.
	 * @return {boolean} Whether the object can be drawn by the GPU-driven pipeline or not.
	 */
	_isGPUDriven( object, geometry, material, group ) {

		return this._gpuDrivenEnabled === true && ( this._depth === 1 || this._capture !== null ) && ( this._shadowPass === false || object.castShadow === true ) && isSupportedObject( object, geometry, group ) && this._isSupportedMaterial( material );

	}

	/**
	 * Returns `true` if objects with the given material can be drawn by the GPU-driven pipeline.
	 * The result is cached per material version.
	 *
	 * @private
	 * @param {Material} material - The material.
	 * @return {boolean} Whether the material is supported or not.
	 */
	_isSupportedMaterial( material ) {

		let cache = this._materials.get( material );

		if ( cache === undefined || cache.version !== material.version ) {

			cache = { version: material.version, supported: isSupportedMaterial( material, this.renderer ) };

			this._materials.set( material, cache );

		}

		return cache.supported;

	}

	finishRenderList( renderList ) {

		this._depth --;

		const record = this._renderListBatches.get( renderList );

		if ( record !== undefined ) this._drawBatches( renderList, record );

		super.finishRenderList( renderList );

	}

	/**
	 * Prepares the view of the given render list, for drawers using screen-space resources.
	 *
	 * @param {Object} record - The record of the render list.
	 * @param {number} width - The width of the view in pixels.
	 * @param {number} height - The height of the view in pixels.
	 * @return {?Object} The view, or `null` if the draw doesn't need one.
	 */
	updateView( record, width, height ) {

		const occlusion = this.occlusionCulling === true && this._shadowPass === false;

		let view = record.view;

		if ( view !== null && ( view.width !== width || view.height !== height || ( view.occlusion !== null ) !== occlusion ) ) {

			view.dispose();
			view = record.view = null;

		}

		if ( view === null ) view = record.view = this.createView( width, height, occlusion );

		return view;

	}

	/**
	 * Creates the view of a render list.
	 *
	 * @param {number} width - The width of the view in pixels.
	 * @param {number} height - The height of the view in pixels.
	 * @param {boolean} occlusion - Whether the clusters are occlusion culled.
	 * @return {?Object} The view, or `null` if the draw doesn't need one.
	 */
	createView( width, height, occlusion ) {

		if ( occlusion === false ) return null;

		const view = {
			width,
			height,
			occlusion: createOcclusion( width, height ),
			computeClear: null,
			dispose() {

				view.occlusion.dispose();

			}
		};

		return view;

	}

	/**
	 * Creates the batch drawing the objects of the given entry.
	 *
	 * @param {Object} entry - The objects sharing geometry, material and shadow state.
	 * @param {number} capacity - The maximum number of objects.
	 * @param {?Object} view - The view of the render list.
	 * @return {GPUDrivenBatch} The batch.
	 */
	createBatch( entry, capacity, view ) {

		return new GPUDrivenBatch( entry.clusters, entry.material, entry.receiveShadow, capacity, this.renderer, {
			debug: this.debug,
			shadow: this._shadowPass,
			depthPrepass: this._usesDepthPrepass(),
			instanced: entry.instanced,
			farMaterial: entry.farMaterial,
			view,
			occlusion: view !== null ? view.occlusion : null
		} );

	}

	/**
	 * Returns `true` if the batches of the current render call draw the depth of the clusters before their material.
	 *
	 * @private
	 * @return {boolean} Whether the depth prepass is used or not.
	 */
	_usesDepthPrepass() {

		return this.depthPrepass === true && this._shadowPass === false;

	}

	/**
	 * Runs the GPU-driven pipeline of the objects collected in this projection and adds the meshes of
	 * their batches to the render list. Batches are created and rebuilt here, once the view is known,
	 * and disposed if they were not used for several projections.
	 *
	 * @private
	 * @param {RenderList} renderList - The render list.
	 * @param {Object} record - The objects of the render list.
	 */
	_drawBatches( renderList, record ) {

		const renderer = this.renderer;
		const renderTarget = renderer.getRenderTarget();

		if ( renderTarget !== null ) _size.set( renderTarget.width, renderTarget.height );
		else renderer.getDrawingBufferSize( _size );

		const width = Math.floor( _size.x );
		const height = Math.floor( _size.y );

		// the level of detail is selected by the projected error in pixels of the view. shadow passes select it
		// by the texels of the shadow map, independent of the camera, so cached shadow maps stay valid

		const camera = this._camera;
		const lodView = this._lodView;

		lodView.position.setFromMatrixPosition( camera.matrixWorld );
		lodView.scale = camera.projectionMatrix.elements[ 5 ] * height / 2;
		lodView.perspective = camera.isPerspectiveCamera === true ? 1 : 0;
		lodView.threshold = this._shadowPass === true ? this.shadowLodThreshold : this.lodThreshold;

		const view = this.updateView( record, width, height );
		const occlusion = view !== null ? view.occlusion : null;

		const cullNodes = [];
		const computeNodes = [];
		const active = [];

		if ( occlusion !== null ) computeNodes.push( ...occlusion.computeNodes );
		if ( view !== null && view.computeClear !== null ) computeNodes.push( view.computeClear );

		let instanceOffset = 0;

		const drawEntry = ( entry ) => {

			// rebuild if the objects exceed the capacity, the view, the material or the debug mode changed

			let batch = entry.batch;

			if ( batch === null || entry.count > batch.capacity || batch.view !== view || batch.occlusion !== occlusion || batch.depthPrepass !== this._usesDepthPrepass() || batch.materialVersion !== entry.material.version || ( batch.farMaterial !== null && batch.farMaterialVersion !== batch.farMaterial.version ) || batch.debug !== this.debug ) {

				const capacity = Math.min( Math.max( batch !== null ? batch.capacity : 64, ceilPowerOfTwo( entry.count ) ), this.maxInstances );

				if ( batch !== null ) batch.dispose();

				batch = entry.batch = this.createBatch( entry, capacity, view );

			}

			// batches drawing into the view own a slice of its instance index range

			if ( batch.instanceOffset !== undefined ) {

				batch.instanceOffset.value = instanceOffset;
				instanceOffset += entry.count;

			}

			// the transforms of static bundle groups are uploaded once per capture

			const upload = entry.version === undefined || batch.uploadedVersion !== entry.version;

			batch.update( entry.objects, this._camera, this._projScreenMatrix, this._frustum, width, height, this, upload, entry.levels );
			batch.uploadedVersion = entry.version;

			cullNodes.push( ...batch.cullNodes );
			computeNodes.push( ...batch.computeNodes );
			active.push( entry );

		};

		// objects collected in this projection

		for ( let i = record.entries.length - 1; i >= 0; i -- ) {

			const entry = record.entries[ i ];

			if ( entry.projectionId !== this._gpuProjectionId ) {

				if ( ++ entry.unusedProjections >= MAX_UNUSED_PROJECTIONS ) {

					if ( entry.batch !== null ) entry.batch.dispose();

					record.entries.splice( i, 1 );
					record.lookup.get( entry.material ).get( entry.clusters ).delete( entry.key );

				}

				continue;

			}

			entry.unusedProjections = 0;

			drawEntry( entry );

		}

		// static bundle groups

		for ( const [ bundleGroup, data ] of record.staticGroups ) {

			if ( data.projectionId !== this._gpuProjectionId ) {

				if ( ++ data.unusedProjections >= MAX_UNUSED_PROJECTIONS ) {

					for ( const entry of data.entries ) {

						if ( entry.batch !== null ) entry.batch.dispose();

					}

					record.staticGroups.delete( bundleGroup );

				}

				continue;

			}

			data.unusedProjections = 0;

			for ( const entry of data.entries ) {

				if ( entry.objects.length > 0 ) drawEntry( entry );

			}

		}

		if ( record.entries.length === 0 && record.staticGroups.size === 0 && record.view !== null ) {

			record.view.dispose();
			record.view = null;

		}

		if ( active.length === 0 ) return;

		if ( occlusion !== null ) {

			// first phase, the depth of the clusters visible in the last frame and the second phase

			renderer.compute( cullNodes );

			this._renderOcclusionDepth( occlusion, active );

			renderer.compute( computeNodes );

		} else {

			// one compute call for all batches of the render list

			renderer.compute( [ ...cullNodes, ...computeNodes ] );

		}

		for ( const entry of active ) {

			const batch = entry.batch;

			// the resolve of the visibility buffer draws one box per object

			if ( batch.resolveMesh !== undefined ) batch.resolveMesh.count = entry.count;

			for ( const mesh of batch.meshes ) {

				super.pushRenderItem( renderList, mesh, mesh.geometry, mesh.material, entry.groupOrder, entry.z, null, entry.clippingContext );

			}

		}

	}

	/**
	 * Renders the depth of the clusters of the first phase into the depth of the occlusion view.
	 *
	 * @private
	 * @param {Object} occlusion - The occlusion data of the view.
	 * @param {Array<Object>} entries - The entries drawn in this projection.
	 */
	_renderOcclusionDepth( occlusion, entries ) {

		const renderer = this.renderer;
		const scene = occlusion.scene;

		scene.children.length = 0;

		for ( const entry of entries ) scene.children.push( ...entry.batch.prepassMeshes );

		const currentDrawer = renderer.drawer;
		const currentRenderTarget = renderer.getRenderTarget();
		const currentActiveCubeFace = renderer.getActiveCubeFace();
		const currentActiveMipmapLevel = renderer.getActiveMipmapLevel();
		const currentAutoClear = renderer.autoClear;
		const currentAutoClearDepth = renderer.autoClearDepth;
		const currentMRT = renderer.getMRT();

		// the meshes are drawn as they are, without the GPU-driven pipeline

		renderer.drawer = this._occlusionDrawer;
		renderer.setMRT( null );
		renderer.autoClear = true;
		renderer.autoClearDepth = true;

		renderer.setRenderTarget( occlusion.target );
		renderer.render( scene, this._camera );

		renderer.setRenderTarget( currentRenderTarget, currentActiveCubeFace, currentActiveMipmapLevel );
		renderer.autoClear = currentAutoClear;
		renderer.autoClearDepth = currentAutoClearDepth;
		renderer.setMRT( currentMRT );
		renderer.drawer = currentDrawer;

		scene.children.length = 0;

	}

	/**
	 * Returns the record of the given render list for the current projection.
	 *
	 * @private
	 * @param {RenderList} renderList - The render list.
	 * @return {Object} The record.
	 */
	_getRecord( renderList ) {

		let record = this._renderListBatches.get( renderList );

		if ( record === undefined ) {

			record = { entries: [], lookup: new Map(), staticGroups: new Map(), view: null, projectionId: - 1, instanceCount: 0 };

			this._renderListBatches.set( renderList, record );

		}

		if ( record.projectionId !== this._gpuProjectionId ) {

			record.projectionId = this._gpuProjectionId;
			record.instanceCount = 0;

		}

		return record;

	}

	/**
	 * Returns the entry collecting the objects of the given geometry, material and shadow state
	 * for the current projection.
	 *
	 * @private
	 * @param {Object} record - The record of the render list.
	 * @param {Object} clusters - The cluster data of the geometry.
	 * @param {Material} material - The material.
	 * @param {boolean} receiveShadow - Whether the objects receive shadows.
	 * @param {boolean} instanced - Whether the objects are instanced meshes.
	 * @param {?Material} farMaterial - The material beyond the switch distance of merged levels.
	 * @return {Object} The entry.
	 */
	_getEntry( record, clusters, material, receiveShadow, instanced, farMaterial ) {

		let byClusters = record.lookup.get( material );

		if ( byClusters === undefined ) {

			byClusters = new Map();
			record.lookup.set( material, byClusters );

		}

		let byShadow = byClusters.get( clusters );

		if ( byShadow === undefined ) {

			byShadow = new Map();
			byClusters.set( clusters, byShadow );

		}

		const key = getEntryKey( receiveShadow, instanced, farMaterial );

		let entry = byShadow.get( key );

		if ( entry === undefined ) {

			entry = {
				clusters,
				material,
				farMaterial,
				receiveShadow,
				instanced,
				key,
				objects: [],
				levels: [],
				count: 0,
				projectionId: - 1,
				unusedProjections: 0,
				groupOrder: 0,
				z: 0,
				clippingContext: null,
				batch: null
			};

			byShadow.set( key, entry );
			record.entries.push( entry );

		}

		if ( entry.projectionId !== this._gpuProjectionId ) {

			entry.projectionId = this._gpuProjectionId;
			entry.objects.length = 0;
			entry.levels.length = 0;
			entry.count = 0;

		}

		return entry;

	}

	/**
	 * Returns the far material of the level being projected, if it is merged with the next level.
	 *
	 * @private
	 * @return {?Material} The far material.
	 */
	_getFarMaterial() {

		return this._lodRange !== null ? this._lodRange.farMaterial : null;

	}

	/**
	 * Returns the cluster data of the given geometry, or `null` if it is not available yet.
	 * At most one geometry is processed per projection to avoid stalls.
	 *
	 * @private
	 * @param {BufferGeometry} geometry - The geometry.
	 * @return {?Object} The cluster data.
	 */
	_getClusters( geometry ) {

		let clusters = this._clusters.get( geometry );

		if ( clusters === undefined ) {

			if ( this._pendingGeometry === this._gpuProjectionId ) return null;

			this._pendingGeometry = this._gpuProjectionId;

			clusters = createClusters( geometry );

			this._clusters.set( geometry, clusters );

		}

		return clusters;

	}

}

function ceilPowerOfTwo( value ) {

	return Math.pow( 2, Math.ceil( Math.log2( value ) ) );

}

export { GPUDrivenDrawer, GPUDrivenBatch, createDebugMaterial, createDrawMaterial, createOcclusion };
