/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Mesh = function ( geometry, material, normUVs ) {

	THREE.Object3D.call( this );

	this.geometry = geometry;
	this.material = material instanceof Array ? material : [ material ];

	this.flipSided = false;
	this.doubleSided = false;

	this.overdraw = false;

	this.materialFaceGroup = {};
	this.sortFacesByMaterial();
	if( normUVs ) this.normalizeUVs();

	this.geometry.computeBoundingBox();

};

THREE.Mesh.prototype = new THREE.Object3D();
THREE.Mesh.prototype.constructor = THREE.Mesh;

THREE.Mesh.prototype.sortFacesByMaterial = function () {

	// TODO
	// Should optimize by grouping faces with ColorFill / ColorStroke materials
	// which could then use vertex color attributes instead of each being
	// in its separate VBO

	var i, l, f, fl, face, material, hash_array;

	function materialHash( material ) {

		hash_array = [];

		for ( i = 0, l = material.length; i < l; i++ ) {

			if ( material[ i ] == undefined ) {

				hash_array.push( "undefined" );

			} else {

				hash_array.push( material[ i ].toString() );

			}

		}

		return hash_array.join("_");

	}

	for ( f = 0, fl = this.geometry.faces.length; f < fl; f++ ) {

		face = this.geometry.faces[ f ];
		material = face.material;

		hash = materialHash( material);

		if ( this.materialFaceGroup[ hash ] == undefined ) {

			this.materialFaceGroup[ hash ] = { 'faces': [], 'material': material };

		}

		this.materialFaceGroup[ hash ].faces.push( f );

	}

}

THREE.Mesh.prototype.normalizeUVs = function () {

	var i, il, j, jl, uvs;

	for ( i = 0, il = this.geometry.uvs.length; i < il; i++ ) {

		uvs = this.geometry.uvs[ i ];

		for ( j = 0, jl = uvs.length; j < jl; j++ ) {

			// texture repeat
			// (WebGL does this by default but canvas renderer needs to do it explicitly)

			if( uvs[ j ].u != 1.0 ) uvs[ j ].u = uvs[ j ].u - Math.floor( uvs[ j ].u );
			if( uvs[ j ].v != 1.0 ) uvs[ j ].v = uvs[ j ].v - Math.floor( uvs[ j ].v );

		}

	}

}
