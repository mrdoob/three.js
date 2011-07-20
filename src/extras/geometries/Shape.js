/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * Defines a 2d shape plane using paths.
 **/

// STEP 1 Create a path.
// STEP 2 Turn path into shape.
// STEP 3 Extrude Geometry takes in Shape/Shapes
// STEP 3a - Extract points from each shape, turn to vertices
// STEP 3b - Triangulate Each Shape

THREE.Shape = function ( ) {

	THREE.Path.apply( this, arguments );
	this.holes = [];

};

THREE.Shape.prototype = new THREE.Path();
THREE.Shape.prototype.constructor = THREE.Path;

/* Convenience method to return ExtrudeGeometry */
THREE.Shape.prototype.extrude = function( options ) {

	var extruded =  new THREE.ExtrudeGeometry( this, options );
	return extruded;

};

/* Return array of holes' getPoints() */
THREE.Shape.prototype.getHoles = function(spaced) {
	
	var getPoints;
	if (spaced) {
		getPoints = 'getSpacedPoints';
	} else {
		getPoints = 'getPoints';
	}
	var holesPts = [];
	var i=0, il= this.holes.length;

	for (; i<il; i++ ) {
		holesPts[i] = this.holes[i][getPoints](); //getSpacedPoints getPoints
	}
	
	return holesPts;

};

/* Returns points of shape and holes 
spaced, when true returns points spaced by regular distances
otherwise return keypoints based on segments paramater
*/
THREE.Shape.prototype.extractAllPoints = function(spaced) {
	
	var getPoints;
	if (spaced) {
		getPoints = 'getSpacedPoints';
	} else {
		getPoints = 'getPoints';
	}
	
	return {
		shape: this[getPoints](),
		holes: this.getHoles(spaced)
	};
}





