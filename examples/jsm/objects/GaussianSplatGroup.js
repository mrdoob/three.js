import {
	Box3,
	DynamicDrawUsage,
	Matrix4,
	Mesh,
	Ray,
	Sphere,
	StorageBufferAttribute,
	Vector2,
	Vector3
} from 'three/webgpu';

import { instanceIndex, max, select, storage, uint, uniform, vec4 } from 'three/tsl';

import { retargetPBOAttribute } from '../utils/StorageBufferUtils.js';
import { CountingSort } from '../gpgpu/CountingSort.js';
import { SH_BAND_WORDS, getSphericalHarmonicsDegree } from '../utils/GaussianSplatUtils.js';
import {
	BIN_COUNT,
	WORKGROUP_SIZE,
	computeRayIntersection,
	computeSplatBoundingBox,
	computeSplatBoundingSphere,
	createAffineMatrix4,
	createGeometry,
	createMaterial,
	createMaterialNodes,
	needsSort,
	updateLastSortDirection,
	updateSortDepthRange
} from '../utils/GaussianSplatShadingUtils.js';

const _box = /*@__PURE__*/ new Box3();
const _sphere = /*@__PURE__*/ new Sphere();
const _groupWorldMatrixInverse = /*@__PURE__*/ new Matrix4();
const _cameraPositionInGroup = /*@__PURE__*/ new Vector3();
const _cameraPositionInRecord = /*@__PURE__*/ new Vector3();
const _instanceMatrixInverse = /*@__PURE__*/ new Matrix4();
const _instanceWorldMatrix = /*@__PURE__*/ new Matrix4();
const _instanceWorldMatrixInverse = /*@__PURE__*/ new Matrix4();
const _ray = /*@__PURE__*/ new Ray();

// Record slot 0 is reserved and never flagged visible, so any splat slot whose record index
// is 0 (freed ranges, never-used capacity) is skipped by the sort.
const DEAD_RECORD_INDEX = 0;

class SplatRecord {

	constructor( id, geometry, count, sphericalHarmonicsDegree ) {

		this.id = id;
		this.geometry = geometry;
		this.boundingBox = new Box3();
		this.boundingSphere = new Sphere();

		computeSplatBoundingBox( geometry, this.boundingBox );
		computeSplatBoundingSphere( geometry, this.boundingBox, this.boundingSphere );

		this.count = count;
		this.sphericalHarmonicsDegree = sphericalHarmonicsDegree;

		// Start of this cloud's slot range in the shared buffers, -1 while not yet packed.
		this.offset = - 1;
		this.recordIndex = - 1;
		this.matrix = new Matrix4();
		this.visible = true;

		// Matrix or visibility needs writing into the record data buffer.
		this.dataDirty = true;

	}

}

/**
 * A container that packs many independent Gaussian splat `BufferGeometry`s into one
 * shared set of storage buffers, sorts the packed set once, and draws it with a single
 * instanced draw call. This is what makes overlapping splat clouds alpha-blend correctly
 * with each other: each cloud sorting and drawing itself independently cannot produce a
 * globally correct back-to-front order across clouds.
 *
 * Add each source geometry with {@link GaussianSplatGroup#addSplat}, then set its
 * transform with {@link GaussianSplatGroup#setMatrixAt}:
 *
 * ```js
 * const group = new GaussianSplatGroup();
 * scene.add( group );
 *
 * const idA = group.addSplat( splatGeometryA );
 * const idB = group.addSplat( splatGeometryB );
 *
 * group.setMatrixAt( idA, matrixA );
 * group.setMatrixAt( idB, matrixB );
 *
 * renderer.render( scene, camera );
 * ```
 *
 * `GaussianSplatGroup` does not wrap independent scene-graph children - it takes a raw
 * `BufferGeometry` per splat cloud via {@link GaussianSplatGroup#addSplat}. All of the
 * group's work (packing, sorting, toggling visibility) happens automatically inside its own
 * `onBeforeRender`, so there is no separate `update()` method to call before
 * `renderer.render()`.
 *
 * Every change costs only what it touches. `setMatrixAt` and `setVisibleAt` update a
 * single per-cloud record (hidden clouds stay packed and are simply skipped by the sort).
 * `addSplat` packs just the new cloud into free space and uploads only that range;
 * `deleteSplat` frees the cloud's range for reuse. Only when there is no free range large
 * enough do the shared buffers grow (by doubling) and every cloud gets repacked. Buffers
 * never shrink on their own - call {@link GaussianSplatGroup#compact} to fit them to the
 * current contents. WebGPU sorts the packed set on the GPU; the WebGL2 fallback backend
 * sorts the same packed set on the CPU and uploads the order.
 *
 * The practical ceiling on total live splats is set by the renderer's storage buffer size
 * limit; roughly 8-16M live splats is a portable target for WebGPU hardware.
 *
 * This class requires {@link WebGPURenderer}. Its `forceWebGL` (WebGL2) fallback backend is
 * supported, but sorting runs on the CPU there, so large splat groups are expected to be
 * significantly slower than on WebGPU.
 *
 * @augments Mesh
 * @three_import import { GaussianSplatGroup } from 'three/addons/objects/GaussianSplatGroup.js';
 */
class GaussianSplatGroup extends Mesh {

