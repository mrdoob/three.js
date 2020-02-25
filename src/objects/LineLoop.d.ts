import { Line } from './Line';
import { Geometry } from './../core/Geometry';
import { Material } from './../materials/Material';
import { LineBasicMaterial } from '../materials/LineBasicMaterial';

export class LineLoop<
	TGeometry extends Geometry,
	TMaterial extends Material = LineBasicMaterial
> extends Line<TGeometry, TMaterial> {

	constructor( geometry?: TGeometry, material?: TMaterial );

	type: 'LineLoop';
	readonly isLineLoop: true;

}
