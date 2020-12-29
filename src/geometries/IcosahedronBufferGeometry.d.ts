import { PolyhedronBufferGeometry } from './PolyhedronBufferGeometry';

export class IcosahedronBufferGeometry extends PolyhedronBufferGeometry {

	/**
	 * @param [radius=1]
	 * @param [detail=0]
	 */
	constructor( radius?: number, detail?: number );

	/**
	 * @default 'IcosahedronBufferGeometry'
	 */
	type: string;

}
