import { BackSide, BasicLightMapNode, Box3, BufferAttribute, BufferGeometry, CustomBlending, DoubleSide, DataTexture, DataUtils, FloatType, FrontSide, HalfFloatType, IrradianceNode, Matrix3, Matrix4, NodeMaterial, OneFactor, QuadMesh, Ray, RedFormat, RendererUtils, RenderTarget, RGBAFormat, StorageBufferAttribute, Vector3 } from 'three/webgpu';
import { Break, Fn, If, Loop, Stack, abs, attribute, cross, dot, exp, float, floor, fract, frontFacing, hash, instanceIndex, ivec2, length, luminance, materialReference, max, mix, mrt, normalize, pow, screenCoordinate, select, sqrt, storage, texture, uint, uniform, uvec2, varying, vec2, vec3, vec4, vertexIndex } from 'three/tsl';

import { DirectionalLightMapNode, instancedLightMap } from '../tsl/lighting/DirectionalLightMapNode.js';

// the sample points are texels in tiles of 8x8, so that the points of a GPU workgroup are close on the
// surfaces and their rays coherent

const TILE = 8;

// records per side of the blocks that estimateNoise() sums on the GPU before reading them back

const NOISE_BLOCK = 16;

// fixed point increments of the R2 low-discrepancy sequence, which spreads the points of a triangle

const R2 = [ 3242174889, 2447445414 ];

// the vertex map entry of vertices without a record, and the base of meshes that are not in a layout

const NONE = 0xffffffff;

const _a = /*@__PURE__*/ new Vector3();
const _b = /*@__PURE__*/ new Vector3();
const _c = /*@__PURE__*/ new Vector3();
const _matrix = /*@__PURE__*/ new Matrix4();
const _normalMatrix = /*@__PURE__*/ new Matrix3();

let _rendererState;
let _mapperId = 0;

/**
 * The vertices and triangles of meshes for {@link VertexLightMapper}: the vertices are welded into
 * records by their world-space position and normal, so that vertices that are split for other
 * attributes, e.g. at UV seams, share their light, also across meshes, while hard edges keep a record
 * per side. Each instance of instanced meshes has its own records. With the `doubleSided` option, the
 * vertices of meshes with double-sided materials get a second record for the back of their faces, with
 * the opposite normal, so that the two sides of thin surfaces have their own light. With `openSurfaces`,
 * so do the vertices of single-sided meshes that are not closed, e.g. planes and sheets, whose back can
 * receive light, unlike the inside of a closed mesh.
 *
 * @three_import import { VertexLayout } from 'three/addons/lighting/VertexLightMapper.js';
 */
class VertexLayout {

	/**
	 * Constructs a new vertex layout of meshes, with their current world transforms.
	 *
	 * @param {Array<Mesh>} meshes - The meshes. Skinned and batched meshes are not supported.
	 * @param {Object} [options] - The options.
	 * @param {number} [options.positionPrecision=1e-6] - The distance under which vertices weld, relative to the size of the meshes.
	 * @param {number} [options.normalPrecision=0.02] - The difference of the normals under which vertices weld.
	 * @param {?Map<Mesh, BufferGeometry>} [options.geometries=null] - Geometries to use in place of the ones of some meshes, e.g. less subdivided ones.
	 * @param {boolean} [options.doubleSided=false] - Whether the meshes with double-sided materials get records for the back of their faces.
	 * @param {boolean} [options.openSurfaces=false] - Whether the meshes that are not closed get records for the back of their faces too.
	 * @param {boolean} [options.smoothNormals=false] - Whether the records get smoothed normals too, see {@link VertexLayout#smoothNormals}.
	 */
	constructor( meshes, { positionPrecision = 1e-6, normalPrecision = 0.02, geometries = null, doubleSided = false, openSurfaces = false, smoothNormals = false } = {} ) {

		/**
		 * The meshes.
		 *
		 * @type {Array<Mesh>}
		 * @readonly
		 */
		this.meshes = meshes;

		/**
		 * The number of records.
		 *
		 * @type {number}
		 * @readonly
		 */
		this.recordCount = 0;

		/**
		 * The number of triangles.
		 *
		 * @type {number}
		 * @readonly
		 */
		this.triangleCount = 0;

		/**
		 * The number of vertices of the meshes, of all instances.
		 *
		 * @type {number}
		 * @readonly
		 */
		this.vertexCount = 0;

		/**
		 * The world-space positions of the records.
		 *
		 * @type {Float32Array}
		 * @readonly
		 */
		this.positions = null;

		/**
		 * The world-space normals of the records.
		 *
		 * @type {Float32Array}
		 * @readonly
		 */
		this.normals = null;

		/**
		 * The smoothed world-space normals of the records, with `smoothNormals`: the mean of the normals of the
		 * faces at their position, of all meshes, weighted by their angles there, like the vertex normals of a
		 * model whose vertices are not split at hard edges, seams and materials. Faces turned more than 120 degrees
		 * from a record's own normal, e.g. the other side of a two-sided surface, are left out. Otherwise `null`.
		 *
		 * @type {?Float32Array}
		 * @readonly
		 */
		this.smoothNormals = null;

		/**
		 * The state of the vertices of each record, see {@link imprintContacts}: 0 outside, 1 covered by
		 * another face, but baked, and 2 inside other meshes, whose triangles are left out, so they take
		 * no light.
		 *
		 * @type {Uint8Array}
		 * @readonly
		 */
		this.inside = null;

		/**
		 * The lumped mass of each record: a third of the area of its triangles.
		 *
		 * @type {Float32Array}
		 * @readonly
		 */
		this.masses = null;

		/**
		 * The records of the corners of each triangle.
		 *
		 * @type {Uint32Array}
		 * @readonly
		 */
		this.triangles = null;

		/**
		 * The world-space area of each triangle.
		 *
		 * @type {Float32Array}
		 * @readonly
		 */
		this.areas = null;

		/**
		 * The record of each vertex of each instance of the meshes, see {@link VertexLayout#getRecord}.
		 *
		 * @type {Uint32Array}
		 * @readonly
		 */
		this.vertexRecords = null;

		/**
		 * The offsets of the triangles around each record in {@link VertexLayout#corners}, one more than records.
		 *
		 * @type {Uint32Array}
		 * @readonly
		 */
		this.cornerOffsets = null;

		/**
		 * The triangle corners around each record, the triangle times four plus the corner.
		 *
		 * @type {Uint32Array}
		 * @readonly
		 */
		this.corners = null;

		/**
		 * The time it took to build the layout, in milliseconds.
		 *
		 * @type {number}
		 * @readonly
		 */
		this.time = 0;

		this._meshes = new Map();
		this._geometries = geometries;
		this._doubleSided = doubleSided;
		this._openSurfaces = openSurfaces;
		this._smoothNormals = smoothNormals;
		this._recordBuffer = null;
		this._vertexMap = null;

		const start = performance.now();

		this._build( positionPrecision, normalPrecision );

		this.time = performance.now() - start;

	}

	/**
	 * Returns the record of a vertex of an instance of a mesh, or -1.
	 *
	 * @param {Mesh} mesh - The mesh.
	 * @param {number} instance - The instance, 0 for other meshes.
	 * @param {number} vertex - The vertex.
	 * @param {boolean} [back=false] - Whether to return the record of the back of the faces, -1 for meshes without, see {@link VertexLayout#hasBack}.
	 * @return {number} The record.
	 */
	getRecord( mesh, instance, vertex, back = false ) {

		const info = this._meshes.get( mesh );

		if ( info === undefined ) return - 1;

		const base = back ? info.backBase : info.base;

		if ( base === NONE ) return - 1;

		const record = this.vertexRecords[ base + instance * info.vertexCount + vertex ];

		return record === NONE ? - 1 : record;

	}

	/**
	 * Returns whether the vertices of a mesh have records for the back of their faces, see the `doubleSided` option.
	 *
	 * @param {Mesh} mesh - The mesh.
	 * @return {boolean} Whether the mesh has records for the back of its faces.
	 */
	hasBack( mesh ) {

		const info = this._meshes.get( mesh );

		return info !== undefined && info.backBase !== NONE;

	}

	/**
	 * Returns the geometry of a mesh in the layout.
	 *
	 * @param {Mesh} mesh - The mesh.
	 * @return {BufferGeometry} The geometry.
	 */
	getGeometry( mesh ) {

		return this._geometries?.get( mesh ) ?? mesh.geometry;

	}

	/**
	 * Lets another object with the geometry of a mesh of the layout, e.g. a proxy that renders the mesh
	 * elsewhere, read the records of the mesh with {@link VertexLayout#recordNode}.
	 *
	 * @param {Mesh} proxy - The other object.
	 * @param {Mesh} mesh - The mesh of the layout.
	 */
	addProxy( proxy, mesh ) {

		const info = this._meshes.get( mesh );

		if ( info !== undefined ) this._meshes.set( proxy, info );

	}

	/**
	 * Returns whether a mesh is part of the layout.
	 *
	 * @param {Mesh} mesh - The mesh.
	 * @return {boolean} Whether the mesh is part of the layout.
	 */
	hasMesh( mesh ) {

		return this._meshes.has( mesh );

	}

	/**
	 * The positions and normals of the records on the GPU, two vec4 per record: the position and the
	 * mass, the normal.
	 *
	 * @type {StorageBufferNode}
	 * @readonly
	 */
	get recordBuffer() {

		if ( this._recordBuffer === null ) {

			const data = new Float32Array( Math.max( this.recordCount, 1 ) * 8 );

			for ( let i = 0; i < this.recordCount; i ++ ) {

				data.set( this.positions.subarray( i * 3, i * 3 + 3 ), i * 8 );
				data[ i * 8 + 3 ] = this.masses[ i ];
				data.set( this.normals.subarray( i * 3, i * 3 + 3 ), i * 8 + 4 );
				if ( this.smoothNormals !== null ) data[ i * 8 + 7 ] = packNormal( this.smoothNormals, i );

			}

			this._recordBuffer = storage( new StorageBufferAttribute( data, 4 ), 'vec4', data.length / 4 ).toReadOnly();

		}

		return this._recordBuffer;

	}

	/**
	 * Returns a node of the record of the rendered vertex, `0xffffffff` for meshes that are not part of
	 * the layout. It is evaluated in the vertex stage.
	 *
	 * @param {boolean} [back=false] - Whether to return the record of the back of the faces, the one of the front for meshes without.
	 * @return {Node<uint>} The record.
	 */
	recordNode( back = false ) {

		if ( this._vertexMap === null ) {

			const data = new Uint32Array( Math.max( this.vertexRecords.length, 2 ) );
			data.set( this.vertexRecords );

			this._vertexMap = storage( new StorageBufferAttribute( data, 1 ), 'uint', data.length ).toReadOnly();

		}

		const meshes = this._meshes;
		const base = uniform( 0, 'uint' ).onObjectUpdate( ( { object } ) => {

			const info = meshes.get( object );

			if ( info === undefined ) return NONE;

			return back && info.backBase !== NONE ? info.backBase : info.base;

		} );
		const vertices = uniform( 0, 'uint' ).onObjectUpdate( ( { object } ) => meshes.get( object )?.vertexCount ?? 0 );
		const map = this._vertexMap;

		return Fn( () => {

			const record = uint( NONE ).toVar();

			If( base.notEqual( NONE ), () => {

				record.assign( map.element( base.add( instanceIndex.mul( vertices ) ).add( vertexIndex ) ) );

			} );

			return record;

		}, 'uint' )();

	}

	/**
	 * Frees the GPU resources.
	 */
	dispose() {

		this._recordBuffer?.value.dispose();
		this._vertexMap?.value.dispose();

		this._recordBuffer = null;
		this._vertexMap = null;

	}

	/**
	 * Welds the vertices into records and collects the triangles.
	 *
	 * @private
	 * @param {number} positionPrecision - The relative weld distance of positions.
	 * @param {number} normalPrecision - The weld distance of normals.
	 */
	_build( positionPrecision, normalPrecision ) {

		const meshes = this.meshes;

		// the weld grid follows the size of the meshes

		const bounds = new Box3();
		let vertexCount = 0;

		for ( const mesh of meshes ) {

			mesh.updateWorldMatrix( true, false );
			bounds.expandByObject( mesh );

			const instances = mesh.isInstancedMesh === true ? mesh.count : 1;
			const count = this.getGeometry( mesh ).getAttribute( 'position' ).count;

			this._meshes.set( mesh, { base: vertexCount, backBase: NONE, vertexCount: count, instances } );
			vertexCount += instances * count;

		}

		// the vertices of double-sided meshes, and of open ones with the openSurfaces option, have a second
		// entry, for the back of their faces

		let entryCount = vertexCount;
		const open = new Map();

		for ( const mesh of meshes ) {

			const materials = [ mesh.material ].flat().filter( ( material ) => material !== undefined );
			const doubleSided = this._doubleSided && materials.some( ( material ) => material.side === DoubleSide );

			if ( doubleSided === false ) {

				if ( this._openSurfaces === false || materials.every( ( material ) => material.side === BackSide ) ) continue;

				const geometry = this.getGeometry( mesh );
				if ( open.has( geometry ) === false ) open.set( geometry, isOpen( geometry ) );
				if ( open.get( geometry ) === false ) continue;

			}

			const info = this._meshes.get( mesh );
			info.backBase = entryCount;
			entryCount += info.instances * info.vertexCount;

		}

		const scale = bounds.isEmpty() ? 1 : Math.max( bounds.getSize( _a ).length(), 1e-6 );
		const positionStep = 1 / ( scale * positionPrecision );
		const normalStep = 1 / normalPrecision;

		// the steps of the welding, which find the records of another layout of the same meshes

		this._positionStep = positionStep;
		this._normalStep = normalStep;

		// an open addressing hash table of the quantized positions and normals. The vertices inside other meshes
		// or covered by them, see imprintContacts, get records of their own: the light does not cross the lines
		// of the contacts, and the inside triangles stay dark where they show

		const capacity = Math.max( 2 ** Math.ceil( Math.log2( entryCount * 2 + 1 ) ), 16 );
		const mask = capacity - 1;
		const table = new Int32Array( capacity ).fill( - 1 );
		const keys = new Int32Array( entryCount * 7 );
		const positions = new Float32Array( entryCount * 3 );
		const normals = new Float32Array( entryCount * 3 );
		const insideRecords = new Uint8Array( entryCount );
		const vertexRecords = new Uint32Array( entryCount ).fill( NONE );

		let records = 0;

		const weld = ( px, py, pz, nx, ny, nz, k6 ) => {

			const k0 = Math.round( px * positionStep ), k1 = Math.round( py * positionStep ), k2 = Math.round( pz * positionStep );
			const k3 = Math.round( nx * normalStep ), k4 = Math.round( ny * normalStep ), k5 = Math.round( nz * normalStep );

			let h = Math.imul( k0, 0x9e3779b1 ) ^ Math.imul( k1, 0x85ebca6b ) ^ Math.imul( k2, 0xc2b2ae35 ) ^ k6;
			h = Math.imul( h ^ ( h >>> 15 ), 0x2c1b3c6d ) ^ Math.imul( k3, 0x27d4eb2f ) ^ Math.imul( k4, 0x165667b1 ) ^ Math.imul( k5, 0xd3a2646c );
			h = ( h ^ ( h >>> 13 ) ) & mask;

			while ( true ) {

				const record = table[ h ];

				if ( record < 0 ) {

					const k = records * 7;

					keys[ k ] = k0; keys[ k + 1 ] = k1; keys[ k + 2 ] = k2;
					keys[ k + 3 ] = k3; keys[ k + 4 ] = k4; keys[ k + 5 ] = k5; keys[ k + 6 ] = k6;

					positions[ records * 3 ] = px; positions[ records * 3 + 1 ] = py; positions[ records * 3 + 2 ] = pz;
					normals[ records * 3 ] = nx; normals[ records * 3 + 1 ] = ny; normals[ records * 3 + 2 ] = nz;
					insideRecords[ records ] = k6;

					table[ h ] = records;

					return records ++;

				}

				const k = record * 7;

				if ( keys[ k ] === k0 && keys[ k + 1 ] === k1 && keys[ k + 2 ] === k2 && keys[ k + 3 ] === k3 && keys[ k + 4 ] === k4 && keys[ k + 5 ] === k5 && keys[ k + 6 ] === k6 ) return record;

				h = ( h + 1 ) & mask;

			}

		};

		const triangles = [];

		for ( const mesh of meshes ) {

			const info = this._meshes.get( mesh );
			const geometry = this.getGeometry( mesh );
			const position = geometry.getAttribute( 'position' );
			const index = geometry.getIndex();
			const vertexNormals = geometry.getAttribute( 'normal' ) ?? computeNormals( geometry );
			const inside = geometry.getAttribute( 'inside' );

			// back-sided materials receive light on the back of the faces

			const flip = [ mesh.material ].flat().every( ( material ) => material.side === BackSide ) ? - 1 : 1;

			const count = index !== null ? index.count : position.count;
			const drawStart = Math.max( 0, geometry.drawRange.start );
			const drawEnd = Math.min( count, geometry.drawRange.start + geometry.drawRange.count );
			const groups = geometry.groups.length > 0 ? geometry.groups : [ { start: 0, count: Infinity, materialIndex: 0 } ];

			for ( let instance = 0; instance < info.instances; instance ++ ) {

				const matrixWorld = mesh.isInstancedMesh === true ? _matrix.multiplyMatrices( mesh.matrixWorld, mesh.getMatrixAt( instance, _matrix ) ) : mesh.matrixWorld;
				const normalMatrix = _normalMatrix.getNormalMatrix( matrixWorld );
				const base = info.base + instance * info.vertexCount;
				const backBase = info.backBase !== NONE ? info.backBase + instance * info.vertexCount : NONE;

				for ( let v = 0; v < position.count; v ++ ) {

					_a.fromBufferAttribute( position, v ).applyMatrix4( matrixWorld );
					_b.fromBufferAttribute( vertexNormals, v ).applyMatrix3( normalMatrix ).normalize().multiplyScalar( flip );

					const state = inside !== undefined ? Math.round( inside.getX( v ) * 2 ) : 0;

					vertexRecords[ base + v ] = weld( _a.x, _a.y, _a.z, _b.x, _b.y, _b.z, state );

					if ( backBase !== NONE ) vertexRecords[ backBase + v ] = weld( _a.x, _a.y, _a.z, - _b.x, - _b.y, - _b.z, state );

				}

				for ( const group of groups ) {

					const material = Array.isArray( mesh.material ) ? mesh.material[ group.materialIndex ] : mesh.material;

					if ( material === undefined || material.visible === false ) continue;

					const start = Math.max( drawStart, group.start );
					const end = Math.min( drawEnd, group.start + group.count );

					for ( let i = start; i + 2 < end; i += 3 ) {

						const v0 = index !== null ? index.getX( i ) : i, v1 = index !== null ? index.getX( i + 1 ) : i + 1, v2 = index !== null ? index.getX( i + 2 ) : i + 2;

						// the triangles inside other meshes, see imprintContacts

						if ( isInside( inside, v0, v1, v2 ) ) continue;

						const r0 = vertexRecords[ base + v0 ];
						const r1 = vertexRecords[ base + v1 ];
						const r2 = vertexRecords[ base + v2 ];

						if ( r0 !== r1 && r1 !== r2 && r0 !== r2 ) triangles.push( r0, r1, r2 );

						// the back of the faces, wound the other way

						if ( backBase !== NONE && material.side !== BackSide ) {

							const b0 = vertexRecords[ backBase + v0 ];
							const b1 = vertexRecords[ backBase + v1 ];
							const b2 = vertexRecords[ backBase + v2 ];

							if ( b0 !== b1 && b1 !== b2 && b0 !== b2 ) triangles.push( b0, b2, b1 );

						}

					}

				}

			}

		}

		// the areas of the triangles, degenerate ones are left out

		const triangleData = [];
		const areas = [];

		for ( let i = 0; i < triangles.length; i += 3 ) {

			_a.fromArray( positions, triangles[ i ] * 3 );
			_b.fromArray( positions, triangles[ i + 1 ] * 3 ).sub( _a );
			_c.fromArray( positions, triangles[ i + 2 ] * 3 ).sub( _a );

			const area = _b.cross( _c ).length() / 2;

			if ( area > 1e-12 * scale * scale ) {

				triangleData.push( triangles[ i ], triangles[ i + 1 ], triangles[ i + 2 ] );
				areas.push( area );

			}

		}

		const triangleCount = areas.length;

		// the lumped masses and the triangle corners around each record

		const masses = new Float32Array( records );
		const cornerOffsets = new Uint32Array( records + 1 );

		for ( let t = 0; t < triangleCount; t ++ ) {

			for ( let c = 0; c < 3; c ++ ) {

				masses[ triangleData[ t * 3 + c ] ] += areas[ t ] / 3;
				cornerOffsets[ triangleData[ t * 3 + c ] + 1 ] ++;

			}

		}

		for ( let r = 0; r < records; r ++ ) cornerOffsets[ r + 1 ] += cornerOffsets[ r ];

		const corners = new Uint32Array( triangleCount * 3 );
		const fill = cornerOffsets.slice( 0, records );

		for ( let t = 0; t < triangleCount; t ++ ) {

			for ( let c = 0; c < 3; c ++ ) corners[ fill[ triangleData[ t * 3 + c ] ] ++ ] = t * 4 + c;

		}

		this.recordCount = records;
		this.triangleCount = triangleCount;
		this.vertexCount = vertexCount;
		this.positions = positions.slice( 0, records * 3 );
		this.normals = normals.slice( 0, records * 3 );
		this.inside = insideRecords.slice( 0, records );
		this.masses = masses;
		this.triangles = new Uint32Array( triangleData );
		this.smoothNormals = this._smoothNormals ? smoothRecordNormals( this.positions, this.normals, this.triangles, records, positionStep ) : null;
		this.areas = new Float32Array( areas );
		this.vertexRecords = vertexRecords;
		this.cornerOffsets = cornerOffsets;
		this.corners = corners;

	}

}

// whether a geometry has edges of only one triangle, by its positions welded at a hundred thousandth of its
// size: an open surface, e.g. a plane, whose back can receive light

function isOpen( geometry ) {

	const position = geometry.getAttribute( 'position' );
	const index = geometry.getIndex();
	const count = index !== null ? index.count : position.count;

	if ( geometry.boundingBox === null ) geometry.computeBoundingBox();

	const box = geometry.boundingBox;
	const step = 1e5 / Math.max( box.getSize( _a ).length(), 1e-12 );
	const ids = new Map();
	const vertexIds = new Uint32Array( position.count );

	for ( let v = 0; v < position.count; v ++ ) {

		const x = Math.round( ( position.getX( v ) - box.min.x ) * step );
		const y = Math.round( ( position.getY( v ) - box.min.y ) * step );
		const z = Math.round( ( position.getZ( v ) - box.min.z ) * step );
		const key = ( x * 131072 + y ) * 131072 + z;

		let id = ids.get( key );
		if ( id === undefined ) ids.set( key, id = ids.size );
		vertexIds[ v ] = id;

	}

	const edges = new Map();

	for ( let i = 0; i + 2 < count; i += 3 ) {

		for ( let k = 0; k < 3; k ++ ) {

			const a = vertexIds[ index !== null ? index.getX( i + k ) : i + k ];
			const b = vertexIds[ index !== null ? index.getX( i + ( k + 1 ) % 3 ) : i + ( k + 1 ) % 3 ];

			if ( a === b ) continue;

			const key = a < b ? a * 67108864 + b : b * 67108864 + a;
			edges.set( key, ( edges.get( key ) ?? 0 ) + 1 );

		}

	}

	for ( const uses of edges.values() ) if ( uses === 1 ) return true;

	return false;

}

