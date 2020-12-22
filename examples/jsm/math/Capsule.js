import {
	Vector3
} from "../../../build/three.module.js";


var Capsule = ( function () {

	var _v1 = new Vector3();
	var _v2 = new Vector3();
	var _v3 = new Vector3();

	var EPS = 1e-10;

	function Capsule( start, end, radius ) {

		this.start = start == undefined ? new Vector3( 0, 0, 0 ) : start;
		this.end = end == undefined ? new Vector3( 0, 1, 0 ) : end;
		this.radius = radius == undefined ? 1 : radius;

	}

	Object.assign( Capsule.prototype, {

		clone: function () {

			return new Capsule( this.start.clone(), this.end.clone(), this.radius );

		},

		set: function ( start, end, radius ) {

			this.start.copy( start );
			this.end.copy( end );
			this.radius = radius;

		},

		copy: function ( capsule ) {

			this.start.copy( capsule.start );
			this.end.copy( capsule.end );
			this.radius = capsule.radius;

		},

		getCenter: function ( target ) {

			return target.copy( this.end ).add( this.start ).multiplyScalar( 0.5 );

		},

		translate: function ( v ) {

			this.start.add( v );
			this.end.add( v );

		},

		checkAABBAxis: function ( p1x, p1y, p2x, p2y, minx, maxx, miny, maxy, radius ) {

			return (
				( minx - p1x < radius || minx - p2x < radius ) &&
				( p1x - maxx < radius || p2x - maxx < radius ) &&
				( miny - p1y < radius || miny - p2y < radius ) &&
				( p1y - maxy < radius || p2y - maxy < radius )
			);

		},

		intersectsBox: function ( box ) {

			return (
				this.checkAABBAxis(
					this.start.x, this.start.y, this.end.x, this.end.y,
					box.min.x, box.max.x, box.min.y, box.max.y,
					this.radius ) &&
				this.checkAABBAxis(
					this.start.x, this.start.z, this.end.x, this.end.z,
					box.min.x, box.max.x, box.min.z, box.max.z,
					this.radius ) &&
				this.checkAABBAxis(
					this.start.y, this.start.z, this.end.y, this.end.z,
					box.min.y, box.max.y, box.min.z, box.max.z,
					this.radius )
			);

		},

		lineLineMinimumPoints: function ( line1, line2 ) {

			var r = _v1.copy( line1.end ).sub( line1.start );
			var s = _v2.copy( line2.end ).sub( line2.start );
			var w = _v3.copy( line2.start ).sub( line1.start );

			var a = r.dot( s ),
				b = r.dot( r ),
				c = s.dot( s ),
				d = s.dot( w ),
				e = r.dot( w );

			var t1, t2, divisor = b * c - a * a;

			if ( Math.abs( divisor ) < EPS ) {

				var d1 = - d / c;
				var d2 = ( a - d ) / c;

				if ( Math.abs( d1 - 0.5 ) < Math.abs( d2 - 0.5 ) ) {

					t1 = 0;
					t2 = d1;

				} else {

					t1 = 1;
					t2 = d2;

				}

			} else {

				t1 = ( d * a + e * c ) / divisor;
				t2 = ( t1 * a - d ) / c;

			}

			t2 = Math.max( 0, Math.min( 1, t2 ) );
			t1 = Math.max( 0, Math.min( 1, t1 ) );

			var point1 = r.multiplyScalar( t1 ).add( line1.start );
			var point2 = s.multiplyScalar( t2 ).add( line2.start );

			return [ point1, point2 ];

		}

	} );

	return Capsule;

} )();

export { Capsule };
