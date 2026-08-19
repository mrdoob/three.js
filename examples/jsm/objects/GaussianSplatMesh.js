import {
	Box3,
	Matrix4,
	Mesh,
	Ray,
	Sphere,
	Vector2,
	Vector3
} from 'three/webgpu';

import { instanceIndex, max, uint, uniform, vec4 } from 'three/tsl';

import { CountingSort } from '../gpgpu/CountingSort.js';
import { getSphericalHarmonicsDegree } from '../utils/GaussianSplatUtils.js';
import {
	BIN_COUNT,
	WORKGROUP_SIZE,
	SPLAT_KERNEL_CUTOFF,
	createGeometry,
	createMaterial,
	createMaterialNodes,
	createSphericalHarmonicsComputeNode,
	createStorageBuffers,
	computeRayIntersection,
	enableWebGLBuffers,
	ensureSphericalHarmonicsContributionBuffer,
	needsSort,
	updateLastSortDirection,
	updateSortDepthRange
} from '../utils/GaussianSplatShadingUtils.js';

const _worldMatrixInverse = /*@__PURE__*/ new Matrix4();
const _inverseMatrix = /*@__PURE__*/ new Matrix4();
const _ray = /*@__PURE__*/ new Ray();
const _sphere = /*@__PURE__*/ new Sphere();
const _vector = /*@__PURE__*/ new Vector3();

/**
 * A minimal renderer for 3D Gaussian splat geometry.
 *
 * Note that this class can only be used with {@link WebGPURenderer}. The
 * `forceWebGL` fallback of {@link WebGPURenderer} is supported, but
 * {@link WebGLRenderer} is not. Import maps or package exports must resolve
 * both `three/webgpu` and `three/tsl`.
 *
 * ```js
 * const splats = new GaussianSplatMesh( geometry );
 * scene.add( splats );
 * ```
 *
 * This class always draws exactly one self-contained splat cloud, sorted against
 * itself only. To draw many splat clouds - each independently positioned - alpha-blended
 * correctly against *each other*, use {@link GaussianSplatGroup} instead, which merges
 * many raw splat `BufferGeometry`s into one shared, globally sorted buffer set. The two
 * classes are independent: `GaussianSplatGroup` does not wrap or otherwise depend on
 * `GaussianSplatMesh`.
 *
 * @augments Mesh
 * @three_import import { GaussianSplatMesh } from 'three/addons/objects/GaussianSplatMesh.js';
 */
class GaussianSplatMesh extends Mesh {

