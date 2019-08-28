import { Light } from './Light';
import { Color } from './../math/Color';

export class RectAreaLight extends Light {

	constructor(
		color?: Color | string | number,
		intensity?: number,
		width?: number,
		height?: number
	);

	type: string;
	width: number;
	height: number;
	intensity: number;

}
