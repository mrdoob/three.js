import { Vector3 } from './../math/Vector3';
import { Geometry } from './../core/Geometry';

export class ParametricGeometry extends Geometry {

	constructor(
		func: ( u: number, v: number, dest: Vector3 ) => void,
		slices: number,
		stacks: number
	);

	/**
	 * @default 'ParametricGeometry'
	 */
	type: string;

	parameters: {
		func: ( u: number, v: number, dest: Vector3 ) => void;
		slices: number;
		stacks: number;
	};

}
