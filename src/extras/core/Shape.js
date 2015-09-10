/**
 * Defines a 2d shape plane using paths.
 * @author zz85 / http://www.lab4games.net/zz85/blog
 */

// STEP 1 Create a path.
// STEP 2 Turn path into shape.
// STEP 3 ExtrudeGeometry takes in Shape/Shapes
// STEP 3a - Extract points from each shape, turn to vertices
// STEP 3b - Triangulate each shape, add faces.

module.exports = Shape;

var Path = require( "./Path" ),
	ExtrudeGeometry = require( "../geometries/ExtrudeGeometry" ),
	ShapeGeometry = require( "../geometries/ShapeGeometry" );

function Shape() {

	Path.apply( this, arguments );
	this.holes = [];

}

Shape.prototype = Object.create( Path.prototype );
Shape.prototype.constructor = Shape;

// Convenience method to return ExtrudeGeometry

Shape.prototype.extrude = function ( options ) {

	var extruded = new ExtrudeGeometry( this, options );
	return extruded;

};

// Convenience method to return ShapeGeometry

Shape.prototype.makeGeometry = function ( options ) {

	var geometry = new ShapeGeometry( this, options );
	return geometry;

};

// Get points of holes

Shape.prototype.getPointsHoles = function ( divisions ) {

	var i, il = this.holes.length, holesPts = [];

	for ( i = 0; i < il; i ++ ) {

		holesPts[ i ] = this.holes[ i ].getTransformedPoints( divisions, this.bends );

	}

	return holesPts;

};

// Get points of holes (spaced by regular distance)

Shape.prototype.getSpacedPointsHoles = function ( divisions ) {

	var i, il = this.holes.length, holesPts = [];

	for ( i = 0; i < il; i ++ ) {

		holesPts[ i ] = this.holes[ i ].getTransformedSpacedPoints( divisions, this.bends );

	}

	return holesPts;

};


// Get points of shape and holes (keypoints based on segments parameter)

Shape.prototype.extractAllPoints = function ( divisions ) {

	return {

		shape: this.getTransformedPoints( divisions ),
		holes: this.getPointsHoles( divisions )

	};

};

Shape.prototype.extractPoints = function ( divisions ) {

	if ( this.useSpacedPoints ) {

		return this.extractAllSpacedPoints( divisions );

	}

	return this.extractAllPoints( divisions );

};

//
// Shape.prototype.extractAllPointsWithBend = function ( divisions, bend ) {
//
// 	return {
//
// 		shape: this.transform( bend, divisions ),
// 		holes: this.getPointsHoles( divisions, bend )
//
// 	};
//
// };

// Get points of shape and holes (spaced by regular distance)

Shape.prototype.extractAllSpacedPoints = function ( divisions ) {

	return {

		shape: this.getTransformedSpacedPoints( divisions ),
		holes: this.getSpacedPointsHoles( divisions )

	};

};