/**
 * Bakes diffuse irradiance into the vertices of meshes, like {@link LightMapper} bakes it into light
 * maps, without light map UVs. Sample points spread over each triangle by its area, stratified in
 * barycentric coordinates and moved every sample. The irradiance at each point is splatted into the
 * three vertices of its triangle with the barycentric coordinates as weights, times the area of the
 * point, and each vertex divides its sum by its sum of weights: a lumped-mass L2 projection of the
 * irradiance onto the piecewise linear functions of the vertices. So the light of all of a triangle
 * reaches its vertices, also of stretched triangles or of vertices that are buried in other surfaces.
 * Points inside closed meshes see the black back faces of the meshes, like the texels of a light map,
 * see the `ignoreInside` option.
 *
 * The vertices are welded into the records of a {@link VertexLayout}. The irradiance is defined by a
 * function like the one of {@link LightMapper}, which also receives the face normal, a seed and a
 * variable for the share of rays that hit back faces, see {@link VertexLightMapper#irradianceNode}.
 * Use {@link vertexLightMap} to light materials with the result.
 *
 * ```js
 * const mapper = new VertexLightMapper( renderer, irradiance, { meshes } );
 * mapper.update( 16 );
 *
 * for ( const material of materials ) vertexLightMap( material, mapper );
 * ```
 *
 * This class can only be used with {@link WebGPURenderer} and a WebGPU backend.
 *
 * @three_import import { VertexLightMapper, VertexLayout, vertexLightMap } from 'three/addons/lighting/VertexLightMapper.js';
 */
class VertexLightMapper {

	/**
	 * Constructs a new vertex light mapper.
	 *
	 * @param {WebGPURenderer} renderer - The renderer.
	 * @param {function(Node<vec3>, Node<vec3>, Node<float>, ?Node<vec3>, Object): Node<vec3>} irradianceNode - Returns the irradiance for a world-space position, normal and sample index.
	 * @param {Object} [options] - The options.
	 * @param {Array<Mesh>} [options.meshes=[]] - The meshes, unless a `layout` is given.
	 * @param {?VertexLayout} [options.layout=null] - The layout of the meshes, e.g. shared with another mapper.
	 * @param {string} [options.sampling='triangles'] - Where the irradiance is sampled: `'triangles'` spreads points over each triangle by its area,
	 * `'area'` spreads a fixed number of points over all triangles by their area, so that small triangles only get a point in some samples, and `'vertices'` samples it at the vertices only.
	 * @param {?number} [options.pointArea=null] - The area per sample point of the `'triangles'` sampling, by default the mean area of the triangles.
	 * @param {number} [options.pointCount=65536] - The number of points of the `'area'` sampling, rounded up to a power of two.
	 * @param {number} [options.minPoints=1] - The minimum number of points per triangle.
	 * @param {number} [options.maxPoints=64] - The maximum number of points per triangle.
	 * @param {boolean} [options.ignoreInside=false] - Whether to leave out points whose rays mostly hit back faces, e.g. inside meshes. The
	 * points behind one-sided surfaces, e.g. a banner in front of a wall, hit their back faces too, and their shadow would be lost.
	 * @param {boolean} [options.directional=false] - Whether to also bake the dominant direction of the incident light into {@link VertexLightMapper#directionTexture}.
	 * @param {boolean} [options.doubleSided=false] - Whether the meshes with double-sided materials get records for the back of their faces, unless a `layout` is given, see {@link VertexLayout}.
	 * @param {boolean} [options.smoothNormals=false] - Whether the records get smoothed normals, unless a `layout` is given, see {@link VertexLayout#smoothNormals}: the points pass theirs to the irradiance as `smoothNormal`.
	 * @param {?Object} [options.previous=null] - A bake of the meshes before some of their triangles were split, e.g. by {@link subdivideGeometry}:
	 * its `layout`, and its `irradiance` and `directions` from {@link VertexLightMapper#readIrradiance} and {@link VertexLightMapper#readDirections}.
	 * The vertices whose triangles all kept their shape keep its light, only the new vertices and the ones of split triangles are baked, and only
	 * they count in the noise estimate. With `all`, every vertex at the place of a previous one keeps its light, e.g. after a simplification.
	 */
	constructor( renderer, irradianceNode, { meshes = [], layout = null, sampling = 'triangles', pointArea = null, pointCount = 65536, minPoints = 1, maxPoints = 64, ignoreInside = false, directional = false, doubleSided = false, smoothNormals = false, previous = null } = {} ) {

		/**
		 * The renderer.
		 *
		 * @type {WebGPURenderer}
		 */
		this.renderer = renderer;

		/**
		 * The source of the irradiance. Like the one of {@link LightMapper}, it receives the world-space
		 * position, normal, sample index and an optional direction variable, and as its fifth argument an
		 * object with the world-space `faceNormal` of the triangle, a `seed` per point, an `inside`
		 * float variable that sources can add the share of rays to that hit back faces to, and with a layout
		 * with smoothed normals, the smoothed normal of the point as `smoothNormal`.
		 *
		 * @type {function(Node<vec3>, Node<vec3>, Node<float>, ?Node<vec3>, Object): Node<vec3>}
		 */
		this.irradianceNode = irradianceNode;

		/**
		 * The layout of the vertices.
		 *
		 * @type {VertexLayout}
		 * @readonly
		 */
		this.layout = layout ?? new VertexLayout( meshes, { doubleSided, smoothNormals } );

		/**
		 * Where the irradiance is sampled, `'triangles'`, `'area'` or `'vertices'`.
		 *
		 * @type {string}
		 * @readonly
		 */
		this.sampling = sampling;

		/**
		 * The number of accumulated samples.
		 *
		 * @type {number}
		 * @readonly
		 * @default 0
		 */
		this.samples = 0;

		/**
		 * The number of sample points.
		 *
		 * @type {number}
		 * @readonly
		 */
		this.pointCount = 0;

		/**
		 * A unique key of the mapper, which keeps the shaders of materials of different mappers apart.
		 *
		 * @type {string}
		 * @readonly
		 */
		this.key = 'vertexLightMapper' + ( _mapperId ++ );

		this._ownsLayout = layout === null;
		this._pointCounts = null;
		this._pointArea = pointArea;
		this._areaPoints = 2 ** Math.ceil( Math.log2( Math.min( Math.max( pointCount, 256 ), 2 ** 24 ) ) );
		this._minPoints = minPoints;
		this._maxPoints = maxPoints;
		this._ignoreInside = ignoreInside;
		this._directional = directional;
		this._sample = uniform( 0, 'uint' );

		// the sample index for the irradiance sampler, a uniform of its own like the one of LightMapper, so
		// that samplers can tell the samples apart by its value, e.g. StochasticRadiosity

		this._sampleIndex = uniform( 0 );

		// the samples are summed with additive blending, into float targets if the renderer supports
		// 'float32-blendable', like the ones of LightMapper. Half float sums lose the precision of single
		// samples beyond about 256

		this._floatBlendable = renderer.hasFeature( 'float32-blendable' );
		/**
		 * The most samples that the mapper accumulates: 256 without the 'float32-blendable' renderer feature,
		 * since half float sums lose the precision of single samples beyond, else `Infinity`.
		 *
		 * @type {number}
		 * @readonly
		 */
		this.maxSamples = this._floatBlendable ? Infinity : 256;

		// the records whose light a previous bake already has

		this._fixed = previous !== null ? fixedRecords( previous, this.layout, directional ) : null;

		/**
		 * The number of records that keep the light of a previous bake, see the `previous` option.
		 *
		 * @type {number}
		 * @readonly
		 */
		this.fixedCount = this._fixed !== null ? this._fixed.count : 0;

		this._neighborSize = 0;

		this._createPoints();
		this._createTargets();
		this._createPasses();

		// noise estimation, created on first use

		this._snapshot = null;
		this._snapshotSamples = 0;
		this._resets = 0;
		this._variance = 0;
		this._varianceSamples = 0;
		this._noise = Infinity;
		this._floor = uniform( 0 );

	}

	/**
	 * The number of records.
	 *
	 * @type {number}
	 * @readonly
	 */
	get recordCount() {

		return this.layout.recordCount;

	}

	/**
	 * The irradiance of the records in a texture of {@link VertexLightMapper#recordWidth} texels per
	 * row, linear and in lux like a light map, see {@link VertexLightMapper#recordCoord}.
	 *
	 * @type {Texture}
	 * @readonly
	 */
	get texture() {

		return this._renderTarget.texture;

	}

	/**
	 * The dominant directions of the incident light of the records, encoded like the ones of
	 * {@link LightMapper#directionTexture}, with the `directional` option, else `null`.
	 *
	 * @type {?Texture}
	 * @readonly
	 */
	get directionTexture() {

		return this._directional ? this._directionTarget.texture : null;

	}

	/**
	 * The records per row of the record textures.
	 *
	 * @type {number}
	 * @readonly
	 */
	get recordWidth() {

		return this._recordWidth;

	}

	/**
	 * Returns the texel of a record in the record textures.
	 *
	 * @param {Node<uint>} record - The record.
	 * @return {Node<ivec2>} The texel.
	 */
	recordCoord( record ) {

		return ivec2( uvec2( record.bitAnd( this._recordWidth - 1 ), record.shiftRight( Math.log2( this._recordWidth ) ) ) );

	}

	/**
	 * Returns the irradiance interpolated between the records of a triangle.
	 *
	 * @param {Node<uvec3>} records - The records of the corners.
	 * @param {Node<vec3>} barycoord - The barycentric coordinates.
	 * @return {Node<vec3>} The irradiance.
	 */
	sample( records, barycoord ) {

		const map = texture( this.texture );

		return map.load( this.recordCoord( records.x ) ).rgb.mul( barycoord.x )
			.add( map.load( this.recordCoord( records.y ) ).rgb.mul( barycoord.y ) )
			.add( map.load( this.recordCoord( records.z ) ).rgb.mul( barycoord.z ) );

	}

	/**
	 * Accumulates samples. Without the 'float32-blendable' renderer feature, at most 256 samples are
	 * accumulated.
	 *
	 * @param {number} [samples=1] - The number of samples to add.
	 */
	update( samples = 1 ) {

		const renderer = this.renderer;

		samples = Math.min( samples, this.maxSamples - this.samples );

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		renderer.autoClear = false;
		renderer.setClearColor( 0x000000, 0 );

		if ( this.samples === 0 ) {

			renderer.setRenderTarget( this._accumulation );
			renderer.clear();

		}

		for ( let i = 0; i < samples; i ++ ) {

			this._sample.value = this._sampleIndex.value = this.samples;

			renderer.setRenderTarget( this._pointTarget );
			this._pointQuad.render( renderer );

			renderer.setRenderTarget( this._accumulation );
			this._splatQuad.render( renderer );

			this.samples ++;

		}

		renderer.setRenderTarget( this._renderTarget );
		this._resolveQuad.render( renderer );

		if ( this._directional ) {

			renderer.setRenderTarget( this._directionTarget );
			this._directionQuad.render( renderer );

		}

		RendererUtils.restoreRendererState( renderer, _rendererState );

	}

	/**
	 * Denoises the irradiance of the records, and their directions, with an edge-aware filter over their
	 * neighbors like {@link LightMapDenoiser}: each pass fits a plane to the light of a record and the ones
	 * around it in its tangent plane, weighted by the similarity of their normals, their distance to the
	 * tangent plane and the difference of their luminance compared to its noise, so shadows and other details
	 * that rise above the noise stay. The noise of a record is the relative noise of the bake, scaled by the
	 * square root of how much less area than the mean the record averages. Each pass reaches one ring of
	 * neighbors further. The result replaces {@link VertexLightMapper#texture} and
	 * {@link VertexLightMapper#directionTexture} until the next `update()`.
	 *
	 * @param {Object} [options] - The filter options.
	 * @param {number} [options.relativeNoise=0.05] - The relative noise of the bake, e.g. from {@link VertexLightMapper#estimateNoise}.
	 * @param {number} [options.iterations=4] - The number of passes.
	 * @param {number} [options.luminancePhi=3] - How many standard deviations of the noise luminance differences may span before records stop being averaged.
	 * @param {number} [options.normalPhi=64] - The exponent of the normal similarity weight.
	 * @param {number} [options.planePhi=0.2] - The sine of the angle to the tangent plane at which neighbors lose most of their weight.
	 * @param {number} [options.correlation=0] - How much of their noise neighboring records share, see {@link LightMapDenoiser#correlation}.
	 * @param {?number} [options.radius=null] - The distance at which neighbors lose most of their weight, by default a hundredth of the size of the meshes.
	 * Neighbors far apart differ by more than their noise, but by less than a shadow, where the light curves.
	 */
	denoise( { relativeNoise = 0.05, iterations = 4, luminancePhi = 3, normalPhi = 64, planePhi = 0.2, correlation = 0, radius = null } = {} ) {

		if ( this._denoiser === undefined ) this._createDenoiser();

		const denoiser = this._denoiser;
		const renderer = this.renderer;

		denoiser.relativeNoise.value = relativeNoise;
		denoiser.luminancePhi.value = luminancePhi;
		denoiser.normalPhi.value = normalPhi;
		denoiser.planePhi.value = planePhi;
		denoiser.correlation.value = correlation;
		denoiser.radius.value = radius ?? denoiser.size * 0.01;

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		renderer.setRenderTarget( denoiser.targets[ 0 ] );
		denoiser.prepareQuad.render( renderer );

		for ( let i = 0; i < iterations; i ++ ) {

			renderer.setRenderTarget( denoiser.targets[ ( i + 1 ) % 2 ] );
			denoiser.filterQuads[ i % 2 ].render( renderer );

		}

		renderer.setRenderTarget( this._renderTarget );
		denoiser.outputQuads[ iterations % 2 ].render( renderer );

		if ( this._directional ) {

			renderer.setRenderTarget( this._directionTarget );
			denoiser.directionQuads[ iterations % 2 ].render( renderer );

		}

		RendererUtils.restoreRendererState( renderer, _rendererState );

	}

	/**
	 * Estimates the noise left in the irradiance from how much it changed since the previous call, like
	 * {@link LightMapper#estimateNoise}: the RMS error of the record luminance relative to the record
	 * luminance, weighted by the visible area of the records.
	 *
	 * @async
	 * @return {Promise<number>} A promise that resolves with the estimated relative noise.
	 */
	async estimateNoise() {

		const renderer = this.renderer;

		if ( this._snapshot === null ) this._createNoiseEstimator();

		const previous = this._snapshotSamples;
		const added = this.samples - previous;
		const resets = this._resets;

		if ( previous > 0 && added === 0 ) return this._noise;

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		renderer.setRenderTarget( this._noiseTarget );
		this._noiseQuad.render( renderer );

		renderer.setRenderTarget( this._snapshot );
		this._snapshotQuad.render( renderer );

		RendererUtils.restoreRendererState( renderer, _rendererState );

		this._snapshotSamples = this.samples;

		const target = this._noiseTarget;
		const sums = await renderer.readRenderTargetPixelsAsync( target, 0, 0, target.width, target.height );

		if ( resets !== this._resets ) return Infinity;

		let change = 0, power = 0, weight = 0;

		for ( let i = 0; i < sums.length; i += 4 ) {

			change += sums[ i ];
			power += sums[ i + 1 ];
			weight += sums[ i + 2 ];

		}

		this._floor.value = weight > 0 ? 0.01 * power / weight : 0;

		if ( previous === 0 ) return Infinity;

		const samples = previous + added;

		this._variance += weight > 0 ? change / weight * previous * samples : 0;
		this._varianceSamples += added;
		this._noise = Math.sqrt( this._variance / this._varianceSamples / samples );

		return this._noise;

	}

	/**
	 * Discards the accumulated samples.
	 */
	reset() {

		this.samples = 0;
		this._snapshotSamples = 0;
		this._resets ++;
		this._variance = 0;
		this._varianceSamples = 0;

	}

	/**
	 * Replaces the lumped-mass projection of the irradiance with the consistent-mass L2 projection, which
	 * keeps more of the detail within the triangles but amplifies the noise between neighboring vertices
	 * up to four times. It solves `M x = M_L x_L` for the irradiance `x`, where `x_L` is the lumped
	 * projection, `M` the mass matrix of the linear functions of the vertices and `M_L` its lumped
	 * diagonal, with Richardson iterations preconditioned by `M_L`. The eigenvalues of `M_L^-1 M` lie
	 * between 1/4 and 1 for any mesh, so each iteration reduces the error by at least 0.6. The next
	 * `update()` restores the lumped projection. Negative values are clamped.
	 *
	 * @param {number} [iterations=12] - The number of iterations.
	 */
	project( iterations = 12 ) {

		if ( this.sampling === 'vertices' || iterations < 1 ) return;

		if ( this._projection === undefined ) this._createProjection();

		const renderer = this.renderer;
		const { targets, copy, start, steps, outputs } = this._projection;

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		// the lumped projection is the right hand side and the start, then the iterations alternate
		// between two targets

		renderer.setRenderTarget( copy );
		this._projection.copyQuad.render( renderer );

		renderer.setRenderTarget( targets[ 0 ] );
		start.render( renderer );

		for ( let i = 1; i < iterations; i ++ ) {

			renderer.setRenderTarget( targets[ i % 2 ] );
			steps[ i % 2 ].render( renderer );

		}

		renderer.setRenderTarget( this._renderTarget );
		outputs[ ( iterations - 1 ) % 2 ].render( renderer );

		RendererUtils.restoreRendererState( renderer, _rendererState );

	}

	/**
	 * Creates the passes of `project()`.
	 *
	 * @private
	 */
	_createProjection() {

		const records = this.layout.recordBuffer;
		const index = this._indexBuffer;
		const offsets = this._offsets;
		const recordCount = this.layout.recordCount;
		const options = { type: FloatType, depthBuffer: false };

		const targets = [ new RenderTarget( this._recordWidth, this._recordHeight, options ), new RenderTarget( this._recordWidth, this._recordHeight, options ) ];
		const copy = new RenderTarget( this._recordWidth, this._recordHeight, options );

		const positionOf = ( record ) => records.element( record.mul( 2 ) ).xyz;

		// one iteration: x + omega * ( m * x_L - M x ) / m. The mass matrix of a triangle is its area over 12
		// times 2 on the diagonal and 1 elsewhere

		const iterate = ( sourceTexture ) => Fn( () => {

			const source = texture( sourceTexture );
			const lumped = texture( copy.texture );
			const valueOf = ( record ) => source.load( this.recordCoord( record ) ).rgb;

			const coord = uvec2( screenCoordinate.xy );
			const record = coord.y.mul( this._recordWidth ).add( coord.x ).min( Math.max( recordCount - 1, 0 ) ).toVar();
			const x = valueOf( record ).toVar();
			const product = vec3( 0 ).toVar();

			const first = index.element( record.add( offsets.cornerOffsets ) );
			const last = index.element( record.add( offsets.cornerOffsets + 1 ) );

			Loop( { start: first, end: last, type: 'uint', condition: '<', name: 'e' }, ( { e } ) => {

				const triangle = index.element( e.add( offsets.corners ) ).shiftRight( 2 ).toVar();
				const r0 = index.element( triangle.mul( 4 ) ).toVar();
				const r1 = index.element( triangle.mul( 4 ).add( 1 ) ).toVar();
				const r2 = index.element( triangle.mul( 4 ).add( 2 ) ).toVar();
				const p0 = positionOf( r0 ).toVar();
				const area = length( cross( positionOf( r1 ).sub( p0 ), positionOf( r2 ).sub( p0 ) ) ).mul( 0.5 );

				product.addAssign( x.add( valueOf( r0 ) ).add( valueOf( r1 ) ).add( valueOf( r2 ) ).mul( area.div( 12 ) ) );

			} );

			const mass = records.element( record.mul( 2 ) ).w.toVar();
			const target = lumped.load( this.recordCoord( record ) ).rgb.mul( mass );

			return vec4( select( mass.greaterThan( 0 ), x.add( target.sub( product ).mul( 1.6 ).div( mass.max( 1e-30 ) ) ), x ), 1 );

		} )();

		const quad = ( node ) => {

			const material = new NodeMaterial();
			material.fragmentNode = node;

			return new QuadMesh( material );

		};

		const output = ( target ) => quad( vec4( texture( target.texture ).load( ivec2( screenCoordinate.xy ) ).rgb.max( 0 ), 1 ) );

		this._projection = {
			targets, copy,
			copyQuad: quad( texture( this._renderTarget.texture ).load( ivec2( screenCoordinate.xy ) ) ),
			start: quad( iterate( copy.texture ) ),
			steps: [ quad( iterate( targets[ 1 ].texture ) ), quad( iterate( targets[ 0 ].texture ) ) ],
			outputs: [ output( targets[ 0 ] ), output( targets[ 1 ] ) ]
		};

	}

	/**
	 * Reads the irradiance of the records back, three values per record.
	 *
	 * @async
	 * @return {Promise<Float32Array>} A promise that resolves with the irradiance.
	 */
	async readIrradiance() {

		const target = this._renderTarget;
		const data = await this.renderer.readRenderTargetPixelsAsync( target, 0, 0, target.width, target.height );
		const irradiance = new Float32Array( this.recordCount * 3 );

		for ( let i = 0; i < irradiance.length / 3; i ++ ) {

			for ( let c = 0; c < 3; c ++ ) irradiance[ i * 3 + c ] = DataUtils.fromHalfFloat( data[ i * 4 + c ] );

		}

		return irradiance;

	}

	/**
	 * Reads the dominant directions of the records back, encoded like {@link VertexLightMapper#directionTexture},
	 * four values per record, or `null` without the `directional` option.
	 *
	 * @async
	 * @return {Promise<?Float32Array>} A promise that resolves with the directions.
	 */
	async readDirections() {

		const target = this._directionTarget;

		if ( target === null ) return null;

		const data = await this.renderer.readRenderTargetPixelsAsync( target, 0, 0, target.width, target.height );
		const directions = new Float32Array( this.recordCount * 4 );

		for ( let i = 0; i < directions.length; i ++ ) directions[ i ] = DataUtils.fromHalfFloat( data[ i ] );

		return directions;

	}

	/**
	 * Reads the irradiance back into an attribute of the geometries of the meshes, three floats per
	 * vertex, e.g. for exports, and the one of the back of the faces of double-sided meshes into an
	 * attribute with `Back` appended to the name. Geometries that several meshes share are copied first,
	 * since the meshes have their own light. Instanced meshes are left out, an attribute can not hold the
	 * light of each instance. Use {@link vertexLightMap} with the name of the attribute to render it.
	 *
	 * @async
	 * @param {string} [name='bakedIrradiance'] - The name of the attribute.
	 * @return {Promise<Array<Mesh>>} A promise that resolves with the meshes that got the attribute.
	 */
	async toAttributes( name = 'bakedIrradiance' ) {

		const irradiance = await this.readIrradiance();
		const layout = this.layout;
		const users = new Map();
		const meshes = [];

		for ( const mesh of layout.meshes ) users.set( mesh.geometry, ( users.get( mesh.geometry ) ?? 0 ) + 1 );

		for ( const mesh of layout.meshes ) {

			if ( mesh.isInstancedMesh === true ) continue;

			if ( users.get( mesh.geometry ) > 1 ) mesh.geometry = shareGeometry( mesh.geometry );

			const count = mesh.geometry.getAttribute( 'position' ).count;

			for ( const back of layout.hasBack( mesh ) ? [ false, true ] : [ false ] ) {

				const values = new Float32Array( count * 3 );

				for ( let v = 0; v < count; v ++ ) {

					const record = layout.getRecord( mesh, 0, v, back );

					if ( record >= 0 ) values.set( irradiance.subarray( record * 3, record * 3 + 3 ), v * 3 );

				}

				mesh.geometry.setAttribute( back ? name + 'Back' : name, new BufferAttribute( values, 3 ) );

			}

			meshes.push( mesh );

		}

		return meshes;

	}

	/**
	 * Frees all internal resources, and the layout if the mapper created it.
	 */
	dispose() {

		this._pointTarget.dispose();
		this._accumulation.dispose();
		this._renderTarget.dispose();
		this._directionTarget?.dispose();
		this._directionQuad?.material.dispose();
		this._pointQuad.material.dispose();
		this._splatQuad.material.dispose();
		this._resolveQuad.material.dispose();
		this._indexBuffer.value.dispose();
		this._fixedTexture?.dispose();
		this._fixedDirectionTexture?.dispose();

		if ( this._denoiser !== undefined ) {

			const denoiser = this._denoiser;

			for ( const target of denoiser.targets ) target.dispose();
			for ( const quad of [ denoiser.prepareQuad, ...denoiser.filterQuads, ...denoiser.outputQuads, ...( denoiser.directionQuads ?? [] ) ] ) quad.material.dispose();
			denoiser.neighborBuffer.value.dispose();
			denoiser.noiseScaleBuffer.value.dispose();

		}

		if ( this._snapshot !== null ) {

			this._snapshot.dispose();
			this._noiseTarget.dispose();
			this._noiseQuad.material.dispose();
			this._snapshotQuad.material.dispose();

		}

		if ( this._projection !== undefined ) {

			const { targets, copy, copyQuad, start, steps, outputs } = this._projection;

			for ( const target of [ ...targets, copy ] ) target.dispose();
			for ( const quad of [ copyQuad, start, ...steps, ...outputs ] ) quad.material.dispose();

		}

		if ( this._ownsLayout ) this.layout.dispose();

	}

