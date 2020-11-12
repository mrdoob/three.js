import { Vector2 } from './../math/Vector2';
import { BufferGeometry } from './../core/BufferGeometry';

export class LatheBufferGeometry extends BufferGeometry {

	/**
	 * @param points
	 * @param [segments=12]
	 * @param [phiStart=0]
	 * @param [phiLength=Math.PI * 2]
	 */
	constructor(
		points: Vector2[],
		segments?: number,
		phiStart?: number,
		phiLength?: number
	);

	/**
	 * @default 'LatheBufferGeometry'
	 */
	type: string;

	parameters: {
		points: Vector2[];
		segments: number;
		phiStart: number;
		phiLength: number;
	};

}
