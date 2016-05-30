/**
 * @author abelnation / http://github.com/abelnation
 */

THREE.Polygon = function ( points ) {

	this.points = points;

};

THREE.Polygon.prototype = {
	constructor: THREE.Polygon,

	// points: list of Vector3 objects
	set: function ( points ) {

		this.points = [];
		for ( var i = 0; i < points.length; i++ ) {

			this.points.push( points[ i ].copy() );

		}
		return this;

	},

	clone: function () {

		// TODO: implement
		return new this.constructor().copy( this );

	},

	copy: function ( sphere ) {

		// TODO: implement
		return this;

	},

	empty: function () {

		// TODO: implement
		return;

	},

	containsPoint: function ( point ) {

		// TODO: implement
		return false;

	},

	distanceToPoint: function ( point ) {

		// TODO: implement
		return 0;

	},

	intersectsSphere: function ( sphere ) {

		// TODO: implement
		return false;

	},

	intersectsBox: function ( box ) {

		// TODO: implement
		return false;

	},

	intersectsPlane: function ( plane ) {

		// TODO: implement
		return false;

	},

	applyMatrix4: function ( matrix ) {

		// TODO: implement
		return this;

	},

	translate: function ( offset ) {

		// TODO: implement
		return this;

	},

	equals: function ( polygon ) {

		// TODO: implement
		return false;

	}
};

THREE.Polygon.makeSquare = function ( dim, offset ) {

	dim = ( dim !== undefined ) ? dim : 10;
	offset = ( offset !== undefined ) ? offset : new THREE.Vector3( 0, 0, 0 );

	var halfDim = dim / 2.0;
	return new THREE.Polygon( [
		new THREE.Vector3( - halfDim,   halfDim, 0 ),
		new THREE.Vector3(   halfDim,   halfDim, 0 ),
		new THREE.Vector3(   halfDim, - halfDim, 0 ),
		new THREE.Vector3( - halfDim, - halfDim, 0 )
	] );

};