	/**
	 * Constructs a new Gaussian splat group.
	 *
	 * @param {Object} [options] - Options.
	 * @param {number} [options.binCount=4096] - The number of depth bins used by the group's {@link CountingSort}. Larger values improve sort accuracy when splats are spread across a large combined depth range, at the cost of a longer (but still single-pass) prefix sum.
	 * @param {number} [options.workgroupSize=256] - The workgroup size of the compute shaders used for merging and sorting.
	 * @param {number} [options.initialSize] - Preallocates the shared storage buffers to this many splats up front, so the group doesn't grow (and repack every cloud) as splat clouds are added until the total exceeds it. Useful to size a group for its expected peak (e.g. 2,000,000) once, up front.
	 * @param {number} [options.shDegree=2] - Fixed spherical harmonics degree used by the group. Source splats with fewer bands are padded with neutral coefficients; source splats with more bands are truncated to this degree.
	 */
	constructor( { binCount = BIN_COUNT, workgroupSize = WORKGROUP_SIZE, initialSize, shDegree = 2 } = {} ) {

		if ( Number.isInteger( shDegree ) === false || shDegree < 0 || shDegree > 3 ) {

			throw new Error( 'THREE.GaussianSplatGroup: shDegree must be an integer from 0 to 3.' );

		}

		const geometry = createGeometry( 0 );

		// Start with empty draw buffers so the group can be added to a scene before any
		// splat clouds are loaded.
		const buffers = createGroupBufferState();
		buffers.sphericalHarmonicsDegree = shDegree;

		resizeGroupBufferState( buffers, Math.max( 1, initialSize || 1 ), 2, shDegree );

		const localCameraPosition = uniform( new Vector3() );

		// One extra bin past `binCount` collects hidden and freed slots so they sort to the
		// end of the order buffer, past the drawn `instanceCount`.
		const sort = new CountingSort( buffers.capacity, { binCount: binCount + 1, workgroupSize } );
		const materialNodes = createMaterialNodes( buffers, sort, localCameraPosition, buffers );
		const material = createMaterial( materialNodes.vertexNode, materialNodes.fragmentNode );

		super( geometry, material );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isGaussianSplatGroup = true;

		this.type = 'GaussianSplatGroup';

		/**
		 * The number of depth bins used by the group's {@link CountingSort}.
		 *
		 * @type {number}
		 */
		this.binCount = binCount;

		/**
		 * The workgroup size of the compute shaders used for merging and sorting.
		 *
		 * @type {number}
		 */
		this.workgroupSize = workgroupSize;

		/**
		 * The bounding box of the merged splats, in this group's local space. Not computed
		 * by default - call {@link GaussianSplatGroup#computeBoundingBox} explicitly, or
		 * read {@link GaussianSplatGroup#boundingSphere}, otherwise it stays `null`.
		 *
		 * @type {?Box3}
		 * @default null
		 */
		this.boundingBox = null;

		/**
		 * The bounding sphere of the merged splats, in this group's local space. Not computed
		 * by default - call {@link GaussianSplatGroup#computeBoundingSphere} explicitly,
		 * otherwise it stays `null`.
		 *
		 * @type {?Sphere}
		 * @default null
		 */
		this.boundingSphere = null;

		this._splatCount = 0;
		this._maxSphericalHarmonicsDegree = shDegree;

		this._buffers = buffers;
		this._sortMatrix = uniform( new Matrix4() );
		this._sortDepthRange = uniform( new Vector2( 0, 1 ) );

		this._sort = sort;
		this._sort.setBinNode( () => {

			const centerRecord = this._buffers.centerRead.element( instanceIndex ).toVar( 'centerRecord' );
			const recordIndex = uint( centerRecord.w.add( 0.5 ) ).toVar( 'recordIndex' );
			const recordFlag = this._buffers.recordDataRead.element( recordIndex.mul( 4 ).add( 3 ) ).w.toVar( 'recordFlag' );
			const center = transformCenter( centerRecord.xyz, this._buffers, recordIndex ).toVar( 'center' );
			const viewCenter = this._sortMatrix.mul( vec4( center, 1 ) ).xyz.toVar( 'viewCenter' );
			const depth = viewCenter.z.negate().toVar( 'depth' );
			const range = max( this._sortDepthRange.y.sub( this._sortDepthRange.x ), 0.0001 ).toVar( 'range' );
			const normalized = depth.sub( this._sortDepthRange.x ).div( range ).clamp( 0, 1 ).toVar( 'normalized' );
			const depthBin = uint( normalized.mul( this.binCount - 1 ) ).toVar( 'depthBin' );

			return select( recordFlag.lessThan( 0.5 ), uint( this.binCount ), uint( this.binCount - 1 ).sub( depthBin ) );

		} );

		this._records = new Map();
		this._nextId = 0;

		// Clouds added but not yet packed into the shared buffers.
		this._pendingRecords = [];

		// Free slot ranges in the shared buffers, sorted by start and coalesced.
		this._freeRanges = [ { start: 0, count: buffers.capacity } ];
		this._freeRecordIndices = [];
		this._nextRecordIndex = DEAD_RECORD_INDEX + 1;

		// Slot ranges written on the CPU since the last render, uploaded as partial updates.
		this._dirtySplatRanges = [];

		// Set when pending clouds need packing or the drawn count changed.
		this._layoutDirty = true;

		this._sortValid = false;
		this._lastSortDirection = new Vector3();

		this._sphericalHarmonicsInitialized = false;
		this._lastSHCameraMatrix = new Matrix4();
		this._lastSHGroupWorldMatrix = new Matrix4();

		this._boundsDirty = true;

		// Required by `createMaterialNodes()`; grouped splats use precomputed SH contribution.
		this._localCameraPosition = localCameraPosition;

	}

