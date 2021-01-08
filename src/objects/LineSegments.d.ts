import { Material } from './../materials/Material';
import { Line } from './Line';
import { BufferGeometry } from '../core/BufferGeometry';

/**
 * @deprecated
 */
export const LineStrip: number;
/**
 * @deprecated
 */
export const LinePieces: number;

export class LineSegments <
	BufferGeometry,
	TMaterial extends Material | Material[] = Material | Material[]
> extends Line<BufferGeometry, TMaterial> {

	constructor(
		geometry?: BufferGeometry,
		material?: TMaterial
	);

	/**
	 * @default 'LineSegments'
	 */
	type: 'LineSegments' | string;
	readonly isLineSegments: true;

}
