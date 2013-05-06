/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.FaceNormalsHelper = function ( object, size ) {

	size = size || 20;

	var geometry = new THREE.Geometry();

	var faces = object.geometry.faces;

	for ( var i = 0, l = faces.length; i < l; i ++ ) {

		var face = faces[ i ];

		var centroid = face.centroid;
		var normal = face.normal.clone();

		geometry.vertices.push( centroid );
		geometry.vertices.push( normal.multiplyScalar( size ).add( centroid ) );

	}

	THREE.Line.call( this, geometry, new THREE.LineBasicMaterial( { color: 0x0000ff } ), THREE.LinePieces );

	this.matrixAutoUpdate = false;
	this.matrixWorld = object.matrixWorld;

};

THREE.FaceNormalsHelper.prototype = Object.create( THREE.Line.prototype );
