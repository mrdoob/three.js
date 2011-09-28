/*
 * @author zz85 / http://twitter.com/blurspline / http://www.lab4games.net/zz85/blog 
 * Smooth Geometry (SmoothMesh) using Catmull-Clark Subdivision Surfaces
 * Readings: 
 *	http://en.wikipedia.org/wiki/Catmull%E2%80%93Clark_subdivision_surface
 *	http://www.rorydriscoll.com/2008/08/01/catmull-clark-subdivision-the-basics/
 */
// 
THREE.SubdivisionGeometry = function( oldGeometry ) {
	THREE.Geometry.call( this );

	var scope = this;
	
	function v( x, y, z ) {
		scope.vertices.push( new THREE.Vertex( new THREE.Vector3( x, y, z ) ) );
	}

	function f4( a, b, c, d ) {
		scope.faces.push( new THREE.Face4( a, b, c, d ) );
	}
	
	function edge_hash( a, b ) {

		return Math.min( a, b ) + "_" + Math.max( a, b );

	};
	
	var originalPoints = oldGeometry.vertices;
	var originalFaces = oldGeometry.faces;
	
	var newPoints = originalPoints.concat(); // Vertices
		
	var facePoints = [], edgePoints = {};
	
	// Step 1
	//	For each face, add a face point
	//	Set each face point to be the centroid of all original points for the respective face.
	
	var i, il, face;
	
	for (i=0, il = originalFaces.length; i<il ;i++) {
		face = originalFaces[i];
		facePoints.push(face.centroid);
		newPoints.push( new THREE.Vertex(face.centroid) );
	}

	// Step 2
	//	For each edge, add an edge point.
	//	Set each edge point to be the average of the two neighbouring face points and its two original endpoints.
	oldGeometry.computeEdgeFaces();
	
	var edge, faceIndexA, faceIndexB, avg;
	var vfMap = oldGeometry.vfMap;
	
	// var edges = oldGeometry.edges;
	// console.log('edges', edges.length);
	// console.log('vfMap', vfMap);
	
	var edgeInfo;
	var edgeCount = 0;
	var originalVerticesLength = originalPoints.length;
	var edgeVertex, edgeVertexA, edgeVertexB;
	for (i in vfMap) {
		edgeInfo = vfMap[i];
		edge = edgeInfo.array;
		faceIndexA = edge[0]; // face index a
		faceIndexB = edge[1]; // face index b
		
		avg = new THREE.Vector3();
		
		avg.addSelf(facePoints[faceIndexA]);
		avg.addSelf(facePoints[faceIndexB]);
		
		
		edgeVertex = i.split('_');
		edgeVertexA = edgeVertex[0];
		edgeVertexB = edgeVertex[1];
		
		avg.addSelf(originalPoints[edgeVertexA].position);
		avg.addSelf(originalPoints[edgeVertexB].position);
		
		
		
		avg.multiplyScalar(0.25);
		
		edgePoints[i] = originalVerticesLength + originalFaces.length + edgeCount;
		
		newPoints.push( new THREE.Vertex(avg) );
	
		edgeCount ++;
		
	}
	
	// Step 3
	//	For each face point, add an edge for every edge of the face, 
	//	connecting the face point to each edge point for the face.
	
	
	var facePt, currentVerticeIndex;
	
	var hashAB, hashBC, hashCD, hashDA, hashCA;
	
	
	for (i=0, il = facePoints.length; i<il ;i++) { // for every face
		facePt = facePoints[i];
		face = originalFaces[i];
		currentVerticeIndex = originalVerticesLength+ i;
		
		if ( face instanceof THREE.Face3 ) {
			
			// create 3 face4s
			
			hashAB = edge_hash( face.a, face.b );
			hashBC = edge_hash( face.b, face.c );
			hashCA = edge_hash( face.c, face.a );

			
			f4( currentVerticeIndex, edgePoints[hashAB], face.b, edgePoints[hashBC]);
			f4( currentVerticeIndex, edgePoints[hashBC], face.c, edgePoints[hashCA]);
			f4( currentVerticeIndex, edgePoints[hashCA], face.a, edgePoints[hashAB]);
			
		} else if ( face instanceof THREE.Face4 ) {
			// create 4 face4s
			
			hashAB = edge_hash( face.a, face.b );
			hashBC = edge_hash( face.b, face.c );
			hashCD = edge_hash( face.c, face.d );
			hashDA = edge_hash( face.d, face.a );
			
			f4( currentVerticeIndex, edgePoints[hashAB], face.b, edgePoints[hashBC]);
			f4( currentVerticeIndex, edgePoints[hashBC], face.c, edgePoints[hashCD]);
			f4( currentVerticeIndex, edgePoints[hashCD], face.d, edgePoints[hashDA]);
			f4( currentVerticeIndex, edgePoints[hashDA], face.a, edgePoints[hashAB]);

				
		} else {
			console.log('face should be a face!', face);
		}
	}
	
	
	scope.vertices = newPoints;
	
	// console.log('original ', oldGeometry.vertices.length, oldGeometry.faces.length );
	// console.log('new points', newPoints.length, 'faces', this.faces.length );
	
	// Step 4
	
	//	For each original point P, 
	//		take the average F of all n face points for faces touching P, 
	//		and take the average R of all n edge midpoints for edges touching P, 
	//		where each edge midpoint is the average of its two endpoint vertices. 
	//	Move each original point to the point
	
	
	
	var vertexEdgeMap = {};
	var vertexFaceMap = {};
	
	var addVertexEdgeMap = function(vertex, edge) {
		if (vertexEdgeMap[vertex]===undefined) {
			vertexEdgeMap[vertex] = [];
		}
		
		vertexEdgeMap[vertex].push(edge);
	};
	
	var addVertexFaceMap = function(vertex, face) {
		if (vertexFaceMap[vertex]===undefined) {
			vertexFaceMap[vertex] = {};
		}
		
		vertexFaceMap[vertex][face] = null;
	};
	
	// Prepares vertexEdgeMap and vertexFaceMap
	for (i in vfMap) {
		edgeInfo = vfMap[i];
		
		edgeVertex = i.split('_');
		edgeVertexA = edgeVertex[0];
		edgeVertexB = edgeVertex[1];
		
		addVertexEdgeMap(edgeVertexA, [edgeVertexA, edgeVertexB] );
		addVertexEdgeMap(edgeVertexB, [edgeVertexA, edgeVertexB] );
		
		edge = edgeInfo.array;
		faceIndexA = edge[0]; // face index a
		faceIndexB = edge[1]; // face index b
		
		addVertexFaceMap(edgeVertexA, faceIndexA);
		addVertexFaceMap(edgeVertexA, faceIndexB);
		addVertexFaceMap(edgeVertexB, faceIndexA);
		addVertexFaceMap(edgeVertexB, faceIndexB);
		
	}
	
	//console.log('vertexEdgeMap',vertexEdgeMap, 'vertexFaceMap', vertexFaceMap);
	
	var F = new THREE.Vector3();
	var R = new THREE.Vector3();

	var j, n;
	for (i=0, il = originalPoints.length; i<il; i++) {
		// (F + 2R + (n-3)P) / n
		
		F.set(0,0,0);
		R.set(0,0,0);
		var newPos =  new THREE.Vector3(0,0,0);
		
		var f =0;
		for (j in vertexFaceMap[i]) {
			F.addSelf(facePoints[j]);
			f++;
		}
		
		F.divideScalar(f);
		
		n = vertexEdgeMap[i].length;
		
		for (j=0; j<n;j++) {
			edge = vertexEdgeMap[i][j];
			var midPt = originalPoints[edge[0]].position.clone().addSelf(originalPoints[edge[1]].position).divideScalar(2);
			R.addSelf(midPt);
			// R.addSelf(originalPoints[edge[0]].position);
			// R.addSelf(originalPoints[edge[1]].position);
		}
		
		R.divideScalar(n)
		
		newPos.addSelf(originalPoints[i].position);
		newPos.multiplyScalar(n - 3);
		
		newPos.addSelf(F);
		newPos.addSelf(R.multiplyScalar(2));
		newPos.divideScalar(n);
		
		this.vertices[i].position = newPos;
		
		
	}
	
	this.computeCentroids();
	this.computeFaceNormals();
};

THREE.SubdivisionGeometry.prototype = new THREE.Geometry();
THREE.SubdivisionGeometry.prototype.constructor = THREE.SubdivisionGeometry;
