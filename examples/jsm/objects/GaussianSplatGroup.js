import {
	Box3,
	Matrix4,
	Mesh,
	Sphere,
	StorageBufferAttribute,
	Vector2,
	Vector3
} from 'three/webgpu';

import {
	Fn,
	dot,
	instanceIndex,
	max,
	storage,
	uint,
	uniform,
	vec3,
	vec4
} from 'three/tsl';

import { CountingSort } from '../gpgpu/CountingSort.js';
import { SH_BAND_WORDS } from '../utils/GaussianSplatUtils.js';
import {
	BIN_COUNT,
	WORKGROUP_SIZE,
	SORT_DIRECTION_THRESHOLD,
	applySphericalHarmonics,
	createGeometry,
	createMaterial,
	createMaterialNodes
} from './GaussianSplatMesh.js';

const _worldCenter = /*@__PURE__*/ new Vector3();
const _viewCenter = /*@__PURE__*/ new Vector3();
const _worldScale = /*@__PURE__*/ new Vector3();
const _sortDirection = /*@__PURE__*/ new Vector3();
const _modelViewMatrix = /*@__PURE__*/ new Matrix4();
const _worldMatrixInverse = /*@__PURE__*/ new Matrix4();
const _groupWorldMatrixInverse = /*@__PURE__*/ new Matrix4();
const _box = /*@__PURE__*/ new Box3();
const _sphere = /*@__PURE__*/ new Sphere();

/**
 * A container that merges multiple {@link GaussianSplatMesh} children into one shared
 * set of storage buffers, sorts the merged set once, and draws it with a single
 * instanced draw call. This is what makes overlapping `GaussianSplatMesh` instances
 * alpha-blend correctly with each other: each mesh sorting and drawing itself
 * independently cannot produce a globally correct back-to-front order across meshes.
 *
 * Only children with `isGaussianSplatMesh === true` are merged; other children are
 * rendered normally by the standard scene traversal.
 *
 * Like {@link GaussianSplatMesh}, this class requires {@link WebGPURenderer} with real
 * WebGPU compute support. On the `forceWebGL` (WebGL2) backend, `GaussianSplatGroup`
 * draws nothing and its children fall back to rendering themselves independently
 * (correct within each mesh, but not correctly interleaved across meshes).
 *
 * Because whether a child renders itself or is suppressed in favor of the group's
 * merged draw is decided by `child.visible` - which the renderer reads while building
 * its render list, before any object's `onBeforeRender` runs - `GaussianSplatGroup`
 * cannot make this decision from inside `onBeforeRender`. Call {@link GaussianSplatGroup#update}
 * once per frame *before* `renderer.render( scene, camera )`:
 *
 * ```js
 * const group = new GaussianSplatGroup();
 * group.add( splatsA, splatsB );
 * scene.add( group );
 *
 * function animate() {
 *
 * 	group.update( renderer, camera );
 * 	renderer.render( scene, camera );
 *
 * }
 * ```
 *
 * The practical ceiling on total live splats across all children is set by the
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
 * The compute kernels that merge children into the shared buffers (see
 * `createMergeKernelSet()`) are built once, in the constructor, and reused for the
 * group's entire lifetime. Per-child data (source buffers, destination offset, relative
 * transform) is passed in via uniforms and swappable storage node `.value`s rather than
 * baked into the kernel, so adding/removing children or growing the shared buffers
 * (`growGroupBufferState()`) never recompiles a pipeline - only spherical harmonics needs
 * more than one kernel variant, since its shading math branches on SH degree at
 * shader-build time; `getOrCreateSHKernel()` compiles one kernel per distinct degree
 * encountered (at most 4) and caches it.
 *
 * @augments Mesh
 * @three_import import { GaussianSplatGroup } from 'three/addons/objects/GaussianSplatGroup.js';
 */
class GaussianSplatGroup extends Mesh {

