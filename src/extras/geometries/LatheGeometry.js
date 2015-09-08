/**
 * @author astrodud / http://astrodud.isgreat.org/
 * @author zz85 / https://github.com/zz85
 * @author bhouston / http://exocortex.com
 */

// points - to create a closed torus, one must use a set of points 
//    like so: [ a, b, c, d, a ], see first is the same as last.
// segments - the number of circumference segments to create
// phiStart - the starting radian
// phiLength - the radian (0 to 2*PI) range of the lathed section
//    2*pi is a closed lathe, less than 2PI is a portion.

module.exports = LatheGeometry;

var Face3 = require( "../../core/Face3" ),
	Geometry = require( "../../core/Geometry" ),
	Vector2 = require( "../../math/Vector2" ),
	Vector3 = require( "../../math/Vector3" );

function LatheGeometry( points, segments, phiStart, phiLength ) {

	Geometry.call( this );

	this.type = "LatheGeometry";

	this.parameters = {
		points: points,
		segments: segments,
		phiStart: phiStart,
		phiLength: phiLength
	};

	segments = segments || 12;
	phiStart = phiStart || 0;
	phiLength = phiLength || 2 * Math.PI;

	var inversePointLength = 1.0 / ( points.length - 1 );
	var inverseSegments = 1.0 / segments;

	var s, i, j, il, jl,
		phi, pt, vertex,
		np, base,
		a, b, c, d,
		u0, v0, u1, v1;

	for ( i = 0, il = segments; i <= il; i ++ ) {

		phi = phiStart + i * inverseSegments * phiLength;

		c = Math.cos( phi );
		s = Math.sin( phi );

		for ( j = 0, jl = points.length; j < jl; j ++ ) {

			pt = points[ j ];

			vertex = new Vector3();

			vertex.x = c * pt.x - s * pt.y;
			vertex.y = s * pt.x + c * pt.y;
			vertex.z = pt.z;

			this.vertices.push( vertex );

		}

	}

	np = points.length;

	for ( i = 0, il = segments; i < il; i ++ ) {

		for ( j = 0, jl = points.length - 1; j < jl; j ++ ) {

			base = j + np * i;
			a = base;
			b = base + np;
			c = base + 1 + np;
			d = base + 1;

			u0 = i * inverseSegments;
			v0 = j * inversePointLength;
			u1 = u0 + inverseSegments;
			v1 = v0 + inversePointLength;

			this.faces.push( new Face3( a, b, d ) );

			this.faceVertexUvs[ 0 ].push( [

				new Vector2( u0, v0 ),
				new Vector2( u1, v0 ),
				new Vector2( u0, v1 )

			] );

			this.faces.push( new Face3( b, c, d ) );

			this.faceVertexUvs[ 0 ].push( [

				new Vector2( u1, v0 ),
				new Vector2( u1, v1 ),
				new Vector2( u0, v1 )

			] );

		}

	}

	this.mergeVertices();
	this.computeFaceNormals();
	this.computeVertexNormals();

}

LatheGeometry.prototype = Object.create( Geometry.prototype );
LatheGeometry.prototype.constructor = LatheGeometry;
