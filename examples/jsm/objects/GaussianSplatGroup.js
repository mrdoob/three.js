import {
	Box3,
	DataTexture,
	DynamicDrawUsage,
	Matrix4,
	Mesh,
	Ray,
	Sphere,
	StorageBufferAttribute,
	Vector2,
	Vector3
} from 'three/webgpu';

import { instanceIndex, max, storage, uint, uniform, vec4 } from 'three/tsl';

import { CountingSort } from '../gpgpu/CountingSort.js';
import { SH_BAND_WORDS, getSphericalHarmonicsDegree } from '../utils/GaussianSplatUtils.js';
import {
	BIN_COUNT,
	WORKGROUP_SIZE,
	computeRayIntersection,
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

class SplatRecord {

	constructor( id, geometry, count, sphericalHarmonicsDegree ) {

		this.id = id;
		this.geometry = geometry;
		this.count = count;
		this.sphericalHarmonicsDegree = sphericalHarmonicsDegree;
		this.offset = 0;
		this.recordIndex = 0;
		this.matrix = new Matrix4();
		this.visible = true;
		this.matrixDirty = true;

	}

	setMatrix( matrix ) {

		if ( this.matrix.equals( matrix ) ) return false;

		this.matrix.copy( matrix );
		this.matrixDirty = true;

		return true;

	}

	setOffset( offset ) {

		this.offset = offset;

	}

	setRecordIndex( recordIndex ) {

		this.recordIndex = recordIndex;
		this.matrixDirty = true;

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
 * group's work (merging, sorting, toggling visibility) happens automatically inside its own
 * `onBeforeRender`, so there is no separate `update()` method to call before
 * `renderer.render()`.
 *
 * `setMatrixAt` updates only the moved splat cloud's transform. `addSplat`, `deleteSplat`
 * and `setVisibleAt` change which splat ranges are packed into the shared buffers, so they
 * rebuild the packed layout on the next render. WebGPU sorts the packed set on the GPU;
 * the WebGL2 fallback backend sorts the same packed set on the CPU and uploads the order.
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
	 * @param {boolean} [options.autoCompact=true] - Whether the group's shared storage buffers are kept sized to exactly fit the current live splat total. When `true`, every add/remove/visibility change that changes the total resizes the buffers, growing or shrinking them to fit. When `false`, the buffers only grow - shrinking the live total never reallocates smaller buffers on its own; call {@link GaussianSplatGroup#compact} to shrink them to fit. Can be changed at any time; a change only takes effect the next time buffer sizes are checked, i.e. the next `addSplat`/`deleteSplat`/`setVisibleAt` (or explicit {@link GaussianSplatGroup#compact} call). Defaults to `false` when `initialSize` is given, since preallocating a fixed size and then having it silently shrink would defeat the point - pass `autoCompact: true` explicitly alongside `initialSize` if that's actually what's wanted.
	 * @param {number} [options.initialSize] - Preallocates the shared storage buffers to this many splats up front, so the group doesn't reallocate as splat clouds are added until the live total exceeds it. Useful to size a group for its expected peak (e.g. 2,000,000) once, up front. Implies `autoCompact: false` unless `autoCompact` is explicitly passed.
	 * @param {number} [options.shDegree=2] - Fixed spherical harmonics degree used by the group. Source splats with fewer bands are padded with neutral coefficients; source splats with more bands are truncated to this degree.
	 */
	constructor( { binCount = BIN_COUNT, workgroupSize = WORKGROUP_SIZE, autoCompact, initialSize, shDegree = 2 } = {} ) {

		if ( Number.isInteger( shDegree ) === false || shDegree < 0 || shDegree > 3 ) {

			throw new Error( 'THREE.GaussianSplatGroup: shDegree must be an integer from 0 to 3.' );

		}

		const geometry = createGeometry( 0 );

		// Start with empty draw buffers so the group can be added to a scene before any
		// splat clouds are loaded.
		const buffers = createGroupBufferState();
		buffers.sphericalHarmonicsDegree = shDegree;

		resizeGroupBufferState( buffers, Math.max( 1, initialSize || 1 ), 1, shDegree );

		const localCameraPosition = uniform( new Vector3() );
		const sort = new CountingSort( 0, { binCount, workgroupSize } );
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
		 * Whether the group's shared storage buffers are kept sized to exactly fit the
		 * current live splat total (see the constructor's `autoCompact` option for the full
		 * contract). Safe to change at any time; takes effect the next time buffer sizes are
		 * checked, i.e. the next `addSplat`/`deleteSplat`/`setVisibleAt`/{@link GaussianSplatGroup#compact}.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.autoCompact = autoCompact !== undefined ? autoCompact : ( initialSize === undefined );

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
			const center = transformCenter( centerRecord.xyz, this._buffers, recordIndex ).toVar( 'center' );
			const viewCenter = this._sortMatrix.mul( vec4( center, 1 ) ).xyz.toVar( 'viewCenter' );
			const depth = viewCenter.z.negate().toVar( 'depth' );
			const range = max( this._sortDepthRange.y.sub( this._sortDepthRange.x ), 0.0001 ).toVar( 'range' );
			const normalized = depth.sub( this._sortDepthRange.x ).div( range ).clamp( 0, 1 ).toVar( 'normalized' );
			const depthBin = uint( normalized.mul( this.binCount - 1 ) ).toVar( 'depthBin' );

			return uint( this.binCount - 1 ).sub( depthBin );

		} );

		this._records = new Map();
		this._nextId = 0;

		// Set when visible splat ranges or offsets change. Matrix changes only mark the
		// affected record dirty because other records keep their offsets.
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
	 * Adds a splat cloud to the group.
	 *
	 * @param {BufferGeometry} splatGeometry - The splat geometry to add. Same attribute contract as {@link GaussianSplat}'s constructor.
	 * @return {number} An id identifying this splat cloud, for use with {@link GaussianSplatGroup#setMatrixAt}/{@link GaussianSplatGroup#setVisibleAt}/{@link GaussianSplatGroup#deleteSplat}.
	 */
	addSplat( splatGeometry ) {

		const positionAttribute = splatGeometry.getAttribute( 'position' );
		const sphericalHarmonicsDegree = getSphericalHarmonicsDegree( splatGeometry );
		const count = positionAttribute.count;

		if ( splatGeometry.boundingBox === null ) splatGeometry.computeBoundingBox();
		if ( splatGeometry.boundingSphere === null ) splatGeometry.computeBoundingSphere();

		const id = this._nextId ++;

		this._records.set( id, new SplatRecord( id, splatGeometry, count, sphericalHarmonicsDegree ) );

		this._layoutDirty = true;
		this._boundsDirty = true;

		return id;

	}

	/**
	 * Removes a splat cloud from the group, freeing its GPU buffers.
	 *
	 * @param {number} id - The id returned by {@link GaussianSplatGroup#addSplat}.
	 */
	deleteSplat( id ) {

		const record = this._records.get( id );

		if ( record === undefined ) return;

		this._records.delete( id );

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

		if ( record.setMatrix( matrix ) === true ) {

			this._sortValid = false;
			this._boundsDirty = true;

		}

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
	 * Sets whether a splat cloud is drawn. Unlike {@link GaussianSplatGroup#setMatrixAt},
	 * this changes which splat ranges are packed into the shared buffers, so it triggers a
	 * full layout rebuild on the next render.
	 *
	 * @param {number} id - The id returned by {@link GaussianSplatGroup#addSplat}.
	 * @param {boolean} visible - Whether to draw this splat cloud.
	 */
	setVisibleAt( id, visible ) {

		const record = this._getRecord( id );

		if ( record.visible === visible ) return;

		record.visible = visible;
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
	 * The number of splats the group's shared storage buffers currently have room for.
	 * Always `>=` {@link GaussianSplatGroup#splatCount}; the two are equal exactly when the
	 * buffers are compact - always true while {@link GaussianSplatGroup#autoCompact} is
	 * `true`, and after an explicit {@link GaussianSplatGroup#compact} call otherwise.
	 *
	 * @type {number}
	 * @readonly
	 */
	get capacity() {

		return this._buffers.capacity;

	}

	/**
	 * The number of live (added and visible) splats currently packed into
	 * the group's shared buffers. Not to be confused with the inherited {@link Mesh#count}
	 * draw-call instance count, which this class manages internally.
	 *
	 * @type {number}
	 * @readonly
	 */
	get splatCount() {

		if ( this._layoutDirty === true ) this._rebuildLayout();

		return this._splatCount;

	}

	/**
	 * Shrinks the group's shared storage buffers to exactly fit the current live splat
	 * total, freeing any slack accumulated while {@link GaussianSplatGroup#autoCompact} was
	 * `false` (grow-only mode) or while the group was preallocated via the constructor's
	 * `initialSize` option. A no-op if the buffers already fit exactly. Not needed when
	 * `autoCompact` is `true`, since buffers are already kept sized to fit.
	 */
	compact() {

		if ( this._layoutDirty === true ) this._rebuildLayout();

		const target = Math.max( 1, this._splatCount );
		let recordTarget = 0;

		for ( const record of this._records.values() ) {

			if ( record.visible === true ) recordTarget ++;

		}

		recordTarget = Math.max( 1, recordTarget );

		if ( target === this._buffers.capacity && recordTarget === this._buffers.recordCapacity ) return;

		this._resizeBuffers( target, recordTarget, this._maxSphericalHarmonicsDegree );
		this._layoutDirty = true;

	}

	/**
	 * Updates record transforms, re-sorts the packed set when needed, and updates draw state.
	 * Called automatically by the renderer - there is no need to call this directly.
	 *
	 * @param {Renderer} renderer - The renderer.
	 * @param {Object3D} scene - The scene.
	 * @param {Camera} camera - The camera used for rendering.
	 */
	onBeforeRender( renderer, scene, camera ) {

		if ( this._layoutDirty === true ) this._rebuildLayout();

		// Keep Object3D.visible user-controlled; an empty group draws zero instances.
		if ( this._splatCount === 0 ) return;

		const isWebGLBackend = renderer.backend && renderer.backend.isWebGLBackend === true;

		if ( isWebGLBackend === true ) {

			enableGroupWebGLBuffers( this._buffers );
			this._sort.enableWebGLBuffers();

		}

		this.updateWorldMatrix( true, false );
		const recordsUpdated = this._updateRecordMatrices();
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
	 * Computes the bounding box of the merged splats, in this group's local space,
	 * as the union of each visible splat cloud's own geometry bounding box transformed
	 * by that cloud's {@link GaussianSplatGroup#setMatrixAt} transform.
	 */
	computeBoundingBox() {

		if ( this._layoutDirty === true ) this._rebuildLayout();

		if ( this.boundingBox === null ) this.boundingBox = new Box3();

		this.boundingBox.makeEmpty();

		for ( const record of this._records.values() ) {

			if ( record.visible === false ) continue;

			_box.copy( record.geometry.boundingBox ).applyMatrix4( record.matrix );
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

			_sphere.copy( record.geometry.boundingSphere ).applyMatrix4( record.matrix );
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

		if ( this._layoutDirty === true ) this._rebuildLayout();

		for ( const record of this._records.values() ) {

			if ( record.visible === false ) continue;

			_instanceWorldMatrix.multiplyMatrices( this.matrixWorld, record.matrix );

			_sphere.copy( record.geometry.boundingSphere ).applyMatrix4( _instanceWorldMatrix );

			if ( raycaster.ray.intersectsSphere( _sphere ) === false ) continue;

			_instanceWorldMatrixInverse.copy( _instanceWorldMatrix ).invert();
			_ray.copy( raycaster.ray ).applyMatrix4( _instanceWorldMatrixInverse );

			if ( record.geometry.boundingBox !== null && _ray.intersectsBox( record.geometry.boundingBox ) === false ) continue;

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

		this.geometry.dispose();
		this.material.dispose();

	}

	_getRecord( id ) {

		const record = this._records.get( id );

		if ( record === undefined ) throw new Error( `THREE.GaussianSplatGroup: no splat with id ${ id }.` );

		return record;

	}

	_rebuildLayout() {

		this._layoutDirty = false;

		let total = 0;
		const visibleRecords = [];

		for ( const record of this._records.values() ) {

			if ( record.visible === true ) {

				total += record.count;
				visibleRecords.push( record );

			}

		}

		this._splatCount = total;
		this._sort.count = total;

		const requiredCapacity = Math.max( 1, total );
		const requiredRecordCapacity = Math.max( 1, visibleRecords.length );

		// autoCompact controls whether capacity shrinks automatically or only via compact().
		if ( this.autoCompact === true ?
			requiredCapacity !== this._buffers.capacity || requiredRecordCapacity !== this._buffers.recordCapacity :
			requiredCapacity > this._buffers.capacity || requiredRecordCapacity > this._buffers.recordCapacity ) {

			this._resizeBuffers( requiredCapacity, requiredRecordCapacity, this._maxSphericalHarmonicsDegree );

		}

		let offset = 0;
		let recordIndex = 0;

		for ( const record of visibleRecords ) {

			record.setOffset( offset );
			record.setRecordIndex( recordIndex );
			this._packRecord( record );

			offset += record.count;
			recordIndex ++;

		}

		updateStorageAttribute( this._buffers.centerAttribute );
		updateStorageAttribute( this._buffers.covarianceAttribute );
		updateStorageAttribute( this._buffers.colorAttribute );

		for ( let degree = 1; degree <= this._maxSphericalHarmonicsDegree; degree ++ ) {

			updateStorageAttribute( this._buffers[ `sphericalHarmonics${ degree }Attribute` ] );

		}

		this.geometry.instanceCount = total;

		this._boundsDirty = true;
		this._sortValid = false;

	}

	// Shared buffers are derived from the source splat clouds, so resizing invalidates
	// every visible record's packed data.
	_resizeBuffers( capacity, recordCapacity, sphericalHarmonicsDegree ) {

		resizeGroupBufferState( this._buffers, capacity, recordCapacity, sphericalHarmonicsDegree );

		for ( const record of this._records.values() ) {

			if ( record.visible === false ) continue;

			record.matrixDirty = true;

		}

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

	_updateRecordMatrices() {

		const recordData = this._buffers.recordDataAttribute.array;
		let updated = false;

		for ( const record of this._records.values() ) {

			if ( record.visible === false || record.matrixDirty === false ) continue;

			const offset = record.recordIndex * 16;

			writeMatrixRows( recordData, offset, record.matrix );

			record.matrixDirty = false;
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
			recordData[ offset + 3 ] = 0;

		}

		updateStorageAttribute( this._buffers.recordDataAttribute );
		this._lastSHCameraMatrix.copy( camera.matrixWorld );
		this._lastSHGroupWorldMatrix.copy( this.matrixWorld );
		this._sphericalHarmonicsInitialized = true;

	}

	_rebuildMaterial( total ) {

		const materialNodes = createMaterialNodes( this._buffers, this._sort, this._localCameraPosition, this._buffers );

		const oldGeometry = this.geometry;
		const oldMaterial = this.material;

		this.geometry = createGeometry( total );
		this.material = createMaterial( materialNodes.vertexNode, materialNodes.fragmentNode );

		oldGeometry.dispose();
		oldMaterial.dispose();

		this._sortValid = false;

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

function retargetPBOAttribute( oldAttribute, newAttribute ) {

	if ( oldAttribute.pbo === undefined ) return;

	const originalArray = newAttribute.array;
	const itemSize = newAttribute.itemSize;
	const numElements = newAttribute.count * itemSize;
	const width = Math.pow( 2, Math.ceil( Math.log2( Math.sqrt( numElements / itemSize ) ) ) );
	let height = Math.ceil( ( numElements / itemSize ) / width );

	if ( width * height * itemSize < numElements ) height ++;

	const paddedArray = new originalArray.constructor( width * height * itemSize );
	paddedArray.set( originalArray );

	newAttribute.array = paddedArray;
	newAttribute.pboNode = oldAttribute.pboNode;

	const oldPBO = oldAttribute.pbo;

	// WebGL allocates PBO textures with texStorage2D, which cannot change size.
	// The shader indexes with textureSize(), so keeping a stale GPU width after
	// compact() mis-reads every splat. Rebuild the texture when the layout changes.
	if ( oldPBO.image.width !== width || oldPBO.image.height !== height ) {

		const newPBO = new DataTexture( paddedArray, width, height, oldPBO.format, oldPBO.type );
		newPBO.isPBOTexture = true;
		newPBO.needsUpdate = true;
		oldAttribute.pboNode.value = newPBO;
		newAttribute.pbo = newPBO;
		oldPBO.dispose();

	} else {

		newAttribute.pbo = oldPBO;
		oldPBO.image.data = paddedArray;
		oldPBO.needsUpdate = true;

	}

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
	const oldRecordDataAttribute = state.recordDataAttribute;

	state.centerAttribute = new StorageBufferAttribute( new Float32Array( capacity * 4 ), 4 );
	state.covarianceAttribute = new StorageBufferAttribute( new Float32Array( capacity * 8 ), 4 );
	state.colorAttribute = new StorageBufferAttribute( new Uint32Array( capacity ), 1 );
	state.recordDataAttribute = new StorageBufferAttribute( new Float32Array( recordCapacity * 16 ), 4 );

	retargetPBOAttribute( oldCenterAttribute, state.centerAttribute );
	retargetPBOAttribute( oldCovarianceAttribute, state.covarianceAttribute );
	retargetPBOAttribute( oldColorAttribute, state.colorAttribute );
	retargetPBOAttribute( oldRecordDataAttribute, state.recordDataAttribute );

	state.centerRead.value = state.centerAttribute;
	state.covarianceRead.value = state.covarianceAttribute;
	state.colorRead.value = state.colorAttribute;
	state.recordDataRead.value = state.recordDataAttribute;

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
	state.recordCapacity = recordCapacity;
	state.sphericalHarmonicsDegree = sphericalHarmonicsDegree;
	state.webGLBuffersEnabled = false;

	oldCenterAttribute.dispose();
	oldCovarianceAttribute.dispose();
	oldColorAttribute.dispose();
	oldRecordDataAttribute.dispose();

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