	/**
	 * Adds a splat cloud to the group. The cloud is packed into the shared buffers on the
	 * next render (or the next read of {@link GaussianSplatGroup#splatCount}).
	 *
	 * @param {BufferGeometry} splatGeometry - The splat geometry to add. Same attribute contract as {@link GaussianSplat}'s constructor.
	 * @return {number} An id identifying this splat cloud, for use with {@link GaussianSplatGroup#setMatrixAt}/{@link GaussianSplatGroup#setVisibleAt}/{@link GaussianSplatGroup#deleteSplat}.
	 */
	addSplat( splatGeometry ) {

		const positionAttribute = splatGeometry.getAttribute( 'position' );
		const sphericalHarmonicsDegree = getSphericalHarmonicsDegree( splatGeometry );
		const count = positionAttribute.count;

		const id = this._nextId ++;
		const record = new SplatRecord( id, splatGeometry, count, sphericalHarmonicsDegree );

		this._records.set( id, record );
		this._pendingRecords.push( record );

		this._layoutDirty = true;
		this._boundsDirty = true;

		return id;

	}

	/**
	 * Removes a splat cloud from the group. Its slot range in the shared buffers is freed
	 * for reuse by later {@link GaussianSplatGroup#addSplat} calls; the buffers themselves
	 * keep their size until {@link GaussianSplatGroup#compact} is called.
	 *
	 * @param {number} id - The id returned by {@link GaussianSplatGroup#addSplat}.
	 */
	deleteSplat( id ) {

		const record = this._records.get( id );

		if ( record === undefined ) return;

		this._records.delete( id );

		if ( record.offset >= 0 ) {

			this._releaseRecord( record );

		} else {

			this._pendingRecords.splice( this._pendingRecords.indexOf( record ), 1 );

		}

		this._layoutDirty = true;
		this._boundsDirty = true;

	}

	/**
	 * Sets a splat cloud's transform, relative to this group.
	 *
	 * @param {number} id - The id returned by {@link GaussianSplatGroup#addSplat}.
	 * @param {Matrix4} matrix - The transform, relative to this group's local space.
	 */
	setMatrixAt( id, matrix ) {

		const record = this._getRecord( id );

		if ( record.matrix.equals( matrix ) ) return;

		record.matrix.copy( matrix );
		record.dataDirty = true;

		this._sortValid = false;
		this._boundsDirty = true;

	}

	/**
	 * Reads a splat cloud's transform back.
	 *
	 * @param {number} id - The id returned by {@link GaussianSplatGroup#addSplat}.
	 * @param {Matrix4} [target] - The target matrix.
	 * @return {Matrix4} The transform, relative to this group's local space.
	 */
	getMatrixAt( id, target = new Matrix4() ) {

		return target.copy( this._getRecord( id ).matrix );

	}

	/**
	 * Sets whether a splat cloud is drawn. Hidden clouds stay packed in the shared buffers,
	 * so toggling visibility only updates the cloud's record and re-sorts.
	 *
	 * @param {number} id - The id returned by {@link GaussianSplatGroup#addSplat}.
	 * @param {boolean} visible - Whether to draw this splat cloud.
	 */
	setVisibleAt( id, visible ) {

		const record = this._getRecord( id );

		if ( record.visible === visible ) return;

		record.visible = visible;
		record.dataDirty = true;

		this._layoutDirty = true;
		this._boundsDirty = true;

	}

	/**
	 * Reads a splat cloud's visibility back.
	 *
	 * @param {number} id - The id returned by {@link GaussianSplatGroup#addSplat}.
	 * @return {boolean} Whether this splat cloud is drawn.
	 */
	getVisibleAt( id ) {

		return this._getRecord( id ).visible;

	}

	/**
	 * The number of splat slots the group's shared storage buffers currently have room for.
	 * Grows by doubling as clouds are added and never shrinks on its own; see
	 * {@link GaussianSplatGroup#compact}.
	 *
	 * @type {number}
	 * @readonly
	 */
	get capacity() {

		return this._buffers.capacity;

	}

	/**
	 * The number of splats currently drawn, i.e. the total of every visible cloud. Not to be
	 * confused with the inherited {@link Mesh#count} draw-call instance count, which this
	 * class manages internally.
	 *
	 * @type {number}
	 * @readonly
	 */
	get splatCount() {

		this._syncLayout();

		return this._splatCount;

	}

	/**
	 * Repacks every cloud (visible or not) contiguously and shrinks the shared storage
	 * buffers to exactly fit them, freeing slack left by deleted clouds and by growth. A
	 * no-op if the buffers already fit exactly.
	 */
	compact() {

		this._syncLayout();

		const target = Math.max( 1, this._totalCount() );

		if ( target === this._buffers.capacity ) return;

		this._repackAll( target );
		this._updateCounts();

	}

