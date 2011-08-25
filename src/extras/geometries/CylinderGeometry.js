/**
 * @author kile / http://kile.stravaganza.org/
 * @author mr.doob / http://mrdoob.com/
 * @author fuzzthink
 */

THREE.CylinderGeometry = function ( numSegs, topRad, botRad, height, topOffset, botOffset ) {

	THREE.Geometry.call( this );

	var scope = this, i, PI2 = Math.PI * 2, halfHeight = height / 2;

	// Top circle vertices

	for ( i = 0; i < numSegs; i ++ ) {

		v( Math.sin( PI2 * i / numSegs ) * topRad, Math.cos( PI2 * i / numSegs ) * topRad, - halfHeight );

	}

	// Bottom circle vertices

	for ( i = 0; i < numSegs; i ++ ) {

		v( Math.sin( PI2 * i / numSegs ) * botRad, Math.cos( PI2 * i / numSegs ) * botRad, halfHeight );

	}

	// Body faces

	var na, nb, nc, nd;

	var nz = topRad - botRad;

	for ( i = 0; i < numSegs; i++ ) {

		na = new THREE.Vector3();
		na.copy( scope.vertices[ i ].position );
		na.z = nz;
		na.normalize();

		nb = new THREE.Vector3();
		nb.copy( scope.vertices[ i + numSegs ].position );
		nb.z = nz;
		nb.normalize();

		nc = new THREE.Vector3();
		nc.copy( scope.vertices[ numSegs + ( i + 1 ) % numSegs ].position );
		nc.z = nz;
		nc.normalize();

		nd = new THREE.Vector3();
		nd.copy( scope.vertices[ ( i + 1 ) % numSegs ].position );
		nd.z = nz;
		nd.normalize();

		f4n( i,
			 i + numSegs,
			 numSegs + ( i + 1 ) % numSegs,
			 ( i + 1 ) % numSegs,
			 na, nb, nc, nd
		);

	}

	// Bottom circle faces

	if ( botRad > 0 ) {

		var nbottom = new THREE.Vector3( 0, 0, -1 );

		v( 0, 0, - halfHeight - ( botOffset || 0 ) );

		for ( i = numSegs; i < numSegs + ( numSegs / 2 ); i++ ) {

			f4n( 2 * numSegs,
				 ( 2 * i - 2 * numSegs ) % numSegs,
				 ( 2 * i - 2 * numSegs + 1 ) % numSegs,
				 ( 2 * i - 2 * numSegs + 2 ) % numSegs,
				 nbottom, nbottom, nbottom, nbottom
			);


		}

	}

	// Top circle faces

	if ( topRad > 0 ) {

		var ntop = new THREE.Vector3( 0, 0, 1 );

		v( 0, 0, halfHeight + ( topOffset || 0 ) );

		for ( i = numSegs + ( numSegs / 2 ); i < 2 * numSegs; i ++ ) {

			f4n( 2 * numSegs + 1,
				 ( 2 * i - 2 * numSegs + 2 ) % numSegs + numSegs,
				 ( 2 * i - 2 * numSegs + 1 ) % numSegs + numSegs,
				 ( 2 * i - 2 * numSegs ) % numSegs + numSegs,
				 ntop, ntop, ntop, ntop
			);

		}

	}

	// Cylindrical mapping

	for ( var i = 0, il = this.faces.length; i < il; i ++ ) {

		var uvs = [], face = this.faces[ i ],
		a = this.vertices[ face.a ],
		b = this.vertices[ face.b ],
		c = this.vertices[ face.c ],
		d = this.vertices[ face.d ];

		uvs.push( new THREE.UV( 0.5 + Math.atan2( a.position.x, a.position.y ) / PI2, 0.5 + ( a.position.z / height ) ) );
		uvs.push( new THREE.UV( 0.5 + Math.atan2( b.position.x, b.position.y ) / PI2, 0.5 + ( b.position.z / height ) ) );
		uvs.push( new THREE.UV( 0.5 + Math.atan2( c.position.x, c.position.y ) / PI2, 0.5 + ( c.position.z / height ) ) );

		if ( face instanceof THREE.Face4 ) {

			uvs.push( new THREE.UV( 0.5 + ( Math.atan2( d.position.x, d.position.y ) / PI2 ), 0.5 + ( d.position.z / height ) ) );

		}

		this.faceVertexUvs[ 0 ].push( uvs );

	}

	this.computeCentroids();
	this.computeFaceNormals();

	function v( x, y, z ) {

		scope.vertices.push( new THREE.Vertex( new THREE.Vector3( x, y, z ) ) );

	}

	function f4n( a, b, c, d, na, nb, nc, nd ) {

		scope.faces.push( new THREE.Face4( a, b, c, d, [ na, nb, nc, nd ] ) );

	}

};

THREE.CylinderGeometry.prototype = new THREE.Geometry();
THREE.CylinderGeometry.prototype.constructor = THREE.CylinderGeometry;
