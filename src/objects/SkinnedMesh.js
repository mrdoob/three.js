import { Mesh } from './Mesh.js';
import { Box3 } from '../math/Box3.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Sphere } from '../math/Sphere.js';
import { Vector3 } from '../math/Vector3.js';
import { Vector4 } from '../math/Vector4.js';
import { Ray } from '../math/Ray.js';
import { AttachedBindMode, DetachedBindMode } from '../constants.js';

const _basePosition = /*@__PURE__*/ new Vector3();

const _skinIndex = /*@__PURE__*/ new Vector4();
const _skinWeight = /*@__PURE__*/ new Vector4();

const _vector3 = /*@__PURE__*/ new Vector3();
const _matrix4 = /*@__PURE__*/ new Matrix4();
const _vertex = /*@__PURE__*/ new Vector3();

const _sphere = /*@__PURE__*/ new Sphere();
const _inverseMatrix = /*@__PURE__*/ new Matrix4();
const _ray = /*@__PURE__*/ new Ray();

/**
 * A mesh that has a {@link Skeleton} that can then be used to animate the
 * vertices of the geometry with skinning/skeleton animation.
 *
 * Next to a valid skeleton, the skinned mesh requires skin indices and weights
 * as buffer attributes in its geometry. These attribute define which bones affect a single
 * vertex to a certain extend.
 *
 * Typically skinned meshes are not created manually but loaders like {@link GLTFLoader}
 * or {@link FBXLoader } import respective models.
 *
 * @augments Mesh
 */
class SkinnedMesh extends Mesh {

	/**
	 * Constructs a new skinned mesh.
	 *
	 * @param {BufferGeometry} [geometry] - The mesh geometry.
	 * @param {Material|Array<Material>} [material] - The mesh material.
	 */
	constructor( geometry, material ) {

		super( geometry, material );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isSkinnedMesh = true;

		this.type = 'SkinnedMesh';

		/**
		 * `AttachedBindMode` means the skinned mesh shares the same world space as the skeleton.
		 * This is not true when using `DetachedBindMode` which is useful when sharing a skeleton
		 * across multiple skinned meshes.
		 *
		 * @type {(AttachedBindMode|DetachedBindMode)}
		 * @default AttachedBindMode
		 */
		this.bindMode = AttachedBindMode;

		/**
		 * The base matrix that is used for the bound bone transforms.
		 *
		 * @type {Matrix4}
		 */
		this.bindMatrix = new Matrix4();

		/**
		 * The base matrix that is used for resetting the bound bone transforms.
		 *
		 * @type {Matrix4}
		 */
		this.bindMatrixInverse = new Matrix4();

		/**
		 * The bounding box of the skinned mesh. Can be computed via {@link SkinnedMesh#computeBoundingBox}.
		 *
		 * @type {?Box3}
		 * @default null
		 */
		this.boundingBox = null;

		/**
		 * The bounding sphere of the skinned mesh. Can be computed via {@link SkinnedMesh#computeBoundingSphere}.
		 *
		 * @type {?Sphere}
		 * @default null
		 */
		this.boundingSphere = null;

	}

	/**
	 * Computes the bounding box of the skinned mesh, and updates {@link SkinnedMesh#boundingBox}.
	 * The bounding box is not automatically computed by the engine; this method must be called by your app.
	 * If the skinned mesh is animated, the bounding box should be recomputed per frame in order to reflect
	 * the current animation state.
	 */
	computeBoundingBox() {

		const geometry = this.geometry;

		if ( this.boundingBox === null ) {

			this.boundingBox = new Box3();

		}

		this.boundingBox.makeEmpty();

		const positionAttribute = geometry.getAttribute( 'position' );

		for ( let i = 0; i < positionAttribute.count; i ++ ) {

			this.getVertexPosition( i, _vertex );
			this.boundingBox.expandByPoint( _vertex );

		}

	}

	/**
	 * Computes the bounding sphere of the skinned mesh, and updates {@link SkinnedMesh#boundingSphere}.
	 * The bounding sphere is automatically computed by the engine once when it is needed, e.g., for ray casting
	 * and view frustum culling. If the skinned mesh is animated, the bounding sphere should be recomputed
	 * per frame in order to reflect the current animation state.
	 */
	computeBoundingSphere() {

		const geometry = this.geometry;

		if ( this.boundingSphere === null ) {

			this.boundingSphere = new Sphere();

		}

		this.boundingSphere.makeEmpty();

		const positionAttribute = geometry.getAttribute( 'position' );

		for ( let i = 0; i < positionAttribute.count; i ++ ) {

			this.getVertexPosition( i, _vertex );
			this.boundingSphere.expandByPoint( _vertex );

		}

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		this.bindMode = source.bindMode;
		this.bindMatrix.copy( source.bindMatrix );
		this.bindMatrixInverse.copy( source.bindMatrixInverse );

		this.skeleton = source.skeleton;

		if ( source.boundingBox !== null ) this.boundingBox = source.boundingBox.clone();
		if ( source.boundingSphere !== null ) this.boundingSphere = source.boundingSphere.clone();

		return this;

	}

