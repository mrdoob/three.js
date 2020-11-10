import { Geometry } from './../core/Geometry';

export class CylinderGeometry extends Geometry {

	/**
	 * @param [radiusTop=1] — Radius of the cylinder at the top.
	 * @param [radiusBottom=1] — Radius of the cylinder at the bottom.
	 * @param [height=1] — Height of the cylinder.
	 * @param [radialSegments=8] — Number of segmented faces around the circumference of the cylinder.
	 * @param [heightSegments=1] — Number of rows of faces along the height of the cylinder.
	 * @param [openEnded=false] - A Boolean indicating whether or not to cap the ends of the cylinder.
	 * @param [thetaStart=0]
	 * @param [thetaLength=Math.PI * 2]
	 */
	constructor(
		radiusTop?: number,
		radiusBottom?: number,
		height?: number,
		radialSegments?: number,
		heightSegments?: number,
		openEnded?: boolean,
		thetaStart?: number,
		thetaLength?: number
	);

	/**
	 * @default 'CylinderGeometry'
	 */
	type: string;

	parameters: {
		radiusTop: number;
		radiusBottom: number;
		height: number;
		radialSegments: number;
		heightSegments: number;
		openEnded: boolean;
		thetaStart: number;
		thetaLength: number;
	};

}
