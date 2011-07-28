/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 *
 * Creates extruded geometry from a path shape.
 *
 * parameters = {
 *  size: 			<float>, 	// size of the text
 *  height: 		<float>, 	// thickness to extrude text
 *  curveSegments: 	<int>,		// number of points on the curves
 *
 *  font: 			<string>,		// font name
 *  weight: 		<string>,		// font weight (normal, bold)
 *  style: 			<string>,		// font style  (normal, italics)
 *
 *  bevelEnabled:	<bool>,			// turn on bevel
 *  bevelThickness: <float>, 		// how deep into text bevel goes
 *  bevelSize:		<float>, 		// how far from text outline is bevel
 *  bevelSegments:	<int>, 			// number of bevel layers
 *  }
  **/

THREE.ExtrudeGeometry = function( shapes, options ) {

	if( typeof( shapes ) == "undefined" ) {

		shapes = [];
		return;

	}

	THREE.Geometry.call( this );

	shapes = shapes instanceof Array ? shapes : [ shapes ];

	var s, sl = shapes.length, shape;

	for ( s = 0; s < sl; s ++ ) {

		shape = shapes[ s ];

		//console.log(shape);

		this.addShape( shape, options );

	}

};

THREE.ExtrudeGeometry.prototype = new THREE.Geometry();
THREE.ExtrudeGeometry.prototype.constructor = THREE.ExtrudeGeometry;


