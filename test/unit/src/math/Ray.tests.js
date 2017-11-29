/**
 * @author bhouston / http://exocortex.com
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { Ray } from '../../../../src/math/Ray';
import { Box3 } from '../../../../src/math/Box3';
import { Vector3 } from '../../../../src/math/Vector3';
import { Sphere } from '../../../../src/math/Sphere';
import { Plane } from '../../../../src/math/Plane';
import { Matrix4 } from '../../../../src/math/Matrix4';
import {
	zero3,
	one3,
	two3,
	eps
} from './Constants.tests';

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Ray', () => {

		// INSTANCING
		QUnit.test( "Instancing", ( assert ) => {

			var a = new Ray();
			assert.ok( a.origin.equals( zero3 ), "Passed!" );
			assert.ok( a.direction.equals( zero3 ), "Passed!" );

			var a = new Ray( two3.clone(), one3.clone() );
			assert.ok( a.origin.equals( two3 ), "Passed!" );
			assert.ok( a.direction.equals( one3 ), "Passed!" );

		} );

		// PUBLIC STUFF
		QUnit.todo( "isRay", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "set", ( assert ) => {

			var a = new Ray();

			a.set( one3, one3 );
			assert.ok( a.origin.equals( one3 ), "Passed!" );
			assert.ok( a.direction.equals( one3 ), "Passed!" );

		} );

		QUnit.test( "recast/clone", ( assert ) => {

			var a = new Ray( one3.clone(), new Vector3( 0, 0, 1 ) );

			assert.ok( a.recast( 0 ).equals( a ), "Passed!" );

			var b = a.clone();
			assert.ok( b.recast( - 1 ).equals( new Ray( new Vector3( 1, 1, 0 ), new Vector3( 0, 0, 1 ) ) ), "Passed!" );

			var c = a.clone();
			assert.ok( c.recast( 1 ).equals( new Ray( new Vector3( 1, 1, 2 ), new Vector3( 0, 0, 1 ) ) ), "Passed!" );

			var d = a.clone();
			var e = d.clone().recast( 1 );
			assert.ok( d.equals( a ), "Passed!" );
			assert.ok( ! e.equals( d ), "Passed!" );
			assert.ok( e.equals( c ), "Passed!" );

		} );

		QUnit.test( "copy/equals", ( assert ) => {

			var a = new Ray( zero3.clone(), one3.clone() );
			var b = new Ray().copy( a );
			assert.ok( b.origin.equals( zero3 ), "Passed!" );
			assert.ok( b.direction.equals( one3 ), "Passed!" );

			// ensure that it is a true copy
			a.origin = zero3;
			a.direction = one3;
			assert.ok( b.origin.equals( zero3 ), "Passed!" );
			assert.ok( b.direction.equals( one3 ), "Passed!" );

		} );

		QUnit.test( "at", ( assert ) => {

			var a = new Ray( one3.clone(), new Vector3( 0, 0, 1 ) );

			assert.ok( a.at( 0 ).equals( one3 ), "Passed!" );
			assert.ok( a.at( - 1 ).equals( new Vector3( 1, 1, 0 ) ), "Passed!" );
			assert.ok( a.at( 1 ).equals( new Vector3( 1, 1, 2 ) ), "Passed!" );

		} );

		QUnit.test( "lookAt", ( assert ) => {

			var a = new Ray( two3.clone(), one3.clone() );
			var target = one3.clone();
			var expected = target.sub( two3 ).normalize();

			a.lookAt( target );
			assert.ok( a.direction.equals( expected ), "Check if we're looking in the right direction" );

		} );

		QUnit.test( "closestPointToPoint", ( assert ) => {

			var a = new Ray( one3.clone(), new Vector3( 0, 0, 1 ) );

			// behind the ray
			var b = a.closestPointToPoint( zero3 );
			assert.ok( b.equals( one3 ), "Passed!" );

			// front of the ray
			var c = a.closestPointToPoint( new Vector3( 0, 0, 50 ) );
			assert.ok( c.equals( new Vector3( 1, 1, 50 ) ), "Passed!" );

			// exactly on the ray
			var d = a.closestPointToPoint( one3 );
			assert.ok( d.equals( one3 ), "Passed!" );

		} );

		QUnit.test( "distanceToPoint", ( assert ) => {

			var a = new Ray( one3.clone(), new Vector3( 0, 0, 1 ) );

			// behind the ray
			var b = a.distanceToPoint( zero3 );
			assert.ok( b === Math.sqrt( 3 ), "Passed!" );

			// front of the ray
			var c = a.distanceToPoint( new Vector3( 0, 0, 50 ) );
			assert.ok( c === Math.sqrt( 2 ), "Passed!" );

			// exactly on the ray
			var d = a.distanceToPoint( one3 );
			assert.ok( d === 0, "Passed!" );

		} );

		QUnit.test( "distanceSqToPoint", ( assert ) => {

			var a = new Ray( one3.clone(), new Vector3( 0, 0, 1 ) );

			// behind the ray
			var b = a.distanceSqToPoint( zero3 );
			assert.ok( b === 3, "Passed!" );

			// front of the ray
			var c = a.distanceSqToPoint( new Vector3( 0, 0, 50 ) );
			assert.ok( c === 2, "Passed!" );

			// exactly on the ray
			var d = a.distanceSqToPoint( one3 );
			assert.ok( d === 0, "Passed!" );

		} );

		QUnit.test( "distanceSqToSegment", ( assert ) => {

			var a = new Ray( one3.clone(), new Vector3( 0, 0, 1 ) );
			var ptOnLine = new Vector3();
			var ptOnSegment = new Vector3();

			//segment in front of the ray
			var v0 = new Vector3( 3, 5, 50 );
			var v1 = new Vector3( 50, 50, 50 ); // just a far away point
			var distSqr = a.distanceSqToSegment( v0, v1, ptOnLine, ptOnSegment );

			assert.ok( ptOnSegment.distanceTo( v0 ) < 0.0001, "Passed!" );
			assert.ok( ptOnLine.distanceTo( new Vector3( 1, 1, 50 ) ) < 0.0001, "Passed!" );
			// ((3-1) * (3-1) + (5-1) * (5-1) = 4 + 16 = 20
			assert.ok( Math.abs( distSqr - 20 ) < 0.0001, "Passed!" );

			//segment behind the ray
			var v0 = new Vector3( - 50, - 50, - 50 ); // just a far away point
			var v1 = new Vector3( - 3, - 5, - 4 );
			var distSqr = a.distanceSqToSegment( v0, v1, ptOnLine, ptOnSegment );

			assert.ok( ptOnSegment.distanceTo( v1 ) < 0.0001, "Passed!" );
			assert.ok( ptOnLine.distanceTo( one3 ) < 0.0001, "Passed!" );
			// ((-3-1) * (-3-1) + (-5-1) * (-5-1) + (-4-1) + (-4-1) = 16 + 36 + 25 = 77
			assert.ok( Math.abs( distSqr - 77 ) < 0.0001, "Passed!" );

			//exact intersection between the ray and the segment
			var v0 = new Vector3( - 50, - 50, - 50 );
			var v1 = new Vector3( 50, 50, 50 );
			var distSqr = a.distanceSqToSegment( v0, v1, ptOnLine, ptOnSegment );

			assert.ok( ptOnSegment.distanceTo( one3 ) < 0.0001, "Passed!" );
			assert.ok( ptOnLine.distanceTo( one3 ) < 0.0001, "Passed!" );
			assert.ok( distSqr < 0.0001, "Passed!" );

		} );

		QUnit.test( "intersectSphere", ( assert ) => {

			var TOL = 0.0001;

			// ray a0 origin located at ( 0, 0, 0 ) and points outward in negative-z direction
			var a0 = new Ray( zero3.clone(), new Vector3( 0, 0, - 1 ) );
			// ray a1 origin located at ( 1, 1, 1 ) and points left in negative-x direction
			var a1 = new Ray( one3.clone(), new Vector3( - 1, 0, 0 ) );

			// sphere (radius of 2) located behind ray a0, should result in null
			var b = new Sphere( new Vector3( 0, 0, 3 ), 2 );
			assert.ok( a0.intersectSphere( b ) === null, "Passed!" );

			// sphere (radius of 2) located in front of, but too far right of ray a0, should result in null
			var b = new Sphere( new Vector3( 3, 0, - 1 ), 2 );
			assert.ok( a0.intersectSphere( b ) === null, "Passed!" );

			// sphere (radius of 2) located below ray a1, should result in null
			var b = new Sphere( new Vector3( 1, - 2, 1 ), 2 );
			assert.ok( a1.intersectSphere( b ) === null, "Passed!" );

			// sphere (radius of 1) located to the left of ray a1, should result in intersection at 0, 1, 1
			var b = new Sphere( new Vector3( - 1, 1, 1 ), 1 );
			assert.ok( a1.intersectSphere( b ).distanceTo( new Vector3( 0, 1, 1 ) ) < TOL, "Passed!" );

			// sphere (radius of 1) located in front of ray a0, should result in intersection at 0, 0, -1
			var b = new Sphere( new Vector3( 0, 0, - 2 ), 1 );
			assert.ok( a0.intersectSphere( b ).distanceTo( new Vector3( 0, 0, - 1 ) ) < TOL, "Passed!" );

			// sphere (radius of 2) located in front & right of ray a0, should result in intersection at 0, 0, -1, or left-most edge of sphere
			var b = new Sphere( new Vector3( 2, 0, - 1 ), 2 );
			assert.ok( a0.intersectSphere( b ).distanceTo( new Vector3( 0, 0, - 1 ) ) < TOL, "Passed!" );

			// same situation as above, but move the sphere a fraction more to the right, and ray a0 should now just miss
			var b = new Sphere( new Vector3( 2.01, 0, - 1 ), 2 );
			assert.ok( a0.intersectSphere( b ) === null, "Passed!" );

			// following QUnit.tests are for situations where the ray origin is inside the sphere

			// sphere (radius of 1) center located at ray a0 origin / sphere surrounds the ray origin, so the first intersect point 0, 0, 1,
			// is behind ray a0.  Therefore, second exit point on back of sphere will be returned: 0, 0, -1
			// thus keeping the intersection point always in front of the ray.
			var b = new Sphere( zero3.clone(), 1 );
			assert.ok( a0.intersectSphere( b ).distanceTo( new Vector3( 0, 0, - 1 ) ) < TOL, "Passed!" );

			// sphere (radius of 4) center located behind ray a0 origin / sphere surrounds the ray origin, so the first intersect point 0, 0, 5,
			// is behind ray a0.  Therefore, second exit point on back of sphere will be returned: 0, 0, -3
			// thus keeping the intersection point always in front of the ray.
			var b = new Sphere( new Vector3( 0, 0, 1 ), 4 );
			assert.ok( a0.intersectSphere( b ).distanceTo( new Vector3( 0, 0, - 3 ) ) < TOL, "Passed!" );

			// sphere (radius of 4) center located in front of ray a0 origin / sphere surrounds the ray origin, so the first intersect point 0, 0, 3,
			// is behind ray a0.  Therefore, second exit point on back of sphere will be returned: 0, 0, -5
			// thus keeping the intersection point always in front of the ray.
			var b = new Sphere( new Vector3( 0, 0, - 1 ), 4 );
			assert.ok( a0.intersectSphere( b ).distanceTo( new Vector3( 0, 0, - 5 ) ) < TOL, "Passed!" );

		} );

		QUnit.test( "intersectsSphere", ( assert ) => {

			var a = new Ray( one3.clone(), new Vector3( 0, 0, 1 ) );
			var b = new Sphere( zero3, 0.5 );
			var c = new Sphere( zero3, 1.5 );
			var d = new Sphere( one3, 0.1 );
			var e = new Sphere( two3, 0.1 );
			var f = new Sphere( two3, 1 );

			assert.ok( ! a.intersectsSphere( b ), "Passed!" );
			assert.ok( ! a.intersectsSphere( c ), "Passed!" );
			assert.ok( a.intersectsSphere( d ), "Passed!" );
			assert.ok( ! a.intersectsSphere( e ), "Passed!" );
			assert.ok( ! a.intersectsSphere( f ), "Passed!" );

		} );

		QUnit.todo( "distanceToPlane", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "intersectPlane", ( assert ) => {

			var a = new Ray( one3.clone(), new Vector3( 0, 0, 1 ) );

			// parallel plane behind
			var b = new Plane().setFromNormalAndCoplanarPoint( new Vector3( 0, 0, 1 ), new Vector3( 1, 1, - 1 ) );
			assert.ok( a.intersectPlane( b ) === null, "Passed!" );

			// parallel plane coincident with origin
			var c = new Plane().setFromNormalAndCoplanarPoint( new Vector3( 0, 0, 1 ), new Vector3( 1, 1, 0 ) );
			assert.ok( a.intersectPlane( c ) === null, "Passed!" );

			// parallel plane infront
			var d = new Plane().setFromNormalAndCoplanarPoint( new Vector3( 0, 0, 1 ), new Vector3( 1, 1, 1 ) );
			assert.ok( a.intersectPlane( d ).equals( a.origin ), "Passed!" );

			// perpendical ray that overlaps exactly
			var e = new Plane().setFromNormalAndCoplanarPoint( new Vector3( 1, 0, 0 ), one3 );
			assert.ok( a.intersectPlane( e ).equals( a.origin ), "Passed!" );

			// perpendical ray that doesn't overlap
			var f = new Plane().setFromNormalAndCoplanarPoint( new Vector3( 1, 0, 0 ), zero3 );
			assert.ok( a.intersectPlane( f ) === null, "Passed!" );

		} );

		QUnit.test( "intersectsPlane", ( assert ) => {

			var a = new Ray( one3.clone(), new Vector3( 0, 0, 1 ) );

			// parallel plane in front of the ray
			var b = new Plane().setFromNormalAndCoplanarPoint( new Vector3( 0, 0, 1 ), one3.clone().sub( new Vector3( 0, 0, - 1 ) ) );
			assert.ok( a.intersectsPlane( b ), "Passed!" );

			// parallel plane coincident with origin
			var c = new Plane().setFromNormalAndCoplanarPoint( new Vector3( 0, 0, 1 ), one3.clone().sub( new Vector3( 0, 0, 0 ) ) );
			assert.ok( a.intersectsPlane( c ), "Passed!" );

			// parallel plane behind the ray
			var d = new Plane().setFromNormalAndCoplanarPoint( new Vector3( 0, 0, 1 ), one3.clone().sub( new Vector3( 0, 0, 1 ) ) );
			assert.ok( ! a.intersectsPlane( d ), "Passed!" );

			// perpendical ray that overlaps exactly
			var e = new Plane().setFromNormalAndCoplanarPoint( new Vector3( 1, 0, 0 ), one3 );
			assert.ok( a.intersectsPlane( e ), "Passed!" );

			// perpendical ray that doesn't overlap
			var f = new Plane().setFromNormalAndCoplanarPoint( new Vector3( 1, 0, 0 ), zero3 );
			assert.ok( ! a.intersectsPlane( f ), "Passed!" );

		} );

		QUnit.test( "intersectBox", ( assert ) => {

			var TOL = 0.0001;

			var box = new Box3( new Vector3( - 1, - 1, - 1 ), new Vector3( 1, 1, 1 ) );

			var a = new Ray( new Vector3( - 2, 0, 0 ), new Vector3( 1, 0, 0 ) );
			//ray should intersect box at -1,0,0
			assert.ok( a.intersectsBox( box ) === true, "Passed!" );
			assert.ok( a.intersectBox( box ).distanceTo( new Vector3( - 1, 0, 0 ) ) < TOL, "Passed!" );

			var b = new Ray( new Vector3( - 2, 0, 0 ), new Vector3( - 1, 0, 0 ) );
			//ray is point away from box, it should not intersect
			assert.ok( b.intersectsBox( box ) === false, "Passed!" );
			assert.ok( b.intersectBox( box ) === null, "Passed!" );

			var c = new Ray( new Vector3( 0, 0, 0 ), new Vector3( 1, 0, 0 ) );
			// ray is inside box, should return exit point
			assert.ok( c.intersectsBox( box ) === true, "Passed!" );
			assert.ok( c.intersectBox( box ).distanceTo( new Vector3( 1, 0, 0 ) ) < TOL, "Passed!" );

			var d = new Ray( new Vector3( 0, 2, 1 ), new Vector3( 0, - 1, - 1 ).normalize() );
			//tilted ray should intersect box at 0,1,0
			assert.ok( d.intersectsBox( box ) === true, "Passed!" );
			assert.ok( d.intersectBox( box ).distanceTo( new Vector3( 0, 1, 0 ) ) < TOL, "Passed!" );

			var e = new Ray( new Vector3( 1, - 2, 1 ), new Vector3( 0, 1, 0 ).normalize() );
			//handle case where ray is coplanar with one of the boxes side - box in front of ray
			assert.ok( e.intersectsBox( box ) === true, "Passed!" );
			assert.ok( e.intersectBox( box ).distanceTo( new Vector3( 1, - 1, 1 ) ) < TOL, "Passed!" );

			var f = new Ray( new Vector3( 1, - 2, 0 ), new Vector3( 0, - 1, 0 ).normalize() );
			//handle case where ray is coplanar with one of the boxes side - box behind ray
			assert.ok( f.intersectsBox( box ) === false, "Passed!" );
			assert.ok( f.intersectBox( box ) == null, "Passed!" );

		} );

		QUnit.todo( "intersectsBox", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "intersectTriangle", ( assert ) => {

			var ray = new Ray();
			var a = new Vector3( 1, 1, 0 );
			var b = new Vector3( 0, 1, 1 );
			var c = new Vector3( 1, 0, 1 );
			var intersect;

			// DdN == 0
			ray.set( ray.origin, zero3.clone() );
			intersect = ray.intersectTriangle( a, b, c, false );
			assert.strictEqual( intersect, null, "No intersection if direction == zero" );

			// DdN > 0, backfaceCulling = true
			ray.set( ray.origin, one3.clone() );
			intersect = ray.intersectTriangle( a, b, c, true );
			assert.strictEqual( intersect, null, "No intersection with backside faces if backfaceCulling is true" );

			// DdN > 0
			ray.set( ray.origin, one3.clone() );
			intersect = ray.intersectTriangle( a, b, c, false );
			assert.ok( Math.abs( intersect.x - 2 / 3 ) <= eps, "Successful intersection: check x" );
			assert.ok( Math.abs( intersect.y - 2 / 3 ) <= eps, "Successful intersection: check y" );
			assert.ok( Math.abs( intersect.z - 2 / 3 ) <= eps, "Successful intersection: check z" );

			// DdN > 0, DdQxE2 < 0
			b.multiplyScalar( - 1 );
			intersect = ray.intersectTriangle( a, b, c, false );
			assert.strictEqual( intersect, null, "No intersection" );

			// DdN > 0, DdE1xQ < 0
			a.multiplyScalar( - 1 );
			intersect = ray.intersectTriangle( a, b, c, false );
			assert.strictEqual( intersect, null, "No intersection" );

			// DdN > 0, DdQxE2 + DdE1xQ > DdN
			b.multiplyScalar( - 1 );
			intersect = ray.intersectTriangle( a, b, c, false );
			assert.strictEqual( intersect, null, "No intersection" );

			// DdN < 0, QdN < 0
			a.multiplyScalar( - 1 );
			b.multiplyScalar( - 1 );
			ray.direction.multiplyScalar( - 1 );
			intersect = ray.intersectTriangle( a, b, c, false );
			assert.strictEqual( intersect, null, "No intersection when looking in the wrong direction" );

		} );

		QUnit.test( "applyMatrix4", ( assert ) => {

			var a = new Ray( one3.clone(), new Vector3( 0, 0, 1 ) );
			var m = new Matrix4();

			assert.ok( a.clone().applyMatrix4( m ).equals( a ), "Passed!" );

			var a = new Ray( zero3.clone(), new Vector3( 0, 0, 1 ) );
			m.makeRotationZ( Math.PI );
			assert.ok( a.clone().applyMatrix4( m ).equals( a ), "Passed!" );

			m.makeRotationX( Math.PI );
			var b = a.clone();
			b.direction.negate();
			var a2 = a.clone().applyMatrix4( m );
			assert.ok( a2.origin.distanceTo( b.origin ) < 0.0001, "Passed!" );
			assert.ok( a2.direction.distanceTo( b.direction ) < 0.0001, "Passed!" );

			a.origin = new Vector3( 0, 0, 1 );
			b.origin = new Vector3( 0, 0, - 1 );
			var a2 = a.clone().applyMatrix4( m );
			assert.ok( a2.origin.distanceTo( b.origin ) < 0.0001, "Passed!" );
			assert.ok( a2.direction.distanceTo( b.direction ) < 0.0001, "Passed!" );

		} );

		QUnit.todo( "equals", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

	} );

} );
