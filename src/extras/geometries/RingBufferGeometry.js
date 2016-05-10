/**
 * @author Mugen87 / https://github.com/Mugen87
 */

THREE.RingBufferGeometry = function ( innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength ) {

	THREE.BufferGeometry.call( this );

	this.type = 'RingBufferGeometry';

	this.parameters = {
		innerRadius: innerRadius,
		outerRadius: outerRadius,
		thetaSegments: thetaSegments,
		phiSegments: phiSegments,
		thetaStart: thetaStart,
		thetaLength: thetaLength
	};

	innerRadius = innerRadius || 20;
	outerRadius = outerRadius || 50;

	thetaStart = thetaStart !== undefined ? thetaStart : 0;
	thetaLength = thetaLength !== undefined ? thetaLength : Math.PI * 2;

	thetaSegments = thetaSegments !== undefined ? Math.max( 3, thetaSegments ) : 8;
	phiSegments = phiSegments !== undefined ? Math.max( 1, phiSegments ) : 1;

	// these are used to calculate buffer length
	var vertexCount = ( thetaSegments + 1 ) * ( phiSegments + 1 );
	var indexCount = thetaSegments * phiSegments * 2 * 3;

	// buffers
	var indices = new THREE.BufferAttribute( new ( indexCount > 65535 ? Uint32Array : Uint16Array )( indexCount ) , 1 );
	var vertices = new THREE.BufferAttribute( new Float32Array( vertexCount * 3 ), 3 );
	var normals = new THREE.BufferAttribute( new Float32Array( vertexCount * 3 ), 3 );
	var uvs = new THREE.BufferAttribute( new Float32Array( vertexCount * 2 ), 2 );

	// some helper variables
	var index = 0, indexOffset = 0, segment;
	var radius = innerRadius;
	var radiusStep = ( ( outerRadius - innerRadius ) / phiSegments );
	var vertex = new THREE.Vector3();
	var uv = new THREE.Vector2();
	var j, i;

	// generate vertices, normals and uvs

	// values are generate from the inside of the ring to the outside

	for ( j = 0; j <= phiSegments; j ++ ) {

		for ( i = 0; i <= thetaSegments; i ++ ) {

			segment = thetaStart + i / thetaSegments * thetaLength;

			// vertex
			vertex.x = radius * Math.cos( segment );
			vertex.y = radius * Math.sin( segment );
			vertices.setXYZ( index, vertex.x, vertex.y, vertex.z );

			// normal
			normals.setXYZ( index, 0, 0, 1 );

			// uv
			uv.x = ( vertex.x / outerRadius + 1 ) / 2;
			uv.y = ( vertex.y / outerRadius + 1 ) / 2;
			uvs.setXY( index, uv.x, uv.y );

			// increase index
			index++;

		}

		// increase the radius for next row of vertices
		radius += radiusStep;

	}

	// generate indices

	for ( j = 0; j < phiSegments; j ++ ) {

		var thetaSegmentLevel = j * ( thetaSegments + 1 );

		for ( i = 0; i < thetaSegments; i ++ ) {

			segment = i + thetaSegmentLevel;

			// indices
			var a = segment;
			var b = segment + thetaSegments + 1;
			var c = segment + thetaSegments + 2;
			var d = segment + 1;

			// face one
			indices.setX( indexOffset, a ); indexOffset++;
			indices.setX( indexOffset, b ); indexOffset++;
			indices.setX( indexOffset, c ); indexOffset++;

			// face two
			indices.setX( indexOffset, a ); indexOffset++;
			indices.setX( indexOffset, c ); indexOffset++;
			indices.setX( indexOffset, d ); indexOffset++;

		}

	}

	// build geometry

	this.setIndex( indices );
	this.addAttribute( 'position', vertices );
	this.addAttribute( 'normal', normals );
	this.addAttribute( 'uv', uvs );

};

THREE.RingBufferGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
THREE.RingBufferGeometry.prototype.constructor = THREE.RingBufferGeometry;
