import {
	BufferGeometry,
	Float32BufferAttribute,
	Mesh,
	MeshBasicMaterial,
	Object3D,
	Raycaster,
	SphereGeometry,
	mat4Create,
	mat4ExtractRotation,
	quatCopy,
	vec3AddVectors,
	vec3ApplyAxisAngle,
	vec3ApplyMatrix4,
	vec3Copy,
	vec3Create,
	vec3DistanceTo,
	vec3MultiplyScalar,
	vec3Set,
	vec3SetFromMatrixPosition
} from 'three';

const PINCH_MAX = 0.05;
const PINCH_THRESHOLD = 0.02;
const PINCH_MIN = 0.01;
const POINTER_ADVANCE_MAX = 0.02;
const POINTER_OPACITY_MAX = 1;
const POINTER_OPACITY_MIN = 0.4;
const POINTER_FRONT_RADIUS = 0.002;
const POINTER_REAR_RADIUS = 0.01;
const POINTER_REAR_RADIUS_MIN = 0.003;
const POINTER_LENGTH = 0.035;
const POINTER_SEGMENTS = 16;
const POINTER_RINGS = 12;
const POINTER_HEMISPHERE_ANGLE = 110;
const YAXIS = /* @__PURE__ */ vec3Set( vec3Create(), 0, 1, 0 );
const ZAXIS = /* @__PURE__ */ vec3Set( vec3Create(), 0, 0, 1 );

const CURSOR_RADIUS = 0.02;
const CURSOR_MAX_DISTANCE = 1.5;

const _tempMatrix = /* @__PURE__ */ mat4Create();
const _position = /* @__PURE__ */ vec3Create();
const _direction = /* @__PURE__ */ vec3Create();
const _segmentVector = /* @__PURE__ */ vec3Create();
const _frontFaceBase = /* @__PURE__ */ vec3Create();
const _rearBase = /* @__PURE__ */ vec3Create();

/**
 * Represents an Oculus hand pointer model.
 *
 * @augments Object3D
 * @three_import import { OculusHandPointerModel } from 'three/addons/webxr/OculusHandPointerModel.js';
 */
class OculusHandPointerModel extends Object3D {

	/**
	 * Constructs a new Oculus hand model.
	 *
	 * @param {Group} hand - The hand controller.
	 * @param {Group} controller - The WebXR controller in target ray space.
	 */
	constructor( hand, controller ) {

		super();

		/**
		 * The hand controller.
		 *
		 * @type {Group}
		 */
		this.hand = hand;

		/**
		 * The WebXR controller in target ray space.
		 *
		 * @type {Group}
		 */
		this.controller = controller;

		// Unused
		this.motionController = null;
		this.envMap = null;
		this.mesh = null;

		/**
		 * The pointer geometry.
		 *
		 * @type {?BufferGeometry}
		 * @default null
		 */
		this.pointerGeometry = null;

		/**
		 * The pointer mesh.
		 *
		 * @type {?Mesh}
		 * @default null
		 */
		this.pointerMesh = null;

		/**
		 * The pointer object that holds the pointer mesh.
		 *
		 * @type {?Object3D}
		 * @default null
		 */
		this.pointerObject = null;

		/**
		 * Whether the model is pinched or not.
		 *
		 * @type {?boolean}
		 * @default false
		 */
		this.pinched = false;

		/**
		 * Whether the model is attached or not.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.attached = false;

		/**
		 * The cursor object.
		 *
		 * @type {?Mesh}
		 * @default null
		 */
		this.cursorObject = null;

		/**
		 * The internal raycaster used for detecting
		 * intersections.
		 *
		 * @type {?Raycaster}
		 * @default null
		 */
		this.raycaster = null;

		this._onConnected = this._onConnected.bind( this );
		this._onDisconnected = this._onDisconnected.bind( this );
		this.hand.addEventListener( 'connected', this._onConnected );
		this.hand.addEventListener( 'disconnected', this._onDisconnected );

	}

	_onConnected( event ) {

		const xrInputSource = event.data;
		if ( xrInputSource.hand ) {

			this.visible = true;
			this.xrInputSource = xrInputSource;

			this.createPointer();

		}

	}

	_onDisconnected() {

		this.visible = false;
		this.xrInputSource = null;

		if ( this.pointerGeometry ) this.pointerGeometry.dispose();
		if ( this.pointerMesh && this.pointerMesh.material ) this.pointerMesh.material.dispose();

		this.clear();

	}

