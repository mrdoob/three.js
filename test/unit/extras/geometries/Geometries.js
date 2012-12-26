/**
 * @author bhouston / http://exocortex.com
 */

module( "Geometries" );

var isVertexNormalsConsistent = function( geometry ) {
	var isNormals = false;
	for( var f = 0, fl = geometry.faces.length; f < fl; f ++ ) {
		var face = geometry.faces[f];

		if( face.vertexNormals.length > 0 ) {

			isNormals = true;

		}
		else {

			if( isNormals ) {

				console.log( "some faces have vertex normals, others don't, f = " + f );

				return false;
			}
		}
	}
	return true;
};


var isVertexColorsConsistent = function( geometry ) {
	var isColors = false;
	for( var f = 0, fl = geometry.faces.length; f < fl; f ++ ) {
		var face = geometry.faces[f];

		if( face.vertexColors.length > 0 ) {

			isColors = true;

		}
		else {

			if( isColors ) {

				console.log( "some faces have vertex colors, others don't, f = " + f );

				return false;
			}
		}
	}
	return true;
};

test( "torus", function() {
	var a = new THREE.TorusGeometry( 1, 0.2, 10, 10, 2*Math.PI );
	ok( a.boundingSphere.center.equals( zero3 ), "Passed!" );
	ok( a.boundingSphere.radius == 1.2, "Passed!" );
	ok( a.vertices.length == 121, "Passed!" );
	ok( a.faces.length == 100, "Passed!" );
	ok( isVertexNormalsConsistent( a ), "Passed!" );
	ok( isVertexColorsConsistent( a ), "Passed!" );

	a.mergeVertices();
	ok( a.vertices.length < 121, "Passed!" );
	ok( a.faces.length == 100, "Passed!" );
	ok( isVertexNormalsConsistent( a ), "Passed!" );
	ok( isVertexColorsConsistent( a ), "Passed!" );
});


test( "sphere", function() {
	var a = new THREE.SphereGeometry( 1, 10, 10, 0, 2*Math.PI, 0, Math.PI );
	ok( a.boundingSphere.center.equals( zero3 ), "Passed!" );
	ok( a.boundingSphere.radius == 1, "Passed!" );
	ok( a.vertices.length == 121, "Passed!" );
	ok( a.faces.length == 100, "Passed!" );
	ok( isVertexNormalsConsistent( a ), "Passed!" );
	ok( isVertexColorsConsistent( a ), "Passed!" );

	a.mergeVertices();
	ok( a.vertices.length < 121, "Passed!" );
	ok( a.faces.length == 100, "Passed!" );
	ok( isVertexNormalsConsistent( a ), "Passed!" );
	ok( isVertexColorsConsistent( a ), "Passed!" );
});
