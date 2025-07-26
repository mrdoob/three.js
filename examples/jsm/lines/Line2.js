import { LineSegments2 } from '../lines/LineSegments2.js';
import { LineGeometry } from '../lines/LineGeometry.js';
import { LineMaterial } from '../lines/LineMaterial.js';

/**
 * A polyline drawn between vertices.
 *
 * This adds functionality beyond {@link Line}, like arbitrary line width and changing width to
 * be in world units.It extends {@link LineSegments2}, simplifying constructing segments from a
 * chain of points.
 *
 * This module can only be used with {@link WebGLRenderer}. When using {@link WebGPURenderer},
 * import the class from `lines/webgpu/Line2.js`.
 *
 * ```js
 * const geometry = new LineGeometry();
 * geometry.setPositions( positions );
 * geometry.setColors( colors );
 *
 * const material = new LineMaterial( { linewidth: 5, vertexColors: true } };
 *
 * const line = new Line2( geometry, material );
 * scene.add( line );
 * ```
 *
 * @augments LineSegments2
 * @three_import import { Line2 } from 'three/addons/lines/Line2.js';
 */
class Line2 extends LineSegments2 {

	/**
	 * Constructs a new wide line.
	 *
	 * @param {LineGeometry} [geometry] - The line geometry.
	 * @param {LineMaterial} [material] - The line material.
	 */
	constructor( geometry = new LineGeometry(), material = new LineMaterial( { color: Math.random() * 0xffffff } ) ) {

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