	_drawVerticesRing( vertices, baseVector, ringIndex ) {

		vec3Copy( baseVector, _segmentVector );
		for ( let i = 0; i < POINTER_SEGMENTS; i ++ ) {

			vec3ApplyAxisAngle( _segmentVector, ZAXIS, ( Math.PI * 2 ) / POINTER_SEGMENTS, _segmentVector );
			const vid = ringIndex * POINTER_SEGMENTS + i;
			vertices[ 3 * vid ] = _segmentVector.x;
			vertices[ 3 * vid + 1 ] = _segmentVector.y;
			vertices[ 3 * vid + 2 ] = _segmentVector.z;

		}

	}

	_updatePointerVertices( rearRadius ) {

		const vertices = this.pointerGeometry.attributes.position.array;
		// first ring for front face
		vec3Set(
			_frontFaceBase,
			POINTER_FRONT_RADIUS,
			0,
			- 1 * ( POINTER_LENGTH - rearRadius )
		);
		this._drawVerticesRing( vertices, _frontFaceBase, 0 );

		// rings for rear hemisphere
		vec3Set(
			_rearBase,
			Math.sin( ( Math.PI * POINTER_HEMISPHERE_ANGLE ) / 180 ) * rearRadius,
			Math.cos( ( Math.PI * POINTER_HEMISPHERE_ANGLE ) / 180 ) * rearRadius,
			0
		);
		for ( let i = 0; i < POINTER_RINGS; i ++ ) {

			this._drawVerticesRing( vertices, _rearBase, i + 1 );
			vec3ApplyAxisAngle(
				_rearBase,
				YAXIS,
				( Math.PI * POINTER_HEMISPHERE_ANGLE ) / 180 / ( POINTER_RINGS * - 2 ),
				_rearBase
			);

		}

		// front and rear face center vertices
		const frontCenterIndex = POINTER_SEGMENTS * ( 1 + POINTER_RINGS );
		const rearCenterIndex = POINTER_SEGMENTS * ( 1 + POINTER_RINGS ) + 1;
		vertices[ frontCenterIndex * 3 ] = 0;
		vertices[ frontCenterIndex * 3 + 1 ] = 0;
		vertices[ frontCenterIndex * 3 + 2 ] = - 1 * ( POINTER_LENGTH - rearRadius );
		vertices[ rearCenterIndex * 3 ] = 0;
		vertices[ rearCenterIndex * 3 + 1 ] = 0;
		vertices[ rearCenterIndex * 3 + 2 ] = rearRadius;

		this.pointerGeometry.setAttribute(
			'position',
			new Float32BufferAttribute( vertices, 3 )
		);
		// verticesNeedUpdate = true;

	}

