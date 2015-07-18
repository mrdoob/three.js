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

THREE.LatheGeometry = function ( points, segments, phiStart, phiLength ) {

	THREE.Geometry.call( this );

	this.type = 'LatheGeometry';

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

	for ( var i = 0, il = segments; i <= il; i ++ ) {

		var phi = phiStart + i * inverseSegments * phiLength;

		var c = Math.cos( phi ),
			s = Math.sin( phi );

		for ( var j = 0, jl = points.length; j < jl; j ++ ) {

			var pt = points[ j ];

			var vertex = new THREE.Vector3();

			vertex.x = c * pt.x - s * pt.y;
			vertex.y = s * pt.x + c * pt.y;
			vertex.z = pt.z;

			this.vertices.push( vertex );

		}

	}

	var np = points.length;

	for ( var i = 0, il = segments; i < il; i ++ ) {

		for ( var j = 0, jl = points.length - 1; j < jl; j ++ ) {

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