THREE.Shape.Utils = {
	removeHoles: function(contour, /*array of vector2 for contour*/ 
							holes /* array of array of vector2 */ ) 
	{
		var shape = contour.concat(); // work on this shape
		var hole;
		var allpoints = shape.concat();
		
		/* For each isolated shape, find the closest points and break to the hole to allow triangulation*/
		var shortest;
		
		var h, h2;
		
		
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
		
		for (h = 0; h < holes.length; h++) {
		//for ( h = holes.length; h-- > 0; ) {
			hole = holes[h];
			/*
			shapeholes[h].concat(); // preserves original 
			holes.push(hole);
			*/
			allpoints = allpoints.concat(hole);
			
			shortest = Number.POSITIVE_INFINITY;
			
			// THIS THING NEEDS TO BE DONE CORRECTLY AGAIN :( 
			
			// Find the shortest pair of pts between shape and hole
						
			// TODO we could optimize with
			// http://en.wikipedia.org/wiki/Proximity_problems
			// http://en.wikipedia.org/wiki/Closest_pair_of_points
			// http://stackoverflow.com/questions/1602164/shortest-distance-between-points-algorithm

			for ( h2 = 0; h2 < hole.length; h2++ ) {

				pts1 = hole[ h2 ];
				var dist = [];
				for ( p = 0; p < shape.length; p++ ) {

					pts2 = shape[ p ];
					d = pts1.distanceTo( pts2 );
					dist.push(d);

					if ( d < shortest ) {

						shortest = d;
						holeIndex = h2;
						shapeIndex = p;

					}

				}

			}
			console.log("shortest", shortest, dist);

			prevShapeVert = ( shapeIndex - 1 ) >= 0 ? shapeIndex - 1 : shape.length - 1;
			prevHoleVert = ( holeIndex - 1 ) >= 0 ? holeIndex - 1 : hole.length - 1;
			
			var areaapts = [
				hole[ holeIndex ], 
				shape[ shapeIndex ],
				shape[ prevShapeVert ]
			];
			

			var areaa = THREE.FontUtils.Triangulate.area( areaapts );

			var areabpts = [
				hole[ holeIndex ],
				hole[ prevHoleVert ],
				shape[ shapeIndex ]
			];

			var areab = THREE.FontUtils.Triangulate.area( areabpts );

			var shapeOffset = 1;
			var holeOffset = -1;

			var oldShapeIndex = shapeIndex, oldHoleIndex = holeIndex;
			shapeIndex += shapeOffset;
			holeIndex += holeOffset;

			if ( shapeIndex < 0 ) { shapeIndex += shape.length;  }
			shapeIndex %= shape.length;

			if ( holeIndex < 0 ) { holeIndex += hole.length;  }
			holeIndex %= hole.length;

			prevShapeVert = ( shapeIndex - 1 ) >= 0 ? shapeIndex - 1 : shape.length - 1;
			prevHoleVert = ( holeIndex - 1 ) >= 0 ? holeIndex - 1 : hole.length - 1;
			
			areaapts = [
				hole[ holeIndex ], 
				shape[ shapeIndex ],
				shape[ prevShapeVert ]
			];
			
			var areaa2 = THREE.FontUtils.Triangulate.area( areaapts );

			areabpts = [
				hole[ holeIndex ],
				hole[ prevHoleVert ],
				shape[ shapeIndex ]
			];

			var areab2 = THREE.FontUtils.Triangulate.area( areabpts );
			console.log(areaa,areab ,areaa2,areab2, ( areaa + areab ),  ( areaa2 + areab2 ));


			if ( ( areaa + areab ) > ( areaa2 + areab2 ) ) {
				// In case areas are not correct. 
				console.log("USE THIS");
				shapeIndex = oldShapeIndex;
				holeIndex = oldHoleIndex ;

				if ( shapeIndex < 0 ) { shapeIndex += shape.length;  }
				shapeIndex %= shape.length;

				if ( holeIndex < 0 ) { holeIndex += hole.length;  }
				holeIndex %= hole.length;

				prevShapeVert = ( shapeIndex - 1 ) >= 0 ? shapeIndex - 1 : shape.length - 1;
				prevHoleVert = ( holeIndex - 1 ) >= 0 ? holeIndex - 1 : hole.length - 1;

			} else {
				console.log("USE THAT ")
			}

			tmpShape1 = shape.slice( 0, shapeIndex );
			tmpShape2 = shape.slice( shapeIndex );
			tmpHole1 = hole.slice( holeIndex );
			tmpHole2 = hole.slice( 0, holeIndex );

			// Should check orders here again?
			var trianglea =  [
				hole[ holeIndex ],
				shape[ shapeIndex ],
				shape[ prevShapeVert ]
			];
							
			var triangleb = [
				hole[ holeIndex ] ,
				hole[ prevHoleVert ],
				shape[ shapeIndex ]
			];

			verts.push( trianglea );
			verts.push( triangleb );

			shape = tmpShape1.concat( tmpHole1 ).concat( tmpHole2 ).concat( tmpShape2 );
			//shape = tmpHole1.concat( tmpHole2 );
			
		}
		
		return {
			shape:shape, /* shape with no holes */
			isolatedPts: verts, /* isolated faces */
			allpoints: allpoints
		}
		
			
	},
	
	triangulateShape: function(contour,holes) {
		
		var shapeWithoutHoles = THREE.Shape.Utils.removeHoles(contour,holes);
		var shape = shapeWithoutHoles.shape,
			allpoints = shapeWithoutHoles.allpoints,
			isolatedPts = shapeWithoutHoles.isolatedPts;
			
		var triangles = THREE.FontUtils.Triangulate( shape, false ); // True returns indics for points of spooled shape
			// to maintain reference to old shape, one must match coords, or offset the indics from original arrays. its probably easier to do the first.
		//console.log("triangles",triangles, triangles.length);
		//console.log("allpoints",allpoints, allpoints.length);
		
		for ( var v = 0; v < triangles.length; v++ ) {

			var face = triangles[ v ];
			
			for (var f=0; f<3; f++) { // For 3 pts in faces
				for (var i=0; i<allpoints.length;i++) { // Go thru all points
					
					if (allpoints[i].equals(face[f])) { // If matches
						face[f] = i; // face now has reference to index.
					}
					
				}
				
				
			}

		}
		
		for ( var v = 0; v < isolatedPts.length; v++ ) {
			var face = isolatedPts[ v ];
			
			for (var f=0; f<3; f++) { // For 3 pts in faces
				for (var i=0; i<allpoints.length;i++) { // Go thru all points
					
					if (allpoints[i].equals(face[f])) { // If matches
						face[f] = i; // face now has reference to index.
					}
					
				}
				
			}
		}
		
		//console.log("edited?" , triangles);
		return triangles.concat(isolatedPts);
	
	}, // end triangulate shapes
	
	triangulate2 : function(pts, holes) {
		// For use Poly2Tri.js 
	
		//var pts = this.getPoints();
		var allpts = pts.concat();
		var shape = [];
		for (var p in pts) {
			shape.push(new js.poly2tri.Point(pts[p].x, pts[p].y));
		}
		
		var swctx = new js.poly2tri.SweepContext(shape);
		
		for (var h in holes) {
			var aHole = holes[h];
			var newHole = []
			for (i in aHole) {
				newHole.push(new js.poly2tri.Point(aHole[i].x, aHole[i].y));
				allpts.push(aHole[i]);
			}
			swctx.AddHole(newHole);
		}

		var find;
		var findIndexForPt = function (pt) {
			find = new THREE.Vector2(pt.x, pt.y);
			var p;
			for (p=0, pl = allpts.length; p<pl; p++) {
				if (allpts[p].equals(find)) return p;
			}
			return -1;
		};
		// triangulate
		js.poly2tri.sweep.Triangulate(swctx);

		var triangles =  swctx.GetTriangles();
		var tr ;
		var facesPts = [];
		for (var t in triangles) {
			tr =  triangles[t];
			facesPts.push([
				findIndexForPt(tr.GetPoint(0)), 
				findIndexForPt(tr.GetPoint(1)), 
				findIndexForPt(tr.GetPoint(2))
					]); 
		}


	//	console.log(facesPts);
	//	console.log("triangles", triangles.length, triangles);

		// Returns array of faces with 3 element each
	return facesPts;
	}
	
};

