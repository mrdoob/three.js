import { PolyhedronGeometry, PolyhedronBufferGeometry } from './PolyhedronGeometry';

export class TetrahedronBufferGeometry extends PolyhedronBufferGeometry {

	/**
	 * @param [radius=1]
	 * @param [detail=0]
	 */
	constructor( radius?: number, detail?: number );

	/**
	 * @default 'TetrahedronBufferGeometry'
	 */
	type: string;

}

export class TetrahedronGeometry extends PolyhedronGeometry {

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
