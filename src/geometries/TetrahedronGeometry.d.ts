import { Geometry } from './../core/Geometry';

export class TetrahedronGeometry extends Geometry {

	/**
	 * @param [radius=1]
	 * @param [detail=0]
	 */
	constructor( radius?: number, detail?: number );

	/**
	 * @default 'TetrahedronGeometry'
	 */
	type: string;

}
