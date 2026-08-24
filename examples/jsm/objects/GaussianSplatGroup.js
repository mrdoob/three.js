import {
	Box3,
	Matrix4,
	Mesh,
	Ray,
	Sphere,
	StorageBufferAttribute,
	Vector2,
	Vector3
} from 'three/webgpu';

import { Fn, dot, instanceIndex, max, storage, uint, uniform, vec3, vec4 } from 'three/tsl';

import { CountingSort } from '../gpgpu/CountingSort.js';
import { SH_BAND_WORDS, getSphericalHarmonicsDegree } from '../utils/GaussianSplatUtils.js';
import {
	BIN_COUNT,
	WORKGROUP_SIZE,
	applySphericalHarmonics,
	computeRayIntersection,
	createGeometry,
	createMaterial,
	createMaterialNodes,
	createStorageBuffers,
	disposeStorageBuffers,
	needsSort,
	updateLastSortDirection,
	updateSortDepthRange
} from '../utils/GaussianSplatShadingUtils.js';

const _box = /*@__PURE__*/ new Box3();
const _sphere = /*@__PURE__*/ new Sphere();
const _groupWorldMatrixInverse = /*@__PURE__*/ new Matrix4();
const _cameraPositionInGroup = /*@__PURE__*/ new Vector3();
const _instanceMatrixInverse = /*@__PURE__*/ new Matrix4();
const _instanceWorldMatrix = /*@__PURE__*/ new Matrix4();
const _instanceWorldMatrixInverse = /*@__PURE__*/ new Matrix4();
const _ray = /*@__PURE__*/ new Ray();

class SplatRecord {

	constructor( id, geometry, buffers, count, sphericalHarmonicsDegree ) {

		this.id = id;
		this.geometry = geometry;
		this.buffers = buffers;
		this.count = count;
		this.sphericalHarmonicsDegree = sphericalHarmonicsDegree;
		this.offset = 0;
		this.matrix = new Matrix4();
		this.visible = true;
		this.mergeDirty = true;
		this.shDirty = true;
		this.shLocalCameraPosition = new Vector3();

	}

	setMatrix( matrix ) {

		if ( this.matrix.equals( matrix ) ) return false;

		this.matrix.copy( matrix );
		this.mergeDirty = true;
		this.shDirty = true;

		return true;

	}

	setOffset( offset ) {

		this.offset = offset;
		this.invalidateDerivedData();

	}

	invalidateDerivedData() {

		this.mergeDirty = true;
		this.shDirty = true;

	}

}

/**
 * A container that merges many independent Gaussian splat `BufferGeometry`s into one
 * shared set of storage buffers, sorts the merged set once, and draws it with a single
 * instanced draw call. This is what makes overlapping splat clouds alpha-blend correctly
 * with each other: each cloud sorting and drawing itself independently cannot produce a
 * globally correct back-to-front order across clouds.
 *
 * `GaussianSplatGroup` owns its splat data directly - the same model {@link BatchedMesh}
 * uses for merging many geometries into one draw call:
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
 * `setMatrixAt` only re-merges the moved splat cloud. `addSplat`, `deleteSplat` and
 * `setVisibleAt` change which ranges are packed into the shared buffers, so they trigger a
 * full rebuild (every included splat cloud re-merges) on the next render.
 *
 * The practical ceiling on total live splats is set by the `maxStorageBufferBindingSize`
 * WebGPU limit; design/test against roughly 8-16M total live splats as a target that works
 * on effectively all WebGPU hardware.
 *
 * This class requires {@link WebGPURenderer} with real WebGPU compute support - the
 * `forceWebGL` (WebGL2) backend is not yet supported, and `onBeforeRender` throws if used
 * with it. Use independent {@link GaussianSplat} instances on WebGL2 instead.
 *
 * @augments Mesh
 * @three_import import { GaussianSplatGroup } from 'three/addons/objects/GaussianSplatGroup.js';
 */
class GaussianSplatGroup extends Mesh {

