/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * Defines a 2d shape plane using paths.
 **/

// STEP 1 Create a path.
// STEP 2 Turn path into shape.
// STEP 3 ExtrudeGeometry takes in Shape/Shapes
// STEP 3a - Extract points from each shape, turn to vertices
// STEP 3b - Triangulate each shape, add faces.

THREE.Shape = function () {

	THREE.Path.apply( this, arguments );

	this.holes = [];

};

THREE.Shape.prototype = Object.create( THREE.Path.prototype );
THREE.Shape.prototype.constructor = THREE.Shape;

// Convenience method to return ExtrudeGeometry

THREE.Shape.prototype.extrude = function ( options ) {

	return new THREE.ExtrudeGeometry( this, options );

};

// Convenience method to return ShapeGeometry

THREE.Shape.prototype.makeGeometry = function ( options ) {

	return new THREE.ShapeGeometry( this, options );

};

// Get points of holes

THREE.Shape.prototype.getPointsHoles = function ( divisions ) {

	var holesPts = [];

	for ( var i = 0, l = this.holes.length; i < l; i ++ ) {

		holesPts[ i ] = this.holes[ i ].getPoints( divisions );

	}

	return holesPts;

};


// Get points of shape and holes (keypoints based on segments parameter)

THREE.Shape.prototype.extractAllPoints = function ( divisions ) {

	return {

		shape: this.getPoints( divisions ),
		holes: this.getPointsHoles( divisions )

	};

};

THREE.Shape.prototype.extractPoints = function ( divisions ) {

	return this.extractAllPoints( divisions );

};
