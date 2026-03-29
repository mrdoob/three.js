import {
	Mesh,
	MeshBasicMaterial,
	Object3D,
	SphereGeometry,
} from 'three';

import { GLTFLoader } from '../loaders/GLTFLoader.js';

import {
	Constants as MotionControllerConstants,
	fetchProfile,
	MotionController
} from '../libs/motion-controllers.module.js';

const DEFAULT_PROFILES_PATH = 'https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0/dist/profiles';
const DEFAULT_PROFILE = 'generic-trigger';

/**
 * Represents a XR controller model.
 *
 * @augments Object3D
 */
class XRControllerModel extends Object3D {

	/**
	 * Constructs a new XR controller model.
	 */
	constructor() {

		super();

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

	}

	/**
	 * Sets an environment map that is applied to the controller model.
	 *
	 * @param {?Texture} envMap - The environment map to apply.
	 * @return {XRControllerModel} A reference to this instance.
	 */
	setEnvironmentMap( envMap ) {

		if ( this.envMap == envMap ) {

			return this;

		}

		this.envMap = envMap;
		this.traverse( ( child ) => {

			if ( child.isMesh ) {

				child.material.envMap = this.envMap;
				child.material.needsUpdate = true;

			}

		} );

		return this;

	}

	/**
	 * Overwritten with a custom implementation. Polls data from the XRInputSource and updates the
	 * model's components to match the real world data.
	 *
	 * @param {boolean} [force=false] - When set to `true`, a recomputation of world matrices is forced even
	 * when {@link Object3D#matrixWorldAutoUpdate} is set to `false`.
	 */
	updateMatrixWorld( force ) {

		super.updateMatrixWorld( force );

		if ( ! this.motionController ) return;

		// Cause the MotionController to poll the Gamepad for data
		this.motionController.updateFromGamepad();

		// Update the 3D model to reflect the button, thumbstick, and touchpad state
		Object.values( this.motionController.components ).forEach( ( component ) => {

			// Update node data based on the visual responses' current states
			Object.values( component.visualResponses ).forEach( ( visualResponse ) => {

				const { valueNode, minNode, maxNode, value, valueNodeProperty } = visualResponse;

				// Skip if the visual response node is not found. No error is needed,
				// because it will have been reported at load time.
				if ( ! valueNode ) return;

				// Calculate the new properties based on the weight supplied
				if ( valueNodeProperty === MotionControllerConstants.VisualResponseProperty.VISIBILITY ) {

					valueNode.visible = value;

				} else if ( valueNodeProperty === MotionControllerConstants.VisualResponseProperty.TRANSFORM ) {

					valueNode.quaternion.slerpQuaternions(
						minNode.quaternion,
						maxNode.quaternion,
						value
					);

					valueNode.position.lerpVectors(
						minNode.position,
						maxNode.position,
						value
					);

				}

			} );

		} );

	}

}

/**
 * Walks the model's tree to find the nodes needed to animate the components and
 * saves them to the motionController components for use in the frame loop. When
 * touchpads are found, attaches a touch dot to them.
 *
 * @private
 * @param {MotionController} motionController
 * @param {Object3D} scene
 */
function findNodes( motionController, scene ) {

	// Loop through the components and find the nodes needed for each components' visual responses
	Object.values( motionController.components ).forEach( ( component ) => {

		const { type, touchPointNodeName, visualResponses } = component;

		if ( type === MotionControllerConstants.ComponentType.TOUCHPAD ) {

			component.touchPointNode = scene.getObjectByName( touchPointNodeName );
			if ( component.touchPointNode ) {

				// Attach a touch dot to the touchpad.
				const sphereGeometry = new SphereGeometry( 0.001 );
				const material = new MeshBasicMaterial( { color: 0x0000FF } );
				const sphere = new Mesh( sphereGeometry, material );
				component.touchPointNode.add( sphere );

			} else {

				console.warn( `Could not find touch dot, ${component.touchPointNodeName}, in touchpad component ${component.id}` );

			}

		}

		// Loop through all the visual responses to be applied to this component
		Object.values( visualResponses ).forEach( ( visualResponse ) => {

			const { valueNodeName, minNodeName, maxNodeName, valueNodeProperty } = visualResponse;

			// If animating a transform, find the two nodes to be interpolated between.
			if ( valueNodeProperty === MotionControllerConstants.VisualResponseProperty.TRANSFORM ) {

				visualResponse.minNode = scene.getObjectByName( minNodeName );
				visualResponse.maxNode = scene.getObjectByName( maxNodeName );

				// If the extents cannot be found, skip this animation
				if ( ! visualResponse.minNode ) {

					console.warn( `Could not find ${minNodeName} in the model` );
					return;

				}

				if ( ! visualResponse.maxNode ) {

					console.warn( `Could not find ${maxNodeName} in the model` );
					return;

				}

			}

			// If the target node cannot be found, skip this animation
			visualResponse.valueNode = scene.getObjectByName( valueNodeName );
			if ( ! visualResponse.valueNode ) {

				console.warn( `Could not find ${valueNodeName} in the model` );

			}

		} );

	} );

}

