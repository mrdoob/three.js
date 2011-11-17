/**
 * @author oosmoxiecode

 * uvs are messed up in this one, and commented away for now. There is an ugly "seam" by the shared vertices
 * when it "wraps" around, that needs to be fixed. It´s because they share the first and the last vertices
 * so it draws the entire texture on the seam-faces, I think...
 */

THREE.IcosahedronGeometry = function ( subdivisions ) {

	var scope = this;
	var tempScope = new THREE.Geometry();
	var tempFaces;
	this.subdivisions = subdivisions || 0;

	//var temp_uv = [];

	THREE.Geometry.call(this);

	// create 12 vertices of a Icosahedron
	var t = (1 + Math.sqrt(5)) / 2;

	v(-1,  t,  0);
	v( 1,  t,  0);
	v(-1, -t,  0);
	v( 1, -t,  0);

	v( 0, -1,  t);
	v( 0,  1,  t);
	v( 0, -1, -t);
	v( 0,  1, -t);

	v( t,  0, -1);
	v( t,  0,  1);
	v(-t,  0, -1);
	v(-t,  0,  1);

	// 5 faces around point 0
	f3(0, 11, 5, tempScope);
	f3(0, 5, 1, tempScope);
	f3(0, 1, 7, tempScope);
	f3(0, 7, 10, tempScope);
	f3(0, 10, 11, tempScope);

	// 5 adjacent faces
	f3(1, 5, 9, tempScope);
	f3(5, 11, 4, tempScope);
	f3(11, 10, 2, tempScope);
	f3(10, 7, 6, tempScope);
	f3(7, 1, 8, tempScope);

	// 5 faces around point 3
	f3(3, 9, 4, tempScope);
	f3(3, 4, 2, tempScope);
	f3(3, 2, 6, tempScope);
	f3(3, 6, 8, tempScope);
	f3(3, 8, 9, tempScope);

	// 5 adjacent faces
	f3(4, 9, 5, tempScope);
	f3(2, 4, 11, tempScope);
	f3(6, 2, 10, tempScope);
	f3(8, 6, 7, tempScope);
	f3(9, 8, 1, tempScope);

	// subdivide faces to refine the triangles
	for (var i=0; i < this.subdivisions; i++) {
		tempFaces = new THREE.Geometry();
		for (var tri in tempScope.faces) {
			// replace each triangle by 4 triangles
			var a = getMiddlePoint(tempScope.faces[tri].a, tempScope.faces[tri].b);
			var b = getMiddlePoint(tempScope.faces[tri].b, tempScope.faces[tri].c);
			var c = getMiddlePoint(tempScope.faces[tri].c, tempScope.faces[tri].a);

			f3(tempScope.faces[tri].a, a, c, tempFaces);
			f3(tempScope.faces[tri].b, b, a, tempFaces);
			f3(tempScope.faces[tri].c, c, b, tempFaces);
			f3(a, b, c, tempFaces);
		}
		tempScope.faces = tempFaces.faces;
		tempScope.faceVertexUvs[ 0 ] = tempFaces.faceVertexUvs[ 0 ];
	}

	scope.faces = tempScope.faces;
	scope.faceVertexUvs[ 0 ] = tempScope.faceVertexUvs[ 0 ];

	this.computeCentroids();
	this.computeFaceNormals();

	function v( x, y, z ) {

		var length = Math.sqrt(x * x + y * y + z * z);
		var i = scope.vertices.push( new THREE.Vertex( new THREE.Vector3( x/length, y/length, z/length ) ) );

		return i-1;
	}

	function f3( a, b, c, inscope ) {

		var v1 = scope.vertices[ a ].position;
		var v2 = scope.vertices[ b ].position;
		var v3 = scope.vertices[ c ].position;

		var face = new THREE.Face3( a, b, c );
		face.vertexNormals.push( v1.clone().normalize(), v2.clone().normalize(), v3.clone().normalize() );

		inscope.faces.push( face );

		inscope.faceVertexUvs[ 0 ].push( [
			new THREE.UV( 1 - ( ( ( Math.atan2( v1.z, v1.x ) + Math.PI ) % Math.PI ) / Math.PI * 0.5 ), 0.5 - v1.y / 2 ),
			new THREE.UV( 1 - ( ( ( Math.atan2( v2.z, v2.x ) + Math.PI ) % Math.PI ) / Math.PI * 0.5 ), 0.5 - v2.y / 2 ),
			new THREE.UV( 1 - ( ( ( Math.atan2( v3.z, v3.x ) + Math.PI ) % Math.PI ) / Math.PI * 0.5 ), 0.5 - v3.y / 2 )
		] );

	}

	function getMiddlePoint(p1,p2) {
		var pos1 = scope.vertices[p1].position;
		var pos2 = scope.vertices[p2].position;

		var x = (pos1.x + pos2.x) / 2;
		var y = (pos1.y + pos2.y) / 2;
		var z = (pos1.z + pos2.z) / 2;

		var i = v(x, y, z);
		return i;
	}

}

THREE.IcosahedronGeometry.prototype = new THREE.Geometry();
THREE.IcosahedronGeometry.prototype.constructor = THREE.IcosahedronGeometry;
