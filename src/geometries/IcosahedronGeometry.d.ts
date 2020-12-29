import { Geometry } from './../core/Geometry';

export class IcosahedronGeometry extends Geometry {

	/**
	 * @param [radius=1]
	 * @param [detail=0]
	 */
	constructor( radius?: number, detail?: number );

	/**
	 * @default 'IcosahedronGeometry'
	 */
	type: string;

}