	/**
	 * Constructs a new Gaussian splat mesh.
	 *
	 * @param {BufferGeometry} splatGeometry - The splat geometry to render. Higher-order spherical harmonics attributes must use packed `Uint32Array` words from {@link createGaussianSplatGeometry} (`SH_BAND_WORDS[ degree ]` words per splat, four clamped-byte coefficients per word).
	 * @param {Object} [options] - Options.
	 * @param {boolean} [options.autoSort=true] - Whether to sort automatically in `onBeforeRender`.
	 */
	constructor( splatGeometry, { autoSort = true } = {} ) {

		const positionAttribute = splatGeometry.getAttribute( 'position' );
		const covarianceAttribute = splatGeometry.getAttribute( 'covariance' );
		const colorAttribute = splatGeometry.getAttribute( 'color' );
		const sphericalHarmonicsDegree = getSphericalHarmonicsDegree( splatGeometry );
		const count = positionAttribute.count;

		if ( splatGeometry.boundingBox === null ) splatGeometry.computeBoundingBox();
		if ( splatGeometry.boundingSphere === null ) splatGeometry.computeBoundingSphere();

		const geometry = createGeometry( count );
		const buffers = createStorageBuffers( count, positionAttribute.array, covarianceAttribute.array, colorAttribute.array, {
			degree: sphericalHarmonicsDegree,
			sh1: sphericalHarmonicsDegree >= 1 ? splatGeometry.getAttribute( 'sphericalHarmonics1' ).array : undefined,
			sh2: sphericalHarmonicsDegree >= 2 ? splatGeometry.getAttribute( 'sphericalHarmonics2' ).array : undefined,
			sh3: sphericalHarmonicsDegree >= 3 ? splatGeometry.getAttribute( 'sphericalHarmonics3' ).array : undefined
		} );
		const localCameraPosition = uniform( new Vector3() );
		const sphericalHarmonicsComputeNode = createSphericalHarmonicsComputeNode( buffers, localCameraPosition );
		const sort = new CountingSort( count, { binCount: BIN_COUNT, workgroupSize: WORKGROUP_SIZE } );
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
		this.isGaussianSplatMesh = true;

		this.type = 'GaussianSplatMesh';

		/**
		 * The source splat geometry.
		 *
		 * @type {BufferGeometry}
		 */
		this.splatGeometry = splatGeometry;

		/**
		 * The bounding box of the splats. Can be computed via {@link GaussianSplatMesh#computeBoundingBox}.
		 *
		 * @type {?Box3}
		 * @default null
		 */
		this.boundingBox = null;

		/**
		 * The bounding sphere of the splats. Can be computed via {@link GaussianSplatMesh#computeBoundingSphere}.
		 *
		 * @type {?Sphere}
		 * @default null
		 */
		this.boundingSphere = null;

		/**
		 * Whether to sort automatically in `onBeforeRender`.
		 *
		 * @type {boolean}
		 */
		this.autoSort = autoSort;

		this._buffers = buffers;
		this._sort = sort;
		this._sortMatrix = uniform( new Matrix4() );
		this._sortDepthRange = uniform( new Vector2( 0, 1 ) );
		this._sortInitialized = false;
		this._lastSortDirection = new Vector3();
		this._localCameraPosition = localCameraPosition;
		this._sphericalHarmonicsComputeNode = sphericalHarmonicsComputeNode;
		this._sphericalHarmonicsInitialized = false;
		this._lastSphericalHarmonicsCameraMatrix = new Matrix4();
		this._lastSphericalHarmonicsWorldMatrix = new Matrix4();
		this._sphericalHarmonicsVertexNode = materialNodes.sphericalHarmonicsVertexNode;
		this._precomputedSphericalHarmonicsVertexNode = materialNodes.vertexNode;
		this._positionAttribute = positionAttribute;

		const centerRead = buffers.centerRead;
		const sortMatrix = this._sortMatrix;
		const sortDepthRange = this._sortDepthRange;

		sort.setBinNode( () => {

			const center = centerRead.element( instanceIndex ).xyz.toVar( 'center' );
			const viewCenter = sortMatrix.mul( vec4( center, 1 ) ).xyz.toVar( 'viewCenter' );
			const depth = viewCenter.z.negate().toVar( 'depth' );
			const range = max( sortDepthRange.y.sub( sortDepthRange.x ), 0.0001 ).toVar( 'range' );
			const normalized = depth.sub( sortDepthRange.x ).div( range ).clamp( 0, 1 ).toVar( 'normalized' );
			const depthBin = uint( normalized.mul( BIN_COUNT - 1 ) ).toVar( 'depthBin' );

			return uint( BIN_COUNT - 1 ).sub( depthBin );

		} );

		this.onBeforeRender = ( renderer, scene, camera ) => {

			const vertexNode = renderer.backend && renderer.backend.isWebGLBackend === true ?
				this._sphericalHarmonicsVertexNode :
				this._precomputedSphericalHarmonicsVertexNode;

			if ( vertexNode !== null && material.vertexNode !== vertexNode ) {

				material.vertexNode = vertexNode;
				material.needsUpdate = true;

			}

			this.updateSphericalHarmonics( renderer, camera );

			if ( this.autoSort === true ) {

				this.updateSort( renderer, camera );

			}

		};

	}