	/**
	 * Packs pending clouds, updates record transforms, re-sorts the packed set when needed,
	 * and updates draw state. Called automatically by the renderer - there is no need to
	 * call this directly.
	 *
	 * @param {Renderer} renderer - The renderer.
	 * @param {Object3D} scene - The scene.
	 * @param {Camera} camera - The camera used for rendering.
	 */
	onBeforeRender( renderer, scene, camera ) {

		this._syncLayout();
		this._flushSplatUploads();

		// Keep Object3D.visible user-controlled; an empty group draws zero instances.
		if ( this._splatCount === 0 ) return;

		const isWebGLBackend = renderer.backend && renderer.backend.isWebGLBackend === true;

		if ( isWebGLBackend === true ) {

			enableGroupWebGLBuffers( this._buffers );
			this._sort.enableWebGLBuffers();

		}

		this.updateWorldMatrix( true, false );
		const recordsUpdated = this._updateRecordData();
		this._updateLocalCameraPositions( camera, recordsUpdated );

		// Refresh the current view direction before recording it after a sort.
		const directionChanged = this._needsSort( camera );
		const needsResort = this._sortValid === false || directionChanged === true;

		if ( needsResort === true ) {

			this._updateSortUniforms( camera );
			if ( isWebGLBackend === true ) {

				this._sortCPU();

			} else {

				this._sort.compute( renderer );

			}

			this._sortValid = true;
			updateLastSortDirection( this._lastSortDirection );

		}

	}

	/**
	 * Tests the current bounds against the camera frustum.
	 *
	 * @param {Frustum} frustum - The camera frustum.
	 * @return {boolean} Whether the group intersects the frustum.
	 */
	intersectsFrustum( frustum ) {

		if ( this.boundingSphere === null || this._boundsDirty === true ) this.computeBoundingSphere();

		return super.intersectsFrustum( frustum );

	}

	/**
	 * Computes the bounding box of the merged splats, in this group's local space,
	 * as the union of each visible splat cloud's covariance-aware bounding box transformed
	 * by that cloud's {@link GaussianSplatGroup#setMatrixAt} transform.
	 */
	computeBoundingBox() {

		this._syncLayout();

		if ( this.boundingBox === null ) this.boundingBox = new Box3();

		this.boundingBox.makeEmpty();

		for ( const record of this._records.values() ) {

			if ( record.visible === false ) continue;

			_box.copy( record.boundingBox ).applyMatrix4( record.matrix );
			this.boundingBox.union( _box );

		}

	}

	/**
	 * Computes the bounding sphere of the merged splats, in this group's local space.
	 */
	computeBoundingSphere() {

		if ( this.boundingSphere === null ) this.boundingSphere = new Sphere();

		this.computeBoundingBox();
		this.boundingBox.getBoundingSphere( this.boundingSphere );

		let maxRadius = 0;

		for ( const record of this._records.values() ) {

			if ( record.visible === false ) continue;

			_sphere.copy( record.boundingSphere ).applyMatrix4( record.matrix );
			maxRadius = Math.max( maxRadius, this.boundingSphere.center.distanceTo( _sphere.center ) + _sphere.radius );

		}

		this.boundingSphere.radius = Math.max( this.boundingSphere.radius, maxRadius );
		this._boundsDirty = false;

	}

	/**
	 * Computes intersection points between a casted ray and the splats, tagging each
	 * intersection with the {@link GaussianSplatGroup#addSplat} id of the splat cloud hit
	 * (`intersect.instanceId`), analogous to {@link BatchedMesh}'s `batchId`.
	 *
	 * @param {Raycaster} raycaster - The raycaster.
	 * @param {Array<Object>} intersects - The target array that holds the intersection points.
	 */
	raycast( raycaster, intersects ) {

		this._syncLayout();

		for ( const record of this._records.values() ) {

			if ( record.visible === false ) continue;

			_instanceWorldMatrix.multiplyMatrices( this.matrixWorld, record.matrix );

			_sphere.copy( record.boundingSphere ).applyMatrix4( _instanceWorldMatrix );

			if ( raycaster.ray.intersectsSphere( _sphere ) === false ) continue;

			_instanceWorldMatrixInverse.copy( _instanceWorldMatrix ).invert();
			_ray.copy( raycaster.ray ).applyMatrix4( _instanceWorldMatrixInverse );

			if ( _ray.intersectsBox( record.boundingBox ) === false ) continue;

			const positionAttribute = record.geometry.getAttribute( 'position' );
			const covarianceAttribute = record.geometry.getAttribute( 'covariance' );
			const colorAttribute = record.geometry.getAttribute( 'color' );
			const count = positionAttribute.count;
			const before = intersects.length;

			for ( let i = 0; i < count; i ++ ) {

				computeRayIntersection( positionAttribute, covarianceAttribute, colorAttribute, i, _instanceWorldMatrix, _ray, raycaster, intersects, this );

			}

			for ( let i = before; i < intersects.length; i ++ ) intersects[ i ].instanceId = record.id;

		}

	}

	/**
	 * Frees the GPU resources owned by this group (shared storage buffers, sort
	 * buffers, geometry, material, and every added splat cloud's source buffers).
	 */
	dispose() {

		disposeGroupBufferState( this._buffers );
		this._sort.dispose();

		this._records.clear();
		this._pendingRecords.length = 0;

		this.geometry.dispose();
		this.material.dispose();

	}

	_getRecord( id ) {

		const record = this._records.get( id );

		if ( record === undefined ) throw new Error( `THREE.GaussianSplatGroup: no splat with id ${ id }.` );

		return record;

	}

	_syncLayout() {

		if ( this._layoutDirty === false ) return;

		this._layoutDirty = false;

		this._packPending();
		this._updateCounts();

	}

