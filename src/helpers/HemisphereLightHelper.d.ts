import { HemisphereLight } from './../lights/HemisphereLight';
import { Color } from './../math/Color';
import { Matrix4 } from './../math/Matrix4';
import { MeshBasicMaterial } from './../materials/MeshBasicMaterial';
import { Object3D } from './../core/Object3D';

export class HemisphereLightHelper extends Object3D {

	constructor(
		light: HemisphereLight,
		size: number,
		color?: Color | number | string
	);

	light: HemisphereLight;
	matrix: Matrix4;
	matrixAutoUpdate: boolean;
	material: MeshBasicMaterial;

	color: Color | string | number | undefined;

	dispose(): void;
	update(): void;

}
