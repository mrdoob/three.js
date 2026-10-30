import {
	StandardDrawingPipeline,
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
	Fn, If, Loop, vec2, vec3, vec4, uvec4, int, uint, float, max, min, clamp, ceil, log2, select, dot, bool, distance, length, normalize, textureLoad, ivec2, mat4, sqrt,
	storage, uniform, uniformArray, instanceIndex, vertexIndex, varying, context as contextNode, overrideNodes, Return,
	modelWorldMatrix, modelWorldMatrixInverse, modelNormalMatrix, modelPosition, modelViewPosition, mat3,
	positionLocal, positionPrevious, normalLocal, transformNormal, velocity, materialColor,
	cameraViewMatrix, atomicAdd, atomicStore, atomicLoad, workgroupId, localId, floatBitsToUint, workgroupArray, workgroupBarrier, packHalf2x16, unpackHalf2x16
} from 'three/tsl';

import { createMeshlets, ready as clusterProcessingReady, MESHLET_SIZE, MAX_LODS } from '../utils/MeshletGeometryUtils.js';

// the offsets of the objects are stored as 32-bit floats in the batch table, which represent integers up to 2^24

const MAX_INSTANCES = 1 << 24;
const DEFAULT_MAX_BINDING_SIZE = 134217728;

// the growth of the buffers of the culling when it is created again

const CULLING_GROWTH = 1.5;

// the growth of the capacity of a batch when its objects exceed it

const BATCH_GROWTH = 1.25;

// the clusters of the visible objects are allocated every frame, the budget is a number of clusters per object
// and at least a minimum number of clusters. the clusters exceeding the budget are not drawn

const CLUSTERS_PER_OBJECT = 8;
const MIN_CLUSTER_BUDGET = 1 << 22;

// the work queue of a batch holds the visible clusters of its objects, a budget of clusters per object and at least
// the clusters of a number of objects. the counters of the culling are read every interval of projections, the
// budgets exceeded in the last frame grow by the growth of the culling

const QUEUE_ITEMS_PER_OBJECT = 4;
const QUEUE_MIN_OBJECTS = 64;
const COUNTER_READBACK_INTERVAL = 30;

// the occlusion culling is skipped while it culls less than this fraction of the visible clusters, the depth of its
// first phase would cost more than it saves. it's measured again in the last projections before each read of the counters

const OCCLUSION_MIN_CULLED = 0.3;
const OCCLUSION_PROBE_PROJECTIONS = 3;

const MAX_WORK_ITEMS = 1 << 20;
const MAX_WORKGROUPS = 65535;

// the culling of all batches of a render list: one thread per cluster of the visible objects, the parameters of the
// batches are rows of a table

const WORKGROUP_SIZE = 64;

// the rows of a batch in the table of the batches: [ object offset, object count, queue offset, queue capacity ],
// [ data offset, -, visibility offset, clusters per object ] and [ -, -, levels of detail, flags ]

const BATCH_STRIDE = 3;

// the rows of a geometry in the table of the geometries: [ center of the bounding sphere, radius ], [ levels of detail,
// first triangle in the geometry pool, first cluster, clusters of the most detailed level ] and the levels of detail
// [ first triangle, triangles, first cluster, error ]. the batches of a material draw objects of several geometries

const GEOMETRY_LOD_ROW = 2;
const GEOMETRY_STRIDE = GEOMETRY_LOD_ROW + MAX_LODS;

// the record of a slot stores its batch and its geometry

const GEOMETRY_SHIFT = 16;
const BATCH_MASK = ( 1 << GEOMETRY_SHIFT ) - 1;
const MAX_GEOMETRIES = BATCH_MASK;

// the selected level of an object, or CULLED. objects occluded as a whole and objects beyond the switch distance of
// the far material are flagged

const CULLED = 255;
const LOD_MASK = 255;
const OCCLUDED = 256;
const FAR = 512;

// the flags of a batch

const FLAG_CONE = 1;
const FLAG_FAR = 2;
const MAX_UNUSED_PROJECTIONS = 60;

// the shared attribute of the vertex pulling geometries, the number of vertices limits the hardware draws of the visibility buffer drawing pipeline

const PULLED_VERTICES = 65536 * 3;

// node material properties which change the geometry, the coverage or the output of the draw

const UNSUPPORTED_NODES = [
	'vertexNode', 'geometryNode', 'depthNode', 'fragmentNode', 'outputNode',
	'contextNode', 'backdropNode', 'backdropAlphaNode', 'alphaTestNode', 'castShadowNode', 'maskShadowNode'
];

const _size = /*@__PURE__*/ new Vector2();
const _vector4 = /*@__PURE__*/ new Vector4();
const _cameraPosition = /*@__PURE__*/ new Vector3();

// the distance range of objects which are not levels of LOD objects

const NO_LEVEL_DISTANCE = 3.4e38;
const NO_LEVEL_NEAR = Math.fround( - NO_LEVEL_DISTANCE );
const NO_LEVEL_FAR = Math.fround( NO_LEVEL_DISTANCE );
const _objectWorld = /*@__PURE__*/ new Float32Array( 16 );
const IDENTITY_MATRIX = /*@__PURE__*/ new Float32Array( [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ] );
const EMPTY_HISTORY = { transform: [], object: [] };
const EMPTY_NODES = [];

// the slots written by an upload: slots closer than the gap are uploaded in one range, too many ranges in one range

const RANGE_GAP = 32;
const MAX_UPDATE_RANGES = 64;

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
 * Links a draw material property to its source. Assigning a pipeline-specific override detaches
 * the property without changing the source material.
 *
 * @private
 * @param {Material} material - The draw material.
 * @param {Material} source - The source material.
 * @param {string} key - The property name.
 */
function linkMaterialProperty( material, source, key ) {

	Object.defineProperty( material, key, {
		configurable: true,
		enumerable: true,
		get() {

			return source[ key ];

		},
		set( value ) {

			Object.defineProperty( this, key, { configurable: true, enumerable: true, writable: true, value } );

		}
	} );

}

/**
 * Creates the node material that draws the merged objects. The material keeps its own identity,
 * listeners and pipeline overrides, while reading live properties from the source material.
 *
 * @private
 * @param {Material} source - The material of the merged objects.
 * @param {Renderer} renderer - The renderer.
 * @return {NodeMaterial} The node material.
 */
function createDrawMaterial( source, renderer ) {

	const NodeMaterialClass = renderer.library.getMaterialNodeClass( source.type );
	const material = source.isNodeMaterial === true ? source.clone() : new NodeMaterialClass();

	for ( const key in source ) {

		if ( key === '_listeners' || key === 'uuid' || key === 'version' || key === 'type' ) continue;

		linkMaterialProperty( material, source, key );

	}

	return material;

}

/**
 * Creates the material of a depth-only draw of objects with an alpha-tested material: the alpha of the
 * material is computed like the alpha of the diffuse color, so the same fragments are discarded.
 *
 * @private
 * @param {Material} source - The alpha-tested material.
 * @return {MeshBasicNodeMaterial} The material.
 */
function createAlphaDepthMaterial( source ) {

	const material = new MeshBasicNodeMaterial();

	for ( const key of [ 'color', 'map', 'alphaMap', 'opacity', 'opacityNode', 'colorNode', 'alphaTest' ] ) {

		if ( source[ key ] !== undefined ) linkMaterialProperty( material, source, key );

	}

	return material;

}

/**
 * Returns `true` if objects with the given material can be drawn by the GPU-driven pipeline. The material
 * must be opaque or alpha-tested and its nodes must not change the geometry, the coverage or the output of the draw.
 *
 * @private
 * @param {Material} material - The material.
 * @param {Renderer} renderer - The renderer.
 * @return {boolean} Whether the material is supported or not.
 */
