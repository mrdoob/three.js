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

THREE.Shape.prototype.getHoles = function() {
	var holesPts = [];
	var i=0, il= this.holes.length;
	for (; i<il; i++ ) {
		holesPts[i] = this.holes[i].getSpacedPoints();
	}

	return holesPts;

};




THREE.Shape.Utils = {
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

