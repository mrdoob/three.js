import { Geometry } from './../core/Geometry';
import { PolyhedronBufferGeometry } from './PolyhedronGeometry';

export class DodecahedronBufferGeometry extends PolyhedronBufferGeometry {

	/**
	 * @param [radius=1]
	 * @param [detail=0]
	 */
	constructor( radius?: number, detail?: number );

	/**
	 * @default 'DodecahedronBufferGeometry'
	 */
	type: string;

}

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