	/**
	 * Constructs a new Gaussian splat group.
	 *
	 * @param {Object} [options] - Options.
	 * @param {number} [options.binCount=4096] - The number of depth bins used by the group's merged {@link CountingSort}. Larger values improve sort accuracy when children are spread across a large combined depth range, at the cost of a longer (but still single-pass) prefix sum.
	 * @param {number} [options.workgroupSize=256] - The workgroup size of the compute shaders used for merging and sorting.
	 * @param {number} [options.growthSlack=1.25] - How much extra capacity to allocate in the shared storage buffers beyond the current splat total, to avoid reallocating on every child add/remove.
	 */
	constructor( { binCount = BIN_COUNT, workgroupSize = WORKGROUP_SIZE, growthSlack = 1.25 } = {} ) {

		const geometry = createGeometry( 0 );
		const material = createMaterial( null, null );

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
		 * current splat total, to avoid reallocating on every child add/remove.
		 *
		 * @type {number}
		 */
		this.growthSlack = growthSlack;

		/**
		 * The bounding box of the merged splats, in this group's local space. Can be
		 * computed via {@link GaussianSplatGroup#computeBoundingBox}.
		 *
		 * @type {?Box3}
		 * @default null
		 */
		this.boundingBox = null;

		/**
		 * The bounding sphere of the merged splats, in this group's local space. Can be
		 * computed via {@link GaussianSplatGroup#computeBoundingSphere}.
		 *
		 * @type {?Sphere}
		 * @default null
		 */
		this.boundingSphere = null;

		this._total = 0;
		this._maxSphericalHarmonicsDegree = 0;
		this._mappingDirty = true;

		// Both live for the group's entire lifetime - see the class documentation.
		this._buffers = createGroupBufferState();
		this._mergeKernels = createMergeKernelSet( this._buffers, this.workgroupSize );

		this._sort = null;

		// GaussianSplatMesh -> { base, count, relativeMatrix, lastMatrix,
		// sphericalHarmonicsDegree, shLocalCameraPosition, lastSHCameraMatrix,
		// lastSHWorldMatrix } - see `_rebuildMapping` and `_updateSphericalHarmonics`.
		this._childState = new Map();

		this._sortMatrix = uniform( new Matrix4() );
		this._sortDepthRange = uniform( new Vector2( 0, 1 ) );
		this._sortInitialized = false;
		this._lastSortDirection = new Vector3();
		this._lastGroupWorldMatrix = null;

		// Unused placeholder required by `createMaterialNodes()`'s signature; spherical
		// harmonics is computed per child in `_updateSphericalHarmonics()` instead.
		this._localCameraPosition = uniform( new Vector3() );

		// Nothing has been merged yet; avoid the renderer building a pipeline for the
		// placeholder null-node material above. `update()` makes this visible once
		// real buffers/material exist.
		this.visible = false;

		this.addEventListener( 'childadded', () => {

			this._mappingDirty = true;

		} );

		this.addEventListener( 'childremoved', () => {

			this._mappingDirty = true;

		} );

	}

