import { StorageBufferAttribute, Vector4 } from 'three/webgpu';
import { vec2, storage, uniform, uniformArray } from 'three/tsl';

import { MeshoptClusterizer } from '../libs/meshopt_clusterizer.module.js';
import { MeshoptSimplifier } from '../libs/meshopt_simplifier.module.js';

/**
 * Utilities to process geometries into clusters (meshlets) of 64 triangles with a chain of simplified
 * levels of detail, used by GPU-driven drawers.
 *
 * @module ClusterGeometryUtils
 * @three_import import * as ClusterGeometryUtils from 'three/addons/utils/ClusterGeometryUtils.js';
 */

/**
 * The number of triangles of a cluster. Clusters are padded with degenerate triangles to this size.
 *
 * @type {number}
 * @constant
 */
export const CLUSTER_SIZE = 64;

/**
 * Resolves when the meshoptimizer modules are ready to process geometries.
 *
 * @type {Promise}
 */
export const ready = Promise.all( [ MeshoptClusterizer.ready, MeshoptSimplifier.ready ] );

// simplified levels of detail. levels beyond the first may collapse edges across attribute seams
// ( Permissive ): faceted geometries like buildings have seams at every hard edge, which would
// otherwise block the simplification. small disconnected parts are removed if the error allows it ( Prune )

const LOD_TARGETS = [
	{ ratio: 1.0, error: 0.0, weights: [ 0.25, 0.25, 0.25, 0.5, 0.5 ], flags: [] },
	{ ratio: 0.55, error: 0.004, weights: [ 0.2, 0.2, 0.2, 0.35, 0.35 ], flags: [ 'RegularizeLight', 'Permissive', 'Prune' ] },
	{ ratio: 0.25, error: 0.015, weights: [ 0.12, 0.12, 0.12, 0.2, 0.2 ], flags: [ 'RegularizeLight', 'Permissive', 'Prune' ] },
	{ ratio: 0.1, error: 0.05, weights: [ 0.08, 0.08, 0.08, 0.12, 0.12 ], flags: [ 'RegularizeLight', 'Permissive', 'Prune' ] },
	{ ratio: 0.04, error: 0.14, weights: [ 0.04, 0.04, 0.04, 0.06, 0.06 ], flags: [ 'Regularize', 'Permissive', 'Prune' ] },
	{ ratio: 0.015, error: 0.3, weights: [ 0.02, 0.02, 0.02, 0.03, 0.03 ], flags: [ 'Regularize', 'Permissive', 'Prune' ] }
];

/**
 * The maximum number of levels of detail of a geometry.
 *
 * @type {number}
 * @constant
 */
export const MAX_LODS = LOD_TARGETS.length;

// a level which removes less than 15% of the triangles of the previous level is simplified again without
// preserving the topology, allowing a larger error

const MIN_LOD_REDUCTION = 0.85;
const SLOPPY_ERROR_SCALE = 4;

// the clusters are drawn by pulling the vertices with their global index, so the vertices per cluster are
// not limited by a local vertex buffer. faceted geometries share few vertices between triangles, a limit of
// 64 vertices would end clusters at ~32 triangles and pad the rest with degenerate triangles

const MAX_CLUSTER_VERTICES = CLUSTER_SIZE * 3;

// returns the components of a vec4 node used by an attribute of the given item size

const swizzle = ( node, itemSize ) => itemSize === 1 ? node.x : itemSize === 2 ? node.xy : itemSize === 3 ? node.xyz : node;

/**
 * Builds clusters of 64 triangles and a chain of simplified levels of detail for the given geometry.
 * Identical vertices are welded first and all levels index the same vertices. The vertex data is
 * interleaved into one storage buffer and accessed through the returned functions.
 *
 * @param {BufferGeometry} geometry - The geometry, with position and normal attributes.
 * @return {Object} The cluster data.
 */
