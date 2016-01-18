/**
 * @author astrodud / http://astrodud.isgreat.org/
 * @author zz85 / https://github.com/zz85
 * @author bhouston / http://clara.io
 */

// points - to create a closed torus, one must use a set of points
//    like so: [ a, b, c, d, a ], see first is the same as last.
// segments - the number of circumference segments to create
// phiStart - the starting radian
// phiLength - the radian (0 to 2*PI) range of the lathed section
//    2*pi is a closed lathe, less than 2PI is a portion.
// axe - the axis of revolution ('X', 'Y' or 'Z')

THREE.LatheGeometry = function( points, segments, phiStart, phiLength, axe ) {

	var thePoints = points;
	if ( points.length && points[ 0 ] instanceof THREE.Vector3 ) {

		console.warn( 'THREE.LatheGeometry has been updated. Use an array of THREE.Vector2 as first parameter.' );

		thePoints = [];
		axe = 'Z';
		for ( var i = 0; i < points.length; i ++ ) {

			var pt = points[ i ];
			thePoints.push( new THREE.Vector2( Math.sqrt( pt.x * pt.x + pt.y * pt.y ), pt.z ) );

		}

	}

	THREE.Geometry.call( this );

	this.type = 'LatheGeometry';

	this.parameters = {
		points: thePoints,
		segments: segments,
		phiStart: phiStart,
		phiLength: phiLength,
		axe: axe
	};

	segments = segments || 12;
	phiStart = phiStart || 0;
	phiLength = phiLength || 2 * Math.PI;
	axe = axe || 'Y';

	var inversePointLength = 1.0 / ( thePoints.length - 1 );
	var inverseSegments = 1.0 / segments;

	for ( var i = 0, il = segments; i <= il; i ++ ) {

		var phi = phiStart + i * inverseSegments * phiLength;

		var c = Math.cos( phi ),
			s = Math.sin( phi );

		for ( var j = 0, jl = thePoints.length; j < jl; j ++ ) {

			var pt = thePoints[ j ];

			var vertex = new THREE.Vector3();

			if ( axe === 'Z' ) {

				vertex.x = c * pt.x;
				vertex.y = s * pt.x;
				vertex.z = pt.y;

			} else if ( axe === 'X' ) {

				vertex.y = c * pt.x;
				vertex.z = s * pt.x;
				vertex.x = pt.y;

			} else {

				vertex.z = c * pt.x;
				vertex.x = s * pt.x;
				vertex.y = pt.y;

			}

			this.vertices.push( vertex );

		}

	}

	var np = thePoints.length;

	for ( var i = 0, il = segments; i < il; i ++ ) {

		for ( var j = 0, jl = thePoints.length - 1; j < jl; j ++ ) {

			var base = j + np * i;
			var a = base;
			var b = base + np;
			var c = base + 1 + np;
			var d = base + 1;

			var u0 = i * inverseSegments;
			var v0 = j * inversePointLength;
			var u1 = u0 + inverseSegments;
			var v1 = v0 + inversePointLength;

			this.faces.push( new THREE.Face3( a, b, d ) );

			this.faceVertexUvs[ 0 ].push( [

				new THREE.Vector2( u0, v0 ),
				new THREE.Vector2( u1, v0 ),
				new THREE.Vector2( u0, v1 )

			] );

			this.faces.push( new THREE.Face3( b, c, d ) );

			this.faceVertexUvs[ 0 ].push( [

				new THREE.Vector2( u1, v0 ),
				new THREE.Vector2( u1, v1 ),
				new THREE.Vector2( u0, v1 )

			] );


		}

	}

	this.mergeVertices();
	this.computeFaceNormals();
	this.computeVertexNormals();

};

THREE.LatheGeometry.prototype = Object.create( THREE.Geometry.prototype );
THREE.LatheGeometry.prototype.constructor = THREE.LatheGeometry;
