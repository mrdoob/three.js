import { PolyhedronBufferGeometry } from './PolyhedronBufferGeometry';

export class OctahedronBufferGeometry extends PolyhedronBufferGeometry {

	/**
	 * @param [radius=1]
	 * @param [detail=0]
	 */
	constructor( radius?: number, detail?: number );

	/**
	 * @default 'OctahedronBufferGeometry'
	 */
	type: string;

}
