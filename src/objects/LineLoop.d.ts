import { Line } from './Line';
import { Material } from './../materials/Material';
import { BufferGeometry } from '../core/BufferGeometry';

export class LineLoop <
	BufferGeometry,
	TMaterial extends Material | Material[] = Material | Material[]
> extends Line<BufferGeometry, TMaterial> {

	constructor(
		geometry?: BufferGeometry,
		material?: TMaterial
	);

	type: 'LineLoop';
	readonly isLineLoop: true;

}
