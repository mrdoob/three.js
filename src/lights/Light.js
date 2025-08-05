import { Object3D } from '../core/Object3D.js';
import { Color } from '../math/Color.js';

/**
 * Abstract base class for lights - all other light types inherit the
 * properties and methods described here.
 *
 * @abstract
 * @augments Object3D
 */
class Light extends Object3D {

	/**
	 * Constructs a new light.
	 *
	 * @param {(number|Color|string)} [color=0xffffff] - The light's color.
	 * @param {number} [intensity=1] - The light's strength/intensity.
	 */
	constructor( color, intensity = 1 ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isLight = true;

		this.type = 'Light';

		/**
		 * The light's color.
		 *
		 * @type {Color}
		 */
		this.color = new Color( color );

		/**
		 * The light's intensity.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.intensity = intensity;

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever this instance is no longer used in your app.
	 */
	dispose() {

		// Empty here in base class; some subclasses override.

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		this.color.copy( source.color );
		this.intensity = source.intensity;

		return this;

	}

	toJSON( meta ) {

		const data = super.toJSON( meta );

		data.object.color = this.color.getHex();
		data.object.intensity = this.intensity;

		if ( this.groundColor !== undefined ) data.object.groundColor = this.groundColor.getHex();

		if ( this.distance !== undefined ) data.object.distance = this.distance;
		if ( this.angle !== undefined ) data.object.angle = this.angle;
		if ( this.decay !== undefined ) data.object.decay = this.decay;
		if ( this.penumbra !== undefined ) data.object.penumbra = this.penumbra;

		if ( this.shadow !== undefined ) data.object.shadow = this.shadow.toJSON();
		if ( this.target !== undefined ) data.object.target = this.target.uuid;

		return data;

	}

}

export { Light };