	raycast( raycaster, intersects ) {

		const material = this.material;
		const matrixWorld = this.matrixWorld;

		if ( material === undefined ) return;

		// test with bounding sphere in world space

		if ( this.boundingSphere === null ) this.computeBoundingSphere();

		_sphere.copy( this.boundingSphere );
		_sphere.applyMatrix4( matrixWorld );

		if ( raycaster.ray.intersectsSphere( _sphere ) === false ) return;

		// convert ray to local space of skinned mesh

		_inverseMatrix.copy( matrixWorld ).invert();
		_ray.copy( raycaster.ray ).applyMatrix4( _inverseMatrix );

		// test with bounding box in local space

		if ( this.boundingBox !== null ) {

			if ( _ray.intersectsBox( this.boundingBox ) === false ) return;

		}

		// test for intersections with geometry

		this._computeIntersections( raycaster, intersects, _ray );

	}

	getVertexPosition( index, target ) {

		super.getVertexPosition( index, target );

		this.applyBoneTransform( index, target );

		return target;

	}

	/**
	 * Binds the given skeleton to the skinned mesh.
	 *
	 * @param {Skeleton} skeleton - The skeleton to bind.
	 * @param {Matrix4} [bindMatrix] - The bind matrix. If no bind matrix is provided,
	 * the skinned mesh's world matrix will be used instead.
	 */
	bind( skeleton, bindMatrix ) {

		this.skeleton = skeleton;

		if ( bindMatrix === undefined ) {

			this.updateMatrixWorld( true );

			this.skeleton.calculateInverses();

			bindMatrix = this.matrixWorld;

		}

		this.bindMatrix.copy( bindMatrix );
		this.bindMatrixInverse.copy( bindMatrix ).invert();

	}

	/**
	 * This method sets the skinned mesh in the rest pose).
	 */
	pose() {

		this.skeleton.pose();

	}

	/**
	 * Normalizes the skin weights which are defined as a buffer attribute
	 * in the skinned mesh's geometry.
	 */
	normalizeSkinWeights() {

		const vector = new Vector4();

		const skinWeight = this.geometry.attributes.skinWeight;

		for ( let i = 0, l = skinWeight.count; i < l; i ++ ) {

			vector.fromBufferAttribute( skinWeight, i );

			const scale = 1.0 / vector.manhattanLength();

			if ( scale !== Infinity ) {

				vector.multiplyScalar( scale );

			} else {

				vector.set( 1, 0, 0, 0 ); // do something reasonable

			}

			skinWeight.setXYZW( i, vector.x, vector.y, vector.z, vector.w );

		}

	}

	updateMatrixWorld( force ) {

		super.updateMatrixWorld( force );

		if ( this.bindMode === AttachedBindMode ) {

			this.bindMatrixInverse.copy( this.matrixWorld ).invert();

		} else if ( this.bindMode === DetachedBindMode ) {

			this.bindMatrixInverse.copy( this.bindMatrix ).invert();

		} else {

			console.warn( 'THREE.SkinnedMesh: Unrecognized bindMode: ' + this.bindMode );

		}

	}

	/**
	 * Applies the bone transform associated with the given index to the given
	 * vertex position. Returns the updated vector.
	 *
	 * @param {number} index - The vertex index.
	 * @param {Vector3} target - The target object that is used to store the method's result.
	 * the skinned mesh's world matrix will be used instead.
	 * @return {Vector3} The updated vertex position.
	 */
	applyBoneTransform( index, target ) {

		const skeleton = this.skeleton;
		const geometry = this.geometry;

		_skinIndex.fromBufferAttribute( geometry.attributes.skinIndex, index );
		_skinWeight.fromBufferAttribute( geometry.attributes.skinWeight, index );

		_basePosition.copy( target ).applyMatrix4( this.bindMatrix );

		target.set( 0, 0, 0 );

		for ( let i = 0; i < 4; i ++ ) {

			const weight = _skinWeight.getComponent( i );

			if ( weight !== 0 ) {

				const boneIndex = _skinIndex.getComponent( i );

				_matrix4.multiplyMatrices( skeleton.bones[ boneIndex ].matrixWorld, skeleton.boneInverses[ boneIndex ] );

				target.addScaledVector( _vector3.copy( _basePosition ).applyMatrix4( _matrix4 ), weight );

			}

		}

		return target.applyMatrix4( this.bindMatrixInverse );

	}

}

export { SkinnedMesh };
