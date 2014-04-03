/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Geometry2 = function ( vertices, normals, uvs ) {

	THREE.BufferGeometry.call( this );

	this.attributes[ 'position' ] = { array: vertices, itemSize: 3 };
	this.attributes[ 'normal' ] = { array: normals, itemSize: 3 };
	this.attributes[ 'uv' ] = { array: uvs, itemSize: 2 };	

};

THREE.Geometry2.prototype = Object.create( THREE.BufferGeometry.prototype );

THREE.Geometry2.prototype.merge = function ( geometry, matrix, offset ) {

	if ( offset === undefined ) offset = 0;

	var vertices = this.attributes[ 'position' ].array;
	var normals = this.attributes[ 'normal' ].array;
	var uvs = this.attributes[ 'uv' ].array;

	if ( geometry instanceof THREE.Geometry2 ) {

		var vertices2 = geometry.attributes[ 'position' ].array;
		var normals2 = geometry.attributes[ 'normal' ].array;
		var uvs2 = geometry.attributes[ 'uv' ].array;

		for ( var i = 0, l = vertices2.length; i < l; i ++ ) {

			vertices[ i + offset ] = vertices2[ i ];
			normals[ i + offset ] = normals2[ i ];
			uvs[ i + offset ] = uvs2[ i ];

		}

	}

};