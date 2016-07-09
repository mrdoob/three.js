import { PathPrototype } from './PathPrototype';
import { ShapeGeometry } from '../geometries/ShapeGeometry';
import { ExtrudeGeometry } from '../geometries/ExtrudeGeometry';
import { Path } from './Path';

/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * Defines a 2d shape plane using paths.
 **/

// STEP 1 Create a path.
// STEP 2 Turn path into shape.
// STEP 3 ExtrudeGeometry takes in Shape/Shapes
// STEP 3a - Extract points from each shape, turn to vertices
// STEP 3b - Triangulate each shape, add faces.

function Shape () {
	this.isShape = true;

	Path.apply( this, arguments );

	this.holes = [];

};

Shape.prototype = Object.assign( Object.create( PathPrototype ), {

	constructor: Shape,

	// Convenience method to return ExtrudeGeometry

	extrude: function ( options ) {

		return new ExtrudeGeometry( this, options );

	},

	// Convenience method to return ShapeGeometry

	makeGeometry: function ( options ) {

		return new ShapeGeometry( this, options );

	},

	getPointsHoles: function ( divisions ) {

		var holesPts = [];

		for ( var i = 0, l = this.holes.length; i < l; i ++ ) {

			holesPts[ i ] = this.holes[ i ].getPoints( divisions );

		}

		return holesPts;

	},

	// Get points of shape and holes (keypoints based on segments parameter)

	extractAllPoints: function ( divisions ) {

		return {

			shape: this.getPoints( divisions ),
			holes: this.getPointsHoles( divisions )

		};

	},

	extractPoints: function ( divisions ) {

		return this.extractAllPoints( divisions );

	}

} );


export { Shape };