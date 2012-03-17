/**
 * @author WestLangley / https://github.com/WestLangley
 * @author zz85 / https://github.com/zz85
 * @author miningold / https://github.com/miningold
 *
 * Modified from the TorusKnotGeometry by @oosmoxiecode
 *
 * Creates a tube which extrudes along a 3d spline
 */

THREE.TubeGeometry = function( radius, segments, segmentsRadius, path, debug ) {

	THREE.Geometry.call( this );

	var scope = this;

	this.radius = radius || 40;
	this.segments = segments || 64;
	this.segmentsRadius = segmentsRadius || 8;
	this.grid = new Array( this.segments );
	this.path = path;

	if ( debug ) this.debug = new THREE.Object3D();

	var tang = new THREE.Vector3();
	var binormal = new THREE.Vector3();
	var normal = new THREE.Vector3();
	var pos = new THREE.Vector3();

	var epsilon = 0.001;

	var u, v;

	var p1, p2;
	var cx, cy;

	var oldB;

	for ( var i = 0; i < this.segments; ++ i ) {

		this.grid[ i ] = new Array( this.segmentsRadius );

		u = i / ( this.segments - 1 );

		pos = this.path.getPointAt( u );
		tang = this.path.getTangentAt( u );

		if ( oldB === undefined ) {

			// Method 1, random arbitrary vector
			// oldB = new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize();

			// Method 2, use a fixed start binormal. Has dangers of 0 vectors too.
			// oldB = new THREE.Vector3( 0, -1, 0 );

			// Method 3 - This uses the Frenet-Serret formula for deriving binormal

			var t1, t2;

			t1 = u - epsilon;
			if (t1 < 0) t1 = 0;
			t1 = this.path.getTangentAt( t1 );

			t2 = u + epsilon;
			if (t2 > 1) t2 = 1;
			t2 = this.path.getTangentAt( t2 );

			normal.sub( t2, t1 ).normalize();

			binormal.cross( tang, normal );
			oldB = binormal;

			if ( oldB.length() == 0 ) {

				// When binormal is a zero vector, we could brute force another vector ?
				// oldB.set( 1, 0, 0 );
				// if (normal.cross(oldB, tang).normalize().length()==0) {
				// 	oldB.set( 0, 1, 0 );
				// 	if (normal.cross(oldB, tang).normalize().length()==0) {
				// 		oldB.set( 0, 0, 1 );
				// 	}
				// }

				// Method 4 - Sets binormal direction in the smallest tangent xyz component

				var smallest = Number.MAX_VALUE;
				var x, y, z;

				var tx = Math.abs( tang.x );
				var ty = Math.abs( tang.y );
				var tz = Math.abs( tang.z );

				if ( tx <= smallest ) {

					smallest = tx;
					oldB.set( 1, 0, 0 );

				}

				if ( ty <= smallest ) {

					smallest = ty;
					oldB.set( 0, 1, 0 );

				}

				if ( tz <= smallest ) {

					oldB.set( 0, 0, 1 );

				}

			}

		}

		normal.cross( oldB, tang ).normalize();
		binormal.cross( tang, normal ).normalize();
		oldB = binormal;

		if ( this.debug ) {

			this.debug.add( new THREE.ArrowHelper( normal, pos, radius * 2, 0xff0000 ) );
			// this.debug.add(new THREE.ArrowHelper(binormal, pos, radius * 2, 0x00ff00));
			// this.debug.add(new THREE.ArrowHelper(tang, pos, radius * 2, 0x0000ff));

		}

		for ( var j = 0; j < this.segmentsRadius; ++ j ) {

			v = j / this.segmentsRadius * 2 * Math.PI;

			cx = -this.radius * Math.cos( v ); // TODO: Hack: Negating it so it faces outside.
			cy = this.radius * Math.sin( v );

            var pos2 = pos.clone();
            pos2.x += cx * normal.x + cy * binormal.x;
            pos2.y += cx * normal.y + cy * binormal.y;
            pos2.z += cx * normal.z + cy * binormal.z;

            this.grid[ i ][ j ] = vert( pos2.x, pos2.y, pos2.z );

		}

	}

	for ( var i = 0; i < this.segments -1; ++ i ) {

		for ( var j = 0; j < this.segmentsRadius; ++ j ) {

			var ip = ( i + 1 ) % this.segments;
			var jp = ( j + 1 ) % this.segmentsRadius;

			var a = this.grid[ i  ][ j ];
			var b = this.grid[ ip ][ j ];
			var c = this.grid[ ip ][ jp ];
			var d = this.grid[ i  ][ jp ];

			var uva = new THREE.UV( i / this.segments, j / this.segmentsRadius );
			var uvb = new THREE.UV( ( i + 1 ) / this.segments, j / this.segmentsRadius );
			var uvc = new THREE.UV( ( i + 1 ) / this.segments, ( j + 1 ) / this.segmentsRadius );
			var uvd = new THREE.UV( i / this.segments, ( j + 1 ) / this.segmentsRadius );

			this.faces.push( new THREE.Face4( a, b, c, d ) );
			this.faceVertexUvs[ 0 ].push( [ uva, uvb, uvc, uvd ] );

		}

	}

	this.computeCentroids();
	this.computeFaceNormals();
	this.computeVertexNormals();

	function vert( x, y, z ) {

		return scope.vertices.push( new THREE.Vertex( new THREE.Vector3( x, y, z ) ) ) - 1;

	}

};

THREE.TubeGeometry.prototype = new THREE.Geometry();
THREE.TubeGeometry.prototype.constructor = THREE.TubeGeometry;