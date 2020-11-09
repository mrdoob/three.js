import { BufferGeometry } from '../core/BufferGeometry';
import { Geometry } from '../core/Geometry';

export class EdgesGeometry extends BufferGeometry {

	/**
	 * @param geometry
	 * @param [thresholdAngle=1]
	 */
	constructor( geometry: BufferGeometry | Geometry, thresholdAngle?: number );

	/**
	 * @default 'EdgesGeometry'
	 */
	type: string;

	parameters: {
		thresholdAngle: number;
	};

}
