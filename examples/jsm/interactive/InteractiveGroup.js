import {
	Group,
	Matrix4,
	Raycaster,
	Vector2
} from '../../../build/three.module.js';

const _event = { type: '', data: new Vector2() };

class InteractiveGroup extends Group {

	constructor( renderer ) {

		super();

		const scope = this;

		const raycaster = new Raycaster();
		const tempMatrix = new Matrix4();

		// TODO PointerEvents

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

			const intersections = raycaster.intersectObjects( scope.children );

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
