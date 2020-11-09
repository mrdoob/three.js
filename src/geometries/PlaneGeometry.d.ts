import { Geometry } from './../core/Geometry';

export class PlaneGeometry extends Geometry {

	/**
	 * @param [width=1] — Width of the sides on the X axis.
	 * @param [height=1] — Height of the sides on the Y axis.
	 * @param [widthSegments=1] — Number of segmented faces along the width of the sides.
	 * @param [heightSegments=1] — Number of segmented faces along the height of the sides.
	 */
	constructor(
		width?: number,
		height?: number,
		widthSegments?: number,
		heightSegments?: number
	);

	/**
	 * @default 'PlaneGeometry'
	 */
	type: string;

	parameters: {
		width: number;
		height: number;
		widthSegments: number;
		heightSegments: number;
	};

}
