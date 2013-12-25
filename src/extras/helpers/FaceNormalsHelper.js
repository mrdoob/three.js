/**
 * @author mrdoob / http://mrdoob.com/
 * @author WestLangley / http://github.com/WestLangley
*/

THREE.FaceNormalsHelper = function ( object, size, hex, linewidth ) {

	this.object = object;

	this.size = ( size !== undefined ) ? size : 1;

	var color = ( hex !== undefined ) ? hex : 0xffff00;

	var width = ( linewidth !== undefined ) ? linewidth : 1;

	var geometry = new THREE.Geometry();

	var faces = this.object.geometry.faces;

	for ( var i = 0, l = faces.length; i < l; i ++ ) {

		geometry.vertices.push( new THREE.Vector3() );
		geometry.vertices.push( new THREE.Vector3() );

	}

	THREE.Line.call( this, geometry, new THREE.LineBasicMaterial( { color: color, linewidth: width } ), THREE.LinePieces );

	this.matrixAutoUpdate = false;

	this.normalMatrix = new THREE.Matrix3();

	this.update();

};

THREE.FaceNormalsHelper.prototype = Object.create( THREE.Line.prototype );

THREE.FaceNormalsHelper.prototype.update = ( function ( object ) {

	var v1 = new THREE.Vector3();

	return function ( object ) {

		this.object.updateMatrixWorld( true );

		this.normalMatrix.getNormalMatrix( this.object.matrixWorld );

		var vertices = this.geometry.vertices;

		var faces = this.object.geometry.faces;

		var worldMatrix = this.object.matrixWorld;

		for ( var i = 0, l = faces.length; i < l; i ++ ) {

			var face = faces[ i ];

			v1.copy( face.normal ).applyMatrix3( this.normalMatrix ).normalize().multiplyScalar( this.size );

			var idx = 2 * i;

			vertices[ idx ].copy( face.centroid ).applyMatrix4( worldMatrix );

			vertices[ idx + 1 ].addVectors( vertices[ idx ], v1 );

		}

		this.geometry.verticesNeedUpdate = true;

		return this;

	}

}());

