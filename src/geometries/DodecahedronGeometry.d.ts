import { Geometry } from './../core/Geometry';

export class DodecahedronGeometry extends Geometry {

	/**
	 * @param [radius=1]
	 * @param [detail=0]
	 */
	constructor( radius?: number, detail?: number );

	/**
	 * @default 'DodecahedronGeometry'
	 */
	type: string;

	parameters: {
		radius: number;
		detail: number;
	};

}
