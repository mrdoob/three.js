import { Vector3 } from './Vector3.js';
import { Line3 } from './Line3.js';
import { Plane } from './Plane.js';

/**
 * @author bhouston / http://clara.io
 * @author mrdoob / http://mrdoob.com/
 */

function Triangle( a, b, c ) {

	this.a = ( a !== undefined ) ? a : new Vector3();
	this.b = ( b !== undefined ) ? b : new Vector3();
	this.c = ( c !== undefined ) ? c : new Vector3();

}

Object.assign( Triangle, {

	normal: function () {

		var v0 = new Vector3();

		return function normal( a, b, c, optionalTarget ) {

			var result = optionalTarget || new Vector3();

			result.subVectors( c, b );
			v0.subVectors( a, b );
			result.cross( v0 );

			var resultLengthSq = result.lengthSq();
			if ( resultLengthSq > 0 ) {

				return result.multiplyScalar( 1 / Math.sqrt( resultLengthSq ) );

			}

			return result.set( 0, 0, 0 );

		};

	}(),

	// static/instance method to calculate barycentric coordinates
	// based on: http://www.blackpawn.com/texts/pointinpoly/default.html
	barycoordFromPoint: function () {

		var v0 = new Vector3();
		var v1 = new Vector3();
		var v2 = new Vector3();

		return function barycoordFromPoint( point, a, b, c, optionalTarget ) {

			v0.subVectors( c, a );
			v1.subVectors( b, a );
			v2.subVectors( point, a );

			var dot00 = v0.dot( v0 );
			var dot01 = v0.dot( v1 );
			var dot02 = v0.dot( v2 );
			var dot11 = v1.dot( v1 );
			var dot12 = v1.dot( v2 );

			var denom = ( dot00 * dot11 - dot01 * dot01 );

			var result = optionalTarget || new Vector3();

			// collinear or singular triangle
			if ( denom === 0 ) {

				// arbitrary location outside of triangle?
				// not sure if this is the best idea, maybe should be returning undefined
				return result.set( - 2, - 1, - 1 );

			}

			var invDenom = 1 / denom;
			var u = ( dot11 * dot02 - dot01 * dot12 ) * invDenom;
			var v = ( dot00 * dot12 - dot01 * dot02 ) * invDenom;

			// barycentric coordinates must always sum to 1
			return result.set( 1 - u - v, v, u );

		};

	}(),

	containsPoint: function () {

		var v1 = new Vector3();

		return function containsPoint( point, a, b, c ) {

			var result = Triangle.barycoordFromPoint( point, a, b, c, v1 );

			return ( result.x >= 0 ) && ( result.y >= 0 ) && ( ( result.x + result.y ) <= 1 );

		};

	}()

} );

Object.assign( Triangle.prototype, {

	set: function ( a, b, c ) {

		this.a.copy( a );
		this.b.copy( b );
		this.c.copy( c );

		return this;

	},

	setFromPointsAndIndices: function ( points, i0, i1, i2 ) {

		this.a.copy( points[ i0 ] );
		this.b.copy( points[ i1 ] );
		this.c.copy( points[ i2 ] );

		return this;

	},

	clone: function () {

		return new this.constructor().copy( this );

	},

	copy: function ( triangle ) {

		this.a.copy( triangle.a );
		this.b.copy( triangle.b );
		this.c.copy( triangle.c );

		return this;

	},

	area: function () {

		var v0 = new Vector3();
		var v1 = new Vector3();

		return function area() {

			v0.subVectors( this.c, this.b );
			v1.subVectors( this.a, this.b );

			return v0.cross( v1 ).length() * 0.5;

		};

	}(),

	midpoint: function ( optionalTarget ) {

		var result = optionalTarget || new Vector3();
		return result.addVectors( this.a, this.b ).add( this.c ).multiplyScalar( 1 / 3 );

	},

	normal: function ( optionalTarget ) {

		return Triangle.normal( this.a, this.b, this.c, optionalTarget );

	},

	plane: function ( optionalTarget ) {

		var result = optionalTarget || new Plane();

		return result.setFromCoplanarPoints( this.a, this.b, this.c );

	},

	barycoordFromPoint: function ( point, optionalTarget ) {

		return Triangle.barycoordFromPoint( point, this.a, this.b, this.c, optionalTarget );

	},

	containsPoint: function ( point ) {

		return Triangle.containsPoint( point, this.a, this.b, this.c );

	},

	intersectsBox: function ( box ) {

		return box.intersectsTriangle( this );

	},

	closestPointToPoint: function () {

		var plane = new Plane();
		var edgeList = [ new Line3(), new Line3(), new Line3() ];
		var projectedPoint = new Vector3();
		var closestPoint = new Vector3();

		return function closestPointToPoint( point, optionalTarget ) {

			var result = optionalTarget || new Vector3();
			var minDistance = Infinity;

			// project the point onto the plane of the triangle

			plane.setFromCoplanarPoints( this.a, this.b, this.c );
			plane.projectPoint( point, projectedPoint );

			// check if the projection lies within the triangle

			if ( this.containsPoint( projectedPoint ) === true ) {

				// if so, this is the closest point

				result.copy( projectedPoint );

			} else {

				// if not, the point falls outside the triangle. the result is the closest point to the triangle's edges or vertices

				edgeList[ 0 ].set( this.a, this.b );
				edgeList[ 1 ].set( this.b, this.c );
				edgeList[ 2 ].set( this.c, this.a );

				for ( var i = 0; i < edgeList.length; i ++ ) {

					edgeList[ i ].closestPointToPoint( projectedPoint, true, closestPoint );

					var distance = projectedPoint.distanceToSquared( closestPoint );

					if ( distance < minDistance ) {

						minDistance = distance;

						result.copy( closestPoint );

					}

				}

			}

			return result;

		};

	}(),

	equals: function ( triangle ) {

		return triangle.a.equals( this.a ) && triangle.b.equals( this.b ) && triangle.c.equals( this.c );

	}

} );


export { Triangle };
