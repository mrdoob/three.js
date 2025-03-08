import {
	Object3D
} from 'three';

import {
	XRHandPrimitiveModel
} from './XRHandPrimitiveModel.js';

import {
	XRHandMeshModel
} from './XRHandMeshModel.js';

/**
 * Represents a XR hand model.
 *
 * @augments Object3D
 */
class XRHandModel extends Object3D {

	/**
	 * Constructs a new XR hand model.
	 *
	 * @param {Group} controller - The hand controller.
	 */
	constructor( controller ) {

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
		 * The controller's environment map.
		 *
		 * @type {?Texture}
		 * @default null
		 */
		this.envMap = null;

		/**
		 * The model mesh.
		 *
		 * @type {Mesh}
		 * @default null
		 */
		this.mesh = null;

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

}

/**
 * Similar to {@link XRControllerModelFactory}, this class allows to create hand models
 * for WebXR controllers that can be added as a visual representation to your scene.
 *
 * ```js
 * const handModelFactory = new XRHandModelFactory();
 *
 * const hand = renderer.xr.getHand( 0 );
 * hand.add( handModelFactory.createHandModel( hand ) );
 * scene.add( hand );
 * ```
 */
class XRHandModelFactory {

	/**
	 * Constructs a new XR hand model factory.
	 *
	 * @param {?GLTFLoader} [gltfLoader=null] - A glTF loader that is used to load hand models.
	 * @param {?Function} [onLoad=null] - A callback that is executed when a hand model has been loaded.
	 */
	constructor( gltfLoader = null, onLoad = null ) {

		/**
		 * A glTF loader that is used to load hand models.
		 *
		 * @type {?GLTFLoader}
		 * @default null
		 */
		this.gltfLoader = gltfLoader;

		/**
		 * The path to the model repository.
		 *
		 * @type {?string}
		 * @default null
		 */
		this.path = null;

		/**
		 * A callback that is executed when a hand model has been loaded.
		 *
		 * @type {?Function}
		 * @default null
		 */
		this.onLoad = onLoad;

	}

	/**
	 * Sets the path to the hand model repository.
	 *
	 * @param {string} path - The path to set.
	 * @return {XRHandModelFactory} A reference to this instance.
	 */
	setPath( path ) {

		this.path = path;

		return this;

	}

	/**
	 * Creates a controller model for the given WebXR hand controller.
	 *
	 * @param {Group} controller - The hand controller.
	 * @param {('spheres'|'boxes'|'mesh')} [profile] - The model profile that defines the model type.
	 * @return {XRHandModel} The XR hand model.
	 */
	createHandModel( controller, profile ) {

		const handModel = new XRHandModel( controller );

		controller.addEventListener( 'connected', ( event ) => {

			const xrInputSource = event.data;

			if ( xrInputSource.hand && ! handModel.motionController ) {

				handModel.xrInputSource = xrInputSource;

				// @todo Detect profile if not provided
				if ( profile === undefined || profile === 'spheres' ) {

					handModel.motionController = new XRHandPrimitiveModel( handModel, controller, this.path, xrInputSource.handedness, { primitive: 'sphere' } );

				} else if ( profile === 'boxes' ) {

					handModel.motionController = new XRHandPrimitiveModel( handModel, controller, this.path, xrInputSource.handedness, { primitive: 'box' } );

				} else if ( profile === 'mesh' ) {

					handModel.motionController = new XRHandMeshModel( handModel, controller, this.path, xrInputSource.handedness, this.gltfLoader, this.onLoad );

				}

			}

			controller.visible = true;

		} );

		controller.addEventListener( 'disconnected', () => {

			controller.visible = false;
			// handModel.motionController = null;
			// handModel.remove( scene );
			// scene = null;

		} );

		return handModel;

	}

}

export { XRHandModelFactory };
