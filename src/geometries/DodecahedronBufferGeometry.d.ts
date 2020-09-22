import { PolyhedronBufferGeometry } from './PolyhedronBufferGeometry';

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
