import { Path } from '../extras/core/Path.js';
import { LatheGeometry } from './LatheGeometry.js';

/**
 * A geometry class for a capsule with given radii and height. It is constructed using a lathe.
 *
 * ```js
 * const geometry = new THREE.CapsuleGeometry( 1, 1, 4, 8 );
 * const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
 * const capsule = new THREE.Mesh( geometry, material );
 * scene.add( capsule );
 * ```
 *
 * @augments LatheGeometry
 */
class CapsuleGeometry extends LatheGeometry {

	/**
	 * Constructs a new capsule geometry.
	 *
	 * @param {number} [radius=1] - Radius of the capsule.
	 * @param {number} [length=1] - Length of the middle section.
	 * @param {number} [capSegments=4] - Number of curve segments used to build the caps.
	 * @param {number} [radialSegments=8] - Number of segmented faces around the circumference of the capsule.
	 * @param {number} [heightSegments=1] - Number of rows of faces along the height of the capsule.
	 */
	constructor( radius = 1, length = 1, capSegments = 4, radialSegments = 8, heightSegments = 1 ) {

		const path = new Path();
		path.absarc( 0, - length / 2, radius, Math.PI * 1.5, 0 );

		if ( heightSegments > 1 ) {

			for ( let i = 1; i < heightSegments; i ++ ) {

				const y = - length / 2 + ( length * i / heightSegments );

				path.lineTo( radius, y );

			}

		}

		path.absarc( 0, length / 2, radius, 0, Math.PI * 0.5 );

		super( path.getPoints( capSegments ), radialSegments );

		this.type = 'CapsuleGeometry';

		/**
		 * Holds the constructor parameters that have been
		 * used to generate the geometry. Any modification
		 * after instantiation does not change the geometry.
		 *
		 * @type {Object}
		 */
		this.parameters = {
			radius: radius,
			length: length,
			capSegments: capSegments,
			radialSegments: radialSegments,
			heightSegments: heightSegments,
		};

	}

	/**
	 * Factory method for creating an instance of this class from the given
	 * JSON object.
	 *
	 * @param {Object} data - A JSON object representing the serialized geometry.
	 * @return {CapsuleGeometry} A new instance.
	 */
	static fromJSON( data ) {

		return new CapsuleGeometry( data.radius, data.length, data.capSegments, data.radialSegments, data.heightSegments );

	}

}

export { CapsuleGeometry };