	// Packs each pending cloud into the first free range that fits, uploading only that
	// range. Runs out of room (or too fragmented) -> grow and repack everything.
	_packPending() {

		const pending = this._pendingRecords;

		for ( let i = 0; i < pending.length; i ++ ) {

			const record = pending[ i ];
			let offset = this._allocateRange( record.count );

			if ( offset === - 1 ) {

				// Out of room: grow (doubling) in place, keeping every packed cloud where it is.
				this._grow( Math.max( this._buffers.capacity * 2, this._totalCount() ) );
				offset = this._allocateRange( record.count );

			}

			if ( offset === - 1 ) {

				// Still no contiguous range (fragmentation): repack everything. `_repackAll`
				// places every cloud, including the rest of the pending list.
				this._repackAll( this._buffers.capacity );

				return;

			}

			record.offset = offset;
			record.recordIndex = this._allocateRecordIndex();
			record.dataDirty = true;

			this._packRecord( record );
			this._dirtySplatRanges.push( { start: offset, count: record.count } );

		}

		pending.length = 0;

	}

	_updateCounts() {

		let visible = 0;

		for ( const record of this._records.values() ) {

			if ( record.visible === true ) visible += record.count;

		}

		this._splatCount = visible;
		this.geometry.instanceCount = visible;

		this._sortValid = false;
		this._boundsDirty = true;

	}

	_allocateRange( count ) {

		const ranges = this._freeRanges;

		// ponytail: first-fit linear scan; a size-ordered structure if free lists get long.
		for ( let i = 0; i < ranges.length; i ++ ) {

			const range = ranges[ i ];

			if ( range.count < count ) continue;

			const start = range.start;

			range.start += count;
			range.count -= count;

			if ( range.count === 0 ) ranges.splice( i, 1 );

			return start;

		}

		return - 1;

	}

	_freeRange( start, count ) {

		const ranges = this._freeRanges;
		let i = 0;

		while ( i < ranges.length && ranges[ i ].start < start ) i ++;

		ranges.splice( i, 0, { start, count } );

		// Coalesce with the following range, then the preceding one.
		if ( i + 1 < ranges.length && ranges[ i ].start + ranges[ i ].count === ranges[ i + 1 ].start ) {

			ranges[ i ].count += ranges[ i + 1 ].count;
			ranges.splice( i + 1, 1 );

		}

		if ( i > 0 && ranges[ i - 1 ].start + ranges[ i - 1 ].count === start ) {

			ranges[ i - 1 ].count += ranges[ i ].count;
			ranges.splice( i, 1 );

		}

	}

	_allocateRecordIndex() {

		if ( this._freeRecordIndices.length > 0 ) return this._freeRecordIndices.pop();

		if ( this._nextRecordIndex >= this._buffers.recordCapacity ) {

			// The record buffer is tiny (64 bytes per cloud); growing it just rewrites every record.
			resizeRecordData( this._buffers, this._buffers.recordCapacity * 2 );

			for ( const record of this._records.values() ) record.dataDirty = true;

		}

		return this._nextRecordIndex ++;

	}

	// Frees a packed cloud's slot range. The freed slots are pointed at the reserved dead
	// record so the sort skips them until they are reused.
	_releaseRecord( record ) {

		const centers = this._buffers.centerAttribute.array;

		for ( let i = 0; i < record.count; i ++ ) {

			centers[ ( record.offset + i ) * 4 + 3 ] = DEAD_RECORD_INDEX;

		}

		this._dirtySplatRanges.push( { start: record.offset, count: record.count } );
		this._freeRange( record.offset, record.count );
		this._freeRecordIndices.push( record.recordIndex );

		record.offset = - 1;
		record.recordIndex = - 1;

	}

	_totalCount() {

		let total = 0;

		for ( const record of this._records.values() ) total += record.count;

		return total;

	}

	// Grows the shared buffers to `capacity` slots, keeping every packed cloud where it is:
	// the old arrays are copied over as a prefix and the new tail becomes free space.
	_grow( capacity ) {

		const buffers = this._buffers;
		const oldCapacity = buffers.capacity;
		const oldArrays = splatAttributes( buffers, this._maxSphericalHarmonicsDegree ).map( ( [ attribute ] ) => attribute.array );
		const oldRecordData = buffers.recordDataAttribute.array;

		resizeGroupBufferState( buffers, capacity, buffers.recordCapacity, this._maxSphericalHarmonicsDegree );
		this._sort.count = capacity;

		splatAttributes( buffers, this._maxSphericalHarmonicsDegree ).forEach( ( [ attribute ], i ) => copyPrefix( oldArrays[ i ], attribute.array ) );
		copyPrefix( oldRecordData, buffers.recordDataAttribute.array );

		this._freeRange( oldCapacity, capacity - oldCapacity );

		// The renderer uploads the newly created attributes in full, so pending partial
		// ranges (which referred to the old buffers) are dropped.
		this._dirtySplatRanges.length = 0;

	}

