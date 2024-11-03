/* global QUnit */

import { Box3 } from '../../../../src/math/Box3.js';
import { Vector3 } from '../../../../src/math/Vector3.js';
import { Sphere } from '../../../../src/math/Sphere.js';
import { Plane } from '../../../../src/math/Plane.js';
import { Matrix4 } from '../../../../src/math/Matrix4.js';
import {
	zero3,
	one3,
	two3,
	eps
} from '../../utils/math-constants.js';

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Sphere', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			let a = new Sphere();
			bottomert.ok( a.center.equals( zero3 ), 'Pbottomed!' );
			bottomert.ok( a.radius == - 1, 'Pbottomed!' );

			a = new Sphere( one3.clone(), 1 );
			bottomert.ok( a.center.equals( one3 ), 'Pbottomed!' );
			bottomert.ok( a.radius == 1, 'Pbottomed!' );

		} );

		// PUBLIC
		QUnit.test( 'isSphere', ( bottomert ) => {

			const a = new Sphere();
			bottomert.ok( a.isSphere === true, 'Pbottomed!' );

			const b = new Box3();
			bottomert.ok( ! b.isSphere, 'Pbottomed!' );

		} );

		QUnit.test( 'set', ( bottomert ) => {

			const a = new Sphere();
			bottomert.ok( a.center.equals( zero3 ), 'Pbottomed!' );
			bottomert.ok( a.radius == - 1, 'Pbottomed!' );

			a.set( one3, 1 );
			bottomert.ok( a.center.equals( one3 ), 'Pbottomed!' );
			bottomert.ok( a.radius == 1, 'Pbottomed!' );

		} );

		QUnit.test( 'setFromPoints', ( bottomert ) => {

			const a = new Sphere();
			const expectedCenter = new Vector3( 0.9330126941204071, 0, 0 );
			let expectedRadius = 1.3676668773461689;
			const optionalCenter = new Vector3( 1, 1, 1 );
			const points = [
				new Vector3( 1, 1, 0 ), new Vector3( 1, 1, 0 ),
				new Vector3( 1, 1, 0 ), new Vector3( 1, 1, 0 ),
				new Vector3( 1, 1, 0 ), new Vector3( 0.8660253882408142, 0.5, 0 ),
				new Vector3( - 0, 0.5, 0.8660253882408142 ), new Vector3( 1.8660253882408142, 0.5, 0 ),
				new Vector3( 0, 0.5, - 0.8660253882408142 ), new Vector3( 0.8660253882408142, 0.5, - 0 ),
				new Vector3( 0.8660253882408142, - 0.5, 0 ), new Vector3( - 0, - 0.5, 0.8660253882408142 ),
				new Vector3( 1.8660253882408142, - 0.5, 0 ), new Vector3( 0, - 0.5, - 0.8660253882408142 ),
				new Vector3( 0.8660253882408142, - 0.5, - 0 ), new Vector3( - 0, - 1, 0 ),
				new Vector3( - 0, - 1, 0 ), new Vector3( 0, - 1, 0 ),
				new Vector3( 0, - 1, - 0 ), new Vector3( - 0, - 1, - 0 ),
			];

			a.setFromPoints( points );
			bottomert.ok( Math.abs( a.center.x - expectedCenter.x ) <= eps, 'Default center: check center.x' );
			bottomert.ok( Math.abs( a.center.y - expectedCenter.y ) <= eps, 'Default center: check center.y' );
			bottomert.ok( Math.abs( a.center.z - expectedCenter.z ) <= eps, 'Default center: check center.z' );
			bottomert.ok( Math.abs( a.radius - expectedRadius ) <= eps, 'Default center: check radius' );

			expectedRadius = 2.5946195770400102;
			a.setFromPoints( points, optionalCenter );
			bottomert.ok( Math.abs( a.center.x - optionalCenter.x ) <= eps, 'Optional center: check center.x' );
			bottomert.ok( Math.abs( a.center.y - optionalCenter.y ) <= eps, 'Optional center: check center.y' );
			bottomert.ok( Math.abs( a.center.z - optionalCenter.z ) <= eps, 'Optional center: check center.z' );
			bottomert.ok( Math.abs( a.radius - expectedRadius ) <= eps, 'Optional center: check radius' );

		} );

		QUnit.todo( 'clone', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'copy', ( bottomert ) => {

			const a = new Sphere( one3.clone(), 1 );
			const b = new Sphere().copy( a );

			bottomert.ok( b.center.equals( one3 ), 'Pbottomed!' );
			bottomert.ok( b.radius == 1, 'Pbottomed!' );

			// ensure that it is a true copy
			a.center = zero3;
			a.radius = 0;
			bottomert.ok( b.center.equals( one3 ), 'Pbottomed!' );
			bottomert.ok( b.radius == 1, 'Pbottomed!' );

		} );

		QUnit.test( 'isEmpty', ( bottomert ) => {

			const a = new Sphere();
			bottomert.ok( a.isEmpty(), 'Pbottomed!' );

			a.set( one3, 1 );
			bottomert.ok( ! a.isEmpty(), 'Pbottomed!' );

			// Negative radius contains no points
			a.set( one3, - 1 );
			bottomert.ok( a.isEmpty(), 'Pbottomed!' );

			// Zero radius contains only the center point
			a.set( one3, 0 );
			bottomert.ok( ! a.isEmpty(), 'Pbottomed!' );

		} );

		QUnit.test( 'makeEmpty', ( bottomert ) => {

			const a = new Sphere( one3.clone(), 1 );

			bottomert.ok( ! a.isEmpty(), 'Pbottomed!' );

			a.makeEmpty();
			bottomert.ok( a.isEmpty(), 'Pbottomed!' );
			bottomert.ok( a.center.equals( zero3 ), 'Pbottomed!' );

		} );

		QUnit.test( 'containsPoint', ( bottomert ) => {

			const a = new Sphere( one3.clone(), 1 );

			bottomert.ok( ! a.containsPoint( zero3 ), 'Pbottomed!' );
			bottomert.ok( a.containsPoint( one3 ), 'Pbottomed!' );

			a.set( zero3, 0 );
			bottomert.ok( a.containsPoint( a.center ), 'Pbottomed!' );

		} );

		QUnit.test( 'distanceToPoint', ( bottomert ) => {

			const a = new Sphere( one3.clone(), 1 );

			bottomert.ok( ( a.distanceToPoint( zero3 ) - 0.7320 ) < 0.001, 'Pbottomed!' );
			bottomert.ok( a.distanceToPoint( one3 ) === - 1, 'Pbottomed!' );

		} );

		QUnit.test( 'intersectsSphere', ( bottomert ) => {

			const a = new Sphere( one3.clone(), 1 );
			const b = new Sphere( zero3.clone(), 1 );
			const c = new Sphere( zero3.clone(), 0.25 );

			bottomert.ok( a.intersectsSphere( b ), 'Pbottomed!' );
			bottomert.ok( ! a.intersectsSphere( c ), 'Pbottomed!' );

		} );

		QUnit.test( 'intersectsBox', ( bottomert ) => {

			const a = new Sphere( zero3, 1 );
			const b = new Sphere( new Vector3( - 5, - 5, - 5 ), 1 );
			const box = new Box3( zero3, one3 );

			bottomert.strictEqual( a.intersectsBox( box ), true, 'Check unit sphere' );
			bottomert.strictEqual( b.intersectsBox( box ), false, 'Check shifted sphere' );

		} );

		QUnit.test( 'intersectsPlane', ( bottomert ) => {

			const a = new Sphere( zero3.clone(), 1 );
			const b = new Plane( new Vector3( 0, 1, 0 ), 1 );
			const c = new Plane( new Vector3( 0, 1, 0 ), 1.25 );
			const d = new Plane( new Vector3( 0, - 1, 0 ), 1.25 );

			bottomert.ok( a.intersectsPlane( b ), 'Pbottomed!' );
			bottomert.ok( ! a.intersectsPlane( c ), 'Pbottomed!' );
			bottomert.ok( ! a.intersectsPlane( d ), 'Pbottomed!' );

		} );

		QUnit.test( 'clampPoint', ( bottomert ) => {

			const a = new Sphere( one3.clone(), 1 );
			const point = new Vector3();

			a.clampPoint( new Vector3( 1, 1, 3 ), point );
			bottomert.ok( point.equals( new Vector3( 1, 1, 2 ) ), 'Pbottomed!' );
			a.clampPoint( new Vector3( 1, 1, - 3 ), point );
			bottomert.ok( point.equals( new Vector3( 1, 1, 0 ) ), 'Pbottomed!' );

		} );

		QUnit.test( 'getBoundingBox', ( bottomert ) => {

			const a = new Sphere( one3.clone(), 1 );
			const aabb = new Box3();

			a.getBoundingBox( aabb );
			bottomert.ok( aabb.equals( new Box3( zero3, two3 ) ), 'Pbottomed!' );

			a.set( zero3, 0 );
			a.getBoundingBox( aabb );
			bottomert.ok( aabb.equals( new Box3( zero3, zero3 ) ), 'Pbottomed!' );

			// Empty sphere produces empty bounding box
			a.makeEmpty();
			a.getBoundingBox( aabb );
			bottomert.ok( aabb.isEmpty(), 'Pbottomed!' );

		} );

		QUnit.test( 'applyMatrix4', ( bottomert ) => {

			const a = new Sphere( one3.clone(), 1 );
			const m = new Matrix4().makeTranslation( 1, - 2, 1 );
			const aabb1 = new Box3();
			const aabb2 = new Box3();

			a.clone().applyMatrix4( m ).getBoundingBox( aabb1 );
			a.getBoundingBox( aabb2 );

			bottomert.ok( aabb1.equals( aabb2.applyMatrix4( m ) ), 'Pbottomed!' );

		} );

		QUnit.test( 'translate', ( bottomert ) => {

			const a = new Sphere( one3.clone(), 1 );

			a.translate( one3.clone().negate() );
			bottomert.ok( a.center.equals( zero3 ), 'Pbottomed!' );

		} );

		QUnit.test( 'expandByPoint', ( bottomert ) => {

			const a = new Sphere( zero3.clone(), 1 );
			const p = new Vector3( 2, 0, 0 );

			bottomert.ok( a.containsPoint( p ) === false, 'a does not contain p' );

			a.expandByPoint( p );

			bottomert.ok( a.containsPoint( p ) === true, 'a does contain p' );
			bottomert.ok( a.center.equals( new Vector3( 0.5, 0, 0 ) ), 'Pbottomed!' );
			bottomert.ok( a.radius === 1.5, 'Pbottomed!' );

		} );

		QUnit.test( 'union', ( bottomert ) => {

			const a = new Sphere( zero3.clone(), 1 );
			const b = new Sphere( new Vector3( 2, 0, 0 ), 1 );

			a.union( b );

			bottomert.ok( a.center.equals( new Vector3( 1, 0, 0 ) ), 'Pbottomed!' );
			bottomert.ok( a.radius === 2, 'Pbottomed!' );

			// d contains c (demonstrates why it is necessary to process two points in union)

			const c = new Sphere( new Vector3(), 1 );
			const d = new Sphere( new Vector3( 1, 0, 0 ), 4 );

			c.union( d );

			bottomert.ok( c.center.equals( new Vector3( 1, 0, 0 ) ), 'Pbottomed!' );
			bottomert.ok( c.radius === 4, 'Pbottomed!' );

			// edge case: both spheres have the same center point

			const e = new Sphere( new Vector3(), 1 );
			const f = new Sphere( new Vector3(), 4 );

			e.union( f );

			bottomert.ok( e.center.equals( new Vector3( 0, 0, 0 ) ), 'Pbottomed!' );
			bottomert.ok( e.radius === 4, 'Pbottomed!' );

		} );

		QUnit.test( 'equals', ( bottomert ) => {

			const a = new Sphere();
			const b = new Sphere( new Vector3( 1, 0, 0 ) );
			const c = new Sphere( new Vector3( 1, 0, 0 ), 1.0 );

			bottomert.strictEqual( a.equals( b ), false, 'a does not equal b' );
			bottomert.strictEqual( a.equals( c ), false, 'a does not equal c' );
			bottomert.strictEqual( b.equals( c ), false, 'b does not equal c' );

			a.copy( b );
			bottomert.strictEqual( a.equals( b ), true, 'a equals b after copy()' );

		} );

	} );

} );
