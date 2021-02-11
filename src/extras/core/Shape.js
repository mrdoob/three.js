import { Path } from './Path.js';
import { MathUtils } from '../../math/MathUtils.js';

function Shape( points ) {

	Path.call( this, points );

	this.uuid = MathUtils.generateUUID();

	this.type = 'Shape';

	this.holes = [];

}

Shape.prototype = Object.assign( Object.create( Path.prototype ), {

	constructor: Shape,

	getPointsHoles: function ( divisions ) {

		const holesPts = [];

		for ( let i = 0, l = this.holes.length; i < l; i ++ ) {

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

		for ( let i = 0, l = source.holes.length; i < l; i ++ ) {

			const hole = source.holes[ i ];

			this.holes.push( hole.clone() );

		}

		return this;

	},

	toJSON: function () {

		const data = Path.prototype.toJSON.call( this );

		data.uuid = this.uuid;
		data.holes = [];

		for ( let i = 0, l = this.holes.length; i < l; i ++ ) {

			const hole = this.holes[ i ];
			data.holes.push( hole.toJSON() );

		}

		return data;

	},

	fromJSON: function ( json ) {

		Path.prototype.fromJSON.call( this, json );

		this.uuid = json.uuid;
		this.holes = [];

		for ( let i = 0, l = json.holes.length; i < l; i ++ ) {

			const hole = json.holes[ i ];
			this.holes.push( new Path().fromJSON( hole ) );

		}

		return this;

	}

} );


export { Shape };