export function createClusters( geometry ) {

	const positionAttribute = geometry.attributes.position;
	const normalAttribute = geometry.attributes.normal;
	const uvAttribute = geometry.attributes.uv;
	const sourceCount = positionAttribute.count;

	// other attributes are reconstructed per fragment as well, e.g. for custom material nodes

	const extras = Object.keys( geometry.attributes )
		.filter( ( name ) => name !== 'position' && name !== 'normal' && name !== 'uv' && geometry.attributes[ name ].isInstancedBufferAttribute !== true && geometry.attributes[ name ].itemSize <= 4 )
		.map( ( name ) => ( { name, attribute: geometry.attributes[ name ] } ) );

	// weld identical vertices, so the clusters share vertices and the simplifier can collapse edges —
	// non-indexed geometries would otherwise produce clusters of ~21 triangles and no levels of detail

	const remap = new Uint32Array( sourceCount );
	const unique = new Map();
	const sources = [];

	for ( let i = 0; i < sourceCount; i ++ ) {

		let key = positionAttribute.getX( i ) + ',' + positionAttribute.getY( i ) + ',' + positionAttribute.getZ( i ) + ',' +
			normalAttribute.getX( i ) + ',' + normalAttribute.getY( i ) + ',' + normalAttribute.getZ( i ) +
			( uvAttribute !== undefined ? ',' + uvAttribute.getX( i ) + ',' + uvAttribute.getY( i ) : '' );

		for ( const { attribute } of extras ) {

			for ( let c = 0; c < attribute.itemSize; c ++ ) key += ',' + attribute.getComponent( i, c );

		}

		let index = unique.get( key );

		if ( index === undefined ) {

			index = sources.length;
			sources.push( i );
			unique.set( key, index );

		}

		remap[ i ] = index;

	}

	const vertexCount = sources.length;

	const positions = new Float32Array( vertexCount * 3 );
	const simplifierAttributes = new Float32Array( vertexCount * 5 );

	// all vertex data is interleaved into one buffer to stay within the storage buffer limit per shader stage:
	// [ position.xyz, uv.x ], [ normal.xyz, uv.y ] and one vec4 per other attribute

	const stride = 2 + extras.length;
	const vertexArray = new Float32Array( vertexCount * stride * 4 );

	for ( let i = 0; i < vertexCount; i ++ ) {

		const source = sources[ i ];

		for ( let e = 0; e < extras.length; e ++ ) {

			const attribute = extras[ e ].attribute;

			for ( let c = 0; c < attribute.itemSize; c ++ ) vertexArray[ ( i * stride + 2 + e ) * 4 + c ] = attribute.getComponent( source, c );

		}

		const x = positionAttribute.getX( source ), y = positionAttribute.getY( source ), z = positionAttribute.getZ( source );
		const nx = normalAttribute.getX( source ), ny = normalAttribute.getY( source ), nz = normalAttribute.getZ( source );
		const u = uvAttribute !== undefined ? uvAttribute.getX( source ) : 0;
		const v = uvAttribute !== undefined ? uvAttribute.getY( source ) : 0;

		positions[ i * 3 + 0 ] = x;
		positions[ i * 3 + 1 ] = y;
		positions[ i * 3 + 2 ] = z;

		simplifierAttributes[ i * 5 + 0 ] = nx;
		simplifierAttributes[ i * 5 + 1 ] = ny;
		simplifierAttributes[ i * 5 + 2 ] = nz;
		simplifierAttributes[ i * 5 + 3 ] = u;
		simplifierAttributes[ i * 5 + 4 ] = v;

		vertexArray.set( [ x, y, z, u, nx, ny, nz, v ], i * stride * 4 );

	}

	const sourceIndices = new Uint32Array( geometry.index !== null ? geometry.index.count : sourceCount );

	for ( let i = 0; i < sourceIndices.length; i ++ ) {

		sourceIndices[ i ] = remap[ geometry.index !== null ? geometry.index.getX( i ) : i ];

	}

	const sourceScale = MeshoptSimplifier.getScale( positions, 3 );

	const lods = [];

	let indices = sourceIndices;
	let previousError = 0;
	let totalChunks = 0;

	for ( let i = 0; i < LOD_TARGETS.length; i ++ ) {

		let error = 0;

		if ( i > 0 ) {

			const target = LOD_TARGETS[ i ];
			// pruning can reduce a level below the target of the next one

			const targetIndexCount = Math.min( indices.length, Math.max( 3, Math.floor( sourceIndices.length * target.ratio / 3 ) * 3 ) );
			let simplified = MeshoptSimplifier.simplifyWithAttributes( indices, positions, 3, simplifierAttributes, 5, target.weights, null, targetIndexCount, target.error, target.flags );

			// if the topology blocks the simplification, the level is simplified without preserving it. the
			// error of the level grows accordingly, so the level is only selected if it isn't noticeable

			if ( indices.length > targetIndexCount && simplified[ 0 ].length > indices.length * MIN_LOD_REDUCTION ) {

				const sloppy = MeshoptSimplifier.simplifySloppy( indices, positions, 3, null, targetIndexCount, target.error * SLOPPY_ERROR_SCALE );

				if ( sloppy[ 0 ].length >= 3 && sloppy[ 0 ].length < simplified[ 0 ].length ) simplified = sloppy;

			}

			if ( simplified[ 0 ].length >= 3 ) {

				indices = simplified[ 0 ];
				error = previousError + simplified[ 1 ] * sourceScale;

			} else {

				error = previousError;

			}

		}

		previousError = error;

		const meshlets = MeshoptClusterizer.buildMeshlets( indices, positions, 3, MAX_CLUSTER_VERTICES, CLUSTER_SIZE, 0.25 );

		const bounds = MeshoptClusterizer.computeMeshletBounds( meshlets, positions, 3 );

		lods.push( { meshlets, bounds, error, numChunks: meshlets.meshletCount, numTriangles: meshlets.meshletCount * CLUSTER_SIZE } );

		totalChunks += meshlets.meshletCount;

	}

	const totalTriangles = totalChunks * CLUSTER_SIZE;

	const indexArray = new Uint32Array( totalTriangles * 3 );
	// the bounding sphere and the normal cone of each cluster, interleaved to save storage buffer bindings

	const chunkArray = new Float32Array( totalChunks * 8 );

	let chunkOffset = 0;
	let triangleOffset = 0;

	for ( const lod of lods ) {

		lod.chunkStart = chunkOffset;
		lod.triangleStart = triangleOffset;

		for ( let m = 0; m < lod.numChunks; m ++ ) {

			const meshlet = MeshoptClusterizer.extractMeshlet( lod.meshlets, m );
			const meshletTriangles = meshlet.triangles.length / 3;

			// pad to exactly 64 triangles with degenerate triangles

			for ( let t = 0; t < CLUSTER_SIZE; t ++ ) {

				const triangle = triangleOffset + m * CLUSTER_SIZE + t;

				for ( let k = 0; k < 3; k ++ ) {

					indexArray[ triangle * 3 + k ] = t < meshletTriangles ? meshlet.vertices[ meshlet.triangles[ t * 3 + k ] ] : meshlet.vertices[ 0 ];

				}

			}

			const bound = lod.bounds[ m ];

			chunkArray[ chunkOffset * 8 + 0 ] = bound.centerX;
			chunkArray[ chunkOffset * 8 + 1 ] = bound.centerY;
			chunkArray[ chunkOffset * 8 + 2 ] = bound.centerZ;
			chunkArray[ chunkOffset * 8 + 3 ] = bound.radius;

			// the normal cone of the triangles, the cutoff is 1 if the cone is too wide to cull the cluster

			chunkArray[ chunkOffset * 8 + 4 ] = bound.coneAxisX;
			chunkArray[ chunkOffset * 8 + 5 ] = bound.coneAxisY;
			chunkArray[ chunkOffset * 8 + 6 ] = bound.coneAxisZ;
			chunkArray[ chunkOffset * 8 + 7 ] = bound.coneCutoff;

			chunkOffset ++;

		}

		triangleOffset += lod.numTriangles;

	}

	if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();
	if ( geometry.boundingBox === null ) geometry.computeBoundingBox();

	// per-geometry values are uniforms, so the batches of all geometries share their shaders and pipelines

	const vertexBuffer = storage( new StorageBufferAttribute( vertexArray, 4 ), 'vec4', vertexCount * stride ).toReadOnly();
	const strideNode = uniform( stride, 'uint' );
	const element = ( vertex, offset ) => vertexBuffer.element( vertex.mul( strideNode ).add( offset ) );

	const chunkBuffer = storage( new StorageBufferAttribute( chunkArray, 4 ), 'vec4', totalChunks * 2 ).toReadOnly();

	const lodOffsets = LOD_TARGETS.map( ( target, i ) => {

		const lod = lods[ i ];

		return lod !== undefined ? new Vector4( lod.triangleStart, lod.numTriangles, lod.chunkStart, lod.error ) : new Vector4();

	} );

	const attributes = new Map( extras.map( ( { name, attribute }, e ) => [ name, { offset: 2 + e, itemSize: attribute.itemSize } ] ) );

	return {
		position: ( vertex ) => element( vertex, 0 ).xyz,
		normal: ( vertex ) => element( vertex, 1 ).xyz,
		uv: ( vertex ) => vec2( element( vertex, 0 ).w, element( vertex, 1 ).w ),
		hasAttribute: ( name ) => attributes.has( name ),
		attribute: ( name, vertex ) => swizzle( element( vertex, attributes.get( name ).offset ), attributes.get( name ).itemSize ),
		indexBuffer: storage( new StorageBufferAttribute( indexArray, 1 ), 'uint', totalTriangles * 3 ).toReadOnly(),
		chunkBounds: ( chunk ) => chunkBuffer.element( chunk.mul( 2 ) ),
		chunkCone: ( chunk ) => chunkBuffer.element( chunk.mul( 2 ).add( 1 ) ),
		chunkArray,
		chunkCount: totalChunks,
		lodOffsets: uniformArray( lodOffsets, 'vec4' ),
		lodOffsetValues: lodOffsets,
		lodTriangleEnds: lods.map( ( lod ) => lod.triangleStart + lod.numTriangles ),
		lodCount: lods.length,
		maxChunks: lods[ 0 ].numChunks,
		instancedAttributes: Object.keys( geometry.attributes )
			.filter( ( name ) => geometry.attributes[ name ].isInstancedBufferAttribute === true && geometry.attributes[ name ].itemSize <= 4 )
			.map( ( name ) => ( { name, itemSize: geometry.attributes[ name ].itemSize } ) ),
		boundingSphere: geometry.boundingSphere.clone(),
		boundingBox: geometry.boundingBox.clone()
	};

}
