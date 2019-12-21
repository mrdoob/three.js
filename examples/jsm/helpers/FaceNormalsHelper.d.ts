import {
	Object3D,
	LineSegments
} from '../../../src/Three';

/**
 * @deprecated Use {@link EdgesGeometry THREE.EdgesGeometry}
 */
// export class EdgesHelper extends LineSegments {
//	 constructor(object: Object3D, hex?: number, thresholdAngle?: number);
// }

export class FaceNormalsHelper extends LineSegments {

	constructor(
		object: Object3D,
		size?: number,
		hex?: number,
		linewidth?: number
	);

	object: Object3D;
	size: number;

	update( object?: Object3D ): void;

}
