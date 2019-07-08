/**
 * Make all faces use unique vertices
 * so that each face can be separated from others
 *
 * @author alteredq / http://alteredqualia.com/
 */

THREE.ExplodeModifier = function () {

};

THREE.ExplodeModifier.prototype.modify = function ( geometry ) {

	var vertices = [];

	for ( var i = 0, il = geometry.faces.length; i < il; i ++ ) {

		var n = vertices.length;

		var face = geometry.faces[ i ];

		var a = face.a;
		var b = face.b;
		var c = face.c;

		var va = geometry.vertices[ a ];
		var vb = geometry.vertices[ b ];
		var vc = geometry.vertices[ c ];

		vertices.push( va.clone() );
		vertices.push( vb.clone() );
		vertices.push( vc.clone() );

		face.a = n;
		face.b = n + 1;
		face.c = n + 2;

	}

	geometry.vertices = vertices;

};