	/**
	 * Creates a pointer mesh and adds it to this model.
	 */
	createPointer() {

		let i, j;
		const vertices = new Array(
			( ( POINTER_RINGS + 1 ) * POINTER_SEGMENTS + 2 ) * 3
		).fill( 0 );
		// const vertices = [];
		const indices = [];
		this.pointerGeometry = new BufferGeometry();

		this.pointerGeometry.setAttribute(
			'position',
			new Float32BufferAttribute( vertices, 3 )
		);

		this._updatePointerVertices( POINTER_REAR_RADIUS );

		// construct faces to connect rings
		for ( i = 0; i < POINTER_RINGS; i ++ ) {

			for ( j = 0; j < POINTER_SEGMENTS - 1; j ++ ) {

				indices.push(
					i * POINTER_SEGMENTS + j,
					i * POINTER_SEGMENTS + j + 1,
					( i + 1 ) * POINTER_SEGMENTS + j
				);
				indices.push(
					i * POINTER_SEGMENTS + j + 1,
					( i + 1 ) * POINTER_SEGMENTS + j + 1,
					( i + 1 ) * POINTER_SEGMENTS + j
				);

			}

			indices.push(
				( i + 1 ) * POINTER_SEGMENTS - 1,
				i * POINTER_SEGMENTS,
				( i + 2 ) * POINTER_SEGMENTS - 1
			);
			indices.push(
				i * POINTER_SEGMENTS,
				( i + 1 ) * POINTER_SEGMENTS,
				( i + 2 ) * POINTER_SEGMENTS - 1
			);

		}

		// construct front and rear face
		const frontCenterIndex = POINTER_SEGMENTS * ( 1 + POINTER_RINGS );
		const rearCenterIndex = POINTER_SEGMENTS * ( 1 + POINTER_RINGS ) + 1;

		for ( i = 0; i < POINTER_SEGMENTS - 1; i ++ ) {

			indices.push( frontCenterIndex, i + 1, i );
			indices.push(
				rearCenterIndex,
				i + POINTER_SEGMENTS * POINTER_RINGS,
				i + POINTER_SEGMENTS * POINTER_RINGS + 1
			);

		}

		indices.push( frontCenterIndex, 0, POINTER_SEGMENTS - 1 );
		indices.push(
			rearCenterIndex,
			POINTER_SEGMENTS * ( POINTER_RINGS + 1 ) - 1,
			POINTER_SEGMENTS * POINTER_RINGS
		);

		const material = new MeshBasicMaterial();
		material.transparent = true;
		material.opacity = POINTER_OPACITY_MIN;

		this.pointerGeometry.setIndex( indices );

		this.pointerMesh = new Mesh( this.pointerGeometry, material );

		vec3Set( this.pointerMesh.position, 0, 0, - 1 * POINTER_REAR_RADIUS );
		this.pointerObject = new Object3D();
		this.pointerObject.add( this.pointerMesh );

		this.raycaster = new Raycaster();

		// create cursor
		const cursorGeometry = new SphereGeometry( CURSOR_RADIUS, 10, 10 );
		const cursorMaterial = new MeshBasicMaterial();
		cursorMaterial.transparent = true;
		cursorMaterial.opacity = POINTER_OPACITY_MIN;

		this.cursorObject = new Mesh( cursorGeometry, cursorMaterial );
		this.pointerObject.add( this.cursorObject );

		this.add( this.pointerObject );

	}

	_updateRaycaster() {

		if ( this.raycaster ) {

			const pointerMatrix = this.pointerObject.matrixWorld;
			mat4ExtractRotation( pointerMatrix, _tempMatrix );
			vec3SetFromMatrixPosition( pointerMatrix, this.raycaster.ray.origin );
			vec3Set( this.raycaster.ray.direction, 0, 0, - 1 );
			vec3ApplyMatrix4( this.raycaster.ray.direction, _tempMatrix, this.raycaster.ray.direction );

		}

	}

	_updatePointer() {

		this.pointerObject.visible = this.controller.visible;
		const indexTip = this.hand.joints[ 'index-finger-tip' ];
		const thumbTip = this.hand.joints[ 'thumb-tip' ];
		const distance = vec3DistanceTo( indexTip.position, thumbTip.position );
		vec3AddVectors( indexTip.position, thumbTip.position, _position );
		vec3MultiplyScalar( _position, 0.5, _position );
		vec3Copy( _position, this.pointerObject.position );
		quatCopy( this.controller.quaternion, this.pointerObject.quaternion );

		this.pinched = distance <= PINCH_THRESHOLD;

		const pinchScale = ( distance - PINCH_MIN ) / ( PINCH_MAX - PINCH_MIN );
		const focusScale = ( distance - PINCH_MIN ) / ( PINCH_THRESHOLD - PINCH_MIN );
		if ( pinchScale > 1 ) {

			this._updatePointerVertices( POINTER_REAR_RADIUS );
			vec3Set( this.pointerMesh.position, 0, 0, - 1 * POINTER_REAR_RADIUS );
			this.pointerMesh.material.opacity = POINTER_OPACITY_MIN;

		} else if ( pinchScale > 0 ) {

			const rearRadius =
        ( POINTER_REAR_RADIUS - POINTER_REAR_RADIUS_MIN ) * pinchScale +
        POINTER_REAR_RADIUS_MIN;
			this._updatePointerVertices( rearRadius );
			if ( focusScale < 1 ) {

				vec3Set(
					this.pointerMesh.position,
					0,
					0,
					- 1 * rearRadius - ( 1 - focusScale ) * POINTER_ADVANCE_MAX
				);
				this.pointerMesh.material.opacity =
          POINTER_OPACITY_MIN +
          ( 1 - focusScale ) * ( POINTER_OPACITY_MAX - POINTER_OPACITY_MIN );

			} else {

				vec3Set( this.pointerMesh.position, 0, 0, - 1 * rearRadius );
				this.pointerMesh.material.opacity = POINTER_OPACITY_MIN;

			}

		} else {

			this._updatePointerVertices( POINTER_REAR_RADIUS_MIN );
			vec3Set(
				this.pointerMesh.position,
				0,
				0,
				- 1 * POINTER_REAR_RADIUS_MIN - POINTER_ADVANCE_MAX
			);
			this.pointerMesh.material.opacity = POINTER_OPACITY_MAX;

		}

		this.cursorObject.material.opacity = this.pointerMesh.material.opacity;

	}

