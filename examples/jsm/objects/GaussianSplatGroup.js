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

/**
 * A container that merges many independent Gaussian splat `BufferGeometry`s into one
 * shared set of storage buffers, sorts the merged set once, and draws it with a single
 * instanced draw call. This is what makes overlapping splat clouds alpha-blend correctly
 * with each other: each cloud sorting and drawing itself independently cannot produce a
 * globally correct back-to-front order across clouds.
 *
 * `GaussianSplatGroup` owns its splat data directly - the same model {@link BatchedMesh}
 * uses for merging many geometries into one draw call - rather than wrapping independent
 * scene-graph children:
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
 * Unlike an earlier design that added independent {@link GaussianSplatMesh} instances as
 * scene-graph children, `GaussianSplatGroup` does not import or otherwise depend on
 * `GaussianSplatMesh` at all - it takes a raw `BufferGeometry` per splat cloud via
 * {@link GaussianSplatGroup#addSplat}. This means all of the group's work (merging changed
 * instances into the shared buffers, sorting, toggling visibility) happens inside its own
 * `onBeforeRender`, exactly like any other `Mesh` - there is no separate `update()` call to
 * remember to make before `renderer.render()`, and no race between a child's visibility and
 * the renderer's render-list construction, because there are no scene-graph children.
 *
 * `setMatrixAt` marks only the affected splat range dirty for re-merging - moving one splat
 * cloud does not re-merge any other cloud. `addSplat`/`deleteSplat`/`setVisibleAt` change
 * which ranges are packed into the shared buffers at all, so they trigger a full layout
 * rebuild (every included splat cloud re-merges) the next time the group renders.
 *
 * The practical ceiling on total live splats across all added geometries is set by the
 * `maxStorageBufferBindingSize` WebGPU limit, not by compute dispatch limits (three.js
 * auto-folds large dispatches into a 2D `dispatchWorkgroups` call, see
 * `WebGPUBackend.computeGroupCount`) or by raw VRAM. The group's largest buffers
 * (`center`, `covarianceA`, `covarianceB`) are 16 bytes/splat each, one binding apiece.
 * Per web3dsurvey.com WebGPU limit data: 100% of surveyed devices support at least a
 * 128 MB binding (~8.4M splats, ~6.7M with this class's default 1.25x growth slack),
 * 97% support 256 MB (~16.8M splats, ~13.4M with slack), and 90% support ~1 GB
 * (~67M splats, ~54M with slack). Design/test against roughly 8-16M total live splats
 * as the "works on effectively all WebGPU hardware" target.
 *
 * The compute kernels that merge splats into the shared buffers (see
 * `createMergeKernelSet()`) and the merged {@link CountingSort} are both built once, in
 * the constructor, and reused for the group's entire lifetime. Per-splat data (source
 * buffers, destination offset, relative transform) is passed in via uniforms and
 * swappable storage node `.value`s rather than baked into the kernel, and the sort's
 * `count` is simply reassigned rather than the sort being replaced, so adding/removing
 * splats or growing the shared buffers (`growGroupBufferState()`) never recompiles a
 * pipeline - only spherical harmonics needs more than one merge kernel variant, since its
 * shading math branches on SH degree at shader-build time; `getOrCreateSHKernel()`
 * compiles one kernel per distinct degree encountered (at most 4) and caches it.
 *
 * This class requires {@link WebGPURenderer} with real WebGPU compute support. The
 * `forceWebGL` (WebGL2) backend is not yet supported - `onBeforeRender` throws rather
 * than silently drawing nothing or drawing an incorrectly ordered result. A future
 * WebGL2 fallback would draw each splat cloud with its own draw call, sorted coarsely
 * against the others by bounding-sphere centroid depth (no cross-cloud per-splat sort,
 * unlike the WebGPU path) - until then, use independent {@link GaussianSplatMesh}
 * instances on WebGL2.
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
	 * @param {number} [options.growthSlack=1.25] - How much extra capacity to allocate in the shared storage buffers beyond the current splat total, to avoid reallocating on every `addSplat`/`deleteSplat`.
	 */
	constructor( { binCount = BIN_COUNT, workgroupSize = WORKGROUP_SIZE, growthSlack = 1.25 } = {} ) {

		const geometry = createGeometry( 0 );

		// Built with real (if empty) buffers/sort rather than null nodes, so the group is
		// safe to compile and draw - 0 instances, nothing visible - from construction. This
		// is what lets `visible` stay a normal, user-owned Object3D property instead of
		// something this class has to flip on/off internally (see `onBeforeRender`).
		const buffers = createGroupBufferState();
		const localCameraPosition = uniform( new Vector3() );
		const sort = new CountingSort( 0, { binCount, workgroupSize, growthSlack } );
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
		 * How much extra capacity to allocate in the shared storage buffers beyond the
		 * current splat total, to avoid reallocating on every `addSplat`/`deleteSplat`.
		 *
		 * @type {number}
		 */
		this.growthSlack = growthSlack;

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

		this._total = 0;
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

		// id -> { geometry, buffers, count, base, matrix, visible, included, matrixDirty,
		// sphericalHarmonicsDegree, shLocalCameraPosition, lastSHCameraMatrix,
		// lastSHGroupWorldMatrix, lastSHMatrix, lastSHBase } - see `addSplat` and `_rebuildLayout`.
		this._instances = new Map();
		this._nextId = 0;

		// Set by addSplat/deleteSplat/setVisibleAt: which splat ranges are packed into the
		// shared buffers, and at what offsets, changes - so every included instance needs
		// re-merging. setMatrixAt does NOT set this; it only marks that one instance dirty,
		// since moving one splat cloud doesn't change anyone else's offset.
		this._layoutDirty = true;

		this._sortInitialized = false;
		this._lastSortDirection = new Vector3();

		// Unused placeholder required by `createMaterialNodes()`'s signature; the group only
		// ever uses the precomputed-spherical-harmonics vertex node (see `_rebuildMaterial`).
		this._localCameraPosition = localCameraPosition;

	}

	/**
	 * Adds a splat cloud to the group.
	 *
	 * @param {BufferGeometry} splatGeometry - The splat geometry to add. Same attribute contract as {@link GaussianSplatMesh}'s constructor.
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

		this._instances.set( id, {
			id,
			geometry: splatGeometry,
			buffers,
			count,
			sphericalHarmonicsDegree,
			base: 0,
			matrix: new Matrix4(),
			visible: true,
			included: false,
			matrixDirty: true,
			shLocalCameraPosition: new Vector3(),
			lastSHCameraMatrix: null,
			lastSHGroupWorldMatrix: null,
			lastSHMatrix: null,
			lastSHBase: - 1
		} );

		this._layoutDirty = true;

		return id;

	}

	/**
	 * Removes a splat cloud from the group, freeing its GPU buffers.
	 *
	 * @param {number} id - The id returned by {@link GaussianSplatGroup#addSplat}.
	 */
	deleteSplat( id ) {

		const record = this._instances.get( id );

		if ( record === undefined ) return;

		disposeStorageBuffers( record.buffers );
		this._instances.delete( id );

		this._layoutDirty = true;

	}

	/**
	 * Sets a splat cloud's transform, relative to this group.
	 *
	 * @param {number} id - The id returned by {@link GaussianSplatGroup#addSplat}.
	 * @param {Matrix4} matrix - The transform, relative to this group's local space.
	 */
	setMatrixAt( id, matrix ) {

		const record = this._getInstance( id );

		record.matrix.copy( matrix );
		record.matrixDirty = true;

	}

	/**
	 * Reads a splat cloud's transform back.
	 *
	 * @param {number} id - The id returned by {@link GaussianSplatGroup#addSplat}.
	 * @param {Matrix4} [target] - The target matrix.
	 * @return {Matrix4} The transform, relative to this group's local space.
	 */
	getMatrixAt( id, target = new Matrix4() ) {

		return target.copy( this._getInstance( id ).matrix );

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

		const record = this._getInstance( id );

		if ( record.visible === visible ) return;

		record.visible = visible;
		this._layoutDirty = true;

	}

	/**
	 * Reads a splat cloud's visibility back.
	 *
	 * @param {number} id - The id returned by {@link GaussianSplatGroup#addSplat}.
	 * @return {boolean} Whether this splat cloud is drawn.
	 */
	getVisibleAt( id ) {

		return this._getInstance( id ).visible;

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

			throw new Error( 'THREE.GaussianSplatGroup: the WebGL2 (forceWebGL) backend is not yet supported - see the class documentation. Use independent GaussianSplatMesh instances instead.' );

		}

		if ( this._layoutDirty === true ) this._rebuildLayout();

		// `visible` is left alone here - it's plain user-owned Object3D state. With nothing
		// included, `geometry.instanceCount` is already 0 (see `_rebuildLayout`), which alone
		// is enough to draw nothing.
		if ( this._total === 0 ) return;

		this.updateWorldMatrix( true, false );

		let mergedAny = false;

		for ( const record of this._instances.values() ) {

			if ( record.included === false || record.matrixDirty === false ) continue;

			this._dispatchInstanceMerge( renderer, record );

			record.matrixDirty = false;
			mergedAny = true;

		}

		if ( mergedAny === true ) this.computeBoundingSphere();

		this._updateSphericalHarmonics( renderer, camera );

		const needsResort = this._sortInitialized === false || mergedAny === true || this._needsSort( camera );

		if ( needsResort === true ) {

			this._updateSortUniforms( camera );
			this._sort.compute( renderer );

			this._sortInitialized = true;
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

		for ( const record of this._instances.values() ) {

			if ( record.included === false ) continue;

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

		for ( const record of this._instances.values() ) {

			if ( record.included === false ) continue;

			_sphere.copy( record.geometry.boundingSphere ).applyMatrix4( record.matrix );
			maxRadius = Math.max( maxRadius, this.boundingSphere.center.distanceTo( _sphere.center ) + _sphere.radius );

		}

		this.boundingSphere.radius = Math.max( this.boundingSphere.radius, maxRadius );

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

		for ( const record of this._instances.values() ) {

			if ( record.included === false ) continue;

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

		for ( const record of this._instances.values() ) disposeStorageBuffers( record.buffers );
		this._instances.clear();

		this.geometry.dispose();
		this.material.dispose();

	}

	_getInstance( id ) {

		const record = this._instances.get( id );

		if ( record === undefined ) throw new Error( `THREE.GaussianSplatGroup: no splat with id ${ id }.` );

		return record;

	}

	_rebuildLayout() {

		this._layoutDirty = false;

		let total = 0;
		let maxDegree = 0;

		for ( const record of this._instances.values() ) {

			record.included = record.visible === true;

			if ( record.included === true ) {

				total += record.count;
				maxDegree = Math.max( maxDegree, record.sphericalHarmonicsDegree );

			}

		}

		this._total = total;
		this._sort.count = total;

		if ( total === 0 ) {

			this.geometry.instanceCount = 0;

			return;

		}

		// buffers are never shrunk back down on removal - growthSlack already keeps
		// headroom for the next addition
		if ( total > this._buffers.capacity ) {

			growGroupBufferState( this._buffers, Math.max( 1, Math.ceil( total * this.growthSlack ) ) );

		}

		if ( maxDegree > 0 ) ensureSphericalHarmonicsContributionNodes( this._buffers );

		this._maxSphericalHarmonicsDegree = maxDegree;
		this._buffers.sphericalHarmonicsDegree = maxDegree;

		let base = 0;

		for ( const record of this._instances.values() ) {

			if ( record.included === false ) continue;

			// base offsets may have shifted for any included instance, even ones whose own
			// transform didn't change - always remerge on a layout rebuild
			record.base = base;
			record.matrixDirty = true;

			base += record.count;

		}

		this._rebuildMaterial( total );

		this.geometry.instanceCount = total;

	}

	_rebuildMaterial( total ) {

		const materialNodes = createMaterialNodes( this._buffers, this._sort, this._localCameraPosition );

		const oldGeometry = this.geometry;
		const oldMaterial = this.material;

		this.geometry = createGeometry( total );
		this.material = createMaterial( materialNodes.vertexNode, materialNodes.fragmentNode );

		oldGeometry.dispose();
		oldMaterial.dispose();

		this._sortInitialized = false;

	}

	_dispatchInstanceMerge( renderer, record ) {

		const kernels = this._mergeKernels;

		kernels.baseIndex.value = record.base;
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
	// and local camera position, rather than once for the merged (rotated) group.
	_updateSphericalHarmonics( renderer, camera ) {

		if ( this._maxSphericalHarmonicsDegree === 0 ) return;

		const kernels = this._mergeKernels;

		_groupWorldMatrixInverse.copy( this.matrixWorld ).invert();
		_cameraPositionInGroup.setFromMatrixPosition( camera.matrixWorld ).applyMatrix4( _groupWorldMatrixInverse );

		for ( const record of this._instances.values() ) {

			if ( record.included === false || record.sphericalHarmonicsDegree === 0 ) continue;

			// record.base can change - shifting where this instance's contribution belongs
			// in the shared buffer - on a layout rebuild that never touches this instance's
			// own camera/group/instance matrices at all (e.g. a *different* instance's
			// visibility was toggled), so it has to be checked independently of them.
			const needsUpdate = record.lastSHCameraMatrix === null ||
				camera.matrixWorld.equals( record.lastSHCameraMatrix ) === false ||
				record.lastSHGroupWorldMatrix === null ||
				this.matrixWorld.equals( record.lastSHGroupWorldMatrix ) === false ||
				record.lastSHMatrix === null ||
				record.matrix.equals( record.lastSHMatrix ) === false ||
				record.base !== record.lastSHBase;

			if ( needsUpdate === false ) continue;

			_instanceMatrixInverse.copy( record.matrix ).invert();
			record.shLocalCameraPosition.copy( _cameraPositionInGroup ).applyMatrix4( _instanceMatrixInverse );

			record.lastSHCameraMatrix = ( record.lastSHCameraMatrix || new Matrix4() ).copy( camera.matrixWorld );
			record.lastSHGroupWorldMatrix = ( record.lastSHGroupWorldMatrix || new Matrix4() ).copy( this.matrixWorld );
			record.lastSHMatrix = ( record.lastSHMatrix || new Matrix4() ).copy( record.matrix );
			record.lastSHBase = record.base;

			const childBuffers = record.buffers;
			const degree = record.sphericalHarmonicsDegree;
			const kernel = getOrCreateSHKernel( kernels, this._buffers, degree, this.workgroupSize );

			kernels.baseIndex.value = record.base;
			kernels.shLocalCameraPosition.value.copy( record.shLocalCameraPosition );
			kernels.sourceCenterRead.value = childBuffers.centerRead.value;

			if ( degree >= 1 ) kernels.sourceSH1Read.value = childBuffers.sphericalHarmonics1Read.value;
			if ( degree >= 2 ) kernels.sourceSH2Read.value = childBuffers.sphericalHarmonics2Read.value;
			if ( degree >= 3 ) kernels.sourceSH3Read.value = childBuffers.sphericalHarmonics3Read.value;

			kernel.count = record.count;
			renderer.compute( kernel );

		}

	}

	_needsSort( camera ) {

		return needsSort( camera, this.matrixWorld, this._lastSortDirection );

	}

	_updateSortUniforms( camera ) {

		this._sortMatrix.value.multiplyMatrices( camera.matrixWorldInverse, this.matrixWorld );

		if ( this.boundingSphere === null ) this.computeBoundingSphere();

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
// tracks the size of the currently allocated buffers (0 until the first grow).
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

// Reallocates `state`'s backing GPU buffers at `capacity` and repoints its permanent
// storage nodes at them - see `createGroupBufferState`.
function growGroupBufferState( state, capacity ) {

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
