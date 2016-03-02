/**
 * @author Mugen87 / https://github.com/Mugen87
 */

THREE.CylinderBufferGeometry = function ( radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength ) {

	THREE.BufferGeometry.call( this );

	this.type = 'CylinderBufferGeometry';

	this.parameters = {
		radiusTop: radiusTop,
		radiusBottom: radiusBottom,
		height: height,
		radialSegments: radialSegments,
		heightSegments: heightSegments,
		openEnded: openEnded,
		thetaStart: thetaStart,
		thetaLength: thetaLength
	};

	radiusTop = radiusTop !== undefined ? radiusTop : 20;
	radiusBottom = radiusBottom !== undefined ? radiusBottom : 20;
	height = height !== undefined ? height : 100;

	radialSegments = Math.floor( radialSegments )  || 8;
	heightSegments = Math.floor( heightSegments ) || 1;

	openEnded = openEnded !== undefined ? openEnded : false;
	thetaStart = thetaStart !== undefined ? thetaStart : 0;
	thetaLength = thetaLength !== undefined ? thetaLength : 2 * Math.PI;

	// used to calculate buffer length

	var vertexCount = calculateVertexCount();
	var indexCount = calculateIndexCount();

	// buffers

	var indices = new THREE.BufferAttribute( new ( indexCount > 65535 ? Uint32Array : Uint16Array )( indexCount ) , 1 );
	var vertices = new THREE.BufferAttribute( new Float32Array( vertexCount * 3 ), 3 );
	var normals = new THREE.BufferAttribute( new Float32Array( vertexCount * 3 ), 3 );
	var uvs = new THREE.BufferAttribute( new Float32Array( vertexCount * 2 ), 2 );

	// helper variables

	var index = 0, indexOffset = 0, indexArray = [], halfHeight = height / 2;

	// generate geometry

	generateTorso();

	if( openEnded === false ) {

		if( radiusTop > 0 ) {

			generateCap( true );

		}

		if( radiusBottom > 0 ) {

			generateCap( false );

		}

	}

	// build geometry

	this.setIndex( indices );
	this.addAttribute( 'position', vertices );
	this.addAttribute( 'normal', normals );
	this.addAttribute( 'uv', uvs );

	// helper functions

	function calculateVertexCount () {

		var count = ( radialSegments + 1 ) * ( heightSegments + 1 );

		if ( openEnded === false ) {

			count += ( ( radialSegments + 1 ) * 2 ) + ( radialSegments * 2 );

		}

		return count;

	}

	function calculateIndexCount () {

		var count = radialSegments * heightSegments * 2 * 3;

		if ( openEnded === false ) {

			count += radialSegments * 2 * 3;

		}

		return count;

	}

	function generateTorso () {

		var x, y;
		var normal = new THREE.Vector3();
		var vertex = new THREE.Vector3();

		// this will be used to calculate the normal
		var tanTheta = ( radiusBottom - radiusTop ) / height;

		// generate vertices, normals and uvs

		for ( y = 0; y <= heightSegments; y ++ ) {

			var indexRow = [];

			var v = y / heightSegments;

			// calculate the radius of the current row
			var radius = v * ( radiusBottom - radiusTop ) + radiusTop;

			for ( x = 0; x <= radialSegments; x ++ ) {

				var u = x / radialSegments;

				// vertex
				vertex.x = radius * Math.sin( u * thetaLength + thetaStart );
				vertex.y = - v * height + halfHeight;
				vertex.z = radius * Math.cos( u * thetaLength + thetaStart );
				vertices.setXYZ( index, vertex.x, vertex.y, vertex.z );

				// normal
				normal.copy( vertex );
				normal.setY( Math.sqrt( normal.x * normal.x + normal.z * normal.z ) * tanTheta ).normalize();
				normals.setXYZ( index, normal.x, normal.y, normal.z );

				// uv
				uvs.setXY( index, u, 1 - v );

				// save index of vertex in respective row
				indexRow.push( index );

				// increase index
				index ++;

			}

			// now save vertices of the row in our index array
			indexArray.push( indexRow );

		}

		// generate indices

		for ( x = 0; x < radialSegments; x ++ ) {

			for ( y = 0; y < heightSegments; y ++ ) {

				// we use the index array to access the correct indices
				var i1 = indexArray[ y ][ x ];
				var i2 = indexArray[ y + 1 ][ x ];
				var i3 = indexArray[ y + 1 ][ x + 1 ];
				var i4 = indexArray[ y ][ x + 1 ];

				// face one
				indices.setX( indexOffset, i1 ); indexOffset++;
				indices.setX( indexOffset, i2 ); indexOffset++;
				indices.setX( indexOffset, i4 ); indexOffset++;

				// face two
				indices.setX( indexOffset, i2 ); indexOffset++;
				indices.setX( indexOffset, i3 ); indexOffset++;
				indices.setX( indexOffset, i4 ); indexOffset++;

			}

		}

	}

	function generateCap ( top ) {

		var x, centerIndexStart, centerIndexEnd;
		var uv = new THREE.Vector2();
		var vertex = new THREE.Vector3();

		var radius = ( top === true ) ? radiusTop : radiusBottom;
		var sign = ( top === true ) ? 1 : - 1;

		// save the index of the first center vertex
		centerIndexStart = index;

		// first we generate the center vertex data of the cap.
		// because the geometry needs one set of uvs per face,
		// we must generate a center vertex per face/segment

		for ( x = 1; x <= radialSegments; x ++ ) {

			// vertex
			vertices.setXYZ( index, 0, halfHeight * sign, 0 );

			// normal
			normals.setXYZ( index, 0, sign, 0 );

			// uv
			if( top === true ) {

				uv.x = x / radialSegments;
				uv.y = 0;

			} else {

				uv.x = ( x - 1 ) / radialSegments;
				uv.y = 1;

			}

			uvs.setXY( index, uv.x, uv.y );

			// increase index
			index++;

		}

		// save the index of the last center vertex
		centerIndexEnd = index;

		// now we generate the surrounding vertices, normals and uvs

		for ( x = 0; x <= radialSegments; x ++ ) {

			var u = x / radialSegments;

			// vertex
			vertex.x = radius * Math.sin( u * thetaLength + thetaStart );
			vertex.y = halfHeight * sign;
			vertex.z = radius * Math.cos( u * thetaLength + thetaStart );
			vertices.setXYZ( index, vertex.x, vertex.y, vertex.z );

			// normal
			normals.setXYZ( index, 0, sign, 0 );

			// uv
			uvs.setXY( index, u, ( top === true ) ? 1 : 0 );

			// increase index
			index ++;

		}

		// generate indices

		for ( x = 0; x < radialSegments; x ++ ) {

			var c = centerIndexStart + x;
			var i = centerIndexEnd + x;

			if( top === true ) {

				// face top
				indices.setX( indexOffset, i ); indexOffset++;
				indices.setX( indexOffset, i + 1 ); indexOffset++;
				indices.setX( indexOffset, c ); indexOffset++;

			} else {

				// face bottom
				indices.setX( indexOffset, i + 1); indexOffset++;
				indices.setX( indexOffset, i ); indexOffset++;
				indices.setX( indexOffset, c ); indexOffset++;

			}

		}

	}

};

THREE.CylinderBufferGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
THREE.CylinderBufferGeometry.prototype.constructor = THREE.CylinderBufferGeometry;
