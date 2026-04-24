import { Color } from '../math/Color.js';

/**
 * This class can be used to define a linear fog that grows linearly denser
 * with the distance.
 *
 * ```js
 * const scene = new THREE.Scene();
 * scene.fog = new THREE.Fog( 0xcccccc, 10, 15 );
 * ```
 */
class Fog {

	/**
	 * Constructs a new fog.
	 *
	 * @param {number|Color} color - The fog's color.
	 * @param {number} [near=1] - The minimum distance to start applying fog.
	 * @param {number} [far=1000] - The maximum distance at which fog stops being calculated and applied.
	 */
	constructor( color, near = 1, far = 1000 ) {

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isFog = true;

		/**
		 * The name of the fog.
		 *
		 * @type {string}
		 */
		this.name = '';

		/**
		 * The fog's color.
		 *
		 * @type {Color}
		 */
		this.color = new Color( color );

		/**
		 * The minimum distance to start applying fog. Objects that are less than
		 * `near` units from the active camera won't be affected by fog.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.near = near;

		/**
		 * The maximum distance at which fog stops being calculated and applied.
		 * Objects that are more than `far` units away from the active camera won't
		 * be affected by fog.
		 *
		 * @type {number}
		 * @default 1000
		 */
		this.far = far;

	}

	/**
	 * Returns a new fog with copied values from this instance.
	 *
	 * @return {Fog} A clone of this instance.
	 */
	clone() {

		return new Fog( this.color, this.near, this.far );

	}

	/**
	 * Serializes the fog into JSON.
	 *
	 * @param {?(Object|string)} meta - An optional value holding meta information about the serialization.
	 * @return {Object} A JSON object representing the serialized fog
	 */
	toJSON( /* meta */ ) {

		return {
			type: 'Fog',
			name: this.name,
			color: this.color.getHex(),
			near: this.near,
			far: this.far
		};

	}

}

export { Fog };
