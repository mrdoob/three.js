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
	createGeometry,
	createMaterial,
	createMaterialNodes,
	createSphericalHarmonicsComputeNode,
	ensureSphericalHarmonicsContributionBuffer
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

// Neutral spherical harmonics coefficient (0 after the `(byte - 128) / 128`
// decode), matching GaussianSplatUtils.createPackedSphericalHarmonicsBand's fill
// value. Used to zero-pad splats from meshes with a lower (or no) SH degree than
// the group's merged maximum.
const SH_NEUTRAL_WORD = 0x80808080;

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

		this._capacity = 0;
		this._total = 0;
		this._maxSphericalHarmonicsDegree = 0;
		this._mappingDirty = true;

		this._buffers = null;
		this._sort = null;
		this._childState = new Map(); // GaussianSplatMesh -> { kernel, relativeMatrix, lastMatrix }

		this._sortMatrix = uniform( new Matrix4() );
		this._sortDepthRange = uniform( new Vector2( 0, 1 ) );
		this._sortInitialized = false;
		this._lastSortDirection = new Vector3();
		this._lastGroupWorldMatrix = null;

		this._localCameraPosition = uniform( new Vector3() );
		this._sphericalHarmonicsComputeNode = null;
		this._sphericalHarmonicsInitialized = false;
		this._lastSHCameraMatrix = new Matrix4();
		this._lastSHGroupMatrix = new Matrix4();

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

			this._setChildrenVisible( true );
			this.visible = false;

			return false;

		}

		this._setChildrenVisible( false );

		if ( this._mappingDirty === true ) this._rebuildMapping();

		if ( this._total === 0 ) {

			this.visible = false;

			return false;

		}

		this.visible = true;
		this.updateWorldMatrix( true, false );

		const groupMoved = this._lastGroupWorldMatrix === null || this._lastGroupWorldMatrix.equals( this.matrixWorld ) === false;
		let mergedAny = false;

		for ( const [ child, state ] of this._childState ) {

			child.updateWorldMatrix( true, false );

			if ( groupMoved === true || state.lastMatrix === null || state.lastMatrix.equals( child.matrixWorld ) === false ) {

				_groupWorldMatrixInverse.copy( this.matrixWorld ).invert();
				state.relativeMatrix.value.multiplyMatrices( _groupWorldMatrixInverse, child.matrixWorld );

				for ( const kernel of state.kernels ) renderer.compute( kernel );

				state.lastMatrix = ( state.lastMatrix || new Matrix4() ).copy( child.matrixWorld );
				mergedAny = true;

			}

		}

		if ( groupMoved === true ) {

			this._lastGroupWorldMatrix = ( this._lastGroupWorldMatrix || new Matrix4() ).copy( this.matrixWorld );

		}

		if ( mergedAny === true ) this.computeBoundingSphere();

		this._updateSphericalHarmonics( renderer, camera, mergedAny );

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

			_box.copy( child.boundingBox ).applyMatrix4( state.relativeMatrix.value );
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

			_sphere.copy( child.boundingSphere ).applyMatrix4( state.relativeMatrix.value );
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

		if ( this._buffers !== null ) disposeGroupBuffers( this._buffers );
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

		const needsGrow = this._buffers === null || total > this._capacity || maxDegree !== this._maxSphericalHarmonicsDegree;

		if ( needsGrow === true ) {

			this._growBuffers( Math.max( 1, Math.ceil( total * this.growthSlack ) ), maxDegree );

		}

		let base = 0;

		for ( const child of children ) {

			const count = child.splatGeometry.getAttribute( 'position' ).count;
			const merge = createChildMergeKernels( child, this._buffers, base, this._maxSphericalHarmonicsDegree, this.workgroupSize );

			this._childState.set( child, {
				kernels: merge.kernels,
				relativeMatrix: merge.relativeMatrix,
				lastMatrix: null
			} );

			base += count;

		}

		this._rebuildSortAndMaterial( total );

		this.geometry.instanceCount = total;

	}

	_growBuffers( capacity, maxDegree ) {

		if ( this._buffers !== null ) disposeGroupBuffers( this._buffers );

		this._buffers = createGroupBuffers( capacity, maxDegree );
		this._capacity = capacity;
		this._maxSphericalHarmonicsDegree = maxDegree;

		if ( maxDegree > 0 ) ensureSphericalHarmonicsContributionBuffer( this._buffers );

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

		// Dispatched over exactly `total` (not the buffers' possibly-larger `capacity`
		// slack), so this never wastes compute on unused tail slots.
		this._sphericalHarmonicsComputeNode = buffers.sphericalHarmonicsDegree > 0 ?
			createSphericalHarmonicsComputeNode( { ...buffers, count: total }, this._localCameraPosition ) :
			null;
		this._sphericalHarmonicsInitialized = false;

	}

	_updateSphericalHarmonics( renderer, camera, forceRun ) {

		if ( this._sphericalHarmonicsComputeNode === null ) return;

		if ( forceRun === false &&
			this._sphericalHarmonicsInitialized === true &&
			camera.matrixWorld.equals( this._lastSHCameraMatrix ) &&
			this.matrixWorld.equals( this._lastSHGroupMatrix ) ) {

			return;

		}

		_worldMatrixInverse.copy( this.matrixWorld ).invert();
		this._localCameraPosition.value.setFromMatrixPosition( camera.matrixWorld ).applyMatrix4( _worldMatrixInverse );

		this._lastSHCameraMatrix.copy( camera.matrixWorld );
		this._lastSHGroupMatrix.copy( this.matrixWorld );
		this._sphericalHarmonicsInitialized = true;

		renderer.compute( this._sphericalHarmonicsComputeNode );

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

// Allocates the group's shared storage buffers at `capacity`, with both a writable
// node (merge-kernel destination) and a read-only node (render-shader source)
// wrapping each attribute - the same pattern CountingSort uses for orderRead/orderWrite.
function createGroupBuffers( capacity, sphericalHarmonicsDegree ) {

	const centerAttribute = new StorageBufferAttribute( new Float32Array( capacity * 4 ), 4 );
	const covarianceAAttribute = new StorageBufferAttribute( new Float32Array( capacity * 4 ), 4 );
	const covarianceBAttribute = new StorageBufferAttribute( new Float32Array( capacity * 4 ), 4 );
	const colorAttribute = new StorageBufferAttribute( new Uint32Array( capacity ), 1 );

	const buffers = {
		count: capacity,
		sphericalHarmonicsDegree,
		centerAttribute,
		covarianceAAttribute,
		covarianceBAttribute,
		colorAttribute,
		centerWrite: storage( centerAttribute, 'vec4', capacity ),
		centerRead: storage( centerAttribute, 'vec4', capacity ).toReadOnly(),
		covarianceAWrite: storage( covarianceAAttribute, 'vec4', capacity ),
		covarianceARead: storage( covarianceAAttribute, 'vec4', capacity ).toReadOnly(),
		covarianceBWrite: storage( covarianceBAttribute, 'vec4', capacity ),
		covarianceBRead: storage( covarianceBAttribute, 'vec4', capacity ).toReadOnly(),
		colorWrite: storage( colorAttribute, 'uint', capacity ),
		colorRead: storage( colorAttribute, 'uint', capacity ).toReadOnly()
	};

	for ( let degree = 1; degree <= sphericalHarmonicsDegree; degree ++ ) {

		const words = SH_BAND_WORDS[ degree ];
		const data = new Uint32Array( capacity * words );
		data.fill( SH_NEUTRAL_WORD );

		const attribute = new StorageBufferAttribute( data, 1 );

		buffers[ `sphericalHarmonics${ degree }Attribute` ] = attribute;
		buffers[ `sphericalHarmonics${ degree }Write` ] = storage( attribute, 'uint', capacity * words );
		buffers[ `sphericalHarmonics${ degree }Read` ] = storage( attribute, 'uint', capacity * words ).toReadOnly();
		buffers[ `sphericalHarmonics${ degree }Words` ] = words;

	}

	return buffers;

}

function disposeGroupBuffers( buffers ) {

	buffers.centerAttribute.dispose();
	buffers.covarianceAAttribute.dispose();
	buffers.covarianceBAttribute.dispose();
	buffers.colorAttribute.dispose();

	for ( let degree = 1; degree <= buffers.sphericalHarmonicsDegree; degree ++ ) {

		buffers[ `sphericalHarmonics${ degree }Attribute` ].dispose();

	}

}

// Builds the compute kernels that transform a single child's local-space splats into
// the group's shared buffers at `base`, using a uniform `relativeMatrix` (the child's
// transform relative to the group) that can be updated every frame without rebuilding
// any kernel. Position transforms by the full 4x4 matrix; covariance transforms by its
// 3x3 linear part only (C' = A * C * A^T), following the same row-extraction pattern
// GaussianSplatMesh's vertex shader uses for view-space covariance.
//
// This is split into several small kernels (transform, color, one per SH band) rather
// than one kernel touching every buffer, because each simultaneously-bound storage
// buffer counts against `maxStorageBuffersPerShaderStage`, whose universal (100% of
// surveyed devices) baseline is only 8 - a single combined kernel exceeds that once
// even one SH band is involved (each band needs a group-side write, plus a child-side
// read whenever that child actually supplies that band).
function createChildMergeKernels( child, groupBuffers, base, maxSphericalHarmonicsDegree, workgroupSize ) {

	const count = child.splatGeometry.getAttribute( 'position' ).count;
	const childBuffers = child._buffers;
	const relativeMatrix = uniform( new Matrix4() );
	const baseIndex = uint( base );
	const kernels = [];

	// position + covariance: 6 storage buffers (3 child reads, 3 group writes)
	kernels.push( Fn( () => {

		const srcIndex = instanceIndex;
		const dstIndex = baseIndex.add( srcIndex ).toVar( 'dstIndex' );

		const localCenter = childBuffers.centerRead.element( srcIndex ).xyz.toVar( 'localCenter' );
		const worldCenter = relativeMatrix.mul( vec4( localCenter, 1 ) ).xyz.toVar( 'worldCenter' );

		groupBuffers.centerWrite.element( dstIndex ).assign( vec4( worldCenter, 0 ) );

		const covA = childBuffers.covarianceARead.element( srcIndex ).toVar( 'covA' );
		const covB = childBuffers.covarianceBRead.element( srcIndex ).toVar( 'covB' );

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

	} )().compute( count, [ workgroupSize ] ).setName( 'GaussianSplatGroupMergeTransform' ) );

	// color: 2 storage buffers
	kernels.push( Fn( () => {

		const dstIndex = baseIndex.add( instanceIndex );

		groupBuffers.colorWrite.element( dstIndex ).assign( childBuffers.colorRead.element( instanceIndex ) );

	} )().compute( count, [ workgroupSize ] ).setName( 'GaussianSplatGroupMergeColor' ) );

	// one kernel per SH band the group carries: at most 2 storage buffers each
	// (a child without this band still needs to run it, to write the neutral padding)
	for ( let degree = 1; degree <= maxSphericalHarmonicsDegree; degree ++ ) {

		const words = SH_BAND_WORDS[ degree ];
		const groupWrite = groupBuffers[ `sphericalHarmonics${ degree }Write` ];
		const hasBand = childBuffers.sphericalHarmonicsDegree >= degree;
		const childRead = hasBand ? childBuffers[ `sphericalHarmonics${ degree }Read` ] : null;

		kernels.push( Fn( () => {

			const dstIndex = baseIndex.add( instanceIndex );

			for ( let word = 0; word < words; word ++ ) {

				const value = hasBand ? childRead.element( instanceIndex.mul( words ).add( word ) ) : uint( SH_NEUTRAL_WORD );

				groupWrite.element( dstIndex.mul( words ).add( word ) ).assign( value );

			}

		} )().compute( count, [ workgroupSize ] ).setName( `GaussianSplatGroupMergeSH${ degree }` ) );

	}

	return { kernels, relativeMatrix };

}

export { GaussianSplatGroup };
