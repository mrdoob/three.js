import {
	BackSide,
	Mesh,
	MeshBasicMaterial,
	SphereGeometry,
	Scene
} from 'three';

/**
 * This class represents a scene with a uniform color that can be used as
 * input for {@link PMREMGenerator#fromScene}. The resulting PMREM represents
 * uniform ambient lighting and can be used for Image Based Lighting by
 * assigning it to {@link Scene#environment}.
 *
 * ```js
 * const environment = new ColorEnvironment( 0x00ff00 );
 * const pmremGenerator = new THREE.PMREMGenerator( renderer );
 *
 * const envMap = pmremGenerator.fromScene( environment ).texture;
 * scene.environment = envMap;
 * ```
 *
 * @augments Scene
 * @three_import import { ColorEnvironment } from 'three/addons/environments/ColorEnvironment.js';
 */
class ColorEnvironment extends Scene {

	/**
	 * Constructs a new color environment.
	 *
	 * @param {number|Color} color - The color of the environment.
	 */
	constructor( color = 0xffffff ) {

		super();

		this.name = 'ColorEnvironment';

		const geometry = new SphereGeometry( 1, 16, 16 );
		const material = new MeshBasicMaterial( { color: color, side: BackSide } );

		this.add( new Mesh( geometry, material ) );

	}

	/**
	 * Frees internal resources. This method should be called
	 * when the environment is no longer required.
	 */
	dispose() {

		this.children[ 0 ].geometry.dispose();
		this.children[ 0 ].material.dispose();

	}

}

export { ColorEnvironment };
