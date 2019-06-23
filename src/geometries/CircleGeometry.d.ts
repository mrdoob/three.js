import { Geometry } from './../core/Geometry';
import { BufferGeometry } from '../core/BufferGeometry';

/**
 * @deprecated Use {@link BoxGeometry} instead.
 */
export class CircleBufferGeometry extends BufferGeometry {

	constructor(
		radius?: number,
		segments?: number,
		thetaStart?: number,
		thetaLength?: number
	);

	parameters: {
		radius: number;
		segments: number;
		thetaStart: number;
		thetaLength: number;
	};

}

export class CircleGeometry extends Geometry {

	constructor(
		radius?: number,
		segments?: number,
		thetaStart?: number,
		thetaLength?: number
	);

	parameters: {
		radius: number;
		segments: number;
		thetaStart: number;
		thetaLength: number;
	};

}
