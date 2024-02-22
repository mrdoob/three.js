import {
	Group,
	Raycaster,
	Vector2
} from 'three';

const _pointer = new Vector2();
const _event = { type: '', data: _pointer };

const _raycaster = new Raycaster();

class InteractiveGroup extends Group {

	listenToPointerEvents( renderer, camera ) {

		const scope = this;
		const raycaster = new Raycaster();

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

	}

	listenToXRControllerEvents( controller ) {

		const scope = this;

		// TODO: Dispatch pointerevents too

		const events = {
			'move': 'mousemove',
			'select': 'click',
			'selectstart': 'mousedown',
			'selectend': 'mouseup'
		};

		function onXRControllerEvent( event ) {

			const controller = event.target;

			_raycaster.setFromXRController( controller );

			const intersections = _raycaster.intersectObjects( scope.children, false );

			if ( intersections.length > 0 ) {

				const intersection = intersections[ 0 ];

				const object = intersection.object;
				const uv = intersection.uv;

				_event.type = events[ event.type ];
				_event.data.set( uv.x, 1 - uv.y );

				object.dispatchEvent( _event );

			}

		}

		controller.addEventListener( 'move', onXRControllerEvent );
		controller.addEventListener( 'select', onXRControllerEvent );
		controller.addEventListener( 'selectstart', onXRControllerEvent );
		controller.addEventListener( 'selectend', onXRControllerEvent );

	}

}

export { InteractiveGroup };