	/**
	 * Returns the size in bytes of the largest storage buffer of the mapper: the topology of the points, the
	 * records, the record of each vertex or the neighbors of the records.
	 *
	 * @private
	 * @return {number} The size in bytes.
	 */
	_storageSize() {

		const layout = this.layout;

		return Math.max( this._indexBuffer.value.array.byteLength, Math.max( layout.recordCount, 1 ) * 32, layout.vertexRecords.length * 4, this._neighborSize );

	}

	/**
	 * Spreads the sample points over the triangles and stores the topology on the GPU: per triangle
	 * the records of the corners and the first point, a sentinel triangle with the point count, the
	 * triangle of each point, the offsets of the corners around each record and the corners.
	 *
	 * @private
	 */
	_createPoints() {

		const layout = this.layout;
		const triangleCount = layout.triangleCount;
		const recordCount = layout.recordCount;

		let pointCount = 0, data;

		// the triangles with a corner whose light is baked, the others keep the light of a previous bake

		const fixed = this._fixed !== null ? this._fixed.records : null;
		const triangles = layout.triangles;
		const baked = ( t ) => fixed === null || fixed[ triangles[ t * 3 ] ] === 0 || fixed[ triangles[ t * 3 + 1 ] ] === 0 || fixed[ triangles[ t * 3 + 2 ] ] === 0;

		if ( this.sampling === 'vertices' ) {

			// a point per record

			pointCount = recordCount;
			data = new Uint32Array( Math.max( pointCount, 2 ) );

			this._offsets = { triangles: 0, points: 0, cornerOffsets: 0, corners: 0 };
			this._pointWeight = 1;

		} else if ( this.sampling === 'area' ) {

			// the points are spread over the cumulative area of the triangles, which is stored per triangle in
			// 32 bit fixed point. Point j of a sample is at j * spacing + offset, see _createPasses()

			pointCount = this._areaPoints;

			const offsets = { triangles: 0, cornerOffsets: triangleCount * 4 };
			offsets.corners = offsets.cornerOffsets + recordCount + 1;
			offsets.starts = offsets.corners + layout.corners.length;

			data = new Uint32Array( Math.max( offsets.starts + pointCount + 1, 2 ) );

			let totalArea = 0, cumulative = 0;
			for ( let t = 0; t < triangleCount; t ++ ) totalArea += baked( t ) ? layout.areas[ t ] : 0;

			for ( let t = 0; t < triangleCount; t ++ ) {

				cumulative += baked( t ) ? layout.areas[ t ] : 0;

				data.set( layout.triangles.subarray( t * 3, t * 3 + 3 ), t * 4 );
				data[ t * 4 + 3 ] = Math.min( Math.round( cumulative / totalArea * 2 ** 32 ), 2 ** 32 - 1 );

			}

			data.set( layout.cornerOffsets, offsets.cornerOffsets );
			data.set( layout.corners, offsets.corners );

			// the triangle at each point without an offset, the triangle of a point with an offset is between
			// it and the one of the next point

			const spacing = 2 ** 32 / pointCount;

			for ( let j = 0, t = 0; j <= pointCount; j ++ ) {

				while ( t < triangleCount - 1 && data[ t * 4 + 3 ] <= j * spacing ) t ++;

				data[ offsets.starts + j ] = t;

			}

			this._offsets = offsets;
			this._pointWeight = 1;

			// the expected points of the triangles in a sample

			this._pointCounts = new Float32Array( triangleCount );
			for ( let t = 0; t < triangleCount; t ++ ) this._pointCounts[ t ] = baked( t ) && totalArea > 0 ? layout.areas[ t ] / totalArea * pointCount : 0;

		} else {

			let totalArea = 0, bakedArea = 0;

			for ( let t = 0; t < triangleCount; t ++ ) {

				totalArea += layout.areas[ t ];
				bakedArea += baked( t ) ? layout.areas[ t ] : 0;

			}

			const pointArea = this._pointArea ?? ( triangleCount > 0 ? totalArea / triangleCount : 1 );
			const counts = new Uint32Array( triangleCount );

			for ( let t = 0; t < triangleCount; t ++ ) {

				counts[ t ] = baked( t ) ? Math.min( Math.max( Math.ceil( layout.areas[ t ] / pointArea ), this._minPoints ), this._maxPoints ) : 0;
				pointCount += counts[ t ];

			}

			const offsets = { triangles: 0, points: ( triangleCount + 1 ) * 4 };
			offsets.cornerOffsets = offsets.points + pointCount;
			offsets.corners = offsets.cornerOffsets + recordCount + 1;

			data = new Uint32Array( Math.max( offsets.corners + layout.corners.length, 2 ) );

			let first = 0;

			for ( let t = 0; t < triangleCount; t ++ ) {

				data.set( layout.triangles.subarray( t * 3, t * 3 + 3 ), t * 4 );
				data[ t * 4 + 3 ] = first;
				data.fill( t, offsets.points + first, offsets.points + first + counts[ t ] );

				first += counts[ t ];

			}

			data[ triangleCount * 4 + 3 ] = pointCount;
			data.set( layout.cornerOffsets, offsets.cornerOffsets );
			data.set( layout.corners, offsets.corners );

			this._offsets = offsets;
			this._pointWeight = pointCount > 0 ? bakedArea / pointCount : 1;
			this._pointCounts = counts;

		}

		this.pointCount = pointCount;
		this._indexBuffer = storage( new StorageBufferAttribute( data, 1 ), 'uint', data.length ).toReadOnly();

		// a near square layout of the points in tiles, and a power of two width of the records

		const maxSize = this.renderer.backend.device?.limits.maxTextureDimension2D ?? 8192;

		this._pointWidth = Math.min( Math.ceil( Math.sqrt( Math.max( pointCount, 1 ) ) / TILE ) * TILE, Math.floor( maxSize / TILE ) * TILE );
		this._pointHeight = Math.ceil( Math.max( pointCount, 1 ) / ( this._pointWidth * TILE ) ) * TILE;
		this._recordWidth = Math.min( 2 ** Math.ceil( Math.log2( Math.sqrt( Math.max( recordCount, 1 ) ) ) ), 2 ** Math.floor( Math.log2( maxSize ) ) );
		this._recordHeight = Math.ceil( Math.max( recordCount, 1 ) / this._recordWidth );

		if ( this._pointHeight > maxSize || this._recordHeight > maxSize ) throw new Error( 'THREE.VertexLightMapper: Too many sample points or vertices for the textures of the device.' );

	}

	/**
	 * Creates the render targets: the irradiance at the points of a sample, the sums of the records
	 * and the resolved irradiance of the records.
	 *
	 * @private
	 */
	_createTargets() {

		const count = this._directional ? 2 : 1;

		this._pointTarget = new RenderTarget( this._pointWidth, this._pointHeight, { type: FloatType, depthBuffer: false, count } );
		this._accumulation = new RenderTarget( this._recordWidth, this._recordHeight, { type: this._floatBlendable ? FloatType : HalfFloatType, depthBuffer: false, count } );
		this._renderTarget = new RenderTarget( this._recordWidth, this._recordHeight, { type: HalfFloatType, depthBuffer: false } );
		this._directionTarget = this._directional ? new RenderTarget( this._recordWidth, this._recordHeight, { type: HalfFloatType, depthBuffer: false } ) : null;

		// the light of the records of a previous bake, with 1 in alpha

		this._fixedTexture = null;
		this._fixedDirectionTexture = null;

		if ( this._fixed !== null ) {

			const size = this._recordWidth * this._recordHeight * 4;
			const { records, irradiance, directions } = this._fixed;
			const light = new Float32Array( size );
			const lightDirections = directions !== null ? new Float32Array( size ) : null;

			for ( let i = 0; i < records.length; i ++ ) {

				if ( records[ i ] === 0 ) continue;

				light.set( irradiance.subarray( i * 3, i * 3 + 3 ), i * 4 );
				light[ i * 4 + 3 ] = 1;

				if ( lightDirections !== null ) lightDirections.set( directions.subarray( i * 4, i * 4 + 4 ), i * 4 );

			}

			this._fixedTexture = new DataTexture( light, this._recordWidth, this._recordHeight, RGBAFormat, FloatType );
			this._fixedTexture.needsUpdate = true;

			if ( lightDirections !== null ) {

				this._fixedDirectionTexture = new DataTexture( lightDirections, this._recordWidth, this._recordHeight, RGBAFormat, FloatType );
				this._fixedDirectionTexture.needsUpdate = true;

			}

		}

		if ( this._directional ) {

			for ( const target of [ this._pointTarget, this._accumulation ] ) {

				target.textures[ 0 ].name = 'output';
				target.textures[ 1 ].name = 'direction';

			}

		}

	}

	/**
	 * Creates the passes that sample the points, splat them into the records and resolve the records.
	 *
	 * @private
	 */
	_createPasses() {

		const layout = this.layout;
		const records = layout.recordBuffer;
		const index = this._indexBuffer;
		const offsets = this._offsets;
		const directional = this._directional;
		const vertices = this.sampling === 'vertices';
		const area = this.sampling === 'area';
		const pointCount = this.pointCount;
		const triangleCount = layout.triangleCount;
		const recordCount = layout.recordCount;
		const pointWidth = this._pointWidth;
		const sample = this._sample;

		// the point of a texel and back, in tiles of 8x8

		const tilesPerRow = pointWidth / TILE;

		const pointOf = ( coord ) => coord.y.div( TILE ).mul( tilesPerRow ).add( coord.x.div( TILE ) ).mul( TILE * TILE ).add( coord.y.mod( TILE ).mul( TILE ) ).add( coord.x.mod( TILE ) );

		const pointCoord = ( point ) => {

			const tile = point.div( TILE * TILE ).toVar();
			const local = point.mod( TILE * TILE ).toVar();

			return ivec2( uvec2( tile.mod( tilesPerRow ).mul( TILE ).add( local.mod( TILE ) ), tile.div( tilesPerRow ).mul( TILE ).add( local.div( TILE ) ) ) );

		};

		const recordOf = ( coord ) => coord.y.mul( this._recordWidth ).add( coord.x );

		// the barycentric coordinates of the k-th point of a triangle in a sample: an R2 sequence over the
		// triangle, rotated randomly per triangle and sample and folded into the triangle

		const barycoordOf = ( triangle, k ) => {

			const seed = triangle.mul( 2654435769 ).bitXor( sample.mul( 2246822519 ) ).toVar();
			const rotation = vec2( hash( seed ), hash( seed.bitXor( 1759714724 ) ) );
			const lattice = vec2( float( k.mul( R2[ 0 ] ) ), float( k.mul( R2[ 1 ] ) ) ).mul( 2 ** - 32 );
			const st = fract( lattice.add( rotation ) ).toVar();
			const folded = select( st.x.add( st.y ).greaterThan( 1 ), vec2( 1 ).sub( st ), st ).toVar();

			return vec3( folded.x.add( folded.y ).oneMinus(), folded.x, folded.y );

		};

		const positionOf = ( record ) => records.element( record.mul( 2 ) ).xyz;
		const normalOf = ( record ) => records.element( record.mul( 2 ).add( 1 ) ).xyz;
		const smoothNormalOf = ( record ) => unpackNormal( records.element( record.mul( 2 ).add( 1 ) ).w, normalOf( record ) );
		const smooth = layout.smoothNormals !== null;

		// the area sampling places point j of a sample at the cumulative area j * spacing + offset, in 32 bit
		// fixed point, with an offset per sample. So the points of a triangle are the ones from the first
		// point at or after the cumulative area before the triangle, to the first one after it

		const spacing = 2 ** 32 / pointCount;
		const areaOffset = uint( hash( sample.add( 3266489917 ) ).mul( spacing ) ).min( spacing - 1 ).toVar( 'areaOffset' );

		const firstPointOf = ( triangle ) => {

			const before = select( triangle.equal( 0 ), uint( 0 ), index.element( triangle.max( 1 ).sub( 1 ).mul( 4 ).add( 3 ) ) ).toVar();
			const distance = before.sub( areaOffset.min( before ) ).toVar();

			return select( before.greaterThan( areaOffset ), distance.div( spacing ).add( select( distance.mod( spacing ).notEqual( 0 ), uint( 1 ), uint( 0 ) ) ), uint( 0 ) );

		};

		const triangleOfPoint = ( point ) => {

			const target = point.mul( spacing ).add( areaOffset ).toVar();
			const low = index.element( point.add( offsets.starts ) ).toVar();
			const high = index.element( point.add( offsets.starts + 1 ) ).toVar();

			// a binary search between them

			Loop( 32, () => {

				If( low.greaterThanEqual( high ), () => {

					Break();

				} ).Else( () => {

					const middle = low.add( high ).shiftRight( 1 ).toVar();

					If( index.element( middle.mul( 4 ).add( 3 ) ).greaterThan( target ), () => {

						high.assign( middle );

					} ).Else( () => {

						low.assign( middle.add( 1 ) );

					} );

				} );

			} );

			return low;

		};

		// the irradiance at the points, with the share of their rays that hit back faces in alpha

		const pointMaterial = new NodeMaterial();
		const pointDirection = directional ? vec3( 0 ).toVar( 'pointDirection' ) : null;

		const pointOutput = Fn( () => {

			const point = pointOf( uvec2( screenCoordinate.xy ) ).min( Math.max( pointCount - 1, 0 ) ).toVar();

			const position = vec3( 0 ).toVar();
			const normal = vec3( 0 ).toVar();
			const faceNormal = vec3( 0 ).toVar();
			const smoothNormal = smooth ? vec3( 0 ).toVar() : null;

			if ( vertices ) {

				position.assign( positionOf( point ) );
				normal.assign( normalOf( point ) );
				faceNormal.assign( normal );
				if ( smooth ) smoothNormal.assign( smoothNormalOf( point ) );

			} else {

				const triangle = ( area ? triangleOfPoint( point ) : index.element( point.add( offsets.points ) ) ).toVar();
				const r0 = index.element( triangle.mul( 4 ) ).toVar();
				const r1 = index.element( triangle.mul( 4 ).add( 1 ) ).toVar();
				const r2 = index.element( triangle.mul( 4 ).add( 2 ) ).toVar();
				const firstPoint = area ? firstPointOf( triangle ) : index.element( triangle.mul( 4 ).add( 3 ) );
				const barycoord = barycoordOf( triangle, point.sub( firstPoint ) ).toVar();

				const p0 = positionOf( r0 ).toVar();
				const p1 = positionOf( r1 ).toVar();
				const p2 = positionOf( r2 ).toVar();

				position.assign( p0.mul( barycoord.x ).add( p1.mul( barycoord.y ) ).add( p2.mul( barycoord.z ) ) );
				normal.assign( normalOf( r0 ).mul( barycoord.x ).add( normalOf( r1 ).mul( barycoord.y ) ).add( normalOf( r2 ).mul( barycoord.z ) ) );
				if ( smooth ) smoothNormal.assign( normalize( smoothNormalOf( r0 ).mul( barycoord.x ).add( smoothNormalOf( r1 ).mul( barycoord.y ) ).add( smoothNormalOf( r2 ).mul( barycoord.z ) ) ) );

				// the face normal on the side of the vertex normals

				const face = normalize( cross( p1.sub( p0 ), p2.sub( p0 ) ) ).toVar();
				faceNormal.assign( select( dot( face, normal ).lessThan( 0 ), face.negate(), face ) );

			}

			const inside = float( 0 ).toVar( 'pointInside' );

			Stack( inside );
			if ( pointDirection !== null ) Stack( pointDirection );

			const irradiance = this.irradianceNode( position, normal, this._sampleIndex, pointDirection, { faceNormal, seed: point, inside, ...( smooth ? { smoothNormal } : {} ) } ).toVar();

			// with ignoreInside, the points inside closed meshes do not count

			const weight = this._ignoreInside ? select( inside.lessThan( 0.5 ), float( 1 ), float( 0 ) ) : float( 1 );

			return vec4( irradiance, weight );

		} )();

		pointMaterial.fragmentNode = directional ? mrt( { output: pointOutput, direction: vec4( pointDirection, 0 ) } ) : pointOutput;

		// the sums of the records: the irradiance of the points around each record times the barycentric
		// coordinate of the record and the area of the point, and the sum of these weights in alpha

		const points = texture( this._pointTarget.textures[ 0 ] );
		const pointDirections = directional ? texture( this._pointTarget.textures[ 1 ] ) : null;

		const fixedLight = this._fixedTexture !== null ? texture( this._fixedTexture ) : null;
		const fixedDirections = this._fixedDirectionTexture !== null ? texture( this._fixedDirectionTexture ) : null;

		const splatMaterial = new NodeMaterial();
		splatMaterial.depthTest = false;
		splatMaterial.depthWrite = false;
		splatMaterial.blending = CustomBlending;
		splatMaterial.blendSrc = OneFactor;
		splatMaterial.blendDst = OneFactor;

		const directionSum = directional ? vec3( 0 ).toVar( 'splatDirection' ) : null;

		const splatOutput = Fn( () => {

			const coord = uvec2( screenCoordinate.xy );
			const record = recordOf( coord ).toVar();
			const valid = record.lessThan( recordCount ).toVar();
			const sum = vec4( 0 ).toVar();

			// the records of a previous bake get no samples, which also leaves them out of the noise estimate

			const baked = fixedLight !== null ? valid.and( fixedLight.load( ivec2( coord ) ).a.lessThan( 0.5 ) ) : valid;

			if ( directionSum !== null ) Stack( directionSum );

			record.assign( record.min( Math.max( recordCount - 1, 0 ) ) );

			const add = ( point, weight ) => {

				const coord = pointCoord( point ).toVar();
				const value = points.load( coord ).toVar();
				const w = weight.mul( value.a ).toVar();

				sum.addAssign( vec4( value.rgb.mul( w ), w ) );

				if ( directional ) directionSum.addAssign( pointDirections.load( coord ).xyz.mul( w ) );

			};

			If( baked, () => {

				if ( vertices ) {

					add( record, float( 1 ) );

				} else {

					const first = index.element( record.add( offsets.cornerOffsets ) );
					const last = index.element( record.add( offsets.cornerOffsets + 1 ) );

					Loop( { start: first, end: last, type: 'uint', condition: '<', name: 'e' }, ( { e } ) => {

						const entry = index.element( e.add( offsets.corners ) ).toVar();
						const triangle = entry.shiftRight( 2 ).toVar();
						const corner = entry.bitAnd( 3 ).toVar();

						const p0 = positionOf( index.element( triangle.mul( 4 ) ) ).toVar();
						const p1 = positionOf( index.element( triangle.mul( 4 ).add( 1 ) ) ).toVar();
						const p2 = positionOf( index.element( triangle.mul( 4 ).add( 2 ) ) ).toVar();

						// the points of the triangle, of the area sampling or by its area

						const firstPoint = ( area ? firstPointOf( triangle ) : index.element( triangle.mul( 4 ).add( 3 ) ) ).toVar();
						const count = uint( 0 ).toVar();
						const pointWeight = float( 0 ).toVar();

						if ( area ) {

							count.assign( select( triangle.equal( triangleCount - 1 ), uint( pointCount ), firstPointOf( triangle.add( 1 ) ) ).sub( firstPoint ) );
							pointWeight.assign( 1 );

						} else {

							// the area of a point, relative to the mean, which keeps half float sums precise

							count.assign( index.element( triangle.mul( 4 ).add( 7 ) ).sub( firstPoint ) );
							pointWeight.assign( length( cross( p1.sub( p0 ), p2.sub( p0 ) ) ).mul( 0.5 / this._pointWeight ).div( float( count ) ) );

						}

						Loop( { start: uint( 0 ), end: count, type: 'uint', condition: '<', name: 'k' }, ( { k } ) => {

							const barycoord = barycoordOf( triangle, k );
							const phi = select( corner.equal( 0 ), barycoord.x, select( corner.equal( 1 ), barycoord.y, barycoord.z ) );

							add( firstPoint.add( k ), phi.mul( pointWeight ) );

						} );

					} );

				}

			} );

			// the texels past the last record stay empty

			If( valid.not(), () => {

				sum.assign( vec4( 0 ) );
				if ( directionSum !== null ) directionSum.assign( vec3( 0 ) );

			} );

			return sum;

		} )();

		splatMaterial.fragmentNode = directional ? mrt( { output: splatOutput, direction: vec4( directionSum, 0 ) } ) : splatOutput;

		// the irradiance of the records is their sum over their weight, the directions are weighted by
		// luminance like the ones of LightMapper

		const sums = texture( this._accumulation.textures[ 0 ] );
		const directionSums = directional ? texture( this._accumulation.textures[ 1 ] ) : null;

		const resolveMaterial = new NodeMaterial();

		const resolveIrradiance = Fn( () => {

			const value = sums.load( ivec2( screenCoordinate.xy ) ).toVar();
			const irradiance = select( value.a.greaterThan( 0 ), value.rgb.div( value.a ), vec3( 0 ) ).toVar();

			if ( fixedLight !== null ) {

				const fixed = fixedLight.load( ivec2( screenCoordinate.xy ) ).toVar();
				irradiance.assign( select( fixed.a.greaterThan( 0.5 ), fixed.rgb, irradiance ) );

			}

			return vec4( irradiance, 1 );

		} );

		const resolveDirection = Fn( () => {

			const coord = ivec2( screenCoordinate.xy );
			const direction = directionSums.load( coord ).xyz.div( luminance( sums.load( coord ).rgb ).max( 1e-20 ) ).toVar();
			const encoded = direction.div( length( direction ).max( 1 ) ).mul( 0.5 ).add( 0.5 ).toVar();

			if ( fixedDirections !== null ) encoded.assign( select( fixedLight.load( coord ).a.greaterThan( 0.5 ), fixedDirections.load( coord ).xyz, encoded ) );

			return vec4( encoded, 1 );

		} );

		resolveMaterial.fragmentNode = resolveIrradiance();

		if ( directional ) {

			const directionMaterial = new NodeMaterial();
			directionMaterial.fragmentNode = resolveDirection();

			this._directionQuad = new QuadMesh( directionMaterial );

		}

		this._pointQuad = new QuadMesh( pointMaterial );
		this._splatQuad = new QuadMesh( splatMaterial );
		this._resolveQuad = new QuadMesh( resolveMaterial );

	}

