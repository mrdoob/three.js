import {
	frustumContainsPoint,
	frustumCreate,
	mat4Create,
	mat4Decompose,
	planeSetFromCoplanarPoints,
	quatCreate,
	vec3Add,
	vec3ApplyMatrix4,
	vec3Copy,
	vec3Create,
	vec3MultiplyScalar,
	vec3Normalize,
	vec3Set,
	vec3SetFromMatrixPosition,
	vec3Sub,
	vec3Unproject
} from 'three';

const _frustum = /*@__PURE__*/ frustumCreate();
const _center = /*@__PURE__*/ vec3Create();

const _tmpPoint = /*@__PURE__*/ vec3Create();

const _vecNear = /*@__PURE__*/ vec3Create();
const _vecTopLeft = /*@__PURE__*/ vec3Create();
const _vecTopRight = /*@__PURE__*/ vec3Create();
const _vecDownRight = /*@__PURE__*/ vec3Create();
const _vecDownLeft = /*@__PURE__*/ vec3Create();

const _vecFarTopLeft = /*@__PURE__*/ vec3Create();
const _vecFarTopRight = /*@__PURE__*/ vec3Create();
const _vecFarDownRight = /*@__PURE__*/ vec3Create();
const _vecFarDownLeft = /*@__PURE__*/ vec3Create();

const _vectemp1 = /*@__PURE__*/ vec3Create();
const _vectemp2 = /*@__PURE__*/ vec3Create();
const _vectemp3 = /*@__PURE__*/ vec3Create();

