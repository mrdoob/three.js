import {
	Frustum,
	Vector3,
	Matrix4,
	Quaternion,
} from 'three';

const _frustum = new Frustum();
const _center = new Vector3();

const _tmpPoint = new Vector3();

const _vecNear = new Vector3();
const _vecTopLeft = new Vector3();
const _vecTopRight = new Vector3();
const _vecDownRight = new Vector3();
const _vecDownLeft = new Vector3();

const _vecFarTopLeft = new Vector3();
const _vecFarTopRight = new Vector3();
const _vecFarDownRight = new Vector3();
const _vecFarDownLeft = new Vector3();

const _vectemp1 = new Vector3();
const _vectemp2 = new Vector3();
const _vectemp3 = new Vector3();

const _matrix = new Matrix4();
const _quaternion = new Quaternion();
const _scale = new Vector3();

/**
 * This class can be used to select 3D objects in a scene with a selection box.
 * It is recommended to visualize the selected area with the help of {@link SelectionHelper}.
 *
 * ```js
 * const selectionBox = new SelectionBox( camera, scene );
 * const selectedObjects = selectionBox.select( startPoint, endPoint );
 * ```
 *
 * @three_import import { SelectionBox } from 'three/addons/interactive/SelectionBox.js';
 */
class SelectionBox {

	/**
	 * Constructs a new selection box.
	 *
	 * @param {Camera} camera - The camera the scene is rendered with.
	 * @param {Scene} scene - The scene.
	 * @param {number} [deep=Number.MAX_VALUE] - How deep the selection frustum of perspective cameras should extend.
	 */
	constructor( camera, scene, deep = Number.MAX_VALUE ) {

		/**
		 * The camera the scene is rendered with.
		 *
		 * @type {Camera}
		 */
		this.camera = camera;

		/**
		 * The camera the scene is rendered with.
		 *
		 * @type {Scene}
		 */
		this.scene = scene;

		/**
		 * The start point of the selection.
		 *
		 * @type {Vector3}
		 */
		this.startPoint = new Vector3();

		/**
		 * The end point of the selection.
		 *
		 * @type {Vector3}
		 */
		this.endPoint = new Vector3();

		/**
		 * The selected 3D objects.
		 *
		 * @type {Array<Object3D>}
		 */
		this.collection = [];

		/**
		 * The selected instance IDs of instanced meshes.
		 *
		 * @type {Object}
		 */
		this.instances = {};
		/**
		 * The selected batches of batched meshes.
		 *
		 * @type {Object}
		 */
		this.batches = {};

		/**
		 * How deep the selection frustum of perspective cameras should extend.
		 *
		 * @type {number}
		 * @default Number.MAX_VALUE
		 */
		this.deep = deep;

	}

	/**
	 * This method selects 3D objects in the scene based on the given start
	 * and end point. If no parameters are provided, the method uses the start
	 * and end values of the respective members.
	 *
	 * @param {Vector3} [startPoint] - The start point.
	 * @param {Vector3} [endPoint] - The end point.
	 * @return {Array<Object3D>} The selected 3D objects.
	 */
	select( startPoint, endPoint ) {

		this.startPoint = startPoint || this.startPoint;
		this.endPoint = endPoint || this.endPoint;
		this.collection = [];

		this._updateFrustum( this.startPoint, this.endPoint );
		this._searchChildInFrustum( _frustum, this.scene );

		return this.collection;

	}

	// private

