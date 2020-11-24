import { Geometry } from './../core/Geometry';

export class BoxGeometry extends Geometry {

	/**
	 * @param [width=1] — Width of the sides on the X axis.
	 * @param [height=1] — Height of the sides on the Y axis.
	 * @param [depth=1] — Depth of the sides on the Z axis.
	 * @param [widthSegments=1] — Number of segmented faces along the width of the sides.
	 * @param [heightSegments=1] — Number of segmented faces along the height of the sides.
	 * @param [depthSegments=1] — Number of segmented faces along the depth of the sides.
	 */
	constructor(
		width?: number,
		height?: number,
		depth?: number,
		widthSegments?: number,
		heightSegments?: number,
		depthSegments?: number
	);

	/**
	 * @default 'BoxGeometry'
	 */
	type: string;

	parameters: {
		width: number;
		height: number;
		depth: number;
		widthSegments: number;
		heightSegments: number;
		depthSegments: number;
	};

}
