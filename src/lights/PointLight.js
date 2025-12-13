import { Light } from './Light.js';
import { PointLightShadow } from './PointLightShadow.js';

/**
 * A light that gets emitted from a single point in all directions. A common
 * use case for this is to replicate the light emitted from a bare
 * lightbulb.
 *
 * This light can cast shadows - see the {@link PointLightShadow} for details.
 *
 * ```js
 * const light = new THREE.PointLight( 0xff0000, 1 );
 * light.position.set( 50, 50, 50 );
 * scene.add( light );
 * ```
 *
 * @augments Light
 */
class PointLight extends Light {

	/**
	 * Constructs a new point light.
	 *
	 * @param {(number|Color|string)} [color=0xffffff] - The light's color.
	 * @param {number} [intensity=1] - The light's strength/intensity measured in candela (cd).
	 * @param {number} [distance=0] - Deprecated. Distance is now computed from intensity and decay.
	 * @param {number} [decay=2] - The amount the light dims along the distance of the light.
	 */
	constructor( color, intensity, distance = 0, decay = 2 ) {

		super( color, intensity );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isPointLight = true;

		this.type = 'PointLight';

		if ( distance > 0 ) {

			console.warn( 'THREE.PointLight: "distance" is now computed from "intensity" and "decay".' );

		}

		/**
		 * The amount the light dims along the distance of the light. In context of
		 * physically-correct rendering the default value should not be changed.
		 *
		 * @type {number}
		 * @default 2
		 */
		this.decay = decay;

		/**
		 * This property holds the light's shadow configuration.
		 *
		 * @type {PointLightShadow}
		 */
		this.shadow = new PointLightShadow();

	}

	/**
	 * The light's power. Power is the luminous power of the light measured in lumens (lm).
	 * Changing the power will also change the light's intensity.
	 *
	 * @type {number}
	 */
	get power() {

		// compute the light's luminous power (in lumens) from its intensity (in candela)
		// for an isotropic light source, luminous power (lm) = 4 π luminous intensity (cd)
		return this.intensity * 4 * Math.PI;

	}

	set power( power ) {

		// set the light's intensity (in candela) from the desired luminous power (in lumens)
		this.intensity = power / ( 4 * Math.PI );

	}

	/**
	 * The maximum range of the light, computed from intensity and decay.
	 *
	 * @type {number}
	 */
	get distance() {

		// Compute effective distance from intensity and decay
		// Distance where intensity drops to 1% (threshold = 0.01)
		if ( this.decay > 0 ) {

			return Math.pow( this.intensity / 0.01, 1 / this.decay );

		}

		return 0;

	}

	set distance( value ) {

		if ( value > 0 ) {

			console.warn( 'THREE.PointLight: "distance" is now computed from "intensity" and "decay".' );

		}

	}

	dispose() {

		super.dispose();

		this.shadow.dispose();

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		this.decay = source.decay;

		this.shadow = source.shadow.clone();

		return this;

	}

	toJSON( meta ) {

		const data = super.toJSON( meta );

		data.object.decay = this.decay;

		data.object.shadow = this.shadow.toJSON();

		return data;

	}

}

export { PointLight };
