/**
 * @author pailhead / http://dusanbosnjak.com
 */

THREE.RoundedBoxGeometry = function ( 
	width , 
	height , 
	depth , 
	radius, 
	radiusSegments
) {

	THREE.BufferGeometry.call( this );

	this.type = 'RoundedBoxGeometry';


	//validate params ===================================

	radiusSegments = !isNaN( radiusSegments ) ? Math.max( 1, Math.floor( radiusSegments ) ) : 1 ;

	width =  !isNaN(width)  ? width  : 1;
	height = !isNaN(height) ? height : 1;
	depth =  !isNaN(depth)  ? depth  : 1;

	radius = !isNaN(radius) ? radius : .15;

	radius = Math.min( radius , Math.min( width , Math.min( height , Math.min( depth ) ) ) / 2 );

	var edgeHalfWidth =  width / 2 - radius;
	var edgeHalfHeight = height / 2 - radius;
	var edgeHalfDepth =  depth / 2 - radius;


	//not sure why this is needed, for querying? ========

	this.parameters = {
		width: width , 
		height: height , 
		depth: depth , 
		radius: radius, 
		radiusSegments: radiusSegments
	};


	//calculate vertices count ==========================

	var rs1 =  radiusSegments + 1; //radius segments + 1 

	var totalVertexCount = ( rs1 * radiusSegments + 1 ) << 3; 


	//make buffers ======================================

	var positions = 	new THREE.BufferAttribute( new Float32Array( totalVertexCount * 3 ), 3 );
	
	var normals = 		new THREE.BufferAttribute( new Float32Array( totalVertexCount * 3 ), 3 );
	

	//some vars =========================================

	var 
		cornerVerts = [], 
		cornerNormals = [],
		normal = new THREE.Vector3(),
		vertex = new THREE.Vector3(),
		vertexPool = [],
		normalPool = [],
		indices = []
	;

	var
		lastVertex = rs1 * radiusSegments,
		cornerVertNumber = rs1 * radiusSegments + 1
	;

	doVertices();
	doFaces();
	doCorners();
	doHeightEdges();
	doWidthEdges();
	doDepthEdges()

	// calculate vert positions =========================

	function doVertices(){

		//corner offsets
		var cornerLayout = [
			new THREE.Vector3(  1 ,  1 ,  1 ),
			new THREE.Vector3(  1 ,  1 , -1 ),
			new THREE.Vector3( -1 ,  1 , -1 ),
			new THREE.Vector3( -1 ,  1 ,  1 ),
			new THREE.Vector3(  1 , -1 ,  1 ),
			new THREE.Vector3(  1 , -1 , -1 ),
			new THREE.Vector3( -1 , -1 , -1 ),
			new THREE.Vector3( -1 , -1 ,  1 )
		];

		//corner holder 
		for ( var j = 0 ; j < 8 ; j ++ ){

			cornerVerts.push([]); 
			cornerNormals.push([]); 

		}

		//construct 1/8 sphere ==============================

		var PIhalf = Math.PI / 2;

		var cornerOffset = new THREE.Vector3( edgeHalfWidth , edgeHalfHeight , edgeHalfDepth );

		for ( var y = 0; y <= radiusSegments; y ++ ) {

			var v = y / radiusSegments;

			var va = v * PIhalf; //arrange in 90 deg

			var cosVa = Math.cos( va ); //scale of vertical angle 

			var sinVa = Math.sin( va );

			if( y == radiusSegments ){

				vertex.set( 0 , 1 , 0 );

				var vert = vertex.clone().multiplyScalar( radius ).add( cornerOffset );
				
				cornerVerts[0].push( vert );

				vertexPool.push( vert );
				
				var norm = vertex.clone();

				cornerNormals[0].push( norm );

				normalPool.push( norm );

				continue; //skip row loop
			
			} 	

			for ( var x = 0; x <= radiusSegments; x ++ ) {

				var u = x / radiusSegments;

				var ha = u * PIhalf;

				//make 1/8 sphere points
				vertex.x = cosVa * Math.cos( ha );
				vertex.y = sinVa;
				vertex.z = cosVa * Math.sin( ha );

				//copy sphere point, scale by radius, offset by half whd
				var vert = vertex.clone().multiplyScalar( radius ).add( cornerOffset );

				cornerVerts[0].push( vert );

				vertexPool.push( vert );
				
				//sphere already normalized, just clone

				var norm = vertex.clone().normalize();
				cornerNormals[0].push( norm );
				normalPool.push( norm );

			}

		}

		//distribute corner verts ===========================

		for ( var i = 1 ; i < 8 ; i ++ ){

			for( var j = 0 ; j < cornerVerts[0].length ; j ++ ){

				var vert = cornerVerts[0][j].clone().multiply( cornerLayout[i] );

				cornerVerts[i].push( vert );
				
				vertexPool.push( vert );

				var norm = cornerNormals[0][j].clone().multiply( cornerLayout[i] );

				cornerNormals[i].push( norm );

				normalPool.push( norm );

			}

		}	

	}
	

	// weave corners ====================================

	function doCorners(){

		var indexInd = 0;


		var flips = [
			true,
			false,
			true,
			false,
			false,
			true,
			false,
			true
		];

		var lastRowOffset = rs1 * ( radiusSegments - 1 );

		for ( var i = 0 ; i < 8 ; i ++ ){

			var cornerOffset = cornerVertNumber * i;

			for ( var v = 0 ; v < radiusSegments - 1 ; v ++ ){

				var r1 = v * rs1; 		//row offset
				var r2 = (v + 1) * rs1; //next row

				for ( var u = 0 ; u < radiusSegments ; u ++ ){

					var u1 = u + 1;
					var a = cornerOffset + r1 + u;
					var b = cornerOffset + r1 + u1;
					var c = cornerOffset + r2 + u;
					var d = cornerOffset + r2 + u1;

					if( !flips[i] ){

						indices.push( a );
						indices.push( b );
						indices.push( c );

						indices.push( b );
						indices.push( d );
						indices.push( c );

					} else {

						indices.push( a );
						indices.push( c );
						indices.push( b );

						indices.push( b );
						indices.push( c );
						indices.push( d );

					}

				}

			}
			
			for ( var u = 0 ; u < radiusSegments ; u ++ ){

				var a = cornerOffset + lastRowOffset + u;
				var b = cornerOffset + lastRowOffset + u + 1;
				var c = cornerOffset + lastVertex;

				if( !flips[i] ){

					indices.push( a );
					indices.push( b );
					indices.push( c );

				} else {

					indices.push( a );
					indices.push( c );
					indices.push( b );

				}

			}

		}

	}
	

	//plates ============================================
	//fix this loop matrices find pattern something

	function doFaces(){

		//top
		var a = lastVertex;// + cornerVertNumber * 0;
		var b = lastVertex + cornerVertNumber;// * 1;
		var c = lastVertex + cornerVertNumber * 2;
		var d = lastVertex + cornerVertNumber * 3;

		indices.push( a );
		indices.push( b );
		indices.push( c );
		indices.push( a );
		indices.push( c );
		indices.push( d );

		//bottom
		a = lastVertex + cornerVertNumber * 4;// + cornerVertNumber * 0;
		b = lastVertex + cornerVertNumber * 5;// * 1;
		c = lastVertex + cornerVertNumber * 6;
		d = lastVertex + cornerVertNumber * 7;

		indices.push( a );
		indices.push( c );
		indices.push( b );
		indices.push( a );
		indices.push( d );
		indices.push( c );

		//left 
		a = 0;
		b = cornerVertNumber;
		c = cornerVertNumber * 4;
		d = cornerVertNumber * 5;

		indices.push( a );
		indices.push( c );
		indices.push( b );
		indices.push( b );
		indices.push( c );
		indices.push( d );

		//right 
		a = cornerVertNumber * 2;
		b = cornerVertNumber * 3;
		c = cornerVertNumber * 6;
		d = cornerVertNumber * 7;

		indices.push( a );
		indices.push( c );
		indices.push( b );
		indices.push( b );
		indices.push( c );
		indices.push( d );

		//front 
		a = radiusSegments;
		b = radiusSegments + cornerVertNumber * 3;
		c = radiusSegments + cornerVertNumber * 4;
		d = radiusSegments + cornerVertNumber * 7;

		indices.push( a );
		indices.push( b );
		indices.push( c );
		indices.push( b );
		indices.push( d );
		indices.push( c );

		//back 
		a = radiusSegments + cornerVertNumber;
		b = radiusSegments + cornerVertNumber * 2;
		c = radiusSegments + cornerVertNumber * 5;
		d = radiusSegments + cornerVertNumber * 6;

		indices.push( a );
		indices.push( c );
		indices.push( b );
		indices.push( b );
		indices.push( c );
		indices.push( d );

	}


	// weave edges ======================================

	function doHeightEdges(){

		for ( var i = 0 ; i < 4 ; i ++ ){

			var cOffset = i * cornerVertNumber;
			var cRowOffset = 4 * cornerVertNumber + cOffset;
			var needsFlip = i & 1 === 1;
			for ( var u = 0 ; u < radiusSegments ; u ++ ){

				var u1 = u + 1;
				var a = cOffset + u;
				var b = cOffset + u1;
				var c = cRowOffset + u;
				var d = cRowOffset + u1;

				if( !needsFlip ){

					indices.push( a );
					indices.push( b );
					indices.push( c );
					indices.push( b );
					indices.push( d );
					indices.push( c );

				} else {

					indices.push( a );
					indices.push( c );
					indices.push( b );
					indices.push( b );
					indices.push( c );
					indices.push( d );

				}

			}

		}

	}
	
	function doDepthEdges(){

		var cStarts = [ 0 , 2 , 4 , 6 ];
		var cEnds =   [ 1 , 3 , 5 , 7 ];
			
		for ( var i = 0 ; i < 4 ; i ++ ){

			var cStart = cornerVertNumber * cStarts[ i ];
			var cEnd =   cornerVertNumber * cEnds[ i ];

			var needsFlip = 1 >= i;

			for ( var u = 0 ; u < radiusSegments ; u ++ ){

				var urs1 =  u * rs1;
				var u1rs1 = (u+1) * rs1;

				var a = cStart + urs1;
				var b = cStart + u1rs1;
				var c = cEnd + urs1;
				var d = cEnd + u1rs1

				if( needsFlip ){

					indices.push( a );
					indices.push( c );
					indices.push( b );
					indices.push( b );
					indices.push( c );
					indices.push( d );

				} else {

					indices.push( a );
					indices.push( b );
					indices.push( c );
					indices.push( b );
					indices.push( d );
					indices.push( c );

				}

			}

		}

	}

	function doWidthEdges(){

		var end = radiusSegments - 1;

		var cStarts = [ 0 , 1 , 4 , 5 ];
		var cEnds =   [ 3 , 2 , 7 , 6 ];
		var needsFlip = [0,1,1,0];

		for ( var i = 0 ; i < 4 ; i ++ ){

			var cStart = cStarts[i] * cornerVertNumber;
			var cEnd = cEnds[i] * cornerVertNumber;
			

			for ( var u = 0 ; u <= end ; u ++ ){

				// var dInd = u != end ? radiusSegments + u * rs1 : cornerVertNumber - 1;

				var a = cStart + radiusSegments + u * rs1;
				var b = cStart + (u != end ? radiusSegments + (u + 1) * rs1 : cornerVertNumber - 1);

				var c = cEnd + radiusSegments + u * rs1;
				var d = cEnd + (u != end ? radiusSegments + (u + 1) * rs1 : cornerVertNumber - 1);

				if( !needsFlip[i] ){

					indices.push( a );
					indices.push( b );
					indices.push( c );
					indices.push( b );
					indices.push( d );
					indices.push( c );

				} 
				else {

					indices.push( a );
					indices.push( c );
					indices.push( b );
					indices.push( b );
					indices.push( c );
					indices.push( d );

				}

			}

		}

	}


	//fill buffers ======================================

	var index = 0;

	for ( var i = 0 ; i < vertexPool.length ; i ++ ){

		positions.setXYZ( 
			index , 
			vertexPool[i].x , 
			vertexPool[i].y , 
			vertexPool[i].z 
		);

		normals.setXYZ( 
			index , 
			normalPool[i].x , 
			normalPool[i].y , 
			normalPool[i].z 
		);

		index++;

	}

	this.setIndex( new THREE.BufferAttribute( new Uint16Array( indices ) , 1 ) );
	
	this.addAttribute( 'position', positions );
	
	this.addAttribute( 'normal', normals );
	
};

THREE.RoundedBoxGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
THREE.RoundedBoxGeometry.constructor = THREE.RoundedBoxGeometry;