	/**
	 * Creates the neighbors of the records and the passes of `denoise()`.
	 *
	 * @private
	 */
	_createDenoiser() {

		const layout = this.layout;
		const recordCount = layout.recordCount;
		const directional = this._directional;

		// the neighbors of each record: the other corners of its triangles, once each

		const offsets = new Uint32Array( recordCount + 1 );
		const lists = [];
		let total = 0;

		for ( let r = 0; r < recordCount; r ++ ) {

			const neighbors = new Set();

			for ( let e = layout.cornerOffsets[ r ]; e < layout.cornerOffsets[ r + 1 ]; e ++ ) {

				const entry = layout.corners[ e ];
				const t = entry >>> 2, c = entry & 3;

				neighbors.add( layout.triangles[ t * 3 + ( c + 1 ) % 3 ] );
				neighbors.add( layout.triangles[ t * 3 + ( c + 2 ) % 3 ] );

			}

			neighbors.delete( r );
			lists.push( neighbors );
			offsets[ r ] = total;
			total += neighbors.size;

		}

		offsets[ recordCount ] = total;

		const data = new Uint32Array( Math.max( recordCount + 1 + total, 2 ) );
		data.set( offsets );

		let k = recordCount + 1;
		for ( const neighbors of lists ) for ( const n of neighbors ) data[ k ++ ] = n;

		const neighborBuffer = storage( new StorageBufferAttribute( data, 1 ), 'uint', data.length ).toReadOnly();
		this._neighborSize = data.byteLength;

		// the noise of each record relative to the noise of the bake: a record averages the points of its
		// triangles, weighted by their area and barycentric coordinates, so it has an effective number of
		// samples of mass^2 / sum( area^2 / ( 6 points ) ) per sample. The area-weighted mean square of the
		// relative noise is the one of the bake

		const noiseScale = new Float32Array( Math.max( recordCount, 1 ) ).fill( 1 );
		const pointCounts = this._pointCounts;

		if ( pointCounts !== null ) {

			const squares = new Float64Array( recordCount );

			for ( let t = 0; t < layout.triangleCount; t ++ ) {

				if ( pointCounts[ t ] <= 0 ) continue;

				const square = layout.areas[ t ] ** 2 / ( 6 * pointCounts[ t ] );
				for ( let c = 0; c < 3; c ++ ) squares[ layout.triangles[ t * 3 + c ] ] += square;

			}

			let mass = 0, inverse = 0;

			for ( let r = 0; r < recordCount; r ++ ) {

				const m = layout.masses[ r ];
				if ( m <= 0 || squares[ r ] <= 0 ) continue;

				const samples = m * m / squares[ r ];
				noiseScale[ r ] = 1 / samples;
				mass += m;
				inverse += m / samples;

			}

			const normalization = inverse > 0 ? mass / inverse : 1;

			for ( let r = 0; r < recordCount; r ++ ) noiseScale[ r ] = Math.sqrt( noiseScale[ r ] * normalization );

		}

		const noiseScaleBuffer = storage( new StorageBufferAttribute( noiseScale, 1 ), 'float', noiseScale.length ).toReadOnly();

		// the passes ping-pong between these, they store the irradiance and the standard deviation of its
		// noise in alpha, or -1 in alpha for records without samples, and the directions

		const count = directional ? 2 : 1;
		const targets = [ 0, 1 ].map( () => new RenderTarget( this._recordWidth, this._recordHeight, { type: FloatType, depthBuffer: false, count } ) );

		if ( directional ) {

			for ( const target of targets ) {

				target.textures[ 0 ].name = 'output';
				target.textures[ 1 ].name = 'direction';

			}

		}

		const relativeNoise = uniform( 0.05 );
		const luminancePhi = uniform( 3 );
		const normalPhi = uniform( 64 );
		const planePhi = uniform( 0.2 );
		const correlation = uniform( 0 );
		const radius = uniform( 1 );

		// the size of the meshes, the diagonal of the bounds of the records

		const bounds = new Box3();
		for ( let r = 0; r < recordCount; r ++ ) bounds.expandByPoint( _a.fromArray( layout.positions, r * 3 ) );

		const size = bounds.isEmpty() ? 1 : bounds.getSize( _a ).length();

		const records = layout.recordBuffer;
		const positionOf = ( record ) => records.element( record.mul( 2 ) ).xyz;
		const massOf = ( record ) => records.element( record.mul( 2 ) ).w;
		const normalOf = ( record ) => records.element( record.mul( 2 ).add( 1 ) ).xyz;
		const recordOf = ( coord ) => coord.y.mul( this._recordWidth ).add( coord.x );

		const sums = texture( this._accumulation.textures[ 0 ] );
		const resolved = texture( this._renderTarget.texture );
		const resolvedDirections = directional ? texture( this._directionTarget.texture ) : null;
		const fixedLight = this._fixedTexture !== null ? texture( this._fixedTexture ) : null;

		const output = ( light, direction ) => directional ? mrt( { output: light, direction } ) : light;

		// the irradiance of the records and its noise

		const prepareMaterial = new NodeMaterial();

		const prepare = Fn( () => {

			const coord = ivec2( screenCoordinate.xy );
			const record = uint( recordOf( uvec2( screenCoordinate.xy ) ) ).toVar();
			const value = resolved.load( coord ).rgb.toVar();
			const known = sums.load( coord ).a.greaterThan( 0 ).toVar();

			if ( fixedLight !== null ) known.assign( known.or( fixedLight.load( coord ).a.greaterThan( 0.5 ) ) );

			const deviation = luminance( value ).mul( relativeNoise ).mul( noiseScaleBuffer.element( record.min( Math.max( recordCount - 1, 0 ) ) ) );

			return select( known.and( record.lessThan( recordCount ) ), vec4( value, deviation ), vec4( 0, 0, 0, - 1 ) );

		} )();

		prepareMaterial.fragmentNode = output( prepare, directional ? resolvedDirections.load( ivec2( screenCoordinate.xy ) ) : null );

		// a pass over the neighbors of each record, reading one of the targets

		const createFilter = ( source ) => {

			const input = texture( source.textures[ 0 ] );
			const inputDirections = directional ? texture( source.textures[ 1 ] ) : null;
			const directionSum = directional ? vec4( 0 ).toVar( 'denoiseDirection' ) : null;

			const filter = Fn( () => {

				const coord = ivec2( screenCoordinate.xy );
				const record = uint( recordOf( uvec2( screenCoordinate.xy ) ) ).toVar();
				const center = input.load( coord ).toVar();
				const result = center.toVar();

				if ( directionSum !== null ) {

					Stack( directionSum );
					directionSum.assign( vec4( inputDirections.load( coord ).xyz, 1 ) );

				}

				If( record.lessThan( recordCount ).and( center.a.greaterThanEqual( 0 ) ), () => {

					const position = positionOf( record ).toVar();
					const normal = normalOf( record ).toVar();

					// a tangent frame, offsets in units of the size of the area of the record

					const helper = select( abs( normal.y ).lessThan( 0.9 ), vec3( 0, 1, 0 ), vec3( 1, 0, 0 ) );
					const tangent = normalize( cross( helper, normal ) ).toVar();
					const bitangent = cross( normal, tangent ).toVar();
					const scale = float( 1 ).div( sqrt( massOf( record ).max( 1e-20 ) ) ).toVar();

					const centerLuminance = luminance( center.rgb ).toVar();
					const luminanceScale = float( 1 ).div( luminancePhi.mul( center.a ).add( 1e-6 ) ).toVar();

					// a weighted linear fit like the one of LightMapDenoiser, starting with the center

					const moments = vec3( 1, 0, 0 ).toVar(); // sums of w, w x, w y
					const spread = vec3( 0 ).toVar(); // sums of w x x, w x y, w y y
					const sum = center.rgb.toVar();
					const sumX = vec3( 0 ).toVar();
					const sumY = vec3( 0 ).toVar();
					const noise = vec3( center.a.pow2(), 0, 0 ).toVar(); // sums of w w s s, times 1, x, y
					const noiseSpread = vec3( 0 ).toVar(); // times x x, x y, y y
					const deviations = vec3( center.a, 0, 0 ).toVar(); // sums of w s, times 1, x, y

					const first = neighborBuffer.element( record );
					const last = neighborBuffer.element( record.add( 1 ) );

					Loop( { start: first, end: last, type: 'uint', condition: '<', name: 'n' }, ( { n } ) => {

						const other = neighborBuffer.element( n.add( recordCount + 1 ) ).toVar();
						const otherCoord = ivec2( uvec2( other.mod( this._recordWidth ), other.div( this._recordWidth ) ) ).toVar();
						const value = input.load( otherCoord ).toVar();

						If( value.a.greaterThanEqual( 0 ), () => {

							const offset = positionOf( other ).sub( position ).toVar();
							const x = dot( offset, tangent ).mul( scale ).toVar();
							const y = dot( offset, bitangent ).mul( scale ).toVar();

							const plane = abs( dot( normal, offset ) ).div( length( offset ).add( 1e-9 ) );
							const similarity = pow( max( dot( normal, normalOf( other ) ), 0 ), normalPhi );
							const difference = abs( luminance( value.rgb ).sub( centerLuminance ) ).mul( luminanceScale );
							const distance = dot( offset, offset ).div( radius.pow2() );
							const weight = similarity.mul( exp( plane.div( planePhi ).add( difference ).add( distance.mul( 0.5 ) ).negate() ) ).toVar();
							const deviation2 = weight.pow2().mul( value.a.pow2() );

							moments.addAssign( vec3( weight, weight.mul( x ), weight.mul( y ) ) );
							spread.addAssign( vec3( weight.mul( x ).mul( x ), weight.mul( x ).mul( y ), weight.mul( y ).mul( y ) ) );
							sum.addAssign( value.rgb.mul( weight ) );
							sumX.addAssign( value.rgb.mul( weight.mul( x ) ) );
							sumY.addAssign( value.rgb.mul( weight.mul( y ) ) );
							noise.addAssign( vec3( deviation2, deviation2.mul( x ), deviation2.mul( y ) ) );
							noiseSpread.addAssign( vec3( deviation2.mul( x ).mul( x ), deviation2.mul( x ).mul( y ), deviation2.mul( y ).mul( y ) ) );
							deviations.addAssign( vec3( float( 1 ), x, y ).mul( weight.mul( value.a ) ) );

							if ( directionSum !== null ) directionSum.addAssign( vec4( inputDirections.load( otherCoord ).xyz.mul( weight ), weight ) );

						} );

					} );

					// the first row of the inverse of the regularized normal matrix

					const ridge = moments.x.mul( 0.1 );
					const a = moments.x, b = moments.y, c = moments.z;
					const d = spread.x.add( ridge ), e = spread.y, f = spread.z.add( ridge );
					const row = vec3( d.mul( f ).sub( e.pow2() ), c.mul( e ).sub( b.mul( f ) ), b.mul( e ).sub( c.mul( d ) ) ).toVar();
					const determinant = a.mul( row.x ).add( b.mul( row.y ) ).add( c.mul( row.z ) );

					row.assign( row.div( determinant ) );

					const fit = sum.mul( row.x ).add( sumX.mul( row.y ) ).add( sumY.mul( row.z ) ).max( 0 );
					const fitNoise = row.x.pow2().mul( noise.x ).add( row.y.pow2().mul( noiseSpread.x ) ).add( row.z.pow2().mul( noiseSpread.z ) )
						.add( row.x.mul( row.y ).mul( noise.y ).mul( 2 ) ).add( row.x.mul( row.z ).mul( noise.z ).mul( 2 ) ).add( row.y.mul( row.z ).mul( noiseSpread.y ).mul( 2 ) );

					// the noise of the fit if the noise of the neighbors were independent, and if it were shared

					const sharedNoise = dot( row, deviations ).pow2();

					result.assign( vec4( fit, sqrt( mix( fitNoise, sharedNoise, correlation ).max( 0 ) ) ) );

				} );

				return result;

			} )();

			const material = new NodeMaterial();
			material.fragmentNode = output( filter, directional ? vec4( directionSum.xyz.div( directionSum.w.max( 1e-20 ) ), 1 ) : null );

			return new QuadMesh( material );

		};

		// the result into the targets of the mapper

		const createOutput = ( source ) => {

			const material = new NodeMaterial();
			material.fragmentNode = vec4( texture( source.textures[ 0 ] ).load( ivec2( screenCoordinate.xy ) ).rgb, 1 );

			return new QuadMesh( material );

		};

		const createDirectionOutput = ( source ) => {

			const material = new NodeMaterial();
			material.fragmentNode = vec4( texture( source.textures[ 1 ] ).load( ivec2( screenCoordinate.xy ) ).xyz, 1 );

			return new QuadMesh( material );

		};

		this._denoiser = {
			targets, neighborBuffer, noiseScaleBuffer, relativeNoise, luminancePhi, normalPhi, planePhi, correlation, radius, size,
			prepareQuad: new QuadMesh( prepareMaterial ),
			filterQuads: [ createFilter( targets[ 0 ] ), createFilter( targets[ 1 ] ) ],
			outputQuads: [ createOutput( targets[ 0 ] ), createOutput( targets[ 1 ] ) ],
			directionQuads: directional ? [ createDirectionOutput( targets[ 0 ] ), createDirectionOutput( targets[ 1 ] ) ] : null
		};

	}

	/**
	 * Creates the targets and passes of `estimateNoise()`.
	 *
	 * @private
	 */
	_createNoiseEstimator() {

		const width = this._recordWidth;
		const height = this._recordHeight;

		// records without samples are stored as -1

		this._snapshot = new RenderTarget( width, height, { type: FloatType, format: RedFormat, depthBuffer: false } );
		this._noiseTarget = new RenderTarget( Math.ceil( width / NOISE_BLOCK ), Math.ceil( height / NOISE_BLOCK ), { type: FloatType, depthBuffer: false } );

		const sums = texture( this._accumulation.textures[ 0 ] );
		const snapshot = texture( this._snapshot.texture );

		const recordLuminance = ( value ) => value.a.greaterThan( 0 ).select( luminance( value.rgb ).div( value.a ), - 1 );

		const snapshotMaterial = new NodeMaterial();
		snapshotMaterial.fragmentNode = vec4( recordLuminance( sums.load( ivec2( screenCoordinate.xy ) ) ), 0, 0, 1 );

		// sums the squared relative change, the squared luminance and the weight of a block, weighted by
		// the visible area of the records

		const floor = this._floor;

		const noiseMaterial = new NodeMaterial();

		noiseMaterial.fragmentNode = Fn( () => {

			const origin = ivec2( screenCoordinate.xy ).mul( NOISE_BLOCK );
			const sum = vec4( 0 ).toVar();

			Loop( NOISE_BLOCK, NOISE_BLOCK, ( { i, j } ) => {

				const coord = origin.add( ivec2( i, j ) );

				If( coord.x.lessThan( width ).and( coord.y.lessThan( height ) ), () => {

					const value = sums.load( coord ).toVar();
					const current = recordLuminance( value ).toVar();
					const previous = snapshot.load( coord ).r;

					If( current.greaterThanEqual( 0 ), () => {

						const change = previous.greaterThanEqual( 0 ).select( current.sub( previous ).pow2(), 0 );

						sum.addAssign( vec4( change.div( current.pow2().add( floor ).max( 1e-12 ) ), current.pow2(), 1, 0 ).mul( value.a ) );

					} );

				} );

			} );

			return sum;

		} )();

		this._snapshotQuad = new QuadMesh( snapshotMaterial );
		this._noiseQuad = new QuadMesh( noiseMaterial );

	}

}

/**
 * Finds the records of a layout whose light a previous bake of the same meshes has: the records at the
 * same quantized position and normal as a previous one, whose triangles all were triangles of the
 * previous layout. Split triangles change the area that the records of their corners average.
 *
 * @private
 * @param {Object} previous - The previous bake: its `layout`, `irradiance` and `directions`.
 * @param {VertexLayout} layout - The layout.
 * @param {boolean} directional - Whether the directions are kept too.
 * @return {Object} The flags of the kept records, their `irradiance` and `directions`, and their `count`.
 */
function fixedRecords( previous, layout, directional ) {

	const old = previous.layout;
	const positionStep = layout._positionStep;
	const normalStep = layout._normalStep;

	const keyOf = ( positions, normals, r, inside ) => {

		let key = inside !== null && inside[ r ] > 0 ? inside[ r ] + ',' : '';

		for ( let c = 0; c < 3; c ++ ) key += Math.round( positions[ r * 3 + c ] * positionStep ) + ',';
		for ( let c = 0; c < 3; c ++ ) key += Math.round( normals[ r * 3 + c ] * normalStep ) + ',';

		return key;

	};

	const oldRecords = new Map();

	if ( old._positionStep === positionStep && old._normalStep === normalStep ) {

		for ( let r = 0; r < old.recordCount; r ++ ) oldRecords.set( keyOf( old.positions, old.normals, r, old.inside ), r );

	}

	const sources = new Int32Array( layout.recordCount );

	for ( let r = 0; r < layout.recordCount; r ++ ) sources[ r ] = oldRecords.get( keyOf( layout.positions, layout.normals, r, layout.inside ) ) ?? - 1;

	// the triangles of the previous layout by the sorted records of their corners

	const triangleKey = ( a, b, c ) => a < b ? ( b < c ? `${ a },${ b },${ c }` : a < c ? `${ a },${ c },${ b }` : `${ c },${ a },${ b }` ) : ( a < c ? `${ b },${ a },${ c }` : b < c ? `${ b },${ c },${ a }` : `${ c },${ b },${ a }` );
	const oldTriangles = new Set();

	for ( let t = 0; t < old.triangleCount; t ++ ) oldTriangles.add( triangleKey( old.triangles[ t * 3 ], old.triangles[ t * 3 + 1 ], old.triangles[ t * 3 + 2 ] ) );

	const records = new Uint8Array( layout.recordCount );

	for ( let r = 0; r < layout.recordCount; r ++ ) records[ r ] = sources[ r ] >= 0 ? 1 : 0;

	for ( let t = 0; t < layout.triangleCount && previous.all !== true; t ++ ) {

		const corners = layout.triangles.subarray( t * 3, t * 3 + 3 );
		const a = sources[ corners[ 0 ] ], b = sources[ corners[ 1 ] ], c = sources[ corners[ 2 ] ];

		if ( a < 0 || b < 0 || c < 0 || oldTriangles.has( triangleKey( a, b, c ) ) === false ) {

			records[ corners[ 0 ] ] = records[ corners[ 1 ] ] = records[ corners[ 2 ] ] = 0;

		}

	}

	// the light of the kept records

	const irradiance = new Float32Array( layout.recordCount * 3 );
	const directions = directional && previous.directions ? new Float32Array( layout.recordCount * 4 ) : null;
	let count = 0;

	for ( let r = 0; r < layout.recordCount; r ++ ) {

		if ( records[ r ] === 0 ) continue;

		// without the directions of the previous bake, the record is baked again

		if ( directional && directions === null ) {

			records[ r ] = 0;
			continue;

		}

		const source = sources[ r ];

		irradiance.set( previous.irradiance.subarray( source * 3, source * 3 + 3 ), r * 3 );
		if ( directions !== null ) directions.set( previous.directions.subarray( source * 4, source * 4 + 4 ), r * 4 );

		count ++;

	}

	return { records, irradiance, directions, count };

}

/**
 * Lights a material with the irradiance baked into vertices, through its light map: the irradiance is
 * multiplied by the albedo like a light map and scaled by `material.lightMapIntensity`, and the
 * dominant directions of a directional bake shade normal maps like {@link directionalLightMap}. The
 * source is a {@link VertexLightMapper}, whose textures the vertices look up on the GPU, also while
 * it bakes, or the name of a geometry attribute written by {@link VertexLightMapper#toAttributes}. The
 * directions of an attribute are in an attribute of the same name with `Direction` appended, four values
 * per vertex encoded like {@link VertexLightMapper#directionTexture}, e.g. from {@link projectLightMaps}.
 * Double-sided materials show the light of the back of the faces on their back, from the records of a
 * layout with the `doubleSided` option or from attributes with `Back` appended to the names, if there are.
 *
 * ```js
 * vertexLightMap( material, mapper );
 * ```
 *
 * @param {Material} material - The material, a node material or one that converts to one.
 * @param {?(VertexLightMapper|string)} source - The vertex light mapper or the name of the attribute, `null` restores the material.
 * @param {Object} [options] - The options.
 * @param {boolean} [options.directional=true] - Whether to shade with the dominant directions of a directional mapper.
 * @param {number} [options.specularIntensity=1] - The scale of the approximate specular term of directional light, 0 leaves it out.
 */
function vertexLightMap( material, source, { directional = true, specularIntensity = 1 } = {} ) {

	if ( source === null ) {

		if ( material.lightMapVertices !== undefined ) {

			delete material.lightMapVertices;
			delete material.lightMapSpecularIntensity;
			delete material.setupLightMap;
			material.needsUpdate = true;

			// the light maps of instanced meshes keep their atlas regions

			if ( material.lightMapInstances === true ) instancedLightMap( material );

		}

		return;

	}

	const mapper = typeof source === 'string' ? null : source;
	const directionTexture = directional && mapper !== null ? mapper.directionTexture : null;

	// the key keeps the shaders of different sources apart, they bind the textures of their mapper

	material.lightMapVertices = mapper !== null ? mapper.key : 'attribute:' + source + ( directional ? ':directional' : '' );
	material.lightMapSpecularIntensity = specularIntensity;

	material.setupLightMap = function ( builder ) {

		let irradiance, direction = null;

		const doubleSided = this.side === DoubleSide;

		if ( mapper !== null ) {

			const read = ( back ) => {

				const record = mapper.layout.recordNode( back );
				const coord = mapper.recordCoord( record );
				const known = record.notEqual( NONE );

				return {
					irradiance: varying( select( known, texture( mapper.texture ).load( coord ).rgb, vec3( 0 ) ) ),
					direction: directionTexture !== null ? varying( select( known, texture( directionTexture ).load( coord ), vec4( 0.5, 0.5, 0.5, 1 ) ) ) : null
				};

			};

			( { irradiance, direction } = read( false ) );

			if ( doubleSided ) {

				const back = read( true );

				irradiance = select( frontFacing, irradiance, back.irradiance );
				if ( direction !== null ) direction = select( frontFacing, direction, back.direction );

			}

		} else {

			const geometry = builder.geometry;

			irradiance = geometry.hasAttribute( source ) ? attribute( source, 'vec3' ) : vec3( 0 );

			if ( directional && geometry.hasAttribute( source + 'Direction' ) ) direction = attribute( source + 'Direction', 'vec4' );

			if ( doubleSided && geometry.hasAttribute( source + 'Back' ) ) {

				irradiance = select( frontFacing, irradiance, attribute( source + 'Back', 'vec3' ) );

				if ( direction !== null && geometry.hasAttribute( source + 'BackDirection' ) ) direction = select( frontFacing, direction, attribute( source + 'BackDirection', 'vec4' ) );

			}

		}

		irradiance = irradiance.mul( materialReference( 'lightMapIntensity', 'float' ) );

		if ( this.isMeshBasicNodeMaterial === true ) return new BasicLightMapNode( irradiance );

		if ( direction !== null ) {

			const intensity = builder.material.lightMapSpecularIntensity > 0 ? materialReference( 'lightMapSpecularIntensity', 'float' ) : null;

			return new DirectionalLightMapNode( irradiance, direction, intensity );

		}

		return new IrradianceNode( irradiance );

	};

	material.needsUpdate = true;

}

/**
 * Splits the triangles of a geometry until no edge is longer than a length, by midpoint subdivision,
 * so that vertex light can show the detail within big triangles. An edge is split when it is too long,
 * and the triangles split by the pattern of their split edges into two, three or four. The decision
 * only depends on the positions, so the triangles on both sides of an edge split it alike, also at the
 * seams of other attributes, and no cracks open. All attributes and morph attributes are interpolated,
 * normals and tangents renormalized. Returns the geometry itself if no edge is too long.
 *
 * @param {BufferGeometry} geometry - The geometry.
 * @param {number} maxEdgeLength - The maximum edge length, in world units with the transform.
 * @param {Object} [options] - The options.
 * @param {?Matrix4} [options.matrix=null] - The transform of the geometry into world space, for the edge lengths.
 * @param {number} [options.maxTriangles=4194304] - Stops splitting before the geometry exceeds this number of triangles.
 * @param {number} [options.rounds=32] - The maximum number of rounds, each one splits the edges that are too long once.
 * @param {?function(number, number, number): boolean} [options.split=null] - Decides whether to split the edge between two vertices of the
 * geometry, given its squared length, in place of the maximum edge length. An edge splits if it does so for any pair of vertices at its
 * positions. New vertices are not passed to it, so use it with one round.
 * @param {boolean} [options.longest=false] - Whether the triangles that split an edge split their longest edge too. The neighbours across
 * it then split their longest edges, and so on into larger triangles, so the triangles keep their shapes instead of growing thinner with
 * every split of a short edge, and the refinement grades into the triangles around it.
 * @return {BufferGeometry} The subdivided geometry, or the geometry itself.
 */
