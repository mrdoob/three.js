import { Color } from './../math/Color';
import { Light } from './Light';

/**
 * This light's color gets applied to all the objects in the scene globally.
 *
 * @source https://github.com/mrdoob/three.js/blob/master/src/lights/AmbientLight.js
 */
export class AmbientLight extends Light {

	/**
	 * This creates a Ambientlight with a color.
	 * @param color Numeric value of the RGB component of the color or a Color instance.
	 */
	constructor( color?: Color | string | number, intensity?: number );

	castShadow: boolean;
	readonly isAmbientLight: true;

}