	/**
	 * Merges every `GaussianSplatMesh` child into the group's shared buffers (only
	 * re-transforming children whose transform changed since the last call), re-sorts
	 * the merged set if the camera has moved enough, and toggles child/group visibility
	 * for the current backend. Must be called once per frame *before* `renderer.render()`
	 * - see the class documentation for why.
	 *
	 * @param {Renderer} renderer - The renderer.
	 * @param {Camera} camera - The camera used for rendering.
	 * @return {boolean} Whether the group has splats to draw this frame.
	 */
	update( renderer, camera ) {

		const isWebGLBackend = renderer.backend && renderer.backend.isWebGLBackend === true;

		if ( isWebGLBackend === true ) {

			// keep this group itself traversable so its children are still visited by
			// the renderer - `this.visible = false` would also hide them, since scene
			// traversal skips an invisible object's entire subtree (see Renderer's
			// `_projectObject`). Suppress only this group's own (stale/empty) merged
			// draw call by zeroing its instance count.
			this._setChildrenVisible( true );
			this.visible = true;
			this.geometry.instanceCount = 0;

			return false;

		}

		this._setChildrenVisible( false );

		if ( this._mappingDirty === true ) this._rebuildMapping();

		if ( this._total === 0 ) {

			this.visible = false;

			return false;

		}

		this.visible = true;

		// reasserted on every successful merge pass (not just when `_rebuildMapping()`
		// runs) so external code that suppresses this group's own draw by zeroing
		// `geometry.instanceCount` - e.g. to fall back to per-child rendering, as
		// `update()`'s own WebGL-backend branch above does - can't leave it stuck at 0
		// once merging resumes here.
		this.geometry.instanceCount = this._total;
		this.updateWorldMatrix( true, false );

		const groupMoved = this._lastGroupWorldMatrix === null || this._lastGroupWorldMatrix.equals( this.matrixWorld ) === false;
		let mergedAny = false;

		for ( const [ child, state ] of this._childState ) {

			child.updateWorldMatrix( true, false );

			if ( groupMoved === true || state.lastMatrix === null || state.lastMatrix.equals( child.matrixWorld ) === false ) {

				_groupWorldMatrixInverse.copy( this.matrixWorld ).invert();
				state.relativeMatrix.multiplyMatrices( _groupWorldMatrixInverse, child.matrixWorld );

				this._dispatchChildMerge( renderer, child, state );

				state.lastMatrix = ( state.lastMatrix || new Matrix4() ).copy( child.matrixWorld );
				mergedAny = true;

			}

		}

		if ( groupMoved === true ) {

			this._lastGroupWorldMatrix = ( this._lastGroupWorldMatrix || new Matrix4() ).copy( this.matrixWorld );

		}

		if ( mergedAny === true ) this.computeBoundingSphere();

		this._updateSphericalHarmonics( renderer, camera );

		const needsSort = this._sortInitialized === false || mergedAny === true || this._needsSort( camera );

		if ( needsSort === true ) {

			this._updateSortUniforms( camera );
			this._sort.compute( renderer );

			this._sortInitialized = true;
			this._lastSortDirection.copy( _sortDirection );

		}

		return true;

	}

