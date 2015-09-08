/**
 * @author mrdoob / http://mrdoob.com/
 */

module.exports = WireframeGeometry;

var BufferAttribute = require( "../../core/BufferAttribute" ),
	BufferGeometry = require( "../../core/BufferGeometry" ),
	Geometry = require( "../../core/Geometry" );

function WireframeGeometry( geometry ) {

	BufferGeometry.call( this );

	var i, j, o, il, ol, l,
		start, count, coords, faces, face,
		numEdges, edges, numTris,
		drawcalls, drawcall,
		vertices, vertex, key,
		indices, index, index1, index2;

	var edge = [ 0, 0 ], hash = {};

	var sortFunction = function ( a, b ) {

		return a - b;

	};

	var keys = [ "a", "b", "c" ];

	if ( geometry instanceof Geometry ) {

		vertices = geometry.vertices;
		faces = geometry.faces;
		numEdges = 0;

		// allocate maximal size
		edges = new Uint32Array( 6 * faces.length );

		for ( i = 0, l = faces.length; i < l; i ++ ) {

			face = faces[ i ];

			for ( j = 0; j < 3; j ++ ) {

				edge[ 0 ] = face[ keys[ j ] ];
				edge[ 1 ] = face[ keys[ ( j + 1 ) % 3 ] ];
				edge.sort( sortFunction );

				key = edge.toString();

				if ( hash[ key ] === undefined ) {

					edges[ 2 * numEdges ] = edge[ 0 ];
					edges[ 2 * numEdges + 1 ] = edge[ 1 ];
					hash[ key ] = true;
					numEdges ++;

				}

			}

		}

		coords = new Float32Array( numEdges * 2 * 3 );

		for ( i = 0, l = numEdges; i < l; i ++ ) {

			for ( j = 0; j < 2; j ++ ) {

				vertex = vertices[ edges [ 2 * i + j ] ];

				index = 6 * i + 3 * j;
				coords[ index + 0 ] = vertex.x;
				coords[ index + 1 ] = vertex.y;
				coords[ index + 2 ] = vertex.z;

			}

		}

		this.addAttribute( "position", new BufferAttribute( coords, 3 ) );

	} else if ( geometry instanceof BufferGeometry ) {

		if ( geometry.index !== null ) {

			// Indexed BufferGeometry

			vertices = geometry.attributes.position;
			indices = geometry.attributes.index.array;
			drawcalls = geometry.drawcalls;
			numEdges = 0;

			if ( drawcalls.length === 0 ) {

				geometry.addDrawCall( 0, indices.length );

			}

			// allocate maximal size
			edges = new Uint32Array( 2 * indices.length );

			for ( o = 0, ol = drawcalls.length; o < ol; ++ o ) {

				drawcall = drawcalls[ o ];

				start = drawcall.start;
				count = drawcall.count;

				for ( i = start, il = start + count; i < il; i += 3 ) {

					for ( j = 0; j < 3; j ++ ) {

						edge[ 0 ] = indices[ i + j ];
						edge[ 1 ] = indices[ i + ( j + 1 ) % 3 ];
						edge.sort( sortFunction );

						key = edge.toString();

						if ( hash[ key ] === undefined ) {

							edges[ 2 * numEdges ] = edge[ 0 ];
							edges[ 2 * numEdges + 1 ] = edge[ 1 ];
							hash[ key ] = true;
							numEdges ++;

						}

					}

				}

			}

			coords = new Float32Array( numEdges * 2 * 3 );

			for ( i = 0, l = numEdges; i < l; i ++ ) {

				for ( j = 0; j < 2; j ++ ) {

					index = 6 * i + 3 * j;
					index2 = edges[ 2 * i + j ];

					coords[ index + 0 ] = vertices.getX( index2 );
					coords[ index + 1 ] = vertices.getY( index2 );
					coords[ index + 2 ] = vertices.getZ( index2 );

				}

			}

			this.addAttribute( "position", new BufferAttribute( coords, 3 ) );

		} else {

			// non-indexed BufferGeometry

			vertices = geometry.attributes.position.array;
			numEdges = vertices.length / 3;
			numTris = numEdges / 3;

			coords = new Float32Array( numEdges * 2 * 3 );

			for ( i = 0, l = numTris; i < l; i ++ ) {

				for ( j = 0; j < 3; j ++ ) {

					index = 18 * i + 6 * j;

					index1 = 9 * i + 3 * j;
					coords[ index + 0 ] = vertices[ index1 ];
					coords[ index + 1 ] = vertices[ index1 + 1 ];
					coords[ index + 2 ] = vertices[ index1 + 2 ];

					index2 = 9 * i + 3 * ( ( j + 1 ) % 3 );
					coords[ index + 3 ] = vertices[ index2 ];
					coords[ index + 4 ] = vertices[ index2 + 1 ];
					coords[ index + 5 ] = vertices[ index2 + 2 ];

				}

			}

			this.addAttribute( "position", new BufferAttribute( coords, 3 ) );

		}

	}

}

WireframeGeometry.prototype = Object.create( BufferGeometry.prototype );
WireframeGeometry.prototype.constructor = WireframeGeometry;
