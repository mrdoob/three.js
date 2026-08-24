import {
	Box3,
	Matrix4,
	Mesh,
	Ray,
	Sphere,
	DynamicDrawUsage,
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
	enableWebGLBuffers,
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
 * `setMatrixAt` only re-merges the moved splat cloud. `addSplat`, `deleteSplat` and
 * `setVisibleAt` change which ranges are packed into the shared buffers, so they trigger a
 * full rebuild (every visible splat cloud re-merges) on the next render. With real WebGPU
 * these updates run as compute passes. With the WebGL2 fallback backend, the render buffers
 * are merged with transform feedback while JavaScript mirrors transformed centers for the
 * CPU sort.
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
	 * @param {number} [options.binCount=4096] - The number of depth bins used by the group's merged {@link CountingSort}. Larger values improve sort accuracy when splats are spread across a large combined depth range, at the cost of a longer (but still single-pass) prefix sum.
	 * @param {number} [options.workgroupSize=256] - The workgroup size of the compute shaders used for merging and sorting.
	 * @param {boolean} [options.autoCompact=true] - Whether the group's shared storage buffers are kept sized to exactly fit the current live splat total. When `true`, every add/remove/visibility change that changes the total resizes the buffers, growing or shrinking them to fit. When `false`, the buffers only grow - shrinking the live total never reallocates smaller buffers on its own; call {@link GaussianSplatGroup#compact} to shrink them to fit. Can be changed at any time; a change only takes effect the next time buffer sizes are checked, i.e. the next `addSplat`/`deleteSplat`/`setVisibleAt` (or explicit {@link GaussianSplatGroup#compact} call). Defaults to `false` when `initialSize` is given, since preallocating a fixed size and then having it silently shrink would defeat the point - pass `autoCompact: true` explicitly alongside `initialSize` if that's actually what's wanted.
	 * @param {number} [options.initialSize] - Preallocates the shared storage buffers to this many splats up front, so the group doesn't reallocate as splat clouds are added until the live total exceeds it. Useful to size a group for its expected peak (e.g. 2,000,000) once, up front. Implies `autoCompact: false` unless `autoCompact` is explicitly passed.
	 */
	constructor( { binCount = BIN_COUNT, workgroupSize = WORKGROUP_SIZE, autoCompact, initialSize } = {} ) {

		const geometry = createGeometry( 0 );

		// Start with empty draw buffers so the group can be added to a scene before any
		// splat clouds are loaded.
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
		this._maxSphericalHarmonicsDegree = 0;

		this._buffers = buffers;
		this._mergeKernels = createMergeKernelSet( this._buffers, this.workgroupSize );

		this._sortMatrix = uniform( new Matrix4() );
		this._sortDepthRange = uniform( new Vector2( 0, 1 ) );

		this._sort = sort;
		this._sortCenters = new Float32Array( Math.max( 1, this._buffers.capacity ) * 4 );
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
	 * full layout rebuild (every visible splat cloud re-merges) on the next render.
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
	 * The number of live (added and visible) splats currently merged into
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

		if ( this._layoutDirty === true ) this._rebuildLayout();

		// Keep Object3D.visible user-controlled; an empty group draws zero instances.
		if ( this._splatCount === 0 ) return;

		const isWebGLBackend = renderer.backend && renderer.backend.isWebGLBackend === true;

		if ( isWebGLBackend === true ) {

			enableGroupWebGLBuffers( this._buffers );
			this._sort.enableWebGLBuffers();

		}

		this.updateWorldMatrix( true, false );

		let mergedAny = false;

		for ( const record of this._records.values() ) {

			if ( record.visible === false || record.mergeDirty === false ) continue;

			if ( isWebGLBackend === true ) {

				enableWebGLBuffers( record.buffers );
				this._dispatchInstanceMerge( renderer, record );
				this._mergeCentersCPU( record );

			} else {

				this._dispatchInstanceMerge( renderer, record );

			}

			record.mergeDirty = false;
			mergedAny = true;

		}

		if ( isWebGLBackend === true ) {

			this._updateSphericalHarmonicsCPU( camera );

		} else {

			this._updateSphericalHarmonics( renderer, camera );

		}

		// Refresh the current view direction before recording it after a sort.
		const directionChanged = this._needsSort( camera );
		const needsResort = this._sortValid === false || mergedAny === true || directionChanged === true;

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

		// autoCompact controls whether capacity shrinks automatically or only via compact().
		if ( this.autoCompact === true ? requiredCapacity !== this._buffers.capacity : requiredCapacity > this._buffers.capacity ) {

			this._resizeBuffers( requiredCapacity );

		}

		if ( total === 0 ) {

			this.geometry.instanceCount = 0;
			this._boundsDirty = true;

			return;

		}

		if ( maxDegree > 0 ) ensureSphericalHarmonicsContributionNodes( this._buffers );

		// The material graph depends on whether the merged set uses spherical harmonics.
		// Other layout changes can reuse the existing storage nodes.
		const degreeChanged = maxDegree !== this._maxSphericalHarmonicsDegree;

		this._maxSphericalHarmonicsDegree = maxDegree;
		this._buffers.sphericalHarmonicsDegree = maxDegree;

		let offset = 0;

		for ( const record of this._records.values() ) {

			if ( record.visible === false ) continue;

			// Offsets define where each cloud writes into the shared buffers.
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

	// Shared buffers are derived from the source splat clouds, so resizing invalidates every
	// visible record's merged data.
	_resizeBuffers( capacity ) {

		resizeGroupBufferState( this._buffers, capacity );
		this._sortCenters = new Float32Array( capacity * 4 );

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

	_mergeCentersCPU( record ) {

		const sourceCenter = record.buffers.centerRead.value.array;
		const targetCenter = this._sortCenters;
		const e = record.matrix.elements;

		for ( let i = 0; i < record.count; i ++ ) {

			const sourceIndex = i * 4;
			const targetSplat = record.offset + i;
			const targetIndex = targetSplat * 4;
			const x = sourceCenter[ sourceIndex ];
			const y = sourceCenter[ sourceIndex + 1 ];
			const z = sourceCenter[ sourceIndex + 2 ];

			targetCenter[ targetIndex ] = e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z + e[ 12 ];
			targetCenter[ targetIndex + 1 ] = e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z + e[ 13 ];
			targetCenter[ targetIndex + 2 ] = e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ];
			targetCenter[ targetIndex + 3 ] = 0;

		}

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

	_updateSphericalHarmonicsCPU( camera ) {

		if ( this._maxSphericalHarmonicsDegree === 0 ) return;

		const contribution = this._buffers.sphericalHarmonicsContributionAttribute.array;
		let updated = false;

		_groupWorldMatrixInverse.copy( this.matrixWorld ).invert();
		_cameraPositionInGroup.setFromMatrixPosition( camera.matrixWorld ).applyMatrix4( _groupWorldMatrixInverse );

		const viewChanged = this._sphericalHarmonicsInitialized === false ||
			camera.matrixWorld.equals( this._lastSHCameraMatrix ) === false ||
			this.matrixWorld.equals( this._lastSHGroupWorldMatrix ) === false;

		for ( const record of this._records.values() ) {

			if ( record.visible === false ) continue;

			const degree = record.sphericalHarmonicsDegree;

			if ( record.shDirty === false && ( degree === 0 || viewChanged === false ) ) continue;

			if ( degree > 0 ) {

				_instanceMatrixInverse.copy( record.matrix ).invert();
				record.shLocalCameraPosition.copy( _cameraPositionInGroup ).applyMatrix4( _instanceMatrixInverse );

			}

			const center = record.buffers.centerRead.value.array;

			for ( let i = 0; i < record.count; i ++ ) {

				const targetIndex = ( record.offset + i ) * 4;

				if ( degree === 0 ) {

					contribution[ targetIndex ] = 0;
					contribution[ targetIndex + 1 ] = 0;
					contribution[ targetIndex + 2 ] = 0;
					contribution[ targetIndex + 3 ] = 0;

				} else {

					evaluateSphericalHarmonicsCPU( record.buffers, i, center, record.shLocalCameraPosition, contribution, targetIndex );

				}

			}

			record.shDirty = false;
			updated = true;

		}

		if ( updated === true ) updateStorageAttribute( this._buffers.sphericalHarmonicsContributionAttribute );

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

		const centers = this._sortCenters;
		const matrix = this._sortMatrix.value.elements;
		const nearDepth = this._sortDepthRange.value.x;
		const range = Math.max( this._sortDepthRange.value.y - nearDepth, 0.0001 );
		const scale = ( this.binCount - 1 ) / range;

		this._sort.computeCPU( ( i ) => {

			const i4 = i * 4;
			const depth = - ( matrix[ 2 ] * centers[ i4 ] + matrix[ 6 ] * centers[ i4 + 1 ] + matrix[ 10 ] * centers[ i4 + 2 ] + matrix[ 14 ] );
			const depthBin = Math.min( this.binCount - 1, Math.max( 0, Math.floor( ( depth - nearDepth ) * scale ) ) );

			return this.binCount - 1 - depthBin;

		} );

	}

}

function updateStorageAttribute( attribute ) {

	attribute.needsUpdate = true;

	if ( attribute.pbo !== undefined ) attribute.pbo.needsUpdate = true;

}

function enableGroupWebGLBuffers( state ) {

	if ( state.webGLBuffersEnabled === true ) return;

	state.centerAttribute.setUsage( DynamicDrawUsage );
	state.covarianceAAttribute.setUsage( DynamicDrawUsage );
	state.covarianceBAttribute.setUsage( DynamicDrawUsage );
	state.colorAttribute.setUsage( DynamicDrawUsage );

	state.centerRead.setPBO( true );
	state.covarianceARead.setPBO( true );
	state.covarianceBRead.setPBO( true );
	state.colorRead.setPBO( true );

	if ( state.sphericalHarmonicsContributionAttribute !== null ) {

		state.sphericalHarmonicsContributionAttribute.setUsage( DynamicDrawUsage );
		state.sphericalHarmonicsContributionRead.setPBO( true );

	}

	state.webGLBuffersEnabled = true;

}

function unpackSphericalHarmonicsCoefficientCPU( words, component ) {

	const packed = words[ component >> 2 ];
	const byte = ( packed >> ( ( component & 3 ) * 8 ) ) & 0xff;

	return ( byte - 128 ) / 128;

}

function accumulateSphericalHarmonicsBandCPU( band, componentCount, weights, target, targetIndex ) {

	for ( let i = 0; i < componentCount / 3; i ++ ) {

		const weight = weights[ i ];
		const coefficientIndex = i * 3;

		target[ targetIndex ] += unpackSphericalHarmonicsCoefficientCPU( band, coefficientIndex ) * weight;
		target[ targetIndex + 1 ] += unpackSphericalHarmonicsCoefficientCPU( band, coefficientIndex + 1 ) * weight;
		target[ targetIndex + 2 ] += unpackSphericalHarmonicsCoefficientCPU( band, coefficientIndex + 2 ) * weight;

	}

}

function evaluateSphericalHarmonicsCPU( buffers, splatIndex, center, localCameraPosition, target, targetIndex ) {

	const centerIndex = splatIndex * 4;
	let x = center[ centerIndex ] - localCameraPosition.x;
	let y = center[ centerIndex + 1 ] - localCameraPosition.y;
	let z = center[ centerIndex + 2 ] - localCameraPosition.z;
	const length = Math.sqrt( x * x + y * y + z * z );

	if ( length > 0 ) {

		x /= length;
		y /= length;
		z /= length;

	}

	target[ targetIndex ] = 0;
	target[ targetIndex + 1 ] = 0;
	target[ targetIndex + 2 ] = 0;
	target[ targetIndex + 3 ] = 0;

	const sh1 = buffers.sphericalHarmonics1Read.value.array.subarray(
		splatIndex * SH_BAND_WORDS[ 1 ],
		( splatIndex + 1 ) * SH_BAND_WORDS[ 1 ]
	);

	accumulateSphericalHarmonicsBandCPU( sh1, 9, [
		y * - 0.4886025,
		z * 0.4886025,
		x * - 0.4886025
	], target, targetIndex );

	if ( buffers.sphericalHarmonicsDegree >= 2 ) {

		const xx = x * x;
		const yy = y * y;
		const zz = z * z;
		const sh2 = buffers.sphericalHarmonics2Read.value.array.subarray(
			splatIndex * SH_BAND_WORDS[ 2 ],
			( splatIndex + 1 ) * SH_BAND_WORDS[ 2 ]
		);

		accumulateSphericalHarmonicsBandCPU( sh2, 15, [
			x * y * 1.0925484,
			y * z * - 1.0925484,
			( zz * 2 - xx - yy ) * 0.3153915,
			x * z * - 1.0925484,
			( xx - yy ) * 0.5462742
		], target, targetIndex );

		if ( buffers.sphericalHarmonicsDegree >= 3 ) {

			const xy = x * y;
			const sh3 = buffers.sphericalHarmonics3Read.value.array.subarray(
				splatIndex * SH_BAND_WORDS[ 3 ],
				( splatIndex + 1 ) * SH_BAND_WORDS[ 3 ]
			);

			accumulateSphericalHarmonicsBandCPU( sh3, 21, [
				y * ( xx * 3 - yy ) * - 0.5900436,
				xy * z * 2.8906114,
				y * ( zz * 4 - xx - yy ) * - 0.4570458,
				z * ( zz * 2 - xx * 3 - yy * 3 ) * 0.3731763,
				x * ( zz * 4 - xx - yy ) * - 0.4570458,
				z * ( xx - yy ) * 1.4453057,
				x * ( xx - yy * 3 ) * - 0.5900436
			], target, targetIndex );

		}

	}

}

// Storage nodes need a valid attribute even before any splats are added.
function createPlaceholderVec4Attribute() {

	return new StorageBufferAttribute( new Float32Array( 4 ), 4 );

}

function createPlaceholderUintAttribute() {

	return new StorageBufferAttribute( new Uint32Array( 1 ), 1 );

}

// Builds the shared storage nodes used by the grouped draw and merge kernels.
function createGroupBufferState() {

	const centerAttribute = createPlaceholderVec4Attribute();
	const covarianceAAttribute = createPlaceholderVec4Attribute();
	const covarianceBAttribute = createPlaceholderVec4Attribute();
	const colorAttribute = createPlaceholderUintAttribute();

	return {
		capacity: 0,
		sphericalHarmonicsDegree: 0,
		webGLBuffersEnabled: false,
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

// Resizes the shared storage attributes while keeping their storage nodes stable.
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
	state.webGLBuffersEnabled = false;

	oldCenterAttribute.dispose();
	oldCovarianceAAttribute.dispose();
	oldCovarianceBAttribute.dispose();
	oldColorAttribute.dispose();

}

// Groups without spherical harmonics skip this extra contribution buffer.
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

// Builds kernels that transform one splat cloud at a time into the shared buffers.
// The source storage nodes are repointed to the current record before each dispatch.
function createMergeKernelSet( groupBuffers, workgroupSize ) {

	const baseIndex = uniform( 0, 'uint' );
	const relativeMatrix = uniform( new Matrix4() );

	const sourceCenterRead = storage( createPlaceholderVec4Attribute(), 'vec4', 0 ).toReadOnly();
	const sourceCovarianceARead = storage( createPlaceholderVec4Attribute(), 'vec4', 0 ).toReadOnly();
	const sourceCovarianceBRead = storage( createPlaceholderVec4Attribute(), 'vec4', 0 ).toReadOnly();
	const sourceColorRead = storage( createPlaceholderUintAttribute(), 'uint', 0 ).toReadOnly();

	// Position and covariance use six storage buffers total.
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

	// Color is split out to stay below portable storage-buffer limits.
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
		// Spherical harmonics kernels are created only when needed.
		shLocalCameraPosition: null,
		sourceSH1Read: null,
		sourceSH2Read: null,
		sourceSH3Read: null,
		shKernelsByDegree: new Map()
	};

}

// Returns the spherical harmonics contribution kernel for the requested degree.
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

	// `applySphericalHarmonics()` only needs the degree, word counts, and band buffers.
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
