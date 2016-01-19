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
// mapping - the way V of UV is calculated.
//    'index',  V is calculated using the number of points (default value)
//    'length', V is calculated using the geometrical length of the
//              curve defined by points

THREE.LatheGeometry = function ( points, segments, phiStart, phiLength, mapping ) {

	THREE.Geometry.call( this );

	this.type = 'LatheGeometry';

	this.parameters = {
		points: points,
		segments: segments,
		phiStart: phiStart,
		phiLength: phiLength,
		mapping: mapping
	};

	segments = segments || 12;
	phiStart = phiStart || 0;
	phiLength = phiLength || 2 * Math.PI;
	mapping = mapping || 'index';

	var inversePointLength = 1.0 / ( points.length - 1 );
	var inverseSegments = 1.0 / segments;
	var Vs = [ 0 ];
	if ( mapping.toLowerCase() === 'length' ) {

		var length = 0;

		for ( var i = 1; i < points.length; i++) {

			var pt1 = points[ i - 1 ];
			var pt2 = points[ i ];
			var lgX = pt2.x - pt1.x;
			var lgY = pt2.y - pt1.y;
			length += Math.sqrt( lgX * lgX + lgY * lgY);
			Vs.push(length);

		}

		for ( var i = 1; i < points.length; i++) {

			Vs[ i ] /=  length;

		}
	} else {

		for ( var i = 1; i < points.length; i++) {

			Vs.push( i * inversePointLength );

		}

	}

	for ( var i = 0, il = segments; i <= il; i ++ ) {

		var phi = phiStart + i * inverseSegments * phiLength;

		var sin = Math.sin( phi );
		var cos = Math.cos( phi );

		for ( var j = 0, jl = points.length; j < jl; j ++ ) {

			var point = points[ j ];

			var vertex = new THREE.Vector3();

			vertex.x = point.x * cos;
			vertex.y = point.y;
			vertex.z = point.x * sin;

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
			var v0 = Vs[ j ];
			var u1 = u0 + inverseSegments;
			var v1 = Vs[ j + 1 ];

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
