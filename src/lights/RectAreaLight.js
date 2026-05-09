import { Light } from './Light.js';

/**
 * This class emits light uniformly across the face a rectangular plane.
 * This light type can be used to simulate light sources such as bright
 * windows or strip lighting.
 *
 * Important Notes:
 *
 * - There is no shadow support.
 * - Only PBR materials are supported.
 * - You have to include `RectAreaLightUniformsLib` (`WebGLRenderer`) or `RectAreaLightTexturesLib` (`WebGPURenderer`)
 * into your app and init the uniforms/textures.
 *
 * ```js
 * RectAreaLightUniformsLib.init(); // only relevant for WebGLRenderer
 * THREE.RectAreaLightNode.setLTC( RectAreaLightTexturesLib.init() ); //  only relevant for WebGPURenderer
 *
 * const intensity = 1; const width = 10; const height = 10;
 * const rectLight = new THREE.RectAreaLight( 0xffffff, intensity, width, height );
 * rectLight.position.set( 5, 5, 0 );
 * rectLight.lookAt( 0, 0, 0 );
 * scene.add( rectLight )
 * ```
 *
 * @augments Light
 */
class RectAreaLight extends Light {

	/**
	 * Constructs a new area light.
	 *
	 * @param {(number|Color|string)} [color=0xffffff] - The light's color.
	 * @param {number} [intensity=1] - The light's strength/intensity.
	 * @param {number} [width=10] - The width of the light.
	 * @param {number} [height=10] - The height of the light.
	 */
	constructor( color, intensity, width = 10, height = 10 ) {

		super( color, intensity );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isRectAreaLight = true;

		this.type = 'RectAreaLight';

		/**
		 * The width of the light.
		 *
		 * @type {number}
		 * @default 10
		 */
		this.width = width;

		/**
		 * The height of the light.
		 *
		 * @type {number}
		 * @default 10
		 */
		this.height = height;

	}

	/**
	 * The light's power. Power is the luminous power of the light measured in lumens (lm).
	 * Changing the power will also change the light's intensity.
	 *
	 * @type {number}
	 */
	get power() {

		// compute the light's luminous power (in lumens) from its intensity (in nits)
		return this.intensity * this.width * this.height * Math.PI;

	}

	set power( power ) {

		// set the light's intensity (in nits) from the desired luminous power (in lumens)
		this.intensity = power / ( this.width * this.height * Math.PI );

	}

	copy( source ) {

		super.copy( source );

		this.width = source.width;
		this.height = source.height;

		return this;

	}

	toJSON( meta ) {

		const data = super.toJSON( meta );

		data.object.width = this.width;
		data.object.height = this.height;

		return data;

	}

}

export { RectAreaLight };
