/**
 * @author mrdoob / http://mrdoob.com/
 * @author WestLangley / http://github.com/WestLangley
*/

THREE.VertexTangentsHelper = function ( object, size, color, linewidth ) {

	this.object = object;

	this.size = ( size !== undefined ) ? size : 1;

	if ( color === undefined ) color = 0x0000ff;
	
	this.colors = {
    		main: new THREE.Color()
	};
	this.colors.main.set( color );

	var width = ( linewidth !== undefined ) ? linewidth : 1;

	var geometry = new THREE.Geometry();

	var vertices = object.geometry.vertices;

	var faces = object.geometry.faces;

	for ( var i = 0, l = faces.length; i < l; i ++ ) {

		var face = faces[ i ];

		for ( var j = 0, jl = face.vertexTangents.length; j < jl; j ++ ) {

			geometry.vertices.push( new THREE.Vector3() );
			geometry.vertices.push( new THREE.Vector3() );

		}

	}

	THREE.Line.call( this, geometry, new THREE.LineBasicMaterial( { color: this.colors.main, linewidth: width } ), THREE.LinePieces );

	this.matrixAutoUpdate = false;

	this.update();

};

THREE.VertexTangentsHelper.prototype = Object.create( THREE.Line.prototype );
THREE.VertexTangentsHelper.prototype.constructor = THREE.VertexTangentsHelper;

THREE.VertexTangentsHelper.prototype.update = ( function ( object ) {

	var v1 = new THREE.Vector3();

	return function( object ) {

		var keys = [ 'a', 'b', 'c', 'd' ];

		this.object.updateMatrixWorld( true );

		var vertices = this.geometry.vertices;

		var verts = this.object.geometry.vertices;

		var faces = this.object.geometry.faces;

		var worldMatrix = this.object.matrixWorld;

		var idx = 0;

		for ( var i = 0, l = faces.length; i < l; i ++ ) {

			var face = faces[ i ];

			for ( var j = 0, jl = face.vertexTangents.length; j < jl; j ++ ) {

				var vertexId = face[ keys[ j ] ];
				var vertex = verts[ vertexId ];

				var tangent = face.vertexTangents[ j ];

				vertices[ idx ].copy( vertex ).applyMatrix4( worldMatrix );

				v1.copy( tangent ).transformDirection( worldMatrix ).multiplyScalar( this.size );

				v1.add( vertices[ idx ] );
				idx = idx + 1;

				vertices[ idx ].copy( v1 );
				idx = idx + 1;

			}

		}

		this.geometry.verticesNeedUpdate = true;

		return this;

	};

}());

THREE.VertexTangentsHelper.prototype.setColor = function ( color ) {
	
	this.colors.main.set( color );
	this.material.color.copy( this.colors.main );
	
};
