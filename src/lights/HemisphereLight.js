import { Light } from './Light.js';
import { Color } from '../math/Color.js';
import { Object3D } from '../core/Object3D.js';

/**
 * A light source positioned directly above the scene, with color fading from
 * the sky color to the ground color.
 *
 * This light cannot be used to cast shadows.
 *
 * ```js
 * const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
 * scene.add( light );
 * ```
 *
 * @augments Light
 */
class HemisphereLight extends Light {

	/**
	 * Constructs a new hemisphere light.
	 *
	 * @param {(number|Color|string)} [skyColor=0xffffff] - The light's sky color.
	 * @param {(number|Color|string)} [groundColor=0xffffff] - The light's ground color.
	 * @param {number} [intensity=1] - The light's strength/intensity.
	 */
	constructor( skyColor, groundColor, intensity ) {

		super( skyColor, intensity );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isHemisphereLight = true;

		this.type = 'HemisphereLight';

		this.position.copy( Object3D.DEFAULT_UP );
		this.updateMatrix();

		/**
		 * The light's ground color.
		 *
		 * @type {Color}
		 */
		this.groundColor = new Color( groundColor );

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		this.groundColor.copy( source.groundColor );

		return this;

	}

	toJSON( meta ) {

		const data = super.toJSON( meta );

		data.object.groundColor = this.groundColor.getHex();

		return data;

	}

}

export { HemisphereLight };
