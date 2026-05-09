import {
	BackSide,
	BoxGeometry,
	Mesh,
	MeshLambertMaterial,
	MeshStandardMaterial,
	PointLight,
	Scene,
} from 'three';

/**
 * This class represents a scene with a very basic room setup that can be used as
 * input for {@link PMREMGenerator#fromScene}. The resulting PMREM represents the room's
 * lighting and can be used for Image Based Lighting by assigning it to {@link Scene#environment}
 * or directly as an environment map to PBR materials.
 *
 * This class uses a simple room setup and should only be used for development purposes.
 * A more appropriate setup for production is {@link RoomEnvironment}.
 *
 * ```js
 * const environment = new DebugEnvironment();
 * const pmremGenerator = new THREE.PMREMGenerator( renderer );
 *
 * const envMap = pmremGenerator.fromScene( environment ).texture;
 * scene.environment = envMap;
 * ```
 *
 * @augments Scene
 * @three_import import { DebugEnvironment } from 'three/addons/environments/DebugEnvironment.js';
 */
class DebugEnvironment extends Scene {

	/**
	 * Constructs a new debug environment.
	 */
	constructor() {

		super();

		const geometry = new BoxGeometry();
		geometry.deleteAttribute( 'uv' );
		const roomMaterial = new MeshStandardMaterial( { metalness: 0, side: BackSide } );
		const room = new Mesh( geometry, roomMaterial );
		room.scale.setScalar( 10 );
		this.add( room );

		const mainLight = new PointLight( 0xffffff, 50, 0, 2 );
		this.add( mainLight );

		const material1 = new MeshLambertMaterial( { color: 0xff0000, emissive: 0xffffff, emissiveIntensity: 10 } );

		const light1 = new Mesh( geometry, material1 );
		light1.position.set( - 5, 2, 0 );
		light1.scale.set( 0.1, 1, 1 );
		this.add( light1 );

		const material2 = new MeshLambertMaterial( { color: 0x00ff00, emissive: 0xffffff, emissiveIntensity: 10 } );

		const light2 = new Mesh( geometry, material2 );
		light2.position.set( 0, 5, 0 );
		light2.scale.set( 1, 0.1, 1 );
		this.add( light2 );

		const material3 = new MeshLambertMaterial( { color: 0x0000ff, emissive: 0xffffff, emissiveIntensity: 10 } );

		const light3 = new Mesh( geometry, material3 );
		light3.position.set( 2, 1, 5 );
		light3.scale.set( 1.5, 2, 0.1 );
		this.add( light3 );

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

export { DebugEnvironment };
