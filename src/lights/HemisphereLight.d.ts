import { Color } from './../math/Color';
import { Vector3 } from '../math/Vector3';
import { Light } from './Light';

export class HemisphereLight extends Light {

	/**
	 * @param skyColor
	 * @param groundColor
	 * @param [intensity=1]
	 */
	constructor(
		skyColor?: Color | string | number,
		groundColor?: Color | string | number,
		intensity?: number
	);

	/**
	 * @default 'HemisphereLight'
	 */
	type: string;

	/**
	 * @default THREE.Object3D.DefaultUp
	 */
	position: Vector3;

	groundColor: Color;

	readonly isHemisphereLight: true;

}
