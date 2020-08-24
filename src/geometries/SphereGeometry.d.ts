import { Geometry } from './../core/Geometry';
import { BufferGeometry } from './../core/BufferGeometry';

export class SphereBufferGeometry extends BufferGeometry {

	/**
	 * The geometry is created by sweeping and calculating vertexes around the Y axis (horizontal sweep) and the Z axis (vertical sweep). Thus, incomplete spheres (akin to 'sphere slices') can be created through the use of different values of phiStart, phiLength, thetaStart and thetaLength, in order to define the points in which we start (or end) calculating those vertices.
	 *
	 * @param [radius=50] — sphere radius. Default is 50.
	 * @param [widthSegments=8] — number of horizontal segments. Minimum value is 3, and the default is 8.
	 * @param [heightSegments=6] — number of vertical segments. Minimum value is 2, and the default is 6.
	 * @param [phiStart=0] — specify horizontal starting angle. Default is 0.
	 * @param [phiLength=Math.PI * 2] — specify horizontal sweep angle size. Default is Math.PI * 2.
	 * @param [thetaStart=0] — specify vertical starting angle. Default is 0.
	 * @param [thetaLength=Math.PI * 2] — specify vertical sweep angle size. Default is Math.PI.
	 */
	constructor(
		radius?: number,
		widthSegments?: number,
		heightSegments?: number,
		phiStart?: number,
		phiLength?: number,
		thetaStart?: number,
		thetaLength?: number
	);

	/**
	 * @default 'SphereBufferGeometry'
	 */
	type: string;

	parameters: {
		radius: number;
		widthSegments: number;
		heightSegments: number;
		phiStart: number;
		phiLength: number;
		thetaStart: number;
		thetaLength: number;
	};

}

/**
 * A class for generating sphere geometries
 */
export class SphereGeometry extends Geometry {

	/**
	 * The geometry is created by sweeping and calculating vertexes around the Y axis (horizontal sweep) and the Z axis (vertical sweep). Thus, incomplete spheres (akin to 'sphere slices') can be created through the use of different values of phiStart, phiLength, thetaStart and thetaLength, in order to define the points in which we start (or end) calculating those vertices.
	 *
	 * @param [radius=50] — sphere radius. Default is 50.
	 * @param [widthSegments=8] — number of horizontal segments. Minimum value is 3, and the default is 8.
	 * @param [heightSegments=6] — number of vertical segments. Minimum value is 2, and the default is 6.
	 * @param [phiStart=0] — specify horizontal starting angle. Default is 0.
	 * @param [phiLength=Math.PI * 2] — specify horizontal sweep angle size. Default is Math.PI * 2.
	 * @param [thetaStart=0] — specify vertical starting angle. Default is 0.
	 * @param [thetaLength=Math.PI * 2] — specify vertical sweep angle size. Default is Math.PI.
	 */
	constructor(
		radius?: number,
		widthSegments?: number,
		heightSegments?: number,
		phiStart?: number,
		phiLength?: number,
		thetaStart?: number,
		thetaLength?: number
	);

	/**
	 * @default 'SphereGeometry'
	 */
	type: string;

	parameters: {
		radius: number;
		widthSegments: number;
		heightSegments: number;
		phiStart: number;
		phiLength: number;
		thetaStart: number;
		thetaLength: number;
	};

}