	/**
	 * Computes the bounding box of the merged splats, in this group's local space,
	 * as the union of each child's own bounding box transformed by that child's
	 * transform relative to this group.
	 */
	computeBoundingBox() {

		if ( this.boundingBox === null ) this.boundingBox = new Box3();

		this.boundingBox.makeEmpty();

		for ( const [ child, state ] of this._childState ) {

			if ( child.boundingBox === null ) child.computeBoundingBox();

			_box.copy( child.boundingBox ).applyMatrix4( state.relativeMatrix );
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

		for ( const [ child, state ] of this._childState ) {

			if ( child.boundingSphere === null ) child.computeBoundingSphere();

			_sphere.copy( child.boundingSphere ).applyMatrix4( state.relativeMatrix );
			maxRadius = Math.max( maxRadius, this.boundingSphere.center.distanceTo( _sphere.center ) + _sphere.radius );

		}

		this.boundingSphere.radius = Math.max( this.boundingSphere.radius, maxRadius );

	}

	/**
	 * Computes intersection points between a casted ray and the splats, by delegating
	 * to each `GaussianSplatMesh` child's own {@link GaussianSplatMesh#raycast}
	 * (bypassing the normal recursive-raycast visibility check, since children are kept
	 * invisible - for rendering purposes only - while merged into this group).
	 *
	 * @param {Raycaster} raycaster - The raycaster.
	 * @param {Array<Object>} intersects - The target array that holds the intersection points.
	 */
	raycast( raycaster, intersects ) {

		for ( const child of this.children ) {

			if ( child.isGaussianSplatMesh === true ) child.raycast( raycaster, intersects );

		}

	}

	/**
	 * Frees the GPU resources owned by this group (shared storage buffers, sort
	 * buffers, geometry and material). Does not dispose its children.
	 */
	dispose() {

		disposeGroupBufferState( this._buffers );
		disposeMergeKernels( this._mergeKernels );
		if ( this._sort !== null ) this._sort.dispose();

		this.geometry.dispose();
		this.material.dispose();

	}

	_setChildrenVisible( visible ) {

		for ( const child of this.children ) {

			if ( child.isGaussianSplatMesh === true ) child.visible = visible;

		}

	}

	_rebuildMapping() {

		this._mappingDirty = false;

		const children = this.children.filter( ( child ) => child.isGaussianSplatMesh === true );

		let total = 0;
		let maxDegree = 0;

		for ( const child of children ) {

			total += child.splatGeometry.getAttribute( 'position' ).count;
			maxDegree = Math.max( maxDegree, child._buffers.sphericalHarmonicsDegree );

		}

		this._total = total;
		this._childState.clear();

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

		for ( const child of children ) {

			const count = child.splatGeometry.getAttribute( 'position' ).count;

			this._childState.set( child, {
				base,
				count,
				relativeMatrix: new Matrix4(),
				lastMatrix: null,
				sphericalHarmonicsDegree: child._buffers.sphericalHarmonicsDegree,
				shLocalCameraPosition: new Vector3(),
				lastSHCameraMatrix: null,
				lastSHWorldMatrix: null
			} );

			base += count;

		}

		this._rebuildSortAndMaterial( total );

		this.geometry.instanceCount = total;

	}

	_rebuildSortAndMaterial( total ) {

		if ( this._sort !== null ) this._sort.dispose();

		this._sort = new CountingSort( total, { binCount: this.binCount, workgroupSize: this.workgroupSize } );

		const buffers = this._buffers;
		const sort = this._sort;
		const sortMatrix = this._sortMatrix;
		const sortDepthRange = this._sortDepthRange;
		const binCount = this.binCount;

		sort.setBinNode( () => {

			const center = buffers.centerRead.element( instanceIndex ).xyz.toVar( 'center' );
			const viewCenter = sortMatrix.mul( vec4( center, 1 ) ).xyz.toVar( 'viewCenter' );
			const depth = viewCenter.z.negate().toVar( 'depth' );
			const range = max( sortDepthRange.y.sub( sortDepthRange.x ), 0.0001 ).toVar( 'range' );
			const normalized = depth.sub( sortDepthRange.x ).div( range ).clamp( 0, 1 ).toVar( 'normalized' );
			const depthBin = uint( normalized.mul( binCount - 1 ) ).toVar( 'depthBin' );

			return uint( binCount - 1 ).sub( depthBin );

		} );

		const materialNodes = createMaterialNodes( buffers, sort, this._localCameraPosition );

		const oldGeometry = this.geometry;
		const oldMaterial = this.material;

		this.geometry = createGeometry( total );
		this.material = createMaterial( materialNodes.vertexNode, materialNodes.fragmentNode );

		oldGeometry.dispose();
		oldMaterial.dispose();

		this._sortInitialized = false;

	}

	_dispatchChildMerge( renderer, child, state ) {

		const kernels = this._mergeKernels;
		const childBuffers = child._buffers;

		kernels.baseIndex.value = state.base;
		kernels.relativeMatrix.value.copy( state.relativeMatrix );

		kernels.sourceCenterRead.value = childBuffers.centerRead.value;
		kernels.sourceCovarianceARead.value = childBuffers.covarianceARead.value;
		kernels.sourceCovarianceBRead.value = childBuffers.covarianceBRead.value;

		kernels.transformKernel.count = state.count;
		renderer.compute( kernels.transformKernel );

		kernels.sourceColorRead.value = childBuffers.colorRead.value;

		kernels.colorKernel.count = state.count;
		renderer.compute( kernels.colorKernel );

	}

	// SH coefficients are authored relative to each child's own unrotated local axes, so
	// contribution is computed per child, against that child's own local buffers and
	// local camera position, rather than once for the merged (rotated) group.
	_updateSphericalHarmonics( renderer, camera ) {

		if ( this._maxSphericalHarmonicsDegree === 0 ) return;

		const kernels = this._mergeKernels;

		for ( const [ child, state ] of this._childState ) {

			const needsUpdate = state.lastSHCameraMatrix === null ||
				camera.matrixWorld.equals( state.lastSHCameraMatrix ) === false ||
				state.lastSHWorldMatrix === null ||
				child.matrixWorld.equals( state.lastSHWorldMatrix ) === false;

			if ( needsUpdate === false ) continue;

			_worldMatrixInverse.copy( child.matrixWorld ).invert();
			state.shLocalCameraPosition.setFromMatrixPosition( camera.matrixWorld ).applyMatrix4( _worldMatrixInverse );

			state.lastSHCameraMatrix = ( state.lastSHCameraMatrix || new Matrix4() ).copy( camera.matrixWorld );
			state.lastSHWorldMatrix = ( state.lastSHWorldMatrix || new Matrix4() ).copy( child.matrixWorld );

			const childBuffers = child._buffers;
			const degree = state.sphericalHarmonicsDegree;
			const kernel = getOrCreateSHKernel( kernels, this._buffers, degree, this.workgroupSize );

			kernels.baseIndex.value = state.base;
			kernels.shLocalCameraPosition.value.copy( state.shLocalCameraPosition );
			kernels.sourceCenterRead.value = childBuffers.centerRead.value;

			if ( degree >= 1 ) kernels.sourceSH1Read.value = childBuffers.sphericalHarmonics1Read.value;
			if ( degree >= 2 ) kernels.sourceSH2Read.value = childBuffers.sphericalHarmonics2Read.value;
			if ( degree >= 3 ) kernels.sourceSH3Read.value = childBuffers.sphericalHarmonics3Read.value;

			kernel.count = state.count;
			renderer.compute( kernel );

		}

	}

	_needsSort( camera ) {

		_modelViewMatrix.multiplyMatrices( camera.matrixWorldInverse, this.matrixWorld );

		const e = _modelViewMatrix.elements;
		_sortDirection.set( e[ 2 ], e[ 6 ], e[ 10 ] ).normalize();

		return _sortDirection.dot( this._lastSortDirection ) < SORT_DIRECTION_THRESHOLD;

	}

	_updateSortUniforms( camera ) {

		this._sortMatrix.value.multiplyMatrices( camera.matrixWorldInverse, this.matrixWorld );

		if ( this.boundingSphere === null ) this.computeBoundingSphere();

		_worldCenter.copy( this.boundingSphere.center ).applyMatrix4( this.matrixWorld );
		_viewCenter.copy( _worldCenter ).applyMatrix4( camera.matrixWorldInverse );

		_worldScale.setFromMatrixScale( this.matrixWorld );

		const radius = this.boundingSphere.radius * Math.max( _worldScale.x, _worldScale.y, _worldScale.z );
		const depth = - _viewCenter.z;
		const nearDepth = Math.max( camera.near, depth - radius );
		const farDepth = Math.max( nearDepth + 0.0001, depth + radius );

		this._sortDepthRange.value.set( nearDepth, farDepth );

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

// Lazily allocates the spherical harmonics contribution buffer the first time any child
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

// Builds the compute kernels that transform any child's local-space splats into the
// group's shared buffers. Reads go through "source" storage nodes whose `.value` is
// repointed at a specific child's real buffer right before that child's dispatch. Split
// into separate transform/color/SH kernels because each simultaneously-bound storage
// buffer counts against `maxStorageBuffersPerShaderStage`, whose universal baseline is 8.
function createMergeKernelSet( groupBuffers, workgroupSize ) {

	const baseIndex = uniform( 0, 'uint' );
	const relativeMatrix = uniform( new Matrix4() );

	const sourceCenterRead = storage( createPlaceholderVec4Attribute(), 'vec4', 0 ).toReadOnly();
	const sourceCovarianceARead = storage( createPlaceholderVec4Attribute(), 'vec4', 0 ).toReadOnly();
	const sourceCovarianceBRead = storage( createPlaceholderVec4Attribute(), 'vec4', 0 ).toReadOnly();
	const sourceColorRead = storage( createPlaceholderUintAttribute(), 'uint', 0 ).toReadOnly();

	// position + covariance: 6 storage buffers (3 child reads, 3 group writes)
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
// for children with no SH data of their own.
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

	// A minimal stand-in for a `GaussianSplatMesh` buffers object, exposing just what
	// `applySphericalHarmonics()` reads: this degree's fixed word counts and this
	// kernel set's own shared (swappable) per-band source nodes.
	const syntheticChildBuffers = {
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
			applySphericalHarmonics( rgb, center, shLocalCameraPosition, srcIndex, syntheticChildBuffers );

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
