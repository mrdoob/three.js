import { DirectionalLight } from './../lights/DirectionalLight';
import { Color } from './../math/Color';
import { Line } from './../objects/Line';
import { Matrix4 } from './../math/Matrix4';
import { Object3D } from './../core/Object3D';

export class DirectionalLightHelper extends Object3D {

	/**
	 * @param light
	 * @param [size=1]
	 * @param color
	 */
	constructor(
		light: DirectionalLight,
		size?: number,
		color?: Color | string | number
	);

	light: DirectionalLight;
	lightPlane: Line;
	targetLine: Line;

	/**
	 * @default undefined
	 */
	color: Color | string | number | undefined;
	matrix: Matrix4;

	/**
	 * @default false
	 */
	matrixAutoUpdate: boolean;

	dispose(): void;
	update(): void;

}
