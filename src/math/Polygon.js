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

		var result = new this.constructor();
		result.copy( this );
		return result;

	},

	copy: function ( polygon ) {

		this.points = Array.from( polygon.points );

	},

	empty: function () {

		// TODO (abelnation): implement
		return;

	},

	containsPoint: function ( point ) {

		// TODO (abelnation): implement
		return false;

	},

	distanceToPoint: function ( point ) {

		// TODO (abelnation): implement
		return 0;

	},

	intersectsSphere: function ( sphere ) {

		// TODO (abelnation): implement
		return false;

	},

	intersectsBox: function ( box ) {

		// TODO (abelnation): implement
		return false;

	},

	intersectsPlane: function ( plane ) {

		// TODO (abelnation): implement
		return false;

	},

	applyMatrix4: function ( matrix ) {

		// TODO (abelnation): implement
		return this;

	},

	translate: function ( offset ) {

		// TODO (abelnation): implement
		return this;

	},

	equals: function ( polygon ) {

		// TODO (abelnation): implement
		return false;

	}
};

THREE.Polygon.makeSquare = function ( dim ) {

	return THREE.Polygon.makeRectangle( dim, dim );

};

THREE.Polygon.makeRectangle = function ( width, height ) {

	width = ( width !== undefined ) ? width : 10;
	height = ( height !== undefined ) ? height : 10;

	var halfWidth = width / 2.0;
	var halfHeight = height / 2.0;

	return new THREE.Polygon( [
		new THREE.Vector3( - halfWidth,   halfHeight, 0 ),
		new THREE.Vector3(   halfWidth,   halfHeight, 0 ),
		new THREE.Vector3(   halfWidth, - halfHeight, 0 ),
		new THREE.Vector3( - halfWidth, - halfHeight, 0 )
	] );

}

THREE.Polygon.makeCircle = function ( radius, numPoints ) {

	radius = ( radius !== undefined ) ? radius : 10.0;
	numPoints = ( numPoints !== undefined ) ? numPoints : 5;

	var twoPi = Math.PI * 2.0;
	var theta = 0.0;
	var dTheta = twoPi / numPoints;

	var points = [];
	for ( var i = 0; i < numPoints; i ++ ) {

		theta = dTheta * i;
		points.push( new THREE.Vector3(
			Math.cos(theta) * radius,
			Math.sin(theta) * radius,
			0
		) );

	}

	return new THREE.Polygon( points );

}

THREE.Polygon.makeStar = function ( numPoints, outerRadius, innerRadius ) {

	numPoints = ( numPoints !== undefined ) ? numPoints : 5;
	outerRadius = ( outerRadius !== undefined ) ? outerRadius : 10.0;
	innerRadius = ( innerRadius !== undefined ) ? innerRadius : 5.0;

	var theta;
	var dTheta = ( Math.PI * 2.0 ) / numPoints / 2.0;
	var points = [];

	for ( var i = 0; i < numPoints; i ++ ) {

		theta = dTheta * i * 2;
		points.push( new THREE.Vector3(
			outerRadius * Math.cos(theta),
			outerRadius * Math.sin(theta),
			0 ) );

		theta += dTheta;
		points.push( new THREE.Vector3(
			innerRadius * Math.cos(theta),
			innerRadius * Math.sin(theta),
			0 ) );

	}

	return new THREE.Polygon( points );
}