THREE.ExtrudeGeometry.prototype.addShape = function( shape, options ) {

	var amount = options.amount !== undefined ? options.amount : 100;

	var bevelThickness = options.bevelThickness !== undefined ? options.bevelThickness : 6; // 10
	var bevelSize = options.bevelSize !== undefined ? options.bevelSize : bevelThickness - 2; // 8
	var bevelSegments = options.bevelSegments !== undefined ? options.bevelSegments : 3;

	var bevelEnabled = options.bevelEnabled !== undefined ? options.bevelEnabled : true; // false

	// We should set bevel segments to 0 if bevel is not enabled.
	// (also bevelThickness and bevelSize make mess when bevel is not enabled,
	//  whole shape gets thicker)

	if ( !bevelEnabled ) {

		bevelSegments = 0;
		bevelThickness = 0;
		bevelSize = 0;

	}

	var steps = options.steps !== undefined ? options.steps : 1;

	var extrudePath = options.path !== undefined ? options.path : null;
	var extrudePts, extrudeByPath = false;

	if ( extrudePath ) {

		extrudePts = extrudePath.getPoints();
		steps = extrudePts.length;
		extrudeByPath = true;

	}


	// TODO, extrude by path's tangents? also via 3d path?

	// Variables initalization

	var ahole, h, hl; // looping of holes
	var scope = this;
	var bevelPoints = [];

	var shapesOffset = this.vertices.length;

	//extractAllPoints
	var shapePoints = shape.extractAllPoints(); // use shape.extractAllSpacedPoints() for points with equal divisions

    var vertices = shapePoints.shape;
	var holes = shapePoints.holes;

	var reverse = !THREE.Shape.Utils.isClockWise( vertices ) ;

	if ( reverse ) {

		vertices = vertices.reverse();

		// Maybe we should also check if holes are in the opposite direction, just to be safe ...

		for ( h = 0, hl = holes.length;  h < hl; h ++ ) {

			ahole = holes[ h ];

			if ( THREE.Shape.Utils.isClockWise( ahole ) ) {

				holes[ h ] = ahole.reverse();

			}

		}

		reverse = false; // If vertices are in order now, we shouldn't need to worry about them again (hopefully)!

	}


	var faces = THREE.Shape.Utils.triangulateShape ( vertices, holes );
	//var faces = THREE.Shape.Utils.triangulate2( vertices, holes );

	//console.log(faces);

	////
	///   Handle Vertices
	////

	var contour = vertices; // vertices has all points but contour has only points of circumference

	for ( h = 0, hl = holes.length;  h < hl; h ++ ) {

		ahole = holes[ h ];

		vertices = vertices.concat( ahole );

	}

	// Find all centroids of shapes and holes

	var i, il;
	var sum = new THREE.Vector2();

	for ( i = 0, il = contour.length; i < il; i ++ ) {

		sum.addSelf( contour[ i ] );

	}

	var contourCentroid = sum.divideScalar( contour.length );

	var holesCentroids = [];

	for ( h = 0, hl = holes.length; h < hl; h ++ ) {

		sum = new THREE.Vector2();
		ahole = holes[ h ];

		for ( i=0, il = ahole.length; i < il; i ++ ) {

			sum.addSelf( ahole[ i ] );

		}

		holesCentroids[ h ] = sum.divideScalar( ahole.length );

	}

	function scalePt ( pt, centroid, size, expandOutwards /* Boolean */ ) {

		var vectorFromCentroid = pt.clone().subSelf( centroid );
		var adj = size / vectorFromCentroid.length();

		if ( expandOutwards ) {

			adj = 1 + adj;

		}  else {

			adj = 1 - adj;

		}

		return vectorFromCentroid.multiplyScalar( adj ).addSelf( centroid );

	}


	function scalePt2 ( pt, vec, size ) {

		//return vec.clone().multiplyScalar( size ).addSelf( pt );
		return pt.clone().addSelf( vec.clone().multiplyScalar( size ) );

	}

	var b, bs, t, z,
		vert, vlen = vertices.length,
		face, flen = faces.length,
		cont, clen = contour.length;


	//------
	// Find directions for point movement
	//

	var RAD_TO_DEGREES = 180 / Math.PI;


	function getBevelVec( pt_i, pt_j, pt_k ) {

		var anglea = Math.atan2( pt_j.y - pt_i.y, pt_j.x - pt_i.x );
		var angleb = Math.atan2( pt_k.y - pt_i.y, pt_k.x - pt_i.x );

		if ( anglea > angleb ) {

			angleb += Math.PI * 2;

		}

		// var anglea = Math.atan2(pt_i.y - pt_j.y, pt_i.x - pt_j.x);
		//	var angleb = Math.atan2(pt_i.y - pt_k.y, pt_i.x - pt_k.x);

		// 	console.log('>?', anglea > angleb);
		//
		// if ( anglea < angleb) {
 		// 	angleb += Math.PI*2;
	 	// 	 	}


		//x = Math.cos(anglea) + Math.cos(angleb);
		//y = Math.sin(anglea) + Math.sin(angleb);
		//anglec = Math.atan2(y,x);

		anglec = ( anglea + angleb ) / 2;

		//console.log('angle1', anglea * RAD_TO_DEGREES,'angle2', angleb * RAD_TO_DEGREES, 'anglec', anglec *RAD_TO_DEGREES);

		var x = - Math.cos( anglec );
		var y = - Math.sin( anglec );

		var vec = new THREE.Vector2( x, y ).normalize();

		return vec;

	}

	var contourMovements = [];

	for ( i = 0, il = contour.length, j = il-1, k = i + 1; i < il; i++, j++, k++ ) {

		if ( j == il ) j = 0;
		if ( k == il ) k = 0;

		//  (j)---(i)---(k)
		// console.log('i,j,k', i, j , k)

		var pt_i = contour[ i ];
		var pt_j = contour[ j ];
		var pt_k = contour[ k ];

		contourMovements[ i ]= getBevelVec( contour[ i ], contour[ j ], contour[ k ] );

	}

	var holesMovements = [], oneHoleMovements, verticesMovements = contourMovements.concat();

	for ( h = 0, hl = holes.length; h < hl; h++ ) {

		ahole = holes[ h ];

		oneHoleMovements = [];

		for ( i = 0, il = ahole.length, j = il - 1, k = i + 1; i < il; i++, j++, k++ ) {

			if ( j == il ) j = 0;
			if ( k == il ) k = 0;

			//  (j)---(i)---(k)
			oneHoleMovements[ i ]= getBevelVec( ahole[ i ], ahole[ j ], ahole[ k ] );

		}

		holesMovements.push( oneHoleMovements );
		verticesMovements = verticesMovements.concat( oneHoleMovements );

	}


	// Loop bevelSegments, 1 for the front, 1 for the back

	for ( b = 0; b < bevelSegments; b ++ ) {
	//for ( b = bevelSegments; b > 0; b -- ) {

		t = b / bevelSegments;
		z = bevelThickness * ( 1 - t );

		//z = bevelThickness * t;
		bs = bevelSize * ( Math.sin ( t * Math.PI/2 ) ) ; // curved
		//bs = bevelSize * t ; // linear

		// contract shape

		for ( i = 0, il = contour.length; i < il; i ++ ) {

			vert = scalePt2( contour[ i ], contourMovements[ i ], bs );
			//vert = scalePt( contour[ i ], contourCentroid, bs, false );
			v( vert.x, vert.y,  - z );

		}

		// expand holes

		for ( h = 0, hl = holes.length; h < hl; h++ ) {

			ahole = holes[ h ];
			oneHoleMovements = holesMovements[ h ];

			for ( i = 0, il = ahole.length; i < il; i++ ) {

				vert = scalePt2( ahole[ i ], oneHoleMovements[ i ], bs );
				//vert = scalePt( ahole[ i ], holesCentroids[ h ], bs, true );

				v( vert.x, vert.y,  -z );

			}

		}

	}

	bs = bevelSize;

	// Back facing vertices

	for ( i = 0; i < vlen; i ++ ) {

		//vert = vertices[ i ];
		vert = scalePt2( vertices[ i ], verticesMovements[ i ], bs );

		if ( !extrudeByPath ) {

			v( vert.x, vert.y, 0 );

		} else {

			v( vert.x, vert.y + extrudePts[ 0 ].y, extrudePts[ 0 ].x );

		}

	}

	// Add stepped vertices...
	// Including front facing vertices

	var s;

	for ( s = 1; s <= steps; s ++ ) {

		for ( i = 0; i < vlen; i ++ ) {

			//vert = vertices[ i ];
			vert = scalePt2(vertices[ i ], verticesMovements[i], bs);

			if ( !extrudeByPath ) {

				v( vert.x, vert.y, amount / steps * s );

			} else {

				v( vert.x, vert.y + extrudePts[ s - 1 ].y, extrudePts[ s - 1 ].x );

			}

		}

	}


	// Add bevel segments planes

	//for ( b = 1; b <= bevelSegments; b ++ ) {
	for ( b = bevelSegments - 1; b >= 0; b -- ) {

		t = b / bevelSegments;
		z = bevelThickness * ( 1 - t );
		//bs = bevelSize * ( 1-Math.sin ( ( 1 - t ) * Math.PI/2 ) );
		bs = bevelSize * Math.sin ( t * Math.PI/2 ) ;

		// contract shape

		for ( i = 0, il = contour.length; i < il; i ++ ) {

			vert = scalePt2(contour[i], contourMovements[i], bs);
			//vert = scalePt( contour[ i ], contourCentroid, bs, false );
			v( vert.x, vert.y,  amount + z);

		}

		// expand holes

		for ( h = 0, hl = holes.length; h < hl; h ++ ) {

			ahole = holes[ h ];
			oneHoleMovements = holesMovements[ h ];

			for ( i = 0, il = ahole.length; i < il; i++ ) {

				//vert = scalePt( ahole[ i ], holesCentroids[h], bs, true );
				vert = scalePt2(ahole[i], oneHoleMovements[i], bs);

				if ( !extrudeByPath ) {

					v( vert.x, vert.y,  amount + z );

				} else {

					v( vert.x, vert.y + extrudePts[ steps - 1 ].y, extrudePts[ steps - 1 ].x +z );

				}

			}

		}

	}


	////
	///   Handle Faces
	////

	// not used anywhere
	// var layers = ( steps + bevelSegments * 2 ) * vlen;

	// Bottom faces

	if ( bevelEnabled ) {

		var layer = 0 ; // steps + 1
		var offset = vlen * layer;

		for ( i = 0; i < flen; i ++ ) {

			face = faces[ i ];
			f3( face[ 2 ]+ offset, face[ 1 ]+ offset, face[ 0 ] + offset );

		}

		layer = steps + bevelSegments * 2;
		offset = vlen * layer;

		// Top faces

		for ( i = 0; i < flen; i ++ ) {

			face = faces[ i ];
			f3( face[ 0 ] + offset, face[ 1 ] + offset, face[ 2 ] + offset );

		}

	} else {

		for ( i = 0; i < flen; i++ ) {

			face = faces[ i ];
			f3( face[ 2 ], face[ 1 ], face[ 0 ] );

		}

		// Top faces

		for ( i = 0; i < flen; i ++ ) {

			face = faces[ i ];
			f3( face[ 0 ] + vlen * steps, face[ 1 ] + vlen * steps, face[ 2 ] + vlen * steps );

		}

	}

	var tmpPt;
	var j, k, l, m;

	var layeroffset = 0;

	// Sides faces

	sidewalls( contour );
	layeroffset += contour.length;

	for ( h = 0, hl = holes.length;  h < hl; h ++ ) {

		ahole = holes[ h ];
		sidewalls( ahole );

		//, true
		layeroffset += ahole.length;

	}

	// Create faces for the z-sides of the shape

	function sidewalls( contour ) {

		i = contour.length;

		while ( --i >= 0 ) {

			tmpPt = contour[ i ];

			j = i;
			k = i - 1;

			if ( k < 0 ) k = contour.length - 1;

			//console.log('b', i,j, i-1, k,vertices.length);

			var s = 0;

			for ( s = 0; s < ( steps  + bevelSegments * 2 ); s ++ ) {

				var slen1 = vlen * s;
				var slen2 = vlen * ( s + 1 );

				f4( layeroffset + j + slen1, layeroffset + k + slen1, layeroffset + k + slen2, layeroffset + j + slen2 );

			}

		}

	}

	// UVs to be added

	this.computeCentroids();
	this.computeFaceNormals();
	//this.computeVertexNormals();

	function v( x, y, z ) {

		scope.vertices.push( new THREE.Vertex( new THREE.Vector3( x, y, z ) ) );

	}

	function f3( a, b, c ) {

		a += shapesOffset;
		b += shapesOffset;
		c += shapesOffset;

		scope.faces.push( new THREE.Face3( a, b, c ) );

	}

	function f4( a, b, c, d ) {

		a += shapesOffset;
		b += shapesOffset;
		c += shapesOffset;
		d += shapesOffset;

 		scope.faces.push( new THREE.Face4( a, b, c, d ) );

	}

};


