import {
	Color,
	Line,
	RectAreaLight
} from '../../../src/Three';

export class RectAreaLightHelper extends Line {

	constructor( light: RectAreaLight, color?: Color | string | number );

	light: RectAreaLight;
	color: Color | string | number | undefined;

	update(): void;
	dispose(): void;

}
