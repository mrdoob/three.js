import {
	Object3D,
	Vector3,
	Line,
	BufferGeometry,
	SphereGeometry,
	Mesh,
	Float32BufferAttribute,
	Raycaster,
	AdditiveBlending,
	LineBasicMaterial,
	MeshBasicMaterial,
	Color
} from 'three';


const POINTER_COLOR = 0xffffff;
const POINTER_LINE_DISTANCE = 1.0;

const CURSOR_RADIUS = 0.02;
const CURSOR_MAX_DISTANCE = 1.5;

/**
 * Represents a Grip pointer model.
 * Creates a cursor and line for a grip model.
 *
 * @augments Object3D
 * @three_import import { GripPointerModel } from 'three/addons/webxr/GripPointerModel.js';
 */
class GripPointerModel extends Object3D {

	/**
	 * Constructs a new Grip pointer model.
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
		this._controller = controller;

		/**
		 * The pointer object that holds the pointer mesh.
		 *
		 * @type {?Object3D}
		 * @default null
		 */
		this._pointerObject = null;

		this._pointerLine = null;

		/**
		 * The cursor object.
		 *
		 * @type {?Mesh}
		 * @default null
		 */
		this._cursorObject = null;

		/**
		 * The internal raycaster used for detecting
		 * intersections.
		 *
		 * @type {?Raycaster}
		 * @default null
		 */
		this._raycaster = null;

		this._onConnected = this._onConnected.bind( this );
		this._onDisconnected = this._onDisconnected.bind( this );
		this._controller.addEventListener( 'connected', this._onConnected );
		this._controller.addEventListener( 'disconnected', this._onDisconnected );

	}

	/**
	 * Set the cursor color.
	 *
	 * @param {number} color - The color.
	 */
	set cursorColor( color ) {

		if ( this._cursorObject ) {

			this._cursorObject.material.color = new Color( color );

		}

	}

	/**
	 * Update the line distance.
	 *
	 * @param {number} distance - The line distance.
	 */
	set lineDistance( distance ) {

		if ( this._pointerLine ) {

			this._pointerLine.geometry.attributes.position.setZ( 1, distance );
			this._pointerLine.geometry.attributes.position.needsUpdate = true;

		}

	}

	/**
	 * Set the active line color.
	 *
	 * @param {number} color = The active line color.
	 */
	set activeLineColor( color ) {

		this._activeLineColor = color;

	}

	/**
	 * Set the line color.
	 *
	 * @param {number} color = The line color.
	 */
	set lineColor( color ) {

		if ( this._pointerLine ) {

			const pointerLine = this._pointerLine,
				lineColor = new Color( color );
			pointerLine.geometry.attributes.color.array[ 0 ] = lineColor.r;
			pointerLine.geometry.attributes.color.array[ 1 ] = lineColor.g;
			pointerLine.geometry.attributes.color.array[ 2 ] = lineColor.b;
			pointerLine.geometry.attributes.color.needsUpdate = true;

			if ( ! this._active ) this._currentLineColor = lineColor;

		}

	}

	/**
	 * Set the pointer to active updating the line color to active.
	 *
	 * @param {boolean} value - Set active / inactive.
	 */
	set active( value ) {

		this._active = value;
		this.lineColor = value ? this._activeLineColor : this._currentLineColor;

	}

	/**
	 * On controller connected.
	 *
	 * @param {Object} event
	 */
	_onConnected( event ) {

		const xrInputSource = event.data;
		if ( ! xrInputSource.hand ) {

			this.visible = true;
			this.xrInputSource = xrInputSource;

			this.createPointer();

		}


	}

	/**
	 * On controller disconnected.
	 */
	_onDisconnected() {

		this.visible = false;
		this.xrInputSource = null;

		if ( this._pointerLine && this._pointerLine.material ) this.pointerLine.material.dispose();
		if ( this._pointerLine && this._pointerLine.geometry ) this._pointerLine.geometry.dispose();

		this.clear();

	}

	/**
	 * Creates a pointer mesh and adds it to this model.
	 */
	createPointer() {

		const lineMaterial = new LineBasicMaterial( {
				vertexColors: true,
				blending: AdditiveBlending,
				linewidth: 8 } ),
			pointerLine = this._pointerLine = new Line( new BufferGeometry(), lineMaterial ),
			lineColor = new Color( POINTER_COLOR );
		pointerLine.geometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 0, 0, - POINTER_LINE_DISTANCE ], 3 ) );
		pointerLine.geometry.setAttribute( 'color', new Float32BufferAttribute( [ lineColor.r, lineColor.g, lineColor.b, 0, 0, 0 ], 3 ) );


		pointerLine.name = 'line';
		//pointerLine.visible = false;


		this._pointerObject = new Object3D();
		this._pointerObject.add( pointerLine );

		this._raycaster = new Raycaster();


		// create cursor
		const cursorGeometry = new SphereGeometry( CURSOR_RADIUS, 10, 10 );
		const cursorMaterial = new MeshBasicMaterial( { color: POINTER_COLOR, opacity: 1, transparent: true, depthTest: false } );

		this._cursorObject = new Mesh( cursorGeometry, cursorMaterial );
		this._pointerObject.add( this._cursorObject );

		this.add( this._pointerObject );

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

		if ( this._raycaster ) {

			this._controller.updateMatrixWorld();
			this._raycaster.setFromXRController( this._controller );

			return this._raycaster.intersectObject( object, recursive );

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

		if ( this._raycaster ) {

			this._controller.updateMatrixWorld();
			this._raycaster.setFromXRController( this._controller );

			return this._raycaster.intersectObjects( objects, recursive );

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

		if ( this._raycaster ) {

			this._controller.updateMatrixWorld();
			this._raycaster.setFromXRController( this._controller );


			const intersections = this._raycaster.intersectObjects( objects, recursive );
			const direction = new Vector3( 0, 0, - 1 );
			if ( intersections.length > 0 ) {

				const intersection = intersections[ 0 ];
				const distance = intersection.distance;
				this._cursorObject.position.copy( direction.multiplyScalar( distance ) );

			} else {

				this._cursorObject.position.copy( direction.multiplyScalar( CURSOR_MAX_DISTANCE ) );

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
		if ( this._raycaster ) {

			this._cursorObject.position.copy( direction.multiplyScalar( distance ) );

		}

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever this instance is no longer used in your app.
	 */
	dispose() {

		this._onDisconnected();
		this._controller.removeEventListener( 'connected', this._onConnected );
		this._controller.removeEventListener( 'disconnected', this._onDisconnected );

	}

}

export { GripPointerModel };
