/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * Creates extruded geometry form path.
 **/

THREE.ExtrudeGeometry = function( shape, options ) {

	var amount = options.amount !== undefined ? options.amount : 100;

	// todo: bevel
	var bevelThickness = options.bevelThickness !== undefined ? options.bevelThickness : 10;
	var bevelSize = options.bevelSize !== undefined ? options.bevelSize : 8;
	var bevelEnabled = options.bevelEnabled !== undefined ? options.bevelEnabled : false;

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

	// getPoints
    var vertices = shape.getSpacedPoints(); // getPoints | getSpacedPoints() you can get variable divisions by dividing by total lenght
	var reverse = THREE.FontUtils.Triangulate.area( vertices ) > 0 ;
	if (reverse) {
		vertices = vertices.reverse();
		reverse = false;
	}
	
	var holes =  shape.getHoles();
	
	var faces = THREE.Shape.Utils.triangulateShape(vertices, holes);
    //var faces = THREE.Shape.Utils.triangulate2(vertices, holes);


	//console.log(faces);
	//var faces = THREE.FontUtils.Triangulate( vertices, true );
	
	var contour = vertices; // vertices has all points but contour has only points of circumference
	
	var ahole, h, hl;
	
	for (h = 0, hl = holes.length;  h < hl; h++ ) {
		ahole = holes[h];
		vertices = vertices.concat(ahole);
	}
	
	console.log("same?", contour.length, vertices.length);
	
	var scope = this;
	
   
	var bevelPoints = [];

	

	//console.log(reverse);

	var i,
		vert, vlen = vertices.length,
		face, flen = faces.length,
		cont, clen = contour.length,
		hol, hlen;
		
	var	bevelPt, blen = bevelPoints.length;

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


	if ( bevelEnabled ) {

		for ( i = 0; i < blen; i++ ) {

			bevelPt = bevelPoints[ i ];
			v( bevelPt.x, bevelPt.y, bevelThickness );

		}

		for ( i = 0; i < blen; i++ ) {

			bevelPt = bevelPoints[ i ];
			v( bevelPt.x, bevelPt.y, amount - bevelThickness );

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

	var tmpPt;
	var j, k, l, m;

	var layeroffset = 0;
	
	// Sides faces
	
	sidewalls(contour);
	layeroffset += contour.length;
	
	for (h = 0, hl = holes.length;  h < hl; h++ ) {
		ahole = holes[h];
		sidewalls(ahole);
		layeroffset += ahole.length;
	}
	
	function sidewalls(contour) {
	
		i = contour.length;

		while ( --i >= 0 ) {

			tmpPt = contour[ i ];



			//TOREMOVE
			//console.log('a', i,j, i-1, k);

			j = i;
		
			k = i - 1;

			if ( k < 0 ) k = contour.length - 1;

			//console.log('b', i,j, i-1, k,vertices.length);

			// Create faces for the z-sides of the text

			//f4( j, k, k + vlen, j + vlen );

	
			var s = 0;

			for ( ; s < steps; s++ ) {

				var slen1 = vlen * s;
				var slen2 = vlen * ( s + 1 );

				f4( layeroffset + j + slen1, layeroffset + k + slen1, layeroffset + k + slen2, layeroffset + j + slen2 );

			}

			//

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

		if ( reverse ) { // Can be removed

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