	/**
	 * Updates the view-dependent spherical harmonics colors if the camera or
	 * mesh transform has changed.
	 *
	 * @param {Renderer} renderer - The renderer.
	 * @param {Camera} camera - The camera used for rendering.
	 * @return {boolean} Whether a compute pass was dispatched this call.
	 */
	updateSphericalHarmonics( renderer, camera ) {

		if ( this._sphericalHarmonicsComputeNode === null ) return false;

		const isWebGLBackend = renderer.backend && renderer.backend.isWebGLBackend === true;

		if ( this._sphericalHarmonicsInitialized === true &&
			camera.matrixWorld.equals( this._lastSphericalHarmonicsCameraMatrix ) &&
			this.matrixWorld.equals( this._lastSphericalHarmonicsWorldMatrix ) &&
			( isWebGLBackend === true || this._buffers.sphericalHarmonicsContributionRead !== undefined ) ) {

			return false;

		}

		if ( isWebGLBackend === true ) {

			enableWebGLBuffers( this._buffers );

		}

		_worldMatrixInverse.copy( this.matrixWorld ).invert();
		this._localCameraPosition.value.setFromMatrixPosition( camera.matrixWorld ).applyMatrix4( _worldMatrixInverse );

		this._lastSphericalHarmonicsCameraMatrix.copy( camera.matrixWorld );
		this._lastSphericalHarmonicsWorldMatrix.copy( this.matrixWorld );
		this._sphericalHarmonicsInitialized = true;

		if ( isWebGLBackend === true ) return false;

		ensureSphericalHarmonicsContributionBuffer( this._buffers );
		renderer.compute( this._sphericalHarmonicsComputeNode );

		return true;

	}

	/**
	 * Computes the bounding box of the splats, updating {@link GaussianSplatMesh#boundingBox}.
	 *
	 * Each splat is expanded by its own extent rather than treated as a point, so the bounds cover
	 * what is drawn.
	 */
	computeBoundingBox() {

		if ( this.boundingBox === null ) this.boundingBox = new Box3();

		this.boundingBox.makeEmpty();

		const positionAttribute = this.splatGeometry.getAttribute( 'position' );
		const covarianceAttribute = this.splatGeometry.getAttribute( 'covariance' );
		const count = positionAttribute.count;

		for ( let i = 0; i < count; i ++ ) {

			const x = positionAttribute.getX( i );
			const y = positionAttribute.getY( i );
			const z = positionAttribute.getZ( i );

			const c00 = covarianceAttribute.getComponent( i, 0 );
			const c11 = covarianceAttribute.getComponent( i, 3 );
			const c22 = covarianceAttribute.getComponent( i, 5 );

			// the radius of the drawn largest extent
			const radius = SPLAT_KERNEL_CUTOFF * Math.sqrt( Math.max( c00, c11, c22 ) );

			this.boundingBox.expandByPoint( _vector.set( x - radius, y - radius, z - radius ) );
			this.boundingBox.expandByPoint( _vector.set( x + radius, y + radius, z + radius ) );

		}

	}

	/**
	 * Computes the bounding sphere of the splats, updating {@link GaussianSplatMesh#boundingSphere}.
	 *
	 * Each splat is expanded by its own extent rather than treated as a point, so the bounds cover
	 * what is drawn.
	 */
	computeBoundingSphere() {

		if ( this.boundingSphere === null ) this.boundingSphere = new Sphere();

		this.computeBoundingBox();
		this.boundingBox.getCenter( this.boundingSphere.center );

		const positionAttribute = this.splatGeometry.getAttribute( 'position' );
		const covarianceAttribute = this.splatGeometry.getAttribute( 'covariance' );
		const count = positionAttribute.count;
		const center = this.boundingSphere.center;

		let maxRadius = 0;

		for ( let i = 0; i < count; i ++ ) {

			const x = positionAttribute.getX( i );
			const y = positionAttribute.getY( i );
			const z = positionAttribute.getZ( i );

			const c00 = covarianceAttribute.getComponent( i, 0 );
			const c11 = covarianceAttribute.getComponent( i, 3 );
			const c22 = covarianceAttribute.getComponent( i, 5 );

			// the radius of the drawn largest extent
			const radius = SPLAT_KERNEL_CUTOFF * Math.sqrt( Math.max( c00, c11, c22 ) );

			maxRadius = Math.max( maxRadius, center.distanceTo( _vector.set( x, y, z ) ) + radius );

		}

		this.boundingSphere.radius = maxRadius;

	}

