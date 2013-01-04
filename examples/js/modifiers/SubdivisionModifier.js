/*
 *	@author zz85 / http://twitter.com/blurspline / http://www.lab4games.net/zz85/blog 
 *
 *	Subdivision Geometry Modifier 
 *		using Catmull-Clark Subdivision Surfaces
 *		for creating smooth geometry meshes
 *
 *	Note: a modifier modifies vertices and faces of geometry,
 *		so use geometry.clone() if original geometry needs to be retained
 * 
 *	Readings: 
 *		http://en.wikipedia.org/wiki/Catmull%E2%80%93Clark_subdivision_surface
 *		http://www.rorydriscoll.com/2008/08/01/catmull-clark-subdivision-the-basics/
 *		http://xrt.wikidot.com/blog:31
 *		"Subdivision Surfaces in Character Animation"
 *
 *		(on boundary edges)
 *		http://rosettacode.org/wiki/Catmull%E2%80%93Clark_subdivision_surface
 *		https://graphics.stanford.edu/wikis/cs148-09-summer/Assignment3Description
 *
 *	Supports:
 *		Closed and Open geometries.
 *
 *	TODO:
 *		crease vertex and "semi-sharp" features
 *		selective subdivision
 */


THREE.SubdivisionModifier = function ( subdivisions ) {

	this.subdivisions = (subdivisions === undefined ) ? 1 : subdivisions;

	// Settings
	this.useOldVertexColors = false;
	this.supportUVs = true;
	this.debug = false;

};

// Applies the "modify" pattern
THREE.SubdivisionModifier.prototype.modify = function ( geometry ) {

	var repeats = this.subdivisions;

	while ( repeats-- > 0 ) {
		this.smooth( geometry );
	}

};

/// REFACTORING THIS OUT

THREE.GeometryUtils.orderedKey = function ( a, b ) {

	return Math.min( a, b ) + "_" + Math.max( a, b );

};


// Returns a hashmap - of { edge_key: face_index }
THREE.GeometryUtils.computeEdgeFaces = function ( geometry ) {

	var i, il, v1, v2, j, k,
		face, faceIndices, faceIndex,
		edge,
		hash,
		edgeFaceMap = {};

	var orderedKey = THREE.GeometryUtils.orderedKey;

	function mapEdgeHash( hash, i ) {

		if ( edgeFaceMap[ hash ] === undefined ) {

			edgeFaceMap[ hash ] = [];

		}

		edgeFaceMap[ hash ].push( i );
	}


	// construct vertex -> face map

	for( i = 0, il = geometry.faces.length; i < il; i ++ ) {

		face = geometry.faces[ i ];

		if ( face instanceof THREE.Face3 ) {

			hash = orderedKey( face.a, face.b );
			mapEdgeHash( hash, i );

			hash = orderedKey( face.b, face.c );
			mapEdgeHash( hash, i );

			hash = orderedKey( face.c, face.a );
			mapEdgeHash( hash, i );

		} else if ( face instanceof THREE.Face4 ) {

			hash = orderedKey( face.a, face.b );
			mapEdgeHash( hash, i );

			hash = orderedKey( face.b, face.c );
			mapEdgeHash( hash, i );

			hash = orderedKey( face.c, face.d );
			mapEdgeHash( hash, i );

			hash = orderedKey( face.d, face.a );
			mapEdgeHash( hash, i );

		}

	}

	// extract faces

	// var edges = [];
	// 
	// var numOfEdges = 0;
	// for (i in edgeFaceMap) {
	// 	numOfEdges++;
	//
	// 	edge = edgeFaceMap[i];
	// 	edges.push(edge);
	//
	// }

	//debug('edgeFaceMap', edgeFaceMap, 'geometry.edges',geometry.edges, 'numOfEdges', numOfEdges);

	return edgeFaceMap;

}

/////////////////////////////

