/**
 * @author WestLangley / https://github.com/WestLangley
 * @author zz85 / https://github.com/zz85
 * @author miningold / https://github.com/miningold
 *
 * Modified from the TorusKnotGeometry by @oosmoxiecode
 *
 * Creates a tube which extrudes along a 3d spline
 *
 * Uses parallel transport frames as described in
 * http://www.cs.indiana.edu/pub/techreports/TR425.pdf
 */

THREE.TubeGeometry = function( path, segments, radius, segmentsRadius, closed, debug ) {

	THREE.Geometry.call( this );

	this.path = path;
	this.segments = segments || 64;
	this.radius = radius || 1;
	this.segmentsRadius = segmentsRadius || 8;
	this.closed = closed || false;
	if ( debug ) this.debug = new THREE.Object3D();

	this.grid = [];

	var scope = this,

		tangent,
		normal,
		binormal,

		numpoints = this.segments + 1,
		
		x, y, z,
		tx, ty, tz,
		u, v,

		cx, cy,
		pos, pos2 = new THREE.Vector3(),
		i, j,
		ip, jp,
		a, b, c, d,
		uva, uvb, uvc, uvd;

	var frames = new THREE.TubeGeometry.FrenetFrames(path, segments, closed),
		tangents = frames.tangents,
		normals = frames.normals,
		binormals = frames.binormals;

	// proxy internals
	this.tangents = tangents;
	this.normals = normals;
	this.binormals = binormals;

	
	function vert( x, y, z ) {

		return scope.vertices.push( new THREE.Vector3( x, y, z ) ) - 1;

	}




	// consruct the grid

	for ( i = 0; i < numpoints; i++ ) {

		this.grid[ i ] = [];

		u = i / ( numpoints - 1 );

		pos = path.getPointAt( u );

		tangent = tangents[ i ];
		normal = normals[ i ];
		binormal = binormals[ i ];

		if ( this.debug ) {

			this.debug.add(new THREE.ArrowHelper(tangent, pos, radius, 0x0000ff));	
			this.debug.add(new THREE.ArrowHelper(normal, pos, radius, 0xff0000));
			this.debug.add(new THREE.ArrowHelper(binormal, pos, radius, 0x00ff00));

		}

		for ( j = 0; j < this.segmentsRadius; j++ ) {

			v = j / this.segmentsRadius * 2 * Math.PI;

			cx = -this.radius * Math.cos( v ); // TODO: Hack: Negating it so it faces outside.
			cy = this.radius * Math.sin( v );

            pos2.copy( pos );
            pos2.x += cx * normal.x + cy * binormal.x;
            pos2.y += cx * normal.y + cy * binormal.y;
            pos2.z += cx * normal.z + cy * binormal.z;

            this.grid[ i ][ j ] = vert( pos2.x, pos2.y, pos2.z );

		}
	}


	// construct the mesh

	for ( i = 0; i < this.segments; i++ ) {

		for ( j = 0; j < this.segmentsRadius; j++ ) {

			ip = ( closed ) ? (i + 1) % this.segments : i + 1;
			jp = (j + 1) % this.segmentsRadius;

			a = this.grid[ i ][ j ];		// *** NOT NECESSARILY PLANAR ! ***
			b = this.grid[ ip ][ j ];
			c = this.grid[ ip ][ jp ];
			d = this.grid[ i ][ jp ];

			uva = new THREE.UV( i / this.segments, j / this.segmentsRadius );
			uvb = new THREE.UV( ( i + 1 ) / this.segments, j / this.segmentsRadius );
			uvc = new THREE.UV( ( i + 1 ) / this.segments, ( j + 1 ) / this.segmentsRadius );
			uvd = new THREE.UV( i / this.segments, ( j + 1 ) / this.segmentsRadius );

			this.faces.push( new THREE.Face4( a, b, c, d ) );
			this.faceVertexUvs[ 0 ].push( [ uva, uvb, uvc, uvd ] );

		}
	}

	this.computeCentroids();
	this.computeFaceNormals();
	this.computeVertexNormals();

};

THREE.TubeGeometry.prototype = Object.create( THREE.Geometry.prototype );


