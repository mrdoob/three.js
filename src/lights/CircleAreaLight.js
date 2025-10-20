import { Light } from './Light.js';
import { CircleAreaLightShadow } from './CircleAreaLightShadow.js';

/**
 * This class emits light uniformly across the face of a circular disc.
 * This light type can be used to simulate light sources such as round ceiling
 * lights or circular softboxes.
 *
 * Important Notes:
 *
 * - Only PBR materials are supported.
 * - You have to include `RectAreaLightUniformsLib` (`WebGLRenderer`) or `RectAreaLightTexturesLib` (`WebGPURenderer`)
 * into your app and init the uniforms/textures (CircleAreaLight uses the same LTC textures as RectAreaLight).
 *
 * ```js
 * RectAreaLightUniformsLib.init(); // only relevant for WebGLRenderer
 * THREE.RectAreaLightNode.setLTC( RectAreaLightTexturesLib.init() ); //  only relevant for WebGPURenderer
 *
 * const intensity = 1; const radius = 5;
 * const circleLight = new THREE.CircleAreaLight( 0xffffff, intensity, radius );
 * circleLight.position.set( 5, 5, 0 );
 * circleLight.lookAt( 0, 0, 0 );
 * scene.add( circleLight )
 * ```
 *
 * @augments Light
 */
class CircleAreaLight extends Light {

	/**
	 * Constructs a new circular area light.
	 *
	 * @param {(number|Color|string)} [color=0xffffff] - The light's color.
	 * @param {number} [intensity=1] - The light's strength/intensity.
	 * @param {number} [radius=5] - The radius of the light.
	 */
	constructor( color, intensity, radius = 5 ) {

		super( color, intensity );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isCircleAreaLight = true;

		this.type = 'CircleAreaLight';

		/**
		 * The radius of the light.
		 *
		 * @type {number}
		 * @default 5
		 */
		this.radius = radius;

		/**
		 * The shadow configuration.
		 *
		 * @type {CircleAreaLightShadow}
		 */
		this.shadow = new CircleAreaLightShadow();

	}

	/**
	 * The light's power. Power is the luminous power of the light measured in lumens (lm).
	 * Changing the power will also change the light's intensity.
	 *
	 * @type {number}
	 */
	get power() {

		// compute the light's luminous power (in lumens) from its intensity (in nits)
		// for a circular disc: area = π * r²
		return this.intensity * Math.PI * this.radius * this.radius * Math.PI;

	}

	set power( power ) {

		// set the light's intensity (in nits) from the desired luminous power (in lumens)
		this.intensity = power / ( Math.PI * this.radius * this.radius * Math.PI );

	}

	copy( source ) {

		super.copy( source );

		this.radius = source.radius;

		return this;

	}

	toJSON( meta ) {

		const data = super.toJSON( meta );

		data.object.radius = this.radius;

		return data;

	}

}

export { CircleAreaLight };
