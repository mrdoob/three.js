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

/* Returns vertices of triangulated faces | get faces */

THREE.Shape.prototype.triangulate = function() {
	var pts = this.getPoints();
	if (THREE.FontUtils.Triangulate.area( pts ) > 0 ) {
		pts = pts.reverse();
	};
	return THREE.FontUtils.Triangulate( pts, true );

};

/* Convenience Method to return ExtrudeGeometry */

THREE.Shape.prototype.extrude = function( options ) {

	var extruded =  new THREE.ExtrudeGeometry( this, options );
	return extruded;

};
