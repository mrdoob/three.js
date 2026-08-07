import {
 	BackSide,
 	BoxGeometry,
 	InstancedMesh,
 	Mesh,
	MeshLambertMaterial,
 	MeshStandardMaterial,
 	PointLight,
 	Scene,
 	Object3D,
	eulerSet,
	vec3Set,
} from 'three';

/**
 * This class represents a scene with a basic room setup that can be used as
 * input for {@link PMREMGenerator#fromScene}. The resulting PMREM represents the room's
 * lighting and can be used for Image Based Lighting by assigning it to {@link Scene#environment}
 * or directly as an environment map to PBR materials.
 *
 * The implementation is based on the [EnvironmentScene](https://github.com/google/model-viewer/blob/master/packages/model-viewer/src/three-components/EnvironmentScene.ts)
 * component from the `model-viewer` project.
 *
 * ```js
 * const environment = new RoomEnvironment();
 * const pmremGenerator = new THREE.PMREMGenerator( renderer );
 *
 * const envMap = pmremGenerator.fromScene( environment ).texture;
 * scene.environment = envMap;
 * ```
 *
 * @augments Scene
 * @three_import import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
 */
class RoomEnvironment extends Scene {

	constructor() {

		super();

		this.name = 'RoomEnvironment';
		this.position.y = - 3.5;

		const geometry = new BoxGeometry();
		geometry.deleteAttribute( 'uv' );

		const roomMaterial = new MeshStandardMaterial( { side: BackSide } );
		const boxMaterial = new MeshStandardMaterial();

		const mainLight = new PointLight( 0xffffff, 900, 28, 2 );
		vec3Set( mainLight.position, 0.418, 16.199, 0.300 );
		this.add( mainLight );

		const room = new Mesh( geometry, roomMaterial );
		vec3Set( room.position, - 0.757, 13.219, 0.717 );
		vec3Set( room.scale, 31.713, 28.305, 28.591 );
		this.add( room );

		const boxes = new InstancedMesh( geometry, boxMaterial, 6 );
		const transform = new Object3D();

		// box1
		vec3Set( transform.position, - 10.906, 2.009, 1.846 );
		eulerSet( 0, - 0.195, 0, transform.rotation.order, transform.rotation );
		transform.rotation._onChangeCallback();
		vec3Set( transform.scale, 2.328, 7.905, 4.651 );
		transform.updateMatrix();
		boxes.setMatrixAt( 0, transform.matrix );

		// box2
		vec3Set( transform.position, - 5.607, - 0.754, - 0.758 );
		eulerSet( 0, 0.994, 0, transform.rotation.order, transform.rotation );
		transform.rotation._onChangeCallback();
		vec3Set( transform.scale, 1.970, 1.534, 3.955 );
		transform.updateMatrix();
		boxes.setMatrixAt( 1, transform.matrix );

		// box3
		vec3Set( transform.position, 6.167, 0.857, 7.803 );
		eulerSet( 0, 0.561, 0, transform.rotation.order, transform.rotation );
		transform.rotation._onChangeCallback();
		vec3Set( transform.scale, 3.927, 6.285, 3.687 );
		transform.updateMatrix();
		boxes.setMatrixAt( 2, transform.matrix );

		// box4
		vec3Set( transform.position, - 2.017, 0.018, 6.124 );
		eulerSet( 0, 0.333, 0, transform.rotation.order, transform.rotation );
		transform.rotation._onChangeCallback();
		vec3Set( transform.scale, 2.002, 4.566, 2.064 );
		transform.updateMatrix();
		boxes.setMatrixAt( 3, transform.matrix );

		// box5
		vec3Set( transform.position, 2.291, - 0.756, - 2.621 );
		eulerSet( 0, - 0.286, 0, transform.rotation.order, transform.rotation );
		transform.rotation._onChangeCallback();
		vec3Set( transform.scale, 1.546, 1.552, 1.496 );
		transform.updateMatrix();
		boxes.setMatrixAt( 4, transform.matrix );

		// box6
		vec3Set( transform.position, - 2.193, - 0.369, - 5.547 );
		eulerSet( 0, 0.516, 0, transform.rotation.order, transform.rotation );
		transform.rotation._onChangeCallback();
		vec3Set( transform.scale, 3.875, 3.487, 2.986 );
		transform.updateMatrix();
		boxes.setMatrixAt( 5, transform.matrix );

		this.add( boxes );


		// -x right
		const light1 = new Mesh( geometry, createAreaLightMaterial( 50 ) );
		vec3Set( light1.position, - 16.116, 14.37, 8.208 );
		vec3Set( light1.scale, 0.1, 2.428, 2.739 );
		this.add( light1 );

		// -x left
		const light2 = new Mesh( geometry, createAreaLightMaterial( 50 ) );
		vec3Set( light2.position, - 16.109, 18.021, - 8.207 );
		vec3Set( light2.scale, 0.1, 2.425, 2.751 );
		this.add( light2 );

		// +x
		const light3 = new Mesh( geometry, createAreaLightMaterial( 17 ) );
		vec3Set( light3.position, 14.904, 12.198, - 1.832 );
		vec3Set( light3.scale, 0.15, 4.265, 6.331 );
		this.add( light3 );

		// +z
		const light4 = new Mesh( geometry, createAreaLightMaterial( 43 ) );
		vec3Set( light4.position, - 0.462, 8.89, 14.520 );
		vec3Set( light4.scale, 4.38, 5.441, 0.088 );
		this.add( light4 );

		// -z
		const light5 = new Mesh( geometry, createAreaLightMaterial( 20 ) );
		vec3Set( light5.position, 3.235, 11.486, - 12.541 );
		vec3Set( light5.scale, 2.5, 2.0, 0.1 );
		this.add( light5 );

		// +y
		const light6 = new Mesh( geometry, createAreaLightMaterial( 100 ) );
		vec3Set( light6.position, 0.0, 20.0, 0.0 );
		vec3Set( light6.scale, 1.0, 0.1, 1.0 );
		this.add( light6 );

	}

	/**
	 * Frees internal resources. This method should be called
	 * when the environment is no longer required.
	 */
	dispose() {

		const resources = new Set();

		this.traverse( ( object ) => {

			if ( object.isMesh ) {

				resources.add( object.geometry );
				resources.add( object.material );

			}

		} );

		for ( const resource of resources ) {

			resource.dispose();

		}

	}

}

function createAreaLightMaterial( intensity ) {

	// create an emissive-only material. see #31348
	const material = new MeshLambertMaterial( {
		color: 0x000000,
		emissive: 0xffffff,
		emissiveIntensity: intensity
	} );

	return material;

}

export { RoomEnvironment };
