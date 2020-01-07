import { Path } from './Path.js';
import { MathUtils } from '../../math/MathUtils.js';

/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * Defines a 2d shape plane using paths.
 **/

// STEP 1 Create a path.
// STEP 2 Turn path into shape.
// STEP 3 ExtrudeGeometry takes in Shape/Shapes
// STEP 3a - Extract points from each shape, turn to vertices
// STEP 3b - Triangulate each shape, add faces.

function Shape( points ) {

	Path.call( this, points );

	this.uuid = MathUtils.generateUUID();

	this.type = 'Shape';

	this.holes = [];

}

Shape.prototype = Object.assign( Object.create( Path.prototype ), {

	constructor: Shape,

	getPointsHoles: function ( divisions ) {

		var holesPts = [];

		for ( var i = 0, l = this.holes.length; i < l; i ++ ) {

			holesPts[ i ] = this.holes[ i ].getPoints( divisions );

		}

		return holesPts;

	},

	// get points of shape and holes (keypoints based on segments parameter)

	extractPoints: function ( divisions ) {

		return {

			shape: this.getPoints( divisions ),
			holes: this.getPointsHoles( divisions )

		};

	},

	copy: function ( source ) {

		Path.prototype.copy.call( this, source );

		this.holes = [];

		for ( var i = 0, l = source.holes.length; i < l; i ++ ) {

			var hole = source.holes[ i ];

			this.holes.push( hole.clone() );

		}

		return this;

	},

	toJSON: function () {

		var data = Path.prototype.toJSON.call( this );

		data.uuid = this.uuid;
		data.holes = [];

		for ( var i = 0, l = this.holes.length; i < l; i ++ ) {

			var hole = this.holes[ i ];
			data.holes.push( hole.toJSON() );

		}

		return data;

	},

	fromJSON: function ( json ) {

		Path.prototype.fromJSON.call( this, json );

		this.uuid = json.uuid;
		this.holes = [];

		for ( var i = 0, l = json.holes.length; i < l; i ++ ) {

			var hole = json.holes[ i ];
			this.holes.push( new Path().fromJSON( hole ) );

		}

		return this;

	}

} );


export { Shape };
