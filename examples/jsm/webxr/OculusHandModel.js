import { Object3D, Sphere, Box3 } from 'three';
import { XRHandMeshModel } from './XRHandMeshModel.js';

const TOUCH_RADIUS = 0.01;
const POINTING_JOINT = 'index-finger-tip';

/**
 * Represents an Oculus hand model.
 *
 * @augments Object3D
 */
class OculusHandModel extends Object3D {

	/**
	 * Constructs a new Oculus hand model.
	 *
	 * @param {Group} controller - The hand controller.
	 * @param {?Loader} [loader=null] - A loader that is used to load hand models.
	 * @param {?Function} [onLoad=null] - A callback that is executed when a hand model has been loaded.
	 */
	constructor( controller, loader = null, onLoad = null ) {

		super();

		/**
		 * The hand controller.
		 *
		 * @type {Group}
		 */
		this.controller = controller;

		/**
		 * The motion controller.
		 *
		 * @type {?MotionController}
		 * @default null
		 */
		this.motionController = null;

		/**
		 * The model's environment map.
		 *
		 * @type {?Texture}
		 * @default null
		 */
		this.envMap = null;

		/**
		 * A loader that is used to load hand models.
		 *
		 * @type {?Loader}
		 * @default null
		 */
		this.loader = loader;

		/**
		 * A callback that is executed when a hand model has been loaded.
		 *
		 * @type {?Function}
		 * @default null
		 */
		this.onLoad = onLoad;

		/**
		 * The path to the model repository.
		 *
		 * @type {?string}
		 * @default null
		 */
		this.path = null;

		/**
		 * The model mesh.
		 *
		 * @type {Mesh}
		 * @default null
		 */
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

	/**
	 * Overwritten with a custom implementation. Makes sure the motion controller updates the mesh.
	 *
	 * @param {boolean} [force=false] - When set to `true`, a recomputation of world matrices is forced even
	 * when {@link Object3D#matrixWorldAutoUpdate} is set to `false`.
	 */
	updateMatrixWorld( force ) {

		super.updateMatrixWorld( force );

		if ( this.motionController ) {

			this.motionController.updateMesh();

		}

	}

	/**
	 * Returns the pointer position which is the position of the index finger tip.
	 *
	 * @return {Vector3|null} The pointer position. Returns `null` if not index finger tip joint was found.
	 */
	getPointerPosition() {

		const indexFingerTip = this.controller.joints[ POINTING_JOINT ];
		if ( indexFingerTip ) {

			return indexFingerTip.position;

		} else {

			return null;

		}

	}

	/**
	 * Returns `true` if the current pointer position (the index finger tip) intersections
	 * with the given box object.
	 *
	 *  @param {Mesh} boxObject - The box object.
	 * @return {boolean} Whether an intersection was found or not.
	 */
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

	/**
	 * Executed actions depending on the interaction state with
	 * the given button.
	 *
	 *  @param {Object} button - The button.
	 */
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
