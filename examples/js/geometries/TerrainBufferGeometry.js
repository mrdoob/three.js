/**
 * @author WestLangley / http://github.com/WestLangley
 */

THREE.TerrainBufferGeometry = function ( width, height, widthSegments, heightSegments ) {

	THREE.BufferGeometry.call( this );

	this.type = 'TerrainBufferGeometry';

	this.parameters = {
		width: width,
		height: height,
		widthSegments: widthSegments,
		heightSegments: heightSegments
	};

	var width_half = width / 2;
	var height_half = height / 2;

	var gridX = Math.floor( widthSegments ) || 1;
	var gridY = Math.floor( heightSegments ) || 1;

	var gridX1 = gridX + 1;
	var gridY1 = gridY + 1;

	var segment_width = width / gridX;
	var segment_height = height / gridY;

	var n_vertices = gridX1 * gridY1 + gridX * gridY;

	var vertices = new Float32Array( n_vertices * 3 );
	var normals = new Float32Array( n_vertices * 3 );
	var uvs = new Float32Array( n_vertices * 2 );

	var offset = 0;
	var offset2 = 0;

	// grid of cells

	for ( var iy = 0; iy < gridY1; iy ++ ) {

		var y = iy * segment_height - height_half;

		for ( var ix = 0; ix < gridX1; ix ++ ) {

			var x = ix * segment_width - width_half;

			vertices[ offset ] = x;
			vertices[ offset + 1 ] = - y;

			normals[ offset + 2 ] = 1;

			uvs[ offset2 ] = ix / gridX;
			uvs[ offset2 + 1 ] = 1 - ( iy / gridY );

			offset += 3;
			offset2 += 2;

		}

	}

	// cell centers

	for ( var iy = 0; iy < gridY; iy ++ ) {

		var y = ( iy + 0.5 ) * segment_height - height_half;

		for ( var ix = 0; ix < gridX; ix ++ ) {

			var x = ( ix + 0.5 ) * segment_width - width_half;

			vertices[ offset ] = x;
			vertices[ offset + 1 ] = - y;

			normals[ offset + 2 ] = 1;

			uvs[ offset2 ] = ( ix + 0.5 ) / gridX;
			uvs[ offset2 + 1 ] = 1 - ( ( iy + 0.5 ) / gridY );

			offset += 3;
			offset2 += 2;

		}

	}

	offset = 0;
	offset2 = gridX1 * gridY1;

	var indices = new ( ( vertices.length / 3 ) > 65535 ? Uint32Array : Uint16Array )( gridX * gridY * 12 );

	for ( var iy = 0; iy < gridY; iy ++ ) {

		for ( var ix = 0; ix < gridX; ix ++ ) {

			var a = ix + gridX1 * iy;
			var b = ix + gridX1 * ( iy + 1 );
			var c = ( ix + 1 ) + gridX1 * ( iy + 1 );
			var d = ( ix + 1 ) + gridX1 * iy;
			var e = offset2;

			indices[ offset ] = a;
			indices[ offset + 1 ] = b;
			indices[ offset + 2 ] = e;

			indices[ offset + 3 ] = b;
			indices[ offset + 4 ] = c;
			indices[ offset + 5 ] = e;

			indices[ offset + 6 ] = c;
			indices[ offset + 7 ] = d;
			indices[ offset + 8 ] = e;

			indices[ offset + 9 ] = d;
			indices[ offset + 10 ] = a;
			indices[ offset + 11 ] = e;

			offset += 12;
			offset2 ++;

		}

	}

	this.addAttribute( 'index', new THREE.BufferAttribute( indices, 1 ) );
	this.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
	this.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );
	this.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );

	this.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

};

THREE.TerrainBufferGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
THREE.TerrainBufferGeometry.prototype.constructor = THREE.TerrainBufferGeometry;

THREE.TerrainBufferGeometry.prototype.setElevation = function ( func ) {

	var position = this.attributes.position;

	for ( var index = 0; index < position.count; index ++ ) {

		var x = position.getX( index );
		var z = position.getZ( index );

		position.setY( index, func( x, z ) );

	}

	this.computeVertexNormals();

}

THREE.TerrainBufferGeometry.prototype.clone = function () {

	var geometry = new THREE.TerrainBufferGeometry(
		this.parameters.width,
		this.parameters.height,
		this.parameters.widthSegments,
		this.parameters.heightSegments
	);

	geometry.copy( this );

	return geometry;

};
