/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * @author alteredq / http://alteredqualia.com/
 *
 * For creating 3D text geometry in three.js
 *
 * Text = 3D Text
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
 *  }
 *
 * It uses techniques used in:
 *
 * 	typeface.js and canvastext
 * 		For converting fonts and rendering with javascript
 *		http://typeface.neocracy.org
 *
 *	Triangulation ported from AS3
 *		Simple Polygon Triangulation
 *		http://actionsnippet.com/?p=1462
 *
 * 	A Method to triangulate shapes with holes
 *		http://www.sakri.net/blog/2009/06/12/an-approach-to-triangulating-polygons-with-holes/
 *
 */

THREE.TextGeometry = function ( text, parameters ) {

	THREE.Geometry.call( this );

	this.parameters = parameters || {};
	this.set( text );

};

THREE.TextGeometry.prototype = new THREE.Geometry();
THREE.TextGeometry.prototype.constructor = THREE.TextGeometry;

THREE.TextGeometry.prototype.set = function ( text, parameters ) {

	this.text = text;
	var parameters = parameters || this.parameters;

	var size = parameters.size !== undefined ? parameters.size : 100;
	var height = parameters.height !== undefined ? parameters.height : 50;
	var curveSegments = parameters.curveSegments !== undefined ? parameters.curveSegments: 4;

	var font = parameters.font !== undefined ? parameters.font : "helvetiker";
	var weight = parameters.weight !== undefined ? parameters.weight : "normal";
	var style = parameters.style !== undefined ? parameters.style : "normal";

	var bevelThickness = parameters.bevelThickness !== undefined ? parameters.bevelThickness : 10;
	var bevelSize = parameters.bevelSize !== undefined ? parameters.bevelSize : 8;
	var bevelEnabled = parameters.bevelEnabled !== undefined ? parameters.bevelEnabled : false;

	THREE.FontUtils.size = size;
	THREE.FontUtils.divisions = curveSegments;

	THREE.FontUtils.face = font;
	THREE.FontUtils.weight = weight;
	THREE.FontUtils.style = style;

	THREE.FontUtils.bevelSize = bevelSize;

	// Get a Font data json object

	var data = THREE.FontUtils.drawText( text );

	var vertices = data.points;
	var faces = data.faces;
	var contour = data.contour;
	var bevelPoints = data.bevel;

	var scope = this;

	scope.vertices = [];
	scope.faces = [];

	var i,
		vert, vlen = vertices.length,
		face, flen = faces.length,
		bevelPt, blen = bevelPoints.length;

	// Back facing vertices

	for ( i = 0; i < vlen; i++ ) {

		vert = vertices[ i ];
		v( vert.x, vert.y, 0 );

	}

	// Front facing vertices

	for ( i = 0; i < vlen; i++ ) {

		vert = vertices[ i ];
		v( vert.x, vert.y, height );

	}

	if ( bevelEnabled ) {

		for ( i = 0; i < blen; i++ ) {

			bevelPt = bevelPoints[ i ];
			v( bevelPt.x, bevelPt.y, bevelThickness );

		}

		for ( i = 0; i < blen; i++ ) {

			bevelPt = bevelPoints[ i ];
			v( bevelPt.x, bevelPt.y, height - bevelThickness );

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
		f3( face[ 0 ] + vlen, face[ 1 ] + vlen, face[ 2 ] + vlen );

	}

	var lastV;
	var j, k, l, m;

	if ( bevelEnabled ) {

		i = bevelPoints.length;

		while ( --i > 0 ) {

			if ( !lastV ) {

				lastV = contour[ i ];

			} else if ( lastV.equals( contour[ i ] ) ) {

				// We reached the last point of a closed loop

				lastV = null;
				continue;

			}

			l = vlen * 2 + i;
			m = l - 1;

			// Create faces for the z-sides of the text

			f4( l, m, m + blen, l + blen );

			for ( j = 0; j < vlen; j++ ) {

				if ( vertices[ j ].equals( contour[ i ] ) ) break;

			}

			for ( k = 0; k < vlen; k++ ) {

				if ( vertices[ k ].equals( contour[ i - 1 ] ) ) break;

			}

			// Create faces for the z-sides of the text

			f4( j, k, m, l );
			f4( l + blen, m + blen, k + vlen, j + vlen );

		}

	} else {

		i = contour.length;

		while ( --i > 0 ) {

			if ( !lastV ) {

				lastV = contour[ i ];

			} else if ( lastV.equals( contour[ i ] ) ) {

				// We reached the last point of a closed loop

				lastV = null;
				continue;

			}

			for ( j = 0; j < vlen; j++ ) {

				if ( vertices[ j ].equals( contour[ i ] ) ) break;

			}

			for ( k = 0; k < vlen; k++ ) {

				if ( vertices[ k ].equals( contour[ i - 1 ] ) ) break;

			}

			// Create faces for the z-sides of the text

			f4( j, k, k + vlen, j + vlen );

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

		scope.faces.push( new THREE.Face3( a, b, c ) );

	}

	function f4( a, b, c, d ) {

		scope.faces.push( new THREE.Face4( a, b, c, d ) );

	}


};

THREE.FontUtils = {

	faces : {},

	// Just for now. face[weight][style]

	face : "helvetiker",
	weight: "normal",
	style : "normal",
	size : 150,
	divisions : 10,

	getFace : function() {

		return this.faces[ this.face ][ this.weight ][ this.style ];

	},

	loadFace : function( data ) {

		var family = data.familyName.toLowerCase();

		var ThreeFont = this;

		ThreeFont.faces[ family ] = ThreeFont.faces[ family ] || {};

		ThreeFont.faces[ family ][ data.cssFontWeight ] = ThreeFont.faces[ family ][ data.cssFontWeight ] || {};
		ThreeFont.faces[ family ][ data.cssFontWeight ][ data.cssFontStyle ] = data;

		var face = ThreeFont.faces[ family ][ data.cssFontWeight ][ data.cssFontStyle ] = data;

		return data;

	},


	extractPoints : function( allPoints, charactersPoints ) {

		// Quick exit

		if ( allPoints.length < 3 ) {

			//throw "not valid polygon";

			console.log( "not valid polygon" );

			return {

				points: allPoints,
				faces: []

			};

		}

		// Try to split shapes and holes.

		var p, point, shape,
			all,
			ch, singleCharPoints,
			isolatedShapes = [];

		// Use a quick hashmap for locating duplicates

		for ( var c = 0; c < charactersPoints.length; c ++ ) {

			singleCharPoints = charactersPoints[ c ];

			all = [];

			// Use a quick hashmap for locating duplicates

			for ( var p = 0; p < singleCharPoints.length; p ++ ) {

				point = singleCharPoints[ p ];
				all.push( point.x + "," + point.y );

			}

			var firstIndex, firstPt, endPt, holes;

			// We check the first loop whether its CW or CCW direction to determine
			// whether its shapes or holes first

			endPt = all.slice( 1 ).indexOf( all[ 0 ] );
			var shapesFirst = this.Triangulate.area( singleCharPoints.slice( 0, endPt + 1 ) ) < 0;

			//console.log( singleCharPoints.length, "shapesFirst", shapesFirst );

			holes = [];
			endPt = -1;

			while ( endPt < all.length ) {

				firstIndex = endPt + 1;
				firstPt = all[ firstIndex ];
				endPt = all.slice( firstIndex + 1 ).indexOf( firstPt ) + firstIndex;

				if ( endPt <= firstIndex ) break;

				var contours = singleCharPoints.slice( firstIndex, endPt + 1 );

				if ( shapesFirst ) {

					if ( this.Triangulate.area( contours ) < 0 ) {

						// we got new isolated shape

						if ( firstIndex > 0 ) {

							isolatedShapes.push( { shape: shape, holes: holes } );

						}

						// Save the old shapes, then work on new additional separated shape

						shape = contours;
						holes = [];

					} else {

						holes.push( contours );

					}

				} else {

					if ( this.Triangulate.area( contours ) < 0 ) {

						isolatedShapes.push( { shape: contours, holes: holes } );
						holes = [];

					} else {

						holes.push( contours );

					}

				}

				endPt++;

			}

			if ( shapesFirst ) {

				isolatedShapes.push( { shape: shape, holes: holes } );

			}

		}

		//console.log("isolatedShapes", isolatedShapes);

		/* For each isolated shape, find the closest points and break to the hole to allow triangulation*/

		// Find closest points between holes

		// we could optimize with
		// http://en.wikipedia.org/wiki/Proximity_problems
		// http://en.wikipedia.org/wiki/Closest_pair_of_points
		// http://stackoverflow.com/questions/1602164/shortest-distance-between-points-algorithm

		var prevShapeVert, nextShapeVert,
			prevHoleVert, nextHoleVert,
			holeIndex, shapeIndex,
			shapeId, shapeGroup,
			h, h2,
			hole, shortest, d,
			p, pts1, pts2,
			tmpShape1, tmpShape2,
			tmpHole1, tmpHole2,
			verts = [];

		for ( shapeId = 0; shapeId < isolatedShapes.length; shapeId ++ ) {

			shapeGroup = isolatedShapes[ shapeId ];

			shape = shapeGroup.shape;
			holes = shapeGroup.holes;

			for ( h = 0; h < holes.length; h++ ) {

				// we slice to each hole when neccessary

				hole = holes[ h ];
				shortest = Number.POSITIVE_INFINITY;

				for ( h2 = 0; h2 < hole.length; h2++ ) {

					pts1 = hole[ h2 ];

					for ( p = 0; p < shape.length; p++ ) {

						pts2 = shape[ p ];
						d = pts1.distanceTo( pts2 );

						if ( d < shortest ) {

							shortest = d;
							holeIndex = h2;
							shapeIndex = p;

						}

					}

				}

				prevShapeVert = ( shapeIndex - 1 ) >= 0 ? shapeIndex - 1 : shape.length - 1;
				nextShapeVert = ( shapeIndex + 1 ) < shape.length ? shapeIndex + 1 : 0;

				prevHoleVert = ( holeIndex - 1 ) >= 0 ? holeIndex - 1 : hole.length - 1;
				nextHoleVert = ( holeIndex + 1 ) < hole.length ? holeIndex + 1 : 0 ;

				var areaapts = [];
				areaapts.push( hole[ holeIndex ] );
				areaapts.push( shape[ shapeIndex ] );
				areaapts.push( shape[ prevShapeVert ] );

				var areaa = this.Triangulate.area( areaapts );

				var areabpts = [];
				areabpts.push( hole[ holeIndex ] );
				areabpts.push( hole[ prevHoleVert ] );
				areabpts.push( shape[ shapeIndex ] );

				var areab = this.Triangulate.area( areabpts );

				var shapeOffset =1;
				var holeOffset = -1;

				var oldShapeIndex = shapeIndex, oldHoleIndex = holeIndex;
				shapeIndex += shapeOffset;
				holeIndex += holeOffset;

				if ( shapeIndex < 0 ) { shapeIndex += shape.length;  }
				shapeIndex %= shape.length;

				if ( holeIndex < 0 ) { holeIndex += hole.length;  }
				holeIndex %= shape.length;

				prevShapeVert = ( shapeIndex - 1 ) >= 0 ? shapeIndex - 1 : shape.length - 1;
				nextShapeVert = ( shapeIndex + 1 ) < shape.length ? shapeIndex + 1 : 0;

				prevHoleVert = ( holeIndex - 1 ) >= 0 ? holeIndex - 1 : hole.length - 1;
				nextHoleVert = ( holeIndex + 1 ) < hole.length ? holeIndex + 1 : 0 ;


				areaapts = [];
				areaapts.push( hole[ holeIndex ] );
				areaapts.push( shape[ shapeIndex ] );
				areaapts.push( shape[ prevShapeVert ] );

				var areaa2 = this.Triangulate.area( areaapts );

				areabpts = [];
				areabpts.push( hole[ holeIndex ] );
				areabpts.push( hole[ prevHoleVert ] );
				areabpts.push( shape[ shapeIndex ] );

				var areab2 = this.Triangulate.area( areabpts );

				if ( ( areaa + areab ) > ( areaa2 + areab2 ) ) {

					shapeIndex = oldShapeIndex;
					holeIndex = oldHoleIndex ;

					if ( shapeIndex < 0 ) { shapeIndex += shape.length;  }
					shapeIndex %= shape.length;

					if ( holeIndex < 0 ) { holeIndex += hole.length;  }
					holeIndex %= shape.length;


					prevShapeVert = ( shapeIndex - 1 ) >= 0 ? shapeIndex - 1 : shape.length - 1;
					nextShapeVert = ( shapeIndex + 1 ) < shape.length ? shapeIndex + 1 : 0;

					prevHoleVert = ( holeIndex - 1 ) >= 0 ? holeIndex - 1 : hole.length - 1;
					nextHoleVert = ( holeIndex + 1 ) < hole.length ? holeIndex + 1 : 0 ;

				}

				tmpShape1 = shape.slice( 0, shapeIndex );
				tmpShape2 = shape.slice( shapeIndex );
				tmpHole1 = hole.slice( holeIndex );
				tmpHole2 = hole.slice( 0, holeIndex );

				verts.push( hole[ holeIndex ] );
				verts.push( shape[ shapeIndex ] );
				verts.push( shape[ prevShapeVert ] );

				verts.push( hole[ holeIndex ] );
				verts.push( hole[ prevHoleVert ] );
				verts.push( shape[ shapeIndex ] );

				shape = tmpShape1.concat( tmpHole1 ).concat( tmpHole2 ).concat( tmpShape2 );

			}

			shapeGroup.shape = shape;

		}

		var triangulatedPoints = [];
		var triangulatedFaces = [];
		var lastTriangles = 0;

		for ( shapeId = 0; shapeId < isolatedShapes.length; shapeId ++ ) {

			shapeGroup = isolatedShapes[ shapeId ];

			shape = shapeGroup.shape;
			triangulatedPoints = triangulatedPoints.concat( shape );

			var triangles = THREE.FontUtils.Triangulate( shape, true );

			// We need to offset vertex indices for faces

			for ( var v = 0; v < triangles.length; v++ ) {

				var face = triangles[ v ];

				face[ 0 ] += lastTriangles;
				face[ 1 ] += lastTriangles;
				face[ 2 ] += lastTriangles;

			}

			triangulatedFaces = triangulatedFaces.concat( triangles );
			lastTriangles += shape.length;

		}


		// Now we push the "cut" vertices back to the triangulated indices.

		//console.log("we have verts.length",verts.length,verts);

		var v, j, k, l, found, face;

		for ( v = 0; v < verts.length / 3; v++ ) {

			face = [];

			for ( k = 0; k < 3; k++ ) {

				found = false;

				for ( j = 0; j < triangulatedPoints.length && !found; j++ ) {

					l = v * 3 + k;

					if ( triangulatedPoints[ j ].equals( verts[ l ] ) ) {

						face.push( j );
						found = true;

					}

				}

				// you would not wish to reach this point of code, something went wrong

				if ( !found ) {

					triangulatedPoints.push( verts[ l ] );
					face.push( triangulatedPoints.length - 1 );

					console.log( "not found" )

				}

			}

			triangulatedFaces.push( face );

		}


		//console.log( "triangles", triangulatedFaces.length, "points", triangulatedPoints );

		return {

			points: triangulatedPoints,
			faces: triangulatedFaces

		};

	},

	drawText : function( text ) {

		var characterPts = [], allPts = [];

		// RenderText

		var i, p,
			face = this.getFace(),
			scale = this.size / face.resolution,
			offset = 0,
			chars = String( text ).split( '' ),
			length = chars.length;

		var fontPaths = [];

		var path = new THREE.Path();
		for ( i = 0; i < length; i++ ) {

			var ret = this.extractGlyphPoints( chars[ i ], face, scale, offset, path );
			offset += ret.offset;
			characterPts.push( ret.points );
			allPts = allPts.concat( ret.points );
			//fontPaths.push( ret.path );

		}

		//path.debug(document.getElementById("boo"));
		console.log(path);


		// get the width

		var width = offset / 2;

		for ( p = 0; p < allPts.length; p++ ) {

			allPts[ p ].x -= width;

		}

		var extract = this.extractPoints( allPts, characterPts );
		extract.contour = allPts;

		var bevelPoints = [];

		var centroids = [], forCentroids = [], expandOutwards = [], sum = new THREE.Vector2(), lastV;

		i = allPts.length;

		while ( --i >= 0 ) {

			if ( !lastV ) {

				lastV = allPts[ i ];

			} else if ( lastV.equals( allPts[ i ] ) ) {

				// We reached the last point of a closed loop

				lastV = null;

				var bool = this.Triangulate.area( forCentroids ) > 0;
				expandOutwards.push( bool );
				centroids.push( sum.divideScalar( forCentroids.length ) );
				forCentroids = [];

				sum = new THREE.Vector2();
				continue;

			}

			sum.addSelf( allPts[ i ] );
			forCentroids.push( allPts[ i ] );

		}


		i = allPts.length;
		p = 0;
		var pt, centroid ;
		var dirV, adj;

		while ( --i >= 0 ) {

			pt = allPts[ i ];
			centroid = centroids[ p ];

			dirV = pt.clone().subSelf( centroid );
			adj = this.bevelSize / dirV.length();

			if ( expandOutwards[ p ] ) {

				adj += 1;

			}  else {

				adj = 1 - adj;

			}

			adj = dirV.multiplyScalar( adj ).addSelf( centroid );
			bevelPoints.unshift( adj );


			if ( !lastV ) {

				lastV = allPts[ i ];

			} else if ( lastV.equals( allPts[ i ] ) ) {

				// We reached the last point of a closed loop

				lastV = null;
				p++;
				continue;

			}

		}


		/*
		for ( p = 0; p < allPts.length; p++ ) {

			pt = allPts[ p ];
			bevelPoints.push( new THREE.Vector2( pt.x + this.bevelSize, pt.y + this.bevelSize ) );

		}
		*/

		extract.bevel = bevelPoints;

		return extract;

	},


	// Bezier Curves formulas obtained from
	// http://en.wikipedia.org/wiki/B%C3%A9zier_curve

	// Quad Bezier Functions

	b2p0: function ( t, p ) {

		var k = 1 - t;
		return k * k * p;

	},

	b2p1: function ( t, p ) {

		return 2 * ( 1 - t ) * t * p;

	},

	b2p2: function ( t, p ) {

		return t * t * p;

	},

	b2: function ( t, p0, p1, p2 ) {

		return this.b2p0( t, p0 ) + this.b2p1( t, p1 ) + this.b2p2( t, p2 );

	},

	// Cubic Bezier Functions

	b3p0: function ( t, p ) {

		var k = 1 - t;
		return k * k * k * p;

	},

	b3p1: function ( t, p ) {

		var k = 1 - t;
		return 3 * k * k * t * p;

	},

	b3p2: function ( t, p ) {

		var k = 1 - t;
		return 3 * k * t * t * p;

	},

	b3p3: function ( t, p ) {

		return t * t * t * p;

	},

	b3: function ( t, p0, p1, p2, p3 ) {

		return this.b3p0( t, p0 ) + this.b3p1( t, p1 ) + this.b3p2( t, p2 ) +  this.b3p3( t, p3 );

	},


	extractGlyphPoints : function( c, face, scale, offset, path ) {

		var pts = [];



		var i, i2,
			outline, action, length,
			scaleX, scaleY,
			x, y, cpx, cpy, cpx0, cpy0, cpx1, cpy1, cpx2, cpy2,
			laste,
			glyph = face.glyphs[ c ] || face.glyphs[ ctxt.options.fallbackCharacter ];

		if ( !glyph ) return;

		if ( glyph.o ) {

			outline = glyph._cachedOutline || ( glyph._cachedOutline = glyph.o.split( ' ' ) );
			length = outline.length;

			scaleX = scale;
			scaleY = scale;

			for ( i = 0; i < length; ) {

				action = outline[ i++ ];
				//console.log(action);
				switch( action ) {

				case 'm':

					// Move To

					x = outline[ i++ ] * scaleX + offset;
					y = outline[ i++ ] * scaleY;
					pts.push( new THREE.Vector2( x, y ) );

					path.moveTo(x,y);
					break;

				case 'l':

					// Line To

					x = outline[ i++ ] * scaleX + offset;
					y = outline[ i++ ] * scaleY;
					pts.push( new THREE.Vector2( x, y ) );
					path.lineTo(x,y);
					break;

				case 'q':

					// QuadraticCurveTo

					cpx  = outline[ i++ ] * scaleX + offset;
					cpy  = outline[ i++ ] * scaleY;
					cpx1 = outline[ i++ ] * scaleX + offset;
					cpy1 = outline[ i++ ] * scaleY;

					path.quadraticCurveTo(cpx1, cpy1, cpx, cpy);

					laste = pts[ pts.length - 1 ];

					if ( laste ) {

						cpx0 = laste.x;
						cpy0 = laste.y;

						for ( i2 = 1, divisions = this.divisions; i2 <= divisions; i2++ ) {

							var t = i2 / divisions;
							var tx = THREE.FontUtils.b2( t, cpx0, cpx1, cpx );
							var ty = THREE.FontUtils.b2( t, cpy0, cpy1, cpy );
							pts.push( new THREE.Vector2( tx, ty ) );

					  }

				  }

				  break;

				case 'b':

					// Cubic Bezier Curve

					cpx  = outline[ i++ ] *  scaleX + offset;
					cpy  = outline[ i++ ] *  scaleY;
					cpx1 = outline[ i++ ] *  scaleX + offset;
					cpy1 = outline[ i++ ] * -scaleY;
					cpx2 = outline[ i++ ] *  scaleX + offset;
					cpy2 = outline[ i++ ] * -scaleY;

					path.bezierCurveTo( cpx, cpy, cpx1, cpy1, cpx2, cpy2 );

					laste = pts[ pts.length - 1 ];

					if ( laste ) {

						cpx0 = laste.x;
						cpy0 = laste.y;

						for ( i2 = 1, divisions = this.divisions; i2 <= divisions; i2++ ) {

							var t = i2 / divisions;
							var tx = THREE.FontUtils.b3( t, cpx0, cpx1, cpx2, cpx );
							var ty = THREE.FontUtils.b3( t, cpy0, cpy1, cpy2, cpy );
							pts.push( new THREE.Vector2( tx, ty ) );

						}

					}

					break;

				}

			}
		}



		return { offset: glyph.ha*scale, points:pts, path:path};
	}

};



/**
 * This code is a quick port of code written in C++ which was submitted to
 * flipcode.com by John W. Ratcliff  // July 22, 2000
 * See original code and more information here:
 * http://www.flipcode.com/archives/Efficient_Polygon_Triangulation.shtml
 *
 * ported to actionscript by Zevan Rosser
 * www.actionsnippet.com
 *
 * ported to javascript by Joshua Koo
 * http://www.lab4games.net/zz85/blog
 *
 */


( function( namespace ) {

	var EPSILON = 0.0000000001;

	// takes in an contour array and returns

	var process = function( contour, indices ) {

		var n = contour.length;

		if ( n < 3 ) return null;

		var result = [],
			verts = [],
			vertIndices = [];

		/* we want a counter-clockwise polygon in verts */

		var u, v, w;

		if ( area( contour ) > 0.0 ) {

			for ( v = 0; v < n; v++ ) verts[ v ] = v;

		} else {

			for ( v = 0; v < n; v++ ) verts[ v ] = ( n - 1 ) - v;

		}

		var nv = n;

		/*  remove nv - 2 vertices, creating 1 triangle every time */

		var count = 2 * nv;   /* error detection */

		for( v = nv - 1; nv > 2; ) {

			/* if we loop, it is probably a non-simple polygon */

			if ( ( count-- ) <= 0 ) {

				//** Triangulate: ERROR - probable bad polygon!

				//throw ( "Warning, unable to triangulate polygon!" );
				//return null;
				// Sometimes warning is fine, especially polygons are triangulated in reverse.
				console.log( "Warning, unable to triangulate polygon!" );

				if ( indices ) return vertIndices;
				return result;

			}

			/* three consecutive vertices in current polygon, <u,v,w> */

			u = v; 	 	if ( nv <= u ) u = 0;     /* previous */
			v = u + 1;  if ( nv <= v ) v = 0;     /* new v    */
			w = v + 1;  if ( nv <= w ) w = 0;     /* next     */

			if ( snip( contour, u, v, w, nv, verts ) ) {

				var a, b, c, s, t;

				/* true names of the vertices */

				a = verts[ u ];
				b = verts[ v ];
				c = verts[ w ];

				/* output Triangle */

				/*
				result.push( contour[ a ] );
				result.push( contour[ b ] );
				result.push( contour[ c ] );
				*/
				result.push( [ contour[ a ],
					contour[ b ],
					contour[ c ] ] );


				vertIndices.push( [ verts[ u ], verts[ v ], verts[ w ] ] );

				/* remove v from the remaining polygon */

				for( s = v, t = v + 1; t < nv; s++, t++ ) {

					verts[ s ] = verts[ t ];

				}

				nv--;

				/* reset error detection counter */

				count = 2 * nv;

			}

		}

		if ( indices ) return vertIndices;
		return result;

	};

	// calculate area of the contour polygon

	var area = function ( contour ) {

		var n = contour.length;
		var a = 0.0;

		for( var p = n - 1, q = 0; q < n; p = q++ ) {

			a += contour[ p ].x * contour[ q ].y - contour[ q ].x * contour[ p ].y;

		}

		return a * 0.5;

	};

	// see if p is inside triangle abc

	var insideTriangle = function( ax, ay,
								   bx, by,
								   cx, cy,
								   px, py ) {

		  var aX, aY, bX, bY;
		  var cX, cY, apx, apy;
		  var bpx, bpy, cpx, cpy;
		  var cCROSSap, bCROSScp, aCROSSbp;

		  aX = cx - bx;  aY = cy - by;
		  bX = ax - cx;  bY = ay - cy;
		  cX = bx - ax;  cY = by - ay;
		  apx= px  -ax;  apy= py - ay;
		  bpx= px - bx;  bpy= py - by;
		  cpx= px - cx;  cpy= py - cy;

		  aCROSSbp = aX*bpy - aY*bpx;
		  cCROSSap = cX*apy - cY*apx;
		  bCROSScp = bX*cpy - bY*cpx;

		  return ( (aCROSSbp >= 0.0) && (bCROSScp >= 0.0) && (cCROSSap >= 0.0) );

	};


	var snip = function ( contour, u, v, w, n, verts ) {

		var p;
		var ax, ay, bx, by;
		var cx, cy, px, py;

		ax = contour[ verts[ u ] ].x;
		ay = contour[ verts[ u ] ].y;

		bx = contour[ verts[ v ] ].x;
		by = contour[ verts[ v ] ].y;

		cx = contour[ verts[ w ] ].x;
		cy = contour[ verts[ w ] ].y;

		if ( EPSILON > (((bx-ax)*(cy-ay)) - ((by-ay)*(cx-ax))) ) return false;

			for ( p = 0; p < n; p++ ) {

				if( (p == u) || (p == v) || (p == w) ) continue;

				px = contour[ verts[ p ] ].x
				py = contour[ verts[ p ] ].y

				if ( insideTriangle( ax, ay, bx, by, cx, cy, px, py ) ) return false;

		  }

		  return true;

	};


	namespace.Triangulate = process;
	namespace.Triangulate.area = area;

	return namespace;

})(THREE.FontUtils);

// To use the typeface.js face files, hook up the API
window._typeface_js = { faces: THREE.FontUtils.faces, loadFace: THREE.FontUtils.loadFace };