	_updateFrustum( startPoint, endPoint ) {

		startPoint = startPoint || this.startPoint;
		endPoint = endPoint || this.endPoint;

		// Avoid invalid frustum

		if ( startPoint.x === endPoint.x ) {

			endPoint.x += Number.EPSILON;

		}

		if ( startPoint.y === endPoint.y ) {

			endPoint.y += Number.EPSILON;

		}

		this.camera.updateProjectionMatrix();
		this.camera.updateMatrixWorld();

		if ( this.camera.isPerspectiveCamera ) {

			_tmpPoint.copy( startPoint );
			_tmpPoint.x = Math.min( startPoint.x, endPoint.x );
			_tmpPoint.y = Math.max( startPoint.y, endPoint.y );
			endPoint.x = Math.max( startPoint.x, endPoint.x );
			endPoint.y = Math.min( startPoint.y, endPoint.y );

			_vecNear.setFromMatrixPosition( this.camera.matrixWorld );
			_vecTopLeft.copy( _tmpPoint );
			_vecTopRight.set( endPoint.x, _tmpPoint.y, 0 );
			_vecDownRight.copy( endPoint );
			_vecDownLeft.set( _tmpPoint.x, endPoint.y, 0 );

			_vecTopLeft.unproject( this.camera );
			_vecTopRight.unproject( this.camera );
			_vecDownRight.unproject( this.camera );
			_vecDownLeft.unproject( this.camera );

			_vectemp1.copy( _vecTopLeft ).sub( _vecNear );
			_vectemp2.copy( _vecTopRight ).sub( _vecNear );
			_vectemp3.copy( _vecDownRight ).sub( _vecNear );
			_vectemp1.normalize();
			_vectemp2.normalize();
			_vectemp3.normalize();

			_vectemp1.multiplyScalar( this.deep );
			_vectemp2.multiplyScalar( this.deep );
			_vectemp3.multiplyScalar( this.deep );
			_vectemp1.add( _vecNear );
			_vectemp2.add( _vecNear );
			_vectemp3.add( _vecNear );

			const planes = _frustum.planes;

			planes[ 0 ].setFromCoplanarPoints( _vecNear, _vecTopLeft, _vecTopRight );
			planes[ 1 ].setFromCoplanarPoints( _vecNear, _vecTopRight, _vecDownRight );
			planes[ 2 ].setFromCoplanarPoints( _vecDownRight, _vecDownLeft, _vecNear );
			planes[ 3 ].setFromCoplanarPoints( _vecDownLeft, _vecTopLeft, _vecNear );
			planes[ 4 ].setFromCoplanarPoints( _vecTopRight, _vecDownRight, _vecDownLeft );
			planes[ 5 ].setFromCoplanarPoints( _vectemp3, _vectemp2, _vectemp1 );
			planes[ 5 ].normal.multiplyScalar( - 1 );

		} else if ( this.camera.isOrthographicCamera ) {

			const left = Math.min( startPoint.x, endPoint.x );
			const top = Math.max( startPoint.y, endPoint.y );
			const right = Math.max( startPoint.x, endPoint.x );
			const down = Math.min( startPoint.y, endPoint.y );

			_vecTopLeft.set( left, top, - 1 );
			_vecTopRight.set( right, top, - 1 );
			_vecDownRight.set( right, down, - 1 );
			_vecDownLeft.set( left, down, - 1 );

			_vecFarTopLeft.set( left, top, 1 );
			_vecFarTopRight.set( right, top, 1 );
			_vecFarDownRight.set( right, down, 1 );
			_vecFarDownLeft.set( left, down, 1 );

			_vecTopLeft.unproject( this.camera );
			_vecTopRight.unproject( this.camera );
			_vecDownRight.unproject( this.camera );
			_vecDownLeft.unproject( this.camera );

			_vecFarTopLeft.unproject( this.camera );
			_vecFarTopRight.unproject( this.camera );
			_vecFarDownRight.unproject( this.camera );
			_vecFarDownLeft.unproject( this.camera );

			const planes = _frustum.planes;

			planes[ 0 ].setFromCoplanarPoints( _vecTopLeft, _vecFarTopLeft, _vecFarTopRight );
			planes[ 1 ].setFromCoplanarPoints( _vecTopRight, _vecFarTopRight, _vecFarDownRight );
			planes[ 2 ].setFromCoplanarPoints( _vecFarDownRight, _vecFarDownLeft, _vecDownLeft );
			planes[ 3 ].setFromCoplanarPoints( _vecFarDownLeft, _vecFarTopLeft, _vecTopLeft );
			planes[ 4 ].setFromCoplanarPoints( _vecTopRight, _vecDownRight, _vecDownLeft );
			planes[ 5 ].setFromCoplanarPoints( _vecFarDownRight, _vecFarTopRight, _vecFarTopLeft );
			planes[ 5 ].normal.multiplyScalar( - 1 );

		} else {

			console.error( 'THREE.SelectionBox: Unsupported camera type.' );

		}

	}

	_searchChildInFrustum( frustum, object ) {

		if ( object.isMesh || object.isLine || object.isPoints ) {

			if ( object.isInstancedMesh ) {

				this.instances[ object.uuid ] = [];

				for ( let instanceId = 0; instanceId < object.count; instanceId ++ ) {

					object.getMatrixAt( instanceId, _matrix );
					_matrix.decompose( _center, _quaternion, _scale );
					_center.applyMatrix4( object.matrixWorld );

					if ( frustum.containsPoint( _center ) ) {

						this.instances[ object.uuid ].push( instanceId );

					}

				}

			} else if ( object.isBatchedMesh ) {

				this.batches[ object.uuid ] = [];

				for ( let instanceId = 0, count = 0; count < object.instanceCount; instanceId ++ ) {

					// skip invalid instances in the batchedMesh

					if ( object.validateInstanceId( instanceId ) === false ) continue;

					count ++;

					object.getMatrixAt( instanceId, _matrix );
					_matrix.decompose( _center, _quaternion, _scale );
					_center.applyMatrix4( object.matrixWorld );

					if ( frustum.containsPoint( _center ) ) {

						this.batches[ object.uuid ].push( instanceId );

					}

				}

			} else {

				if ( object.geometry.boundingSphere === null ) object.geometry.computeBoundingSphere();

				_center.copy( object.geometry.boundingSphere.center );

				_center.applyMatrix4( object.matrixWorld );

				if ( frustum.containsPoint( _center ) ) {

					this.collection.push( object );

				}

			}

		}

		if ( object.children.length > 0 ) {

			for ( let x = 0; x < object.children.length; x ++ ) {

				this._searchChildInFrustum( frustum, object.children[ x ] );

			}

		}

	}

}

export { SelectionBox };
