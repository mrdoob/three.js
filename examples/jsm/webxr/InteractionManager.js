import {
	Matrix4,
	Raycaster
} from '../../../build/three.module.js';

class InteractionManager {

	constructor( objects ) {

		this._objects = objects;
		this._raycaster = new Raycaster();
		this._tempMatrix = new Matrix4();

	}

	listenPointerEvents() {

		// TODO

	}

	listenXRControllerEvents( controller ) {

		const scope = this;

		const events = {
			'move': 'mousemove',
			'select': 'click',
			'selectstart': 'mousedown',
			'selectend': 'mouseup'
		};

		function onEvent( event ) {

			const controller = event.target;

			scope._tempMatrix.identity().extractRotation( controller.matrixWorld );

			scope._raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
			scope._raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( scope._tempMatrix );

			const intersections = scope._raycaster.intersectObjects( scope._objects );

			if ( intersections.length > 0 ) {

				const intersection = intersections[ 0 ];

				const object = intersection.object;
				const uv = intersection.uv;

				object.material.map.dispatchEvent( events[ event.type ], uv.x, 1 - uv.y );

			}

		}

		controller.addEventListener( 'move', onEvent );
		controller.addEventListener( 'select', onEvent );
		controller.addEventListener( 'selectstart', onEvent );
		controller.addEventListener( 'selectend', onEvent );

	}

}

export { InteractionManager };