	/**
	 * Computes intersection points between a casted ray and the splats.
	 *
	 * @param {Raycaster} raycaster - The raycaster.
	 * @param {Array<Object>} intersects - The target array that holds the intersection points.
	 */
	raycast( raycaster, intersects ) {

		const matrixWorld = this.matrixWorld;

		// Checking boundingSphere distance to ray

		if ( this.boundingSphere === null ) this.computeBoundingSphere();

		_sphere.copy( this.boundingSphere );
		_sphere.applyMatrix4( matrixWorld );

		if ( raycaster.ray.intersectsSphere( _sphere ) === false ) return;

		//

		_inverseMatrix.copy( matrixWorld ).invert();
		_ray.copy( raycaster.ray ).applyMatrix4( _inverseMatrix );

		// test with bounding box in local space

		if ( this.boundingBox !== null ) {

			if ( _ray.intersectsBox( this.boundingBox ) === false ) return;

		}

		const positionAttribute = this.splatGeometry.getAttribute( 'position' );
		const covarianceAttribute = this.splatGeometry.getAttribute( 'covariance' );
		const colorAttribute = this.splatGeometry.getAttribute( 'color' );
		const count = positionAttribute.count;

		for ( let i = 0; i < count; i ++ ) {

			computeRayIntersection( positionAttribute, covarianceAttribute, colorAttribute, i, matrixWorld, _ray, raycaster, intersects, this );

		}

	}

	/**
	 * Updates the draw order if the camera or mesh orientation has changed enough
	 * to need a new sort.
	 *
	 * @param {Renderer} renderer - The renderer.
	 * @param {Camera} camera - The camera used for rendering.
	 * @return {boolean} Whether a sort was dispatched this call.
	 */
	updateSort( renderer, camera ) {

		this.updateWorldMatrix( true, false );

		const needsResort = this._needsSort( camera );

		if ( this._sortInitialized === false || needsResort === true ) {

			this._updateSortUniforms( camera );

			if ( renderer.backend && renderer.backend.isWebGLBackend === true ) {

				enableWebGLBuffers( this._buffers );
				this._sort.enableWebGLBuffers();
				this._sortCPU();

			} else {

				this._sort.compute( renderer );

			}

			this._sortInitialized = true;
			updateLastSortDirection( this._lastSortDirection );

			return true;

		}

		return false;

	}

	_needsSort( camera ) {

		return needsSort( camera, this.matrixWorld, this._lastSortDirection );

	}

	_updateSortUniforms( camera ) {

		this._sortMatrix.value.multiplyMatrices( camera.matrixWorldInverse, this.matrixWorld );

		if ( this.boundingSphere === null ) this.computeBoundingSphere();

		updateSortDepthRange( camera, this.matrixWorld, this.boundingSphere, this._sortDepthRange.value );

	}

	_sortCPU() {

		const centers = this._positionAttribute.array;
		const matrix = this._sortMatrix.value.elements;
		const nearDepth = this._sortDepthRange.value.x;
		const range = Math.max( this._sortDepthRange.value.y - nearDepth, 0.0001 );
		const scale = ( BIN_COUNT - 1 ) / range;

		this._sort.computeCPU( ( i ) => {

			const i3 = i * 3;
			const depth = - ( matrix[ 2 ] * centers[ i3 ] + matrix[ 6 ] * centers[ i3 + 1 ] + matrix[ 10 ] * centers[ i3 + 2 ] + matrix[ 14 ] );
			const depthBin = Math.min( BIN_COUNT - 1, Math.max( 0, Math.floor( ( depth - nearDepth ) * scale ) ) );

			return BIN_COUNT - 1 - depthBin;

		} );

	}

}

export { GaussianSplatMesh };