	// Reallocates the shared buffers to `capacity` slots and packs every cloud contiguously.
	_repackAll( capacity ) {

		resizeGroupBufferState( this._buffers, capacity, Math.max( this._buffers.recordCapacity, this._records.size + 1 ), this._maxSphericalHarmonicsDegree );
		this._sort.count = capacity;

		let offset = 0;
		let recordIndex = DEAD_RECORD_INDEX + 1;

		for ( const record of this._records.values() ) {

			record.offset = offset;
			record.recordIndex = recordIndex ++;
			record.dataDirty = true;

			this._packRecord( record );

			offset += record.count;

		}

		this._pendingRecords.length = 0;
		this._freeRanges = offset < capacity ? [ { start: offset, count: capacity - offset } ] : [];
		this._freeRecordIndices.length = 0;
		this._nextRecordIndex = recordIndex;

		// The renderer uploads the newly created attributes in full, so pending partial
		// ranges (which referred to the old buffers) are dropped.
		this._dirtySplatRanges.length = 0;

	}

	// Uploads only the slot ranges written since the last render.
	_flushSplatUploads() {

		const ranges = this._dirtySplatRanges;

		if ( ranges.length === 0 ) return;

		for ( const [ attribute, stride ] of splatAttributes( this._buffers, this._maxSphericalHarmonicsDegree ) ) {

			for ( const range of ranges ) attribute.addUpdateRange( range.start * stride, range.count * stride );

			updateStorageAttribute( attribute );

		}

		ranges.length = 0;

	}

	_packRecord( record ) {

		const positionAttribute = record.geometry.getAttribute( 'position' );
		const covarianceAttribute = record.geometry.getAttribute( 'covariance' );
		const colorAttribute = record.geometry.getAttribute( 'color' );
		const targetCenter = this._buffers.centerAttribute.array;
		const targetCovariance = this._buffers.covarianceAttribute.array;
		const targetColor = this._buffers.colorAttribute.array;
		const positions = positionAttribute.array;
		const covariances = covarianceAttribute.array;
		const colors = colorAttribute.array;

		for ( let i = 0; i < record.count; i ++ ) {

			const source3 = i * 3;
			const source4 = i * 4;
			const source6 = i * 6;
			const targetSplat = record.offset + i;
			const target4 = targetSplat * 4;
			const target8 = targetSplat * 8;

			targetCenter[ target4 ] = positions[ source3 ];
			targetCenter[ target4 + 1 ] = positions[ source3 + 1 ];
			targetCenter[ target4 + 2 ] = positions[ source3 + 2 ];
			targetCenter[ target4 + 3 ] = record.recordIndex;

			targetCovariance[ target8 ] = covariances[ source6 ];
			targetCovariance[ target8 + 1 ] = covariances[ source6 + 1 ];
			targetCovariance[ target8 + 2 ] = covariances[ source6 + 2 ];
			targetCovariance[ target8 + 3 ] = covariances[ source6 + 3 ];
			targetCovariance[ target8 + 4 ] = covariances[ source6 + 4 ];
			targetCovariance[ target8 + 5 ] = covariances[ source6 + 5 ];
			targetCovariance[ target8 + 6 ] = 0;
			targetCovariance[ target8 + 7 ] = 0;

			targetColor[ targetSplat ] = ( colors[ source4 ] |
				colors[ source4 + 1 ] << 8 |
				colors[ source4 + 2 ] << 16 |
				colors[ source4 + 3 ] << 24 ) >>> 0;

		}

		for ( let degree = 1; degree <= this._maxSphericalHarmonicsDegree; degree ++ ) {

			const target = this._buffers[ `sphericalHarmonics${ degree }Attribute` ].array;
			const words = SH_BAND_WORDS[ degree ];
			const targetOffset = record.offset * words;

			if ( degree <= record.sphericalHarmonicsDegree ) {

				target.set( record.geometry.getAttribute( `sphericalHarmonics${ degree }` ).array, targetOffset );

			} else {

				target.fill( 0x80808080, targetOffset, targetOffset + record.count * words );

			}

		}

	}

	// Writes each dirty record's matrix rows and visible flag into the record data buffer.
	_updateRecordData() {

		const recordData = this._buffers.recordDataAttribute.array;
		let updated = false;

		for ( const record of this._records.values() ) {

			if ( record.offset < 0 || record.dataDirty === false ) continue;

			const offset = record.recordIndex * 16;

			writeMatrixRows( recordData, offset, record.matrix );
			recordData[ offset + 15 ] = record.visible === true ? 1 : 0;

			record.dataDirty = false;
			updated = true;

		}

		if ( updated === true ) {

			updateStorageAttribute( this._buffers.recordDataAttribute );

		}

		return updated;

	}

	_updateLocalCameraPositions( camera, force = false ) {

		if ( this._maxSphericalHarmonicsDegree === 0 ) return;

		const viewChanged = this._sphericalHarmonicsInitialized === false ||
			camera.matrixWorld.equals( this._lastSHCameraMatrix ) === false ||
			this.matrixWorld.equals( this._lastSHGroupWorldMatrix ) === false;

		if ( force === false && viewChanged === false ) return;

		const recordData = this._buffers.recordDataAttribute.array;

		_groupWorldMatrixInverse.copy( this.matrixWorld ).invert();
		_cameraPositionInGroup.setFromMatrixPosition( camera.matrixWorld ).applyMatrix4( _groupWorldMatrixInverse );

		for ( const record of this._records.values() ) {

			if ( record.visible === false ) continue;

			_instanceMatrixInverse.copy( record.matrix ).invert();
			_cameraPositionInRecord.copy( _cameraPositionInGroup ).applyMatrix4( _instanceMatrixInverse );

			const offset = record.recordIndex * 16 + 12;

			recordData[ offset ] = _cameraPositionInRecord.x;
			recordData[ offset + 1 ] = _cameraPositionInRecord.y;
			recordData[ offset + 2 ] = _cameraPositionInRecord.z;

		}

		updateStorageAttribute( this._buffers.recordDataAttribute );
		this._lastSHCameraMatrix.copy( camera.matrixWorld );
		this._lastSHGroupWorldMatrix.copy( this.matrixWorld );
		this._sphericalHarmonicsInitialized = true;

	}

