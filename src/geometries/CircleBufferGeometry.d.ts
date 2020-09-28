import { BufferGeometry } from '../core/BufferGeometry';

export class CircleBufferGeometry extends BufferGeometry {

	/**
	 * @param [radius=1]
	 * @param [segments=8]
	 * @param [thetaStart=0]
	 * @param [thetaLength=Math.PI * 2]
	 */
	constructor(
		radius?: number,
		segments?: number,
		thetaStart?: number,
		thetaLength?: number
	);

	/**
	 * @default 'CircleBufferGeometry'
	 */
	type: string;

	parameters: {
		radius: number;
		segments: number;
		thetaStart: number;
		thetaLength: number;
	};

}
