import {
	PolyhedronGeometry,
	PolyhedronBufferGeometry,
} from './PolyhedronGeometry';

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

export class IcosahedronGeometry extends PolyhedronGeometry {

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
