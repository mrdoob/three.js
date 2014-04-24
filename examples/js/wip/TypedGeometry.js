/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.TypedGeometry = function ( size ) {

	THREE.BufferGeometry.call( this );

	if ( size !== undefined ) {

		this.vertices = new Float32Array( size * 3 * 3 );
		this.normals = new Float32Array( size * 3 * 3 );
		this.uvs = new Float32Array( size * 3 * 2 );

		this.attributes[ 'position' ] = { array: this.vertices, itemSize: 3 };
		this.attributes[ 'normal' ] = { array: this.normals, itemSize: 3 };
		this.attributes[ 'uv' ] = { array: this.uvs, itemSize: 2 };

	}

};

THREE.TypedGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );

THREE.TypedGeometry.prototype.setArrays = function ( vertices, normals, uvs ) {

	this.vertices = vertices;
	this.normals = normals;
	this.uvs = uvs;

	this.attributes[ 'position' ] = { array: vertices, itemSize: 3 };
	this.attributes[ 'normal' ] = { array: normals, itemSize: 3 };
	this.attributes[ 'uv' ] = { array: uvs, itemSize: 2 };

	return this;

};

THREE.TypedGeometry.prototype.merge = ( function () {

	var offset = 0;
	var normalMatrix = new THREE.Matrix3();

	return function ( geometry, matrix, startOffset ) {

		if ( startOffset !== undefined ) offset = startOffset;

		var offset2 = offset * 2;
		var offset3 = offset * 3;

		var vertices = this.attributes[ 'position' ].array;
		var normals = this.attributes[ 'normal' ].array;
		var uvs = this.attributes[ 'uv' ].array;

		if ( geometry instanceof THREE.TypedGeometry ) {

			var vertices2 = geometry.attributes[ 'position' ].array;
			var normals2 = geometry.attributes[ 'normal' ].array;
			var uvs2 = geometry.attributes[ 'uv' ].array;

			for ( var i = 0, l = vertices2.length; i < l; i += 3 ) {

				vertices[ i + offset3     ] = vertices2[ i     ];
				vertices[ i + offset3 + 1 ] = vertices2[ i + 1 ];
				vertices[ i + offset3 + 2 ] = vertices2[ i + 2 ];

				normals[ i + offset3     ] = normals2[ i     ];
				normals[ i + offset3 + 1 ] = normals2[ i + 1 ];
				normals[ i + offset3 + 2 ] = normals2[ i + 2 ];

				uvs[ i + offset2     ] = uvs2[ i     ];
				uvs[ i + offset2 + 1 ] = uvs2[ i + 1 ];

			}

		} else if ( geometry instanceof THREE.IndexedTypedGeometry ) {

			var indices2 = geometry.attributes[ 'index' ].array;
			var vertices2 = geometry.attributes[ 'position' ].array;
			var normals2 = geometry.attributes[ 'normal' ].array;
			var uvs2 = geometry.attributes[ 'uv' ].array;

			for ( var i = 0, l = indices2.length; i < l; i ++ ) {

				var index = indices2[ i ];

				var index3 = index * 3;
				var i3 = i * 3;

				vertices[ i3 + offset3 ] = vertices2[ index3 ];
				vertices[ i3 + offset3 + 1 ] = vertices2[ index3 + 1 ];
				vertices[ i3 + offset3 + 2 ] = vertices2[ index3 + 2 ];

				normals[ i3 + offset3 ] = normals2[ index3 ];
				normals[ i3 + offset3 + 1 ] = normals2[ index3 + 1 ];
				normals[ i3 + offset3 + 2 ] = normals2[ index3 + 2 ];

				var index2 = index * 2;
				var i2 = i * 2;

				uvs[ i2 + offset2 ] = uvs2[ index2 ];
				uvs[ i2 + offset2 + 1 ] = uvs2[ index2 + 1 ];

			}

			if ( matrix !== undefined ) {

				matrix.applyToVector3Array( vertices, offset3, indices2.length * 3 );

				normalMatrix.getNormalMatrix( matrix );
				normalMatrix.applyToVector3Array( normals, offset3, indices2.length * 3 );

			}

			offset += indices2.length;

		}

	};

} )();