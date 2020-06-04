import { Line } from './Line';
import { Geometry } from './../core/Geometry';
import { Material } from './../materials/Material';
import { BufferGeometry } from '../core/BufferGeometry';

export class LineLoop <
	TGeometry extends Geometry | BufferGeometry = Geometry | BufferGeometry,
	TMaterial extends Material | Material[] = Material | Material[]
> extends Line {

	constructor(
		geometry?: TGeometry,
		material?: TMaterial
	);

	type: 'LineLoop';
	readonly isLineLoop: true;

}
