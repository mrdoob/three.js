import { CylinderGeometry } from './CylinderGeometry';
import { CylinderBufferGeometry } from './CylinderGeometry';

export class ConeBufferGeometry extends CylinderBufferGeometry {

	constructor(
		radius?: number,
		height?: number,
		radialSegment?: number,
		heightSegment?: number,
		openEnded?: boolean,
		thetaStart?: number,
		thetaLength?: number
	);

}

export class ConeGeometry extends CylinderGeometry {

	constructor(
		radius?: number,
		height?: number,
		radialSegment?: number,
		heightSegment?: number,
		openEnded?: boolean,
		thetaStart?: number,
		thetaLength?: number
	);

}