	/**
	 * Overwritten with a custom implementation. Makes sure the internal pointer and raycaster are updated.
	 *
	 * @param {boolean} [force=false] - When set to `true`, a recomputation of world matrices is forced even
	 * when {@link Object3D#matrixWorldAutoUpdate} is set to `false`.
	 */
	updateMatrixWorld( force ) {

		super.updateMatrixWorld( force );
		if ( this.pointerGeometry ) {

			this._updatePointer();
			this._updateRaycaster();

		}

	}

	/**
	 * Returns `true` is the model is pinched.
	 *
	 * @return {boolean} Whether the model is pinched or not.
	 */
	isPinched() {

		return this.pinched;

	}

	/**
	 * Sets the attached state.
	 *
	 * @param {boolean} attached - Whether the model is attached or not.
	 */
	setAttached( attached ) {

		this.attached = attached;

	}

	/**
	 * Returns `true` is the model is attached.
	 *
	 * @return {boolean} Whether the model is attached or not.
	 */
	isAttached() {

		return this.attached;

	}

	/**
	 * Performs an intersection test with the model's raycaster and the given object.
	 *
	 * @param {Object3D} object - The 3D object to check for intersection with the ray.
	 * @param {boolean} [recursive=true] - If set to `true`, it also checks all descendants.
	 * Otherwise it only checks intersection with the object.
	 * @return {Array<Raycaster~Intersection>} An array holding the intersection points.
	 */
	intersectObject( object, recursive = true ) {

		if ( this.raycaster ) {

			return this.raycaster.intersectObject( object, recursive );

		}

	}

	/**
	 * Performs an intersection test with the model's raycaster and the given objects.
	 *
	 * @param {Array<Object3D>} objects - The 3D objects to check for intersection with the ray.
	 * @param {boolean} [recursive=true] - If set to `true`, it also checks all descendants.
	 * Otherwise it only checks intersection with the object.
	 * @return {Array<Raycaster~Intersection>} An array holding the intersection points.
	 */
	intersectObjects( objects, recursive = true ) {

		if ( this.raycaster ) {

			return this.raycaster.intersectObjects( objects, recursive );

		}

	}

	/**
	 * Checks for intersections between the model's raycaster and the given objects. The method
	 * updates the cursor object to the intersection point.
	 *
	 * @param {Array<Object3D>} objects - The 3D objects to check for intersection with the ray.
	 * @param {boolean} [recursive=false] - If set to `true`, it also checks all descendants.
	 * Otherwise it only checks intersection with the object.
	 */
	checkIntersections( objects, recursive = false ) {

		if ( this.raycaster && ! this.attached ) {

			const intersections = this.raycaster.intersectObjects( objects, recursive );
			vec3Set( _direction, 0, 0, - 1 );
			if ( intersections.length > 0 ) {

				const intersection = intersections[ 0 ];
				const distance = intersection.distance;
				vec3MultiplyScalar( _direction, distance, this.cursorObject.position );

			} else {

				vec3MultiplyScalar( _direction, CURSOR_MAX_DISTANCE, this.cursorObject.position );

			}

		}

	}

	/**
	 * Sets the cursor to the given distance.
	 *
	 * @param {number} distance - The distance to set the cursor to.
	 */
	setCursor( distance ) {

		if ( this.raycaster && ! this.attached ) {

			vec3Set( _direction, 0, 0, - 1 );
			vec3MultiplyScalar( _direction, distance, this.cursorObject.position );

		}

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever this instance is no longer used in your app.
	 */
	dispose() {

		this._onDisconnected();
		this.hand.removeEventListener( 'connected', this._onConnected );
		this.hand.removeEventListener( 'disconnected', this._onDisconnected );

	}

}

export { OculusHandPointerModel };
