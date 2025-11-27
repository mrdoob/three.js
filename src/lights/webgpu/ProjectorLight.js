import { SpotLight } from '../SpotLight.js';

/**
 * A projector light version of {@link SpotLight}. Can only be used with {@link WebGPURenderer}.
 *
 * @augments SpotLight
 */
class ProjectorLight extends SpotLight {

	/**
	 * Constructs a new projector light.
	 *
	 * @param {(number|Color|string)} [color=0xffffff] - The light's color.
	 * @param {number} [intensity=1] - The light's strength/intensity measured in candela (cd).
	 * @param {number} [distance=0] - Maximum range of the light. `0` means no limit.
	 * @param {number} [angle=Math.PI/3] - Maximum angle of light dispersion from its direction whose upper bound is `Math.PI/2`.
	 * @param {number} [penumbra=0] - Percent of the spotlight cone that is attenuated due to penumbra. Value range is `[0,1]`.
	 * @param {number} [decay=2] - The amount the light dims along the distance of the light.
	 */
	constructor( color, intensity, distance, angle, penumbra, decay ) {

		super( color, intensity, distance, angle, penumbra, decay );

		/**
		 * Aspect ratio of the light. Set to `null` to use the texture aspect ratio.
		 *
		 * @type {?number}
		 * @default null
		 */
		this.aspect = null;

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		this.aspect = source.aspect;

		return this;

	}

}

export default ProjectorLight;
