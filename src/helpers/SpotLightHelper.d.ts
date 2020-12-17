import { Light } from './../lights/Light';
import { Color } from './../math/Color';
import { Matrix4 } from './../math/Matrix4';
import { Object3D } from './../core/Object3D';
import { LineSegments } from '../objects/LineSegments';

export class SpotLightHelper extends Object3D {

	constructor( light: Light, color?: Color | string | number );

	light: Light;
	matrix: Matrix4;

	/**
	 * @default false
	 */
	matrixAutoUpdate: boolean;
	color: Color | string | number | undefined;
	cone: LineSegments;

	dispose(): void;
	update(): void;

}
