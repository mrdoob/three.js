import { BufferGeometry } from '../core/BufferGeometry.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';
import { Vector3 } from '../math/Vector3.js';

/**
 * Can be used as a helper object to visualize a geometry as a wireframe.
 *
 * ```js
 * const geometry = new THREE.SphereGeometry();
 *
 * const wireframe = new THREE.WireframeGeometry( geometry );
 *
 * const line = new THREE.LineSegments( wireframe );
 * line.material.depthWrite = false;
 * line.material.opacity = 0.25;
 * line.material.transparent = true;
 *
 * scene.add( line );
 * ```
 *
 * Note: It is not yet possible to serialize/deserialize instances of this class.
 *
 * @augments BufferGeometry
 */
class WireframeGeometry extends BufferGeometry {

	/**
	 * Constructs a new wireframe geometry.
	 *
	 * @param {?BufferGeometry} [geometry=null] - The geometry.
	 */
	constructor( geometry = null ) {

		super();

		this.type = 'WireframeGeometry';

		/**
		 * Holds the constructor parameters that have been
		 * used to generate the geometry. Any modification
		 * after instantiation does not change the geometry.
		 *
		 * @type {Object}
		 */
		this.parameters = {
			geometry: geometry
		};

		if ( geometry !== null ) {

			// buffer

			const vertices = [];
			const edges = new Set();

			// helper variables

			const start = new Vector3();
			const end = new Vector3();

			if ( geometry.index !== null ) {

				// indexed BufferGeometry

				const position = geometry.attributes.position;
				const indices = geometry.index;
				let groups = geometry.groups;

				if ( groups.length === 0 ) {

					groups = [ { start: 0, count: indices.count, materialIndex: 0 } ];

				}

				// create a data structure that contains all edges without duplicates

				for ( let o = 0, ol = groups.length; o < ol; ++ o ) {

					const group = groups[ o ];

					const groupStart = group.start;
					const groupCount = group.count;

					for ( let i = groupStart, l = ( groupStart + groupCount ); i < l; i += 3 ) {

						for ( let j = 0; j < 3; j ++ ) {

							const index1 = indices.getX( i + j );
							const index2 = indices.getX( i + ( j + 1 ) % 3 );

							start.fromBufferAttribute( position, index1 );
							end.fromBufferAttribute( position, index2 );

							if ( isUniqueEdge( start, end, edges ) === true ) {

								vertices.push( start.x, start.y, start.z );
								vertices.push( end.x, end.y, end.z );

							}

						}

					}

				}

			} else {

				// non-indexed BufferGeometry

				const position = geometry.attributes.position;

				for ( let i = 0, l = ( position.count / 3 ); i < l; i ++ ) {

					for ( let j = 0; j < 3; j ++ ) {

						// three edges per triangle, an edge is represented as (index1, index2)
						// e.g. the first triangle has the following edges: (0,1),(1,2),(2,0)

						const index1 = 3 * i + j;
						const index2 = 3 * i + ( ( j + 1 ) % 3 );

						start.fromBufferAttribute( position, index1 );
						end.fromBufferAttribute( position, index2 );

						if ( isUniqueEdge( start, end, edges ) === true ) {

							vertices.push( start.x, start.y, start.z );
							vertices.push( end.x, end.y, end.z );

						}

					}

				}

			}

			// build geometry

			this.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );

		}

	}

	copy( source ) {

		super.copy( source );

		this.parameters = Object.assign( {}, source.parameters );

		return this;

	}

}

function isUniqueEdge( start, end, edges ) {

	const hash1 = `${start.x},${start.y},${start.z}-${end.x},${end.y},${end.z}`;
	const hash2 = `${end.x},${end.y},${end.z}-${start.x},${start.y},${start.z}`; // coincident edge

	if ( edges.has( hash1 ) === true || edges.has( hash2 ) === true ) {

		return false;

	} else {

		edges.add( hash1 );
		edges.add( hash2 );
		return true;

	}

}


export { WireframeGeometry };