	_needsSort( camera ) {

		return needsSort( camera, this.matrixWorld, this._lastSortDirection );

	}

	_updateSortUniforms( camera ) {

		this._sortMatrix.value.multiplyMatrices( camera.matrixWorldInverse, this.matrixWorld );

		if ( this.boundingSphere === null || this._boundsDirty === true ) this.computeBoundingSphere();

		updateSortDepthRange( camera, this.matrixWorld, this.boundingSphere, this._sortDepthRange.value );

	}

	_sortCPU() {

		const centers = this._buffers.centerAttribute.array;
		const recordData = this._buffers.recordDataAttribute.array;
		const matrix = this._sortMatrix.value.elements;
		const nearDepth = this._sortDepthRange.value.x;
		const range = Math.max( this._sortDepthRange.value.y - nearDepth, 0.0001 );
		const scale = ( this.binCount - 1 ) / range;

		this._sort.computeCPU( ( i ) => {

			const i4 = i * 4;
			const record16 = Math.round( centers[ i4 + 3 ] ) * 16;

			// Hidden or freed slots go to the discard bin, past the drawn range.
			if ( recordData[ record16 + 15 ] < 0.5 ) return this.binCount;

			const x = centers[ i4 ];
			const y = centers[ i4 + 1 ];
			const z = centers[ i4 + 2 ];
			const tx = recordData[ record16 ] * x + recordData[ record16 + 1 ] * y + recordData[ record16 + 2 ] * z + recordData[ record16 + 3 ];
			const ty = recordData[ record16 + 4 ] * x + recordData[ record16 + 5 ] * y + recordData[ record16 + 6 ] * z + recordData[ record16 + 7 ];
			const tz = recordData[ record16 + 8 ] * x + recordData[ record16 + 9 ] * y + recordData[ record16 + 10 ] * z + recordData[ record16 + 11 ];
			const depth = - ( matrix[ 2 ] * tx + matrix[ 6 ] * ty + matrix[ 10 ] * tz + matrix[ 14 ] );
			const depthBin = Math.min( this.binCount - 1, Math.max( 0, Math.floor( ( depth - nearDepth ) * scale ) ) );

			return this.binCount - 1 - depthBin;

		} );

	}

}

// The per-splat storage attributes and their array stride per splat.
function splatAttributes( buffers, sphericalHarmonicsDegree ) {

	const result = [
		[ buffers.centerAttribute, 4 ],
		[ buffers.covarianceAttribute, 8 ],
		[ buffers.colorAttribute, 1 ]
	];

	for ( let degree = 1; degree <= sphericalHarmonicsDegree; degree ++ ) {

		result.push( [ buffers[ `sphericalHarmonics${ degree }Attribute` ], SH_BAND_WORDS[ degree ] ] );

	}

	return result;

}

function copyPrefix( source, target ) {

	target.set( source.length <= target.length ? source : source.subarray( 0, target.length ) );

}

function updateStorageAttribute( attribute ) {

	attribute.needsUpdate = true;

	if ( attribute.pbo !== undefined ) attribute.pbo.needsUpdate = true;

}

function writeMatrixRows( target, offset, matrix ) {

	const e = matrix.elements;

	target[ offset ] = e[ 0 ];
	target[ offset + 1 ] = e[ 4 ];
	target[ offset + 2 ] = e[ 8 ];
	target[ offset + 3 ] = e[ 12 ];

	target[ offset + 4 ] = e[ 1 ];
	target[ offset + 5 ] = e[ 5 ];
	target[ offset + 6 ] = e[ 9 ];
	target[ offset + 7 ] = e[ 13 ];

	target[ offset + 8 ] = e[ 2 ];
	target[ offset + 9 ] = e[ 6 ];
	target[ offset + 10 ] = e[ 10 ];
	target[ offset + 11 ] = e[ 14 ];

}

function transformCenter( center, buffers, recordIndex ) {

	const recordDataIndex = recordIndex.mul( 4 ).toVar( 'sortRecordDataIndex' );
	const matrix0 = buffers.recordDataRead.element( recordDataIndex ).toVar( 'sortRecordMatrix0' );
	const matrix1 = buffers.recordDataRead.element( recordDataIndex.add( 1 ) ).toVar( 'sortRecordMatrix1' );
	const matrix2 = buffers.recordDataRead.element( recordDataIndex.add( 2 ) ).toVar( 'sortRecordMatrix2' );
	const matrix = createAffineMatrix4( matrix0, matrix1, matrix2, 'sortRecordMatrix' );

	return matrix.mul( vec4( center, 1 ) ).xyz.toVar( 'sortCenter' );

}