function isSupportedMaterial( material, renderer ) {

	if ( material.isNodeMaterial !== true && renderer.library.getMaterialNodeClass( material.type ) === null ) return false;

	if ( material.transparent === true || material.transmission > 0 || material.alphaHash === true || material.alphaToCoverage === true ) return false;
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
 * Returns the accessors of matrices stored as four vec4 columns in a storage buffer of vec4 elements.
 *
 * @private
 * @param {StorageBufferNode} buffer - The storage buffer.
 * @param {number} offset - The element of the first matrix.
 * @return {{element: function(Node<uint>): Node<mat4>, assign: function(Node<uint>, Node<mat4>): void}} The accessors.
 */
function createMatrices( buffer, offset ) {

	const column = ( index, i ) => buffer.element( uint( index ).mul( 4 ).add( offset + i ) );

	return {
		element: ( index ) => mat4( column( index, 0 ), column( index, 1 ), column( index, 2 ), column( index, 3 ) ),
		assign: ( index, matrix ) => {

			for ( let i = 0; i < 4; i ++ ) column( index, i ).assign( matrix.element( i ) );

		}
	};

}

/**
 * Returns the bounding sphere of the given geometry, computed if missing.
 *
 * @private
 * @param {BufferGeometry} geometry - The geometry.
 * @return {Sphere} The bounding sphere.
 */
function getBoundingSphere( geometry ) {

	if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

	return geometry.boundingSphere;

}

/**
 * Returns an attribute function for a context which provides attributes. Contexts must return the same node for the
 * same attribute, so the node of each attribute is created once.
 *
 * @private
 * @param {function(string, NodeBuilder): ?Node} getAttribute - Creates the node of an attribute, `null` if not provided.
 * @return {function(string, NodeBuilder): ?Node} The attribute function of the context.
 */
function cacheAttributes( getAttribute ) {

	const nodes = new Map();

	return ( name, builder ) => {

		if ( nodes.has( name ) === false ) nodes.set( name, getAttribute( name, builder ) );

		return nodes.get( name );

	};

}

/**
 * Returns `true` if the given material has a position node, which deforms the positions of the objects.
 *
 * @private
 * @param {Material} material - The material.
 * @return {boolean} Whether the material deforms the positions or not.
 */
function isDeformedMaterial( material ) {

	return material.isNodeMaterial === true && material.positionNode !== null && material.positionNode !== undefined;

}

// the margin of positions whose deformation can't be evaluated on the GPU, the objects are never culled

const UNBOUNDED_MARGIN = 1e20;

// the unit normals of a regular tetrahedron, their sum is zero

const TETRAHEDRON_NORMALS = [[ 1, 1, 1 ], [ 1, - 1, - 1 ], [ - 1, 1, - 1 ], [ - 1, - 1, 1 ]].map( ( v ) => vec3( ...v.map( ( c ) => c / Math.sqrt( 3 ) ) ) );

// rounds half floats up, their relative precision is 2^-11

const HALF_ROUND_UP = 1.001;

/**
 * Evaluates a position node on the GPU and returns the affine transform which approximates it on the bounding sphere
 * of the geometry: the node is evaluated at the center and at both ends of each axis, the central differences give the
 * linear part. Affine deformations like translations, rotations and scales, of any distance, are represented exactly.
 * The second differences measure the curvature of other deformations, they are returned as the margin of the bounds.
 *
 * The node is evaluated with the position of the geometry and the position transformed by the instance matrix, like
 * the regular instancing of node materials. The normal is unknown at these positions: if the node reads it, the node
 * is evaluated with the four unit normals of a regular tetrahedron per position. Their mean is the position, their
 * spread bounds the displacement of any unit normal for nodes which are linear in the normal, like a displacement
 * along the normal. Nodes which read other attributes or the vertex index can't be evaluated at arbitrary positions:
 * the unbounded uniform is set while the node is built, and the objects are not culled.
 *
 * @private
 * @param {Node<vec3>} positionNode - The position node of the material.
 * @param {Node<mat4>} instanceMatrix - The instance matrix, identity for objects which are not instanced meshes.
 * @param {Node<uint>} instance - The instance index of the material.
 * @param {Node<vec4>} bounds - The bounding sphere of the geometry.
 * @param {{unbounded: UniformNode<float>, normalSamples: UniformNode<int>}} state - Set while the node is built: whether
 * the node can't be evaluated at arbitrary positions, and the number of normals per position.
 * @return {{matrix: Node<mat4>, margin: Node<float>}} The affine transform in the space of the geometry and the margin.
 */
function createDeformation( positionNode, instanceMatrix, instance, bounds, { unbounded, normalSamples } ) {

	const center = bounds.xyz.toVar();
	const radius = max( bounds.w, 1e-6 ).toVar();
	const point = vec3( 0 ).toVar();
	const normal = vec3( 0, 1, 0 ).toVar();

	const unsupported = ( value ) => () => {

		unbounded.value = 1;

		return value;

	};

	const sampleNormal = () => {

		normalSamples.value = TETRAHEDRON_NORMALS.length;

		return normal;

	};

	const getAttribute = cacheAttributes( ( name ) => {

		if ( name === 'position' ) return point;
		if ( name === 'normal' ) return sampleNormal();

		return unsupported( vec4( 0 ) )();

	} );

	const deformed = contextNode( positionNode.overrideNodes( [
		[ positionLocal, instanceMatrix.mul( vec4( point, 1.0 ) ).xyz ],
		[ normalLocal, sampleNormal ],
		[ instanceIndex, instance ],
		[ vertexIndex, unsupported( uint( 0 ) ) ]
	] ), { getAttribute } );

	// the center, then the negative and the positive end of the x, y and z axes, the node is built once in the loops

	const samples = [ vec3( 0 ).toVar(), vec3( 0 ).toVar(), vec3( 0 ).toVar(), vec3( 0 ).toVar(), vec3( 0 ).toVar(), vec3( 0 ).toVar(), vec3( 0 ).toVar() ];
	const normalMargin = float( 0 ).toVar();

	Loop( { start: 0, end: 7, type: 'int' }, ( { i } ) => {

		const axis = i.sub( 1 ).div( 2 );
		const direction = select( i.sub( 1 ).mod( 2 ).equal( 0 ), float( - 1 ), float( 1 ) );
		const offset = vec3( select( axis.equal( 0 ), direction, 0.0 ), select( axis.equal( 1 ), direction, 0.0 ), select( axis.equal( 2 ), direction, 0.0 ) );

		point.assign( center.add( select( i.equal( 0 ), vec3( 0 ), offset ).mul( radius ) ) );

		// the positions of the normals relative to the first one, which keeps the sums precise far from the origin

		const first = vec3( 0 ).toVar();
		const sum = vec3( 0 ).toVar();
		const sumSquared = float( 0 ).toVar();

		Loop( { start: 0, end: normalSamples, type: 'int', name: 'n' }, ( { n } ) => {

			normal.assign( select( n.equal( 1 ), TETRAHEDRON_NORMALS[ 1 ], select( n.equal( 2 ), TETRAHEDRON_NORMALS[ 2 ], select( n.equal( 3 ), TETRAHEDRON_NORMALS[ 3 ], TETRAHEDRON_NORMALS[ 0 ] ) ) ) );

			const value = vec3( deformed ).toVar();

			If( n.equal( 0 ), () => {

				first.assign( value );

			} );

			const delta = value.sub( first );

			sum.addAssign( delta );
			sumSquared.addAssign( delta.dot( delta ) );

		} );

		// the mean is the position, the spread of the tetrahedron normals is 4/3 of the squared norm of the linear part

		const count = float( normalSamples );
		const mean = sum.div( count );
		const value = first.add( mean ).toVar();

		normalMargin.assign( max( normalMargin, sqrt( max( sumSquared.sub( mean.dot( mean ).mul( count ) ), 0.0 ).mul( 0.75 ) ) ) );

		let branch = If( i.equal( 0 ), () => {

			samples[ 0 ].assign( value );

		} );

		for ( let s = 1; s < 7; s ++ ) {

			branch = branch.ElseIf( i.equal( s ), () => {

				samples[ s ].assign( value );

			} );

		}

	} );

	const [ origin, negX, posX, negY, posY, negZ, posZ ] = samples;

	const axisX = posX.sub( negX ).div( radius.mul( 2 ) );
	const axisY = posY.sub( negY ).div( radius.mul( 2 ) );
	const axisZ = posZ.sub( negZ ).div( radius.mul( 2 ) );
	const translation = origin.sub( axisX.mul( center.x ) ).sub( axisY.mul( center.y ) ).sub( axisZ.mul( center.z ) );

	const curvature = max( length( posX.add( negX ).mul( 0.5 ).sub( origin ) ), max( length( posY.add( negY ).mul( 0.5 ).sub( origin ) ), length( posZ.add( negZ ).mul( 0.5 ).sub( origin ) ) ) );

	return {
		matrix: mat4( vec4( axisX, 0 ), vec4( axisY, 0 ), vec4( axisZ, 0 ), vec4( translation, 1 ) ),
		margin: select( unbounded.greaterThan( 0 ), float( UNBOUNDED_MARGIN ), curvature.add( normalMargin ) )
	};

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
function getEntryKey( receiveShadow, instanced, instanceColor, farMaterial ) {

	return ( receiveShadow ? 1 : 0 ) + ( instanced ? 2 : 0 ) + ( instanceColor ? 4 : 0 ) + ( farMaterial !== null ? ':' + farMaterial.id : '' );

}

/**
 * Returns `true` if the given object can be drawn by the GPU-driven pipeline. The instances of instanced
 * meshes are drawn as objects of the batch.
 *
 * @private
 * @param {Object3D} object - The 3D object.
 * @param {BufferGeometry} geometry - The geometry.
 * @param {?Object} group - The geometry group.
 * @param {boolean} [allowEmpty=false] - Whether empty instanced meshes can be prepared.
 * @return {boolean} Whether the object is supported or not.
 */
function isSupportedObject( object, geometry, group, allowEmpty = false ) {

	if ( object.isMesh !== true || object.isSkinnedMesh === true || object.isBatchedMesh === true ) return false;
	if ( object.occlusionTest === true ) return false;
	if ( Array.isArray( object.material ) && group === null ) return false;

	if ( group !== null ) {

		const count = geometry.index !== null ? geometry.index.count : geometry.attributes.position?.count ?? 0;

		if ( Number.isInteger( group.start ) === false || group.start < 0 || count - group.start < 3 || group.count < 3 || ( Number.isFinite( group.count ) === false && group.count !== Infinity ) ) return false;

	}

	if ( object.isInstancedMesh === true ) {

		// the instances are drawn as objects of the batch. instance matrices and colors written on the GPU are not supported

		if ( object.instanceMatrix.isStorageInstancedBufferAttribute === true || object.instanceColor?.isStorageInstancedBufferAttribute === true || object.morphTexture !== null || ( object.count === 0 && allowEmpty === false ) ) return false;

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
	const target = new RenderTarget( width, height, { depthTexture, count: 0 } );

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

		} )().compute( level.width * level.height ).setName( 'MeshletDrawingPipeline HZB' );

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
 * The culling of all batches of one render list, in one set of compute dispatches. The objects, the clusters of
 * their geometries, the work queues and the indirect draw arguments of all batches are stored in shared buffers,
 * each batch owns a range of them. The parameters of the batches are stored in a table, so all batches share the
 * compute shaders:
 *
 * - one thread per object culls the object, selects its level of detail and allocates the clusters of the level,
 * - the clusters are dispatched indirectly, one thread per cluster culls the cluster and appends it to the work
 * queue of its batch,
 * - one thread per queue writes the indirect draw arguments of the batches.
 *
 * Occlusion culling adds the draw of the clusters visible in the last frame into the depth of the occlusion
 * view, one thread per object tests its bounding sphere and the clusters are tested in a second phase.
 *
 * @private
 */
class MeshletCulling {

	/**
	 * Constructs a new culling.
	 *
	 * @param {Object} capacity - The capacity of the shared buffers.
	 * @param {number} capacity.batches - The maximum number of batches.
	 * @param {number} capacity.objects - The maximum number of objects of all batches.
	 * @param {number} capacity.queue - The maximum number of work items of all batches.
	 * @param {number} capacity.clusters - The maximum number of clusters of the visible objects of all batches in a frame.
	 * @param {number} capacity.visibility - The maximum number of clusters of all objects, for the occlusion culling.
	 * @param {number} capacity.chunks - The maximum number of clusters of all geometries.
	 * @param {Object} parameters - The configuration parameter.
	 * @param {boolean} parameters.shadow - Whether the culling draws the shadow casters of a shadow pass.
	 * @param {?Object} parameters.occlusion - The occlusion data of the view, if the clusters are occlusion culled.
	 * @param {?Function} parameters.boundsNode - Returns the bounding sphere of the deformed positions.
	 * @param {?Object} parameters.view - The view of the render list.
	 */
	constructor( capacity, { shadow, occlusion, boundsNode, view } ) {

		this.capacity = capacity;
		this.shadow = shadow;
		this.occlusion = occlusion;
		this.boundsNode = boundsNode;
		this.view = view;

		this.batches = [];
		this.attributes = [];

		// the allocated ranges of the batches, see add()

		this.objectEnd = 0;
		this.dataEnd = 0;
		this.queueEnd = 0;
		this.visibilityEnd = 0;
		this.chunkEnd = 0;
		this.batchEnd = 0;
		this.geometryEnd = 0;
		this.geometryIndices = new WeakMap();

		// the world matrices are followed by the matrices of the previous frame, for the velocity of temporal effects

		const history = shadow === false;

		this.history = history;

		// the values depending on the capacity: the offset of the previous matrices, the offset of the table, the offset of
		// the arguments of the occlusion prepass and the maximum number of clusters of the visible objects

		this.historyOffset = uniform( 0, 'uint' );
		this.tableOffset = uniform( 0, 'uint' );
		this.geometryOffset = uniform( 0, 'uint' );
		this.prepassArgsBase = uniform( 0, 'uint' );
		this.occludedCounter = uniform( 0, 'uint' );
		this.maxClusters = uniform( 0, 'uint' );

		// the buffers are allocated for the capacity and replaced by resize(), the nodes reading them and the batches stay valid

		this.allocate( capacity );

		// the data of the objects: the world matrix, the bounding sphere ( w: the maximum scale, negative if the scale is
		// not uniform ), the level of LOD objects ( the position of the LOD object, the distance range and the distance of
		// the far material ) and the view projection of the world matrix. the batches of the groups of the same objects
		// share the data of the objects, each batch has its own slots of the culling

		const instanceWorld = storage( this.worldAttribute, 'mat4' ).toReadOnly();
		const instanceBounds = storage( this.boundsAttribute, 'vec4' ).toReadOnly();
		const instanceLevel = storage( this.levelAttribute, 'vec4' ).toReadOnly();
		const instanceMvp = storage( this.mvpAttribute, 'mat4' );

		// the world matrices and bounds written on the GPU, by the batches of instanced meshes

		this.worldWrite = storage( this.worldAttribute, 'mat4' );
		this.boundsWrite = storage( this.boundsAttribute, 'vec4' );

		// the record of each slot: its first cluster, its level ( LOD_MASK, CULLED if the object is not visible ) with
		// the OCCLUDED and FAR flags and its batch, its scale and the batch of the slot, written by add()

		const instanceRecord = storage( this.recordAttribute, 'uvec4' );

		this.instanceWorld = instanceWorld;
		this.instanceBounds = instanceBounds;
		this.instanceMvp = instanceMvp;

		// the clusters of the geometries: bounding sphere and normal cone, followed by the batch table.
		// sharing their storage buffer keeps the table independent of the uniform binding size without
		// adding a storage binding to the cluster culling ( eight bindings with occlusion culling )

		const chunkPool = storage( this.chunkAttribute, 'vec4' ).toReadOnly();

		// the parameters of the batches, see add()

		const row = ( batch, index ) => chunkPool.element( batch.mul( BATCH_STRIDE ).add( index ).add( this.tableOffset ) );
		const rowBits = ( batch, index ) => floatBitsToUint( row( batch, index ) );

		// the parameters of the geometries, see addGeometry()

		const geometryRow = ( geometry, index ) => chunkPool.element( geometry.mul( GEOMETRY_STRIDE ).add( index ).add( this.geometryOffset ) );
		const geometryRowBits = ( geometry, index ) => floatBitsToUint( geometryRow( geometry, index ) );

		// the counters: the clusters, then the near and the far queue of each batch and the clusters culled by the occlusion

		const counters = storage( this.countersAttribute, 'uint' ).toAtomic();
		const countersRead = storage( this.countersAttribute, 'uint' ).toReadOnly();

		this.countersRead = countersRead;

		// the work queues of the batches — one item is a cluster of a visible object

		const workQueue = storage( this.queueAttribute, 'uvec4' );

		this.workQueue = workQueue;

		// the object of each cluster of the visible objects

		const clusterOwner = storage( this.clusterOwnerAttribute, 'uint' );
		const maxClusters = this.maxClusters;

		this.clusterDispatchAttribute = new IndirectStorageBufferAttribute( new Uint32Array( [ 0, 1, 1, 0 ] ), 4 );

		const clusterDispatchAttribute = this.clusterDispatchAttribute;
		const clusterDispatch = storage( clusterDispatchAttribute, 'uint', 4 );

		// the indirect draw arguments of the queues of the batches, followed by the arguments of the occlusion prepass

		const args = storage( this.argsAttribute, 'uint' );

		// the visibility of the clusters of all objects in the last frame, for the occlusion culling

		const clusterVisibility = occlusion !== null ? storage( this.visibilityAttribute, 'uint' ) : null;

		this.bufferNodes = [
			[ instanceWorld, 'worldAttribute' ], [ this.worldWrite, 'worldAttribute' ], [ instanceBounds, 'boundsAttribute' ], [ this.boundsWrite, 'boundsAttribute' ],
			[ instanceLevel, 'levelAttribute' ], [ instanceMvp, 'mvpAttribute' ], [ instanceRecord, 'recordAttribute' ], [ chunkPool, 'chunkAttribute' ],
			[ counters, 'countersAttribute' ], [ countersRead, 'countersAttribute' ], [ workQueue, 'queueAttribute' ], [ clusterOwner, 'clusterOwnerAttribute' ],
			[ args, 'argsAttribute' ]
		];

		if ( clusterVisibility !== null ) this.bufferNodes.push( [ clusterVisibility, 'visibilityAttribute' ] );

		// the view

		this.projScreenMatrix = uniform( new Matrix4() );
		this.frustumPlanes = uniformArray( [ new Vector4(), new Vector4(), new Vector4(), new Vector4(), new Vector4(), new Vector4() ], 'vec4' );
		this.cameraPosition = uniform( new Vector3() );
		this.cameraZoom = uniform( 1.0 );
		this.viewSize = uniform( new Vector2() );

		// the view selecting the level of detail, orthographic views select it independent of the distance

		this.lodPosition = uniform( new Vector3() );
		this.lodScale = uniform( 1.0 );
		this.lodPerspective = uniform( 1.0 );
		this.lodThreshold = uniform( 1.0 );

		// the radius of objects on the screen in pixels below which they are not drawn, or drawn with their simplest level

		this.minScreenRadius = uniform( 0.0 );
		this.coarseScreenRadius = uniform( 0.0 );

		const { projScreenMatrix, frustumPlanes, cameraPosition, cameraZoom, lodPosition, lodScale, lodPerspective, lodThreshold, minScreenRadius, coarseScreenRadius } = this;

		// the bounding sphere of the drawn positions: the positions can be deformed by the render call, like a curved
		// world, the culling tests the deformed bounds. the level of detail is selected by the real bounds

		const deformBounds = ( center, radius ) => boundsNode !== null ? vec4( boundsNode( vec4( center, radius ), cameraPosition ) ).toVar() : vec4( center, radius );

		const isOccluded = occlusion !== null ? createOcclusionTest( occlusion ) : null;

		const computeReset = Fn( () => {

			atomicStore( counters.element( instanceIndex ), uint( 0 ) );

		} )().compute( this.countersAttribute.count ).setName( 'MeshletDrawingPipeline Reset' );

		this.computeReset = computeReset;

		// one thread per object: culling, level of detail and the clusters of the level. the clusters of a workgroup
		// are allocated with one atomic operation, the visible objects would contend for the counter

		this.objectEndNode = uniform( 0, 'uint' );

		const objectEnd = this.objectEndNode;
		const workgroupClusters = workgroupArray( 'uint', 1 ).toAtomic();
		const workgroupBase = workgroupArray( 'uint', 1 );

		const computeCull = Fn( () => {

			const slot = instanceIndex;
			const slotData = instanceRecord.element( slot ).w.toVar();
			const batch = slotData.bitAnd( BATCH_MASK ).toVar();
			const geometryIndex = slotData.shiftRight( GEOMETRY_SHIFT ).toVar();

			const batchObjects = rowBits( batch, 0 );
			const local = slot.sub( uint( batchObjects.x ) );

			const lodLevel = uint( CULLED ).toVar();
			const clusterCount = uint( 0 ).toVar();
			const scaleBits = uint( 0 ).toVar();

			// the scale of the object and the margin of its deformed positions for the cluster culling, as half floats rounded
			// up. the binding of the bounds would exceed the storage buffers of the cluster culling with occlusion culling

			If( slot.lessThan( objectEnd ).and( local.lessThan( uint( batchObjects.y ) ) ), () => {

				const batchGeometry = row( batch, 2 );
				const flags = uint( batchGeometry.w );
				const geometryBounds = geometryRow( geometryIndex, 0 );
				const geometryLevels = geometryRowBits( geometryIndex, 1 );

				// the transform, the scale and the level of the object, shared by the batches of the groups of the object

				const data = rowBits( batch, 1 ).x.add( local ).toVar();
				const dataFar = instanceLevel.element( data.mul( 2 ).add( 1 ) );
				const matrixWorld = instanceWorld.element( data ).toVar();

				// the scale of the object and the margin of positions deformed by its position node, see MeshletBatch

				const bounds = instanceBounds.element( data );
				const center = matrixWorld.mul( vec4( geometryBounds.xyz, 1.0 ) ).xyz.toVar();
				const scale = bounds.w.abs();
				const radius = scale.mul( geometryBounds.w ).add( bounds.x );
				const cullBounds = deformBounds( center, radius );

				const visible = bool( true ).toVar();

				Loop( { start: 0, end: 6 }, ( { i } ) => {

					const plane = frustumPlanes.element( i );

					If( dot( plane.xyz, cullBounds.xyz ).add( plane.w ).lessThan( cullBounds.w.negate() ), () => {

						visible.assign( false );

					} );

				} );

				// the level of a LOD object is selected by the distance of the camera to the LOD object, like LOD.update()

				const levelData = instanceLevel.element( data.mul( 2 ) );
				const levelDistance = distance( cameraPosition, levelData.xyz ).div( cameraZoom ).toVar();

				If( levelDistance.lessThan( levelData.w ).or( levelDistance.greaterThanEqual( dataFar.x ) ), () => {

					visible.assign( false );

				} );

				// screen-space projected error: pixelError = errorWorld / dist * cotHalfFov * screenHeight / 2,
				// orthographic views: pixelError = errorWorld * 2 / frustumHeight * screenHeight / 2

				const lodDistance = select( lodPerspective.greaterThan( 0.5 ), max( 0.01, distance( lodPosition, center ) ), float( 1.0 ) );
				const pixelFactor = lodScale.div( lodDistance ).toVar();

				// the radius of the object on the screen in pixels, the objects smaller than the minimum are not drawn

				const screenRadius = scale.mul( geometryBounds.w ).mul( pixelFactor ).toVar();

				If( screenRadius.lessThan( minScreenRadius ), () => {

					visible.assign( false );

				} );

				If( visible, () => {

					// the errors grow with the level, so the last level within the threshold is the simplest acceptable one

					const lodCount = min( geometryLevels.x, uint( batchGeometry.z ) ).toVar();

					lodLevel.assign( 0 );

					Loop( { name: 'lod', type: 'uint', start: uint( 1 ), end: lodCount, condition: '<' }, ( { lod } ) => {

						If( geometryRow( geometryIndex, lod.add( GEOMETRY_LOD_ROW ) ).w.mul( scale ).mul( pixelFactor ).lessThanEqual( lodThreshold ), () => {

							lodLevel.assign( lod );

						} );

					} );

					// the objects smaller than the coarse radius use their simplest level

					If( screenRadius.lessThan( coarseScreenRadius ), () => {

						lodLevel.assign( lodCount.sub( 1 ) );

					} );

					instanceMvp.element( data ).assign( projScreenMatrix.mul( matrixWorld ) );

					// the clusters of the level

					clusterCount.assign( uint( geometryRow( geometryIndex, lodLevel.add( GEOMETRY_LOD_ROW ) ).y ).div( MESHLET_SIZE ) );

					// the far material beyond the switch distance

					If( flags.bitAnd( FLAG_FAR ).notEqual( uint( 0 ) ).and( levelDistance.greaterThanEqual( dataFar.y ) ), () => {

						lodLevel.assign( lodLevel.bitOr( FAR ) );

					} );

					scaleBits.assign( packHalf2x16( vec2( bounds.w, bounds.x ).mul( HALF_ROUND_UP ) ) );

				} );

			} );

			// the offset of the clusters of the object in the workgroup, then one atomic operation per workgroup

			const localOffset = atomicAdd( workgroupClusters.element( uint( 0 ) ), clusterCount ).toVar();

			workgroupBarrier();

			If( localId.x.equal( uint( 0 ) ), () => {

				workgroupBase.element( uint( 0 ) ).assign( atomicAdd( counters.element( 0 ), atomicLoad( workgroupClusters.element( uint( 0 ) ) ) ) );

			} );

			workgroupBarrier();

			const firstCluster = workgroupBase.element( uint( 0 ) ).add( localOffset ).toVar();

			If( slot.lessThan( objectEnd ), () => {

				instanceRecord.element( slot ).assign( uvec4( firstCluster, lodLevel.bitOr( batch.shiftLeft( 16 ) ), scaleBits, slotData ) );

			} );

			Loop( { name: 'cluster', type: 'uint', start: uint( 0 ), end: clusterCount, condition: '<' }, ( { cluster } ) => {

				const index = firstCluster.add( cluster );

				If( index.lessThan( maxClusters ), () => {

					clusterOwner.element( index ).assign( slot );

				} );

			} );

		} )().compute( capacity.objects ).setName( 'MeshletDrawingPipeline Cull' );

		// the dispatch of one thread per cluster, in rows of MAX_WORKGROUPS workgroups

		const computeClusterArgs = Fn( () => {

			const workgroups = min( countersRead.element( 0 ), maxClusters ).add( WORKGROUP_SIZE - 1 ).div( WORKGROUP_SIZE );

			clusterDispatch.element( 0 ).assign( min( workgroups, uint( MAX_WORKGROUPS ) ) );
			clusterDispatch.element( 1 ).assign( workgroups.add( MAX_WORKGROUPS - 1 ).div( MAX_WORKGROUPS ) );
			clusterDispatch.element( 2 ).assign( uint( 1 ) );

		} )().compute( 1 ).setName( 'MeshletDrawingPipeline Cluster Args' );

		// occlusion culling in two phases: the first phase draws the clusters visible in the last frame, which
		// are rendered into the depth of the occlusion view. the second phase tests all clusters against the
		// hierarchical depth of this depth and adds the newly visible clusters. a cluster stores its level of
		// detail + 1 if it was visible, the clusters of another level are tested in the second phase

		// one thread per cluster of the visible objects

		const createClusterCull = ( phase ) => Fn( () => {

			const clusterIndex = workgroupId.y.mul( MAX_WORKGROUPS ).add( workgroupId.x ).mul( WORKGROUP_SIZE ).add( localId.x ).toVar();

			If( clusterIndex.greaterThanEqual( min( atomicLoad( counters.element( 0 ) ), maxClusters ) ), () => {

				Return();

			} );

			const slot = clusterOwner.element( clusterIndex ).toVar();
			const record = instanceRecord.element( slot ).toVar();
			const chunk = clusterIndex.sub( record.x ).toVar();
			const lodLevel = record.y.bitAnd( LOD_MASK );
			const far = record.y.bitAnd( FAR ).notEqual( uint( 0 ) );
			const batch = record.y.shiftRight( 16 ).toVar();
			const geometryIndex = record.w.shiftRight( GEOMETRY_SHIFT ).toVar();
			const objectBounds = unpackHalf2x16( record.z );
			const objectScale = objectBounds.x;

			const batchObjects = rowBits( batch, 0 );
			const batchQueues = rowBits( batch, 1 );
			const batchGeometry = row( batch, 2 );
			const geometryLevels = geometryRowBits( geometryIndex, 1 );
			const lodData = geometryRow( geometryIndex, lodLevel.add( GEOMETRY_LOD_ROW ) );

			const local = slot.sub( uint( batchObjects.x ) );
			const maxChunks = uint( batchQueues.w );
			const visibilityIndex = uint( batchQueues.z ).add( local.mul( maxChunks ) ).add( chunk );

			// the first triangle of the level in the geometry pool, the draws read the triangles of all geometries

			const lodTriangleStart = geometryLevels.y.add( uint( lodData.x ) );
			const lodNumTriangles = uint( lodData.y );
			const chunkIndex = geometryLevels.z.add( uint( lodData.z ) ).add( chunk );

			If( chunk.lessThan( lodNumTriangles.div( MESHLET_SIZE ) ), () => {

				// the clusters of objects occluded as a whole are not visible, without testing each of them

				if ( phase === 'second' ) {

					If( record.y.bitAnd( OCCLUDED ).notEqual( uint( 0 ) ), () => {

						If( clusterVisibility.element( visibilityIndex ).notEqual( lodLevel.add( 1 ) ), () => {

							atomicAdd( counters.element( this.occludedCounter ), 1 );

						} );

						clusterVisibility.element( visibilityIndex ).assign( uint( 0 ) );

						Return();

					} );

				}

				const matrixWorld = instanceWorld.element( uint( batchQueues.x ).add( local ) );

				const chunkBounds = chunkPool.element( chunkIndex.mul( 2 ) );
				const chunkCenter = matrixWorld.mul( vec4( chunkBounds.xyz, 1.0 ) ).xyz.toVar();
				const chunkRadius = chunkBounds.w.mul( objectScale.abs() ).add( objectBounds.y ).toVar();
				const chunkCullBounds = deformBounds( chunkCenter, chunkRadius );

				const chunkVisible = bool( true ).toVar();

				// cone culling: all triangles of the cluster face away from the camera. the normal cone is
				// transformed by the world matrix, which requires a uniform scale ( positive object scale ).
				// shadow passes draw the back faces, deformed positions change the facing

				if ( shadow === false && boundsNode === null ) {

					If( objectScale.greaterThan( 0.0 ).and( uint( batchGeometry.w ).bitAnd( FLAG_CONE ).notEqual( uint( 0 ) ) ), () => {

						const cone = chunkPool.element( chunkIndex.mul( 2 ).add( 1 ) );
						const coneAxis = normalize( matrixWorld.mul( vec4( cone.xyz, 0.0 ) ).xyz );
						const toCluster = chunkCenter.sub( cameraPosition );

						If( dot( toCluster, coneAxis ).greaterThanEqual( cone.w.mul( length( toCluster ) ).add( chunkRadius ) ), () => {

							chunkVisible.assign( false );

						} );

					} );

				}

				Loop( { name: 'plane', start: 0, end: 6 }, ( { plane: planeIndex } ) => {

					const plane = frustumPlanes.element( planeIndex );

					If( dot( plane.xyz, chunkCullBounds.xyz ).add( plane.w ).lessThan( chunkCullBounds.w.negate() ), () => {

						chunkVisible.assign( false );

					} );

				} );

				// the near or the far queue of the batch

				const enqueue = () => {

					const queue = select( far, uint( 1 ), uint( 0 ) );
					const queueCapacity = uint( batchObjects.w );
					const item = atomicAdd( counters.element( batch.mul( 2 ).add( 1 ).add( queue ) ), 1 );

					If( item.lessThan( queueCapacity ), () => {

						workQueue.element( uint( batchObjects.z ).add( queue.mul( queueCapacity ) ).add( item ) ).assign( uvec4( local, lodTriangleStart, lodNumTriangles, chunk ) );

					} );

				};

				If( chunkVisible, () => {

					if ( phase === 'all' ) {

						enqueue();

					} else {

						const visibilityValue = lodLevel.add( 1 );
						const wasVisible = clusterVisibility.element( visibilityIndex ).equal( visibilityValue ).toVar();

						if ( phase === 'first' ) {

							If( wasVisible, enqueue );

						} else {

							const occluded = isOccluded( projScreenMatrix, chunkCullBounds );

							If( occluded.not().and( wasVisible.not() ), enqueue );

							// the clusters which would be drawn without the occlusion culling

							If( occluded.and( wasVisible.not() ), () => {

								atomicAdd( counters.element( this.occludedCounter ), 1 );

							} );

							clusterVisibility.element( visibilityIndex ).assign( select( occluded, uint( 0 ), visibilityValue ) );

						}

					}

				} );

			} );

		} )().compute( clusterDispatchAttribute, [ WORKGROUP_SIZE ] ).setName( 'MeshletDrawingPipeline Cluster Cull' );

		// one thread per queue writes the indirect draw arguments

		const createArgs = ( prepass, name ) => Fn( () => {

			const batch = instanceIndex.div( 2 );
			const queueCapacity = rowBits( batch, 0 ).w;
			const base = prepass === true ? instanceIndex.mul( 4 ).add( this.prepassArgsBase ) : instanceIndex.mul( 4 );

			args.element( base ).assign( uint( MESHLET_SIZE * 3 ) );
			args.element( base.add( 1 ) ).assign( min( countersRead.element( instanceIndex.add( 1 ) ), queueCapacity ) );
			args.element( base.add( 2 ) ).assign( uint( 0 ) );
			args.element( base.add( 3 ) ).assign( uint( 0 ) );

		} )().compute( capacity.batches * 2 ).setName( name );

		const computeDrawArgs = createArgs( false, 'MeshletDrawingPipeline Draw Args' );

		if ( occlusion === null ) {

			this.cullNodes = [ computeReset, computeCull, computeClusterArgs, createClusterCull( 'all' ) ];
			this.computeNodes = [ computeDrawArgs ];
			this.skipOcclusionNodes = [];

		} else {

			// one thread per object tests its bounding sphere, so the clusters of objects occluded as a whole skip their tests

			const computeObjectOcclusion = Fn( () => {

				const record = instanceRecord.element( instanceIndex ).toVar();

				If( record.y.bitAnd( LOD_MASK ).notEqual( uint( CULLED ) ), () => {

					const batch = record.y.shiftRight( 16 ).toVar();
					const geometryBounds = geometryRow( record.w.shiftRight( GEOMETRY_SHIFT ), 0 );
					const data = rowBits( batch, 1 ).x.add( instanceIndex.sub( rowBits( batch, 0 ).x ) ).toVar();
					const bounds = instanceBounds.element( data );
					const center = instanceWorld.element( data ).mul( vec4( geometryBounds.xyz, 1.0 ) ).xyz;
					const radius = bounds.w.abs().mul( geometryBounds.w ).add( bounds.x );

					If( isOccluded( projScreenMatrix, deformBounds( center, radius ) ), () => {

						instanceRecord.element( instanceIndex ).assign( uvec4( record.x, record.y.bitOr( OCCLUDED ), record.z, record.w ) );

					} );

				} );

			} )().compute( capacity.objects ).setName( 'MeshletDrawingPipeline Object Occlusion' );

			this.cullNodes = [ computeReset, computeCull, computeClusterArgs, createClusterCull( 'first' ), createArgs( true, 'MeshletDrawingPipeline Occlusion Args' ) ];
			this.computeNodes = [ computeObjectOcclusion, createClusterCull( 'second' ), computeDrawArgs ];

			// the culling without the occlusion, while it culls few clusters

			this.skipOcclusionNodes = [ computeReset, computeCull, computeClusterArgs, createClusterCull( 'all' ), computeDrawArgs ];

			this.objectCountNodes = [ computeObjectOcclusion ];

		}

		this.computeCull = computeCull;
		this.argsNodes = this.cullNodes.concat( this.computeNodes ).filter( ( node ) => node.name === 'MeshletDrawingPipeline Draw Args' || node.name === 'MeshletDrawingPipeline Occlusion Args' );

	}

	/**
	 * Allocates the buffers for the given capacity and sets them to the nodes reading them.
	 *
	 * @param {Object} capacity - The capacity of the shared buffers, see the constructor.
	 */
	allocate( capacity ) {

		for ( const attribute of this.attributes ) attribute.dispose();

		const attributes = [];

		const create = ( array, itemSize, Type = StorageBufferAttribute ) => {

			const attribute = new Type( array, itemSize );
			attributes.push( attribute );

			return attribute;

		};

		const { objects, data } = capacity;

		// the buffers written only by the GPU are created from views of one buffer of zeros, the CPU doesn't keep the
		// initial data of each buffer. the views must not be written

		const zeroBuffer = new ArrayBuffer( Math.max( data * 16, capacity.queue * 4, capacity.clusters, capacity.visibility, capacity.batches * 16 + 2 ) * 4 );
		const zeros = ( Type, length ) => new Type( zeroBuffer, 0, length );

		this.capacity = capacity;
		this.attributes = attributes;

		this.worldArray = new Float32Array( data * 16 * ( this.history === true ? 2 : 1 ) );
		this.boundsArray = new Float32Array( data * 4 );
		this.levelArray = new Float32Array( data * 8 );
		this.recordArray = new Uint32Array( objects * 4 );
		this.chunkArray = new Float32Array( capacity.chunks * 8 + capacity.batches * BATCH_STRIDE * 4 + capacity.geometries * GEOMETRY_STRIDE * 4 );
		this.tableArray = this.chunkArray.subarray( capacity.chunks * 8, capacity.chunks * 8 + capacity.batches * BATCH_STRIDE * 4 );
		this.geometryArray = this.chunkArray.subarray( capacity.chunks * 8 + capacity.batches * BATCH_STRIDE * 4 );

		// the offsets, counts and capacities of the table are stored as the bits of integers, floats would only represent
		// the integers up to 2^24

		this.tableBits = new Uint32Array( this.tableArray.buffer, this.tableArray.byteOffset, this.tableArray.length );
		this.geometryBits = new Uint32Array( this.geometryArray.buffer, this.geometryArray.byteOffset, this.geometryArray.length );

		this.worldAttribute = create( this.worldArray, 16 );
		this.boundsAttribute = create( this.boundsArray, 4 );
		this.levelAttribute = create( this.levelArray, 4 );
		this.mvpAttribute = create( zeros( Float32Array, data * 16 ), 16 );
		this.recordAttribute = create( this.recordArray, 4 );
		this.chunkAttribute = create( this.chunkArray, 4 );
		this.countersAttribute = create( zeros( Uint32Array, 2 + capacity.batches * 2 ), 1 );
		this.queueAttribute = create( zeros( Uint32Array, capacity.queue * 4 ), 4 );
		this.clusterOwnerAttribute = create( zeros( Uint32Array, Math.max( capacity.clusters, 1 ) ), 1 );
		this.argsAttribute = create( zeros( Uint32Array, capacity.batches * 2 * 4 * 2 ), 4, IndirectStorageBufferAttribute );
		this.visibilityAttribute = this.occlusion !== null ? create( zeros( Uint32Array, Math.max( capacity.visibility, 1 ) ), 1 ) : null;

		this.prepassArgsOffset = capacity.batches * 2 * 4 * 4;

		this.historyOffset.value = data;
		this.tableOffset.value = capacity.chunks * 2;
		this.geometryOffset.value = capacity.chunks * 2 + capacity.batches * BATCH_STRIDE;
		this.prepassArgsBase.value = this.prepassArgsOffset / 4;
		this.occludedCounter.value = 1 + capacity.batches * 2;
		this.maxClusters.value = capacity.clusters;

		if ( this.bufferNodes !== undefined ) {

			for ( const [ node, key ] of this.bufferNodes ) {

				node.value = this[ key ];
				node.bufferCount = this[ key ].count;

			}

			this.computeReset.count = this.countersAttribute.count;

		}

	}

	/**
	 * Replaces the buffers with buffers of the given capacity. The batches are removed and must be added again,
	 * their nodes and materials stay valid.
	 *
	 * @param {Object} capacity - The capacity of the shared buffers, see the constructor.
	 */
	resize( capacity ) {

		this.allocate( capacity );

		this.objectEnd = 0;
		this.dataEnd = 0;
		this.queueEnd = 0;
		this.visibilityEnd = 0;
		this.chunkEnd = 0;
		this.batchEnd = 0;
		this.geometryEnd = 0;
		this.geometryIndices = new WeakMap();
		this.batches.length = 0;

		this.updateCounts();

	}

	/**
	 * Allocates the ranges of a batch in the shared buffers and writes its parameters into the table.
	 * Returns `false` if the buffers are full.
	 *
	 * @param {MeshletBatch} batch - The batch.
	 * @return {boolean} Whether the batch was added.
	 */
	add( batch ) {

		const { capacity: objects, maxChunks } = batch;
		const capacity = this.capacity;

		const queueCount = batch.farMaterial !== null ? 2 : 1;
		const queueCapacity = getQueueCapacity( objects, maxChunks, batch.queueBudget );
		const visibility = this.occlusion !== null ? objects * maxChunks : 0;

		const data = batch.source !== null ? 0 : objects;

		if ( this.batchEnd + 1 > capacity.batches || this.objectEnd + objects > capacity.objects || this.dataEnd + data > capacity.data || this.queueEnd + queueCapacity * queueCount > capacity.queue ||
			this.visibilityEnd + visibility > capacity.visibility ) {

			return false;

		}

		const index = this.batchEnd ++;

		batch.index = index;
		batch.objectOffset = this.objectEnd;
		batch.queueOffset = this.queueEnd;
		batch.queueCapacity = queueCapacity;

		// the objects of a batch sharing the data of another batch, the groups of the same objects, read the
		// transforms, the bounds and the levels from the range of the other batch

		batch.dataOffset = batch.source !== null ? batch.source.dataOffset : this.dataEnd;

		// the table, see BATCH_STRIDE. the first and the second rows are integers

		const values = this.tableArray;
		const bits = this.tableBits;
		const base = index * BATCH_STRIDE * 4;

		bits.set( [ this.objectEnd, 0, this.queueEnd, queueCapacity ], base );
		bits.set( [ batch.dataOffset, 0, this.visibilityEnd, maxChunks ], base + 4 );
		values.set( [ 0, 0, batch.lodCount, ( batch.cone === true ? FLAG_CONE : 0 ) | ( batch.farMaterial !== null ? FLAG_FAR : 0 ) ], base + 8 );

		// the batch of each slot of the range

		const recordArray = this.recordArray;

		for ( let i = this.objectEnd; i < this.objectEnd + objects; i ++ ) recordArray[ i * 4 + 3 ] = index;

		this.recordAttribute.addUpdateRange( this.objectEnd * 4, objects * 4 );
		this.recordAttribute.needsUpdate = true;

		this.objectEnd += objects;
		this.dataEnd += data;
		this.queueEnd += queueCapacity * queueCount;
		this.visibilityEnd += visibility;

		this.batches.push( batch );

		this.updateCounts();

		return true;

	}

	/**
	 * Removes a batch, its ranges are reused after a rebuild of the culling.
	 *
	 * @param {MeshletBatch} batch - The batch.
	 */
	remove( batch ) {

		const index = this.batches.indexOf( batch );

		if ( index === - 1 ) return;

		this.batches.splice( index, 1 );
		this.setObjectCount( batch, 0 );

	}

	/**
	 * Returns the index of the given geometry in the table of the geometries, or `-1` if it was not added.
	 *
	 * @param {Object} clusters - The cluster data of the geometry.
	 * @return {number} The index.
	 */
	getGeometry( clusters ) {

		const index = this.geometryIndices.get( clusters );

		return index !== undefined ? index : - 1;

	}

	/**
	 * Adds the clusters and the levels of detail of a geometry to the table of the geometries, see GEOMETRY_STRIDE.
	 * Returns `-1` if the buffers are full.
	 *
	 * @param {Object} clusters - The cluster data of the geometry.
	 * @param {number} triangleBase - The first triangle of the geometry in the geometry pool.
	 * @return {number} The index of the geometry.
	 */
	addGeometry( clusters, triangleBase ) {

		let index = this.geometryIndices.get( clusters );

		if ( index !== undefined ) return index;

		const capacity = this.capacity;

		if ( this.geometryEnd + 1 > capacity.geometries || this.chunkEnd + clusters.chunkCount > capacity.chunks ) return - 1;

		// the clusters of the geometry

		const chunkOffset = this.chunkEnd;

		this.chunkArray.set( clusters.chunkArray, chunkOffset * 8 );
		this.chunkAttribute.addUpdateRange( chunkOffset * 8, clusters.chunkCount * 8 );

		this.chunkEnd += clusters.chunkCount;

		// the rows of the geometry, the second row are integers

		index = this.geometryEnd ++;

		const base = index * GEOMETRY_STRIDE * 4;
		const { center, radius } = clusters.boundingSphere;

		this.geometryArray.set( [ center.x, center.y, center.z, radius ], base );
		this.geometryBits.set( [ clusters.lodCount, triangleBase, chunkOffset, clusters.maxChunks ], base + 4 );

		for ( let i = 0; i < MAX_LODS; i ++ ) {

			const lod = clusters.lodOffsetValues[ i ];
			const offset = base + ( GEOMETRY_LOD_ROW + i ) * 4;

			if ( lod !== undefined ) lod.toArray( this.geometryArray, offset );
			else this.geometryArray.fill( 0, offset, offset + 4 );

		}

		this.chunkAttribute.addUpdateRange( this.geometryArray.byteOffset / 4 + base, GEOMETRY_STRIDE * 4 );
		this.chunkAttribute.needsUpdate = true;

		this.geometryIndices.set( clusters, index );

		return index;

	}

	/**
	 * Sets the number of objects of a batch drawn in this projection.
	 *
	 * @param {MeshletBatch} batch - The batch.
	 * @param {number} count - The number of objects.
	 */
	setObjectCount( batch, count ) {

		this.tableBits[ batch.index * BATCH_STRIDE * 4 + 1 ] = count;

	}

	/**
	 * Uploads the batch table after the object counts have been updated.
	 * Only the table range changes each frame; the cluster bounds remain in the same buffer.
	 */
	updateTable() {

		this.chunkAttribute.addUpdateRange( this.capacity.chunks * 8, this.tableArray.length );
		this.chunkAttribute.needsUpdate = true;

	}

	/**
	 * Limits the dispatches to the allocated objects and batches.
	 */
	updateCounts() {

		this.computeCull.count = Math.max( this.objectEnd, 1 );
		this.objectEndNode.value = this.objectEnd;

		if ( this.objectCountNodes !== undefined ) {

			for ( const node of this.objectCountNodes ) node.count = Math.max( this.objectEnd, 1 );

		}

		for ( const node of this.argsNodes ) node.count = Math.max( this.batchEnd * 2, 1 );

	}

	/**
	 * Updates the view of the culling.
	 *
	 * @param {Camera} camera - The camera.
	 * @param {Matrix4} projScreenMatrix - The view projection matrix.
	 * @param {Frustum} frustum - The camera frustum.
	 * @param {number} width - The width of the view in pixels.
	 * @param {number} height - The height of the view in pixels.
	 * @param {Object} lodView - The view selecting the level of detail.
	 */
	updateView( camera, projScreenMatrix, frustum, width, height, lodView ) {

		this.projScreenMatrix.value.copy( projScreenMatrix );
		this.cameraPosition.value.setFromMatrixPosition( camera.matrixWorld );
		this.cameraZoom.value = camera.zoom;
		this.viewSize.value.set( width, height );

		this.lodPosition.value.copy( lodView.position );
		this.lodScale.value = lodView.scale;
		this.lodPerspective.value = lodView.perspective;
		this.lodThreshold.value = lodView.threshold;
		this.minScreenRadius.value = lodView.minScreenRadius;
		this.coarseScreenRadius.value = lodView.coarseScreenRadius;

		const planes = frustum.planes;

		for ( let i = 0; i < 6; i ++ ) {

			this.frustumPlanes.array[ i ].set( planes[ i ].normal.x, planes[ i ].normal.y, planes[ i ].normal.z, planes[ i ].constant );

		}

	}

	/**
	 * Frees the GPU-related resources of the culling.
	 */
	dispose() {

		for ( const computeNode of new Set( [ ...this.cullNodes, ...this.computeNodes, ...this.skipOcclusionNodes ] ) ) computeNode.dispose();
		for ( const attribute of this.attributes ) attribute.dispose();

		this.clusterDispatchAttribute.dispose();

	}

}

/**
 * Returns a function testing a bounding sphere against the hierarchical depth of the occlusion view.
 *
 * @private
 * @param {Object} occlusion - The occlusion data of the view.
 * @return {Function} Returns true if the sphere is behind the hierarchical depth, the matrix projects the space of the sphere.
 */
function createOcclusionTest( occlusion ) {

	const { hzb, hzbLevels, hzbLevelCount, hzbSize } = occlusion;

	return ( mvp, sphere ) => {

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

}

/**
 * Returns `true` if the 16 values of the array at the given offset equal the given values stored as 32-bit floats.
 *
 * @private
 * @param {Float32Array} array - The array.
 * @param {number} offset - The offset in the array.
 * @param {ArrayLike<number>} values - The values.
 * @param {number} [valuesOffset=0] - The offset in the values.
 * @return {boolean} Whether the values are equal.
 */
function equalsMatrix( array, offset, values, valuesOffset = 0 ) {

	for ( let i = 0; i < 16; i ++ ) {

		if ( array[ offset + i ] !== Math.fround( values[ valuesOffset + i ] ) ) return false;

	}

	return true;

}

/**
 * Returns `true` if the 16 elements of the given matrices are equal.
 *
 * @private
 * @param {ArrayLike<number>} a - The elements of the first matrix.
 * @param {ArrayLike<number>} b - The elements of the second matrix.
 * @return {boolean} Whether the elements are equal.
 */
function equalsElements( a, b ) {

	for ( let i = 0; i < 16; i ++ ) {

		if ( a[ i ] !== b[ i ] ) return false;

	}

	return true;

}

/**
 * The slots written by an upload, marked in ascending order. Slots closer than a gap are merged into one
 * range, each range is one upload.
 *
 * @private
 */
class SlotRanges {

	constructor() {

		this.ranges = [];
		this.start = - 1;
		this.end = - 1;

	}

	/**
	 * Marks a slot as written. The slots must be marked in ascending order.
	 *
	 * @param {number} slot - The slot.
	 */
	mark( slot ) {

		if ( this.end !== - 1 && slot <= this.end + RANGE_GAP ) {

			this.end = slot + 1;

			return;

		}

		if ( this.end !== - 1 ) this.ranges.push( [ this.start, this.end ] );

		this.start = slot;
		this.end = slot + 1;

	}

	/**
	 * Returns the ranges of the written slots. Too many ranges are merged into one range.
	 *
	 * @return {Array<Array<number>>} The ranges, the first slot and the slot after the last slot.
	 */
	finish() {

		const ranges = this.ranges;

		if ( this.end !== - 1 ) ranges.push( [ this.start, this.end ] );

		this.start = this.end = - 1;

		if ( ranges.length > MAX_UPDATE_RANGES ) ranges.splice( 0, ranges.length, [ ranges[ 0 ][ 0 ], ranges[ ranges.length - 1 ][ 1 ] ] );

		return ranges;

	}

}

/**
 * Writes the maximum scale of an object into the bounds of the culling, negative if the scale is not uniform.
 * The culling transforms the center of the bounding sphere of the geometry of each slot.
 *
 * @private
 * @param {Float32Array} array - The bounds of the culling.
 * @param {number} index - The slot of the object.
 * @param {ArrayLike<number>} e - The elements of the world matrix.
 */
function writeBounds( array, index, e ) {

	const scaleX = Math.sqrt( e[ 0 ] * e[ 0 ] + e[ 1 ] * e[ 1 ] + e[ 2 ] * e[ 2 ] );
	const scaleY = Math.sqrt( e[ 4 ] * e[ 4 ] + e[ 5 ] * e[ 5 ] + e[ 6 ] * e[ 6 ] );
	const scaleZ = Math.sqrt( e[ 8 ] * e[ 8 ] + e[ 9 ] * e[ 9 ] + e[ 10 ] * e[ 10 ] );
	const maxScale = Math.max( scaleX, scaleY, scaleZ );
	const uniformScale = maxScale - Math.min( scaleX, scaleY, scaleZ ) <= maxScale * 1e-4;

	array[ index * 4 + 3 ] = uniformScale ? maxScale : - maxScale;

}

/**
 * Writes the distance range of an object into the levels of the culling, if it changed. The batch of the slot
 * is not changed.
 *
 * @private
 * @param {Float32Array} array - The levels of the culling.
 * @param {number} index - The slot of the object.
 * @param {?Object} level - The distance range, or `null` if the object is not a level of a LOD object.
 * @return {boolean} Whether the values changed.
 */
function writeLevel( array, index, level ) {

	const i = index * 8;

	if ( level === null ) {

		if ( array[ i + 3 ] === NO_LEVEL_NEAR && array[ i + 4 ] === NO_LEVEL_FAR && array[ i + 5 ] === NO_LEVEL_FAR ) return false;

		array[ i + 3 ] = NO_LEVEL_NEAR;
		array[ i + 4 ] = NO_LEVEL_FAR;
		array[ i + 5 ] = NO_LEVEL_FAR;

		return true;

	}

	const x = Math.fround( level.position.x );
	const y = Math.fround( level.position.y );
	const z = Math.fround( level.position.z );
	const near = Math.fround( level.near );
	const far = Math.fround( level.far );
	const switchDistance = Math.fround( level.switchDistance );

	if ( array[ i ] === x && array[ i + 1 ] === y && array[ i + 2 ] === z && array[ i + 3 ] === near && array[ i + 4 ] === far && array[ i + 5 ] === switchDistance ) return false;

	array[ i ] = x;
	array[ i + 1 ] = y;
	array[ i + 2 ] = z;
	array[ i + 3 ] = near;
	array[ i + 4 ] = far;
	array[ i + 5 ] = switchDistance;

	return true;

}

/**
 * The vertices and the triangles of the geometries drawn by the GPU-driven pipeline, in one storage buffer each,
 * so the objects of several geometries sharing a material are drawn by one draw. The vertex data of a geometry
 * is interleaved ( see createMeshlets() ), the triangles store the address of the first element of each vertex.
 * The buffers grow when geometries are added, the nodes reading them stay valid.
 *
 * @private
 */
class MeshletGeometryPool {

	constructor() {

		this.vertexArray = new Float32Array( 1024 * 4 );
		this.indexArray = new Uint32Array( 1024 * 3 );
		this.vertexEnd = 0;
		this.indexEnd = 0;

		this.vertexAttribute = new StorageBufferAttribute( this.vertexArray, 4 );
		this.indexAttribute = new StorageBufferAttribute( this.indexArray, 1 );

		this.vertexNode = storage( this.vertexAttribute, 'vec4' ).toReadOnly();
		this.indexNode = storage( this.indexAttribute, 'uint' ).toReadOnly();

		// the geometries in the pool and the elements of the removed geometries, which are reclaimed by compact()

		this.geometries = new Map();
		this.wasted = 0;

		// changes when the geometries move, the tables of the geometries of the cullings are built again

		this.version = 0;

	}

	/**
	 * Adds the vertices and the triangles of the given geometry, if not added yet.
	 *
	 * @param {Object} clusters - The cluster data of the geometry.
	 * @return {number} The first triangle of the geometry in the pool.
	 */
	add( clusters ) {

		const geometry = this.geometries.get( clusters );

		if ( geometry !== undefined ) return geometry.triangleBase;

		const { vertexArray, indexArray, stride } = clusters;
		const vertexBase = this.vertexEnd;
		const indexBase = this.indexEnd;

		this.reserve( vertexBase + vertexArray.length / 4, indexBase + indexArray.length );

		this.vertexArray.set( vertexArray, vertexBase * 4 );

		for ( let i = 0; i < indexArray.length; i ++ ) this.indexArray[ indexBase + i ] = vertexBase + indexArray[ i ] * stride;

		this.vertexAttribute.addUpdateRange( vertexBase * 4, vertexArray.length );
		this.vertexAttribute.needsUpdate = true;
		this.indexAttribute.addUpdateRange( indexBase, indexArray.length );
		this.indexAttribute.needsUpdate = true;

		this.vertexEnd += vertexArray.length / 4;
		this.indexEnd += indexArray.length;

		const triangleBase = indexBase / 3;

		this.geometries.set( clusters, { triangleBase, size: vertexArray.length + indexArray.length } );

		return triangleBase;

	}

	/**
	 * Removes the given geometry, like a disposed geometry. Its elements are reclaimed by update().
	 *
	 * @param {Object} clusters - The cluster data of the geometry.
	 */
	remove( clusters ) {

		const geometry = this.geometries.get( clusters );

		if ( geometry === undefined ) return;

		this.geometries.delete( clusters );
		this.wasted += geometry.size;

	}

	/**
	 * Reclaims the elements of the removed geometries once they exceed half of the elements of the pool, so
	 * removing many geometries moves the geometries once.
	 */
	update() {

		if ( this.wasted > 0 && this.wasted > ( this.vertexEnd * 4 + this.indexEnd ) / 2 ) this.compact();

	}

	/**
	 * Moves the geometries of the pool into new buffers, without the elements of the removed geometries.
	 */
	compact() {

		const geometries = [ ...this.geometries.keys() ];
		const vertices = geometries.reduce( ( sum, clusters ) => sum + clusters.vertexArray.length / 4, 0 );
		const indices = geometries.reduce( ( sum, clusters ) => sum + clusters.indexArray.length, 0 );

		this.dispose();

		this.vertexArray = new Float32Array( Math.max( Math.ceil( vertices * 1.25 ), 1024 ) * 4 );
		this.indexArray = new Uint32Array( Math.max( Math.ceil( indices * 1.25 ), 1024 * 3 ) );
		this.vertexAttribute = new StorageBufferAttribute( this.vertexArray, 4 );
		this.indexAttribute = new StorageBufferAttribute( this.indexArray, 1 );
		this.vertexNode.value = this.vertexAttribute;
		this.vertexNode.bufferCount = this.vertexAttribute.count;
		this.indexNode.value = this.indexAttribute;
		this.indexNode.bufferCount = this.indexAttribute.count;

		this.vertexEnd = 0;
		this.indexEnd = 0;
		this.wasted = 0;
		this.geometries.clear();

		for ( const clusters of geometries ) this.add( clusters );

		this.version ++;

	}

	/**
	 * Grows the buffers to hold the given numbers of vertex elements and indices.
	 *
	 * @param {number} vertices - The number of vec4 elements of the vertices.
	 * @param {number} indices - The number of indices.
	 */
	reserve( vertices, indices ) {

		if ( vertices * 4 > this.vertexArray.length ) {

			const array = new Float32Array( Math.max( vertices * 4, Math.ceil( this.vertexArray.length * 1.5 / 4 ) * 4 ) );
			array.set( this.vertexArray.subarray( 0, this.vertexEnd * 4 ) );

			this.vertexAttribute.dispose();
			this.vertexArray = array;
			this.vertexAttribute = new StorageBufferAttribute( array, 4 );
			this.vertexNode.value = this.vertexAttribute;
			this.vertexNode.bufferCount = this.vertexAttribute.count;

		}

		if ( indices > this.indexArray.length ) {

			const array = new Uint32Array( Math.max( indices, Math.ceil( this.indexArray.length * 1.5 ) ) );
			array.set( this.indexArray.subarray( 0, this.indexEnd ) );

			this.indexAttribute.dispose();
			this.indexArray = array;
			this.indexAttribute = new StorageBufferAttribute( array, 1 );
			this.indexNode.value = this.indexAttribute;
			this.indexNode.bufferCount = this.indexAttribute.count;

		}

	}

	/**
	 * Frees the GPU-related resources of the pool.
	 */
	dispose() {

		this.vertexAttribute.dispose();
		this.indexAttribute.dispose();

	}

}

/**
 * All objects of one render list sharing geometry and material, drawn by one indirect draw of their visible
 * clusters through the hardware rasterizer. The objects are culled by the {@link MeshletCulling} of the render
 * list, the batch owns a range of its buffers. Subclasses can replace the draw by overriding `setupDraw()`.
 *
 * @private
 */
class MeshletBatch {

	/**
	 * Constructs a new batch.
	 *
	 * @param {Object} clusters - The cluster data of the geometry.
	 * @param {Material} material - The material of the objects.
	 * @param {boolean} receiveShadow - Whether the objects receive shadows.
	 * @param {number} capacity - The maximum number of objects.
	 * @param {Renderer} renderer - The renderer.
	 * @param {MeshletCulling} culling - The culling of the render list.
	 * @param {Object} [parameters] - The configuration parameter.
	 * @param {boolean} [parameters.debug=false] - Whether the clusters are shown instead of the material.
	 * @param {number} [parameters.lodCount=clusters.lodCount] - The number of levels of detail used.
	 * @param {?Object} [parameters.view=null] - The view of the render list, if the draw needs one.
	 * @param {boolean} [parameters.depthPrepass=false] - Whether the depth of the clusters is drawn before the material.
	 * @param {boolean} [parameters.instanced=false] - Whether the objects are instanced meshes, whose instances are drawn as objects.
	 * @param {boolean} [parameters.instanceColor=false] - Whether the instanced meshes have instance colors.
	 * @param {?Material} [parameters.farMaterial=null] - The material of the objects beyond their switch distance, the levels of
	 * LOD objects sharing the geometry. Shadow casters ignore it.
	 * @param {?MeshletBatch} [parameters.source=null] - A batch of the same culling and capacity drawing the same objects, like
	 * another group of the objects. The transforms, bounds and instance data of the objects are read from this batch, which
	 * uploads them, instead of being stored again.
	 * @param {number} [parameters.queueBudget=0] - The minimum number of work items of a queue of the batch, see getQueueCapacity().
	 */
	constructor( clusters, material, receiveShadow, capacity, renderer, culling, { debug = false, lodCount = MAX_LODS, view = null, depthPrepass = false, instanced = false, instanceColor = false, farMaterial = null, source = null, queueBudget = 0, maxChunks = clusters.maxChunks, pool = null } = {} ) {

		const shadow = culling.shadow;

		// position nodes can move the vertices out of the bounds of the clusters, they also change the facing. their
		// bounds are computed on the GPU, like the bounds of instanced meshes, see createDeformation()

		const deformed = isDeformedMaterial( material );
		const gpuTransform = instanced === true || deformed === true;

		this.source = source !== null && source.added === true && source.culling === culling && source.capacity === capacity && source.gpuTransform === gpuTransform && source.instanceColor === instanceColor ? source : null;
		this.clusters = clusters;
		this.material = material;
		this.materialVersion = material.version;
		this.farMaterial = shadow === false ? farMaterial : null;
		this.farMaterialVersion = farMaterial !== null ? farMaterial.version : - 1;
		this.debug = debug;
		this.shadow = shadow;
		this.culling = culling;
		this.occlusion = culling.occlusion;
		this.depthPrepass = depthPrepass;
		this.instanced = instanced;
		this.instanceColor = instanceColor;
		this.deformed = deformed;
		this.gpuTransform = gpuTransform;
		this.capacity = capacity;
		this.lodCount = lodCount;
		this.queueBudget = queueBudget;
		this.maxChunks = maxChunks;
		this.pool = pool;
		this.count = 0;
		this.view = view;

		this.cone = shadow === false && deformed === false;

		this.attributes = [];
		this.ownedGeometries = [];
		this.indirectGeometries = [];
		this.meshes = [];
		this.prepassMeshes = [];
		this.computeNodes = [];

		// the compute nodes dispatched before the culling when the objects changed, see getComputeNodesBefore()

		this.computeNodesBefore = [];
		this.transformNode = null;
		this.transformFrames = 0;
		this.unbounded = null;
		this.transformedCount = 0;

		this.added = culling.add( this );

		if ( this.added === false ) return;

		const createAttribute = ( array, itemSize, Type = StorageBufferAttribute ) => {

			const attribute = new Type( array, itemSize );
			this.attributes.push( attribute );

			return attribute;

		};

		// the vertices of the geometries of the batch, read from the geometry pool. the geometries share the layout
		// of the vertex data, the triangles store the address of the first element of each vertex

		const layout = clusters.attributeLayout;
		const vertexElement = ( address, offset ) => pool.vertexNode.element( address.add( offset ) );

		const position = ( address ) => vertexElement( address, 0 ).xyz;
		const normal = ( address ) => vertexElement( address, 1 ).xyz;
		const vertexUv = ( address ) => vec2( vertexElement( address, 0 ).w, vertexElement( address, 1 ).w );
		const hasAttribute = ( name ) => layout.has( name );
		const attribute = ( name, address ) => swizzle( vertexElement( address, layout.get( name ).offset ), layout.get( name ).itemSize );
		const indexBuffer = pool.indexNode;

		const history = culling.history;

		this.history = history;

		// the range of the batch in the buffers of the culling, updated when the batch is added to the resized culling

		const dataOffset = uniform( this.dataOffset, 'uint' );
		const queueOffset = uniform( this.queueOffset, 'uint' );
		const counterOffset = uniform( 1 + this.index * 2, 'uint' );
		const maxWorkItems = uniform( this.queueCapacity, 'uint' );

		this.rangeNodes = { dataOffset, queueOffset, counterOffset, maxWorkItems };

		const instanceWorld = {
			element: ( index ) => culling.instanceWorld.element( dataOffset.add( index ) ),
			previous: ( index ) => culling.instanceWorld.element( culling.historyOffset.add( dataOffset ).add( index ) )
		};

		const instanceMvp = { element: ( index ) => culling.instanceMvp.element( dataOffset.add( index ) ) };
		const workQueue = { element: ( index ) => culling.workQueue.element( queueOffset.add( index ) ) };
		const workQueueCountRead = { element: ( queue ) => culling.countersRead.element( counterOffset.add( queue ) ) };

		// instanced meshes: the world matrix of the mesh and the matrix of the instance, like the regular instancing
		// of node materials, and per instance its index, the instanced attributes of the geometry and the instance color. the objects whose
		// material has a position node are stored like instances with an identity instance matrix

		let objectWorld = null;
		let instanceLocal = null;
		let instanceData = null;

		this.instanceDataStride = 1 + clusters.instancedAttributes.length + ( instanceColor === true ? 1 : 0 ) + ( deformed === true ? 1 : 0 );

		const worldCapacity = history === true ? capacity * 2 : capacity;

		if ( gpuTransform === true && this.source !== null ) {

			( { objectWorld, instanceLocal, instanceData } = this.source.instanceNodes );

		} else if ( gpuTransform === true ) {

			const stride = this.instanceDataStride;

			// one buffer stores the world matrices of the meshes, the matrices of the instances and the data of the instances,
			// a matrix is four vec4 columns. one binding keeps the draws and the software rasterizer within the storage
			// buffer limit of a shader stage

			const instanceArray = new Float32Array( worldCapacity * 32 + capacity * stride * 4 );

			this.objectWorldArray = instanceArray.subarray( 0, worldCapacity * 16 );
			this.instanceLocalArray = instanceArray.subarray( worldCapacity * 16, worldCapacity * 32 );
			this.instanceDataArray = instanceArray.subarray( worldCapacity * 32 );
			this.instanceAttribute = createAttribute( instanceArray, 4 );
			this.instanceLayout = { local: worldCapacity * 16, data: worldCapacity * 32 };

			const instanceRead = storage( this.instanceAttribute, 'vec4', instanceArray.length / 4 ).toReadOnly();
			const instanceWrite = storage( this.instanceAttribute, 'vec4', instanceArray.length / 4 );

			objectWorld = createMatrices( instanceRead, 0 );
			instanceLocal = createMatrices( instanceRead, worldCapacity * 4 );
			instanceData = { element: ( index ) => instanceRead.element( uint( index ).add( worldCapacity * 8 ) ) };

			// only the matrices of the instances and of the meshes are uploaded. the world matrices and the bounds of the
			// instances for the culling, and the previous matrices, are computed on the GPU. the matrices of the last
			// computation are kept on the GPU, they become the previous matrices of the next computation

			const objectWorldWrite = createMatrices( instanceWrite, 0 );
			const instanceLocalWrite = createMatrices( instanceWrite, worldCapacity * 4 );
			const instanceDataWrite = { element: ( index ) => instanceWrite.element( uint( index ).add( worldCapacity * 8 ) ) };
			const cullingWorld = culling.worldWrite;
			const cullingBounds = culling.boundsWrite;
			const lastObjectWorld = history === true ? storage( createAttribute( new Float32Array( capacity * 16 ), 16 ), 'mat4', capacity ) : null;
			const lastInstanceLocal = history === true ? storage( createAttribute( new Float32Array( capacity * 16 ), 16 ), 'mat4', capacity ) : null;

			const transformCount = uniform( 0, 'uint' );
			const transformPreviousCount = uniform( 0, 'uint' );

			this.transformCount = transformCount;
			this.transformPreviousCount = transformPreviousCount;

			// the bounds of positions deformed by the position node are found by evaluating the node, see createDeformation()

			const deformation = deformed === true ? { unbounded: uniform( 0 ), normalSamples: uniform( 1, 'int' ) } : null;

			this.unbounded = deformed === true ? deformation.unbounded : null;

			this.transformNode = Fn( () => {

				// the instance index of the material is replaced by the index of the instance in the position node

				const index = drawInstanceIndex;

				If( index.lessThan( transformCount ), () => {

					const local = instanceLocalWrite.element( index ).toVar();
					const object = objectWorldWrite.element( index ).toVar();

					if ( history === true ) {

						// added instances didn't move

						const previous = index.add( capacity );

						If( index.lessThan( transformPreviousCount ), () => {

							instanceLocalWrite.assign( previous, lastInstanceLocal.element( index ) );
							objectWorldWrite.assign( previous, lastObjectWorld.element( index ) );

						} ).Else( () => {

							instanceLocalWrite.assign( previous, local );
							objectWorldWrite.assign( previous, object );

						} );

						lastInstanceLocal.element( index ).assign( local );
						lastObjectWorld.element( index ).assign( object );

					}

					const slot = dataOffset.add( index );

					let world, margin = float( 0 );

					if ( deformed === true ) {

						// the index of the instance, then the bounding sphere of the geometry is the last element of the instance data

						const instance = uint( instanceDataWrite.element( index.mul( stride ) ).x ).toVar();
						const bounds = instanceDataWrite.element( index.mul( stride ).add( stride - 1 ) );
						const fit = createDeformation( material.positionNode, local, instance, bounds, deformation );

						world = object.mul( fit.matrix ).toVar();

						// the margin in world units

						const objectScale = max( length( object.mul( vec4( 1, 0, 0, 0 ) ).xyz ), max( length( object.mul( vec4( 0, 1, 0, 0 ) ).xyz ), length( object.mul( vec4( 0, 0, 1, 0 ) ).xyz ) ) );

						margin = fit.margin.mul( objectScale );

					} else {

						world = object.mul( local ).toVar();

					}

					cullingWorld.element( slot ).assign( world );

					// the maximum scale, negative if the scale is not uniform. the culling transforms the center of the geometry

					const scaleX = length( world.mul( vec4( 1, 0, 0, 0 ) ).xyz );
					const scaleY = length( world.mul( vec4( 0, 1, 0, 0 ) ).xyz );
					const scaleZ = length( world.mul( vec4( 0, 0, 1, 0 ) ).xyz );
					const maxScale = max( scaleX, max( scaleY, scaleZ ) ).toVar();
					const minScale = min( scaleX, min( scaleY, scaleZ ) );
					cullingBounds.element( slot ).assign( vec4( margin, 0, 0, select( maxScale.sub( minScale ).lessThanEqual( maxScale.mul( 1e-4 ) ), maxScale, maxScale.negate() ) ) );

				} );

			} )().compute( capacity ).setName( 'MeshletDrawingPipeline Instances' );

			this.computeNodesBefore.push( this.transformNode );

		}

		this.instanceNodes = { objectWorld, instanceLocal, instanceData };

		// the slots written in the last upload, their previous matrices are updated in the next frame

		this.historyRanges = EMPTY_HISTORY;

		// the state of the objects of instanced meshes in the last upload, see update()

		this.objectStates = [];

		// the geometry of the objects in their slots, see writeGeometries()

		this.geometryStates = [];

		// one draw instance per cluster of 64 triangles, the far queue follows the near queue

		const createSource = ( queue ) => {

			const workItem = workQueue.element( queue === 0 ? drawInstanceIndex : drawInstanceIndex.add( maxWorkItems.mul( queue ) ) );

			return {
				instance: workItem.x,
				triangle: workItem.y.add( workItem.w.mul( MESHLET_SIZE ) ).add( vertexIndex.div( 3 ) ),
				corner: vertexIndex.mod( 3 )
			};

		};

		const clusterSource = createSource( 0 );
		const farClusterSource = this.farMaterial !== null ? createSource( 1 ) : null;

		const shared = {
			createAttribute, clusters, material, renderer, receiveShadow, debug, shadow, depthPrepass, capacity,
			position, normal, vertexUv, hasAttribute, attribute, indexBuffer, instanceWorld, instanceMvp, instanced: gpuTransform, objectWorld, instanceLocal, instanceData,
			workQueue, workQueueCountRead, maxWorkItems, projScreenMatrix: culling.projScreenMatrix, viewSize: culling.viewSize,
			clusterSource, farClusterSource
		};

		this.setupDraw( shared );

		// the clusters of the first phase, drawn into the depth of the occlusion view

		if ( this.occlusion !== null ) {

			this.prepassMeshes.push( this.createDepthMesh( culling.argsAttribute, clusterSource, shared, FrontSide, this.getArgsOffset( 0, true ) ) );

			if ( farClusterSource !== null ) this.prepassMeshes.push( this.createDepthMesh( culling.argsAttribute, farClusterSource, { ...shared, material: this.farMaterial }, FrontSide, this.getArgsOffset( 1, true ) ) );

		}

	}

	/**
	 * Adds the batch to its resized culling, see {@link MeshletCulling#resize}. The nodes and materials of the batch
	 * stay valid: the range of the batch and its indirect draws are updated, and the data of the objects is written
	 * again in the next update.
	 *
	 * @return {boolean} Whether the batch was added.
	 */
	relocate() {

		const culling = this.culling;

		this.added = culling.add( this );

		if ( this.added === false ) return false;

		const { dataOffset, queueOffset, counterOffset, maxWorkItems } = this.rangeNodes;

		dataOffset.value = this.dataOffset;
		queueOffset.value = this.queueOffset;
		counterOffset.value = 1 + this.index * 2;
		maxWorkItems.value = this.queueCapacity;

		for ( const { geometry, queue, prepass } of this.indirectGeometries ) geometry.setIndirect( culling.argsAttribute, this.getArgsOffset( queue, prepass ) );

		// the buffers of the culling are new: the objects are compared with empty values and written again, the world
		// matrices and bounds of instances are computed again. the previous matrices of the batch are kept

		this.count = 0;
		this.objectStates.length = 0;
		this.geometryStates.length = 0;
		this.historyRanges = EMPTY_HISTORY;
		this.uploadedVersion = undefined;

		if ( this.transformNode !== null ) this.transformFrames = this.history === true ? 2 : 1;

		return true;

	}

	/**
	 * Returns the offset in bytes of the indirect draw arguments of a queue of the batch.
	 *
	 * @param {number} queue - The queue, 0 for the material and 1 for the far material.
	 * @param {boolean} [prepass=false] - Whether the arguments of the occlusion prepass are returned.
	 * @return {number} The offset in bytes.
	 */
	getArgsOffset( queue, prepass = false ) {

		return ( this.index * 2 + queue ) * 16 + ( prepass === true ? this.culling.prepassArgsOffset : 0 );

	}

	/**
	 * Creates the draw of the visible clusters: one draw instance per cluster of 64 triangles, drawn by the
	 * hardware rasterizer through vertex pulling. Adds the meshes of the draw.
	 *
	 * @param {Object} shared - The nodes and resources of the batch.
	 */
	setupDraw( shared ) {

		const { clusterSource, farClusterSource } = shared;

		// one draw per queue: the material, and the far material beyond the switch distance

		const queues = [ { source: clusterSource, material: shared.material } ];

		if ( farClusterSource !== null ) queues.push( { source: farClusterSource, material: this.farMaterial } );

		for ( let queue = 0; queue < queues.length; queue ++ ) {

			const mesh = this.createPulledMesh( this.culling.argsAttribute, queues[ queue ].source, { ...shared, material: queues[ queue ].material }, this.getArgsOffset( queue ) );

			this.meshes.push( mesh );

			if ( mesh.depthMesh !== undefined ) this.meshes.push( mesh.depthMesh );

			if ( queue === 0 ) this.clusterMesh = mesh;

		}

	}

	/**
	 * Creates the geometry of a mesh drawing pulled vertices with the given indirect draw arguments.
	 *
	 * @param {IndirectStorageBufferAttribute} drawAttribute - The indirect draw arguments.
	 * @param {number} [drawOffset=0] - The offset in bytes of the arguments.
	 * @return {BufferGeometry} The geometry.
	 */
	createPulledGeometry( drawAttribute, drawOffset = 0 ) {

		if ( _pulledPositionAttribute === null ) _pulledPositionAttribute = new Float32BufferAttribute( new Float32Array( PULLED_VERTICES * 3 ), 3 );

		const geometry = new BufferGeometry();
		geometry.setAttribute( 'position', _pulledPositionAttribute );

		// the normals and the tangents are provided by the context, the attributes enable the features based on them like the
		// geometry roughness or the tangents of normal maps, which are derived from the screen space without the attribute

		geometry.setAttribute( 'normal', _pulledPositionAttribute );

		if ( this.clusters.attributeLayout.has( 'tangent' ) ) geometry.setAttribute( 'tangent', _pulledPositionAttribute );
		geometry.setIndirect( drawAttribute, drawOffset );
		geometry.boundingSphere = new Sphere( new Vector3(), Infinity );

		this.ownedGeometries.push( geometry );

		// the arguments of the culling move when the batch is added to the resized culling, see relocate()

		const culling = this.culling;

		if ( drawAttribute === culling.argsAttribute ) {

			const prepass = drawOffset >= culling.prepassArgsOffset;
			const queue = ( drawOffset - ( prepass === true ? culling.prepassArgsOffset : 0 ) ) / 16 - this.index * 2;

			this.indirectGeometries.push( { geometry, queue, prepass } );

		}

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
	 * @return {{context: ContextNode, positionNode: ?Node<vec3>, colorNode: ?Node<vec3>}} The context node, the position node and the instance color of the materials.
	 */
	createPulledContext( source, shared ) {

		const { clusters, material, position, normal, vertexUv, hasAttribute, attribute, indexBuffer, instanceWorld, instanced, objectWorld, instanceLocal, instanceData, capacity } = shared;

		const vertex = indexBuffer.element( source.triangle.mul( 3 ).add( source.corner ) );

		// the object of the vertex, the fragments read it through a flat varying

		const instance = varying( source.instance, 'vMeshletInstance' );

		let matrixWorld = instanceWorld.element( instance );
		let previousMatrixWorld = this.history === true ? instanceWorld.previous( instance ) : matrixWorld;
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

		const getAttribute = cacheAttributes( ( name ) => {

			let node = attributes[ name ];

			if ( node === undefined && hasAttribute( name ) ) node = attribute( name, vertex );

			// the instanced attributes of instanced meshes

			const index = instancedAttributes.findIndex( ( attribute ) => attribute.name === name );

			if ( node === undefined && instanced === true && index !== - 1 ) {

				node = swizzle( instanceData.element( instance.mul( this.instanceDataStride ).add( 1 + index ) ), instancedAttributes[ index ].itemSize );

			}

			// pulled in the vertex stage, interpolated if read by the fragment stage

			return node !== undefined ? varying( node ) : null;

		} );

		// the color of the instance follows the instanced attributes

		const colorNode = this.instanceColor === true ? varying( instanceData.element( instance.mul( this.instanceDataStride ).add( 1 + instancedAttributes.length ) ).xyz ) : null;

		const context = overrideNodes( [
			[ instanceIndex, instanceIndexNode ],
			[ modelWorldMatrix, matrixWorld ],
			[ modelWorldMatrixInverse, matrixWorld.inverse() ],
			[ modelNormalMatrix, mat3( matrixWorld ).inverse().transpose() ],
			[ modelPosition, worldPosition ],
			[ modelViewPosition, cameraViewMatrix.mul( vec4( worldPosition, 1.0 ) ).xyz ],
			[ velocity.previousModelWorldMatrix, previousMatrixWorld ]
		], contextNode( { getAttribute } ) );

		return { context, positionNode, colorNode };

	}

	/**
	 * Creates a mesh which only draws the depth of pulled triangles, for shadow passes and the occlusion view.
	 * The position node of the material is applied.
	 *
	 * @param {IndirectStorageBufferAttribute} drawAttribute - The indirect draw arguments.
	 * @param {Object} source - The object, triangle and corner nodes of the current vertex.
	 * @param {Object} shared - The nodes and resources of the batch.
	 * @param {number} side - The side of the triangles to draw.
	 * @param {number} [drawOffset=0] - The offset in bytes of the indirect draw arguments.
	 * @return {Mesh} The mesh.
	 */
	createDepthMesh( drawAttribute, source, shared, side, drawOffset = 0 ) {

		const pulled = this.createPulledContext( source, shared );

		// alpha-tested materials discard the same fragments in the depth of shadows and of the occlusion view

		let material;

		if ( shared.material.alphaTest > 0 ) {

			material = createAlphaDepthMaterial( shared.material );

		} else {

			material = new NodeMaterial();
			material.colorNode = vec4( 0, 0, 0, 1 );

		}

		material.positionNode = pulled.positionNode;
		material.maskNode = shared.material.maskNode || null;
		material.contextNode = pulled.context;
		material.blending = NoBlending;
		material.fog = false;
		material.side = side;

		// the shadow material of the renderer would replace the pulled context

		material.allowOverride = false;

		const mesh = new Mesh( this.createPulledGeometry( drawAttribute, drawOffset ), material );
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
	 * @param {number} [drawOffset=0] - The offset in bytes of the indirect draw arguments.
	 * @return {Mesh} The mesh.
	 */
	createPulledMesh( drawAttribute, source, shared, drawOffset = 0 ) {

		const { material, renderer, receiveShadow, debug, shadow, depthPrepass } = shared;

		if ( shadow === true ) {

			// the shadow pass draws the back faces like the shadow material of the renderer

			const side = ( material.shadowSide !== null && material.shadowSide !== undefined ) ? material.shadowSide : BackSide;

			const mesh = this.createDepthMesh( drawAttribute, source, shared, side, drawOffset );
			mesh.castShadow = true;

			return mesh;

		}

		const geometry = this.createPulledGeometry( drawAttribute, drawOffset );
		const pulled = this.createPulledContext( source, shared );

		let drawMaterial;

		if ( debug === true ) {

			// clusters are stored as blocks of 64 triangles, so the cluster of a triangle is its index divided by 64

			drawMaterial = createDebugMaterial( varying( source.triangle.div( MESHLET_SIZE ) ), varying( source.instance ) );

		} else {

			drawMaterial = createDrawMaterial( material, renderer );

			// the instance color multiplies the color of the material, like NodeMaterial.setupDiffuseColor() for instanced meshes

			if ( pulled.colorNode !== null ) drawMaterial.colorNode = vec4( pulled.colorNode, 1 ).mul( drawMaterial.colorNode ? vec4( drawMaterial.colorNode ) : materialColor );

		}

		drawMaterial.positionNode = pulled.positionNode;
		drawMaterial.maskNode = material.maskNode || null;
		drawMaterial.contextNode = depthPrepass ? contextNode( pulled.context, { invariant: true } ) : pulled.context;

		const mesh = new Mesh( geometry, drawMaterial );
		mesh.frustumCulled = false;
		mesh.receiveShadow = receiveShadow;

		if ( depthPrepass === true ) {

			// the depth is drawn first with the same vertex nodes, so the material only shades the visible surface

			const depthMaterial = material.alphaTest > 0 ? createAlphaDepthMaterial( material ) : new NodeMaterial();
			depthMaterial.colorWrite = false;
			depthMaterial.fog = false;
			depthMaterial.positionNode = pulled.positionNode;
			depthMaterial.maskNode = material.maskNode || null;
			depthMaterial.contextNode = contextNode( pulled.context, { invariant: true } );

			const depthMesh = new Mesh( geometry, depthMaterial );
			depthMesh.frustumCulled = false;
			depthMesh.renderOrder = - 1;

			drawMaterial.depthWrite = false;

			mesh.depthMesh = depthMesh;

		}

		return mesh;

	}

	/**
	 * Writes the transforms of the objects into the range of the batch in the buffers of the culling. The values
	 * are compared with the values of the last upload, only the slots which changed are uploaded. Batches sharing
	 * the objects of another batch only update their number of objects, the other batch writes the values.
	 *
	 * @param {Array<Object3D>} objects - The objects of the batch.
	 * @param {MeshletDrawingPipeline} pipeline - The pipeline.
	 * @param {boolean} [upload=true] - Whether the transforms of the objects can have changed and must be compared.
	 * @param {?Array<?Object>} [levels=null] - The distance ranges of the objects which are levels of LOD objects.
	 * @param {?Array<number>} [geometries=null] - The indices of the geometries of the objects in the culling.
	 */
	update( objects, pipeline, upload = true, levels = null, geometries = null ) {

		const culling = this.culling;

		if ( geometries !== null ) this.writeGeometries( objects, geometries );

		let count = objects.length;

		if ( this.gpuTransform === true ) {

			count = 0;

			for ( let i = 0, l = objects.length; i < l; i ++ ) count += objects[ i ].count;

		}

		if ( this.source === null && this.gpuTransform === true ) {

			// the world matrices, the bounds and the previous matrices of the instances are computed on the GPU while
			// the instances change, and once more to update the previous matrices, see getComputeNodesBefore()

			const ranges = upload === true ? this.write( objects, levels ) : EMPTY_HISTORY;

			if ( ranges.transform.length > 0 || ranges.object.length > 0 || count !== this.count ) this.transformFrames = this.history === true ? 2 : 1;

		} else if ( this.source === null ) {

			// the slots written in the last upload moved since the last frame: their matrices of the last frame become
			// the previous matrices. the previous matrices of all other slots are their current matrices

			for ( const [ start, end ] of this.historyRanges.transform ) this.copyHistory( start, end );

			this.historyRanges = upload === true ? this.write( objects, levels ) : EMPTY_HISTORY;

			// added objects didn't move

			this.copyHistory( this.count, count );

		}

		this.count = count;

		culling.setObjectCount( this, count );

	}

	/**
	 * Writes the geometry of each slot into the records of the culling, with the batch of the slot. Only the
	 * objects which changed their slots or their geometry are written.
	 *
	 * @param {Array<Object3D>} objects - The objects of the batch.
	 * @param {Array<number>} geometries - The indices of the geometries of the objects in the culling.
	 */
	writeGeometries( objects, geometries ) {

		const culling = this.culling;
		const recordArray = culling.recordArray;
		const offset = this.objectOffset;
		const states = this.geometryStates;
		const ranges = new SlotRanges();

		states.length = Math.min( states.length, objects.length );

		let slot = 0;

		for ( let o = 0; o < objects.length; o ++ ) {

			const count = this.gpuTransform === true ? objects[ o ].count : 1;
			const value = ( this.index | ( geometries[ o ] << GEOMETRY_SHIFT ) ) >>> 0;

			let state = states[ o ];

			if ( state === undefined ) state = states[ o ] = { slot: - 1, count: 0, value: - 1 };

			if ( state.slot !== slot || state.count !== count || state.value !== value ) {

				for ( let i = slot; i < slot + count; i ++ ) {

					const index = ( offset + i ) * 4 + 3;

					if ( recordArray[ index ] !== value ) {

						recordArray[ index ] = value;
						ranges.mark( i );

					}

				}

				state.slot = slot;
				state.count = count;
				state.value = value;

			}

			slot += count;

		}

		const attribute = culling.recordAttribute;
		const written = ranges.finish();

		for ( const [ from, to ] of written ) attribute.addUpdateRange( ( offset + from ) * 4, ( to - from ) * 4 );

		if ( written.length > 0 ) attribute.needsUpdate = true;

	}

	/**
	 * Writes the transforms, bounds, levels and instance data of the objects which changed since the last upload
	 * and adds the update ranges of the written slots, per buffer.
	 *
	 * @param {Array<Object3D>} objects - The objects of the batch.
	 * @param {?Array<?Object>} levels - The distance ranges of the objects which are levels of LOD objects.
	 * @return {{transform: Array<Array<number>>, object: Array<Array<number>>}} The ranges of the slots whose matrices were written:
	 * the world matrices of the objects or the matrices of the instances, and the world matrices of instanced meshes.
	 */
	write( objects, levels ) {

		const culling = this.culling;
		const offset = this.dataOffset;
		const { worldArray, boundsArray, levelArray } = culling;

		const transform = new SlotRanges();
		const object = new SlotRanges();
		const data = new SlotRanges();
		const level = new SlotRanges();

		if ( this.gpuTransform === true ) {

			const { objectWorldArray, instanceLocalArray, instanceDataArray, instanceDataStride: stride, objectStates } = this;
			const instancedAttributes = this.clusters.instancedAttributes;

			// the state of an object is only valid while the object keeps its slots

			objectStates.length = Math.min( objectStates.length, objects.length );

			let slot = 0;

			for ( let o = 0; o < objects.length; o ++ ) {

				const mesh = objects[ o ];
				const range = levels !== null ? levels[ o ] : null;
				const instanceCount = mesh.count;
				const matrixWorld = mesh.matrixWorld;
				const attributes = instancedAttributes.map( ( { name } ) => mesh.geometry.attributes[ name ] );

				// the values of 32-bit float attributes which are not interleaved or normalized are read from their arrays

				const direct = attributes.map( ( attribute ) => attribute.isInterleavedBufferAttribute !== true && attribute.normalized !== true && attribute.array instanceof Float32Array );

				// the objects which are not instanced meshes have one instance with an identity matrix

				const instanceMatrix = mesh.isInstancedMesh === true ? mesh.instanceMatrix : null;
				const instanceColor = this.instanceColor === true ? mesh.instanceColor : null;

				let version = instanceMatrix !== null ? instanceMatrix.version : 0;

				for ( let a = 0; a < attributes.length; a ++ ) version += attributes[ a ].version;

				if ( instanceColor !== null ) version += instanceColor.version;

				let state = objectStates[ o ];

				if ( state === undefined ) state = objectStates[ o ] = { object: null, slot: - 1, count: 0, version: - 1, level: null, matrix: new Float64Array( 16 ), instanceMatrix: null, instanceColor: null, attributes: [] };

				// Attribute versions belong to their buffers: replacing a buffer can leave the summed version unchanged.

				const sameWorld = state.object === mesh && state.slot === slot && equalsElements( state.matrix, matrixWorld.elements );
				const sameAttributes = state.instanceMatrix === instanceMatrix && state.instanceColor === instanceColor &&
					state.attributes.length === attributes.length && state.attributes.every( ( attribute, i ) => attribute === attributes[ i ] );

				if ( sameWorld === true && sameAttributes === true && state.count === instanceCount && state.version === version && range === null && state.level === null ) {

					slot += instanceCount;

					continue;

				}

				// the slots of the instances written with this transform in the last upload keep it

				const keptWorld = sameWorld === true ? Math.min( state.count, instanceCount ) : 0;
				const instanceArray = instanceMatrix !== null ? instanceMatrix.array : IDENTITY_MATRIX;
				const float32 = instanceArray instanceof Float32Array;

				_objectWorld.set( matrixWorld.elements );

				state.object = mesh;
				state.slot = slot;
				state.count = instanceCount;
				state.version = version;
				state.level = range;
				state.matrix.set( matrixWorld.elements );
				state.instanceMatrix = instanceMatrix;
				state.instanceColor = instanceColor;
				state.attributes = attributes;

				for ( let i = 0; i < instanceCount; i ++, slot ++ ) {

					const local = slot * 16;
					const source = i * 16;

					let same = true;

					if ( float32 === true ) {

						for ( let j = 0; j < 16; j ++ ) {

							if ( instanceLocalArray[ local + j ] !== instanceArray[ source + j ] ) {

								same = false;
								break;

							}

						}

					} else {

						same = equalsMatrix( instanceLocalArray, local, instanceArray, source );

					}

					if ( same === false ) {

						for ( let j = 0; j < 16; j ++ ) instanceLocalArray[ local + j ] = instanceArray[ source + j ];

						transform.mark( slot );

					}

					if ( i >= keptWorld && equalsMatrix( objectWorldArray, slot * 16, _objectWorld ) === false ) {

						objectWorldArray.set( _objectWorld, slot * 16 );
						object.mark( slot );

					}

					// the index of the instance and the instanced attributes of the geometry

					const index = slot * stride * 4;

					let dataChanged = false;

					if ( instanceDataArray[ index ] !== i ) {

						instanceDataArray[ index ] = i;
						dataChanged = true;

					}

					for ( let a = 0; a < attributes.length; a ++ ) {

						const attribute = attributes[ a ];
						const itemSize = attribute.itemSize;

						for ( let c = 0; c < itemSize; c ++ ) {

							const value = direct[ a ] === true ? attribute.array[ i * itemSize + c ] : Math.fround( attribute.getComponent( i, c ) );
							const component = index + ( 1 + a ) * 4 + c;

							if ( instanceDataArray[ component ] !== value ) {

								instanceDataArray[ component ] = value;
								dataChanged = true;

							}

						}

					}

					// the color of the instance, multiplied with the color of the material like the regular instancing

					if ( this.instanceColor === true ) {

						const colors = mesh.instanceColor;
						const component = index + ( 1 + attributes.length ) * 4;

						for ( let c = 0; c < 3; c ++ ) {

							const value = Math.fround( colors.getComponent( i, c ) );

							if ( instanceDataArray[ component + c ] !== value ) {

								instanceDataArray[ component + c ] = value;
								dataChanged = true;

							}

						}

					}

					// the bounding sphere of the geometry, where the position node is evaluated

					if ( this.deformed === true ) {

						const sphere = getBoundingSphere( mesh.geometry );
						const component = index + ( stride - 1 ) * 4;

						if ( instanceDataArray[ component ] !== Math.fround( sphere.center.x ) || instanceDataArray[ component + 1 ] !== Math.fround( sphere.center.y ) ||
							instanceDataArray[ component + 2 ] !== Math.fround( sphere.center.z ) || instanceDataArray[ component + 3 ] !== Math.fround( sphere.radius ) ) {

							instanceDataArray.set( [ sphere.center.x, sphere.center.y, sphere.center.z, sphere.radius ], component );
							dataChanged = true;

						}

					}

					if ( dataChanged === true ) data.mark( slot );

					// the distance range of the object, shared by its instances

					if ( writeLevel( levelArray, offset + slot, range ) === true ) level.mark( slot );

				}

			}

		} else {

			for ( let o = 0; o < objects.length; o ++ ) {

				const elements = objects[ o ].matrixWorld.elements;
				const index = offset + o;

				if ( equalsMatrix( worldArray, index * 16, elements ) === false ) {

					worldArray.set( elements, index * 16 );
					writeBounds( boundsArray, index, elements );

					transform.mark( o );

				}

				if ( writeLevel( levelArray, index, levels !== null ? levels[ o ] : null ) === true ) level.mark( o );

			}

		}

		// the update ranges of the buffers

		const upload = ( attribute, ranges, start, itemSize, base = 0 ) => {

			for ( const [ from, to ] of ranges ) attribute.addUpdateRange( base + ( start + from ) * itemSize, ( to - from ) * itemSize );

			if ( ranges.length > 0 ) attribute.needsUpdate = true;

		};

		const transformRanges = transform.finish();
		const objectRanges = object.finish();

		upload( culling.levelAttribute, level.finish(), offset, 8 );

		if ( this.gpuTransform === true ) {

			// the world matrices and the bounds of the culling are computed on the GPU, they must not be uploaded

			const layout = this.instanceLayout;

			upload( this.instanceAttribute, transformRanges, 0, 16, layout.local );
			upload( this.instanceAttribute, objectRanges, 0, 16 );
			upload( this.instanceAttribute, data.finish(), 0, this.instanceDataStride * 4, layout.data );

		} else {

			upload( culling.worldAttribute, transformRanges, offset, 16 );
			upload( culling.boundsAttribute, transformRanges, offset, 4 );

		}

		return { transform: transformRanges, object: objectRanges };

	}

	/**
	 * Copies the current world matrices of the given slots to their previous matrices, for the velocity of temporal
	 * effects. The previous matrices of instanced meshes are computed on the GPU.
	 *
	 * @param {number} from - The first slot.
	 * @param {number} to - The slot after the last slot.
	 */
	copyHistory( from, to ) {

		if ( this.history !== true || this.gpuTransform === true || to <= from ) return;

		const culling = this.culling;
		const attribute = culling.worldAttribute;
		const start = this.dataOffset * 16;
		const previous = ( culling.capacity.data + this.dataOffset ) * 16;

		attribute.array.copyWithin( previous + from * 16, start + from * 16, start + to * 16 );
		attribute.addUpdateRange( previous + from * 16, ( to - from ) * 16 );
		attribute.needsUpdate = true;

	}

	/**
	 * Returns the compute nodes to dispatch before the culling in this frame: the world matrices and bounds of
	 * the instances, computed while their matrices change and once more to update their previous matrices.
	 *
	 * @param {boolean} [compile=false] - Whether all nodes are returned to be compiled, without dispatching them.
	 * @return {Array<ComputeNode>} The compute nodes.
	 */
	getComputeNodesBefore( compile = false ) {

		if ( compile === true ) return this.computeNodesBefore;

		// the position node can change every frame, the deformed bounds are computed every frame

		if ( this.transformNode === null || ( this.transformFrames === 0 && this.deformed === false ) ) return EMPTY_NODES;

		if ( this.transformFrames > 0 ) this.transformFrames --;

		this.transformNode.count = Math.max( this.count, 1 );
		this.transformCount.value = this.count;
		this.transformPreviousCount.value = this.transformedCount;
		this.transformedCount = this.count;

		return this.computeNodesBefore;

	}

	/**
	 * Frees the GPU-related resources of the batch.
	 */
	dispose() {

		this.culling.remove( this );

		for ( const computeNode of this.computeNodesBefore ) computeNode.dispose();
		for ( const computeNode of this.computeNodes ) computeNode.dispose();
		for ( const mesh of this.meshes ) mesh.material.dispose();
		for ( const mesh of this.prepassMeshes ) mesh.material.dispose();
		for ( const geometry of this.ownedGeometries ) geometry.dispose();
		for ( const attribute of this.attributes ) attribute.dispose();

	}

}

/**
 * A GPU-driven drawing pipeline that renders compatible meshes as meshlets. Geometries are processed once into
 * clusters (meshlets) of 64 triangles with a chain of simplified levels of detail. Every frame, compute
 * shaders select the level of detail per object and cull the objects and clusters against the frustum,
 * and the visible clusters of all objects sharing geometry and material are drawn in one indirect draw
 * through the hardware rasterizer.
 *
 * The node graph of the material is evaluated on the pulled vertices (position, normal, model matrices and
 * the attributes of the geometry), so custom nodes, lights, shadows and the environment work as usual.
 * Supported are opaque and alpha-tested meshes using front side rendering whose material nodes don't change the geometry,
 * the coverage or the output of the draw. All other objects, and all objects in render calls using a custom
 * render object function like shadow passes, are drawn by the regular pipeline. Objects are drawn by the
 * regular pipeline until their geometry is processed.
 * Objects affected by clipping planes use the regular pipeline, including their depth-only passes.
 * Material properties are read from the source material, so uniform changes do not require rebuilding the
 * batches. Meshlets are regenerated when geometry attributes or indices are replaced or marked `needsUpdate`.
 * Meshes with an array of materials are processed per geometry group, with separate meshlets and levels of
 * detail for each index range. Compatible groups use the GPU-driven pipeline while the other groups use
 * the regular pipeline. Meshlets of a group are shared by all meshes using the same geometry and range. The
 * batches of the groups of the same objects share the transforms and instance data of the objects, which are
 * uploaded once.
 *
 * The transforms of the objects are compared with the last upload, only the objects and instances which changed
 * are uploaded. Objects exceeding {@link MeshletDrawingPipeline#maxInstances} are drawn by the regular pipeline: static
 * bundle groups and the objects drawn by the GPU-driven pipeline in the last frames have precedence.
 *
 * Positions deformed by the context of the render call, like a curved world in the context of a pass, are culled
 * by the bounds of the deformed positions which the context provides with a `getBoundingSphere( sphere, cameraPosition )`
 * function: it receives the bounding sphere in world space ( `vec4` center and radius ) and returns the bounding
 * sphere of the deformed positions. Cone culling is disabled, shadow passes use the real positions.
 *
 * ```js
 * scenePass.contextNode = overrideNodes( [ [ modelViewProjection, curvedProjection ] ], context( {
 * 	getBoundingSphere: ( sphere, cameraPosition ) => curvedSphere( sphere, cameraPosition )
 * } ) );
 * ```
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
 * renderer.drawingPipeline = new MeshletDrawingPipeline();
 *
 * const city = new BundleGroup();
 * city.add( ...buildings );
 * scene.add( city );
 * ```
 *
 * This class is experimental and its interface might change.
 *
 * @augments StandardDrawingPipeline
 */
class MeshletDrawingPipeline extends StandardDrawingPipeline {

	/**
	 * Constructs a new meshlet drawing pipeline.
	 *
	 * @param {Object} [parameters] - The configuration parameter.
	 * @param {number} [parameters.lodThreshold=1] - The projected error in pixels below which a simpler level of detail is selected.
	 * @param {number} [parameters.shadowLodThreshold=1] - The projected error in shadow map texels below which a simpler level of detail is selected for shadow casters.
	 * @param {number} [parameters.minScreenRadius=0] - The radius in pixels below which objects are not drawn, `0` draws all objects.
	 * @param {number} [parameters.coarseScreenRadius=0] - The radius in pixels below which objects are drawn with their simplest level of detail.
	 * @param {boolean} [parameters.debug=false] - Whether the clusters should be shown with a flat color each instead of the material.
	 * @param {boolean} [parameters.occlusionCulling=true] - Whether the clusters hidden by other clusters should be culled.
	 * @param {boolean} [parameters.depthPrepass=false] - Whether the depth of the clusters should be drawn before their material.
	 */
	constructor( { lodThreshold = 1, shadowLodThreshold = 1, minScreenRadius = 0, coarseScreenRadius = 0, debug = false, occlusionCulling = true, depthPrepass = false } = {} ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isMeshletDrawingPipeline = true;

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
		 * The radius of the bounding sphere of objects on the screen in pixels, or in shadow map texels for shadow
		 * casters, below which they are not drawn. Small objects contribute few pixels, culling them saves the work of
		 * their clusters. `0` draws all objects.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.minScreenRadius = minScreenRadius;

		/**
		 * The radius of the bounding sphere of objects on the screen in pixels, or in shadow map texels for shadow
		 * casters, below which they are drawn with their simplest level of detail, independent of the projected
		 * error. `0` selects the level by the projected error only.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.coarseScreenRadius = coarseScreenRadius;

		/**
		 * The clusters and triangles drawn by the GPU-driven pipeline in the main view, read from the counters of the
		 * culling without waiting for the GPU. The values are updated every interval of frames, the triangles include the degenerate triangles which pad the clusters.
		 *
		 * @type {{clusters: number, triangles: number}}
		 * @readonly
		 */
		this.info = { clusters: 0, triangles: 0 };

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

		this._occlusionPipeline = new StandardDrawingPipeline();
		this._boundsNode = null;

		this._ready = false;
		this._meshletsEnabled = false;
		this._camera = null;
		this._depth = 0;
		this._gpuProjectionId = 0;

		this._clusters = new WeakMap();
		this._geometryStates = new WeakMap();
		this._checkedGeometries = new WeakSet();
		this._geometryPool = new MeshletGeometryPool();
		this._records = new Set();

		// the meshlets of disposed geometries are removed, they are processed again if the geometry is drawn again

		this._onGeometryDispose = ( event ) => this._disposeGeometry( event.target );
		this._groupClusters = new WeakMap();
		this._materials = new WeakMap();
		this._pendingGeometry = null;
		this._waitingGeometry = null;
		this._renderListBatches = new WeakMap();
		this._capture = null;
		this._lodRange = null;
		this._lodRanges = new WeakMap();
		this._meshletsSupported = false;
		this._shadowPass = false;
		this._sceneProjected = false;
		this._lodView = { position: new Vector3(), scale: 1, perspective: 1, threshold: 1, minScreenRadius: 0, coarseScreenRadius: 0 };

		clusterProcessingReady.then( () => {

			this._ready = true;

		} );

	}

	/**
	 * The maximum number of objects drawn by the GPU-driven pipeline per render list. The instances of instanced
	 * meshes count as objects, once per geometry group. Limited by the maximum size of a storage buffer binding:
	 * the world matrices of the objects and of the last frame use 128 bytes per object.
	 *
	 * @type {number}
	 * @readonly
	 */
	get maxInstances() {

		return Math.min( Math.floor( this._getMaxBindingSize() / 128 ), MAX_INSTANCES );

	}

	/**
	 * Returns the maximum size in bytes of a storage buffer binding of the device.
	 *
	 * @private
	 * @return {number} The maximum size in bytes.
	 */
	_getMaxBindingSize() {

		const limits = this.renderer !== null && this.renderer !== undefined ? this.renderer.backend.device?.limits : undefined;

		return limits !== undefined ? Math.min( limits.maxStorageBufferBindingSize, limits.maxBufferSize ) : DEFAULT_MAX_BINDING_SIZE;

	}

	/**
	 * Prepares the meshlets and geometry LODs before `Renderer.compileAsync()` projects
	 * the scene. Shared geometries are processed once, including meshes outside the frustum.
	 * Batches and their render and compute pipelines are then prepared by the renderer.
	 *
	 * @async
	 * @param {Object3D} scene - The scene or object to precompile.
	 * @param {Camera} camera - The camera.
	 * @return {Promise} Resolves when the meshlets are ready.
	 */
	async prepareAsync( scene, camera ) {

		if ( this.renderer.backend.isWebGPUBackend !== true ) return;

		await clusterProcessingReady;
		this._ready = true;
		this._checkedGeometries = new WeakSet();

		if ( scene.matrixWorldAutoUpdate === true ) scene.updateMatrixWorld();

		const geometries = new Map();

		const collect = ( object, material, group ) => {

			if ( isSupportedObject( object, object.geometry, group, true ) === false || this._isSupportedMaterial( material ) === false ) return;

			let groups = geometries.get( object.geometry );

			if ( groups === undefined ) geometries.set( object.geometry, groups = new Map() );

			groups.set( group !== null ? `${ group.start }:${ group.count }` : null, group );

		};

		scene.traverse( object => {

			if ( object.isMesh !== true || object.layers.test( camera.layers ) === false ) return;

			if ( Array.isArray( object.material ) ) {

				for ( const group of object.geometry.groups ) {

					const material = object.material[ group.materialIndex ];

					if ( material ) collect( object, material, group );

				}

			} else {

				collect( object, object.material, null );

			}

		} );

		for ( const [ geometry, groups ] of geometries ) {

			for ( const group of groups.values() ) {

				if ( this._hasClusters( geometry, group ) ) continue;

				this._getClusters( geometry, group, true );

				// Yield between submeshes without leaving the renderer in precompilation state.

				await new Promise( resolve => setTimeout( resolve, 0 ) );

			}

		}

	}

	begin( camera, renderContext ) {

		super.begin( camera, renderContext );
		this._checkedGeometries = new WeakSet();

		// the vertices of disposed geometries are reclaimed before the render call

		this._geometryPool.update();

		const renderer = this.renderer;
		const renderTarget = renderer.getRenderTarget();

		this._meshletsSupported = this._ready === true &&
			renderer.backend.isWebGPUBackend === true &&
			renderer.logarithmicDepthBuffer !== true &&
			renderer.reversedDepthBuffer !== true &&
			renderer.localClippingEnabled !== true &&
			( renderer.clippingPlanes === undefined || renderer.clippingPlanes.length === 0 ) &&
			camera.isArrayCamera !== true &&
			( renderTarget === null || ( renderTarget.isCubeRenderTarget !== true && renderTarget.depth <= 1 ) );

		// render calls with a custom render object function are only supported for shadow passes, see project()

		this._meshletsEnabled = this._meshletsSupported === true && renderer.getRenderObjectFunction() === null && camera.isPerspectiveCamera === true;
		this._shadowPass = false;
		this._sceneProjected = false;

		// positions deformed by the context of the render call, like a curved world in the context of a pass, provide
		// the bounding sphere of the deformed positions for the culling

		const getBoundingSphere = renderer.contextNode.getFlowContextData().getBoundingSphere;

		this._boundsNode = typeof getBoundingSphere === 'function' ? getBoundingSphere : null;

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

			if ( this._meshletsSupported === true && renderer.getRenderObjectFunction() !== null &&
				overrideMaterial !== null && overrideMaterial.isShadowPassMaterial === true && renderer.shadowMap.type !== VSMShadowMap &&
				( camera.isPerspectiveCamera === true || camera.isOrthographicCamera === true ) ) {

				this._meshletsEnabled = true;
				this._shadowPass = true;

			}

		}

		// the levels of LOD objects are selected per object on the GPU

		if ( object.isLOD === true && this._meshletsEnabled === true && object.levels.length > 0 ) {

			if ( object.visible === false ) return;

			this._projectLOD( object, camera, groupOrder, renderList, clippingContext );

			return;

		}

		if ( object.isBundleGroup === true ) {

			// static bundle groups keep the supported meshes on the GPU and the other objects in the render bundle

			if ( this._capture === null && object.static === true && this._meshletsEnabled === true && this._depth === 1 && this.renderer.backend.beginBundle !== undefined ) {

				if ( object.visible === false ) return;

				this._projectStaticGroup( object, camera, groupOrder, renderList, clippingContext );

				return;

			}

			// bundle groups inside of a captured group are part of it. non-static bundle groups are projected like groups,
			// a render bundle would draw their meshes without the GPU-driven pipeline

			if ( this._capture !== null || ( object.static !== true && this._meshletsEnabled === true && this._depth === 1 ) ) {

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
			this._isMeshlet( level, level.geometry, level.material, null ) === true && this._isMeshlet( next, next.geometry, next.material, null ) === true;

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

		if ( Array.isArray( object.material ) ) {

			for ( const group of object.geometry.groups ) {

				const material = object.material[ group.materialIndex ];

				if ( material && material.visible && this._isMeshlet( object, object.geometry, material, group ) && ( this._capture !== null || this._hasClusters( object.geometry, group ) ) ) return false;

			}

		} else if ( this._isMeshlet( object, object.geometry, object.material, null ) === true && ( this._capture !== null || this._hasClusters( object.geometry, null ) ) ) {

			return false;

		}

		return super.isCulled( object, camera );

	}

	pushRenderItem( renderList, object, geometry, material, groupOrder, z, group, clippingContext ) {

		// Clipping also affects depth-only passes. Keep clipped objects in the regular pipeline so they cannot
		// share a batch with another clipping context or occlude objects through their clipped fragments.

		const hasClipping = clippingContext.unionPlanes.length > 0 || clippingContext.intersectionPlanes.length > 0;

		if ( hasClipping === false && this._capture !== null && this._captureRenderItem( object, geometry, material, groupOrder, z, group, clippingContext ) === true ) {

			return;

		}

		// levels of LOD objects drawn by the regular pipeline in a captured group are selected every frame, outside of the render bundle

		if ( this._capture !== null && this._lodRange !== null ) {

			this._capture.data.items.push( { object, geometry, material, groupOrder, group, clippingContext, range: this._lodRange } );

			return;

		}

		if ( hasClipping === false && this._capture === null && this._isMeshlet( object, geometry, material, group ) === true ) {

			const clusters = this._getClusters( geometry, group );

			if ( clusters !== null ) {

				// the instances of instanced meshes are drawn as objects. the entries exceeding the maximum number of
				// instances of the render list are drawn by the regular pipeline, see _drawBatches()

				const record = this._getRecord( renderList );
				const entry = this._getEntry( record, clusters, material, object.receiveShadow, object.isInstancedMesh === true, object.isInstancedMesh === true && object.instanceColor !== null, this._getFarMaterial() );

				if ( entry.objects.length === 0 ) {

					entry.groupOrder = groupOrder;
					entry.z = z;
					entry.clippingContext = clippingContext;

				}

				entry.objects.push( object );
				entry.objectClusters.push( clusters );
				entry.groups.push( group );
				entry.levels.push( this._lodRange );
				entry.count += object.isInstancedMesh === true ? object.count : 1;

				return;

			}

		}

		// levels of LOD objects drawn by the regular pipeline are selected by the CPU

		if ( this._isLevelSelected( this._lodRange, this._camera ) === false ) return;
		if ( Array.isArray( object.material ) && super.isCulled( object, this._camera ) ) return;

		super.pushRenderItem( renderList, object, geometry, material, groupOrder, z, group, clippingContext );

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
				entry.objectClusters.length = 0;
				entry.groups.length = 0;
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

		// static bundle groups have precedence, the entries of the other objects use the remaining instances

		if ( record.staticInstanceCount + data.instanceCount <= this.maxInstances ) {

			data.projectionId = this._gpuProjectionId;
			record.staticInstanceCount += data.instanceCount;

		} else {

			// the GPU-driven pipeline of the render list is full

			for ( const entry of data.entries ) this._pushEntryItems( renderList, entry );

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

		if ( clippingContext !== this._capture.clippingContext || this._isMeshlet( object, geometry, material, group ) === false ) return false;

		const clusters = this._getClusters( geometry, group );

		if ( clusters === null ) {

			data.pending = true;

			return false;

		}

		const count = object.isInstancedMesh === true ? object.count : 1;
		const entry = this._getStaticEntry( data, clusters, material, object.receiveShadow, object.isInstancedMesh === true, object.isInstancedMesh === true && object.instanceColor !== null, this._getFarMaterial() );

		if ( entry.objects.length === 0 ) {

			entry.groupOrder = groupOrder;
			entry.z = z;
			entry.clippingContext = clippingContext;

		}

		entry.objects.push( object );
		entry.objectClusters.push( clusters );
		entry.groups.push( group );
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
	 * Pushes the objects of an entry which is not drawn by the GPU-driven pipeline as render items of the
	 * regular pipeline, culled by the CPU.
	 *
	 * @private
	 * @param {RenderList} renderList - The render list.
	 * @param {Object} entry - The entry.
	 */
	_pushEntryItems( renderList, entry ) {

		const camera = this._camera;

		for ( let i = 0; i < entry.objects.length; i ++ ) {

			const object = entry.objects[ i ];

			if ( this._isLevelSelected( entry.levels[ i ], camera ) === false ) continue;

			this._pushCapturedItem( renderList, camera, { object, geometry: object.geometry, material: entry.material, groupOrder: entry.groupOrder, group: entry.groups[ i ], clippingContext: entry.clippingContext } );

		}

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
	 * @param {boolean} instanceColor - Whether the instanced meshes have instance colors.
	 * @param {?Material} farMaterial - The material beyond the switch distance of merged levels.
	 * @return {Object} The entry.
	 */
	_getStaticEntry( data, clusters, material, receiveShadow, instanced, instanceColor, farMaterial ) {

		let byClusters = data.lookup.get( material );

		if ( byClusters === undefined ) {

			byClusters = new Map();
			data.lookup.set( material, byClusters );

		}

		// the geometries of a batch key share the batch, see _getBatchKey()

		const batchKey = this._getBatchKey( clusters );

		let byShadow = byClusters.get( batchKey );

		if ( byShadow === undefined ) {

			byShadow = new Map();
			byClusters.set( batchKey, byShadow );

		}

		const key = getEntryKey( receiveShadow, instanced, instanceColor, farMaterial );

		let entry = byShadow.get( key );

		if ( entry === undefined ) {

			entry = {
				clusters,
				batchKey,
				material,
				farMaterial,
				receiveShadow,
				instanced,
				instanceColor,
				key,
				objects: [],
				objectClusters: [],
				groups: [],
				levels: [],
				count: 0,
				groupOrder: 0,
				z: 0,
				clippingContext: null,
				source: null,
				queueBudget: Infinity, // all clusters until measured, so a single render like a shadow map isn't incomplete
				queueMeasured: false,
				maxChunks: 0,
				geometryIndices: null,
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
	_isMeshlet( object, geometry, material, group ) {

		return this._meshletsEnabled === true && ( this._depth === 1 || this._capture !== null ) && ( this._shadowPass === false || object.castShadow === true ) && isSupportedObject( object, geometry, group ) && this._isSupportedMaterial( material );

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
	 * Prepares the view of the given render list, for pipelines using screen-space resources.
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
	 * @param {boolean} shadow - Whether the culling draws a shadow map.
	 * @param {number} [clusterBudget=0] - The measured number of clusters of the visible objects.
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
	 * @param {MeshletCulling} culling - The culling of the render list.
	 * @return {MeshletBatch} The batch.
	 */
	createBatch( entry, capacity, view, culling ) {

		return new MeshletBatch( entry.clusters, entry.material, entry.receiveShadow, capacity, this.renderer, culling, {
			debug: this.debug,
			depthPrepass: this._usesDepthPrepass(),
			instanced: entry.instanced,
			instanceColor: entry.instanceColor,
			farMaterial: entry.farMaterial,
			source: entry.source !== null ? entry.source.batch : null,
			queueBudget: entry.queueBudget,
			maxChunks: entry.maxChunks,
			pool: this._geometryPool,
			view
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
		lodView.minScreenRadius = this.minScreenRadius;
		lodView.coarseScreenRadius = this.coarseScreenRadius;

		const view = this.updateView( record, width, height );
		const occlusion = view !== null ? view.occlusion : null;
		const boundsNode = this._shadowPass === true ? null : this._boundsNode;

		// the culling of the render list is created again with its batches if the view changed

		if ( record.culling !== null && ( record.culling.view !== view || record.culling.occlusion !== occlusion || record.culling.boundsNode !== boundsNode ) ) {

			this._disposeCulling( record );

		}

		// the entries collected in this projection

		const dynamicEntries = [];
		const staticEntries = [];

		for ( let i = record.entries.length - 1; i >= 0; i -- ) {

			const entry = record.entries[ i ];

			if ( entry.projectionId !== this._gpuProjectionId ) {

				if ( ++ entry.unusedProjections >= MAX_UNUSED_PROJECTIONS ) {

					if ( entry.batch !== null ) entry.batch.dispose();

					record.entries.splice( i, 1 );

					// the maps of the lookup are removed with their last entry, so disposed materials can be collected

					const byKey = record.lookup.get( entry.material );
					const byShadow = byKey.get( entry.batchKey );

					byShadow.delete( entry.key );

					if ( byShadow.size === 0 ) byKey.delete( entry.batchKey );
					if ( byKey.size === 0 ) record.lookup.delete( entry.material );

				}

				continue;

			}

			dynamicEntries.push( entry );

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

				if ( entry.objects.length > 0 ) staticEntries.push( entry );

			}

		}

		if ( record.entries.length === 0 && record.staticGroups.size === 0 ) {

			this._disposeCulling( record );

			if ( record.view !== null ) {

				record.view.dispose();
				record.view = null;

			}

		}

		// the entries of the same objects, like the groups of meshes with multiple materials, share the data of the
		// objects. the first entry of a set writes it

		const dynamicSets = getEntrySets( dynamicEntries );
		const staticSets = getEntrySets( staticEntries );

		// the instances not used by static bundle groups. the sets which have batches are drawn first, so the entries
		// of the GPU-driven pipeline don't change if the objects exceed the maximum number of instances. the other
		// entries are drawn by the regular pipeline and keep their batches for a while

		let available = this.maxInstances - record.staticInstanceCount;

		dynamicSets.sort( ( a, b ) => ( b[ 0 ].batch !== null ? 1 : 0 ) - ( a[ 0 ].batch !== null ? 1 : 0 ) );

		const active = [];

		for ( const set of dynamicSets ) {

			let count = 0;

			for ( const entry of set ) count += entry.count;

			if ( count <= available ) {

				available -= count;

				for ( const entry of set ) {

					entry.unusedProjections = 0;
					active.push( entry );

				}

				continue;

			}

			for ( const entry of set ) {

				if ( entry.batch !== null && ++ entry.unusedProjections >= MAX_UNUSED_PROJECTIONS ) {

					entry.batch.dispose();
					entry.batch = null;

				}

				this._pushEntryItems( renderList, entry );

			}

		}

		for ( const set of staticSets ) active.push( ...set );

		if ( active.length === 0 ) return;

		// the batches: created again if the objects exceed the capacity, the material, the debug mode or the batch sharing the
		// objects changed. a batch which doesn't fit into the buffers of the culling creates the culling again, sized for all
		// batches. batches sharing the objects of another batch are created after it, with its capacity

		const getSource = ( entry ) => entry.source !== null ? entry.source.batch : null;

		const needsBatch = ( entry ) => {

			const batch = entry.batch;

			return batch === null || batch.added === false || batch.culling !== record.culling || entry.count > batch.capacity || batch.depthPrepass !== this._usesDepthPrepass() ||
				batch.materialVersion !== entry.material.version || ( batch.farMaterial !== null && batch.farMaterialVersion !== batch.farMaterial.version ) || batch.debug !== this.debug ||
				batch.source !== getSource( entry ) || ( entry.source !== null && batch.capacity !== entry.source.batch.capacity );

		};

		const getCapacity = ( entry ) => Math.min( Math.max( entry.batch !== null ? entry.batch.capacity : 64, Math.ceil( entry.count * BATCH_GROWTH / 64 ) * 64 ), this.maxInstances );

		// the clusters per object of a batch: the most detailed level of the geometries of its objects

		for ( const entry of active ) {

			let maxChunks = 0;

			for ( const clusters of entry.objectClusters ) maxChunks = Math.max( maxChunks, clusters.maxChunks );

			entry.maxChunks = maxChunks;

		}

		// while geometries wait to be processed, one per projection, the culling and the batches are not created again for
		// each processed geometry. the entries which don't fit into them are drawn by the regular pipeline, the culling
		// is sized once for all entries when the last geometry is processed

		if ( this._waitingGeometry === this._gpuProjectionId ) {

			const culling = record.culling;
			const resize = culling === null || record.needsResize === true || record.poolVersion !== this._geometryPool.version;
			const waiting = new Set();

			for ( const entry of active ) {

				const batch = entry.batch;

				if ( resize === true || needsBatch( entry ) === true || entry.maxChunks > batch.maxChunks || ( entry.source !== null && waiting.has( entry.source ) ) ||
					entry.objectClusters.some( ( clusters ) => culling.getGeometry( clusters ) === - 1 ) ) {

					waiting.add( entry );

				}

			}

			for ( let i = active.length - 1; i >= 0; i -- ) {

				if ( waiting.has( active[ i ] ) === false ) continue;

				this._pushEntryItems( renderList, active[ i ] );
				active.splice( i, 1 );

			}

			if ( active.length === 0 ) return;

		}

		// the culling is resized if the visible clusters exceeded a budget in the last read of its counters

		let rebuild = record.culling === null || record.needsResize === true || record.poolVersion !== this._geometryPool.version;

		record.needsResize = false;

		// the culling is resized for geometries which don't fit into its table, or objects with more clusters than a batch

		if ( rebuild === false ) {

			rebuild = this._addGeometries( record.culling, active ) === false || active.some( ( entry ) => entry.batch !== null && entry.maxChunks > entry.batch.maxChunks );

		}

		if ( rebuild === false ) {

			for ( const entry of active ) {

				if ( needsBatch( entry ) === false ) continue;

				const capacity = entry.source !== null ? entry.source.batch.capacity : getCapacity( entry );

				if ( entry.batch !== null ) entry.batch.dispose();

				entry.batch = this.createBatch( entry, capacity, view, record.culling );

				if ( entry.batch.added === false ) {

					rebuild = true;
					break;

				}

			}

		}

		if ( rebuild === true ) {

			// the culling is resized for all batches. the batches which can be kept are added to the resized culling, so
			// their materials and pipelines stay valid. a batch sharing the objects of another batch is kept with it

			const capacities = new Map();
			const kept = new Set();

			for ( const entry of active ) {

				if ( record.culling !== null && needsBatch( entry ) === false && ( entry.source === null || kept.has( entry.source ) ) ) {

					kept.add( entry );
					capacities.set( entry, entry.batch.capacity );

					entry.batch.maxChunks = Math.max( entry.batch.maxChunks, entry.maxChunks );

				} else {

					capacities.set( entry, entry.source !== null ? capacities.get( entry.source ) : getCapacity( entry ) );

				}

			}

			const capacity = this._getCullingCapacity( active, active.map( ( entry ) => capacities.get( entry ) ), occlusion !== null, this._shadowPass, record.clusterBudget );

			if ( record.culling === null ) {

				record.culling = new MeshletCulling( capacity, { shadow: this._shadowPass, occlusion, boundsNode, view } );

			} else {

				this._disposeBatches( record, kept );

				record.culling.resize( capacity );

			}

			this._addGeometries( record.culling, active );

			record.poolVersion = this._geometryPool.version;

			// the budgets of the new buffers are checked after a few projections, the occlusion culling needs the visible
			// clusters of a frame. without it they are checked in this projection, so a render which isn't repeated like
			// a static shadow map is measured too

			record.readbackProjections = COUNTER_READBACK_INTERVAL - ( occlusion !== null ? 2 : 1 );

			for ( const entry of active ) {

				if ( kept.has( entry ) === true ) {

					entry.batch.queueBudget = entry.queueBudget;

					if ( entry.batch.relocate() === true ) continue;

				}

				if ( entry.batch !== null ) entry.batch.dispose();

				entry.batch = this.createBatch( entry, capacities.get( entry ), view, record.culling );

			}

		}

		const culling = record.culling;

		culling.updateView( camera, this._projScreenMatrix, this._frustum, width, height, lodView );

		// the objects of the batches not drawn in this projection are not culled

		for ( const batch of culling.batches ) culling.setObjectCount( batch, 0 );

		const compile = renderer._compilationPromises !== null;
		const batchComputeNodes = [];
		const computeNodesBefore = [];

		let instanceOffset = 0;

		for ( const entry of active ) {

			const batch = entry.batch;

			// batches drawing into the view own a slice of its instance index range

			if ( batch.instanceOffset !== undefined ) {

				batch.instanceOffset.value = instanceOffset;
				instanceOffset += entry.count;

			}

			// the transforms of static bundle groups are uploaded once per capture

			const upload = entry.version === undefined || batch.uploadedVersion !== entry.version;

			// the geometry of each object, its index in the table of the culling

			const geometryIndices = entry.geometryIndices || ( entry.geometryIndices = [] );

			geometryIndices.length = entry.objectClusters.length;

			for ( let i = 0; i < geometryIndices.length; i ++ ) geometryIndices[ i ] = culling.getGeometry( entry.objectClusters[ i ] );

			batch.update( entry.objects, this, upload, entry.levels, geometryIndices );
			batch.uploadedVersion = entry.version;

			computeNodesBefore.push( ...batch.getComputeNodesBefore( compile ) );
			batchComputeNodes.push( ...batch.computeNodes );

		}

		culling.updateTable();

		const computeNodes = [];

		// the occlusion culling is skipped while it culls few clusters, except in the projections measuring it again.
		// a measure needs the visible clusters of the previous projections in the same buffers

		const occlusionActive = occlusion !== null && ( record.occlusionSkipped === false || record.readbackProjections >= COUNTER_READBACK_INTERVAL - OCCLUSION_PROBE_PROJECTIONS );

		record.occlusionProjections = occlusionActive === true && record.occlusionVisibility === culling.visibilityAttribute ? record.occlusionProjections + 1 : 0;
		record.occlusionVisibility = culling.visibilityAttribute;

		if ( occlusion !== null ) computeNodes.push( ...occlusion.computeNodes );
		if ( view !== null && view.computeClear !== null ) computeNodes.push( view.computeClear );

		computeNodes.push( ...culling.computeNodes, ...batchComputeNodes );

		// the world matrices and bounds of instances which changed are computed before the culling

		const cullNodes = computeNodesBefore.length > 0 ? [ ...computeNodesBefore, ...culling.cullNodes ] : culling.cullNodes;

		if ( compile === true ) {

			// Compile all compute stages asynchronously, without dispatching the culling.

			const skipNodes = occlusion !== null ? culling.skipOcclusionNodes : [];

			renderer._compilationPromises.push( { computeNodes: [ ...cullNodes, ...computeNodes, ...skipNodes ] } );

			if ( occlusion !== null ) this._renderOcclusionDepth( occlusion, active );

		} else if ( occlusionActive === true ) {

			// first phase, the depth of the clusters visible in the last frame and the second phase

			renderer.compute( cullNodes );

			this._renderOcclusionDepth( occlusion, active );

			renderer.compute( computeNodes );

		} else if ( occlusion !== null ) {

			renderer.compute( [ ...computeNodesBefore, ...culling.skipOcclusionNodes, ...( view.computeClear !== null ? [ view.computeClear ] : [] ), ...batchComputeNodes ] );

		} else {

			// one compute call for all batches of the render list

			renderer.compute( [ ...cullNodes, ...computeNodes ] );

		}

		if ( compile === false ) this._readCounters( record, active, record.occlusionProjections >= OCCLUSION_PROBE_PROJECTIONS );

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
	 * Reads the counters of the culling of a render list every interval of projections, without waiting for the
	 * GPU. The visible clusters of the last frame which exceeded the budget of the clusters or the queue of a batch
	 * were not drawn: the budgets grow and the culling is resized in the next projection. The first read of a budget
	 * calibrates its estimate.
	 *
	 * @private
	 * @param {Object} record - The record of the render list.
	 * @param {Array<Object>} entries - The entries drawn in this projection.
	 * @param {boolean} occlusionMeasured - Whether the occlusion culling of this projection is measured.
	 */
	_readCounters( record, entries, occlusionMeasured ) {

		if ( record.readback !== null || ++ record.readbackProjections < COUNTER_READBACK_INTERVAL ) return;

		record.readbackProjections = 0;

		const culling = record.culling;
		const attribute = culling.countersAttribute;
		const batches = entries.map( ( entry ) => [ entry, entry.batch, entry.batch.index, entry.batch.queueCapacity ] );

		record.readback = this.renderer.getArrayBufferAsync( attribute ).then( ( buffer ) => {

			record.readback = null;

			// the counters of a culling which was resized or disposed since are not valid anymore

			if ( record.culling !== culling || culling.countersAttribute !== attribute ) return;

			const counters = new Uint32Array( buffer );

			let exceeded = false;
			let shrink = false;
			let drawn = 0;

			if ( counters[ 0 ] > culling.capacity.clusters ) {

				record.clusterBudget = Math.ceil( counters[ 0 ] * CULLING_GROWTH );
				exceeded = true;

			}

			for ( const [ entry, batch, index, queueCapacity ] of batches ) {

				const visible = Math.max( counters[ 1 + index * 2 ], batch.farMaterial !== null ? counters[ 2 + index * 2 ] : 0 );

				drawn += Math.min( counters[ 1 + index * 2 ], queueCapacity ) + ( batch.farMaterial !== null ? Math.min( counters[ 2 + index * 2 ], queueCapacity ) : 0 );

				if ( visible > queueCapacity ) {

					entry.queueBudget = Math.ceil( visible * CULLING_GROWTH );
					exceeded = true;

				} else if ( entry.queueMeasured === false ) {

					// the first measure replaces the budget of all clusters, the buffers shrink if much larger

					entry.queueBudget = Math.ceil( visible * CULLING_GROWTH );

					if ( queueCapacity > getQueueCapacity( batch.capacity, batch.maxChunks, entry.queueBudget ) * 4 ) shrink = true;

				}

				entry.queueMeasured = true;

			}

			// the statistics of the main view

			if ( culling.shadow === false ) {

				this.info.clusters = drawn;
				this.info.triangles = drawn * MESHLET_SIZE;

			}

			if ( occlusionMeasured === true ) {

				const occluded = counters[ culling.occludedCounter.value ];

				record.occlusionSkipped = occluded < ( occluded + drawn ) * OCCLUSION_MIN_CULLED;

			}

			if ( exceeded === true ) {

				record.needsResize = true;

			} else if ( shrink === true ) {

				this._shrinkCulling( record, batches.map( ( [ entry ] ) => entry ) );

			}

		} ).catch( () => {

			record.readback = null;

		} );

	}

	/**
	 * Shrinks the buffers of a culling to the measured budgets of the given entries, right after the read of the
	 * counters, so a render which isn't repeated like a static shadow map doesn't keep the larger buffers. The
	 * batches are added to the resized culling like in a rebuild. If one doesn't fit, the culling is rebuilt in
	 * its next projection.
	 *
	 * @private
	 * @param {Object} record - The record of the render list.
	 * @param {Array<Object>} entries - The entries drawn in the measured projection.
	 */
	_shrinkCulling( record, entries ) {

		const culling = record.culling;

		if ( entries.some( ( entry ) => entry.batch === null || entry.batch.culling !== culling ) ) {

			record.needsResize = true;
			return;

		}

		const capacity = this._getCullingCapacity( entries, entries.map( ( entry ) => entry.batch.capacity ), culling.occlusion !== null, culling.shadow, record.clusterBudget );

		this._disposeBatches( record, new Set( entries ) );

		culling.resize( capacity );

		if ( this._addGeometries( culling, entries ) === false ) record.needsResize = true;

		record.poolVersion = this._geometryPool.version;

		for ( const entry of entries ) {

			entry.batch.queueBudget = entry.queueBudget;

			if ( entry.batch.relocate() === false ) record.needsResize = true;

		}

	}

	/**
	 * Returns the capacity of the buffers of a culling for the given entries, with room for more objects and batches.
	 *
	 * @private
	 * @param {Array<Object>} entries - The entries.
	 * @param {Array<number>} capacities - The capacities of the batches of the entries.
	 * @param {boolean} occlusion - Whether the clusters are occlusion culled.
	 * @param {boolean} shadow - Whether the culling draws a shadow map.
	 * @param {number} [clusterBudget=0] - The measured number of clusters of the visible objects.
	 * @return {Object} The capacity.
	 */
	_getCullingCapacity( entries, capacities, occlusion, shadow, clusterBudget = 0 ) {

		const capacity = { batches: 0, objects: 0, data: 0, queue: 0, clusters: 0, visibility: 0, chunks: 0, geometries: 0 };
		const geometries = new Set();

		for ( let i = 0; i < entries.length; i ++ ) {

			const { farMaterial, source, batch } = entries[ i ];
			const objects = capacities[ i ];
			const queueCount = farMaterial !== null && shadow === false ? 2 : 1;
			const maxChunks = Math.max( entries[ i ].maxChunks, batch !== null ? batch.maxChunks : 0 );

			capacity.batches ++;
			capacity.objects += objects;
			capacity.data += source !== null ? 0 : objects;
			capacity.queue += getQueueCapacity( objects, maxChunks, entries[ i ].queueBudget ) * queueCount;
			capacity.clusters += objects * maxChunks;
			capacity.visibility += occlusion === true ? objects * maxChunks : 0;

			for ( const clusters of entries[ i ].objectClusters ) {

				if ( geometries.has( clusters ) === false ) {

					geometries.add( clusters );
					capacity.chunks += clusters.chunkCount;

				}

			}

		}

		capacity.geometries = Math.min( Math.max( geometries.size * 2, 64 ), MAX_GEOMETRIES );

		// room for more batches and objects without creating the culling again, the capacities of the batches have
		// room for more objects as well. the buffers are limited by the maximum size of a storage buffer binding

		const maxBindingSize = this._getMaxBindingSize();
		const grow = ( value, minimum, bytes ) => Math.min( Math.max( Math.ceil( value * CULLING_GROWTH ), minimum ), Math.floor( maxBindingSize / bytes ) );

		capacity.batches = Math.max( capacity.batches * 2, 16 );
		capacity.objects = grow( capacity.objects, 1024, 16 );
		capacity.data = grow( capacity.data, 1024, shadow === true ? 64 : 128 );
		capacity.queue = grow( capacity.queue, 1024, 16 );
		capacity.clusters = grow( Math.max( Math.min( capacity.clusters, Math.max( capacity.objects * CLUSTERS_PER_OBJECT, MIN_CLUSTER_BUDGET ) ), clusterBudget ), 1024, 4 );
		capacity.visibility = grow( capacity.visibility, 0, 4 );
		capacity.chunks = Math.max( capacity.chunks * 2, 1024 );

		return capacity;

	}

	/**
	 * Disposes the batches of a render list, except the given entries.
	 *
	 * @private
	 * @param {Object} record - The record of the render list.
	 * @param {Set<Object>} kept - The entries keeping their batches.
	 */
	_disposeBatches( record, kept ) {

		const dispose = ( entry ) => {

			if ( entry.batch !== null && kept.has( entry ) === false ) {

				entry.batch.dispose();
				entry.batch = null;

			}

		};

		for ( const entry of record.entries ) dispose( entry );

		for ( const data of record.staticGroups.values() ) {

			for ( const entry of data.entries ) dispose( entry );

		}

	}

	/**
	 * Disposes the culling of a render list and its batches.
	 *
	 * @private
	 * @param {Object} record - The record of the render list.
	 */
	_disposeCulling( record ) {

		if ( record.culling === null ) return;

		const dispose = ( entry ) => {

			if ( entry.batch !== null ) {

				entry.batch.dispose();
				entry.batch = null;

			}

		};

		for ( const entry of record.entries ) dispose( entry );

		for ( const data of record.staticGroups.values() ) {

			for ( const entry of data.entries ) dispose( entry );

		}

		record.culling.dispose();
		record.culling = null;

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

		if ( renderer._compilationPromises !== null ) {

			const previousRenderContext = renderer._currentRenderContext;
			const previousRenderTarget = renderer.getRenderTarget();
			const previousActiveCubeFace = renderer.getActiveCubeFace();
			const previousActiveMipmapLevel = renderer.getActiveMipmapLevel();
			const previousMRT = renderer.getMRT();
			const target = occlusion.target;
			const renderContext = renderer._renderContexts.get( target, null, renderer._callDepth + 1, this._camera );

			renderer._textures.updateRenderTarget( target );
			const targetData = renderer._textures.get( target );
			renderContext.textures = targetData.textures;
			renderContext.depthTexture = targetData.depthTexture;
			renderContext.depth = target.depthBuffer;
			renderContext.stencil = target.stencilBuffer;
			renderContext.renderTarget = target;
			renderContext.width = target.width;
			renderContext.height = target.height;
			renderContext.clippingContext = previousRenderContext.clippingContext;

			try {

				renderer._currentRenderContext = renderContext;
				renderer.setRenderTarget( target );
				renderer.setMRT( null );
				const renderList = renderer._renderLists.get( scene, this._camera, renderer.lighting );
				this._occlusionPipeline.renderer = renderer;
				this._occlusionPipeline.begin( this._camera, renderContext );
				this._occlusionPipeline.beginRenderList( renderList );
				this._occlusionPipeline.project( scene, this._camera, 0, renderList, renderContext.clippingContext );
				this._occlusionPipeline.finishRenderList( renderList );
				renderer._renderObjects( renderList.opaque, this._camera, scene, renderList.lightsNode );

			} finally {

				renderer._currentRenderContext = previousRenderContext;
				renderer.setRenderTarget( previousRenderTarget, previousActiveCubeFace, previousActiveMipmapLevel );
				renderer.setMRT( previousMRT );
				scene.children.length = 0;

			}

			return;

		}

		const currentPipeline = renderer.drawingPipeline;
		const currentRenderTarget = renderer.getRenderTarget();
		const currentActiveCubeFace = renderer.getActiveCubeFace();
		const currentActiveMipmapLevel = renderer.getActiveMipmapLevel();
		const currentAutoClear = renderer.autoClear;
		const currentAutoClearDepth = renderer.autoClearDepth;
		const currentMRT = renderer.getMRT();

		// the meshes are drawn as they are, without the GPU-driven pipeline

		renderer.drawingPipeline = this._occlusionPipeline;
		renderer.setMRT( null );
		renderer.autoClear = true;
		renderer.autoClearDepth = true;

		renderer.setRenderTarget( occlusion.target );
		renderer.render( scene, this._camera );

		renderer.setRenderTarget( currentRenderTarget, currentActiveCubeFace, currentActiveMipmapLevel );
		renderer.autoClear = currentAutoClear;
		renderer.autoClearDepth = currentAutoClearDepth;
		renderer.setMRT( currentMRT );
		renderer.drawingPipeline = currentPipeline;

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

			record = { entries: [], lookup: new Map(), staticGroups: new Map(), view: null, culling: null, projectionId: - 1, staticInstanceCount: 0, poolVersion: - 1, clusterBudget: 0, needsResize: false, readback: null, readbackProjections: 0, occlusionSkipped: false, occlusionProjections: 0, occlusionVisibility: null };

			this._renderListBatches.set( renderList, record );
			this._records.add( new WeakRef( record ) );

		}

		if ( record.projectionId !== this._gpuProjectionId ) {

			record.projectionId = this._gpuProjectionId;
			record.staticInstanceCount = 0;

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
	 * @param {boolean} instanceColor - Whether the instanced meshes have instance colors.
	 * @param {?Material} farMaterial - The material beyond the switch distance of merged levels.
	 * @return {Object} The entry.
	 */
	_getEntry( record, clusters, material, receiveShadow, instanced, instanceColor, farMaterial ) {

		let byClusters = record.lookup.get( material );

		if ( byClusters === undefined ) {

			byClusters = new Map();
			record.lookup.set( material, byClusters );

		}

		// the geometries of a batch key share the batch, see _getBatchKey()

		const batchKey = this._getBatchKey( clusters );

		let byShadow = byClusters.get( batchKey );

		if ( byShadow === undefined ) {

			byShadow = new Map();
			byClusters.set( batchKey, byShadow );

		}

		const key = getEntryKey( receiveShadow, instanced, instanceColor, farMaterial );

		let entry = byShadow.get( key );

		if ( entry === undefined ) {

			entry = {
				clusters,
				batchKey,
				material,
				farMaterial,
				receiveShadow,
				instanced,
				instanceColor,
				key,
				objects: [],
				objectClusters: [],
				groups: [],
				levels: [],
				count: 0,
				projectionId: - 1,
				unusedProjections: 0,
				groupOrder: 0,
				z: 0,
				clippingContext: null,
				source: null,
				queueBudget: Infinity, // all clusters until measured, so a single render like a shadow map isn't incomplete
				queueMeasured: false,
				maxChunks: 0,
				geometryIndices: null,
				batch: null
			};

			byShadow.set( key, entry );
			record.entries.push( entry );

		}

		if ( entry.projectionId !== this._gpuProjectionId ) {

			entry.projectionId = this._gpuProjectionId;
			entry.objects.length = 0;
			entry.objectClusters.length = 0;
			entry.groups.length = 0;
			entry.levels.length = 0;
			entry.count = 0;

		}

		return entry;

	}

	/**
	 * Removes the meshlets of a disposed geometry and its groups, and their vertices from the geometry pool.
	 *
	 * @private
	 * @param {BufferGeometry} geometry - The geometry.
	 */
	_disposeGeometry( geometry ) {

		geometry.removeEventListener( 'dispose', this._onGeometryDispose );

		const clusters = this._clusters.get( geometry );

		if ( clusters !== undefined ) this._geometryPool.remove( clusters );

		const groups = this._groupClusters.get( geometry );

		if ( groups !== undefined ) {

			for ( const groupClusters of groups.values() ) this._geometryPool.remove( groupClusters );

		}

		this._clusters.delete( geometry );
		this._groupClusters.delete( geometry );
		this._geometryStates.delete( geometry );

	}

	/**
	 * Frees the GPU-related resources of the pipeline: the cullings, batches and views of all render lists and the
	 * geometry pool. Called by {@link Renderer#dispose}. The pipeline can be used again, the resources are created again.
	 */
	dispose() {

		for ( const reference of this._records ) {

			const record = reference.deref();

			if ( record === undefined ) continue;

			this._disposeCulling( record );

			for ( const entry of record.entries ) {

				if ( entry.batch !== null ) entry.batch.dispose();

			}

			if ( record.view !== null ) record.view.dispose();

		}

		this._records.clear();
		this._renderListBatches = new WeakMap();

		this._geometryPool.dispose();
		this._geometryPool = new MeshletGeometryPool();

		super.dispose();

	}

	/**
	 * Returns the key of the batch drawing objects of the given geometry: the geometries with the same layout of
	 * the vertex data share the batches of a material, their vertices are read from the geometry pool.
	 *
	 * @param {Object} clusters - The cluster data of the geometry.
	 * @return {any} The key.
	 */
	_getBatchKey( clusters ) {

		return clusters.layoutKey;

	}

	/**
	 * Adds the geometries of the given entries to the table of the culling and to the geometry pool.
	 *
	 * @private
	 * @param {MeshletCulling} culling - The culling.
	 * @param {Array<Object>} entries - The entries.
	 * @return {boolean} Whether all geometries were added, `false` if the culling is full.
	 */
	_addGeometries( culling, entries ) {

		for ( const entry of entries ) {

			for ( const clusters of entry.objectClusters ) {

				if ( culling.getGeometry( clusters ) !== - 1 ) continue;

				if ( culling.addGeometry( clusters, this._geometryPool.add( clusters ) ) === - 1 ) return false;

			}

		}

		return true;

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
	 * @param {?Object} [group=null] - The material group, or the whole geometry.
	 * @param {boolean} [prepare=false] - Whether preprocessing may bypass the per-projection limit.
	 * @return {?Object} The cluster data.
	 */
	_getClusters( geometry, group = null, prepare = false ) {

		this._updateGeometry( geometry );

		let cache = this._clusters;
		let key = geometry;

		if ( group !== null ) {

			cache = this._groupClusters.get( geometry );

			if ( cache === undefined ) this._groupClusters.set( geometry, cache = new Map() );

			key = `${ group.start }:${ group.count }`;

		}

		let clusters = cache.get( key );

		if ( clusters === undefined ) {

			if ( prepare === false && this._pendingGeometry === this._gpuProjectionId ) {

				this._waitingGeometry = this._gpuProjectionId;

				return null;

			}

			this._pendingGeometry = this._gpuProjectionId;

			clusters = createMeshlets( geometry, group );

			cache.set( key, clusters );

			if ( geometry.hasEventListener( 'dispose', this._onGeometryDispose ) === false ) geometry.addEventListener( 'dispose', this._onGeometryDispose );

		}

		return clusters;

	}

	/**
	 * Returns whether meshlets of the geometry or material group have been prepared.
	 *
	 * @private
	 * @param {BufferGeometry} geometry - The geometry.
	 * @param {?Object} group - The material group.
	 * @return {boolean} Whether the meshlets are cached.
	 */
	_hasClusters( geometry, group ) {

		this._updateGeometry( geometry );

		return group === null ? this._clusters.has( geometry ) : this._groupClusters.get( geometry )?.has( `${ group.start }:${ group.count }` ) === true;

	}

	/**
	 * Invalidates meshlets when source attributes or indices change. Shared geometries are checked once
	 * per projection. Instance attribute values are uploaded separately and do not change the meshlets.
	 *
	 * @private
	 * @param {BufferGeometry} geometry - The geometry.
	 */
	_updateGeometry( geometry ) {

		if ( this._checkedGeometries.has( geometry ) ) return;

		this._checkedGeometries.add( geometry );

		const state = [];

		for ( const [ name, attribute ] of [[ 'index', geometry.index ], ...Object.entries( geometry.attributes ) ] ) {

			state.push( name, attribute );

			if ( attribute === null ) continue;

			const buffer = attribute.isInterleavedBufferAttribute === true ? attribute.data : attribute;
			const version = attribute.isInstancedBufferAttribute === true ? 0 : buffer.version;

			state.push( buffer, version, buffer.array, attribute.count, attribute.itemSize, attribute.normalized, attribute.offset, buffer.stride );

		}

		const previous = this._geometryStates.get( geometry );

		if ( previous !== undefined && ( previous.length !== state.length || previous.some( ( value, i ) => value !== state[ i ] ) ) ) {

			this._disposeGeometry( geometry );

			// The bounds stored in the meshlets must describe the updated vertex positions as well.

			geometry.computeBoundingSphere();
			geometry.computeBoundingBox();

		}

		this._geometryStates.set( geometry, state );

	}

}

/**
 * Returns the number of work items of a queue of a batch: the visible clusters of its objects within a budget of
 * clusters per object and at least the clusters of a number of objects, or the given budget if larger.
 *
 * @private
 * @param {number} objects - The capacity of the batch.
 * @param {number} maxChunks - The clusters of the most detailed level of the geometry.
 * @param {number} [budget=0] - The minimum number of work items, after the visible clusters exceeded the queue.
 * @return {number} The number of work items.
 */
function getQueueCapacity( objects, maxChunks, budget = 0 ) {

	return Math.min( objects * maxChunks, MAX_WORK_ITEMS, Math.max( objects * QUEUE_ITEMS_PER_OBJECT, maxChunks * QUEUE_MIN_OBJECTS, budget ) );

}

/**
 * Groups the given entries by their objects: the entries of a geometry drawing the same objects, like the groups
 * of meshes with multiple materials, form a set. The first entry of a set is the source of the other entries,
 * which read the data of the objects from its batch.
 *
 * @private
 * @param {Array<Object>} entries - The entries.
 * @return {Array<Array<Object>>} The sets of entries.
 */
function getEntrySets( entries ) {

	const sets = [];
	const firstObjects = new Map();

	for ( const entry of entries ) {

		const firstObject = entry.objects[ 0 ];

		let candidates = firstObjects.get( firstObject );

		if ( candidates === undefined ) firstObjects.set( firstObject, candidates = [] );

		const set = candidates.find( ( candidate ) => isSameObjects( candidate[ 0 ], entry ) );

		if ( set !== undefined ) {

			entry.source = set[ 0 ];
			set.push( entry );

		} else {

			entry.source = null;

			candidates.push( [ entry ] );
			sets.push( candidates[ candidates.length - 1 ] );

		}

	}

	return sets;

}

/**
 * Returns `true` if the given entries draw the same objects, in the same order and with the same levels.
 *
 * @private
 * @param {Object} a - The first entry.
 * @param {Object} b - The second entry.
 * @return {boolean} Whether the objects are the same.
 */
function isSameObjects( a, b ) {

	// the world matrices of objects with a position node are deformed per material, they are not shared

	if ( a.instanced !== b.instanced || a.count !== b.count || a.objects.length !== b.objects.length ) return false;
	if ( isDeformedMaterial( a.material ) || isDeformedMaterial( b.material ) ) return false;

	for ( let i = 0; i < a.objects.length; i ++ ) {

		if ( a.objects[ i ] !== b.objects[ i ] || a.levels[ i ] !== b.levels[ i ] ) return false;

	}

	return true;

}

export { MeshletDrawingPipeline, MeshletBatch, cacheAttributes, createDebugMaterial, createDrawMaterial, createOcclusion };
