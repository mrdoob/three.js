/**
 * @author Khang Duong https://github.com/kduong
 */

THREE.ArrowGeometry = function ( headWidth, headHeight, tailWidth, tailHeight, depth ) {

	THREE.Geometry.call( this );
		
	// corrections for errors
	tailHeight = tailHeight > headHeight ? headHeight : tailHeight;

	var scope = this,
		totalWidth = headWidth + tailWidth,
		halfWidth = totalWidth / 2,
		halfHeight = headHeight / 2,
		halfDepth = depth / 2,
		heightDif = ( headHeight - tailHeight ) / 2,
		
		// arrow points up
		curX = 0,
		curY = halfWidth,
		curZ = halfDepth,
		normalFront = new THREE.Vector3( 0, 0, 1 ),
		normalBack = new THREE.Vector3( 0, 0, -1 ),
		normalRight = new THREE.Vector3( 1, 0, 0 );

	// create vertices
	this.vertices.push( new THREE.Vertex( new THREE.Vector3( curX, curY, curZ) ) );	
	this.vertices.push( new THREE.Vertex( new THREE.Vector3( curX -= halfHeight, curY -= headWidth, curZ) ) );
	this.vertices.push( new THREE.Vertex( new THREE.Vector3( curX += heightDif, curY, curZ) ) );
	this.vertices.push( new THREE.Vertex( new THREE.Vector3( curX, curY -= tailWidth, curZ) ) );
	this.vertices.push( new THREE.Vertex( new THREE.Vector3( curX += tailHeight, curY, curZ) ) );
	this.vertices.push( new THREE.Vertex( new THREE.Vector3( curX, curY += tailWidth, curZ) ) );
	this.vertices.push( new THREE.Vertex( new THREE.Vector3( curX += heightDif, curY, curZ) ) );
	
	curX = 0,
	curY = halfWidth,
	curZ = -halfDepth;
	this.vertices.push( new THREE.Vertex( new THREE.Vector3( curX, curY, curZ) ) );	
	this.vertices.push( new THREE.Vertex( new THREE.Vector3( curX += halfHeight, curY -= headWidth, curZ) ) );
	this.vertices.push( new THREE.Vertex( new THREE.Vector3( curX -= heightDif, curY, curZ) ) );
	this.vertices.push( new THREE.Vertex( new THREE.Vector3( curX, curY -= tailWidth, curZ) ) );
	this.vertices.push( new THREE.Vertex( new THREE.Vector3( curX -= tailHeight, curY, curZ) ) );
	this.vertices.push( new THREE.Vertex( new THREE.Vector3( curX, curY += tailWidth, curZ) ) );
	this.vertices.push( new THREE.Vertex( new THREE.Vector3( curX -= heightDif, curY, curZ) ) );
	
	// create faces
	// front
	createFace3( 0, 1, 6, normalFront );	
	createFace4( 2, 3, 4, 5, normalFront );
	
	// back
	createFace3( 7, 8, 13, normalBack );
	createFace4( 9, 10, 11, 12, normalBack );
	
	// connectors
	var verts = this.vertices,
		normTopDiag = computeNormal( verts[ 0 ], verts[ 6 ], verts[ 8 ] );
		normBotDiag = computeNormal( verts[ 0 ], verts[ 7 ], verts[ 13 ] );
		
	createFace4( 0, 6, 8, 7, normTopDiag );
	createFace4( 6, 5, 9, 8, normalRight );
	createFace4( 5, 4, 10, 9, new THREE.Vector3( 0, 1, 0 ) );
	createFace4( 4, 3, 11, 10, normalRight );
	createFace4( 2, 12, 11, 3, new THREE.Vector3( 0, -1, 0 ) );
	createFace4( 1, 13, 12, 2, normalRight );
	createFace4( 0, 7, 13, 1, normBotDiag );
			
	function computeNormal( a, b, c ) {

		var cb = new THREE.Vector3(), 
			ab = new THREE.Vector3();
			
		cb.sub( c.position, b.position );
		ab.sub( a.position, b.position );
		cb.crossSelf( ab );

		if ( !cb.isZero() ) {

			cb.normalize();

		}

		return cb;
		
	};
	
	function createFace3( a, b, c, normal ) {
		
		var face = new THREE.Face3( a, b, c );
		
		if (normal instanceof Array) {
			
			face.vertexNormals = normal;
			
		} else {
			
			face.normal.copy( normal );
			face.vertexNormals.push( normal.clone(), normal.clone(), normal.clone() );
			
		}
		
		scope.faces.push(face);
		scope.faceVertexUvs[ 0 ].push( [
			new THREE.UV( 0, 0 ),
			new THREE.UV( 0, 1 ),
			new THREE.UV( 1, 0 )
		] );
		
	}
	
	function createFace4( a, b, c, d, normal ) {
		
		var face = new THREE.Face4( a, b, c, d );
		
		if (normal instanceof Array) {
			
			face.vertexNormals = normal;
			
		} else {
			
			face.normal.copy( normal );
			face.vertexNormals.push( normal.clone(), normal.clone(), normal.clone(), normal.clone() );
			
		}
		
		scope.faces.push(face);
		scope.faceVertexUvs[ 0 ].push( [
			new THREE.UV( 0, 0 ),
			new THREE.UV( 0, 1 ),
			new THREE.UV( 1, 1 ),
			new THREE.UV( 1, 0 )
		] );

	}
	
	this.computeCentroids();
	this.mergeVertices();

};

THREE.ArrowGeometry.prototype = new THREE.Geometry();
THREE.ArrowGeometry.prototype.constructor = THREE.ArrowGeometry;