function subdivideGeometry( geometry, maxEdgeLength, { matrix = null, maxTriangles = 4194304, rounds = 32, split: splitEdge = null, longest = false } = {} ) {

	const position = geometry.getAttribute( 'position' );
	const sourceIndex = geometry.getIndex();
	const count = sourceIndex !== null ? sourceIndex.count : position.count;

	// world-space positions, and an id per distinct position for the edge decisions

	let world = new Float32Array( position.count * 3 );

	for ( let i = 0; i < position.count; i ++ ) {

		_a.fromBufferAttribute( position, i );
		if ( matrix !== null ) _a.applyMatrix4( matrix );
		_a.toArray( world, i * 3 );

	}

	const positionIds = new Map();
	let ids = new Uint32Array( position.count );

	for ( let i = 0; i < position.count; i ++ ) {

		const key = position.getX( i ) + ',' + position.getY( i ) + ',' + position.getZ( i );

		if ( positionIds.has( key ) === false ) positionIds.set( key, positionIds.size );

		ids[ i ] = positionIds.get( key );

	}

	let nextId = positionIds.size;

	// the triangles of each group, as vertex indices

	const groups = geometry.groups.length > 0 ? geometry.groups : [ { start: 0, count: Infinity, materialIndex: 0 } ];
	const drawStart = Math.max( 0, geometry.drawRange.start );
	const drawEnd = Math.min( count, geometry.drawRange.start + geometry.drawRange.count );

	let groupTriangles = groups.map( ( group ) => {

		const list = [];
		const start = Math.max( drawStart, group.start ), end = Math.min( drawEnd, group.start + group.count );

		for ( let i = start; i + 2 < end; i += 3 ) {

			for ( let c = 0; c < 3; c ++ ) list.push( sourceIndex !== null ? sourceIndex.getX( i + c ) : i + c );

		}

		return list;

	} );

	// the new vertices interpolate two others

	const parents = [];
	let vertexCount = position.count;
	const maxSq = maxEdgeLength * maxEdgeLength;

	const lengthSq = ( i, j ) => {

		const dx = world[ i * 3 ] - world[ j * 3 ], dy = world[ i * 3 + 1 ] - world[ j * 3 + 1 ], dz = world[ i * 3 + 2 ] - world[ j * 3 + 2 ];

		return dx * dx + dy * dy + dz * dz;

	};

	let triangles = groupTriangles.reduce( ( sum, list ) => sum + list.length / 3, 0 );

	for ( let round = 0; round < rounds; round ++ ) {

		let splits = 0;

		// the edges to split, by the ids of their positions, so that the triangles on both sides agree

		const marked = new Set();
		const positionKey = ( i, j ) => ids[ i ] < ids[ j ] ? ids[ i ] * 67108864 + ids[ j ] : ids[ j ] * 67108864 + ids[ i ];

		for ( const list of groupTriangles ) {

			for ( let t = 0; t < list.length; t += 3 ) {

				for ( let e = 0; e < 3; e ++ ) {

					const i = list[ t + e ], j = list[ t + ( e + 1 ) % 3 ];
					const length = lengthSq( i, j );

					if ( splitEdge !== null ? i < position.count && j < position.count && splitEdge( i, j, length ) : length > maxSq ) marked.add( positionKey( i, j ) );

				}

			}

		}

		// the longest edges of the triangles that split an edge, until no triangle splits an edge without its longest one.
		// Ties go to the lower key, so that the triangles on both sides of an edge agree

		if ( longest && marked.size > 0 ) {

			const longestKeys = groupTriangles.map( ( list ) => {

				const keys = new Float64Array( list.length / 3 );

				for ( let t = 0; t < list.length; t += 3 ) {

					let best = - 1, bestKey = 0;

					for ( let e = 0; e < 3; e ++ ) {

						const i = list[ t + e ], j = list[ t + ( e + 1 ) % 3 ];
						const length = lengthSq( i, j ), key = positionKey( i, j );

						if ( length > best || ( length === best && key < bestKey ) ) {

							best = length;
							bestKey = key;

						}

					}

					keys[ t / 3 ] = bestKey;

				}

				return keys;

			} );

			let changed = true;

			while ( changed ) {

				changed = false;

				groupTriangles.forEach( ( list, g ) => {

					const keys = longestKeys[ g ];

					for ( let t = 0; t < list.length; t += 3 ) {

						if ( marked.has( keys[ t / 3 ] ) ) continue;

						const a = list[ t ], b = list[ t + 1 ], c = list[ t + 2 ];

						if ( marked.has( positionKey( a, b ) ) || marked.has( positionKey( b, c ) ) || marked.has( positionKey( c, a ) ) ) {

							marked.add( keys[ t / 3 ] );
							changed = true;

						}

					}

				} );

			}

		}

		const isSplit = ( i, j ) => marked.has( positionKey( i, j ) );

		const midpoints = new Map();
		const positionMidpoints = new Map();

		const midpoint = ( i, j ) => {

			const key = i < j ? i * 67108864 + j : j * 67108864 + i;

			if ( midpoints.has( key ) === false ) {

				// the midpoints of the same positions share an id

				const pi = ids[ i ], pj = ids[ j ];
				const positionKey = pi < pj ? pi * 67108864 + pj : pj * 67108864 + pi;

				if ( positionMidpoints.has( positionKey ) === false ) positionMidpoints.set( positionKey, nextId ++ );

				midpoints.set( key, vertexCount ++ );
				parents.push( i, j );

				const k = vertexCount - 1;

				if ( world.length < vertexCount * 3 ) {

					const grown = new Float32Array( vertexCount * 6 );
					grown.set( world );
					world = grown;

					const grownIds = new Uint32Array( vertexCount * 2 );
					grownIds.set( ids );
					ids = grownIds;

				}

				for ( let c = 0; c < 3; c ++ ) world[ k * 3 + c ] = ( world[ i * 3 + c ] + world[ j * 3 + c ] ) / 2;

				ids[ k ] = positionMidpoints.get( positionKey );

			}

			return midpoints.get( key );

		};

		// estimate the new triangles before splitting, so that the budget holds

		let added = 0;

		for ( const list of groupTriangles ) {

			for ( let t = 0; t < list.length; t += 3 ) {

				const a = list[ t ], b = list[ t + 1 ], c = list[ t + 2 ];

				added += isSplit( a, b ) + isSplit( b, c ) + isSplit( c, a );

			}

		}

		if ( added === 0 || triangles + added > maxTriangles ) break;

		groupTriangles = groupTriangles.map( ( list ) => {

			const result = [];

			for ( let t = 0; t < list.length; t += 3 ) {

				const a = list[ t ], b = list[ t + 1 ], c = list[ t + 2 ];
				const sab = isSplit( a, b ), sbc = isSplit( b, c ), sca = isSplit( c, a );
				const split = sab + sbc + sca;

				if ( split === 0 ) {

					result.push( a, b, c );
					continue;

				}

				splits ++;

				if ( split === 3 ) {

					const ab = midpoint( a, b ), bc = midpoint( b, c ), ca = midpoint( c, a );
					result.push( a, ab, ca, ab, b, bc, ca, bc, c, ab, bc, ca );
					continue;

				}

				// rotate the corners so that the first split edge starts at the first corner

				let [ p, q, r ] = [ a, b, c ];
				let [ s0, s1, s2 ] = [ sab, sbc, sca ];

				while ( s0 === false || ( split === 2 && s2 === true && s1 === false ) ) {

					[ p, q, r ] = [ q, r, p ];
					[ s0, s1, s2 ] = [ s1, s2, s0 ];

				}

				const pq = midpoint( p, q );

				if ( split === 1 ) {

					result.push( p, pq, r, pq, q, r );

				} else {

					// the edges p-q and q-r are split, the quad p, pq, qr, r is split along its shorter diagonal

					const qr = midpoint( q, r );

					result.push( pq, q, qr );

					if ( lengthSq( p, qr ) < lengthSq( pq, r ) ) result.push( p, pq, qr, p, qr, r );
					else result.push( p, pq, r, pq, qr, r );

				}

			}

			return result;

		} );

		triangles += added;

		if ( splits === 0 ) break;

	}

	if ( vertexCount === position.count ) return geometry;

	// the attributes of the new vertices, interpolated in the order the vertices were created

	const interpolate = ( attribute ) => {

		const itemSize = attribute.itemSize;
		const array = new attribute.array.constructor( vertexCount * itemSize );
		const integer = ( array instanceof Float32Array || array instanceof Float64Array ) === false && attribute.normalized === false;
		const result = new BufferAttribute( array, itemSize, attribute.normalized );

		for ( let i = 0; i < attribute.count; i ++ ) {

			for ( let c = 0; c < itemSize; c ++ ) result.setComponent( i, c, attribute.getComponent( i, c ) );

		}

		for ( let k = attribute.count; k < vertexCount; k ++ ) {

			const i = parents[ ( k - attribute.count ) * 2 ], j = parents[ ( k - attribute.count ) * 2 + 1 ];

			for ( let c = 0; c < itemSize; c ++ ) {

				const value = ( result.getComponent( i, c ) + result.getComponent( j, c ) ) / 2;

				result.setComponent( k, c, integer ? Math.round( value ) : value );

			}

		}

		return result;

	};

	const normalize3 = ( attribute ) => {

		for ( let i = position.count; i < attribute.count; i ++ ) {

			_a.fromBufferAttribute( attribute, i ).normalize();
			attribute.setXYZ( i, _a.x, _a.y, _a.z );

		}

	};

	const result = new BufferGeometry();

	for ( const name in geometry.attributes ) {

		const attribute = interpolate( geometry.attributes[ name ] );

		if ( name === 'normal' || name === 'tangent' ) normalize3( attribute );

		result.setAttribute( name, attribute );

	}

	for ( const name in geometry.morphAttributes ) {

		result.morphAttributes[ name ] = geometry.morphAttributes[ name ].map( interpolate );

	}

	result.morphTargetsRelative = geometry.morphTargetsRelative;

	const indices = [];

	groupTriangles.forEach( ( list, i ) => {

		if ( geometry.groups.length > 0 ) result.addGroup( indices.length, list.length, groups[ i ].materialIndex );

		for ( const vertex of list ) indices.push( vertex );

	} );

	result.setIndex( indices );
	result.name = geometry.name;
	result.userData = { ...geometry.userData };

	return result;

}

// whether a triangle is inside other meshes, by the attribute of imprintContacts

function isInside( inside, i, j, k ) {

	return inside !== undefined && inside.getX( i ) >= 0.75 && inside.getX( j ) >= 0.75 && inside.getX( k ) >= 0.75;

}

// the vertex indices of the triangles of a geometry

function triangleIndices( geometry ) {

	const index = geometry.index;
	const count = index !== null ? index.count : geometry.getAttribute( 'position' ).count;
	const indices = new Uint32Array( count );

	for ( let i = 0; i < count; i ++ ) indices[ i ] = index !== null ? index.getX( i ) : i;

	return indices;

}

// world-space positions and normals of the vertices of a geometry

function worldVertices( geometry, matrix ) {

	const position = geometry.getAttribute( 'position' );
	const normal = geometry.getAttribute( 'normal' );
	const normalMatrix = _normalMatrix.getNormalMatrix( matrix );
	const positions = new Float32Array( position.count * 3 );
	const normals = new Float32Array( position.count * 3 );

	for ( let i = 0; i < position.count; i ++ ) {

		_a.fromBufferAttribute( position, i ).applyMatrix4( matrix ).toArray( positions, i * 3 );
		if ( normal !== undefined ) _a.fromBufferAttribute( normal, i ).applyMatrix3( normalMatrix ).normalize().toArray( normals, i * 3 );

	}

	return { positions, normals };

}

/**
 * Splits the edges of geometries next to other surfaces, where the light changes within a short
 * distance, e.g. in contact shadows and in the corners between walls and floors, which vertices
 * farther apart can not show. An edge splits if some, but not all, of a few rays from its midpoint over
 * the hemisphere of its normal hit a front face within the length of the edge. Rays that all hit are in
 * hidden places, e.g. under other meshes, rays that all miss are in the open. The decision only depends
 * on the geometry, so it can precede a bake. Each round splits the edges once, down to a minimum length.
 * Meshes that share a geometry share the splits of all of them. Uses three-mesh-bvh.
 *
 * @async
 * @param {Array<{geometry: BufferGeometry, meshes: Array<Mesh>}>} groups - The geometries to split, each with the meshes that use it.
 * @param {Array<Mesh>} occluders - The meshes whose surfaces the rays hit, with their world transforms.
 * @param {Object} options - The options.
 * @param {number} options.minEdgeLength - Edges of at most this length in world units are not split.
 * @param {number} [options.rounds=1] - The number of rounds.
 * @param {number} [options.rays=8] - The number of rays per edge.
 * @return {Promise<Array<BufferGeometry>>} A promise that resolves with the geometries of the groups, split or as they were.
 */
async function refineContacts( groups, occluders, { minEdgeLength, rounds = 1, rays = 8 } = {} ) {

	const { MeshBVH } = await import( 'three-mesh-bvh' );

	// the triangles of the occluders in world space

	const scene = occluderSoup( occluders );

	const bvh = new MeshBVH( scene );
	const epsilon = Math.max( scene.boundingBox.getSize( _a ).length(), 1e-6 ) * 1e-5;

	// rays over the hemisphere, cosine weighted on a spiral

	const directions = [];

	for ( let k = 0; k < rays; k ++ ) {

		const u = ( k + 0.5 ) / rays, phi = k * 2.399963229728653;
		directions.push( [ Math.sqrt( u ) * Math.cos( phi ), Math.sqrt( u ) * Math.sin( phi ), Math.sqrt( 1 - u ) ] );

	}

	const ray = new Ray();
	const tangent = new Vector3(), bitangent = new Vector3(), normal = new Vector3(), midpoint = new Vector3();

	const nearContact = ( positions, normals, i, j ) => {

		midpoint.fromArray( positions, i * 3 ).add( _b.fromArray( positions, j * 3 ) ).multiplyScalar( 0.5 );
		normal.fromArray( normals, i * 3 ).add( _b.fromArray( normals, j * 3 ) );

		if ( normal.lengthSq() < 1e-12 ) return false;

		normal.normalize();
		tangent.set( Math.abs( normal.x ) < 0.9 ? 1 : 0, Math.abs( normal.x ) < 0.9 ? 0 : 1, 0 ).cross( normal ).normalize();
		bitangent.crossVectors( normal, tangent );

		const length = _b.fromArray( positions, i * 3 ).distanceTo( _c.fromArray( positions, j * 3 ) );
		let hits = 0;

		for ( let k = 0; k < rays; k ++ ) {

			const [ x, y, z ] = directions[ k ];
			ray.direction.copy( tangent ).multiplyScalar( x ).addScaledVector( bitangent, y ).addScaledVector( normal, z );
			ray.origin.copy( midpoint ).addScaledVector( normal, epsilon + length * 1e-3 );

			if ( bvh.raycastFirst( ray, FrontSide, 0, length ) !== null ) hits ++;

			// a hit and a miss decide it

			if ( hits > 0 && hits <= k ) return true;

		}

		return false;

	};

	const geometries = groups.map( ( group ) => group.geometry );
	const minSq = minEdgeLength * minEdgeLength;

	for ( let round = 0; round < rounds; round ++ ) {

		let split = false;

		for ( let g = 0; g < groups.length; g ++ ) {

			const geometry = geometries[ g ];
			const vertices = groups[ g ].meshes.map( ( mesh ) => worldVertices( geometry, mesh.matrixWorld ) );

			const refined = subdivideGeometry( geometry, 0, { matrix: groups[ g ].meshes[ 0 ].matrixWorld, rounds: 1, split: ( i, j, lengthSq ) => {

				return lengthSq > minSq && vertices.some( ( { positions, normals } ) => nearContact( positions, normals, i, j ) );

			} } );

			if ( refined !== geometry ) {

				geometries[ g ] = refined;
				split = true;

			}

		}

		if ( split === false ) break;

	}

	bvh.geometry.dispose();

	return geometries;

}

// the cosine of the angle between the normals of a triangle and of a face above which the face covers it, see imprintContacts

const COVER_COSINE = 0.87;

// the triangles of meshes in world space, in one geometry for three-mesh-bvh. The triangles of back-sided
// materials are turned over, the ones of double-sided materials have a 'side' of 0, the others of 1

function occluderSoup( occluders, geometries = null ) {

	const parts = [];
	let total = 0;

	for ( const mesh of occluders ) {

		mesh.updateWorldMatrix( true, false );

		const geometry = geometries?.get( mesh ) ?? mesh.geometry;
		const position = geometry.getAttribute( 'position' );
		const indices = triangleIndices( geometry );
		const instances = mesh.isInstancedMesh ? mesh.count : 1;
		const materials = [ mesh.material ].flat();
		const back = materials.every( ( material ) => material.side === BackSide );
		const side = materials.some( ( material ) => material.side === DoubleSide ) ? 0 : 1;

		for ( let instance = 0; instance < instances; instance ++ ) {

			if ( mesh.isInstancedMesh ) mesh.getMatrixAt( instance, _matrix ).premultiply( mesh.matrixWorld );
			else _matrix.copy( mesh.matrixWorld );

			const array = new Float32Array( indices.length * 3 );

			for ( let i = 0; i < indices.length; i ++ ) {

				const corner = back && i % 3 > 0 ? i - i % 3 + 3 - i % 3 : i;
				_a.fromBufferAttribute( position, indices[ corner ] ).applyMatrix4( _matrix ).toArray( array, i * 3 );

			}

			parts.push( { array, side } );
			total += array.length;

		}

	}

	const merged = new Float32Array( total );
	const sides = new Float32Array( total / 3 );
	let offset = 0;

	for ( const { array, side } of parts ) {

		merged.set( array, offset );
		sides.fill( side, offset / 3, ( offset + array.length ) / 3 );
		offset += array.length;

	}

	const scene = new BufferGeometry();
	scene.setAttribute( 'position', new BufferAttribute( merged, 3 ) );
	scene.setAttribute( 'side', new BufferAttribute( sides, 1 ) );
	scene.computeBoundingBox();

	return scene;

}

/**
 * Cuts the triangles of geometries along the lines where other surfaces meet them, so that no triangle
 * lies partly inside or under another mesh, and marks the state of the triangles with an `inside`
 * attribute of their vertices: 1 inside other meshes, 0.5 covered by them and 0 outside. Two kinds of
 * contacts are cut:
 *
 * - The lines where another surface crosses a triangle, e.g. a column standing in water, or rests on it,
 * e.g. a box on a floor, since surfaces within `tolerance` count as touching. The side of a line behind the
 * other surface, against its normal, is inside.
 * - The outlines of faces that cover a triangle within `gap`, facing it or parallel to it in front. Faces
 * that rest on it, e.g. the bottom of a box on a floor, make the part under them inside, the others, e.g. a
 * banner in front of a wall, covered.
 *
 * {@link VertexLayout} leaves the inside triangles out: they get no sample points, so the vertices on the
 * lines only take the light of the open side, as if the meshes were joined there, and no light is baked
 * where it can not be seen. Covered triangles are baked, since they can show, e.g. through the gap behind
 * a banner, but like the inside ones they have their own vertices, so that the light of the two sides of a
 * contact does not mix. The vertices of the triangles on the lines are copies, which {@link subdivideGeometry}
 * and {@link simplifyGeometry} keep apart.
 *
 * The cuts follow the surfaces in one pass, and the triangles on both sides of an edge share the points on
 * it, also at the seams of other attributes. A region between the lines is inside if the lines around it
 * say so, weighted by their lengths, e.g. the floor under a box as a whole, and if it looks inside: most
 * rays over its triangles hit the back of one-sided faces or faces resting on them. Meshes that share a geometry
 * share the cuts of all of them, and a triangle is inside or covered only if it is in all of them. Uses
 * three-mesh-bvh.
 *
 * @async
 * @param {Array<{geometry: BufferGeometry, meshes: Array<Mesh>}>} groups - The geometries to cut, each with the meshes that use it.
 * @param {Array<Mesh>} occluders - The meshes whose surfaces cut the geometries, with their world transforms.
 * @param {Object} [options] - The options.
 * @param {?Map<Mesh, BufferGeometry>} [options.geometries=null] - Geometries of the occluders in place of their own, e.g. the ones before a subdivision.
 * @param {?number} [options.tolerance=null] - The distance in world units within which surfaces touch, by default 1e-4 of the size of the occluders.
 * @param {?number} [options.gap=null] - The distance in world units within which faces cover a surface, by default 2.5e-3 of the size of the occluders.
 * @return {Promise<Array<BufferGeometry>>} A promise that resolves with the geometries of the groups, cut or as they were.
 */
async function imprintContacts( groups, occluders, { geometries = null, tolerance = null, gap = null } = {} ) {

	const { MeshBVH } = await import( 'three-mesh-bvh' );

	const scene = occluderSoup( occluders, geometries );
	const bvh = new MeshBVH( scene );
	const size = Math.max( scene.boundingBox.getSize( _a ).length(), 1e-6 );

	const result = groups.map( ( group ) => imprintGeometry( group.geometry, group.meshes, bvh, scene, tolerance ?? size * 1e-4, gap ?? size * 2.5e-3 ) );

	scene.dispose();

	return result;

}

// cuts a geometry along its contacts with the triangles of a bvh, see imprintContacts

