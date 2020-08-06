import { BufferGeometry } from '../core/BufferGeometry.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';
import { Vector3 } from '../math/Vector3.js';

function WireframeGeometry( geometry ) {

	BufferGeometry.call( this );

	this.type = 'WireframeGeometry';

	// buffer

	const vertices = [];

	// helper variables

	const edge = [ 0, 0 ], edges = {};
	const keys = [ 'a', 'b', 'c' ];

	// different logic for Geometry and BufferGeometry

	if ( geometry && geometry.isGeometry ) {

		// create a data structure that contains all edges without duplicates

		const faces = geometry.faces;

		for ( let i = 0, l = faces.length; i < l; i ++ ) {

			const face = faces[ i ];

			for ( let j = 0; j < 3; j ++ ) {

				const edge1 = face[ keys[ j ] ];
				const edge2 = face[ keys[ ( j + 1 ) % 3 ] ];
				edge[ 0 ] = Math.min( edge1, edge2 ); // sorting prevents duplicates
				edge[ 1 ] = Math.max( edge1, edge2 );

				const key = edge[ 0 ] + ',' + edge[ 1 ];

				if ( edges[ key ] === undefined ) {

					edges[ key ] = { index1: edge[ 0 ], index2: edge[ 1 ] };

				}

			}

		}

		// generate vertices

		for ( const key in edges ) {

			const e = edges[ key ];

			let vertex = geometry.vertices[ e.index1 ];
			vertices.push( vertex.x, vertex.y, vertex.z );

			vertex = geometry.vertices[ e.index2 ];
			vertices.push( vertex.x, vertex.y, vertex.z );

		}

	} else if ( geometry && geometry.isBufferGeometry ) {

		let vertex = new Vector3();

		if ( geometry.index !== null ) {

			// indexed BufferGeometry

			const position = geometry.attributes.position;
			const indices = geometry.index;
			let groups = geometry.groups;

			if ( groups.length === 0 ) {

				groups = [ { start: 0, count: indices.count, materialIndex: 0 } ];

			}

			// create a data structure that contains all eges without duplicates

			for ( let o = 0, ol = groups.length; o < ol; ++ o ) {

				const group = groups[ o ];

				const start = group.start;
				const count = group.count;

				for ( let i = start, l = ( start + count ); i < l; i += 3 ) {

					for ( let j = 0; j < 3; j ++ ) {

						const edge1 = indices.getX( i + j );
						const edge2 = indices.getX( i + ( j + 1 ) % 3 );
						edge[ 0 ] = Math.min( edge1, edge2 ); // sorting prevents duplicates
						edge[ 1 ] = Math.max( edge1, edge2 );

						const key = edge[ 0 ] + ',' + edge[ 1 ];

						if ( edges[ key ] === undefined ) {

							edges[ key ] = { index1: edge[ 0 ], index2: edge[ 1 ] };

						}

					}

				}

			}

			// generate vertices

			for ( const key in edges ) {

				const e = edges[ key ];

				vertex.fromBufferAttribute( position, e.index1 );
				vertices.push( vertex.x, vertex.y, vertex.z );

				vertex.fromBufferAttribute( position, e.index2 );
				vertices.push( vertex.x, vertex.y, vertex.z );

			}

		} else {

			// non-indexed BufferGeometry

			const position = geometry.attributes.position;

			for ( let i = 0, l = ( position.count / 3 ); i < l; i ++ ) {

				for ( let j = 0; j < 3; j ++ ) {

					// three edges per triangle, an edge is represented as (index1, index2)
					// e.g. the first triangle has the following edges: (0,1),(1,2),(2,0)

					const index1 = 3 * i + j;
					vertex.fromBufferAttribute( position, index1 );
					vertices.push( vertex.x, vertex.y, vertex.z );

					const index2 = 3 * i + ( ( j + 1 ) % 3 );
					vertex.fromBufferAttribute( position, index2 );
					vertices.push( vertex.x, vertex.y, vertex.z );

				}

			}

		}

	}

	// build geometry

	this.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );

}

WireframeGeometry.prototype = Object.create( BufferGeometry.prototype );
WireframeGeometry.prototype.constructor = WireframeGeometry;


export { WireframeGeometry };
