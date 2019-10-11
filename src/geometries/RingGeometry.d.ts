import { Geometry } from './../core/Geometry';
import { BufferGeometry } from './../core/BufferGeometry';

export class RingBufferGeometry extends BufferGeometry {

	constructor(
		innerRadius?: number,
		outerRadius?: number,
		thetaSegments?: number,
		phiSegments?: number,
		thetaStart?: number,
		thetaLength?: number
	);

	parameters: {
		innerRadius: number;
		outerRadius: number;
		thetaSegments: number;
		phiSegments: number;
		thetaStart: number;
		thetaLength: number;
	};

}

export class RingGeometry extends Geometry {

	constructor(
		innerRadius?: number,
		outerRadius?: number,
		thetaSegments?: number,
		phiSegments?: number,
		thetaStart?: number,
		thetaLength?: number
	);

	parameters: {
		innerRadius: number;
		outerRadius: number;
		thetaSegments: number;
		phiSegments: number;
		thetaStart: number;
		thetaLength: number;
	};

}