const _matrix = /*@__PURE__*/ mat4Create();
const _quaternion = /*@__PURE__*/ quatCreate();
const _scale = /*@__PURE__*/ vec3Create();

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
		 * @type {Vector3Like}
		 */
		this.startPoint = vec3Create();

		/**
		 * The end point of the selection.
		 *
		 * @type {Vector3Like}
		 */
		this.endPoint = vec3Create();

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
	 * @param {Vector3Like} [startPoint] - The start point.
	 * @param {Vector3Like} [endPoint] - The end point.
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

			vec3Copy( startPoint, _tmpPoint );
			_tmpPoint.x = Math.min( startPoint.x, endPoint.x );
			_tmpPoint.y = Math.max( startPoint.y, endPoint.y );
			endPoint.x = Math.max( startPoint.x, endPoint.x );
			endPoint.y = Math.min( startPoint.y, endPoint.y );

			vec3SetFromMatrixPosition( this.camera.matrixWorld, _vecNear );
			vec3Copy( _tmpPoint, _vecTopLeft );
			vec3Set( _vecTopRight, endPoint.x, _tmpPoint.y, 0 );
			vec3Copy( endPoint, _vecDownRight );
			vec3Set( _vecDownLeft, _tmpPoint.x, endPoint.y, 0 );

			vec3Unproject( _vecTopLeft, this.camera, _vecTopLeft );
			vec3Unproject( _vecTopRight, this.camera, _vecTopRight );
			vec3Unproject( _vecDownRight, this.camera, _vecDownRight );
			vec3Unproject( _vecDownLeft, this.camera, _vecDownLeft );

			vec3Sub( _vecTopLeft, _vecNear, _vectemp1 );
			vec3Sub( _vecTopRight, _vecNear, _vectemp2 );
			vec3Sub( _vecDownRight, _vecNear, _vectemp3 );
			vec3Normalize( _vectemp1, _vectemp1 );
			vec3Normalize( _vectemp2, _vectemp2 );
			vec3Normalize( _vectemp3, _vectemp3 );

			vec3MultiplyScalar( _vectemp1, this.deep, _vectemp1 );
			vec3MultiplyScalar( _vectemp2, this.deep, _vectemp2 );
			vec3MultiplyScalar( _vectemp3, this.deep, _vectemp3 );
			vec3Add( _vectemp1, _vecNear, _vectemp1 );
			vec3Add( _vectemp2, _vecNear, _vectemp2 );
			vec3Add( _vectemp3, _vecNear, _vectemp3 );

			const planes = _frustum.planes;

			planeSetFromCoplanarPoints( _vecNear, _vecTopLeft, _vecTopRight, planes[ 0 ] );
			planeSetFromCoplanarPoints( _vecNear, _vecTopRight, _vecDownRight, planes[ 1 ] );
			planeSetFromCoplanarPoints( _vecDownRight, _vecDownLeft, _vecNear, planes[ 2 ] );
			planeSetFromCoplanarPoints( _vecDownLeft, _vecTopLeft, _vecNear, planes[ 3 ] );
			planeSetFromCoplanarPoints( _vecTopRight, _vecDownRight, _vecDownLeft, planes[ 4 ] );
			planeSetFromCoplanarPoints( _vectemp3, _vectemp2, _vectemp1, planes[ 5 ] );
			vec3MultiplyScalar( planes[ 5 ].normal, - 1, planes[ 5 ].normal );

		} else if ( this.camera.isOrthographicCamera ) {

			const left = Math.min( startPoint.x, endPoint.x );
			const top = Math.max( startPoint.y, endPoint.y );
			const right = Math.max( startPoint.x, endPoint.x );
			const down = Math.min( startPoint.y, endPoint.y );

			vec3Set( _vecTopLeft, left, top, - 1 );
			vec3Set( _vecTopRight, right, top, - 1 );
			vec3Set( _vecDownRight, right, down, - 1 );
			vec3Set( _vecDownLeft, left, down, - 1 );

			vec3Set( _vecFarTopLeft, left, top, 1 );
			vec3Set( _vecFarTopRight, right, top, 1 );
			vec3Set( _vecFarDownRight, right, down, 1 );
			vec3Set( _vecFarDownLeft, left, down, 1 );

			vec3Unproject( _vecTopLeft, this.camera, _vecTopLeft );
			vec3Unproject( _vecTopRight, this.camera, _vecTopRight );
			vec3Unproject( _vecDownRight, this.camera, _vecDownRight );
			vec3Unproject( _vecDownLeft, this.camera, _vecDownLeft );

			vec3Unproject( _vecFarTopLeft, this.camera, _vecFarTopLeft );
			vec3Unproject( _vecFarTopRight, this.camera, _vecFarTopRight );
			vec3Unproject( _vecFarDownRight, this.camera, _vecFarDownRight );
			vec3Unproject( _vecFarDownLeft, this.camera, _vecFarDownLeft );

			const planes = _frustum.planes;

			planeSetFromCoplanarPoints( _vecTopLeft, _vecFarTopLeft, _vecFarTopRight, planes[ 0 ] );
			planeSetFromCoplanarPoints( _vecTopRight, _vecFarTopRight, _vecFarDownRight, planes[ 1 ] );
			planeSetFromCoplanarPoints( _vecFarDownRight, _vecFarDownLeft, _vecDownLeft, planes[ 2 ] );
			planeSetFromCoplanarPoints( _vecFarDownLeft, _vecFarTopLeft, _vecTopLeft, planes[ 3 ] );
			planeSetFromCoplanarPoints( _vecTopRight, _vecDownRight, _vecDownLeft, planes[ 4 ] );
			planeSetFromCoplanarPoints( _vecFarDownRight, _vecFarTopRight, _vecFarTopLeft, planes[ 5 ] );
			vec3MultiplyScalar( planes[ 5 ].normal, - 1, planes[ 5 ].normal );

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
					mat4Decompose( _matrix, _center, _quaternion, _scale );
					vec3ApplyMatrix4( _center, object.matrixWorld, _center );

					if ( frustumContainsPoint( frustum, _center ) ) {

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
					mat4Decompose( _matrix, _center, _quaternion, _scale );
					vec3ApplyMatrix4( _center, object.matrixWorld, _center );

					if ( frustumContainsPoint( frustum, _center ) ) {

						this.batches[ object.uuid ].push( instanceId );

					}

				}

			} else {

				if ( object.geometry.boundingSphere === null ) object.geometry.computeBoundingSphere();

				vec3Copy( object.geometry.boundingSphere.center, _center );

				vec3ApplyMatrix4( _center, object.matrixWorld, _center );

				if ( frustumContainsPoint( frustum, _center ) ) {

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
