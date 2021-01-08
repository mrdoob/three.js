import { Line } from './Line';
import { Material } from './../materials/Material';
import { BufferGeometry } from '../core/BufferGeometry';

export class LineLoop extends Line {

	constructor(
		geometry?: BufferGeometry,
		material?: Material | Material[]
	);

	type: 'LineLoop';
	readonly isLineLoop: true;

}
