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

	segments = segments || 12;
	phiStart = phiStart || 0;
	phiLength = phiLength ||  2 * Math.PI;

	var inversePointLength = 1.0 / points.length;
	var inverseSegments = 1.0 / segments;

	var matrix = new THREE.Matrix4();

	for ( var i = 0, il = segments; i <= il; i ++ ) {

		// simplify this to be cos/sin within the main loop, this matrix
		// is wasteful.
		var phi = phiStart + i * inverseSegments * phiLength;
		matrix.makeRotationZ( phi );
	
		for ( var j = 0, jl = points.length; j < jl; j ++ ) {

			this.vertices.push( matrix.multiplyVector3( points[ j ].clone() ) );

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

			this.faces.push( new THREE.Face4( a, b, c, d ) );

			var u0 = 1 - i * inverseSegments;
			var v0 = j * inversePointLength;
			var u1 = u0 + inverseSegments;
			var v1 = v0 + inversePointLength;

			this.faceVertexUvs[ 0 ].push( [

				new THREE.Vector2( u0, v0 ), 
				new THREE.Vector2( u1, v0 ),
				new THREE.Vector2( u1, v1 ),
				new THREE.Vector2( u0, v1 )

			] );

		}

	}

	this.computeCentroids();
	this.computeFaceNormals();
	this.computeVertexNormals();

};

THREE.LatheGeometry.prototype = Object.create( THREE.Geometry.prototype );
