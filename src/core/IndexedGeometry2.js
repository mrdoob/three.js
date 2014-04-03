/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.IndexedGeometry2 = function ( indices, vertices, normals, uvs ) {

	THREE.BufferGeometry.call( this );

	this.attributes[ 'index' ] = { array: indices, itemSize: 1 };
	this.attributes[ 'position' ] = { array: vertices, itemSize: 3 };
	this.attributes[ 'normal' ] = { array: normals, itemSize: 3 };
	this.attributes[ 'uv' ] = { array: uvs, itemSize: 2 };	

};

THREE.IndexedGeometry2.prototype = Object.create( THREE.BufferGeometry.prototype );