function addAssetSceneToControllerModel( controllerModel, scene ) {

	// Find the nodes needed for animation and cache them on the motionController.
	findNodes( controllerModel.motionController, scene );

	// Apply any environment map that the mesh already has set.
	if ( controllerModel.envMap ) {

		scene.traverse( ( child ) => {

			if ( child.isMesh ) {

				child.material.envMap = controllerModel.envMap;
				child.material.needsUpdate = true;

			}

		} );

	}

	// Add the glTF scene to the controllerModel.
	controllerModel.add( scene );

}

/**
 * Allows to create controller models for WebXR controllers that can be added as a visual
 * representation to your scene. `XRControllerModelFactory` will automatically fetch controller
 * models that match what the user is holding as closely as possible. The models should be
 * attached to the object returned from getControllerGrip in order to match the orientation of
 * the held device.
 *
 * This module depends on the [motion-controllers](https://github.com/immersive-web/webxr-input-profiles/blob/main/packages/motion-controllers/README.md)
 * third-part library.
 *
 * ```js
 * const controllerModelFactory = new XRControllerModelFactory();
 *
 * const controllerGrip = renderer.xr.getControllerGrip( 0 );
 * controllerGrip.add( controllerModelFactory.createControllerModel( controllerGrip ) );
 * scene.add( controllerGrip );
 * ```
 *
 * @three_import import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
 */
class XRControllerModelFactory {

	/**
	 * Constructs a new XR controller model factory.
	 *
	 * @param {?GLTFLoader} [gltfLoader=null] - A glTF loader that is used to load controller models.
	 * @param {?Function} [onLoad=null] - A callback that is executed when a controller model has been loaded.
	 */
	constructor( gltfLoader = null, onLoad = null ) {

		/**
		 * A glTF loader that is used to load controller models.
		 *
		 * @type {?GLTFLoader}
		 * @default null
		 */
		this.gltfLoader = gltfLoader;

		/**
		 * The path to the model repository.
		 *
		 * @type {string}
		 */
		this.path = DEFAULT_PROFILES_PATH;
		this._assetCache = {};

		/**
		 * A callback that is executed when a controller model has been loaded.
		 *
		 * @type {?Function}
		 * @default null
		 */
		this.onLoad = onLoad;

		// If a GLTFLoader wasn't supplied to the constructor create a new one.
		if ( ! this.gltfLoader ) {

			this.gltfLoader = new GLTFLoader();

		}

	}

	/**
	 * Sets the path to the model repository.
	 *
	 * @param {string} path - The path to set.
	 * @return {XRControllerModelFactory} A reference to this instance.
	 */
	setPath( path ) {

		this.path = path;

		return this;

	}

	/**
	 * Creates a controller model for the given WebXR controller.
	 *
	 * @param {Group} controller - The controller.
	 * @return {XRControllerModel} The XR controller model.
	 */
	createControllerModel( controller ) {

		const controllerModel = new XRControllerModel();
		let scene = null;

		controller.addEventListener( 'connected', ( event ) => {

			const xrInputSource = event.data;

			if ( xrInputSource.targetRayMode !== 'tracked-pointer' || ! xrInputSource.gamepad || xrInputSource.hand ) return;

			fetchProfile( xrInputSource, this.path, DEFAULT_PROFILE ).then( ( { profile, assetPath } ) => {

				controllerModel.motionController = new MotionController(
					xrInputSource,
					profile,
					assetPath
				);

				const cachedAsset = this._assetCache[ controllerModel.motionController.assetUrl ];
				if ( cachedAsset ) {

					scene = cachedAsset.scene.clone();

					addAssetSceneToControllerModel( controllerModel, scene );

					if ( this.onLoad ) this.onLoad( scene );

				} else {

					if ( ! this.gltfLoader ) {

						throw new Error( 'GLTFLoader not set.' );

					}

					this.gltfLoader.setPath( '' );
					this.gltfLoader.load( controllerModel.motionController.assetUrl, ( asset ) => {

						this._assetCache[ controllerModel.motionController.assetUrl ] = asset;

						scene = asset.scene.clone();

						addAssetSceneToControllerModel( controllerModel, scene );

						if ( this.onLoad ) this.onLoad( scene );

					},
					null,
					() => {

						throw new Error( `Asset ${controllerModel.motionController.assetUrl} missing or malformed.` );

					} );

				}

			} ).catch( ( err ) => {

				console.warn( err );

			} );

		} );

		controller.addEventListener( 'disconnected', () => {

			controllerModel.motionController = null;
			controllerModel.remove( scene );
			scene = null;

		} );

		return controllerModel;

	}

}

export { XRControllerModelFactory };
