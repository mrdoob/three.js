import {
	Vector3
} from '../../../build/three.module.js';

const _v1 = new Vector3();
const _v2 = new Vector3();
const _v3 = new Vector3();

const EPS = 1e-10;

class Capsule {

	constructor( start = new Vector3( 0, 0, 0 ), end = new Vector3( 0, 1, 0 ), radius = 1 ) {

		this.start = start;
		this.end = end;
		this.radius = radius;

	}

	clone() {

		return new Capsule( this.start.clone(), this.end.clone(), this.radius );

	}

	set( start, end, radius ) {

		this.start.copy( start );
		this.end.copy( end );
		this.radius = radius;

	}

	copy( capsule ) {

		this.start.copy( capsule.start );
		this.end.copy( capsule.end );
		this.radius = capsule.radius;

	}

	getCenter( target ) {

		return target.copy( this.end ).add( this.start ).multiplyScalar( 0.5 );

	}

	translate( v ) {

		this.start.add( v );
		this.end.add( v );

	}

	checkAABBAxis( p1x, p1y, p2x, p2y, minx, maxx, miny, maxy, radius ) {

		return (
			( minx - p1x < radius || minx - p2x < radius ) &&
			( p1x - maxx < radius || p2x - maxx < radius ) &&
			( miny - p1y < radius || miny - p2y < radius ) &&
			( p1y - maxy < radius || p2y - maxy < radius )
		);

	}

	intersectsBox( box ) {

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

	}

	lineLineMinimumPoints( line1, line2 ) {

		const r = _v1.copy( line1.end ).sub( line1.start );
		const s = _v2.copy( line2.end ).sub( line2.start );
		const w = _v3.copy( line2.start ).sub( line1.start );

		const a = r.dot( s ),
			b = r.dot( r ),
			c = s.dot( s ),
			d = s.dot( w ),
			e = r.dot( w );

		let t1, t2;
		const divisor = b * c - a * a;

		if ( Math.abs( divisor ) < EPS ) {

			const d1 = - d / c;
			const d2 = ( a - d ) / c;

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

		const point1 = r.multiplyScalar( t1 ).add( line1.start );
		const point2 = s.multiplyScalar( t2 ).add( line2.start );

		return [ point1, point2 ];

	}

}

export { Capsule };
