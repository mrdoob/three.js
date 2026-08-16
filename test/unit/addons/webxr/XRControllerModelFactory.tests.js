import { Group, Object3D } from 'three';
import { XRControllerModelFactory } from '../../../../examples/jsm/webxr/XRControllerModelFactory.js';

const PROFILES_PATH = 'https://threejs.invalid/profiles';

function createProfile( profileId ) {

	return {
		profileId: profileId,
		layouts: {
			right: {
				assetPath: `${profileId}.glb`,
				components: {
					trigger: {
						type: 'trigger',
						rootNodeName: `${profileId}_root`,
						gamepadIndices: { button: 0 },
						visualResponses: {
							pressed: {
								componentProperty: 'button',
								states: [ 'default', 'touched', 'pressed' ],
								valueNodeProperty: 'transform',
								valueNodeName: `${profileId}_value`,
								minNodeName: `${profileId}_min`,
								maxNodeName: `${profileId}_max`
							}
						}
					}
				}
			}
		}
	};

}

function createAsset( profileId ) {

	const scene = new Group();

	for ( const suffix of [ 'root', 'value', 'min', 'max' ] ) {

		const node = new Object3D();
		node.name = `${profileId}_${suffix}`;
		scene.add( node );

	}

	return { scene: scene };

}

function createInputSource( profileId ) {

	return {
		targetRayMode: 'tracked-pointer',
		handedness: 'right',
		profiles: [ profileId ],
		gamepad: { buttons: [ { value: 0, pressed: false, touched: false } ], axes: [] }
	};

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'WebXR', () => {

		QUnit.module( 'XRControllerModelFactory', () => {

			QUnit.test( 'createControllerModel - interaction profile change', async ( assert ) => {

				const profiles = { profileA: createProfile( 'profileA' ), profileB: createProfile( 'profileB' ) };
				const profilesList = { profileA: { path: 'profileA' }, profileB: { path: 'profileB' } };

				const fetch = globalThis.fetch;
				globalThis.fetch = async ( url ) => {

					const name = url.slice( PROFILES_PATH.length + 1 );
					const body = name === 'profilesList.json' ? profilesList : profiles[ name ];

					return { ok: true, json: async () => body };

				};

				const onLoadCallbacks = [];
				let loadRequested;
				let onLoadRequested;

				const gltfLoader = {
					setPath: () => {},
					load: ( url, onLoad ) => {

						onLoadCallbacks.push( onLoad );
						onLoadRequested();

					}
				};

				const controller = new Group();
				const controllerModel = new XRControllerModelFactory( gltfLoader ).setPath( PROFILES_PATH ).createControllerModel( controller );
				controller.add( controllerModel );

				loadRequested = new Promise( ( resolve ) => onLoadRequested = resolve );
				controller.dispatchEvent( { type: 'connected', data: createInputSource( 'profileA' ) } );
				await loadRequested;

				loadRequested = new Promise( ( resolve ) => onLoadRequested = resolve );
				controller.dispatchEvent( { type: 'disconnected' } );
				controller.dispatchEvent( { type: 'connected', data: createInputSource( 'profileB' ) } );
				await loadRequested;

				// the asset of the second profile arrives before the one of the first profile
				onLoadCallbacks[ 1 ]( createAsset( 'profileB' ) );
				onLoadCallbacks[ 0 ]( createAsset( 'profileA' ) );

				globalThis.fetch = fetch;

				const visualResponse = controllerModel.motionController.components.trigger.visualResponses.pressed;

				assert.strictEqual( visualResponse.valueNode.name, 'profileB_value', 'Uses the value node of the connected profile' );
				assert.strictEqual( visualResponse.minNode.name, 'profileB_min', 'Uses the min node of the connected profile' );
				assert.strictEqual( visualResponse.maxNode.name, 'profileB_max', 'Uses the max node of the connected profile' );

				controllerModel.updateMatrixWorld( true );

				assert.ok( true, 'Updating the world matrix does not throw' );

			} );

		} );

	} );

} );
