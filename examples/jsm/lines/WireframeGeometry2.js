import {
	WireframeGeometry
} from 'three';
import { LineSegmentsGeometry } from './LineSegmentsGeometry.js';

/**
 * A special type of line segments geometry intended for wireframe rendering.
 *
 * This is used in {@link Wireframe} to describe the shape.
 *
 * ```js
 * const geometry = new THREE.IcosahedronGeometry();
 * const wireframeGeometry = new WireframeGeometry2( geo );
 * ```
 *
 * @augments LineSegmentsGeometry
 * @three_import import { WireframeGeometry2 } from 'three/addons/lines/WireframeGeometry2.js';
 */
class WireframeGeometry2 extends LineSegmentsGeometry {

	/**
	 * Constructs a new wireframe geometry.
	 *
	 * @param {BufferGeometry} [geometry] - The geometry to render the wireframe for.
	 */
	constructor( geometry ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isWireframeGeometry2 = true;

		this.type = 'WireframeGeometry2';

		this.fromWireframeGeometry( new WireframeGeometry( geometry ) );

		// set colors, maybe

	}

}

export { WireframeGeometry2 };
