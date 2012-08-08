/*
 *	@author zz85 / http://twitter.com/blurspline / http://www.lab4games.net/zz85/blog 
 * 
 *	Subdivision Geometry Modifier 
 *		using Catmull-Clark Subdivision Surfaces
 *		for creating smooth geometry meshes
 *
 *	Note: a modifier modifies vertices and faces of geometry,
 *		so use THREE.GeometryUtils.clone() if orignal geoemtry needs to be retained
 * 
 *	Readings: 
 *		http://en.wikipedia.org/wiki/Catmull%E2%80%93Clark_subdivision_surface
 *		http://www.rorydriscoll.com/2008/08/01/catmull-clark-subdivision-the-basics/
 *		http://xrt.wikidot.com/blog:31
 *		"Subdivision Surfaces in Character Animation"
 *
 *	Supports:
 *		Closed and Open geometries.
 *
 *	TODO: 
 *		crease vertex and "semi-sharp" features
 *		selective subdivision
 */

THREE.SubdivisionModifier = function( subdivisions ) {
	
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

// Performs an iteration of Catmull-Clark Subdivision
THREE.SubdivisionModifier.prototype.smooth = function ( oldGeometry ) {
	
	//debug( 'running smooth' );
	
	// New set of vertices, faces and uvs
	var newVertices = [], newFaces = [], newUVs = [];
	
	function v( x, y, z ) {
		newVertices.push( new THREE.Vector3( x, y, z ) );
	}
	
	var scope = this;

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
	
	function edge_hash( a, b ) {

		return Math.min( a, b ) + "_" + Math.max( a, b );

	}
	
	function computeEdgeFaces( geometry ) {

		var i, il, v1, v2, j, k,
			face, faceIndices, faceIndex,
			edge,
			hash,
			edgeFaceMap = {};

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

				hash = edge_hash( face.a, face.b );
				mapEdgeHash( hash, i );

				hash = edge_hash( face.b, face.c );
				mapEdgeHash( hash, i );

				hash = edge_hash( face.c, face.a );
				mapEdgeHash( hash, i );

			} else if ( face instanceof THREE.Face4 ) {

				hash = edge_hash( face.a, face.b );
				mapEdgeHash( hash, i );

				hash = edge_hash( face.b, face.c );
				mapEdgeHash( hash, i );

				hash = edge_hash( face.c, face.d );
				mapEdgeHash( hash, i );
				
				hash = edge_hash( face.d, face.a );
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
	
	var originalPoints = oldGeometry.vertices;
	var originalFaces = oldGeometry.faces;
	
	var newPoints = originalPoints.concat(); // Vertices
		
	var facePoints = [], edgePoints = {};
	
	var sharpEdges = {}, sharpVertices = [], sharpFaces = [];
	
	var uvForVertices = {}; // Stored in {vertex}:{old face} format

	var originalVerticesLength = originalPoints.length;

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

	debug('-- Original Faces + Vertices UVs completed', uvForVertices, 'vs', uvs.length);
			
	var avgUv ;
	for (i=0, il = originalFaces.length; i<il ;i++) {
		face = originalFaces[ i ];
		facePoints.push( face.centroid );
		newPoints.push( face.centroid );
		
		
		if (!scope.supportUVs) continue;
		
		// Prepare subdivided uv
		
		avgUv = new THREE.UV();
		
		if ( face instanceof THREE.Face3 ) {
			avgUv.u = getUV( face.a, i ).u + getUV( face.b, i ).u + getUV( face.c, i ).u;
			avgUv.v = getUV( face.a, i ).v + getUV( face.b, i ).v + getUV( face.c, i ).v;
			avgUv.u /= 3;
			avgUv.v /= 3;
			
		} else if ( face instanceof THREE.Face4 ) {
			avgUv.u = getUV( face.a, i ).u + getUV( face.b, i ).u + getUV( face.c, i ).u + getUV( face.d, i ).u;
			avgUv.v = getUV( face.a, i ).v + getUV( face.b, i ).v + getUV( face.c, i ).v + getUV( face.d, i ).v;
			avgUv.u /= 4;
			avgUv.v /= 4;
		}

		addUV(originalVerticesLength + i, '', avgUv);

	}

	debug('-- added UVs for new Faces', uvForVertices);

	// Step 2
	//	For each edge, add an edge point.
	//	Set each edge point to be the average of the two neighbouring face points and its two original endpoints.
	
	var edgeFaceMap = computeEdgeFaces ( oldGeometry ); // Edge Hash -> Faces Index
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
		
		if (edge.length < 2) {
			// edge is "sharp";
			sharpEdges[i] = true;
			sharpVertices[edgeVertexA] = true;
			sharpVertices[edgeVertexB] = true;
			
		}
		
	}
	
	debug('vertexEdgeMap',vertexEdgeMap, 'vertexFaceMap', vertexFaceMap);
	
	
	for (i in edgeFaceMap) {
		edge = edgeFaceMap[i];
		
		faceIndexA = edge[0]; // face index a
		faceIndexB = edge[1]; // face index b
		
		edgeVertex = i.split('_');
		edgeVertexA = edgeVertex[0];
		edgeVertexB = edgeVertex[1];
		
		
		avg = new THREE.Vector3();
		
		//debug(i, faceIndexB,facePoints[faceIndexB]);
		
		if (sharpEdges[i]) {
			//debug('warning, ', i, 'edge has only 1 connecting face', edge);
			
			// For a sharp edge, average the edge end points.
			avg.addSelf(originalPoints[edgeVertexA]);
			avg.addSelf(originalPoints[edgeVertexB]);
			
			avg.multiplyScalar(0.5);
			
			sharpVertices[newPoints.length] = true;
			
		} else {
		
			avg.addSelf(facePoints[faceIndexA]);
			avg.addSelf(facePoints[faceIndexB]);
		
			avg.addSelf(originalPoints[edgeVertexA]);
			avg.addSelf(originalPoints[edgeVertexB]);
		
			avg.multiplyScalar(0.25);
		
		}
		
		edgePoints[i] = originalVerticesLength + originalFaces.length + edgeCount;
		
		newPoints.push( avg );
	
		edgeCount ++;
		
		if (!scope.supportUVs) {
			continue;
		}

		// debug('faceIndexAB', faceIndexA, faceIndexB, sharpEdges[i]);

		// Prepare subdivided uv
		
		avgUv = new THREE.UV();
		
		avgUv.u = getUV(edgeVertexA, faceIndexA).u + getUV(edgeVertexB, faceIndexA).u;
		avgUv.v = getUV(edgeVertexA, faceIndexA).v + getUV(edgeVertexB, faceIndexA).v;
		avgUv.u /= 2;
		avgUv.v /= 2;

		addUV(edgePoints[i], faceIndexA, avgUv);

		if (!sharpEdges[i]) {
		avgUv = new THREE.UV();
		
		avgUv.u = getUV(edgeVertexA, faceIndexB).u + getUV(edgeVertexB, faceIndexB).u;
		avgUv.v = getUV(edgeVertexA, faceIndexB).v + getUV(edgeVertexB, faceIndexB).v;
		avgUv.u /= 2;
		avgUv.v /= 2;
		
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
			
			hashAB = edge_hash( face.a, face.b );
			hashBC = edge_hash( face.b, face.c );
			hashCA = edge_hash( face.c, face.a );
			
			f4( currentVerticeIndex, edgePoints[hashAB], face.b, edgePoints[hashBC], face, abc123, i );
			f4( currentVerticeIndex, edgePoints[hashBC], face.c, edgePoints[hashCA], face, bca123, i );
			f4( currentVerticeIndex, edgePoints[hashCA], face.a, edgePoints[hashAB], face, cab123, i );
			
		} else if ( face instanceof THREE.Face4 ) {
			// create 4 face4s
			
			hashAB = edge_hash( face.a, face.b );
			hashBC = edge_hash( face.b, face.c );
			hashCD = edge_hash( face.c, face.d );
			hashDA = edge_hash( face.d, face.a );
			
			f4( currentVerticeIndex, edgePoints[hashAB], face.b, edgePoints[hashBC], face, abc1234, i );
			f4( currentVerticeIndex, edgePoints[hashBC], face.c, edgePoints[hashCD], face, bcd1234, i );
			f4( currentVerticeIndex, edgePoints[hashCD], face.d, edgePoints[hashDA], face, cda1234, i );
			f4( currentVerticeIndex, edgePoints[hashDA], face.a, edgePoints[hashAB], face, dab1234, i );

				
		} else {
			debug('face should be a face!', face);
		}
	}
	
	newVertices = newPoints;
	
	// debug('original ', oldGeometry.vertices.length, oldGeometry.faces.length );
	// debug('new points', newPoints.length, 'faces', newFaces.length );
	
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
		
		var f =0;
		for (j in vertexFaceMap[i]) {
			F.addSelf(facePoints[j]);
			f++;
		}
		
		var sharpEdgeCount = 0;
		
		n = vertexEdgeMap[i].length;
		
		for (j=0;j<n;j++) {
			if (
				sharpEdges[
					edge_hash(vertexEdgeMap[i][j][0],vertexEdgeMap[i][j][1])
				]) {
					sharpEdgeCount++;
				}
		}
		
		if ( sharpEdgeCount==2 ) {
			continue;
			// Do not move vertex if there's 2 connecting sharp edges.
		}

		/*
		if (sharpEdgeCount>2) {
			// TODO
		}
		*/
		
		F.divideScalar(f);
		
		
		
		for (j=0; j<n;j++) {
			edge = vertexEdgeMap[i][j];
			var midPt = originalPoints[edge[0]].clone().addSelf(originalPoints[edge[1]]).divideScalar(2);
			R.addSelf(midPt);
			// R.addSelf(originalPoints[edge[0]]);
			// R.addSelf(originalPoints[edge[1]]);
		}
		
		R.divideScalar(n);
		
		newPos.addSelf(originalPoints[i]);
		newPos.multiplyScalar(n - 3);
		
		newPos.addSelf(F);
		newPos.addSelf(R.multiplyScalar(2));
		newPos.divideScalar(n);
		
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
