import { Color } from '../math/Color.js';

/**
 * This class can be used to define a range fog that smoothly grows denser
 * from no fog at `near` to full fog at `far`. The distance is measured as
 * depth along the camera's view direction.
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
	 * @param {number} [far=1000] - The distance at which fog reaches full density.
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
		 * The distance at which fog reaches full density. Objects that are more
		 * than `far` units away from the active camera are rendered entirely in
		 * the fog color.
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
