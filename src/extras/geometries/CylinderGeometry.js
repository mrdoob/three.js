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

	for ( i = 0; i < numSegs; i++ ) {

		f4(
			i,
			i + numSegs,
			numSegs + ( i + 1 ) % numSegs,
			( i + 1 ) % numSegs
		);

	}

	// Bottom circle faces

	if ( botRad > 0 ) {

		v( 0, 0, - halfHeight - ( botOffset || 0 ) );

		for ( i = numSegs; i < numSegs + ( numSegs / 2 ); i++ ) {

			f4(
				2 * numSegs,
				( 2 * i - 2 * numSegs ) % numSegs,
				( 2 * i - 2 * numSegs + 1 ) % numSegs,
				( 2 * i - 2 * numSegs + 2 ) % numSegs
			);

		}

	}

	// Top circle faces

	if ( topRad > 0 ) {

		v( 0, 0, halfHeight + ( topOffset || 0 ) );

		for ( i = numSegs + ( numSegs / 2 ); i < 2 * numSegs; i ++ ) {

			f4(
				2 * numSegs + 1,
				( 2 * i - 2 * numSegs + 2 ) % numSegs + numSegs,
				( 2 * i - 2 * numSegs + 1 ) % numSegs + numSegs,
				( 2 * i - 2 * numSegs ) % numSegs + numSegs
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
	// this.computeVertexNormals();

	function v( x, y, z ) {

		scope.vertices.push( new THREE.Vertex( new THREE.Vector3( x, y, z ) ) );

	}

	function f4( a, b, c, d ) {

		scope.faces.push( new THREE.Face4( a, b, c, d ) );

	}

};

THREE.CylinderGeometry.prototype = new THREE.Geometry();
THREE.CylinderGeometry.prototype.constructor = THREE.CylinderGeometry;
