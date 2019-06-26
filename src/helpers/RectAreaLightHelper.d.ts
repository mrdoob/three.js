import { RectAreaLight } from './../lights/RectAreaLight';
import { Color } from './../math/Color';
import { Line } from '../objects/Line';

export class RectAreaLightHelper extends Line {

	constructor( light: RectAreaLight, color?: Color | string | number );

	light: RectAreaLight;
	color: Color | string | number | undefined;

	update(): void;
	dispose(): void;

}
