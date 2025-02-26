import { InstancedBufferAttribute } from '../core/InstancedBufferAttribute.js';
import { Mesh } from './Mesh.js';
import { Box3 } from '../math/Box3.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Sphere } from '../math/Sphere.js';
import { DataTexture } from '../textures/DataTexture.js';
import { FloatType, RedFormat } from '../constants.js';

const _instanceLocalMatrix = /*@__PURE__*/ new Matrix4();
const _instanceWorldMatrix = /*@__PURE__*/ new Matrix4();

const _instanceIntersects = [];

const _box3 = /*@__PURE__*/ new Box3();
const _identity = /*@__PURE__*/ new Matrix4();
const _mesh = /*@__PURE__*/ new Mesh();
const _sphere = /*@__PURE__*/ new Sphere();

/**
 * A special version of a mesh with instanced rendering support. Use
 * this class if you have to render a large number of objects with the same
 * geometry and material(s) but with different world transformations. The usage
 * of 'InstancedMesh' will help you to reduce the number of draw calls and thus
 * improve the overall rendering performance in your application.
 *
 * @augments Mesh
 */
class InstancedMesh extends Mesh {

	/**
	 * Constructs a new instanced mesh.
	 *
	 * @param {BufferGeometry} [geometry] - The mesh geometry.
	 * @param {Material|Array<Material>} [material] - The mesh material.
	 * @param {number} count - The number of instances.
	 */
	constructor( geometry, material, count ) {

		super( geometry, material );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isInstancedMesh = true;

		/**
		 * Represents the local transformation of all instances. You have to set its
		 * {@link BufferAttribute#needsUpdate} flag to true if you modify instanced data
		 * via {@link InstancedMesh#setMatrixAt}.
		 *
		 * @type {InstancedBufferAttribute}
		 */
		this.instanceMatrix = new InstancedBufferAttribute( new Float32Array( count * 16 ), 16 );

		/**
		 * Represents the color of all instances. You have to set its
		 * {@link BufferAttribute#needsUpdate} flag to true if you modify instanced data
		 * via {@link InstancedMesh#setColorAt}.
		 *
		 * @type {?InstancedBufferAttribute}
		 * @default null
		 */
		this.instanceColor = null;

		/**
		 * Represents the morph target weights of all instances. You have to set its
		 * {@link Texture#needsUpdate} flag to true if you modify instanced data
		 * via {@link InstancedMesh#setMorphAt}.
		 *
		 * @type {?InstancedBufferAttribute}
		 * @default null
		 */
		this.morphTexture = null;

		/**
		 * The number of instances.
		 *
		 * @type {number}
		 */
		this.count = count;

		/**
		 * The bounding box of the instanced mesh. Can be computed via {@link InstancedMesh#computeBoundingBox}.
		 *
		 * @type {?Box3}
		 * @default null
		 */
		this.boundingBox = null;

		/**
		 * The bounding sphere of the instanced mesh. Can be computed via {@link InstancedMesh#computeBoundingSphere}.
		 *
		 * @type {?Sphere}
		 * @default null
		 */
		this.boundingSphere = null;

		for ( let i = 0; i < count; i ++ ) {

			this.setMatrixAt( i, _identity );

		}

	}

	/**
	 * Computes the bounding box of the instanced mesh, and updates {@link InstancedMesh#boundingBox}.
	 * The bounding box is not automatically computed by the engine; this method must be called by your app.
	 * You may need to recompute the bounding box if an instance is transformed via {@link InstancedMesh#setMatrixAt}.
	 */
	computeBoundingBox() {

		const geometry = this.geometry;
		const count = this.count;

		if ( this.boundingBox === null ) {

			this.boundingBox = new Box3();

		}

		if ( geometry.boundingBox === null ) {

			geometry.computeBoundingBox();

		}

		this.boundingBox.makeEmpty();

		for ( let i = 0; i < count; i ++ ) {

			this.getMatrixAt( i, _instanceLocalMatrix );

			_box3.copy( geometry.boundingBox ).applyMatrix4( _instanceLocalMatrix );

			this.boundingBox.union( _box3 );

		}

	}

	/**
	 * Computes the bounding sphere of the instanced mesh, and updates {@link InstancedMesh#boundingSphere}
	 * The engine automatically computes the bounding sphere when it is needed, e.g., for ray casting or view frustum culling.
	 * You may need to recompute the bounding sphere if an instance is transformed via {@link InstancedMesh#setMatrixAt}.
	 */
	computeBoundingSphere() {

		const geometry = this.geometry;
		const count = this.count;

		if ( this.boundingSphere === null ) {

			this.boundingSphere = new Sphere();

		}

		if ( geometry.boundingSphere === null ) {

			geometry.computeBoundingSphere();

		}

		this.boundingSphere.makeEmpty();

		for ( let i = 0; i < count; i ++ ) {

			this.getMatrixAt( i, _instanceLocalMatrix );

			_sphere.copy( geometry.boundingSphere ).applyMatrix4( _instanceLocalMatrix );

			this.boundingSphere.union( _sphere );

		}

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		this.instanceMatrix.copy( source.instanceMatrix );

		if ( source.morphTexture !== null ) this.morphTexture = source.morphTexture.clone();
		if ( source.instanceColor !== null ) this.instanceColor = source.instanceColor.clone();

		this.count = source.count;

		if ( source.boundingBox !== null ) this.boundingBox = source.boundingBox.clone();
		if ( source.boundingSphere !== null ) this.boundingSphere = source.boundingSphere.clone();

		return this;

	}

