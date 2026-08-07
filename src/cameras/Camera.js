import { WebGLCoordinateSystem } from '../constants.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Object3D } from '../core/Object3D.js';
import { mat4Compose, mat4Copy, mat4Decompose, mat4Invert } from '../math/Matrix4Functions.js';
import { quatCreate } from '../math/QuaternionFunctions.js';
import { vec3Create, vec3Negate, vec3Set } from '../math/Vector3Functions.js';

const _position = /*@__PURE__*/ vec3Create();
const _quaternion = /*@__PURE__*/ quatCreate();
const _scale = /*@__PURE__*/ vec3Create();

/**
 * Abstract base class for cameras. This class should always be inherited
 * when you build a new camera.
 *
 * @abstract
 * @augments Object3D
 */
class Camera extends Object3D {

	/**
	 * Constructs a new camera.
	 */
	constructor() {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isCamera = true;

		this.type = 'Camera';

		/**
		 * The inverse of the camera's world matrix.
		 *
		 * @type {Matrix4}
		 */
		this.matrixWorldInverse = new Matrix4();

		/**
		 * The camera's projection matrix.
		 *
		 * @type {Matrix4}
		 */
		this.projectionMatrix = new Matrix4();

		/**
		 * The inverse of the camera's projection matrix.
		 *
		 * @type {Matrix4}
		 */
		this.projectionMatrixInverse = new Matrix4();

		/**
		 * The coordinate system in which the camera is used.
		 *
		 * @type {(WebGLCoordinateSystem|WebGPUCoordinateSystem)}
		 */
		this.coordinateSystem = WebGLCoordinateSystem;

		this._reversedDepth = false;

	}

	/**
	 * The flag that indicates whether the camera uses a reversed depth buffer.
	 *
	 * @type {boolean}
	 * @default false
	 */
	get reversedDepth() {

		return this._reversedDepth;

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		mat4Copy( source.matrixWorldInverse, this.matrixWorldInverse );

		mat4Copy( source.projectionMatrix, this.projectionMatrix );
		mat4Copy( source.projectionMatrixInverse, this.projectionMatrixInverse );

		this.coordinateSystem = source.coordinateSystem;

		return this;

	}

	/**
	 * Returns a vector representing the ("look") direction of the 3D object in world space.
	 *
	 * This method is overwritten since cameras have a different forward vector compared to other
	 * 3D objects. A camera looks down its local, negative z-axis by default.
	 *
	 * @param {Vector3} target - The target vector the result is stored to.
	 * @return {Vector3} The 3D object's direction in world space.
	 */
	getWorldDirection( target ) {

		return vec3Negate( super.getWorldDirection( target ), target );

	}

	updateMatrixWorld( force ) {

		super.updateMatrixWorld( force );

		this._updateMatrixWorldInverse();

	}

	updateWorldMatrix( updateParents, updateChildren, force = false ) {

		super.updateWorldMatrix( updateParents, updateChildren, force );

		this._updateMatrixWorldInverse();

	}

	_updateMatrixWorldInverse() {

		// exclude scale from view matrix to be glTF conform

		mat4Decompose( this.matrixWorld, _position, _quaternion, _scale );

		if ( _scale.x === 1 && _scale.y === 1 && _scale.z === 1 ) {

			mat4Copy( this.matrixWorld, this.matrixWorldInverse );
			mat4Invert( this.matrixWorldInverse, this.matrixWorldInverse );

		} else {

			vec3Set( _scale, 1, 1, 1 );
			mat4Compose( _position, _quaternion, _scale, this.matrixWorldInverse );
			mat4Invert( this.matrixWorldInverse, this.matrixWorldInverse );

		}

	}

	clone() {

		return new this.constructor().copy( this );

	}

}

export { Camera };
