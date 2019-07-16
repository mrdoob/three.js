import { DirectionalLight } from './../lights/DirectionalLight';
import { Color } from './../math/Color';
import { Line } from './../objects/Line';
import { Matrix4 } from './../math/Matrix4';
import { Object3D } from './../core/Object3D';

export class DirectionalLightHelper extends Object3D {

	constructor(
		light: DirectionalLight,
		size?: number,
		color?: Color | string | number
	);

	light: DirectionalLight;
	lightPlane: Line;
	targetPlane: Line;
	color: Color | string | number | undefined;
	matrix: Matrix4;
	matrixAutoUpdate: boolean;

	dispose(): void;
	update(): void;

}
