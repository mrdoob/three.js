import {
	Group,
	Raycaster,
	Vector2
} from 'three';

const _pointer = new Vector2();
const _event = { type: '', data: _pointer };

// TODO: Dispatch pointerevents too

/**
 * The XR events that are mapped to "standard" pointer events
 */
const _events = {
	'move': 'mousemove',
	'select': 'click',
	'selectstart': 'mousedown',
	'selectend': 'mouseup'
};

const _raycaster = new Raycaster();

class InteractiveGroup extends Group {

	constructor() {

		super();

		this.raycaster = new Raycaster();

		this.element = null;
		this.camera = null;

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

	listenToXRControllerEvents( controller ) {

		this.controllers.push( controller );
		controller.addEventListener( 'move', this._onXRControllerEvent );
		controller.addEventListener( 'select', this._onXRControllerEvent );
		controller.addEventListener( 'selectstart', this._onXRControllerEvent );
		controller.addEventListener( 'selectend', this._onXRControllerEvent );

	}

	disconnectXrControllerEvents() {

		for ( const controller of this.controllers ) {

			controller.removeEventListener( 'move', this._onXRControllerEvent );
			controller.removeEventListener( 'select', this._onXRControllerEvent );
			controller.removeEventListener( 'selectstart', this._onXRControllerEvent );
			controller.removeEventListener( 'selectend', this._onXRControllerEvent );

		}

	}

	disconnect() {

		this.disconnectionPointerEvents();
		this.disconnectXrControllerEvents();

		this.camera = null;
		this.element = null;

		this.controllers = [];

	}

}

export { InteractiveGroup };
