/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * Creates extruded geometry form path.
 **/

THREE.ExtrudeGeometry = function( shape, options ) {

	var amount = options.amount !== undefined ? options.amount : 100;

	// todo: bezel

	var bezelThickness = options.bezelThickness !== undefined ? options.bezelThickness : 10;
	var bezelSize = options.bezelSize !== undefined ? options.bezelSize : 8;
	var bezelEnabled = options.bezelEnabled !== undefined ? options.bezelEnabled : false;

	var steps = options.steps !== undefined ? options.steps : 1;
	var extrudePath = options.path !== undefined ? options.path : null;

	var extrudePts, extrudeByPath = false;

	if ( extrudePath ) {

		extrudePts = extrudePath.getPoints();
		steps = extrudePts.length;
		extrudeByPath = true;

	}

	// TODO, extrude by path's tangents? also via 3d path?

	THREE.Geometry.call( this );

    var vertices = shape.getPoints(); // getPoints | getSpacedPoints() you can get variable divisions by dividing by total lenght
	var reverse = THREE.FontUtils.Triangulate.area( vertices ) > 0 ;
	if (reverse) {
		//faces = THREE.FontUtils.Triangulate( vertices.reverse(), true );
		vertices = vertices.reverse();
		reverse = false;
	}
	
    //var faces = THREE.Shape.Utils.triangulate2(vertices);
	var faces = THREE.FontUtils.Triangulate( vertices, true );
	
    var contour = vertices;

    var scope = this;

	var bezelPoints = [];

	

	//console.log(reverse);

	var i,
		vert, vlen = vertices.length,
		face, flen = faces.length,
		bezelPt, blen = bezelPoints.length;

	// Back facing vertices

	for ( i = 0; i < vlen; i++ ) {

		vert = vertices[ i ];
		v( vert.x, vert.y, 0 );

	}

	// Add steped vertices...
	// Including front facing vertices

	var s = 1;
	for ( ; s <= steps; s++ ) {

		for ( i = 0; i < vlen; i ++ ) {

			vert = vertices[ i ];

			if ( !extrudeByPath ) {

				v( vert.x, vert.y, amount/steps * s );

			} else {

				v( vert.x, vert.y + extrudePts[ s - 1 ].y, extrudePts[ s - 1 ].x );

			}

		}

	}

	/*
	// Front facing vertices

	for ( i = 0; i < vlen; i++ ) {

		vert = vertices[ i ];
		v( vert.x, vert.y, amount );

	}
	*/


	if ( bezelEnabled ) {

		for ( i = 0; i < blen; i++ ) {

			bezelPt = bezelPoints[ i ];
			v( bezelPt.x, bezelPt.y, bezelThickness );

		}

		for ( i = 0; i < blen; i++ ) {

			bezelPt = bezelPoints[ i ];
			v( bezelPt.x, bezelPt.y, amount - bezelThickness );

		}

	}

	// Bottom faces

	for ( i = 0; i < flen; i++ ) {

		face = faces[ i ];
		f3( face[ 2 ], face[ 1 ], face[ 0 ] );

	}

	// Top faces

	for ( i = 0; i < flen; i++ ) {

		face = faces[ i ];
		f3( face[ 0 ] + vlen* steps, face[ 1 ] + vlen * steps, face[ 2 ] + vlen * steps );

	}

	var lastV;
	var j, k, l, m;

	// Sides faces

	//contour.push( contour[ 0 ] ); // in order not to check for boundary indices every time

	i = contour.length;

	while ( --i >= 0 ) {

		lastV = contour[ i ];

		// TO OPTIMISE. Reduce this step of checking vertices.

		/*
		for ( j = 0; j < vlen; j++ ) {

			if ( vertices[ j ].equals( contour[ i ] ) ) break;

		}

		for ( k = 0; k < vlen; k++ ) {

			if ( vertices[ k ].equals( contour[ i - 1 ] ) ) break;

		}
		*/

		//TOREMOVE
		//console.log('a', i,j, i-1, k);

		j = i;
		//if (j==vertices.length) j = 0;

		k = i - 1;

		if ( k < 0 ) k = vertices.length - 1;

		//console.log('b', i,j, i-1, k,vertices.length);

		// Create faces for the z-sides of the text

		//f4( j, k, k + vlen, j + vlen );

		// Reverse
		//f4( k, j, j + vlen, k + vlen);

		//

		var s = 0;

		for ( ; s < steps; s++ ) {

			var slen1 = vlen * s;
			var slen2 = vlen * ( s + 1 );

			f4( j + slen1, k + slen1, k + slen2, j + slen2 );

		}

		//

	}


	// UVs to be added

	this.computeCentroids();
	this.computeFaceNormals();
	//this.computeVertexNormals();

	function v( x, y, z ) {

		scope.vertices.push( new THREE.Vertex( new THREE.Vector3( x, y, z ) ) );

	}

	function f3( a, b, c ) {

		if ( reverse ) {

			scope.faces.push( new THREE.Face3( c, b, a ) );

		} else {

			scope.faces.push( new THREE.Face3( a, b, c ) );

		}

	}

	function f4( a, b, c, d ) {

		if ( reverse ) {

			scope.faces.push( new THREE.Face4( d, c, b, a ) );

		} else {

			scope.faces.push( new THREE.Face4( a, b, c, d ) );

		}

	}

};


THREE.ExtrudeGeometry.prototype = new THREE.Geometry();
THREE.ExtrudeGeometry.prototype.constructor = THREE.ExtrudeGeometry;
