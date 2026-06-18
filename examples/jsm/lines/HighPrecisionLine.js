import { Line } from 'three';

import { HighPrecisionLineGeometry } from './HighPrecisionLineGeometry.js';
import { HighPrecisionLineMaterial } from './HighPrecisionLineMaterial.js';

/**
 * A line object that renders using camera-relative
 * high precision coordinates.
 */
export class HighPrecisionLine extends Line {

	/**
	 * @param {HighPrecisionLineGeometry} [geometry]
	 * @param {HighPrecisionLineMaterial} [material]
	 */
	constructor(
		geometry = new HighPrecisionLineGeometry(),
		material = new HighPrecisionLineMaterial(),
	) {

		super( geometry, material );

		this.isHighPrecisionLine = true;
		this.type = 'HighPrecisionLine';

	}

}
