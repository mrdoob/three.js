import { PolyhedronGeometry } from './PolyhedronGeometry.js';

/**
 * A geometry class for representing an octahedron.
 *
 * ```js
 * const geometry = new THREE.OctahedronGeometry();
 * const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
 * const octahedron = new THREE.Mesh( geometry, material );
 * scene.add( octahedron );
 * ```
 *
 * @augments PolyhedronGeometry
 */
class OctahedronGeometry extends PolyhedronGeometry {

	/**
	 * Constructs a new octahedron geometry.
	 *
	 * @param {number} [radius=1] - Radius of the octahedron.
	 * @param {number} [detail=0] - Setting this to a value greater than `0` adds vertices making it no longer a octahedron.
	 */
	constructor( radius = 1, detail = 0 ) {

		const vertices = [
			1, 0, 0, 	- 1, 0, 0,	0, 1, 0,
			0, - 1, 0, 	0, 0, 1,	0, 0, - 1
		];

		const indices = [
			0, 2, 4,	0, 4, 3,	0, 3, 5,
			0, 5, 2,	1, 2, 5,	1, 5, 3,
			1, 3, 4,	1, 4, 2
		];

		super( vertices, indices, radius, detail );

		this.type = 'OctahedronGeometry';

		/**
		 * Holds the constructor parameters that have been
		 * used to generate the geometry. Any modification
		 * after instantiation does not change the geometry.
		 *
		 * @type {Object}
		 */
		this.parameters = {
			radius: radius,
			detail: detail
		};

	}

	/**
	 * Factory method for creating an instance of this class from the given
	 * JSON object.
	 *
	 * @param {Object} data - A JSON object representing the serialized geometry.
	 * @return {OctahedronGeometry} A new instance.
	 */
	static fromJSON( data ) {

		return new OctahedronGeometry( data.radius, data.detail );

	}

}

export { OctahedronGeometry };
