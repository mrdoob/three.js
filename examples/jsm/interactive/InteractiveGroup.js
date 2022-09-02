import {
	Group,
	Matrix4,
	Raycaster,
	Vector2
} from 'three';

const _pointer = new Vector2();
const _event = { type: '', data: _pointer };

class InteractiveGroup extends Group {

	constructor( renderer, camera ) {

		super();

		const scope = this;

		const raycaster = new Raycaster();
		const tempMatrix = new Matrix4();

		// Pointer Events

		const element = renderer.domElement;

		function onPointerEvent( event ) {

			event.stopPropagation();

			const rect = renderer.domElement.getBoundingClientRect();
			
			_pointer.x = ( event.clientX - rect.left ) / rect.width * 2 - 1;
			_pointer.y = - ( event.clientY - rect.top ) / rect.height * 2 + 1;

			raycaster.setFromCamera( _pointer, camera );

			const intersects = raycaster.intersectObjects( scope.children, false );

			if ( intersects.length > 0 ) {

				const intersection = intersects[ 0 ];

				const object = intersection.object;
				const uv = intersection.uv;

				_event.type = event.type;
				_event.data.set( uv.x, 1 - uv.y );

				object.dispatchEvent( _event );

			}

		}

		element.addEventListener( 'pointerdown', onPointerEvent );
		element.addEventListener( 'pointerup', onPointerEvent );
		element.addEventListener( 'pointermove', onPointerEvent );
		element.addEventListener( 'mousedown', onPointerEvent );
		element.addEventListener( 'mouseup', onPointerEvent );
		element.addEventListener( 'mousemove', onPointerEvent );
		element.addEventListener( 'click', onPointerEvent );

		// WebXR Controller Events
		// TODO: Dispatch pointerevents too

		const events = {
			'move': 'mousemove',
			'select': 'click',
			'selectstart': 'mousedown',
			'selectend': 'mouseup'
		};

		function onXRControllerEvent( event ) {

			const controller = event.target;

			tempMatrix.identity().extractRotation( controller.matrixWorld );

			raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
			raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( tempMatrix );

			const intersections = raycaster.intersectObjects( scope.children, false );

			if ( intersections.length > 0 ) {

				const intersection = intersections[ 0 ];

				const object = intersection.object;
				const uv = intersection.uv;

				_event.type = events[ event.type ];
				_event.data.set( uv.x, 1 - uv.y );

				object.dispatchEvent( _event );

			}

		}

		const controller1 = renderer.xr.getController( 0 );
		controller1.addEventListener( 'move', onXRControllerEvent );
		controller1.addEventListener( 'select', onXRControllerEvent );
		controller1.addEventListener( 'selectstart', onXRControllerEvent );
		controller1.addEventListener( 'selectend', onXRControllerEvent );

		const controller2 = renderer.xr.getController( 1 );
		controller2.addEventListener( 'move', onXRControllerEvent );
		controller2.addEventListener( 'select', onXRControllerEvent );
		controller2.addEventListener( 'selectstart', onXRControllerEvent );
		controller2.addEventListener( 'selectend', onXRControllerEvent );

	}

}

export { InteractiveGroup };