function imprintGeometry( geometry, meshes, bvh, scene, tolerance, gap ) {

	if ( Object.keys( geometry.morphAttributes ).length > 0 || meshes.length === 0 ) return geometry;

	const position = geometry.getAttribute( 'position' );
	const index = geometry.getIndex();
	const count = index !== null ? index.count : position.count;

	// an id per distinct position: the points on the edges at the same positions are shared, also at seams

	const positionIds = new Map();

	const idOf = ( x, y, z ) => {

		const key = x + ',' + y + ',' + z;
		let id = positionIds.get( key );

		if ( id === undefined ) positionIds.set( key, id = positionIds.size );

		return id;

	};

	const ids = [];
	for ( let i = 0; i < position.count; i ++ ) ids.push( idOf( position.getX( i ), position.getY( i ), position.getZ( i ) ) );

	// the triangles and their groups

	const groups = geometry.groups.length > 0 ? geometry.groups : [ { start: 0, count: Infinity, materialIndex: 0 } ];
	const drawStart = Math.max( 0, geometry.drawRange.start );
	const drawEnd = Math.min( count, geometry.drawRange.start + geometry.drawRange.count );
	const triangles = [], triangleGroups = [];

	groups.forEach( ( group, g ) => {

		const start = Math.max( drawStart, group.start ), end = Math.min( drawEnd, group.start + group.count );

		for ( let i = start; i + 2 < end; i += 3 ) {

			for ( let c = 0; c < 3; c ++ ) triangles.push( index !== null ? index.getX( i + c ) : i + c );
			triangleGroups.push( g );

		}

	} );

	const triangleCount = triangleGroups.length;
	const instances = meshes.length;
	const worlds = meshes.map( ( mesh ) => worldVertices( geometry, mesh.matrixWorld ).positions );
	const flips = meshes.map( ( mesh ) => [ mesh.material ].flat().every( ( material ) => material.side === BackSide ) ? - 1 : 1 );
	const sides = scene.getAttribute( 'side' );
	const sceneIndex = scene.getIndex();
	const scale = Math.max( ...meshes.map( ( mesh ) => mesh.matrixWorld.getMaxScaleOnAxis() ), 1e-12 );
	const delta = tolerance / scale;

	// a 2D frame of each triangle in its local space, counterclockwise

	const la = new Vector3(), lb = new Vector3(), lc = new Vector3(), e1 = new Vector3(), e2 = new Vector3(), ln = new Vector3();

	const frameOf = ( t ) => {

		la.fromBufferAttribute( position, triangles[ t * 3 ] );
		lb.fromBufferAttribute( position, triangles[ t * 3 + 1 ] );
		lc.fromBufferAttribute( position, triangles[ t * 3 + 2 ] );

		e1.subVectors( lb, la );
		e2.subVectors( lc, la );
		ln.crossVectors( e1, e2 );

		const length = e1.length();

		if ( length === 0 || ln.length() <= 1e-12 * length * length ) return null;

		const cx = e2.dot( e1 ) / length;
		e1.normalize();
		ln.normalize();

		return [ 0, 0, length, 0, cx, _c.crossVectors( ln, e1 ).dot( e2 ) ];

	};

	// the cuts of each triangle in its frame, and the points on the edges by the ids of their positions

	const cuts = new Array( triangleCount ).fill( null );
	const edgePoints = new Map();
	const edgeKey = ( a, b ) => a < b ? a * 67108864 + b : b * 67108864 + a;

	const wa = new Vector3(), wb = new Vector3(), wc = new Vector3(), v0 = new Vector3(), v1 = new Vector3(), normal = new Vector3();
	const corners3 = [ new Vector3(), new Vector3(), new Vector3() ], faceNormal = new Vector3(), point = new Vector3(), tangent = new Vector3();
	const query = new Box3();

	for ( let t = 0; t < triangleCount; t ++ ) {

		const ia = triangles[ t * 3 ], ib = triangles[ t * 3 + 1 ], ic = triangles[ t * 3 + 2 ];

		if ( ids[ ia ] === ids[ ib ] || ids[ ib ] === ids[ ic ] || ids[ ic ] === ids[ ia ] ) continue;

		const corners = frameOf( t );

		if ( corners === null ) continue;

		const segments = [], covers = meshes.map( () => [] );

		for ( let k = 0; k < instances; k ++ ) {

			wa.fromArray( worlds[ k ], ia * 3 );
			wb.fromArray( worlds[ k ], ib * 3 );
			wc.fromArray( worlds[ k ], ic * 3 );

			v0.subVectors( wb, wa );
			v1.subVectors( wc, wa );
			normal.crossVectors( v0, v1 );

			// the denominator of the barycentric coordinates, d00 d11 - d01², from the cross product: the
			// difference cancels to zero or below for slivers

			const denominator = normal.lengthSq();

			if ( denominator === 0 ) continue;

			// back-sided materials receive light on the back of the faces

			normal.normalize().multiplyScalar( flips[ k ] );

			const d00 = v0.dot( v0 ), d01 = v0.dot( v1 ), d11 = v1.dot( v1 );

			// a point in the plane of the triangle to its frame, by its barycentric coordinates

			const toFrame = ( p ) => {

				const d20 = _c.subVectors( p, wa ).dot( v0 ), d21 = _c.dot( v1 );
				const v = ( d11 * d20 - d01 * d21 ) / denominator, w = ( d00 * d21 - d01 * d20 ) / denominator;

				return [ v * corners[ 2 ] + w * corners[ 4 ], v * corners[ 3 ] + w * corners[ 5 ] ];

			};

			const contact = ( triangle, triangleIndex ) => {

				corners3[ 0 ].copy( triangle.a );
				corners3[ 1 ].copy( triangle.b );
				corners3[ 2 ].copy( triangle.c );

				faceNormal.subVectors( corners3[ 1 ], corners3[ 0 ] ).cross( _c.subVectors( corners3[ 2 ], corners3[ 0 ] ) );

				const area = faceNormal.length();

				if ( area === 0 ) return;

				faceNormal.divideScalar( area );

				const d = corners3.map( ( p ) => normal.dot( _c.subVectors( p, wa ) ) );
				const lo = Math.min( ...d ), hi = Math.max( ...d );

				if ( lo > gap || hi < - tolerance ) return;

				const cosine = faceNormal.dot( normal );

				// faces that face the triangle, or are parallel to it in front of it, cover their outline

				if ( Math.abs( cosine ) > COVER_COSINE && hi <= gap && lo >= - tolerance && ( cosine < 0 || lo > tolerance ) ) {

					const cover = corners3.map( ( p, i ) => toFrame( point.copy( p ).addScaledVector( normal, - d[ i ] ) ) );

					covers[ k ].push( { points: cover, touching: hi <= tolerance } );

					for ( let i = 0; i < 3; i ++ ) segments.push( { p: cover[ i ], q: cover[ ( i + 1 ) % 3 ], side: 0, instance: k } );

					return;

				}

				// faces that cross the triangle, those within the tolerance count as crossing it

				const s = d.map( ( value ) => value > - tolerance && value < tolerance ? - tolerance : value );

				if ( ( s[ 0 ] > 0 ) === ( s[ 1 ] > 0 ) && ( s[ 1 ] > 0 ) === ( s[ 2 ] > 0 ) ) return;

				const ends = [];

				for ( let i = 0; i < 3; i ++ ) {

					const j = ( i + 1 ) % 3;

					if ( ( s[ i ] > 0 ) === ( s[ j ] > 0 ) ) continue;

					point.lerpVectors( corners3[ i ], corners3[ j ], s[ i ] / ( s[ i ] - s[ j ] ) );
					point.addScaledVector( normal, - normal.dot( _c.subVectors( point, wa ) ) );
					ends.push( toFrame( point ) );

				}

				// the inside is behind the face, against its normal along the triangle. Double-sided faces have none

				tangent.copy( faceNormal ).addScaledVector( normal, - cosine );

				const oneSided = sides.getX( sceneIndex !== null ? sceneIndex.getX( triangleIndex * 3 ) : triangleIndex * 3 ) > 0.5;
				let side = 0;

				if ( oneSided && tangent.lengthSq() > 1e-12 ) {

					const [ x, y ] = toFrame( point.copy( wa ).add( tangent ) );
					side = ( ends[ 1 ][ 0 ] - ends[ 0 ][ 0 ] ) * - y - ( ends[ 1 ][ 1 ] - ends[ 0 ][ 1 ] ) * - x > 0 ? 1 : - 1;

				}

				segments.push( { p: ends[ 0 ], q: ends[ 1 ], side, instance: k } );

			};

			query.setFromPoints( [ wa, wb, wc ] ).expandByScalar( gap + tolerance );

			bvh.shapecast( {
				intersectsBounds: ( box ) => box.intersectsBox( query ),
				intersectsTriangle: ( triangle, triangleIndex ) => {

					contact( triangle, triangleIndex );
					return false;

				}
			} );

		}

		// the segments within the triangle, with their ends on its edges snapped to them

		const clipped = [];

		for ( const segment of segments ) {

			// clipped at the edges themselves, so that the triangles on both sides find the same points on them

			if ( [ ...segment.p, ...segment.q ].every( Number.isFinite ) === false ) continue;

			const ends = clipToTriangle( corners, segment.p, segment.q, delta * 1e-6 );

			if ( ends === null ) continue;

			// short pieces stay, the neighbors share the points on the edges

			const [ p, q ] = ends.map( ( end ) => snapToEdges( corners, end, delta ) );

			if ( p.x === q.x && p.y === q.y ) continue;

			clipped.push( { ...segment, p, q } );

			for ( const end of [ p, q ] ) {

				for ( const [ e, u ] of end.edges ) {

					if ( u <= 0 || u >= 1 ) continue;

					const i = ids[ triangles[ t * 3 + e ] ], j = ids[ triangles[ t * 3 + ( e + 1 ) % 3 ] ];
					const key = edgeKey( i, j );

					if ( edgePoints.has( key ) === false ) edgePoints.set( key, { length: Math.hypot( corners[ ( ( e + 1 ) % 3 ) * 2 ] - corners[ e * 2 ], corners[ ( ( e + 1 ) % 3 ) * 2 + 1 ] - corners[ e * 2 + 1 ] ), values: [] } );

					edgePoints.get( key ).values.push( i < j ? u : 1 - u );

				}

			}

		}

		if ( clipped.length > 0 || covers.some( ( list ) => list.length > 0 ) ) cuts[ t ] = { segments: clipped, covers };

	}

	// the points on each edge, those closer than the tolerance merged

	const merged = new Map();

	for ( const [ key, { length, values } ] of edgePoints ) {

		const epsilon = delta / length;
		const list = [];

		values.sort( ( a, b ) => a - b );

		for ( const value of values ) {

			if ( value < epsilon || value > 1 - epsilon ) continue;
			if ( list.length > 0 && value - list[ list.length - 1 ] < epsilon ) continue;

			list.push( value );

		}

		if ( list.length > 0 ) merged.set( key, list );

	}

	// the triangulations of the triangles with cuts or points on their edges

	const recipes = [];
	const edgeVertices = new Map();
	let vertexCount = position.count;
	const output = [];
	const floodEdges = [];

	const edgeVertex = ( i, j, u ) => {

		// the vertex at u from the corner with the lower position id, so that it is the same at seams

		const [ a, b ] = ids[ i ] < ids[ j ] ? [ i, j ] : [ j, i ];
		const key = a + ',' + b + ',' + u;

		if ( edgeVertices.has( key ) === false ) {

			edgeVertices.set( key, vertexCount ++ );
			recipes.push( [ a, b, u ] );

		}

		return edgeVertices.get( key );

	};

	for ( let t = 0; t < triangleCount; t ++ ) {

		const corner = [ triangles[ t * 3 ], triangles[ t * 3 + 1 ], triangles[ t * 3 + 2 ] ];
		const cut = cuts[ t ];
		const lists = [ 0, 1, 2 ].map( ( e ) => {

			const i = ids[ corner[ e ] ], j = ids[ corner[ ( e + 1 ) % 3 ] ];
			const list = merged.get( edgeKey( i, j ) ) ?? [];

			return i < j ? list : list.map( ( u ) => 1 - u ).reverse();

		} );

		const corners = cut !== null || lists.some( ( list ) => list.length > 0 ) ? frameOf( t ) : null;

		if ( corners === null ) {

			output.push( { vertices: corner, group: triangleGroups[ t ], parent: t, centroid: null, votes: null } );
			continue;

		}

		// the points: corners, points on the edges, ends and crossings of the segments inside

		const points = [ ...corners ];
		const vertices = [ ...corner ];
		const boundary = [[], [], []];

		for ( let e = 0; e < 3; e ++ ) {

			const f = ( e + 1 ) % 3;

			boundary[ e ].push( { u: 0, id: e } );

			for ( const u of lists[ e ] ) {

				boundary[ e ].push( { u, id: points.length / 2 } );
				points.push( corners[ e * 2 ] + ( corners[ f * 2 ] - corners[ e * 2 ] ) * u, corners[ e * 2 + 1 ] + ( corners[ f * 2 + 1 ] - corners[ e * 2 + 1 ] ) * u );
				vertices.push( edgeVertex( corner[ e ], corner[ f ], ids[ corner[ e ] ] < ids[ corner[ f ] ] ? u : 1 - u ) );

			}

			boundary[ e ].push( { u: 1, id: f } );

		}

		const pointAt = ( x, y ) => {

			for ( let p = 3; p < points.length / 2; p ++ ) {

				if ( Math.hypot( points[ p * 2 ] - x, points[ p * 2 + 1 ] - y ) < delta ) return p;

			}

			points.push( x, y );
			vertices.push( - 1 );

			return points.length / 2 - 1;

		};

		const idOfEnd = ( end ) => {

			if ( end.edges.length === 0 ) return pointAt( end.x, end.y );

			const [ e, u ] = end.edges[ 0 ];
			let best = boundary[ e ][ 0 ];

			for ( const entry of boundary[ e ] ) if ( Math.abs( entry.u - u ) < Math.abs( best.u - u ) ) best = entry;

			return best.id;

		};

		// the segments between point ids, those along an edge vote for the triangle at it

		const segments = [], edgeVotes = [];

		for ( const segment of cut?.segments ?? [] ) {

			const a = idOfEnd( segment.p ), b = idOfEnd( segment.q );

			if ( a === b ) continue;

			const along = segment.p.edges.find( ( [ e ] ) => segment.q.edges.some( ( [ f ] ) => f === e ) );

			if ( along !== undefined ) {

				const e = along[ 0 ];
				const up = segment.p.edges.find( ( [ f ] ) => f === e )[ 1 ], uq = segment.q.edges.find( ( [ f ] ) => f === e )[ 1 ];

				edgeVotes.push( { e, from: Math.min( up, uq ), to: Math.max( up, uq ), side: uq > up ? segment.side : - segment.side, instance: segment.instance } );
				continue;

			}

			segments.push( { a, b, side: segment.side, instance: segment.instance } );

		}

		// the segments split where they cross each other or pass points

		const splits = segments.map( () => [] );

		for ( let i = 0; i < segments.length; i ++ ) {

			for ( let j = i + 1; j < segments.length; j ++ ) {

				const s = segments[ i ], r = segments[ j ];

				if ( s.a === r.a || s.a === r.b || s.b === r.a || s.b === r.b ) continue;

				const crossing = segmentCrossing( points, s.a, s.b, r.a, r.b );

				if ( crossing === null ) continue;

				const p = pointAt( crossing[ 0 ], crossing[ 1 ] );

				splits[ i ].push( p );
				splits[ j ].push( p );

			}

		}

		const pieces = new Map();

		segments.forEach( ( segment, i ) => {

			const { a, b } = segment;
			const ax = points[ a * 2 ], ay = points[ a * 2 + 1 ], dx = points[ b * 2 ] - ax, dy = points[ b * 2 + 1 ] - ay;
			const lengthSq = dx * dx + dy * dy;
			const on = [];

			for ( let p = 0; p < points.length / 2; p ++ ) {

				if ( p === a || p === b ) continue;

				const u = ( ( points[ p * 2 ] - ax ) * dx + ( points[ p * 2 + 1 ] - ay ) * dy ) / lengthSq;

				if ( u <= 0 || u >= 1 ) continue;

				if ( Math.abs( ( points[ p * 2 ] - ax ) * dy - ( points[ p * 2 + 1 ] - ay ) * dx ) / Math.sqrt( lengthSq ) < delta || splits[ i ].includes( p ) ) on.push( [ u, p ] );

			}

			on.sort( ( x, y ) => x[ 0 ] - y[ 0 ] );

			const chain = [ a, ...on.map( ( entry ) => entry[ 1 ] ), b ];

			for ( let c = 0; c + 1 < chain.length; c ++ ) {

				const p = chain[ c ], q = chain[ c + 1 ];

				if ( p === q ) continue;

				const key = Math.min( p, q ) + ',' + Math.max( p, q );

				if ( pieces.has( key ) === false ) pieces.set( key, { a: Math.min( p, q ), b: Math.max( p, q ), votes: [] } );

				// the side relative to the lower id to the higher one

				const length = Math.hypot( points[ q * 2 ] - points[ p * 2 ], points[ q * 2 + 1 ] - points[ p * 2 + 1 ] );

				pieces.get( key ).votes.push( { side: p < q ? segment.side : - segment.side, instance: segment.instance, length } );

			}

		} );

		const triangulation = triangulateConstrained( points, [ ...pieces.values() ].map( ( piece ) => [ piece.a, piece.b ] ) );

		// the vertices of the points inside, interpolated over the triangle

		for ( let p = 3; p < points.length / 2; p ++ ) {

			if ( vertices[ p ] >= 0 ) continue;

			const [ u, v, w ] = barycentric2D( corners, points[ p * 2 ], points[ p * 2 + 1 ] );

			vertices[ p ] = vertexCount ++;
			recipes.push( [ corner[ 0 ], corner[ 1 ], corner[ 2 ], u, v, w ] );

		}

		for ( const [ a, b, c ] of triangulation ) {

			const votes = new Float64Array( instances );
			let voted = false;

			for ( const [ p, q, r ] of [[ a, b, c ], [ b, c, a ], [ c, a, b ]] ) {

				// the segments along the edges of the triangle

				const piece = pieces.get( Math.min( p, q ) + ',' + Math.max( p, q ) );

				if ( piece !== undefined ) {

					const o = orient2D( points, piece.a, piece.b, r ) > 0 ? 1 : - 1;

					for ( const vote of piece.votes ) {

						if ( vote.side === 0 ) continue;

						votes[ vote.instance ] += vote.side === o ? vote.length : - vote.length;
						voted = true;

					}

					if ( piece.votes.some( ( vote ) => vote.side !== 0 ) ) floodEdges.push( [ vertices[ p ], vertices[ q ] ] );

				}

				// the segments along the edges of the parent triangle

				for ( const vote of edgeVotes ) {

					const entries = boundary[ vote.e ];
					const ip = entries.findIndex( ( entry ) => entry.id === p ), iq = entries.findIndex( ( entry ) => entry.id === q );

					if ( ip < 0 || iq !== ip + 1 ) continue;

					const middle = ( entries[ ip ].u + entries[ iq ].u ) / 2;

					if ( middle < vote.from || middle > vote.to || vote.side === 0 ) continue;

					const length = ( entries[ iq ].u - entries[ ip ].u ) * Math.hypot( corners[ ( ( vote.e + 1 ) % 3 ) * 2 ] - corners[ vote.e * 2 ], corners[ ( ( vote.e + 1 ) % 3 ) * 2 + 1 ] - corners[ vote.e * 2 + 1 ] );

					votes[ vote.instance ] += vote.side > 0 ? length : - length;
					voted = true;
					floodEdges.push( [ vertices[ p ], vertices[ q ] ] );

				}

			}

			const centroid = [ ( points[ a * 2 ] + points[ b * 2 ] + points[ c * 2 ] ) / 3, ( points[ a * 2 + 1 ] + points[ b * 2 + 1 ] + points[ c * 2 + 1 ] ) / 3 ];

			output.push( { vertices: [ vertices[ a ], vertices[ b ], vertices[ c ] ], group: triangleGroups[ t ], parent: t, centroid, votes: voted ? votes : null } );

		}

	}

	// the attributes of the new vertices

	const attributes = {};

	for ( const name in geometry.attributes ) {

		if ( name === 'inside' ) continue;

		const attribute = geometry.attributes[ name ];
		const itemSize = attribute.itemSize;
		const array = new attribute.array.constructor( vertexCount * itemSize );
		const integer = ( array instanceof Float32Array || array instanceof Float64Array ) === false && attribute.normalized === false;
		const result = new BufferAttribute( array, itemSize, attribute.normalized );

		for ( let i = 0; i < attribute.count; i ++ ) for ( let c = 0; c < itemSize; c ++ ) result.setComponent( i, c, attribute.getComponent( i, c ) );

		recipes.forEach( ( recipe, r ) => {

			const k = attribute.count + r;

			for ( let c = 0; c < itemSize; c ++ ) {

				const value = recipe.length === 3
					? attribute.getComponent( recipe[ 0 ], c ) * ( 1 - recipe[ 2 ] ) + attribute.getComponent( recipe[ 1 ], c ) * recipe[ 2 ]
					: attribute.getComponent( recipe[ 0 ], c ) * recipe[ 3 ] + attribute.getComponent( recipe[ 1 ], c ) * recipe[ 4 ] + attribute.getComponent( recipe[ 2 ], c ) * recipe[ 5 ];

				result.setComponent( k, c, integer ? Math.round( value ) : value );

			}

			if ( ( name === 'normal' || name === 'tangent' ) && itemSize >= 3 ) {

				_a.fromBufferAttribute( result, k ).normalize();
				result.setXYZ( k, _a.x, _a.y, _a.z );

			}

		} );

		attributes[ name ] = result;

	}

	// the regions between the lines that vote, which spread across the edges of the triangles

	const newPosition = attributes.position;
	for ( let i = position.count; i < vertexCount; i ++ ) ids.push( idOf( newPosition.getX( i ), newPosition.getY( i ), newPosition.getZ( i ) ) );

	const blocked = new Set( floodEdges.map( ( [ a, b ] ) => edgeKey( ids[ a ], ids[ b ] ) ) );
	const parentOf = new Int32Array( output.length ).map( ( value, i ) => i );

	const find = ( i ) => {

		while ( parentOf[ i ] !== i ) i = parentOf[ i ] = parentOf[ parentOf[ i ] ];

		return i;

	};

	const owners = new Map();

	output.forEach( ( triangle, f ) => {

		for ( let c = 0; c < 3; c ++ ) {

			const key = edgeKey( ids[ triangle.vertices[ c ] ], ids[ triangle.vertices[ ( c + 1 ) % 3 ] ] );

			if ( blocked.has( key ) ) continue;

			if ( owners.has( key ) ) parentOf[ find( f ) ] = find( owners.get( key ) );
			else owners.set( key, f );

		}

	} );

	const regionVotes = new Map();

	output.forEach( ( triangle, f ) => {

		if ( triangle.votes === null ) return;

		const region = find( f );

		if ( regionVotes.has( region ) === false ) regionVotes.set( region, new Float64Array( instances ) );

		const sum = regionVotes.get( region );
		for ( let k = 0; k < instances; k ++ ) sum[ k ] += triangle.votes[ k ];

	} );

	// the state of each triangle in all meshes of the geometry: 2 inside, where its region is or a face rests on
	// it, 1 covered by a face in front of it, which is baked but keeps its own vertices since it can show, e.g.
	// through the gap behind a banner, and 0 outside

	let changed = 0;

	const states = output.map( ( triangle, f ) => {

		const votes = regionVotes.get( find( f ) );
		const cut = cuts[ triangle.parent ];
		let centroid = triangle.centroid;
		let state = 2;

		for ( let k = 0; k < instances && state > 0; k ++ ) {

			if ( votes !== undefined && votes[ k ] > 0 ) continue;

			if ( cut === null || cut.covers[ k ].length === 0 ) return 0;

			if ( centroid === null ) {

				const corners = frameOf( triangle.parent );

				if ( corners === null ) return 0;

				centroid = [ ( corners[ 0 ] + corners[ 2 ] + corners[ 4 ] ) / 3, ( corners[ 1 ] + corners[ 3 ] + corners[ 5 ] ) / 3 ];

			}

			let covered = 0;

			for ( const cover of cut.covers[ k ] ) {

				if ( insideTriangle2D( cover.points, centroid[ 0 ], centroid[ 1 ] ) ) covered = Math.max( covered, cover.touching ? 2 : 1 );

			}

			state = Math.min( state, covered );

		}

		if ( state > 0 ) changed ++;

		return state;

	} );

	// a triangle that the lines vote inside must also look inside: over it, most rays hit the back of a
	// one-sided face or a face resting on it. Where the lines around a region do not close, its votes spread
	// over all of it, e.g. over a terrace that a coping stone rests on: what does not look inside is covered,
	// so it is baked, with its own vertices

	const ray = new Ray(), up = new Vector3(), across = new Vector3(), along = new Vector3();
	const rays = 8;

	output.forEach( ( triangle, f ) => {

		if ( states[ f ] !== 2 ) return;

		for ( let k = 0; k < instances; k ++ ) {

			const matrix = meshes[ k ].matrixWorld;

			la.fromBufferAttribute( newPosition, triangle.vertices[ 0 ] ).applyMatrix4( matrix );
			lb.fromBufferAttribute( newPosition, triangle.vertices[ 1 ] ).applyMatrix4( matrix );
			lc.fromBufferAttribute( newPosition, triangle.vertices[ 2 ] ).applyMatrix4( matrix );
			up.subVectors( lb, la ).cross( e1.subVectors( lc, la ) );

			if ( up.lengthSq() < 1e-30 ) continue;

			up.normalize().multiplyScalar( flips[ k ] );
			ray.origin.copy( la ).add( lb ).add( lc ).divideScalar( 3 ).addScaledVector( up, tolerance * 0.01 );
			across.set( Math.abs( up.x ) < 0.9 ? 1 : 0, Math.abs( up.x ) < 0.9 ? 0 : 1, 0 ).cross( up ).normalize();
			along.crossVectors( up, across );

			// cosine-distributed directions, stratified, turned by the triangle

			const turn = ( Math.imul( f, 2654435761 ) >>> 0 ) / 4294967296;
			let blocked = 0, open = 0;

			for ( let r = 0; r < rays && blocked * 2 < rays && open * 2 <= rays; r ++ ) {

				const u = ( r + 0.5 ) / rays, phi = 2 * Math.PI * ( ( r * 0.618034 + turn ) % 1 ), radius = Math.sqrt( u );

				ray.direction.copy( across ).multiplyScalar( radius * Math.cos( phi ) ).addScaledVector( along, radius * Math.sin( phi ) ).addScaledVector( up, Math.sqrt( 1 - u ) );

				const hit = bvh.raycastFirst( ray, DoubleSide );
				const oneSided = hit !== null && sides.getX( sceneIndex !== null ? sceneIndex.getX( hit.faceIndex * 3 ) : hit.faceIndex * 3 ) > 0.5;

				if ( hit !== null && ( hit.distance < tolerance * 10 || ( oneSided && hit.face.normal.dot( ray.direction ) > 0 ) ) ) blocked ++;
				else open ++;

			}

			if ( open * 2 > rays ) {

				states[ f ] = 1;
				break;

			}

		}

	} );

	if ( recipes.length === 0 && changed === 0 ) return geometry;

	// the vertices of triangles in different states get a copy for each state but the first

	const used = new Uint8Array( vertexCount );

	output.forEach( ( triangle, f ) => {

		for ( const v of triangle.vertices ) used[ v ] |= 1 << states[ f ];

	} );

	const kept = new Uint8Array( vertexCount );
	const copies = new Map();
	let total = vertexCount;

	for ( let v = 0; v < vertexCount; v ++ ) {

		let first = - 1;

		for ( let state = 0; state < 3; state ++ ) {

			if ( ( used[ v ] & ( 1 << state ) ) === 0 ) continue;

			if ( first < 0 ) first = state;
			else copies.set( v * 3 + state, total ++ );

		}

		kept[ v ] = Math.max( first, 0 );

	}

	const result = new BufferGeometry();

	for ( const name in attributes ) {

		const attribute = attributes[ name ];
		const itemSize = attribute.itemSize;
		const array = new attribute.array.constructor( total * itemSize );

		array.set( attribute.array );

		for ( const [ key, copy ] of copies ) {

			const v = Math.floor( key / 3 );
			array.copyWithin( copy * itemSize, v * itemSize, ( v + 1 ) * itemSize );

		}

		result.setAttribute( name, new BufferAttribute( array, itemSize, attribute.normalized ) );

	}

	const insideArray = new Float32Array( total );
	for ( let v = 0; v < vertexCount; v ++ ) insideArray[ v ] = kept[ v ] / 2;
	for ( const [ key, copy ] of copies ) insideArray[ copy ] = ( key % 3 ) / 2;

	result.setAttribute( 'inside', new BufferAttribute( insideArray, 1 ) );

	const indices = [];

	groups.forEach( ( group, g ) => {

		const start = indices.length;

		output.forEach( ( triangle, f ) => {

			if ( triangle.group !== g ) return;

			for ( const v of triangle.vertices ) indices.push( states[ f ] === kept[ v ] ? v : copies.get( v * 3 + states[ f ] ) );

		} );

		if ( geometry.groups.length > 0 ) result.addGroup( start, indices.length - start, group.materialIndex );

	} );

	result.setIndex( indices );
	result.name = geometry.name;
	result.userData = { ...geometry.userData };

	return result;

}

