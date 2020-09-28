import { CylinderBufferGeometry } from './CylinderBufferGeometry';

export class ConeBufferGeometry extends CylinderBufferGeometry {

	/**
	 * @param [radius=1] — Radius of the cone base.
	 * @param [height=1] — Height of the cone.
	 * @param [radialSegments=8] — Number of segmented faces around the circumference of the cone.
	 * @param [heightSegments=1] — Number of rows of faces along the height of the cone.
	 * @param [openEnded=false] — A Boolean indicating whether the base of the cone is open or capped.
	 * @param [thetaStart=0]
	 * @param [thetaLength=Math.PI * 2]
	 */
	constructor(
		radius?: number,
		height?: number,
		radialSegments?: number,
		heightSegments?: number,
		openEnded?: boolean,
		thetaStart?: number,
		thetaLength?: number
	);

	/**
	 * @default 'ConeBufferGeometry'
	 */
	type: string;

}