function enableGroupWebGLBuffers( state ) {

	if ( state.webGLBuffersEnabled === true ) return;

	state.centerAttribute.setUsage( DynamicDrawUsage );
	state.covarianceAttribute.setUsage( DynamicDrawUsage );
	state.colorAttribute.setUsage( DynamicDrawUsage );
	state.recordDataAttribute.setUsage( DynamicDrawUsage );

	state.centerRead.setPBO( true );
	state.covarianceRead.setPBO( true );
	state.colorRead.setPBO( true );
	state.recordDataRead.setPBO( true );

	for ( let degree = 1; degree <= state.sphericalHarmonicsDegree; degree ++ ) {

		state[ `sphericalHarmonics${ degree }Attribute` ].setUsage( DynamicDrawUsage );
		state[ `sphericalHarmonics${ degree }Read` ].setPBO( true );

	}

	state.webGLBuffersEnabled = true;

}

// Storage nodes need a valid attribute even before any splats are added.
function createPlaceholderVec4Attribute() {

	return new StorageBufferAttribute( new Float32Array( 4 ), 4 );

}

function createPlaceholderUintAttribute() {

	return new StorageBufferAttribute( new Uint32Array( 1 ), 1 );

}

// Builds the packed source buffers and per-record transform buffers used by the grouped draw.
function createGroupBufferState() {

	const centerAttribute = createPlaceholderVec4Attribute();
	const covarianceAttribute = createPlaceholderVec4Attribute();
	const colorAttribute = createPlaceholderUintAttribute();
	const recordDataAttribute = createPlaceholderVec4Attribute();

	return {
		capacity: 0,
		recordCapacity: 0,
		sphericalHarmonicsDegree: 0,
		webGLBuffersEnabled: false,
		centerAttribute,
		covarianceAttribute,
		colorAttribute,
		recordDataAttribute,
		centerRead: storage( centerAttribute, 'vec4', 0 ).toReadOnly(),
		covarianceRead: storage( covarianceAttribute, 'vec4', 0 ).toReadOnly(),
		colorRead: storage( colorAttribute, 'uint', 0 ).toReadOnly(),
		recordDataRead: storage( recordDataAttribute, 'vec4', 0 ).toReadOnly()
	};

}

// Resizes the shared storage attributes while keeping their storage nodes stable.
function resizeGroupBufferState( state, capacity, recordCapacity, sphericalHarmonicsDegree ) {

	const oldCenterAttribute = state.centerAttribute;
	const oldCovarianceAttribute = state.covarianceAttribute;
	const oldColorAttribute = state.colorAttribute;

	state.centerAttribute = new StorageBufferAttribute( new Float32Array( capacity * 4 ), 4 );
	state.covarianceAttribute = new StorageBufferAttribute( new Float32Array( capacity * 8 ), 4 );
	state.colorAttribute = new StorageBufferAttribute( new Uint32Array( capacity ), 1 );

	retargetPBOAttribute( oldCenterAttribute, state.centerAttribute );
	retargetPBOAttribute( oldCovarianceAttribute, state.covarianceAttribute );
	retargetPBOAttribute( oldColorAttribute, state.colorAttribute );

	state.centerRead.value = state.centerAttribute;
	state.covarianceRead.value = state.covarianceAttribute;
	state.colorRead.value = state.colorAttribute;

	resizeRecordData( state, recordCapacity );

	for ( let degree = 1; degree <= 3; degree ++ ) {

		const oldAttribute = state[ `sphericalHarmonics${ degree }Attribute` ];

		if ( oldAttribute !== undefined ) oldAttribute.dispose();

		if ( degree <= sphericalHarmonicsDegree ) {

			const attribute = new StorageBufferAttribute( new Uint32Array( capacity * SH_BAND_WORDS[ degree ] ), 1 );

			state[ `sphericalHarmonics${ degree }Attribute` ] = attribute;
			if ( oldAttribute !== undefined ) retargetPBOAttribute( oldAttribute, attribute );

			if ( state[ `sphericalHarmonics${ degree }Read` ] === undefined ) {

				state[ `sphericalHarmonics${ degree }Read` ] = storage( attribute, 'uint', 0 ).toReadOnly();
				state[ `sphericalHarmonics${ degree }Words` ] = SH_BAND_WORDS[ degree ];

			} else {

				state[ `sphericalHarmonics${ degree }Read` ].value = attribute;

			}

		} else {

			delete state[ `sphericalHarmonics${ degree }Attribute` ];
			delete state[ `sphericalHarmonics${ degree }Words` ];

		}

	}

	state.capacity = capacity;
	state.sphericalHarmonicsDegree = sphericalHarmonicsDegree;

	oldCenterAttribute.dispose();
	oldCovarianceAttribute.dispose();
	oldColorAttribute.dispose();

}

// Resizes only the per-record transform/flag buffer (16 floats per record; slot 0 is the
// reserved dead record). Contents are not preserved - callers mark every record dirty.
function resizeRecordData( state, recordCapacity ) {

	const oldAttribute = state.recordDataAttribute;

	state.recordDataAttribute = new StorageBufferAttribute( new Float32Array( recordCapacity * 16 ), 4 );
	retargetPBOAttribute( oldAttribute, state.recordDataAttribute );
	state.recordDataRead.value = state.recordDataAttribute;
	state.recordCapacity = recordCapacity;
	state.webGLBuffersEnabled = false;

	oldAttribute.dispose();

}

function disposeGroupBufferState( state ) {

	state.centerAttribute.dispose();
	state.covarianceAttribute.dispose();
	state.colorAttribute.dispose();
	state.recordDataAttribute.dispose();

	for ( let degree = 1; degree <= state.sphericalHarmonicsDegree; degree ++ ) {

		state[ `sphericalHarmonics${ degree }Attribute` ].dispose();

	}

}

export { GaussianSplatGroup };
