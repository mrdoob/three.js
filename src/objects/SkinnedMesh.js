import { Mesh } from './Mesh.js';
import { Box3 } from '../math/Box3.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Sphere } from '../math/Sphere.js';
import {
	mat4Create, mat4Copy, mat4Invert, mat4MultiplyMatrices
} from '../math/Matrix4Functions.js';
import {
	vec3Create, vec3Set, vec3AddScaledVector, vec3ApplyMatrix4
} from '../math/Vector3Functions.js';
import {
	vec4Create, vec4Set, vec4Copy, vec4FromBufferAttribute, vec4GetComponent,
	vec4ApplyMatrix4, vec4AddScaledVector, vec4MultiplyScalar, vec4ManhattanLength
} from '../math/Vector4Functions.js';
import {
	sphereCreate, sphereCopy, sphereApplyMatrix4, sphereMakeEmpty, sphereExpandByPoint
} from '../math/SphereFunctions.js';
import {
	rayCreate, rayCopy, rayApplyMatrix4, rayIntersectsSphere, rayIntersectsBox
} from '../math/RayFunctions.js';
import { box3MakeEmpty, box3ExpandByPoint } from '../math/Box3Functions.js';
import { AttachedBindMode, DetachedBindMode } from '../constants.js';
import { warn } from '../utils.js';

const _baseVector = /*@__PURE__*/ vec4Create();

const _skinIndex = /*@__PURE__*/ vec4Create();
const _skinWeight = /*@__PURE__*/ vec4Create();

const _vector4 = /*@__PURE__*/ vec4Create();
const _matrix4 = /*@__PURE__*/ mat4Create();
const _vertex = /*@__PURE__*/ vec3Create();

const _sphere = /*@__PURE__*/ sphereCreate();
const _inverseMatrix = /*@__PURE__*/ mat4Create();
const _ray = /*@__PURE__*/ rayCreate();

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
 * @demo scenes/bones-browser.html
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

		box3MakeEmpty( this.boundingBox );

		const positionAttribute = geometry.getAttribute( 'position' );

		for ( let i = 0; i < positionAttribute.count; i ++ ) {

			this.getVertexPosition( i, _vertex );
			box3ExpandByPoint( this.boundingBox, _vertex, this.boundingBox );

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

		sphereMakeEmpty( this.boundingSphere );

		const positionAttribute = geometry.getAttribute( 'position' );

		for ( let i = 0; i < positionAttribute.count; i ++ ) {

			this.getVertexPosition( i, _vertex );
			sphereExpandByPoint( this.boundingSphere, _vertex, this.boundingSphere );

		}

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		this.bindMode = source.bindMode;
		mat4Copy( source.bindMatrix, this.bindMatrix );
		mat4Copy( source.bindMatrixInverse, this.bindMatrixInverse );

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

		sphereCopy( this.boundingSphere, _sphere );
		sphereApplyMatrix4( _sphere, matrixWorld, _sphere );

		if ( rayIntersectsSphere( raycaster.ray, _sphere ) === false ) return;

		// convert ray to local space of skinned mesh

		mat4Copy( matrixWorld, _inverseMatrix );
		mat4Invert( _inverseMatrix, _inverseMatrix );
		rayCopy( raycaster.ray, _ray );
		rayApplyMatrix4( _ray, _inverseMatrix, _ray );

		// test with bounding box in local space

		if ( this.boundingBox !== null ) {

			if ( rayIntersectsBox( _ray, this.boundingBox ) === false ) return;

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

		mat4Copy( bindMatrix, this.bindMatrix );
		mat4Copy( bindMatrix, this.bindMatrixInverse );
		mat4Invert( this.bindMatrixInverse, this.bindMatrixInverse );

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

		const vector = vec4Create();

		const skinWeight = this.geometry.attributes.skinWeight;

		for ( let i = 0, l = skinWeight.count; i < l; i ++ ) {

			vec4FromBufferAttribute( skinWeight, i, vector );

			const scale = 1.0 / vec4ManhattanLength( vector );

			if ( scale !== Infinity ) {

				vec4MultiplyScalar( vector, scale, vector );

			} else {

				vec4Set( 1, 0, 0, 0, vector ); // do something reasonable

			}

			skinWeight.setXYZW( i, vector.x, vector.y, vector.z, vector.w );

		}

	}

	updateMatrixWorld( force ) {

		super.updateMatrixWorld( force );

		if ( this.bindMode === AttachedBindMode ) {

			mat4Copy( this.matrixWorld, this.bindMatrixInverse );
			mat4Invert( this.bindMatrixInverse, this.bindMatrixInverse );

		} else if ( this.bindMode === DetachedBindMode ) {

			mat4Copy( this.bindMatrix, this.bindMatrixInverse );
			mat4Invert( this.bindMatrixInverse, this.bindMatrixInverse );

		} else {

			warn( 'SkinnedMesh: Unrecognized bindMode: ' + this.bindMode );

		}

	}

	/**
	 * Applies the bone transform associated with the given index to the given
	 * vector. Can be used to transform positions or direction vectors by providing
	 * a Vector4 with 1 or 0 in the w component respectively. Returns the updated vector.
	 *
	 * @param {number} index - The vertex index.
	 * @param {Vector3|Vector4} target - The target object that is used to store the method's result.
	 * @return {Vector3|Vector4} The updated vertex attribute data.
	 */
	applyBoneTransform( index, target ) {

		const skeleton = this.skeleton;
		const geometry = this.geometry;

		vec4FromBufferAttribute( geometry.attributes.skinIndex, index, _skinIndex );
		vec4FromBufferAttribute( geometry.attributes.skinWeight, index, _skinWeight );

		if ( target.isVector4 ) {

			vec4Copy( target, _baseVector );
			vec4Set( 0, 0, 0, 0, target );

		} else {

			vec4Set( target.x, target.y, target.z, 1, _baseVector );
			vec3Set( target, 0, 0, 0 );

		}

		vec4ApplyMatrix4( _baseVector, this.bindMatrix, _baseVector );

		for ( let i = 0; i < 4; i ++ ) {

			const weight = vec4GetComponent( _skinWeight, i );

			if ( weight !== 0 ) {

				const boneIndex = vec4GetComponent( _skinIndex, i );

				mat4MultiplyMatrices( skeleton.bones[ boneIndex ].matrixWorld, skeleton.boneInverses[ boneIndex ], _matrix4 );

				vec4Copy( _baseVector, _vector4 );
				vec4ApplyMatrix4( _vector4, _matrix4, _vector4 );

				if ( target.isVector4 ) {

					vec4AddScaledVector( target, _vector4, weight, target );

				} else {

					vec3AddScaledVector( target, _vector4, weight, target );

				}

			}

		}

		if ( target.isVector4 ) {

			// ensure the homogenous coordinate remains unchanged after vector operations
			target.w = _baseVector.w;
			return vec4ApplyMatrix4( target, this.bindMatrixInverse, target );

		}

		return vec3ApplyMatrix4( target, this.bindMatrixInverse, target );

	}

}

export { SkinnedMesh };
