import { Line2NodeMaterial } from 'three/webgpu';

import { LineSegments2 } from './LineSegments2.js';
import { LineGeometry } from '../LineGeometry.js';

/**
 * A polyline drawn between vertices.
 *
 * This adds functionality beyond {@link Line}, like arbitrary line width and changing width to
 * be in world units.It extends {@link LineSegments2}, simplifying constructing segments from a
 * chain of points.
 *
 * This module can only be used with {@link WebGPURenderer}. When using {@link WebGLRenderer},
 * import the class from `lines/Line2.js`.
 *
 * @augments LineSegments2
 */
class Line2 extends LineSegments2 {

	/**
	 * Constructs a new wide line.
	 *
	 * @param {LineGeometry} [geometry] - The line geometry.
	 * @param {Line2NodeMaterial} [material] - The line material.
	 */
	constructor( geometry = new LineGeometry(), material = new Line2NodeMaterial( { color: Math.random() * 0xffffff } ) ) {

		super( geometry, material );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isLine2 = true;

		this.type = 'Line2';

	}

}

export { Line2 };
