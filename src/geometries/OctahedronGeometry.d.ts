import { Geometry } from './../core/Geometry';

export class OctahedronGeometry extends Geometry {

	/**
	 * @param [radius=1]
	 * @param [detail=0]
	 */
	constructor( radius?: number, detail?: number );

	/**
	 * @default 'OctahedronGeometry'
	 */
	type: string;

}
