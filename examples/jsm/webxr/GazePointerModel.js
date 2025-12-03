import {
	Object3D,
	Vector3,
	SphereGeometry,
	Mesh,
	Raycaster,
	MeshBasicMaterial,
	Color
} from 'three';


const POINTER_COLOR = 0xffffff;

const CURSOR_RADIUS = 0.02;
const CURSOR_MAX_DISTANCE = 1.5;

/**
 * Represents a Gaze pointer model.
 *
 * @augments Object3D
 * @three_import import { GazePointerModel } from 'three/addons/webxr/GazePointerModel.js';
 */
class GazePointerModel extends Object3D {

	/**
	 * Constructs a new Gaze pointer model.
	 *
	 * @param {Group} controller - The WebXR controller in target ray space.
	 */
	constructor( controller ) {

		super();

		/**
		 * The WebXR controller in target ray space.
		 *
		 * @type {Group}
		 */
		this.controller = controller;

		/**
		 * The pointer object that holds the pointer mesh.
		 *
		 * @type {?Object3D}
		 * @default null
		 */
		this.pointerObject = null;

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
		this.controller.addEventListener( 'connected', this._onConnected );
		this.controller.addEventListener( 'disconnected', this._onDisconnected );

	}

	/**
	 * Set the cursor color.
	 *
	 * @param {number} color - The color.
	 */
	set cursorColor( color ) {

		if ( this.cursorObject ) {

			this.cursorObject.material.color = new Color( color );

		}

	}

	_onConnected( event ) {

		const xrInputSource = event.data;
		if ( ! xrInputSource.hand ) {

			this.visible = true;
			this.xrInputSource = xrInputSource;

			this.createPointer();

		}


	}

	_onDisconnected() {

		this.visible = false;
		this.xrInputSource = null;

		this.clear();

	}

	/**
	 * Creates a pointer mesh and adds it to this model.
	 */
	createPointer() {

		this.pointerObject = new Object3D();

		this.raycaster = new Raycaster();


		// create cursor
		const cursorGeometry = new SphereGeometry( CURSOR_RADIUS, 10, 10 );
		const cursorMaterial = new MeshBasicMaterial( { color: POINTER_COLOR, opacity: 1, transparent: true, depthTest: false } );

		this.cursorObject = new Mesh( cursorGeometry, cursorMaterial );
		this.pointerObject.add( this.cursorObject );

		this.add( this.pointerObject );

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

			this.controller.updateMatrixWorld();
			this.raycaster.setFromXRController( this.controller );

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

			this.controller.updateMatrixWorld();
			this.raycaster.setFromXRController( this.controller );

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

		if ( this.raycaster ) {

			this.controller.updateMatrixWorld();
			this.raycaster.setFromXRController( this.controller );


			const intersections = this.raycaster.intersectObjects( objects, recursive );
			const direction = new Vector3( 0, 0, - 1 );
			if ( intersections.length > 0 ) {

				const intersection = intersections[ 0 ];
				const distance = intersection.distance;
				this.cursorObject.position.copy( direction.multiplyScalar( distance ) );

			} else {

				this.cursorObject.position.copy( direction.multiplyScalar( CURSOR_MAX_DISTANCE ) );

			}

		}

	}

	/**
	 * Sets the cursor to the given distance.
	 *
	 * @param {number} distance - The distance to set the cursor to.
	 */
	setCursor( distance ) {

		const direction = new Vector3( 0, 0, - 1 );
		if ( this.raycaster ) {

			this.cursorObject.position.copy( direction.multiplyScalar( distance ) );

		}

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever this instance is no longer used in your app.
	 */
	dispose() {

		this._onDisconnected();
		this.controller.removeEventListener( 'connected', this._onConnected );
		this.controller.removeEventListener( 'disconnected', this._onDisconnected );

	}

}

export { GazePointerModel };
