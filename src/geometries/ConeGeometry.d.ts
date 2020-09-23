import { CylinderGeometry } from './CylinderGeometry';
import { CylinderBufferGeometry } from './CylinderGeometry';

export class ConeBufferGeometry extends CylinderBufferGeometry {

	/**
	 * @param [radiusTop=0] — Radius of the cylinder at the top.
	 * @param [radiusBottom=1] — Radius of the cylinder at the bottom.
	 * @param [height=1] — Height of the cylinder.
	 * @param [radiusSegments=8] — Number of segmented faces around the circumference of the cylinder.
	 * @param [heightSegments=1] — Number of rows of faces along the height of the cylinder.
	 * @param [openEnded=false] - A Boolean indicating whether or not to cap the ends of the cylinder.
	 * @param [thetaStart=0]
	 * @param [widthSegments=Math.PI * 2]
	 */
	constructor(
		radius?: number,
		height?: number,
		radialSegment?: number,
		heightSegment?: number,
		openEnded?: boolean,
		thetaStart?: number,
		thetaLength?: number
	);

	/**
	 * @default 'ConeBufferGeometry'
	 */
	type: string;

}

export class ConeGeometry extends CylinderGeometry {

	/**
	 * @param [radiusTop=0] — Radius of the cylinder at the top.
	 * @param [radiusBottom=1] — Radius of the cylinder at the bottom.
	 * @param [height=1] — Height of the cylinder.
	 * @param [radiusSegments=8] — Number of segmented faces around the circumference of the cylinder.
	 * @param [heightSegments=1] — Number of rows of faces along the height of the cylinder.
	 * @param [openEnded=false] - A Boolean indicating whether or not to cap the ends of the cylinder.
	 * @param [thetaStart=0]
	 * @param [widthSegments=Math.PI * 2]
	 */
	constructor(
		radius?: number,
		height?: number,
		radialSegment?: number,
		heightSegment?: number,
		openEnded?: boolean,
		thetaStart?: number,
		thetaLength?: number
	);

	/**
	 * @default 'ConeGeometry'
	 */
	type: string;

}
