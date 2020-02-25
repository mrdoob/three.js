import { Geometry } from './../core/Geometry';
import { Material } from './../materials/Material';
import { Line } from './Line';
import { LineBasicMaterial } from '../materials/LineBasicMaterial';

/**
 * @deprecated
 */
export const LineStrip: number;
/**
 * @deprecated
 */
export const LinePieces: number;

export class LineSegments<
	TGeometry extends Geometry = Geometry,
	TMaterial extends Material = LineBasicMaterial
> extends Line<TGeometry, TMaterial> {

	constructor( geometry?: TGeometry, material?: TMaterial, mode?: number );

	type: 'LineSegments';
	readonly isLineSegments: true;

}