	/**
	 * Gets the color of the defined instance.
	 *
	 * @param {number} index - The instance index.
	 * @param {Color} color - The target object that is used to store the method's result.
	 */
	getColorAt( index, color ) {

		color.fromArray( this.instanceColor.array, index * 3 );

	}

	/**
	 * Gets the local transformation matrix of the defined instance.
	 *
	 * @param {number} index - The instance index.
	 * @param {Matrix4} matrix - The target object that is used to store the method's result.
	 */
	getMatrixAt( index, matrix ) {

		matrix.fromArray( this.instanceMatrix.array, index * 16 );

	}

	/**
	 * Gets the morph target weights of the defined instance.
	 *
	 * @param {number} index - The instance index.
	 * @param {Mesh} object - The target object that is used to store the method's result.
	 */
	getMorphAt( index, object ) {

		const objectInfluences = object.morphTargetInfluences;

		const array = this.morphTexture.source.data.data;

		const len = objectInfluences.length + 1; // All influences + the baseInfluenceSum

		const dataIndex = index * len + 1; // Skip the baseInfluenceSum at the beginning

		for ( let i = 0; i < objectInfluences.length; i ++ ) {

			objectInfluences[ i ] = array[ dataIndex + i ];

		}

	}

	raycast( raycaster, intersects ) {

		const matrixWorld = this.matrixWorld;
		const raycastTimes = this.count;

		_mesh.geometry = this.geometry;
		_mesh.material = this.material;

		if ( _mesh.material === undefined ) return;

		// test with bounding sphere first

		if ( this.boundingSphere === null ) this.computeBoundingSphere();

		_sphere.copy( this.boundingSphere );
		_sphere.applyMatrix4( matrixWorld );

		if ( raycaster.ray.intersectsSphere( _sphere ) === false ) return;

		// now test each instance

		for ( let instanceId = 0; instanceId < raycastTimes; instanceId ++ ) {

			// calculate the world matrix for each instance

			this.getMatrixAt( instanceId, _instanceLocalMatrix );

			_instanceWorldMatrix.multiplyMatrices( matrixWorld, _instanceLocalMatrix );

			// the mesh represents this single instance

			_mesh.matrixWorld = _instanceWorldMatrix;

			_mesh.raycast( raycaster, _instanceIntersects );

			// process the result of raycast

			for ( let i = 0, l = _instanceIntersects.length; i < l; i ++ ) {

				const intersect = _instanceIntersects[ i ];
				intersect.instanceId = instanceId;
				intersect.object = this;
				intersects.push( intersect );

			}

			_instanceIntersects.length = 0;

		}

	}

	/**
	 * Sets the given color to the defined instance. Make sure you set the `needsUpdate` flag of
	 * {@link InstancedMesh#instanceColor} to `true` after updating all the colors.
	 *
	 * @param {number} index - The instance index.
	 * @param {Color} color - The instance color.
	 */
	setColorAt( index, color ) {

		if ( this.instanceColor === null ) {

			this.instanceColor = new InstancedBufferAttribute( new Float32Array( this.instanceMatrix.count * 3 ).fill( 1 ), 3 );

		}

		color.toArray( this.instanceColor.array, index * 3 );

	}

	/**
	 * Sets the given local transformation matrix to the defined instance. Make sure you set the `needsUpdate` flag of
	 * {@link InstancedMesh#instanceMatrix} to `true` after updating all the colors.
	 *
	 * @param {number} index - The instance index.
	 * @param {Matrix4} matrix - The the local transformation.
	 */
	setMatrixAt( index, matrix ) {

		matrix.toArray( this.instanceMatrix.array, index * 16 );

	}

	/**
	 * Sets the morph target weights to the defined instance. Make sure you set the `needsUpdate` flag of
	 * {@link InstancedMesh#morphTexture} to `true` after updating all the influences.
	 *
	 * @param {number} index - The instance index.
	 * @param {Mesh} object -  A mesh which `morphTargetInfluences` property containing the morph target weights
	 * of a single instance.
	 */
	setMorphAt( index, object ) {

		const objectInfluences = object.morphTargetInfluences;

		const len = objectInfluences.length + 1; // morphBaseInfluence + all influences

		if ( this.morphTexture === null ) {

			this.morphTexture = new DataTexture( new Float32Array( len * this.count ), len, this.count, RedFormat, FloatType );

		}

		const array = this.morphTexture.source.data.data;

		let morphInfluencesSum = 0;

		for ( let i = 0; i < objectInfluences.length; i ++ ) {

			morphInfluencesSum += objectInfluences[ i ];

		}

		const morphBaseInfluence = this.geometry.morphTargetsRelative ? 1 : 1 - morphInfluencesSum;

		const dataIndex = len * index;

		array[ dataIndex ] = morphBaseInfluence;

		array.set( objectInfluences, dataIndex + 1 );

	}

	updateMorphTargets() {

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever this instance is no longer used in your app.
	 */
	dispose() {

		this.dispatchEvent( { type: 'dispose' } );

		if ( this.morphTexture !== null ) {

			this.morphTexture.dispose();
			this.morphTexture = null;

		}

	}

}

export { InstancedMesh };
