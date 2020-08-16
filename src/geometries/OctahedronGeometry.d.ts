import {
	PolyhedronGeometry,
	PolyhedronBufferGeometry,
} from './PolyhedronGeometry';

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

export class OctahedronGeometry extends PolyhedronGeometry {

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
