import { UniformsLib } from 'three';
import { RectAreaLightTexturesLib } from './RectAreaLightTexturesLib.js';

/**
 * This class is only relevant when using {@link RectAreaLight} with {@link WebGLRenderer}.
 *
 * Before rect area lights can be used, the internal uniform library of the renderer must be
 * enhanced with the following code.
 *
 * ```js
 * RectAreaLightUniformsLib.init();
 * ```
 *
 * @hideconstructor
 * @three_import import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
 */
class RectAreaLightUniformsLib {

	/**
	 * Inits the uniform library required when using rect area lights.
	 */
	static init() {

		RectAreaLightTexturesLib.init();

		const { LTC_FLOAT_1, LTC_FLOAT_2, LTC_HALF_1, LTC_HALF_2 } = RectAreaLightTexturesLib;

		// data textures

		UniformsLib.LTC_FLOAT_1 = LTC_FLOAT_1;
		UniformsLib.LTC_FLOAT_2 = LTC_FLOAT_2;

		UniformsLib.LTC_HALF_1 = LTC_HALF_1;
		UniformsLib.LTC_HALF_2 = LTC_HALF_2;

	}

}

export { RectAreaLightUniformsLib };
