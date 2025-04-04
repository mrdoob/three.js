import {
	Group,
	Raycaster,
	Vector2
} from 'three';

const _pointer = new Vector2();
const _event = { type: '', data: _pointer };

// The XR events that are mapped to "standard" pointer events.
const _events = {
	'move': 'mousemove',
	'select': 'click',
	'selectstart': 'mousedown',
	'selectend': 'mouseup'
};

const _raycaster = new Raycaster();

/**
 * This class can be used to group 3D objects in an interactive group.
 * The group itself can listen to Pointer, Mouse or XR controller events to
 * detect selections of descendant 3D objects. If a 3D object is selected,
 * the respective event is going to dispatched to it.
 *
 * ```js
 * const group = new InteractiveGroup();
 * group.listenToPointerEvents( renderer, camera );
 * group.listenToXRControllerEvents( controller1 );
 * group.listenToXRControllerEvents( controller2 );
 * scene.add( group );
 *
 * // now add objects that should be interactive
 * group.add( mesh1, mesh2, mesh3 );
 * ```
 * @augments Group
 * @three_import import { InteractiveGroup } from 'three/addons/interactive/InteractiveGroup.js';
 */
class InteractiveGroup extends Group {

	constructor() {

		super();

		/**
		 * The internal raycaster.
		 *
		 * @type {Raycaster}
		 */
		this.raycaster = new Raycaster();

		/**
		 * The internal raycaster.
		 *
		 * @type {?HTMLDOMElement}
		 * @default null
		 */
		this.element = null;

		/**
		 * The camera used for raycasting.
		 *
		 * @type {?Camera}
		 * @default null
		 */
		this.camera = null;

		/**
		 * An array of XR controllers.
		 *
		 * @type {Array<Group>}
		 */
		this.controllers = [];

		this._onPointerEvent = this.onPointerEvent.bind( this );
		this._onXRControllerEvent = this.onXRControllerEvent.bind( this );

	}

	onPointerEvent( event ) {

		event.stopPropagation();

		const rect = this.element.getBoundingClientRect();

		_pointer.x = ( event.clientX - rect.left ) / rect.width * 2 - 1;
		_pointer.y = - ( event.clientY - rect.top ) / rect.height * 2 + 1;

		this.raycaster.setFromCamera( _pointer, this.camera );

		const intersects = this.raycaster.intersectObjects( this.children, false );

		if ( intersects.length > 0 ) {

			const intersection = intersects[ 0 ];

			const object = intersection.object;
			const uv = intersection.uv;

			_event.type = event.type;
			_event.data.set( uv.x, 1 - uv.y );

			object.dispatchEvent( _event );

		}

	}

	onXRControllerEvent( event ) {

		const controller = event.target;

		_raycaster.setFromXRController( controller );

		const intersections = _raycaster.intersectObjects( this.children, false );

		if ( intersections.length > 0 ) {

			const intersection = intersections[ 0 ];

			const object = intersection.object;
			const uv = intersection.uv;

			_event.type = _events[ event.type ];
			_event.data.set( uv.x, 1 - uv.y );

			object.dispatchEvent( _event );

		}

	}

	/**
	 * Calling this method makes sure the interactive group listens to Pointer and Mouse events.
	 * The target is the `domElement` of the given renderer. The camera is required for the internal
	 * raycasting so 3D objects can be detected based on the events.
	 *
	 * @param {(WebGPURenderer|WebGLRenderer)} renderer - The renderer.
	 * @param {Camera} camera - The camera.
	 */
	listenToPointerEvents( renderer, camera ) {

		this.camera = camera;
		this.element = renderer.domElement;

		this.element.addEventListener( 'pointerdown', this._onPointerEvent );
		this.element.addEventListener( 'pointerup', this._onPointerEvent );
		this.element.addEventListener( 'pointermove', this._onPointerEvent );
		this.element.addEventListener( 'mousedown', this._onPointerEvent );
		this.element.addEventListener( 'mouseup', this._onPointerEvent );
		this.element.addEventListener( 'mousemove', this._onPointerEvent );
		this.element.addEventListener( 'click', this._onPointerEvent );

	}

	/**
	 * Disconnects this interactive group from all Pointer and Mouse Events.
	 */
	disconnectionPointerEvents() {

		if ( this.element !== null ) {

			this.element.removeEventListener( 'pointerdown', this._onPointerEvent );
			this.element.removeEventListener( 'pointerup', this._onPointerEvent );
			this.element.removeEventListener( 'pointermove', this._onPointerEvent );
			this.element.removeEventListener( 'mousedown', this._onPointerEvent );
			this.element.removeEventListener( 'mouseup', this._onPointerEvent );
			this.element.removeEventListener( 'mousemove', this._onPointerEvent );
			this.element.removeEventListener( 'click', this._onPointerEvent );

		}

	}

	/**
	 * Calling this method makes sure the interactive group listens to events of
	 * the given XR controller.
	 *
	 * @param {Group} controller - The XR controller.
	 */
	listenToXRControllerEvents( controller ) {

		this.controllers.push( controller );
		controller.addEventListener( 'move', this._onXRControllerEvent );
		controller.addEventListener( 'select', this._onXRControllerEvent );
		controller.addEventListener( 'selectstart', this._onXRControllerEvent );
		controller.addEventListener( 'selectend', this._onXRControllerEvent );

	}

	/**
	 * Disconnects this interactive group from all XR controllers.
	 */
	disconnectXrControllerEvents() {

		for ( const controller of this.controllers ) {

			controller.removeEventListener( 'move', this._onXRControllerEvent );
			controller.removeEventListener( 'select', this._onXRControllerEvent );
			controller.removeEventListener( 'selectstart', this._onXRControllerEvent );
			controller.removeEventListener( 'selectend', this._onXRControllerEvent );

		}

	}

	/**
	 * Disconnects this interactive group from the DOM and all XR controllers.
	 */
	disconnect() {

		this.disconnectionPointerEvents();
		this.disconnectXrControllerEvents();

		this.camera = null;
		this.element = null;

		this.controllers = [];

	}

}

export { InteractiveGroup };