// Performs an iteration of Catmull-Clark Subdivision
THREE.SubdivisionModifier.prototype.smooth = function ( oldGeometry ) {

	//debug( 'running smooth' );

	// New set of vertices, faces and uvs
	var newVertices = [], newFaces = [], newUVs = [];

	function v( x, y, z ) {
		newVertices.push( new THREE.Vector3( x, y, z ) );
	}

	var scope = this;
	var orderedKey = THREE.GeometryUtils.orderedKey;
	var computeEdgeFaces = THREE.GeometryUtils.computeEdgeFaces;

	function assert() {

		if (scope.debug && console && console.assert) console.assert.apply(console, arguments);

	}

	function debug() {

		if (scope.debug) console.log.apply(console, arguments);

	}

	function warn() {

		if (console)
		console.log.apply(console, arguments);

	}

	function f4( a, b, c, d, oldFace, orders, facei ) {

		// TODO move vertex selection over here!

		var newFace = new THREE.Face4( a, b, c, d, null, oldFace.color, oldFace.materialIndex );

		if (scope.useOldVertexColors) {

			newFace.vertexColors = []; 

			var color, tmpColor, order;

			for (var i=0;i<4;i++) {

				order = orders[i];

				color = new THREE.Color(),
				color.setRGB(0,0,0);

				for (var j=0, jl=0; j<order.length;j++) {
					tmpColor = oldFace.vertexColors[order[j]-1];
					color.r += tmpColor.r;
					color.g += tmpColor.g;
					color.b += tmpColor.b;
				}

				color.r /= order.length;
				color.g /= order.length;
				color.b /= order.length;

				newFace.vertexColors[i] = color;

			}

		}

		newFaces.push( newFace );

		if (scope.supportUVs) {

			var aUv = [
				getUV(a, ''),
				getUV(b, facei),
				getUV(c, facei),
				getUV(d, facei)
			];

			if (!aUv[0]) debug('a :( ', a+':'+facei);
			else if (!aUv[1]) debug('b :( ', b+':'+facei);
			else if (!aUv[2]) debug('c :( ', c+':'+facei);
			else if (!aUv[3]) debug('d :( ', d+':'+facei);
			else 
				newUVs.push( aUv );

		}
	}

	var originalPoints = oldGeometry.vertices;
	var originalFaces = oldGeometry.faces;
	var originalVerticesLength = originalPoints.length;

	var newPoints = originalPoints.concat(); // New set of vertices to work on

	var facePoints = [], // these are new points on exisiting faces
		edgePoints = {}; // these are new points on exisiting edges

	var sharpEdges = {}, sharpVertices = []; // Mark edges and vertices to prevent smoothening on them
	// TODO: handle this correctly.

	var uvForVertices = {}; // Stored in {vertex}:{old face} format


	function debugCoreStuff() {

		console.log('facePoints', facePoints, 'edgePoints', edgePoints);
		console.log('edgeFaceMap', edgeFaceMap, 'vertexEdgeMap', vertexEdgeMap);

	}

	function getUV(vertexNo, oldFaceNo) {
		var j,jl;

		var key = vertexNo+':'+oldFaceNo;
		var theUV = uvForVertices[key];

		if (!theUV) {
			if (vertexNo>=originalVerticesLength && vertexNo < (originalVerticesLength + originalFaces.length)) {
				debug('face pt');
			} else {
				debug('edge pt');
			}

			warn('warning, UV not found for', key);

			return null;
		}

		return theUV;
 
		// Original faces -> Vertex Nos. 
		// new Facepoint -> Vertex Nos.
		// edge Points

	}

	function addUV(vertexNo, oldFaceNo, value) {

		var key = vertexNo+':'+oldFaceNo;
		if (!(key in uvForVertices)) {
			uvForVertices[key] = value;
		} else {
			warn('dup vertexNo', vertexNo, 'oldFaceNo', oldFaceNo, 'value', value, 'key', key, uvForVertices[key]);
		}
	}

	// Step 1
	//	For each face, add a face point
	//	Set each face point to be the centroid of all original points for the respective face.
	// debug(oldGeometry);
	var i, il, j, jl, face;

	// For Uvs
	var uvs = oldGeometry.faceVertexUvs[0];
	var abcd = 'abcd', vertice;

	debug('originalFaces, uvs, originalVerticesLength', originalFaces.length, uvs.length, originalVerticesLength);

	if (scope.supportUVs)

	for (i=0, il = uvs.length; i<il; i++ ) {

		for (j=0,jl=uvs[i].length;j<jl;j++) {

			vertice = originalFaces[i][abcd.charAt(j)];
			addUV(vertice, i, uvs[i][j]);

		}

	}

	if (uvs.length == 0) scope.supportUVs = false;

	// Additional UVs check, if we index original 
	var uvCount = 0;
	for (var u in uvForVertices) {
		uvCount++;
	}
	if (!uvCount) {
		scope.supportUVs = false;
		debug('no uvs');
	}

	var avgUv ;

	for (i=0, il = originalFaces.length; i<il ;i++) {

		face = originalFaces[ i ];
		facePoints.push( face.centroid );
		newPoints.push( face.centroid );

		if (!scope.supportUVs) continue;

		// Prepare subdivided uv

		avgUv = new THREE.Vector2();

		if ( face instanceof THREE.Face3 ) {

			avgUv.x = getUV( face.a, i ).x + getUV( face.b, i ).x + getUV( face.c, i ).x;
			avgUv.y = getUV( face.a, i ).y + getUV( face.b, i ).y + getUV( face.c, i ).y;
			avgUv.x /= 3;
			avgUv.y /= 3;

		} else if ( face instanceof THREE.Face4 ) {

			avgUv.x = getUV( face.a, i ).x + getUV( face.b, i ).x + getUV( face.c, i ).x + getUV( face.d, i ).x;
			avgUv.y = getUV( face.a, i ).y + getUV( face.b, i ).y + getUV( face.c, i ).y + getUV( face.d, i ).y;
			avgUv.x /= 4;
			avgUv.y /= 4;

		}

		addUV(originalVerticesLength + i, '', avgUv);

	}

	// Step 2
	//	For each edge, add an edge point.
	//	Set each edge point to be the average of the two neighbouring face points and its two original endpoints.

	var edgeFaceMap = computeEdgeFaces ( oldGeometry ); // Edge Hash -> Faces Index  eg { edge_key: [face_index, face_index2 ]}
	var edge, faceIndexA, faceIndexB, avg;

	// debug('edgeFaceMap', edgeFaceMap);

	var edgeCount = 0;

	var edgeVertex, edgeVertexA, edgeVertexB;

	////

	var vertexEdgeMap = {}; // Gives edges connecting from each vertex
	var vertexFaceMap = {}; // Gives faces connecting from each vertex

	function addVertexEdgeMap(vertex, edge) {

		if (vertexEdgeMap[vertex]===undefined) {

			vertexEdgeMap[vertex] = [];

		}

		vertexEdgeMap[vertex].push(edge);
	}

	function addVertexFaceMap(vertex, face, edge) {

		if (vertexFaceMap[vertex]===undefined) {

			vertexFaceMap[vertex] = {};

		}

		vertexFaceMap[vertex][face] = edge;
		// vertexFaceMap[vertex][face] = null;
	}

	// Prepares vertexEdgeMap and vertexFaceMap
	for (i in edgeFaceMap) { // This is for every edge
		edge = edgeFaceMap[i];

		edgeVertex = i.split('_');
		edgeVertexA = edgeVertex[0];
		edgeVertexB = edgeVertex[1];

		// Maps an edgeVertex to connecting edges
		addVertexEdgeMap(edgeVertexA, [edgeVertexA, edgeVertexB] );
		addVertexEdgeMap(edgeVertexB, [edgeVertexA, edgeVertexB] );

		for (j=0,jl=edge.length;j<jl;j++) {

			face = edge[j];
			addVertexFaceMap(edgeVertexA, face, i);
			addVertexFaceMap(edgeVertexB, face, i);

		}

		// {edge vertex: { face1: edge_key, face2: edge_key.. } }

		// this thing is fishy right now.
		if (edge.length < 2) {

			// edge is "sharp";
			sharpEdges[i] = true;
			sharpVertices[edgeVertexA] = true;
			sharpVertices[edgeVertexB] = true;

		}

	}

	for (i in edgeFaceMap) {

		edge = edgeFaceMap[i];

		faceIndexA = edge[0]; // face index a
		faceIndexB = edge[1]; // face index b

		edgeVertex = i.split('_');
		edgeVertexA = edgeVertex[0];
		edgeVertexB = edgeVertex[1];

		avg = new THREE.Vector3();

		//debug(i, faceIndexB,facePoints[faceIndexB]);

		assert(edge.length > 0, 'an edge without faces?!');

		if (edge.length==1) {

			avg.add( originalPoints[ edgeVertexA ] );
			avg.add( originalPoints[ edgeVertexB ] );
			avg.multiplyScalar( 0.5 );

			sharpVertices[newPoints.length] = true;

		} else {

			avg.add( facePoints[ faceIndexA ] );
			avg.add( facePoints[ faceIndexB ] );

			avg.add( originalPoints[ edgeVertexA ] );
			avg.add( originalPoints[ edgeVertexB ] );

			avg.multiplyScalar( 0.25 );

		}

		edgePoints[i] = originalVerticesLength + originalFaces.length + edgeCount;

		newPoints.push( avg );

		edgeCount ++;

		if (!scope.supportUVs) {
			continue;
		}

		// Prepare subdivided uv

		avgUv = new THREE.Vector2();

		avgUv.x = getUV(edgeVertexA, faceIndexA).x + getUV(edgeVertexB, faceIndexA).x;
		avgUv.y = getUV(edgeVertexA, faceIndexA).y + getUV(edgeVertexB, faceIndexA).y;
		avgUv.x /= 2;
		avgUv.y /= 2;

		addUV(edgePoints[i], faceIndexA, avgUv);

		if (edge.length>=2) {
			assert(edge.length == 2, 'did we plan for more than 2 edges?');
			avgUv = new THREE.Vector2();

			avgUv.x = getUV(edgeVertexA, faceIndexB).x + getUV(edgeVertexB, faceIndexB).x;
			avgUv.y = getUV(edgeVertexA, faceIndexB).y + getUV(edgeVertexB, faceIndexB).y;
			avgUv.x /= 2;
			avgUv.y /= 2;

			addUV(edgePoints[i], faceIndexB, avgUv);
		}

	}

	debug('-- Step 2 done');

	// Step 3
	//	For each face point, add an edge for every edge of the face, 
	//	connecting the face point to each edge point for the face.

	var facePt, currentVerticeIndex;

	var hashAB, hashBC, hashCD, hashDA, hashCA;

	var abc123 = ['123', '12', '2', '23'];
	var bca123 = ['123', '23', '3', '31'];
	var cab123 = ['123', '31', '1', '12'];
	var abc1234 = ['1234', '12', '2', '23'];
	var bcd1234 = ['1234', '23', '3', '34'];
	var cda1234 = ['1234', '34', '4', '41'];
	var dab1234 = ['1234', '41', '1', '12'];

	for (i=0, il = facePoints.length; i<il ;i++) { // for every face
		facePt = facePoints[i];
		face = originalFaces[i];
		currentVerticeIndex = originalVerticesLength+ i;

		if ( face instanceof THREE.Face3 ) {

			// create 3 face4s

			hashAB = orderedKey( face.a, face.b );
			hashBC = orderedKey( face.b, face.c );
			hashCA = orderedKey( face.c, face.a );

			f4( currentVerticeIndex, edgePoints[hashAB], face.b, edgePoints[hashBC], face, abc123, i );
			f4( currentVerticeIndex, edgePoints[hashBC], face.c, edgePoints[hashCA], face, bca123, i );
			f4( currentVerticeIndex, edgePoints[hashCA], face.a, edgePoints[hashAB], face, cab123, i );

		} else if ( face instanceof THREE.Face4 ) {

			// create 4 face4s

			hashAB = orderedKey( face.a, face.b );
			hashBC = orderedKey( face.b, face.c );
			hashCD = orderedKey( face.c, face.d );
			hashDA = orderedKey( face.d, face.a );

			f4( currentVerticeIndex, edgePoints[hashAB], face.b, edgePoints[hashBC], face, abc1234, i );
			f4( currentVerticeIndex, edgePoints[hashBC], face.c, edgePoints[hashCD], face, bcd1234, i );
			f4( currentVerticeIndex, edgePoints[hashCD], face.d, edgePoints[hashDA], face, cda1234, i );
			f4( currentVerticeIndex, edgePoints[hashDA], face.a, edgePoints[hashAB], face, dab1234, i );


		} else {

			debug('face should be a face!', face);

		}

	}

	newVertices = newPoints;

	// Step 4

	//	For each original point P, 
	//		take the average F of all n face points for faces touching P, 
	//		and take the average R of all n edge midpoints for edges touching P, 
	//		where each edge midpoint is the average of its two endpoint vertices. 
	//	Move each original point to the point


	var F = new THREE.Vector3();
	var R = new THREE.Vector3();

	var n;
	for (i=0, il = originalPoints.length; i<il; i++) {
		// (F + 2R + (n-3)P) / n

		if (vertexEdgeMap[i]===undefined) continue;

		F.set(0,0,0);
		R.set(0,0,0);
		var newPos =  new THREE.Vector3(0,0,0);

		var f = 0; // this counts number of faces, original vertex is connected to (also known as valance?)
		for (j in vertexFaceMap[i]) {
			F.add(facePoints[j]);
			f++;
		}

		var sharpEdgeCount = 0;

		n = vertexEdgeMap[i].length; // given a vertex, return its connecting edges

		// Are we on the border?
		var boundary_case = f != n;

		// if (boundary_case) {
		// 	console.error('moo', 'o', i, 'faces touched', f, 'edges',  n, n == 2);
		// }

		for (j=0;j<n;j++) {
			if (
				sharpEdges[
					orderedKey(vertexEdgeMap[i][j][0],vertexEdgeMap[i][j][1])
				]) {
					sharpEdgeCount++;
				}
		}

		// if ( sharpEdgeCount==2 ) {
		// 	continue;
		// 	// Do not move vertex if there's 2 connecting sharp edges.
		// }

		/*
		if (sharpEdgeCount>2) {
			// TODO
		}
		*/

		F.divideScalar(f);


		var boundary_edges = 0;

		if (boundary_case) {

			var bb_edge;
			for (j=0; j<n;j++) {
				edge = vertexEdgeMap[i][j];
				bb_edge = edgeFaceMap[orderedKey(edge[0], edge[1])].length == 1
				if (bb_edge) {
					var midPt = originalPoints[edge[0]].clone().add(originalPoints[edge[1]]).divideScalar(2);
					R.add(midPt);
					boundary_edges++;
				}
			}

			R.divideScalar(4);
			// console.log(j + ' --- ' + n + ' --- ' + boundary_edges);
			assert(boundary_edges == 2, 'should have only 2 boundary edges');

		} else {
			for (j=0; j<n;j++) {
				edge = vertexEdgeMap[i][j];
				var midPt = originalPoints[edge[0]].clone().add(originalPoints[edge[1]]).divideScalar(2);
				R.add(midPt);
			}

			R.divideScalar(n);
		}

		// Sum the formula
		newPos.add(originalPoints[i]);


		if (boundary_case) {

			newPos.divideScalar(2);
			newPos.add(R);

		} else {

			newPos.multiplyScalar(n - 3);

			newPos.add(F);
			newPos.add(R.multiplyScalar(2));
			newPos.divideScalar(n);

		}

		newVertices[i] = newPos;

	}

	var newGeometry = oldGeometry; // Let's pretend the old geometry is now new :P

	newGeometry.vertices = newVertices;
	newGeometry.faces = newFaces;
	newGeometry.faceVertexUvs[ 0 ] = newUVs;

	delete newGeometry.__tmpVertices; // makes __tmpVertices undefined :P

	newGeometry.computeCentroids();
	newGeometry.computeFaceNormals();
	newGeometry.computeVertexNormals();

};