// clips a segment to a counterclockwise triangle grown by a margin, null if it misses it

function clipToTriangle( corners, p, q, margin ) {

	let t0 = 0, t1 = 1;

	for ( let e = 0; e < 3; e ++ ) {

		const f = ( e + 1 ) % 3;
		const ax = corners[ e * 2 ], ay = corners[ e * 2 + 1 ];
		const length = Math.hypot( corners[ f * 2 ] - ax, corners[ f * 2 + 1 ] - ay );
		const nx = - ( corners[ f * 2 + 1 ] - ay ) / length, ny = ( corners[ f * 2 ] - ax ) / length;
		const fp = nx * ( p[ 0 ] - ax ) + ny * ( p[ 1 ] - ay ) + margin;
		const fq = nx * ( q[ 0 ] - ax ) + ny * ( q[ 1 ] - ay ) + margin;

		if ( fp < 0 && fq < 0 ) return null;

		if ( fp < 0 ) t0 = Math.max( t0, fp / ( fp - fq ) );
		else if ( fq < 0 ) t1 = Math.min( t1, fp / ( fp - fq ) );

	}

	if ( t1 <= t0 ) return null;

	return [ t0, t1 ].map( ( t ) => [ p[ 0 ] + ( q[ 0 ] - p[ 0 ] ) * t, p[ 1 ] + ( q[ 1 ] - p[ 1 ] ) * t ] );

}

// a point outside a triangle or within a distance of its edges moved onto them, with the edges and the
// positions along them, a corner is on two edges

function snapToEdges( corners, [ x, y ], distance ) {

	let best = null, outside = false;

	for ( let e = 0; e < 3; e ++ ) {

		const f = ( e + 1 ) % 3;
		const ax = corners[ e * 2 ], ay = corners[ e * 2 + 1 ], dx = corners[ f * 2 ] - ax, dy = corners[ f * 2 + 1 ] - ay;
		const length = Math.hypot( dx, dy );
		const u = Math.min( Math.max( ( ( x - ax ) * dx + ( y - ay ) * dy ) / ( length * length ), 0 ), 1 );
		const away = Math.hypot( ax + dx * u - x, ay + dy * u - y );

		if ( ( y - ay ) * dx - ( x - ax ) * dy < 0 ) outside = true;
		if ( best === null || away < best.away ) best = { e, u, away, length };

	}

	if ( outside === false && best.away > distance ) return { x, y, edges: [] };

	const { e, length } = best;
	const f = ( e + 1 ) % 3;
	const u = best.u * length < distance ? 0 : ( 1 - best.u ) * length < distance ? 1 : best.u;
	const edges = [[ e, u ]];

	if ( u === 0 ) edges.push( [ ( e + 2 ) % 3, 1 ] );
	else if ( u === 1 ) edges.push( [ f, 0 ] );

	return { x: corners[ e * 2 ] + ( corners[ f * 2 ] - corners[ e * 2 ] ) * u, y: corners[ e * 2 + 1 ] + ( corners[ f * 2 + 1 ] - corners[ e * 2 + 1 ] ) * u, edges };

}

function orient2D( points, a, b, c ) {

	return ( points[ b * 2 ] - points[ a * 2 ] ) * ( points[ c * 2 + 1 ] - points[ a * 2 + 1 ] ) - ( points[ b * 2 + 1 ] - points[ a * 2 + 1 ] ) * ( points[ c * 2 ] - points[ a * 2 ] );

}

// the point where two segments cross each other between their ends, or null

function segmentCrossing( points, a, b, c, d ) {

	const ax = points[ a * 2 ], ay = points[ a * 2 + 1 ], rx = points[ b * 2 ] - ax, ry = points[ b * 2 + 1 ] - ay;
	const cx = points[ c * 2 ], cy = points[ c * 2 + 1 ], sx = points[ d * 2 ] - cx, sy = points[ d * 2 + 1 ] - cy;
	const denominator = rx * sy - ry * sx;

	if ( Math.abs( denominator ) <= 1e-12 * Math.hypot( rx, ry ) * Math.hypot( sx, sy ) ) return null;

	const t = ( ( cx - ax ) * sy - ( cy - ay ) * sx ) / denominator;
	const u = ( ( cx - ax ) * ry - ( cy - ay ) * rx ) / denominator;

	if ( t <= 0 || t >= 1 || u <= 0 || u >= 1 ) return null;

	return [ ax + rx * t, ay + ry * t ];

}

function barycentric2D( corners, x, y ) {

	const [ ax, ay, bx, by, cx, cy ] = corners;
	const determinant = ( by - cy ) * ( ax - cx ) + ( cx - bx ) * ( ay - cy );
	const u = ( ( by - cy ) * ( x - cx ) + ( cx - bx ) * ( y - cy ) ) / determinant;
	const v = ( ( cy - ay ) * ( x - cx ) + ( ax - cx ) * ( y - cy ) ) / determinant;

	return [ u, v, 1 - u - v ];

}

function insideTriangle2D( [ a, b, c ], x, y ) {

	const o = ( p, q ) => ( q[ 0 ] - p[ 0 ] ) * ( y - p[ 1 ] ) - ( q[ 1 ] - p[ 1 ] ) * ( x - p[ 0 ] );
	const o0 = o( a, b ), o1 = o( b, c ), o2 = o( c, a );

	return ( o0 >= 0 && o1 >= 0 && o2 >= 0 ) || ( o0 <= 0 && o1 <= 0 && o2 <= 0 );

}

// a constrained Delaunay triangulation of points in a counterclockwise triangle, its first three points,
// the others on its edges or inside. Constraints that can not be recovered are left out

function triangulateConstrained( points, constraints ) {

	const n = points.length / 2;
	let extent = 0;

	for ( let i = 0; i < points.length; i ++ ) extent = Math.max( extent, Math.abs( points[ i ] - points[ i % 2 ] ) );

	const epsilon = 1e-10 * extent * extent;
	const circleEpsilon = 1e-10 * extent ** 4;
	const orient = ( a, b, c ) => orient2D( points, a, b, c );

	const inCircle = ( a, b, c, d ) => {

		const dx = points[ d * 2 ], dy = points[ d * 2 + 1 ];
		const adx = points[ a * 2 ] - dx, ady = points[ a * 2 + 1 ] - dy;
		const bdx = points[ b * 2 ] - dx, bdy = points[ b * 2 + 1 ] - dy;
		const cdx = points[ c * 2 ] - dx, cdy = points[ c * 2 + 1 ] - dy;

		return ( adx * adx + ady * ady ) * ( bdx * cdy - cdx * bdy ) - ( bdx * bdx + bdy * bdy ) * ( adx * cdy - cdx * ady ) + ( cdx * cdx + cdy * cdy ) * ( adx * bdy - bdx * ady );

	};

	const triangles = [];
	const edges = new Map();
	const constrained = new Set();

	const add = ( a, b, c ) => {

		const t = triangles.length;

		triangles.push( [ a, b, c ] );
		edges.set( a * n + b, t );
		edges.set( b * n + c, t );
		edges.set( c * n + a, t );

	};

	const remove = ( t ) => {

		const [ a, b, c ] = triangles[ t ];

		for ( const key of [ a * n + b, b * n + c, c * n + a ] ) if ( edges.get( key ) === t ) edges.delete( key );

		triangles[ t ] = null;

	};

	const third = ( t, a, b ) => triangles[ t ].find( ( v ) => v !== a && v !== b );

	// flips the edge between two triangles if their quad is convex

	const flip = ( u, v, test ) => {

		const t1 = edges.get( u * n + v ), t2 = edges.get( v * n + u );

		if ( t1 === undefined || t2 === undefined ) return false;

		const w1 = third( t1, u, v ), w2 = third( t2, v, u );
		const su = orient( w2, w1, u ), sv = orient( w2, w1, v );

		if ( ( su > epsilon && sv < - epsilon ) === false && ( su < - epsilon && sv > epsilon ) === false ) return false;
		if ( test && inCircle( u, v, w1, w2 ) <= circleEpsilon ) return false;

		remove( t1 );
		remove( t2 );
		add( w1, u, w2 );
		add( w2, v, w1 );

		return true;

	};

	const interiorEdges = () => {

		const list = [];

		for ( const key of edges.keys() ) {

			const u = Math.floor( key / n ), v = key % n;

			if ( u < v && edges.has( v * n + u ) && constrained.has( u * n + v ) === false ) list.push( [ u, v ] );

		}

		return list;

	};

	const delaunay = () => {

		for ( let pass = 0; pass < 4 * n + 8; pass ++ ) {

			let flips = 0;

			for ( const [ u, v ] of interiorEdges() ) if ( flip( u, v, true ) ) flips ++;

			if ( flips === 0 ) break;

		}

	};

	// the points one by one into the triangle that holds them

	add( 0, 1, 2 );

	for ( let p = 3; p < n; p ++ ) {

		for ( let t = 0; t < triangles.length; t ++ ) {

			if ( triangles[ t ] === null ) continue;

			const [ a, b, c ] = triangles[ t ];
			const o = [ orient( a, b, p ), orient( b, c, p ), orient( c, a, p ) ];

			if ( o.some( ( value ) => value < - epsilon ) ) continue;

			const zero = o.map( ( value ) => Math.abs( value ) <= epsilon );

			if ( zero.filter( Boolean ).length >= 2 ) break;

			const e = zero.indexOf( true );

			if ( e < 0 ) {

				remove( t );
				add( a, b, p );
				add( b, c, p );
				add( c, a, p );

			} else {

				const [ u, v, w ] = e === 0 ? [ a, b, c ] : e === 1 ? [ b, c, a ] : [ c, a, b ];
				const other = edges.get( v * n + u );

				remove( t );
				add( u, p, w );
				add( p, v, w );

				if ( other !== undefined ) {

					const z = third( other, v, u );

					remove( other );
					add( v, p, z );
					add( p, u, z );

				}

			}

			break;

		}

	}

	delaunay();

	// the constraints, by flipping the edges that cross them

	const crosses = ( a, b, u, v ) => {

		const oa = orient( u, v, a ), ob = orient( u, v, b ), ou = orient( a, b, u ), ov = orient( a, b, v );

		return ( ( oa > epsilon && ob < - epsilon ) || ( oa < - epsilon && ob > epsilon ) ) && ( ( ou > epsilon && ov < - epsilon ) || ( ou < - epsilon && ov > epsilon ) );

	};

	for ( const [ a, b ] of constraints ) {

		for ( let guard = 0; guard < 4 * n + 8 && edges.has( a * n + b ) === false && edges.has( b * n + a ) === false; guard ++ ) {

			let flipped = false;

			for ( const [ u, v ] of interiorEdges() ) {

				if ( u === a || u === b || v === a || v === b || crosses( a, b, u, v ) === false ) continue;

				if ( flip( u, v, false ) ) flipped = true;

			}

			if ( flipped === false ) break;

		}

		if ( edges.has( a * n + b ) || edges.has( b * n + a ) ) constrained.add( Math.min( a, b ) * n + Math.max( a, b ) );

	}

	delaunay();

	return triangles.filter( ( triangle ) => triangle !== null );

}

/**
 * Reads light maps back from the GPU, e.g. the ones of {@link LightBaker#process}, for
 * {@link refineByLightMap} and {@link projectLightMaps}.
 *
 * @async
 * @param {WebGPURenderer} renderer - The renderer.
 * @param {Array<Texture>} textures - The light maps, one per page.
 * @return {Promise<Array<{width: number, height: number, data: Float32Array}>>} A promise that resolves with the RGBA texels of the light maps.
 */
async function readLightMaps( renderer, textures ) {

	const maps = [];

	for ( const map of textures ) {

		const { width, height } = map.image;
		const target = new RenderTarget( width, height, { type: FloatType, depthBuffer: false } );
		const material = new NodeMaterial();
		material.fragmentNode = vec4( texture( map ).load( ivec2( screenCoordinate.xy ) ).rgb, 1 );
		const quad = new QuadMesh( material );

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		renderer.setRenderTarget( target );
		quad.render( renderer );

		RendererUtils.restoreRendererState( renderer, _rendererState );

		const data = await renderer.readRenderTargetPixelsAsync( target, 0, 0, width, height );

		target.dispose();
		material.dispose();

		maps.push( { width, height, data: new Float32Array( data ) } );

	}

	return maps;

}

// the luminance of a light map, bilinear at light map UVs, and its mean over the lit texels

function sampleLightMap( map, u, v ) {

	const { width, height, data } = map;
	const x = u * width - 0.5, y = v * height - 0.5;
	const x0 = Math.max( 0, Math.min( width - 1, Math.floor( x ) ) ), y0 = Math.max( 0, Math.min( height - 1, Math.floor( y ) ) );
	const x1 = Math.min( width - 1, x0 + 1 ), y1 = Math.min( height - 1, y0 + 1 );
	const fx = Math.max( 0, Math.min( 1, x - x0 ) ), fy = Math.max( 0, Math.min( 1, y - y0 ) );
	const at = ( px, py ) => {

		const o = ( py * width + px ) * 4;
		return 0.2126 * data[ o ] + 0.7152 * data[ o + 1 ] + 0.0722 * data[ o + 2 ];

	};

	return ( at( x0, y0 ) * ( 1 - fx ) + at( x1, y0 ) * fx ) * ( 1 - fy ) + ( at( x0, y1 ) * ( 1 - fx ) + at( x1, y1 ) * fx ) * fy;

}

function meanLight( map ) {

	if ( map.mean !== undefined ) return map.mean;

	let sum = 0, count = 0;

	for ( let t = 0; t < map.width * map.height; t ++ ) {

		const light = 0.2126 * map.data[ t * 4 ] + 0.7152 * map.data[ t * 4 + 1 ] + 0.0722 * map.data[ t * 4 + 2 ];

		if ( light > 0 ) {

			sum += light;
			count ++;

		}

	}

	map.mean = count > 0 ? sum / count : 0;

	return map.mean;

}

/**
 * Splits the edges of geometries with light map UVs where the light of a light map at the midpoint of
 * an edge differs from the mean of its ends: the error of the linear interpolation that a vertex at the
 * midpoint removes. Each round splits the edges once, down to a minimum length. Meshes that share a
 * geometry share the splits of all of them.
 *
 * @param {Array<{geometry: BufferGeometry, meshes: Array<Mesh>}>} groups - The geometries to split, with light map UVs in `uv1`, each with the meshes that use it.
 * @param {Array<{width: number, height: number, data: Float32Array}>} lightMaps - The light maps, see {@link readLightMaps}, by `mesh.userData.lightMapPage`.
 * @param {Object} options - The options.
 * @param {number} options.minEdgeLength - Edges of at most this length in world units are not split.
 * @param {number} [options.rounds=1] - The number of rounds.
 * @param {number} [options.threshold=0.05] - The difference at the midpoint that splits an edge, relative to the brighter end, or to a twentieth of the mean light for dark ends.
 * @return {Array<BufferGeometry>} The geometries of the groups, split or as they were.
 */
function refineByLightMap( groups, lightMaps, { minEdgeLength, rounds = 1, threshold = 0.05 } = {} ) {

	const geometries = groups.map( ( group ) => group.geometry );
	const minSq = minEdgeLength * minEdgeLength;

	for ( let round = 0; round < rounds; round ++ ) {

		let split = false;

		for ( let g = 0; g < groups.length; g ++ ) {

			const geometry = geometries[ g ];
			const uv = geometry.getAttribute( 'uv1' );

			if ( uv === undefined ) continue;

			const maps = groups[ g ].meshes.map( ( mesh ) => lightMaps[ mesh.userData.lightMapPage ?? 0 ] );
			const values = maps.map( ( map ) => {

				const light = new Float32Array( uv.count );
				for ( let i = 0; i < uv.count; i ++ ) light[ i ] = sampleLightMap( map, uv.getX( i ), uv.getY( i ) );
				return light;

			} );

			const refined = subdivideGeometry( geometry, 0, { matrix: groups[ g ].meshes[ 0 ].matrixWorld, rounds: 1, split: ( i, j, lengthSq ) => {

				if ( lengthSq <= minSq ) return false;

				return maps.some( ( map, m ) => {

					const a = values[ m ][ i ], b = values[ m ][ j ];
					const middle = sampleLightMap( map, ( uv.getX( i ) + uv.getX( j ) ) / 2, ( uv.getY( i ) + uv.getY( j ) ) / 2 );

					return Math.abs( middle - ( a + b ) / 2 ) > threshold * Math.max( a, b, 0.05 * meanLight( map ) );

				} );

			} } );

			if ( refined !== geometry ) {

				geometries[ g ] = refined;
				split = true;

			}

		}

		if ( split === false ) break;

	}

	return geometries;

}

/**
 * Splits the edges of geometries with light map UVs where the vertices show a light map worst: every
 * round projects the light map onto the vertices, see {@link projectLightMaps}, compares the linear
 * interpolation of the vertices with the light map over the texels of each triangle, and splits the
 * longest edge of the triangles whose mean error is above a threshold. Splitting the longest edge also
 * shortens long, thin triangles, which can not show light that changes across them. The neighbours split
 * their longest edges too, see the `longest` option of {@link subdivideGeometry}, so the refinement grades
 * into the triangles around it. Meshes that share a geometry share the splits of all of them.
 *
 * @param {Array<{geometry: BufferGeometry, meshes: Array<Mesh>}>} groups - The geometries to split, with light map UVs in `uv1`, each with the meshes that use it.
 * @param {Array<{width: number, height: number, data: Float32Array}>} lightMaps - The light maps, see {@link readLightMaps}, by `mesh.userData.lightMapPage`.
 * @param {Object} options - The options.
 * @param {number} options.minEdgeLength - Edges of at most this length in world units are not split.
 * @param {number} [options.rounds=1] - The number of rounds.
 * @param {number} [options.threshold=0.02] - The mean error over the texels of a triangle that splits it, relative to the light map, or to a tenth of the mean light for dark texels.
 * @return {Array<BufferGeometry>} The geometries of the groups, split or as they were.
 */
function refineByLightMapError( groups, lightMaps, { minEdgeLength, rounds = 1, threshold = 0.02 } = {} ) {

	const geometries = groups.map( ( group ) => group.geometry );
	const minSq = minEdgeLength * minEdgeLength;
	const lum = ( data, o ) => 0.2126 * data[ o ] + 0.7152 * data[ o + 1 ] + 0.0722 * data[ o + 2 ];

	for ( let round = 0; round < rounds; round ++ ) {

		// the light of the vertices of the current geometries

		const meshes = [], geometryOf = new Map();

		groups.forEach( ( group, g ) => {

			for ( const mesh of group.meshes ) {

				meshes.push( mesh );
				geometryOf.set( mesh, geometries[ g ] );

			}

		} );

		const layout = new VertexLayout( meshes, { geometries: geometryOf } );
		const { irradiance } = projectLightMaps( layout, lightMaps );
		let split = false;

		for ( let g = 0; g < groups.length; g ++ ) {

			const geometry = geometries[ g ];
			const uv = geometry.getAttribute( 'uv1' );
			const inside = geometry.getAttribute( 'inside' );

			if ( uv === undefined ) continue;

			const indices = triangleIndices( geometry );
			const count = geometry.getAttribute( 'position' ).count;
			const marked = new Set();

			for ( const mesh of groups[ g ].meshes ) {

				const map = lightMaps[ mesh.userData.lightMapPage ?? 0 ];
				const { width, height, data } = map;
				const floor = 0.1 * meanLight( map );
				const { positions } = worldVertices( geometry, mesh.matrixWorld );
				const light = ( v ) => {

					const r = layout.getRecord( mesh, 0, v );
					return r >= 0 ? 0.2126 * irradiance[ r * 3 ] + 0.7152 * irradiance[ r * 3 + 1 ] + 0.0722 * irradiance[ r * 3 + 2 ] : 0;

				};

				for ( let t = 0; t < indices.length; t += 3 ) {

					const i = indices[ t ], j = indices[ t + 1 ], k = indices[ t + 2 ];

					if ( isInside( inside, i, j, k ) ) continue;

					const li = light( i ), lj = light( j ), lk = light( k );

					// the error over the texel centers in the triangle

					const x0 = uv.getX( i ) * width, y0 = uv.getY( i ) * height;
					const x1 = uv.getX( j ) * width, y1 = uv.getY( j ) * height;
					const x2 = uv.getX( k ) * width, y2 = uv.getY( k ) * height;
					const determinant = ( x1 - x0 ) * ( y2 - y0 ) - ( x2 - x0 ) * ( y1 - y0 );

					if ( Math.abs( determinant ) < 1e-12 ) continue;

					const minX = Math.max( 0, Math.floor( Math.min( x0, x1, x2 ) ) ), maxX = Math.min( width - 1, Math.ceil( Math.max( x0, x1, x2 ) ) );
					const minY = Math.max( 0, Math.floor( Math.min( y0, y1, y2 ) ) ), maxY = Math.min( height - 1, Math.ceil( Math.max( y0, y1, y2 ) ) );
					let error = 0, texels = 0;

					for ( let y = minY; y <= maxY; y ++ ) {

						for ( let x = minX; x <= maxX; x ++ ) {

							const b1 = ( ( x + 0.5 - x0 ) * ( y2 - y0 ) - ( x2 - x0 ) * ( y + 0.5 - y0 ) ) / determinant;
							const b2 = ( ( x1 - x0 ) * ( y + 0.5 - y0 ) - ( x + 0.5 - x0 ) * ( y1 - y0 ) ) / determinant;

							if ( b1 < 0 || b2 < 0 || b1 + b2 > 1 ) continue;

							const truth = lum( data, ( y * width + x ) * 4 );
							error += Math.abs( li * ( 1 - b1 - b2 ) + lj * b1 + lk * b2 - truth ) / Math.max( truth, floor );
							texels ++;

						}

					}

					if ( texels === 0 || error / texels <= threshold ) continue;

					// the longest edge in world space

					let longest = - 1, a = 0, b = 0;

					for ( const [ p, q ] of [[ i, j ], [ j, k ], [ k, i ]] ) {

						const lengthSq = _a.fromArray( positions, p * 3 ).distanceToSquared( _b.fromArray( positions, q * 3 ) );

						if ( lengthSq > longest ) {

							longest = lengthSq;
							a = p;
							b = q;

						}

					}

					if ( longest > minSq ) marked.add( a < b ? a * count + b : b * count + a );

				}

			}

			if ( marked.size === 0 ) continue;

			const refined = subdivideGeometry( geometry, 0, { matrix: groups[ g ].meshes[ 0 ].matrixWorld, rounds: 1, longest: true, split: ( i, j ) => marked.has( i < j ? i * count + j : j * count + i ) } );

			if ( refined !== geometry ) {

				geometries[ g ] = refined;
				split = true;

			}

		}

		layout.dispose();

		if ( split === false ) break;

	}

	return geometries;

}

