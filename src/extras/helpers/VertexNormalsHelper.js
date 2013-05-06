/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.VertexNormalsHelper = function ( object, size ) {

	size = size || 20;

	var keys = [ 'a', 'b', 'c', 'd' ];
	var geometry = new THREE.Geometry();

	var vertices = object.geometry.vertices;
	var faces = object.geometry.faces;

	for ( var i = 0, l = faces.length; i < l; i ++ ) {

		var face = faces[ i ];

		for ( var j = 0, jl = face.vertexNormals.length; j < jl; j ++ ) {

			var vertexId = face[ keys[ j ] ];
			var vertex = vertices[ vertexId ];
			var normal = face.vertexNormals[ j ].clone();

			geometry.vertices.push( vertex );
			geometry.vertices.push( normal.multiplyScalar( size ).add( vertex ) );

		}

	}

	THREE.Line.call( this, geometry, new THREE.LineBasicMaterial( { color: 0xff0000 } ), THREE.LinePieces );

	this.matrixAutoUpdate = false;
	this.matrixWorld = object.matrixWorld;

};

THREE.VertexNormalsHelper.prototype = Object.create( THREE.Line.prototype );
