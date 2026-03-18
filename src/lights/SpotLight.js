import { Light } from './Light.js';
import { SpotLightShadow } from './SpotLightShadow.js';
import { Object3D } from '../core/Object3D.js';

/**
 * This light gets emitted from a single point in one direction, along a cone
 * that increases in size the further from the light it gets.
 *
 * This light can cast shadows - see the {@link SpotLightShadow} for details.
 *
 * ```js
 * // white spotlight shining from the side, modulated by a texture
 * const spotLight = new THREE.SpotLight( 0xffffff );
 * spotLight.position.set( 100, 1000, 100 );
 * spotLight.map = new THREE.TextureLoader().load( url );
 *
 * spotLight.castShadow = true;
 * spotLight.shadow.mapSize.width = 1024;
 * spotLight.shadow.mapSize.height = 1024;
 * spotLight.shadow.camera.near = 500;
 * spotLight.shadow.camera.far = 4000;
 * spotLight.shadow.camera.fov = 30;s
 * ```
 *
 * @augments Light
 */
class SpotLight extends Light {

	/**
	 * Constructs a new spot light.
	 *
	 * @param {(number|Color|string)} [color=0xffffff] - The light's color.
	 * @param {number} [intensity=1] - The light's strength/intensity measured in candela (cd).
	 * @param {number} [distance=0] - Maximum range of the light. `0` means no limit.
	 * @param {number} [angle=Math.PI/3] - Maximum angle of light dispersion from its direction whose upper bound is `Math.PI/2`.
	 * @param {number} [penumbra=0] - Percent of the spotlight cone that is attenuated due to penumbra. Value range is `[0,1]`.
	 * @param {number} [decay=2] - The amount the light dims along the distance of the light.
	 */
	constructor( color, intensity, distance = 0, angle = Math.PI / 3, penumbra = 0, decay = 2 ) {

		super( color, intensity );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isSpotLight = true;

		this.type = 'SpotLight';

		this.position.copy( Object3D.DEFAULT_UP );
		this.updateMatrix();

		/**
		 * The spot light points from its position to the
		 * target's position.
		 *
		 * For the target's position to be changed to anything other
		 * than the default, it must be added to the scene.
		 *
		 * It is also possible to set the target to be another 3D object
		 * in the scene. The light will now track the target object.
		 *
		 * @type {Object3D}
		 */
		this.target = new Object3D();

		/**
		 * Maximum range of the light. `0` means no limit.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.distance = distance;

		/**
		 * Maximum angle of light dispersion from its direction whose upper bound is `Math.PI/2`.
		 *
		 * @type {number}
		 * @default Math.PI/3
		 */
		this.angle = angle;

		/**
		 * Percent of the spotlight cone that is attenuated due to penumbra.
		 * Value range is `[0,1]`.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.penumbra = penumbra;

		/**
		 * The amount the light dims along the distance of the light. In context of
		 * physically-correct rendering the default value should not be changed.
		 *
		 * @type {number}
		 * @default 2
		 */
		this.decay = decay;

		/**
		 * A texture used to modulate the color of the light. The spot light
		 * color is mixed with the RGB value of this texture, with a ratio
		 * corresponding to its alpha value. The cookie-like masking effect is
		 * reproduced using pixel values (0, 0, 0, 1-cookie_value).
		 *
		 * *Warning*: This property is disabled if {@link Object3D#castShadow} is set to `false`.
		 *
		 * @type {?Texture}
		 * @default null
		 */
		this.map = null;

		/**
		 * This property holds the light's shadow configuration.
		 *
		 * @type {SpotLightShadow}
		 */
		this.shadow = new SpotLightShadow();

	}

	/**
	 * The light's power. Power is the luminous power of the light measured in lumens (lm).
	 *  Changing the power will also change the light's intensity.
	 *
	 * @type {number}
	 */
	get power() {

		// compute the light's luminous power (in lumens) from its intensity (in candela)
		// by convention for a spotlight, luminous power (lm) = π * luminous intensity (cd)
		return this.intensity * Math.PI;

	}

	set power( power ) {

		// set the light's intensity (in candela) from the desired luminous power (in lumens)
		this.intensity = power / Math.PI;

	}

	dispose() {

		super.dispose();

		this.shadow.dispose();

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		this.distance = source.distance;
		this.angle = source.angle;
		this.penumbra = source.penumbra;
		this.decay = source.decay;

		this.target = source.target.clone();
		this.map = source.map;
		this.shadow = source.shadow.clone();

		return this;

	}

	toJSON( meta ) {

		const data = super.toJSON( meta );

		data.object.distance = this.distance;
		data.object.angle = this.angle;
		data.object.decay = this.decay;
		data.object.penumbra = this.penumbra;

		data.object.target = this.target.uuid;

		if ( this.map && this.map.isTexture ) data.object.map = this.map.toJSON( meta ).uuid;

		data.object.shadow = this.shadow.toJSON();

		return data;

	}

}

export { SpotLight };
