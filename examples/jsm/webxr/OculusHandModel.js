import { Object3D, Sphere, Box3 } from 'three';
import { XRHandMeshModel } from './XRHandMeshModel.js';

const TOUCH_RADIUS = 0.01;
const POINTING_JOINT = 'index-finger-tip';

class OculusHandModel extends Object3D {

	constructor( controller, loader = null, onLoad = null ) {

		super();

		this.controller = controller;
		this.motionController = null;
		this.envMap = null;
		this.loader = loader;
		this.onLoad = onLoad;

		this.mesh = null;

		controller.addEventListener( 'connected', ( event ) => {

			const xrInputSource = event.data;

			if ( xrInputSource.hand && ! this.motionController ) {

				this.xrInputSource = xrInputSource;

				this.motionController = new XRHandMeshModel( this, controller, this.path, xrInputSource.handedness, this.loader, this.onLoad );

			}

		} );

		controller.addEventListener( 'disconnected', () => {

			this.clear();
			this.motionController = null;

		} );

	}

	updateMatrixWorld( force ) {

		super.updateMatrixWorld( force );

		if ( this.motionController ) {

			this.motionController.updateMesh();

		}

	}

	getPointerPosition() {

		const indexFingerTip = this.controller.joints[ POINTING_JOINT ];
		if ( indexFingerTip ) {

			return indexFingerTip.position;

		} else {

			return null;

		}

	}

	intersectBoxObject( boxObject ) {

		const pointerPosition = this.getPointerPosition();
		if ( pointerPosition ) {

			const indexSphere = new Sphere( pointerPosition, TOUCH_RADIUS );
			const box = new Box3().setFromObject( boxObject );
			return indexSphere.intersectsBox( box );

		} else {

			return false;

		}

	}

	checkButton( button ) {

		if ( this.intersectBoxObject( button ) ) {

			button.onPress();

		} else {

			button.onClear();

		}

		if ( button.isPressed() ) {

			button.whilePressed();

		}

	}

}

export { OculusHandModel };
