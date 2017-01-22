/**
 * @author clockworkgeek / https://github.com/clockworkgeek
 * @author timothypratley / https://github.com/timothypratley
 * @author WestLangley / http://github.com/WestLangley
*/

import { Geometry } from '../core/Geometry';

function PolyhedronGeometry( vertices, indices, radius, detail ) {

	Geometry.call( this );

	this.type = 'PolyhedronGeometry';

	this.parameters = {
		vertices: vertices,
		indices: indices,
		radius: radius,
		detail: detail
	};

	this.fromBufferGeometry( new PolyhedronBufferGeometry( vertices, indices, radius, detail ) );
	this.mergeVertices();

}

PolyhedronGeometry.prototype = Object.create( Geometry.prototype );
PolyhedronGeometry.prototype.constructor = PolyhedronGeometry;

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Float32BufferAttribute } from '../core/BufferAttribute';
import { BufferGeometry } from '../core/BufferGeometry';
import { Vector3 } from '../math/Vector3';
import { Vector2 } from '../math/Vector2';

function PolyhedronBufferGeometry( vertices, indices, radius, detail ) {

	BufferGeometry.call( this );

	this.type = 'PolyhedronBufferGeometry';

	this.parameters = {
		vertices: vertices,
		indices: indices,
		radius: radius,
		detail: detail
	};

	radius = radius || 1;
	detail = detail || 0;

	// default buffer data

	var vertexBuffer = [];
	var uvBuffer = [];

	// the subdivision creates the vertex buffer data

	subdivide( detail );

	// all vertices should lie on a conceptual sphere with a given radius

	appplyRadius( radius );

	// finally, create the uv data

	generateUVs();

	// build non-indexed geometry

	this.addAttribute( 'position', new Float32BufferAttribute( vertexBuffer, 3 ) );
	this.addAttribute( 'normal', new Float32BufferAttribute( vertexBuffer.slice(), 3 ) );
	this.addAttribute( 'uv', new Float32BufferAttribute( uvBuffer, 2 ) );
	this.normalizeNormals();

	// helper functions

	function subdivide( detail ) {

		var a = new Vector3();
		var b = new Vector3();
		var c = new Vector3();

		// iterate over all faces and apply a subdivison with the given detail value

		for ( var i = 0; i < indices.length; i += 3 ) {

			// get the vertices of the face

			getVertexByIndex( indices[ i + 0 ], a );
			getVertexByIndex( indices[ i + 1 ], b );
			getVertexByIndex( indices[ i + 2 ], c );

			// perform subdivision

			subdivideFace( a, b, c, detail );

		}

	}

	function subdivideFace( a, b, c, detail ) {

		var cols = Math.pow( 2, detail );

		// we use this multidimensional array as a data structure for creating the subdivision

		var v = [];

		var i, j;

		// construct all of the vertices for this subdivision

		for ( i = 0; i <= cols; i ++ ) {

			v[ i ] = [];

			var aj = a.clone().lerp( c, i / cols );
			var bj = b.clone().lerp( c, i / cols );

			var rows = cols - i;

			for ( j = 0; j <= rows; j ++ ) {

				if ( j === 0 && i === cols ) {

					v[ i ][ j ] = aj;

				} else {

					v[ i ][ j ] = aj.clone().lerp( bj, j / rows );

				}

			}

		}

		// construct all of the faces

		for ( i = 0; i < cols; i ++ ) {

			for ( j = 0; j < 2 * ( cols - i ) - 1; j ++ ) {

				var k = Math.floor( j / 2 );

				if ( j % 2 === 0 ) {

					pushVertex( v[ i ][ k + 1 ] );
					pushVertex( v[ i + 1 ][ k ] );
					pushVertex( v[ i ][ k ] );

				} else {

					pushVertex( v[ i ][ k + 1 ] );
					pushVertex( v[ i + 1 ][ k + 1 ] );
					pushVertex( v[ i + 1 ][ k ] );

				}

			}

		}

	}

	function appplyRadius( radius ) {

		var vertex = new Vector3();

		// iterate over the entire buffer and apply the radius to each vertex

		for ( var i = 0; i < vertexBuffer.length; i += 3 ) {

			vertex.x = vertexBuffer[ i + 0 ];
			vertex.y = vertexBuffer[ i + 1 ];
			vertex.z = vertexBuffer[ i + 2 ];

			vertex.normalize().multiplyScalar( radius );

			vertexBuffer[ i + 0 ] = vertex.x;
			vertexBuffer[ i + 1 ] = vertex.y;
			vertexBuffer[ i + 2 ] = vertex.z;

		}

	}

	function generateUVs() {

		var vertex = new Vector3();

		for ( var i = 0; i < vertexBuffer.length; i += 3 ) {

			vertex.x = vertexBuffer[ i + 0 ];
			vertex.y = vertexBuffer[ i + 1 ];
			vertex.z = vertexBuffer[ i + 2 ];

			var u = azimuth( vertex ) / 2 / Math.PI + 0.5;
			var v = inclination( vertex ) / Math.PI + 0.5;
			uvBuffer.push( u, 1 - v );

		}

		correctUVs();

		correctSeam();

	}

	function correctSeam() {

		// handle case when face straddles the seam, see #3269

		for ( var i = 0; i < uvBuffer.length; i += 6 ) {

			// uv data of a single face

			var x0 = uvBuffer[ i + 0 ];
			var x1 = uvBuffer[ i + 2 ];
			var x2 = uvBuffer[ i + 4 ];

			var max = Math.max( x0, x1, x2 );
			var min = Math.min( x0, x1, x2 );

			// 0.9 is somewhat arbitrary

			if ( max > 0.9 && min < 0.1 ) {

				if ( x0 < 0.2 ) uvBuffer[ i + 0 ] += 1;
				if ( x1 < 0.2 ) uvBuffer[ i + 2 ] += 1;
				if ( x2 < 0.2 ) uvBuffer[ i + 4 ] += 1;

			}

		}

	}

	function pushVertex( vertex ) {

		vertexBuffer.push( vertex.x, vertex.y, vertex.z );

	}

	function getVertexByIndex( index, vertex ) {

		var stride = index * 3;

		vertex.x = vertices[ stride + 0 ];
		vertex.y = vertices[ stride + 1 ];
		vertex.z = vertices[ stride + 2 ];

	}

	function correctUVs() {

		var a = new Vector3();
		var b = new Vector3();
		var c = new Vector3();

		var centroid = new Vector3();

		var uvA = new Vector2();
		var uvB = new Vector2();
		var uvC = new Vector2();

		for ( var i = 0, j = 0; i < vertexBuffer.length; i += 9, j += 6 ) {

			a.set( vertexBuffer[ i + 0 ], vertexBuffer[ i + 1 ], vertexBuffer[ i + 2 ] );
			b.set( vertexBuffer[ i + 3 ], vertexBuffer[ i + 4 ], vertexBuffer[ i + 5 ] );
			c.set( vertexBuffer[ i + 6 ], vertexBuffer[ i + 7 ], vertexBuffer[ i + 8 ] );

			uvA.set( uvBuffer[ j + 0 ], uvBuffer[ j + 1 ] );
			uvB.set( uvBuffer[ j + 2 ], uvBuffer[ j + 3 ] );
			uvC.set( uvBuffer[ j + 4 ], uvBuffer[ j + 5 ] );

			centroid.copy( a ).add( b ).add( c ).divideScalar( 3 );

			var azi = azimuth( centroid );

			correctUV( uvA, j + 0, a, azi );
			correctUV( uvB, j + 2, b, azi );
			correctUV( uvC, j + 4, c, azi );

		}

	}

	function correctUV( uv, stride, vector, azimuth ) {

		if ( ( azimuth < 0 ) && ( uv.x === 1 ) ) {

			uvBuffer[ stride ] = uv.x - 1;

		}

		if ( ( vector.x === 0 ) && ( vector.z === 0 ) ) {

			uvBuffer[ stride ] = azimuth / 2 / Math.PI + 0.5;

		}

	}

	// Angle around the Y axis, counter-clockwise when looking from above.

	function azimuth( vector ) {

		return Math.atan2( vector.z, - vector.x );

	}


	// Angle above the XZ plane.

	function inclination( vector ) {

		return Math.atan2( - vector.y, Math.sqrt( ( vector.x * vector.x ) + ( vector.z * vector.z ) ) );

	}

}

PolyhedronBufferGeometry.prototype = Object.create( BufferGeometry.prototype );
PolyhedronBufferGeometry.prototype.constructor = PolyhedronBufferGeometry;

export { PolyhedronGeometry, PolyhedronBufferGeometry };
