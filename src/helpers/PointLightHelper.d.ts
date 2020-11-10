import { PointLight } from './../lights/PointLight';
import { Color } from './../math/Color';
import { Matrix4 } from './../math/Matrix4';
import { Object3D } from './../core/Object3D';

export class PointLightHelper extends Object3D {

	constructor(
		light: PointLight,
		sphereSize?: number,
		color?: Color | string | number
	);

	/**
	 * @default 'PointLightHelper'
	 */
	type: string;

	light: PointLight;
	color: Color | string | number | undefined;
	matrix: Matrix4;

	/**
	 * @default false
	 */
	matrixAutoUpdate: boolean;

	dispose(): void;
	update(): void;

}