// For computing of Frenet frames, exposing the tangents, normals and binormals the spline
THREE.TubeGeometry.FrenetFrames = function(path, segments, closed) {

	var 
		tangent = new THREE.Vector3(),
		normal = new THREE.Vector3(),
		binormal = new THREE.Vector3(),

		tangents = [],
		normals = [],
		binormals = [],

		vec = new THREE.Vector3(),
		mat = new THREE.Matrix4(),

		numpoints = segments + 1,
		theta,
		epsilon = 0.0001,
		smallest,

		tx, ty, tz,
		i, u, v;


	// expose internals
	this.tangents = tangents;
	this.normals = normals;
	this.binormals = binormals;

	// compute the tangent vectors for each segment on the path

	for ( i = 0; i < numpoints; i++ ) {

		u = i / ( numpoints - 1 );

		tangents[ i ] = path.getTangentAt( u );
		tangents[ i ].normalize();

	}

	initialNormal3();

	function initialNormal1(lastBinormal) {
		// fixed start binormal. Has dangers of 0 vectors
		normals[ 0 ] = new THREE.Vector3();
		binormals[ 0 ] = new THREE.Vector3();
		if (lastBinormal===undefined) lastBinormal = new THREE.Vector3( 0, 0, 1 );
		normals[ 0 ].cross( lastBinormal, tangents[ 0 ] ).normalize();
		binormals[ 0 ].cross( tangents[ 0 ], normals[ 0 ] ).normalize();
	}

	function initialNormal2() {

		// This uses the Frenet-Serret formula for deriving binormal
		var t2 = path.getTangentAt( epsilon );

		normals[ 0 ] = new THREE.Vector3().sub( t2, tangents[ 0 ] ).normalize();
		binormals[ 0 ] = new THREE.Vector3().cross( tangents[ 0 ], normals[ 0 ] );

		normals[ 0 ].cross( binormals[ 0 ], tangents[ 0 ] ).normalize(); // last binormal x tangent
		binormals[ 0 ].cross( tangents[ 0 ], normals[ 0 ] ).normalize();

	}

	function initialNormal3() {
		// select an initial normal vector perpenicular to the first tangent vector,
		// and in the direction of the smallest tangent xyz component

		normals[ 0 ] = new THREE.Vector3();
		binormals[ 0 ] = new THREE.Vector3();
		smallest = Number.MAX_VALUE;
		tx = Math.abs( tangents[ 0 ].x );
		ty = Math.abs( tangents[ 0 ].y );
		tz = Math.abs( tangents[ 0 ].z );

		if ( tx <= smallest ) {
			smallest = tx;
			normal.set( 1, 0, 0 );
		}

		if ( ty <= smallest ) {
			smallest = ty;
			normal.set( 0, 1, 0 );
		}

		if ( tz <= smallest ) {
			normal.set( 0, 0, 1 );
		}

		vec.cross( tangents[ 0 ], normal ).normalize();

		normals[ 0 ].cross( tangents[ 0 ], vec );
		binormals[ 0 ].cross( tangents[ 0 ], normals[ 0 ] );
	}


	// compute the slowly-varying normal and binormal vectors for each segment on the path

	for ( i = 1; i < numpoints; i++ ) {

		normals[ i ] = normals[ i-1 ].clone();

		binormals[ i ] = binormals[ i-1 ].clone();

		vec.cross( tangents[ i-1 ], tangents[ i ] );

		if ( vec.length() > epsilon ) {

			vec.normalize();

			theta = Math.acos( tangents[ i-1 ].dot( tangents[ i ] ) );

			mat.makeRotationAxis( vec, theta ).multiplyVector3( normals[ i ] );

		}

		binormals[ i ].cross( tangents[ i ], normals[ i ] );

	}


	// if the curve is closed, postprocess the vectors so the first and last normal vectors are the same

	if ( closed ) {

		theta = Math.acos( normals[ 0 ].dot( normals[ numpoints-1 ] ) );
		theta /= ( numpoints - 1 );

		if ( tangents[ 0 ].dot( vec.cross( normals[ 0 ], normals[ numpoints-1 ] ) ) > 0 ) {

			theta = -theta;

		}

		for ( i = 1; i < numpoints; i++ ) {

			// twist a little...
			mat.makeRotationAxis( tangents[ i ], theta * i ).multiplyVector3( normals[ i ] );
			binormals[ i ].cross( tangents[ i ], normals[ i ] );

		}

	}
};
