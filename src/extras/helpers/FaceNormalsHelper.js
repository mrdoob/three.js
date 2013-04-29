/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.FaceNormalsHelper = function ( object, size ) {

	size = size || 20;

	var geometry = new THREE.Geometry();

	for( var i = 0, l = object.geometry.faces.length; i < l; i ++ ) {

		var face = object.geometry.faces[ i ];

		geometry.vertices.push( face.centroid );
		geometry.vertices.push( face.normal.clone().multiplyScalar( size ).add( face.centroid ) );

	}

	THREE.Line.call( this, geometry, new THREE.LineBasicMaterial( { color: 0x0000ff } ), THREE.LinePieces );

	this.matrixAutoUpdate = false;
	this.matrixWorld = object.matrixWorld;

};

THREE.FaceNormalsHelper.prototype = Object.create( THREE.Line.prototype );