/**
 * Simplifies an indexed geometry where values of its vertices, e.g. their light, allow it, with the
 * `simplifyWithAttributes` of meshoptimizer: the vertices that remain are a subset of the vertices, so
 * they can keep their values. The error is relative to the size of the geometry, and for the values to
 * their own units. The groups of the geometry are simplified one by one, the vertices they share stay,
 * and so do the vertices at the positions of another geometry, e.g. the one that was subdivided, so that
 * only the vertices that the subdivision added are removed.
 *
 * @async
 * @param {BufferGeometry} geometry - The indexed geometry.
 * @param {Float32Array} values - `stride` values per vertex.
 * @param {Object} options - The options.
 * @param {number} options.error - The error of the simplification.
 * @param {?BufferGeometry} [options.keep=null] - The geometry whose vertex positions stay.
 * @param {number} [options.stride=1] - The number of values per vertex.
 * @return {Promise<?{geometry: BufferGeometry, remap: Int32Array}>} A promise that resolves with the simplified geometry and the new index of each vertex, -1 for the removed ones, or `null` if nothing was removed.
 */
async function simplifyGeometry( geometry, values, { error, keep = null, stride = 1 } ) {

	if ( geometry.index === null || keep === geometry ) return null;

	const { MeshoptSimplifier } = await import( '../libs/meshopt_simplifier.module.js' );
	await MeshoptSimplifier.ready;

	const position = geometry.getAttribute( 'position' );
	const positions = new Float32Array( position.count * 3 );
	for ( let i = 0; i < position.count; i ++ ) _a.fromBufferAttribute( position, i ).toArray( positions, i * 3 );

	const index = geometry.index.array;
	const groups = geometry.groups.length > 0 ? geometry.groups : [ { start: 0, count: index.length, materialIndex: 0 } ];

	// the vertices at positions of more than one group are locked, they keep the groups together, and so are
	// the vertices at the positions to keep

	const key = ( x, y, z ) => x + ',' + y + ',' + z;
	let lock = null;

	if ( keep !== null ) {

		const kept = keep.getAttribute( 'position' );
		const keys = new Set();

		for ( let i = 0; i < kept.count; i ++ ) keys.add( key( kept.getX( i ), kept.getY( i ), kept.getZ( i ) ) );

		lock = new Uint8Array( position.count );
		for ( let v = 0; v < position.count; v ++ ) lock[ v ] = keys.has( key( position.getX( v ), position.getY( v ), position.getZ( v ) ) ) ? 1 : 0;

	}

	if ( groups.length > 1 ) {

		const owners = new Map();
		const at = ( v ) => key( position.getX( v ), position.getY( v ), position.getZ( v ) );

		groups.forEach( ( group, g ) => {

			for ( let i = group.start; i < Math.min( group.start + group.count, index.length ); i ++ ) {

				const k = at( index[ i ] ), owner = owners.get( k );

				if ( owner === undefined ) owners.set( k, g );
				else if ( owner !== g ) owners.set( k, - 1 );

			}

		} );

		if ( lock === null ) lock = new Uint8Array( position.count );
		for ( let v = 0; v < position.count; v ++ ) if ( owners.get( at( v ) ) === - 1 ) lock[ v ] = 1;

	}

	const parts = groups.map( ( group ) => {

		const indices = new Uint32Array( index.subarray( group.start, Math.min( group.start + group.count, index.length ) ) );
		return MeshoptSimplifier.simplifyWithAttributes( indices, positions, 3, values, stride, new Array( stride ).fill( 1 ), lock, 0, error, [] )[ 0 ];

	} );

	const keptCount = parts.reduce( ( sum, part ) => sum + part.length, 0 );

	if ( keptCount >= index.length ) return null;

	const kept = new Uint32Array( keptCount );
	let offset = 0;

	parts.forEach( ( part ) => {

		kept.set( part, offset );
		offset += part.length;

	} );

	// the vertices that remain, with all their attributes

	const remap = new Int32Array( position.count ).fill( - 1 );
	let used = 0;
	for ( const i of kept ) if ( remap[ i ] < 0 ) remap[ i ] = used ++;

	const result = new BufferGeometry();

	for ( const name of Object.keys( geometry.attributes ) ) {

		const attribute = geometry.getAttribute( name );
		const array = new attribute.array.constructor( used * attribute.itemSize );

		for ( let i = 0; i < position.count; i ++ ) {

			if ( remap[ i ] >= 0 ) for ( let c = 0; c < attribute.itemSize; c ++ ) array[ remap[ i ] * attribute.itemSize + c ] = attribute.getComponent( i, c );

		}

		result.setAttribute( name, new BufferAttribute( array, attribute.itemSize, attribute.normalized ) );

	}

	result.setIndex( new BufferAttribute( Uint32Array.from( kept, ( i ) => remap[ i ] ), 1 ) );

	if ( geometry.groups.length > 0 ) {

		offset = 0;

		parts.forEach( ( part, g ) => {

			result.addGroup( offset, part.length, groups[ g ].materialIndex );
			offset += part.length;

		} );

	}

	return { geometry: result, remap };

}

/**
 * Projects light maps onto the vertices of a layout whose geometries have light map UVs in `uv1`: every
 * texel whose center lies in a triangle adds its light to the corners of the triangle, weighted by its
 * barycentric coordinates and the area of the triangle per texel, so the light of a record is the mean of
 * the light map under the hat function of its vertex, like the lumped projection of {@link VertexLightMapper}.
 * Texels much darker than the mean are left out, they are hidden, e.g. inside or under other meshes, and
 * would darken the vertices next to them. Denoised light maps blur light into hidden texels, the samples
 * of a light map before denoising, e.g. {@link LightMapper#pages}, tell them apart better: texels inside
 * meshes only see back faces, which are black. Triangles without a texel center use the light at their
 * centroid. The texels at the borders of the charts are left out too: their centers can lie beyond the
 * edges of the charts, where the light is the one of other surfaces, e.g. inside a corner.
 *
 * @param {VertexLayout} layout - The layout.
 * @param {Array<{width: number, height: number, data: Float32Array}>} lightMaps - The light maps, see {@link readLightMaps}, by `mesh.userData.lightMapPage`.
 * @param {Object} [options] - The options.
 * @param {number} [options.hidden=0] - Texels darker than this share of the mean light of their light map are hidden.
 * @param {?Array<{width: number, height: number, data: Float32Array}>} [options.visibility=null] - Light maps of the same layout to find the hidden texels in, e.g. before denoising.
 * @param {boolean} [options.borders=true] - Whether to keep the texels at the borders of the charts.
 * @param {?Array<{width: number, height: number, data: Float32Array}>} [options.directions=null] - The dominant directions of the light maps, e.g. {@link LightMapper#directionTexture},
 * which are projected too, weighted by the luminance of the texels.
 * @return {{irradiance: Float32Array, directions: ?Float32Array}} The irradiance of the records, three values per record, and their encoded directions, four values per record.
 */
function projectLightMaps( layout, lightMaps, { hidden = 0, visibility = null, borders: keepBorders = true, directions: directionMaps = null } = {} ) {

	const sums = new Float64Array( layout.recordCount * 4 );
	const directionSums = directionMaps !== null ? new Float64Array( layout.recordCount * 3 ) : null;
	const light = [ 0, 0, 0 ];

	for ( const mesh of layout.meshes ) {

		if ( mesh.isInstancedMesh ) continue;

		const geometry = layout.getGeometry( mesh );
		const uv = geometry.getAttribute( 'uv1' );
		const inside = geometry.getAttribute( 'inside' );

		if ( uv === undefined ) continue;

		const map = lightMaps[ mesh.userData.lightMapPage ?? 0 ];
		const directionMap = directionMaps !== null ? directionMaps[ mesh.userData.lightMapPage ?? 0 ] : null;
		const visible = visibility !== null ? visibility[ mesh.userData.lightMapPage ?? 0 ] : map;
		const { width, height, data } = map;
		const threshold = hidden * meanLight( visible );
		const { positions } = worldVertices( geometry, mesh.matrixWorld );
		const indices = triangleIndices( geometry );
		const texels = [];

		// the edges at the borders of the charts, which one triangle uses in light map space

		const uvKey = ( i ) => uv.getX( i ).toFixed( 6 ) + ',' + uv.getY( i ).toFixed( 6 );
		const edgeKey = ( i, j ) => {

			const a = uvKey( i ), b = uvKey( j );
			return a < b ? a + '|' + b : b + '|' + a;

		};

		const edgeUses = new Map();

		for ( let t = 0; t < indices.length; t += 3 ) {

			for ( let c = 0; c < 3; c ++ ) {

				const key = edgeKey( indices[ t + c ], indices[ t + ( c + 1 ) % 3 ] );
				edgeUses.set( key, ( edgeUses.get( key ) ?? 0 ) + 1 );

			}

		}

		for ( let t = 0; t < indices.length; t += 3 ) {

			const i = indices[ t ], j = indices[ t + 1 ], k = indices[ t + 2 ];

			// the triangles inside other meshes take no light, see imprintContacts

			if ( isInside( inside, i, j, k ) ) continue;

			const corners = [ layout.getRecord( mesh, 0, i ), layout.getRecord( mesh, 0, j ), layout.getRecord( mesh, 0, k ) ];

			_a.fromArray( positions, i * 3 );
			const area = _b.fromArray( positions, j * 3 ).sub( _a ).cross( _c.fromArray( positions, k * 3 ).sub( _a ) ).length() / 2;

			if ( area === 0 ) continue;

			// the texel centers in the triangle, in texels

			const x0 = uv.getX( i ) * width, y0 = uv.getY( i ) * height;
			const x1 = uv.getX( j ) * width, y1 = uv.getY( j ) * height;
			const x2 = uv.getX( k ) * width, y2 = uv.getY( k ) * height;
			const determinant = ( x1 - x0 ) * ( y2 - y0 ) - ( x2 - x0 ) * ( y1 - y0 );

			texels.length = 0;

			// the borders of the chart among the edges of the triangle, as lines in texels

			const corners2 = [[ x0, y0 ], [ x1, y1 ], [ x2, y2 ]];
			const vertexIndices = [ i, j, k ];
			const borders = [];

			for ( let c = 0; c < 3; c ++ ) {

				if ( keepBorders || edgeUses.get( edgeKey( vertexIndices[ c ], vertexIndices[ ( c + 1 ) % 3 ] ) ) !== 1 ) continue;

				const [ ax, ay ] = corners2[ c ], [ bx, by ] = corners2[ ( c + 1 ) % 3 ];
				const length = Math.hypot( bx - ax, by - ay );
				if ( length > 0 ) borders.push( [ ax, ay, ( bx - ax ) / length, ( by - ay ) / length ] );

			}

			if ( Math.abs( determinant ) > 1e-12 ) {

				const minX = Math.max( 0, Math.floor( Math.min( x0, x1, x2 ) ) ), maxX = Math.min( width - 1, Math.ceil( Math.max( x0, x1, x2 ) ) );
				const minY = Math.max( 0, Math.floor( Math.min( y0, y1, y2 ) ) ), maxY = Math.min( height - 1, Math.ceil( Math.max( y0, y1, y2 ) ) );

				for ( let y = minY; y <= maxY; y ++ ) {

					for ( let x = minX; x <= maxX; x ++ ) {

						const b1 = ( ( x + 0.5 - x0 ) * ( y2 - y0 ) - ( x2 - x0 ) * ( y + 0.5 - y0 ) ) / determinant;
						const b2 = ( ( x1 - x0 ) * ( y + 0.5 - y0 ) - ( x + 0.5 - x0 ) * ( y1 - y0 ) ) / determinant;

						if ( b1 < 0 || b2 < 0 || b1 + b2 > 1 ) continue;

						// within a texel of a border of the chart

						if ( borders.some( ( [ ax, ay, dx, dy ] ) => Math.abs( ( x + 0.5 - ax ) * dy - ( y + 0.5 - ay ) * dx ) < 1 ) ) continue;

						texels.push( ( y * width + x ) * 4, 1 - b1 - b2, b1, b2 );

					}

				}

			}

			if ( texels.length === 0 ) {

				// the light at the centroid, bilinear

				const u = ( x0 + x1 + x2 ) / 3 / width, v = ( y0 + y1 + y2 ) / 3 / height;
				const x = Math.max( 0, Math.min( width - 1, Math.floor( u * width ) ) ), y = Math.max( 0, Math.min( height - 1, Math.floor( v * height ) ) );
				texels.push( ( y * width + x ) * 4, 1 / 3, 1 / 3, 1 / 3 );

			}

			const weight = area / ( texels.length / 4 );

			for ( let n = 0; n < texels.length; n += 4 ) {

				const o = texels[ n ];

				if ( 0.2126 * visible.data[ o ] + 0.7152 * visible.data[ o + 1 ] + 0.0722 * visible.data[ o + 2 ] < threshold ) continue;

				light[ 0 ] = data[ o ]; light[ 1 ] = data[ o + 1 ]; light[ 2 ] = data[ o + 2 ];

				const luminance = 0.2126 * light[ 0 ] + 0.7152 * light[ 1 ] + 0.0722 * light[ 2 ];

				for ( let c = 0; c < 3; c ++ ) {

					const record = corners[ c ];
					if ( record < 0 ) continue;

					const w = texels[ n + 1 + c ] * weight;
					sums[ record * 4 ] += light[ 0 ] * w;
					sums[ record * 4 + 1 ] += light[ 1 ] * w;
					sums[ record * 4 + 2 ] += light[ 2 ] * w;
					sums[ record * 4 + 3 ] += w;

					// the decoded directions, weighted by luminance like the ones of LightMapper

					if ( directionMap !== null ) {

						const d = directionMap.data;
						for ( let a = 0; a < 3; a ++ ) directionSums[ record * 3 + a ] += ( d[ o + a ] * 2 - 1 ) * luminance * w;

					}

				}

			}

		}

	}

	const irradiance = new Float32Array( layout.recordCount * 3 );
	const directions = directionMaps !== null ? new Float32Array( layout.recordCount * 4 ) : null;

	for ( let r = 0; r < layout.recordCount; r ++ ) {

		const w = sums[ r * 4 + 3 ];
		if ( w > 0 ) for ( let c = 0; c < 3; c ++ ) irradiance[ r * 3 + c ] = sums[ r * 4 + c ] / w;

		if ( directions !== null ) {

			// the mean direction over the luminance, at most a unit vector, encoded

			const luminance = ( 0.2126 * sums[ r * 4 ] + 0.7152 * sums[ r * 4 + 1 ] + 0.0722 * sums[ r * 4 + 2 ] );
			_a.fromArray( directionSums, r * 3 ).divideScalar( Math.max( luminance, 1e-20 ) );
			if ( _a.lengthSq() > 1 ) _a.normalize();

			directions[ r * 4 ] = _a.x * 0.5 + 0.5; directions[ r * 4 + 1 ] = _a.y * 0.5 + 0.5; directions[ r * 4 + 2 ] = _a.z * 0.5 + 0.5; directions[ r * 4 + 3 ] = 1;

		}

	}

	return { irradiance, directions };

}

/**
 * Computes vertex normals for a geometry without them: area-weighted face normals of indexed
 * geometries, face normals of non-indexed ones.
 *
 * @private
 * @param {BufferGeometry} geometry - The geometry.
 * @return {BufferAttribute} The normals.
 */
function computeNormals( geometry ) {

	const copy = new BufferGeometry();
	copy.setAttribute( 'position', geometry.getAttribute( 'position' ) );
	copy.setIndex( geometry.getIndex() );
	copy.computeVertexNormals();

	return copy.getAttribute( 'normal' );

}

/**
 * Returns the smoothed normals of the records of a layout, see {@link VertexLayout#smoothNormals}: the records at
 * a position, on the weld grid, share the faces around it, each weighted by its angle there.
 *
 * @private
 * @param {Float32Array} positions - The positions of the records.
 * @param {Float32Array} normals - Their normals.
 * @param {Uint32Array} triangles - The records of the corners of the triangles.
 * @param {number} count - The number of records.
 * @param {number} step - The inverse of the weld distance.
 * @return {Float32Array} The smoothed normals, three per record.
 */
function smoothRecordNormals( positions, normals, triangles, count, step ) {

	// the position of each record on the weld grid, in an open addressing hash table

	const capacity = Math.max( 2 ** Math.ceil( Math.log2( count * 2 + 1 ) ), 16 );
	const mask = capacity - 1;
	const table = new Int32Array( capacity ).fill( - 1 );
	const keys = new Int32Array( count * 3 );
	const places = new Uint32Array( count );
	let placeCount = 0;

	for ( let r = 0; r < count; r ++ ) {

		const k0 = Math.round( positions[ r * 3 ] * step ), k1 = Math.round( positions[ r * 3 + 1 ] * step ), k2 = Math.round( positions[ r * 3 + 2 ] * step );
		let h = Math.imul( k0, 0x9e3779b1 ) ^ Math.imul( k1, 0x85ebca6b ) ^ Math.imul( k2, 0xc2b2ae35 );
		h = ( h ^ ( h >>> 15 ) ) & mask;

		while ( true ) {

			const place = table[ h ];

			if ( place < 0 ) {

				keys[ placeCount * 3 ] = k0; keys[ placeCount * 3 + 1 ] = k1; keys[ placeCount * 3 + 2 ] = k2;
				table[ h ] = placeCount;
				places[ r ] = placeCount ++;
				break;

			}

			if ( keys[ place * 3 ] === k0 && keys[ place * 3 + 1 ] === k1 && keys[ place * 3 + 2 ] === k2 ) {

				places[ r ] = place;
				break;

			}

			h = ( h + 1 ) & mask;

		}

	}

	// each triangle's face normal and the angle at each corner, and the corners at each position

	const triangleCount = triangles.length / 3;
	const faces = new Float32Array( triangleCount * 3 );
	const angles = new Float32Array( triangleCount * 3 );
	const offsets = new Uint32Array( placeCount + 1 );

	for ( let t = 0; t < triangleCount; t ++ ) {

		const a = triangles[ t * 3 ] * 3, b = triangles[ t * 3 + 1 ] * 3, c = triangles[ t * 3 + 2 ] * 3;
		const abx = positions[ b ] - positions[ a ], aby = positions[ b + 1 ] - positions[ a + 1 ], abz = positions[ b + 2 ] - positions[ a + 2 ];
		const acx = positions[ c ] - positions[ a ], acy = positions[ c + 1 ] - positions[ a + 1 ], acz = positions[ c + 2 ] - positions[ a + 2 ];
		const bcx = positions[ c ] - positions[ b ], bcy = positions[ c + 1 ] - positions[ b + 1 ], bcz = positions[ c + 2 ] - positions[ b + 2 ];
		const fx = aby * acz - abz * acy, fy = abz * acx - abx * acz, fz = abx * acy - aby * acx;
		const area = Math.hypot( fx, fy, fz );
		if ( area < 1e-30 ) continue;

		faces[ t * 3 ] = fx / area; faces[ t * 3 + 1 ] = fy / area; faces[ t * 3 + 2 ] = fz / area;

		const ab = Math.hypot( abx, aby, abz ), ac = Math.hypot( acx, acy, acz ), bc = Math.hypot( bcx, bcy, bcz );
		const angleA = Math.acos( Math.min( 1, Math.max( - 1, ( abx * acx + aby * acy + abz * acz ) / Math.max( ab * ac, 1e-30 ) ) ) );
		const angleB = Math.acos( Math.min( 1, Math.max( - 1, - ( abx * bcx + aby * bcy + abz * bcz ) / Math.max( ab * bc, 1e-30 ) ) ) );
		angles[ t * 3 ] = angleA; angles[ t * 3 + 1 ] = angleB; angles[ t * 3 + 2 ] = Math.max( 0, Math.PI - angleA - angleB );

		for ( let k = 0; k < 3; k ++ ) offsets[ places[ triangles[ t * 3 + k ] ] + 1 ] ++;

	}

	for ( let i = 0; i < placeCount; i ++ ) offsets[ i + 1 ] += offsets[ i ];

	const corners = new Uint32Array( offsets[ placeCount ] );
	const fill = offsets.slice( 0, placeCount );

	for ( let t = 0; t < triangleCount; t ++ ) {

		if ( faces[ t * 3 ] === 0 && faces[ t * 3 + 1 ] === 0 && faces[ t * 3 + 2 ] === 0 ) continue;
		for ( let k = 0; k < 3; k ++ ) corners[ fill[ places[ triangles[ t * 3 + k ] ] ] ++ ] = t * 3 + k;

	}

	// each record: the corners at its position that face within 120 degrees of its own normal

	const smooth = new Float32Array( count * 3 );

	for ( let r = 0; r < count; r ++ ) {

		const nx = normals[ r * 3 ], ny = normals[ r * 3 + 1 ], nz = normals[ r * 3 + 2 ];
		const place = places[ r ];
		let x = 0, y = 0, z = 0;

		for ( let i = offsets[ place ]; i < offsets[ place + 1 ]; i ++ ) {

			const corner = corners[ i ], t = Math.floor( corner / 3 );
			const fx = faces[ t * 3 ], fy = faces[ t * 3 + 1 ], fz = faces[ t * 3 + 2 ];
			if ( fx * nx + fy * ny + fz * nz < - 0.5 ) continue;
			x += fx * angles[ corner ]; y += fy * angles[ corner ]; z += fz * angles[ corner ];

		}

		const length = Math.hypot( x, y, z );

		if ( length > 1e-12 ) {

			smooth[ r * 3 ] = x / length; smooth[ r * 3 + 1 ] = y / length; smooth[ r * 3 + 2 ] = z / length;

		} else {

			smooth[ r * 3 ] = nx; smooth[ r * 3 + 1 ] = ny; smooth[ r * 3 + 2 ] = nz;

		}

	}

	return smooth;

}

/**
 * Packs a unit vector into a float that holds an integer: 12 bits of each octahedral coordinate, plus one, so
 * that zero means none. See `unpackNormal()`.
 *
 * @private
 * @param {Float32Array} array - The vectors.
 * @param {number} i - The vector.
 * @return {number} The packed vector.
 */
function packNormal( array, i ) {

	const x = array[ i * 3 ], y = array[ i * 3 + 1 ], z = array[ i * 3 + 2 ];
	const sum = Math.abs( x ) + Math.abs( y ) + Math.abs( z );
	if ( sum < 1e-12 ) return 0;
	let u = x / sum, v = y / sum;

	if ( z < 0 ) {

		const fu = u;
		u = ( 1 - Math.abs( v ) ) * ( fu >= 0 ? 1 : - 1 );
		v = ( 1 - Math.abs( fu ) ) * ( v >= 0 ? 1 : - 1 );

	}

	return Math.round( ( u * 0.5 + 0.5 ) * 4095 ) * 4096 + Math.round( ( v * 0.5 + 0.5 ) * 4095 ) + 1;

}

/**
 * Unpacks a vector of `packNormal()`, or returns `fallback` for none.
 *
 * @private
 * @param {Node<float>} packed - The packed vector.
 * @param {Node<vec3>} fallback - The vector for none.
 * @return {Node<vec3>} The unit vector.
 */
function unpackNormal( packed, fallback ) {

	const value = packed.sub( 1 ).max( 0 );
	const high = floor( value.div( 4096 ) );
	const uv = vec2( high, value.sub( high.mul( 4096 ) ) ).div( 4095 ).mul( 2 ).sub( 1 ).toVar();
	const n = vec3( uv, abs( uv.x ).add( abs( uv.y ) ).oneMinus() ).toVar();
	const t = n.z.negate().max( 0 );
	n.x.addAssign( select( n.x.greaterThanEqual( 0 ), t.negate(), t ) );
	n.y.addAssign( select( n.y.greaterThanEqual( 0 ), t.negate(), t ) );

	return select( packed.greaterThan( 0.5 ), normalize( n ), fallback );

}

/**
 * Returns a geometry that shares the attributes, index and groups of another one, so that it can get
 * attributes of its own.
 *
 * @private
 * @param {BufferGeometry} geometry - The geometry.
 * @return {BufferGeometry} The new geometry.
 */
function shareGeometry( geometry ) {

	const copy = new BufferGeometry();

	for ( const name in geometry.attributes ) copy.setAttribute( name, geometry.attributes[ name ] );

	copy.setIndex( geometry.getIndex() );
	copy.groups = geometry.groups.map( ( group ) => ( { ...group } ) );
	copy.drawRange = { ...geometry.drawRange };
	copy.morphAttributes = geometry.morphAttributes;
	copy.userData = { ...geometry.userData };

	return copy;

}

export { VertexLayout, VertexLightMapper, subdivideGeometry, vertexLightMap, refineContacts, imprintContacts, refineByLightMap, refineByLightMapError, readLightMaps, projectLightMaps, simplifyGeometry };