	/**
	 * Constructs a new Gaussian splat group.
	 *
	 * @param {Object} [options] - Options.
	 * @param {number} [options.binCount=4096] - The number of depth bins used by the group's merged {@link CountingSort}. Larger values improve sort accuracy when splats are spread across a large combined depth range, at the cost of a longer (but still single-pass) prefix sum.
	 * @param {number} [options.workgroupSize=256] - The workgroup size of the compute shaders used for merging and sorting.
	 * @param {boolean} [options.autoCompact=true] - Whether the group's shared storage buffers are kept sized to exactly fit the current live splat total. When `true`, every add/remove/visibility change that changes the total resizes the buffers, growing or shrinking them to fit. When `false`, the buffers only grow - shrinking the live total never reallocates smaller buffers on its own; call {@link GaussianSplatGroup#compact} to shrink them to fit. Can be changed at any time; a change only takes effect the next time buffer sizes are checked, i.e. the next `addSplat`/`deleteSplat`/`setVisibleAt` (or explicit {@link GaussianSplatGroup#compact} call). Defaults to `false` when `initialSize` is given, since preallocating a fixed size and then having it silently shrink would defeat the point - pass `autoCompact: true` explicitly alongside `initialSize` if that's actually what's wanted.
	 * @param {number} [options.initialSize] - Preallocates the shared storage buffers to this many splats up front, so the group doesn't reallocate as splat clouds are added until the live total exceeds it. Useful to size a group for its expected peak (e.g. 2,000,000) once, up front. Implies `autoCompact: false` unless `autoCompact` is explicitly passed.
	 */
	constructor( { binCount = BIN_COUNT, workgroupSize = WORKGROUP_SIZE, autoCompact, initialSize } = {} ) {

		const geometry = createGeometry( 0 );

		// Built with real (if empty) buffers/sort, so the group is safe to compile and draw -
		// 0 instances, nothing visible - from construction. This is what lets `visible` stay
		// a normal, user-owned Object3D property, with no internal flipping on/off needed
		// (see `onBeforeRender`).
		const buffers = createGroupBufferState();

		if ( initialSize !== undefined && initialSize > 0 ) resizeGroupBufferState( buffers, initialSize );

		const localCameraPosition = uniform( new Vector3() );
		const sort = new CountingSort( 0, { binCount, workgroupSize } );
		const materialNodes = createMaterialNodes( buffers, sort, localCameraPosition );
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
		 * The number of depth bins used by the group's merged {@link CountingSort}.
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
		 * read {@link GaussianSplatGroup#boundingSphere}, otherwise it stays `null`. Matches
		 * {@link BatchedMesh#boundingBox}, the class this one otherwise mirrors.
		 *
		 * @type {?Box3}
		 * @default null
		 */
		this.boundingBox = null;

		/**
		 * The bounding sphere of the merged splats, in this group's local space. Not computed
		 * by default - call {@link GaussianSplatGroup#computeBoundingSphere} explicitly,
		 * otherwise it stays `null`. Matches {@link BatchedMesh#boundingSphere}, the class
		 * this one otherwise mirrors.
		 *
		 * @type {?Sphere}
		 * @default null
		 */
		this.boundingSphere = null;

		this._splatCount = 0;
		this._maxSphericalHarmonicsDegree = 0;

		// All three live for the group's entire lifetime - see the class documentation.
		this._buffers = buffers;
		this._mergeKernels = createMergeKernelSet( this._buffers, this.workgroupSize );

		this._sortMatrix = uniform( new Matrix4() );
		this._sortDepthRange = uniform( new Vector2( 0, 1 ) );

		this._sort = sort;
		this._sort.setBinNode( () => {

			const center = this._buffers.centerRead.element( instanceIndex ).xyz.toVar( 'center' );
			const viewCenter = this._sortMatrix.mul( vec4( center, 1 ) ).xyz.toVar( 'viewCenter' );
			const depth = viewCenter.z.negate().toVar( 'depth' );
			const range = max( this._sortDepthRange.y.sub( this._sortDepthRange.x ), 0.0001 ).toVar( 'range' );
			const normalized = depth.sub( this._sortDepthRange.x ).div( range ).clamp( 0, 1 ).toVar( 'normalized' );
			const depthBin = uint( normalized.mul( this.binCount - 1 ) ).toVar( 'depthBin' );

			return uint( this.binCount - 1 ).sub( depthBin );

		} );

		this._records = new Map();
		this._nextId = 0;

		// Set by addSplat/deleteSplat/setVisibleAt: which splat ranges are packed into the
		// shared buffers, and at what offsets, changes - so every included instance needs
		// re-merging. setMatrixAt does NOT set this; it only marks that one instance dirty,
		// since moving one splat cloud doesn't change anyone else's offset.
		this._layoutDirty = true;

		this._sortValid = false;
		this._lastSortDirection = new Vector3();

		this._sphericalHarmonicsInitialized = false;
		this._lastSHCameraMatrix = new Matrix4();
		this._lastSHGroupWorldMatrix = new Matrix4();

		this._boundsDirty = true;

		// Unused placeholder required by `createMaterialNodes()`'s signature; the group only
		// ever uses the precomputed-spherical-harmonics vertex node (see `_rebuildMaterial`).
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
		const covarianceAttribute = splatGeometry.getAttribute( 'covariance' );
		const colorAttribute = splatGeometry.getAttribute( 'color' );
		const sphericalHarmonicsDegree = getSphericalHarmonicsDegree( splatGeometry );
		const count = positionAttribute.count;

		if ( splatGeometry.boundingBox === null ) splatGeometry.computeBoundingBox();
		if ( splatGeometry.boundingSphere === null ) splatGeometry.computeBoundingSphere();

		const buffers = createStorageBuffers( count, positionAttribute.array, covarianceAttribute.array, colorAttribute.array, {
			degree: sphericalHarmonicsDegree,
			sh1: sphericalHarmonicsDegree >= 1 ? splatGeometry.getAttribute( 'sphericalHarmonics1' ).array : undefined,
			sh2: sphericalHarmonicsDegree >= 2 ? splatGeometry.getAttribute( 'sphericalHarmonics2' ).array : undefined,
			sh3: sphericalHarmonicsDegree >= 3 ? splatGeometry.getAttribute( 'sphericalHarmonics3' ).array : undefined
		} );

		const id = this._nextId ++;

		this._records.set( id, new SplatRecord( id, splatGeometry, buffers, count, sphericalHarmonicsDegree ) );

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

		disposeStorageBuffers( record.buffers );
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

		if ( record.setMatrix( matrix ) === true ) this._boundsDirty = true;

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
	 * full layout rebuild (every included splat cloud re-merges) on the next render.
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
	 * The number of live (included, i.e. added and visible) splats currently merged into
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

		if ( target === this._buffers.capacity ) return;

		this._resizeBuffers( target );

	}

	/**
	 * Merges every dirty splat cloud into the group's shared buffers, re-sorts the merged
	 * set if the camera has moved enough (or a merge happened), and updates draw state.
	 * Called automatically by the renderer - there is no need to call this directly.
	 *
	 * @param {Renderer} renderer - The renderer.
	 * @param {Object3D} scene - The scene.
	 * @param {Camera} camera - The camera used for rendering.
	 */
	onBeforeRender( renderer, scene, camera ) {

		if ( renderer.backend && renderer.backend.isWebGLBackend === true ) {

			throw new Error( 'THREE.GaussianSplatGroup: the WebGL2 (forceWebGL) backend is not yet supported - see the class documentation. Use independent GaussianSplat instances instead.' );

		}

		if ( this._layoutDirty === true ) this._rebuildLayout();

		// `visible` is left alone here - it's plain user-owned Object3D state. With nothing
		// included, `geometry.instanceCount` is already 0 (see `_rebuildLayout`), which alone
		// is enough to draw nothing.
		if ( this._splatCount === 0 ) return;

		this.updateWorldMatrix( true, false );

		let mergedAny = false;

		for ( const record of this._records.values() ) {

			if ( record.visible === false || record.mergeDirty === false ) continue;

			this._dispatchInstanceMerge( renderer, record );

			record.mergeDirty = false;
			mergedAny = true;

		}

		this._updateSphericalHarmonics( renderer, camera );

		// `_needsSort` must run even when another condition already forces a sort because
		// `updateLastSortDirection` records the direction calculated by that call.
		const directionChanged = this._needsSort( camera );
		const needsResort = this._sortValid === false || mergedAny === true || directionChanged === true;

		if ( needsResort === true ) {

			this._updateSortUniforms( camera );
			this._sort.compute( renderer );

			this._sortValid = true;
			updateLastSortDirection( this._lastSortDirection );

		}

	}

	/**
	 * Computes the bounding box of the merged splats, in this group's local space,
	 * as the union of each included splat cloud's own geometry bounding box transformed
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
		disposeMergeKernels( this._mergeKernels );
		this._sort.dispose();

		for ( const record of this._records.values() ) disposeStorageBuffers( record.buffers );
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
		let maxDegree = 0;

		for ( const record of this._records.values() ) {

			if ( record.visible === true ) {

				total += record.count;
				maxDegree = Math.max( maxDegree, record.sphericalHarmonicsDegree );

			}

		}

		this._splatCount = total;
		this._sort.count = total;

		const requiredCapacity = Math.max( 1, total );

		// `autoCompact` (see the constructor) decides whether shrinking is automatic: `true`
		// resizes to exactly fit on every change (grow or shrink), `false` only ever grows -
		// see `compact()` for the manual shrink path.
		if ( this.autoCompact === true ? requiredCapacity !== this._buffers.capacity : requiredCapacity > this._buffers.capacity ) {

			this._resizeBuffers( requiredCapacity );

		}

		if ( total === 0 ) {

			this.geometry.instanceCount = 0;
			this._boundsDirty = true;

			return;

		}

		if ( maxDegree > 0 ) ensureSphericalHarmonicsContributionNodes( this._buffers );

		// The vertex/fragment node graphs bake `sphericalHarmonicsDegree > 0` in as a JS-level
		// branch (see `createMaterialNodes`), so the material only needs rebuilding - forcing a
		// shader/pipeline recompile - when that degree actually changes. Every other layout
		// change (adding/removing/hiding a splat cloud without changing the merged set's max SH
		// degree) can reuse the existing material as-is: its storage nodes already track the
		// group's buffers by reference, and are repointed in place by `resizeGroupBufferState`.
		const degreeChanged = maxDegree !== this._maxSphericalHarmonicsDegree;

		this._maxSphericalHarmonicsDegree = maxDegree;
		this._buffers.sphericalHarmonicsDegree = maxDegree;

		let offset = 0;

		for ( const record of this._records.values() ) {

			if ( record.visible === false ) continue;

			// Offsets may have shifted for any visible record, even ones whose own
			// transform didn't change - always remerge on a layout rebuild. This also has to
			// force a spherical harmonics recompute even when the offset happens to land back
			// on the same value it had before: while hidden, its old
			// slots in the shared SH contribution buffer are fair game for a different instance
			// to reuse.
			record.setOffset( offset );

			offset += record.count;

		}

		this._boundsDirty = true;

		if ( degreeChanged === true ) {

			this._rebuildMaterial( total );

		} else {

			this.geometry.instanceCount = total;

		}

	}

	// Reallocates the shared buffers to `capacity` and marks every visible record for a full
	// transform/color merge and spherical harmonics update, since
	// `resizeGroupBufferState` allocates fresh, zeroed buffers rather than copying old
	// contents forward (the group's buffers are a derived cache, not owned data - see the
	// class documentation).
	_resizeBuffers( capacity ) {

		resizeGroupBufferState( this._buffers, capacity );

		for ( const record of this._records.values() ) {

			if ( record.visible === false ) continue;

			record.invalidateDerivedData();

		}

	}

	_rebuildMaterial( total ) {

		const materialNodes = createMaterialNodes( this._buffers, this._sort, this._localCameraPosition );

		const oldGeometry = this.geometry;
		const oldMaterial = this.material;

		this.geometry = createGeometry( total );
		this.material = createMaterial( materialNodes.vertexNode, materialNodes.fragmentNode );

		oldGeometry.dispose();
		oldMaterial.dispose();

		this._sortValid = false;

	}

	_dispatchInstanceMerge( renderer, record ) {

		const kernels = this._mergeKernels;

		kernels.baseIndex.value = record.offset;
		kernels.relativeMatrix.value.copy( record.matrix );

		kernels.sourceCenterRead.value = record.buffers.centerRead.value;
		kernels.sourceCovarianceARead.value = record.buffers.covarianceARead.value;
		kernels.sourceCovarianceBRead.value = record.buffers.covarianceBRead.value;

		kernels.transformKernel.count = record.count;
		renderer.compute( kernels.transformKernel );

		kernels.sourceColorRead.value = record.buffers.colorRead.value;

		kernels.colorKernel.count = record.count;
		renderer.compute( kernels.colorKernel );

	}

	// SH coefficients are authored relative to each splat cloud's own unrotated local axes,
	// so contribution is computed per instance, against that instance's own local buffers
	// and local camera position.
	_updateSphericalHarmonics( renderer, camera ) {

		if ( this._maxSphericalHarmonicsDegree === 0 ) return;

		const kernels = this._mergeKernels;

		_groupWorldMatrixInverse.copy( this.matrixWorld ).invert();
		_cameraPositionInGroup.setFromMatrixPosition( camera.matrixWorld ).applyMatrix4( _groupWorldMatrixInverse );

		const viewChanged = this._sphericalHarmonicsInitialized === false ||
			camera.matrixWorld.equals( this._lastSHCameraMatrix ) === false ||
			this.matrixWorld.equals( this._lastSHGroupWorldMatrix ) === false;

		for ( const record of this._records.values() ) {

			if ( record.visible === false ) continue;

			const degree = record.sphericalHarmonicsDegree;

			// Degree-zero records still need one update after a layout change to clear any
			// contribution left in slots previously occupied by a record with SH data.
			if ( record.shDirty === false && ( degree === 0 || viewChanged === false ) ) continue;

			if ( degree > 0 ) {

				_instanceMatrixInverse.copy( record.matrix ).invert();
				record.shLocalCameraPosition.copy( _cameraPositionInGroup ).applyMatrix4( _instanceMatrixInverse );

			}

			const childBuffers = record.buffers;
			const kernel = getOrCreateSHKernel( kernels, this._buffers, degree, this.workgroupSize );

			kernels.baseIndex.value = record.offset;
			kernels.sourceCenterRead.value = childBuffers.centerRead.value;

			if ( degree > 0 ) kernels.shLocalCameraPosition.value.copy( record.shLocalCameraPosition );
			if ( degree >= 1 ) kernels.sourceSH1Read.value = childBuffers.sphericalHarmonics1Read.value;
			if ( degree >= 2 ) kernels.sourceSH2Read.value = childBuffers.sphericalHarmonics2Read.value;
			if ( degree >= 3 ) kernels.sourceSH3Read.value = childBuffers.sphericalHarmonics3Read.value;

			kernel.count = record.count;
			renderer.compute( kernel );
			record.shDirty = false;

		}

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

}

// 1-element placeholder, replaced once real data is available.
function createPlaceholderVec4Attribute() {

	return new StorageBufferAttribute( new Float32Array( 4 ), 4 );

}

function createPlaceholderUintAttribute() {

	return new StorageBufferAttribute( new Uint32Array( 1 ), 1 );

}

// Builds the group's shared storage nodes once - a writable and a read-only node per
// attribute, the same pattern CountingSort uses for orderRead/orderWrite. `capacity`
// tracks the size of the currently allocated buffers (0 until the first resize).
function createGroupBufferState() {

	const centerAttribute = createPlaceholderVec4Attribute();
	const covarianceAAttribute = createPlaceholderVec4Attribute();
	const covarianceBAttribute = createPlaceholderVec4Attribute();
	const colorAttribute = createPlaceholderUintAttribute();

	return {
		capacity: 0,
		sphericalHarmonicsDegree: 0,
		centerAttribute,
		covarianceAAttribute,
		covarianceBAttribute,
		colorAttribute,
		centerWrite: storage( centerAttribute, 'vec4', 0 ),
		centerRead: storage( centerAttribute, 'vec4', 0 ).toReadOnly(),
		covarianceAWrite: storage( covarianceAAttribute, 'vec4', 0 ),
		covarianceARead: storage( covarianceAAttribute, 'vec4', 0 ).toReadOnly(),
		covarianceBWrite: storage( covarianceBAttribute, 'vec4', 0 ),
		covarianceBRead: storage( covarianceBAttribute, 'vec4', 0 ).toReadOnly(),
		colorWrite: storage( colorAttribute, 'uint', 0 ),
		colorRead: storage( colorAttribute, 'uint', 0 ).toReadOnly(),
		sphericalHarmonicsContributionAttribute: null,
		sphericalHarmonicsContributionRead: null,
		sphericalHarmonicsContributionWrite: null
	};

}

// Reallocates `state`'s backing GPU buffers to exactly `capacity` and repoints its
// permanent storage nodes at them - see `createGroupBufferState`.
function resizeGroupBufferState( state, capacity ) {

	const oldCenterAttribute = state.centerAttribute;
	const oldCovarianceAAttribute = state.covarianceAAttribute;
	const oldCovarianceBAttribute = state.covarianceBAttribute;
	const oldColorAttribute = state.colorAttribute;
	const oldContributionAttribute = state.sphericalHarmonicsContributionAttribute;

	state.centerAttribute = new StorageBufferAttribute( new Float32Array( capacity * 4 ), 4 );
	state.covarianceAAttribute = new StorageBufferAttribute( new Float32Array( capacity * 4 ), 4 );
	state.covarianceBAttribute = new StorageBufferAttribute( new Float32Array( capacity * 4 ), 4 );
	state.colorAttribute = new StorageBufferAttribute( new Uint32Array( capacity ), 1 );

	state.centerWrite.value = state.centerAttribute;
	state.centerRead.value = state.centerAttribute;
	state.covarianceAWrite.value = state.covarianceAAttribute;
	state.covarianceARead.value = state.covarianceAAttribute;
	state.covarianceBWrite.value = state.covarianceBAttribute;
	state.covarianceBRead.value = state.covarianceBAttribute;
	state.colorWrite.value = state.colorAttribute;
	state.colorRead.value = state.colorAttribute;

	if ( oldContributionAttribute !== null ) {

		state.sphericalHarmonicsContributionAttribute = new StorageBufferAttribute( new Float32Array( capacity * 4 ), 4 );
		state.sphericalHarmonicsContributionRead.value = state.sphericalHarmonicsContributionAttribute;
		state.sphericalHarmonicsContributionWrite.value = state.sphericalHarmonicsContributionAttribute;

		oldContributionAttribute.dispose();

	}

	state.capacity = capacity;

	oldCenterAttribute.dispose();
	oldCovarianceAAttribute.dispose();
	oldCovarianceBAttribute.dispose();
	oldColorAttribute.dispose();

}

// Lazily allocates the spherical harmonics contribution buffer the first time any instance
// carries SH data - most groups never need it.
function ensureSphericalHarmonicsContributionNodes( state ) {

	if ( state.sphericalHarmonicsContributionRead !== null ) return;

	const attribute = new StorageBufferAttribute( new Float32Array( Math.max( 1, state.capacity ) * 4 ), 4 );

	state.sphericalHarmonicsContributionAttribute = attribute;
	state.sphericalHarmonicsContributionRead = storage( attribute, 'vec4', 0 ).toReadOnly();
	state.sphericalHarmonicsContributionWrite = storage( attribute, 'vec4', 0 );

}

function disposeGroupBufferState( state ) {

	state.centerAttribute.dispose();
	state.covarianceAAttribute.dispose();
	state.covarianceBAttribute.dispose();
	state.colorAttribute.dispose();

	if ( state.sphericalHarmonicsContributionAttribute !== null ) state.sphericalHarmonicsContributionAttribute.dispose();

}

// Builds the compute kernels that transform any instance's local-space splats into the
// group's shared buffers. Reads go through "source" storage nodes whose `.value` is
// repointed at a specific instance's real buffer right before that instance's dispatch. Split
// into separate transform/color/SH kernels because each simultaneously-bound storage
// buffer counts against `maxStorageBuffersPerShaderStage`, whose universal baseline is 8.
function createMergeKernelSet( groupBuffers, workgroupSize ) {

	const baseIndex = uniform( 0, 'uint' );
	const relativeMatrix = uniform( new Matrix4() );

	const sourceCenterRead = storage( createPlaceholderVec4Attribute(), 'vec4', 0 ).toReadOnly();
	const sourceCovarianceARead = storage( createPlaceholderVec4Attribute(), 'vec4', 0 ).toReadOnly();
	const sourceCovarianceBRead = storage( createPlaceholderVec4Attribute(), 'vec4', 0 ).toReadOnly();
	const sourceColorRead = storage( createPlaceholderUintAttribute(), 'uint', 0 ).toReadOnly();

	// position + covariance: 6 storage buffers (3 instance reads, 3 group writes)
	const transformKernel = Fn( () => {

		const srcIndex = instanceIndex;
		const dstIndex = baseIndex.add( srcIndex ).toVar( 'dstIndex' );

		const localCenter = sourceCenterRead.element( srcIndex ).xyz.toVar( 'localCenter' );
		const worldCenter = relativeMatrix.mul( vec4( localCenter, 1 ) ).xyz.toVar( 'worldCenter' );

		groupBuffers.centerWrite.element( dstIndex ).assign( vec4( worldCenter, 0 ) );

		const covA = sourceCovarianceARead.element( srcIndex ).toVar( 'covA' );
		const covB = sourceCovarianceBRead.element( srcIndex ).toVar( 'covB' );

		const cov0 = vec3( covA.x, covA.y, covA.z ).toVar( 'cov0' );
		const cov1 = vec3( covA.y, covA.w, covB.x ).toVar( 'cov1' );
		const cov2 = vec3( covA.z, covB.x, covB.y ).toVar( 'cov2' );

		const m = relativeMatrix;
		const r0 = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x ).toVar( 'r0' );
		const r1 = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y ).toVar( 'r1' );
		const r2 = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z ).toVar( 'r2' );

		const vc0 = vec3( dot( r0, cov0 ), dot( r0, cov1 ), dot( r0, cov2 ) ).toVar( 'vc0' );
		const vc1 = vec3( dot( r1, cov0 ), dot( r1, cov1 ), dot( r1, cov2 ) ).toVar( 'vc1' );
		const vc2 = vec3( dot( r2, cov0 ), dot( r2, cov1 ), dot( r2, cov2 ) ).toVar( 'vc2' );

		const c00 = dot( vc0, r0 ).toVar( 'c00' );
		const c01 = dot( vc0, r1 ).toVar( 'c01' );
		const c02 = dot( vc0, r2 ).toVar( 'c02' );
		const c11 = dot( vc1, r1 ).toVar( 'c11' );
		const c12 = dot( vc1, r2 ).toVar( 'c12' );
		const c22 = dot( vc2, r2 ).toVar( 'c22' );

		groupBuffers.covarianceAWrite.element( dstIndex ).assign( vec4( c00, c01, c02, c11 ) );
		groupBuffers.covarianceBWrite.element( dstIndex ).assign( vec4( c12, c22, 0, 0 ) );

	} )().compute( 1, [ workgroupSize ] ).setName( 'GaussianSplatGroupMergeTransform' );

	// color: 2 storage buffers
	const colorKernel = Fn( () => {

		const dstIndex = baseIndex.add( instanceIndex );

		groupBuffers.colorWrite.element( dstIndex ).assign( sourceColorRead.element( instanceIndex ) );

	} )().compute( 1, [ workgroupSize ] ).setName( 'GaussianSplatGroupMergeColor' );

	return {
		baseIndex,
		relativeMatrix,
		sourceCenterRead,
		sourceCovarianceARead,
		sourceCovarianceBRead,
		sourceColorRead,
		transformKernel,
		colorKernel,
		// spherical harmonics kernels/nodes are built lazily by `getOrCreateSHKernel`
		shLocalCameraPosition: null,
		sourceSH1Read: null,
		sourceSH2Read: null,
		sourceSH3Read: null,
		shKernelsByDegree: new Map()
	};

}

// Returns the shared spherical harmonics kernel for `degree`, building and caching it the
// first time this degree is encountered. The degree-0 kernel just zeroes the contribution,
// for instances with no SH data of their own.
function getOrCreateSHKernel( kernels, groupBuffers, degree, workgroupSize ) {

	let kernel = kernels.shKernelsByDegree.get( degree );

	if ( kernel !== undefined ) return kernel;

	if ( kernels.shLocalCameraPosition === null ) kernels.shLocalCameraPosition = uniform( new Vector3() );

	if ( degree >= 1 && kernels.sourceSH1Read === null ) kernels.sourceSH1Read = storage( createPlaceholderUintAttribute(), 'uint', 0 ).toReadOnly();
	if ( degree >= 2 && kernels.sourceSH2Read === null ) kernels.sourceSH2Read = storage( createPlaceholderUintAttribute(), 'uint', 0 ).toReadOnly();
	if ( degree >= 3 && kernels.sourceSH3Read === null ) kernels.sourceSH3Read = storage( createPlaceholderUintAttribute(), 'uint', 0 ).toReadOnly();

	const sourceCenterRead = kernels.sourceCenterRead;
	const shLocalCameraPosition = kernels.shLocalCameraPosition;
	const baseIndex = kernels.baseIndex;

	// A minimal stand-in for a storage buffer state, exposing just what
	// `applySphericalHarmonics()` reads: this degree's fixed word counts and this
	// kernel set's own shared (swappable) per-band source nodes.
	const syntheticInstanceBuffers = {
		sphericalHarmonicsDegree: degree,
		sphericalHarmonics1Read: kernels.sourceSH1Read,
		sphericalHarmonics1Words: SH_BAND_WORDS[ 1 ],
		sphericalHarmonics2Read: kernels.sourceSH2Read,
		sphericalHarmonics2Words: SH_BAND_WORDS[ 2 ],
		sphericalHarmonics3Read: kernels.sourceSH3Read,
		sphericalHarmonics3Words: SH_BAND_WORDS[ 3 ]
	};

	kernel = Fn( () => {

		const srcIndex = instanceIndex;
		const dstIndex = baseIndex.add( srcIndex );
		const rgb = vec3( 0 ).toVar( 'sphericalHarmonicsContribution' );

		if ( degree > 0 ) {

			const center = sourceCenterRead.element( srcIndex ).xyz.toVar( 'center' );
			applySphericalHarmonics( rgb, center, shLocalCameraPosition, srcIndex, syntheticInstanceBuffers );

		}

		groupBuffers.sphericalHarmonicsContributionWrite.element( dstIndex ).assign( vec4( rgb, 0 ) );

	} )().compute( 1, [ workgroupSize ] ).setName( `GaussianSplatGroupSphericalHarmonics${ degree }` );

	kernels.shKernelsByDegree.set( degree, kernel );

	return kernel;

}

function disposeMergeKernels( kernels ) {

	kernels.transformKernel.dispose();
	kernels.colorKernel.dispose();

	for ( const shKernel of kernels.shKernelsByDegree.values() ) shKernel.dispose();

	kernels.sourceCenterRead.value.dispose();
	kernels.sourceCovarianceARead.value.dispose();
	kernels.sourceCovarianceBRead.value.dispose();
	kernels.sourceColorRead.value.dispose();

	if ( kernels.sourceSH1Read !== null ) kernels.sourceSH1Read.value.dispose();
	if ( kernels.sourceSH2Read !== null ) kernels.sourceSH2Read.value.dispose();
	if ( kernels.sourceSH3Read !== null ) kernels.sourceSH3Read.value.dispose();

}

export { GaussianSplatGroup };
