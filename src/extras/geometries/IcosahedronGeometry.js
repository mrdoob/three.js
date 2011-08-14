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
		//tempScope.uvs = tempFaces.uvs;
	}

	scope.faces = tempScope.faces;
	//scope.uvs = tempScope.uvs;

	this.computeCentroids();
	this.computeFaceNormals();
	this.computeVertexNormals();

	function v( x, y, z ) {
		var length = Math.sqrt(x * x + y * y + z * z);
		var i = scope.vertices.push( new THREE.Vertex( new THREE.Vector3( x/length, y/length, z/length ) ) );

		//var uv = getUv(x, y, z);
		//temp_uv.push(uv);

		return i-1;
	}

	function f3( a, b, c, inscope ) {
		inscope.faces.push( new THREE.Face3( a, b, c ) );

		/*inscope.uvs.push( [new THREE.UV( temp_uv[a].u, temp_uv[a].v ),
						   new THREE.UV( temp_uv[b].u, temp_uv[b].v ),
						   new THREE.UV( temp_uv[c].u, temp_uv[c].v )
						  ] );
		*/
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

	/*function getUv(x,y,z) {

		var u,v;
		var px,py,pz,d;

		d = Math.sqrt( x*x+y*y+z*z );

		px = x/d;
		py = y/d;
		pz = z/d;

		var normalisedX = 0;
		var normalisedZ = -1;

		if (((px * px) + (pz * pz)) > 0) {
			normalisedX = Math.sqrt((px * px) / ((px * px) + (pz * pz)));

			if (px < 0) {
				normalisedX = -normalisedX;
			}

			normalisedZ = Math.sqrt((pz * pz) / ((px * px) + (pz * pz)));

			if (pz < 0)	{
				normalisedZ = -normalisedZ;
			}
		}

		if (normalisedZ == 0) {
			u = ((normalisedX * Math.PI) / 2);
		} else {
			u = Math.atan(normalisedX / normalisedZ);

			if (normalisedZ < 0) {
				u += Math.PI;
			}
		}

		if (u < 0) {
			u += 2 * Math.PI;
		}

		u /= 2 * Math.PI;
		v = (-py + 1) / 2;

		return {u:u,v:v};
	}*/

}

THREE.IcosahedronGeometry.prototype = new THREE.Geometry();
THREE.IcosahedronGeometry.prototype.constructor = THREE.IcosahedronGeometry;
