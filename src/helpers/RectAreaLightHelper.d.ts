import { RectAreaLight } from './../lights/RectAreaLight';
import { Color } from './../math/Color';
//import { Matrix4 } from './../math/Matrix4';
//import { Object3D } from './../core/Object3D';

export class RectAreaLightHelper {

	constructor( light: RectAreaLight, color?: Color | string | number );

	light: RectAreaLight;
	color: Color | string | number | undefined;

}
