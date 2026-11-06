import { assert, describe, test } from 'vitest';

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

describe( 'Maths', () => {

	describe( 'Sphere', () => {

		// INSTANCING
		test( 'Instancing', () => {

			let a = new Sphere();
			assert.ok( a.center.equals( zero3 ), 'Passed!' );
			assert.ok( a.radius == - 1, 'Passed!' );

			a = new Sphere( one3.clone(), 1 );
			assert.ok( a.center.equals( one3 ), 'Passed!' );
			assert.ok( a.radius == 1, 'Passed!' );

		} );

		// PUBLIC
		test( 'isSphere', () => {

			const a = new Sphere();
			assert.ok( a.isSphere === true, 'Passed!' );

			const b = new Box3();
			assert.ok( ! b.isSphere, 'Passed!' );

		} );

		test( 'set', () => {

			const a = new Sphere();
			assert.ok( a.center.equals( zero3 ), 'Passed!' );
			assert.ok( a.radius == - 1, 'Passed!' );

			a.set( one3, 1 );
			assert.ok( a.center.equals( one3 ), 'Passed!' );
			assert.ok( a.radius == 1, 'Passed!' );

		} );

		test( 'setFromPoints', () => {

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
			assert.ok( Math.abs( a.center.x - expectedCenter.x ) <= eps, 'Default center: check center.x' );
			assert.ok( Math.abs( a.center.y - expectedCenter.y ) <= eps, 'Default center: check center.y' );
			assert.ok( Math.abs( a.center.z - expectedCenter.z ) <= eps, 'Default center: check center.z' );
			assert.ok( Math.abs( a.radius - expectedRadius ) <= eps, 'Default center: check radius' );

			expectedRadius = 2.5946195770400102;
			a.setFromPoints( points, optionalCenter );
			assert.ok( Math.abs( a.center.x - optionalCenter.x ) <= eps, 'Optional center: check center.x' );
			assert.ok( Math.abs( a.center.y - optionalCenter.y ) <= eps, 'Optional center: check center.y' );
			assert.ok( Math.abs( a.center.z - optionalCenter.z ) <= eps, 'Optional center: check center.z' );
			assert.ok( Math.abs( a.radius - expectedRadius ) <= eps, 'Optional center: check radius' );

		} );

		test( 'copy', () => {

			const a = new Sphere( one3.clone(), 1 );
			const b = new Sphere().copy( a );

			assert.ok( b.center.equals( one3 ), 'Passed!' );
			assert.ok( b.radius == 1, 'Passed!' );

			// ensure that it is a true copy
			a.center = zero3;
			a.radius = 0;
			assert.ok( b.center.equals( one3 ), 'Passed!' );
			assert.ok( b.radius == 1, 'Passed!' );

		} );

		test( 'isEmpty', () => {

			const a = new Sphere();
			assert.ok( a.isEmpty(), 'Passed!' );

			a.set( one3, 1 );
			assert.ok( ! a.isEmpty(), 'Passed!' );

			// Negative radius contains no points
			a.set( one3, - 1 );
			assert.ok( a.isEmpty(), 'Passed!' );

			// Zero radius contains only the center point
			a.set( one3, 0 );
			assert.ok( ! a.isEmpty(), 'Passed!' );

		} );

		test( 'makeEmpty', () => {

			const a = new Sphere( one3.clone(), 1 );

			assert.ok( ! a.isEmpty(), 'Passed!' );

			a.makeEmpty();
			assert.ok( a.isEmpty(), 'Passed!' );
			assert.ok( a.center.equals( zero3 ), 'Passed!' );

		} );

		test( 'containsPoint', () => {

			const a = new Sphere( one3.clone(), 1 );

			assert.ok( ! a.containsPoint( zero3 ), 'Passed!' );
			assert.ok( a.containsPoint( one3 ), 'Passed!' );

			a.set( zero3, 0 );
			assert.ok( a.containsPoint( a.center ), 'Passed!' );

		} );

		test( 'distanceToPoint', () => {

			const a = new Sphere( one3.clone(), 1 );

			assert.ok( ( a.distanceToPoint( zero3 ) - 0.7320 ) < 0.001, 'Passed!' );
			assert.ok( a.distanceToPoint( one3 ) === - 1, 'Passed!' );

		} );

		test( 'intersectsSphere', () => {

			const a = new Sphere( one3.clone(), 1 );
			const b = new Sphere( zero3.clone(), 1 );
			const c = new Sphere( zero3.clone(), 0.25 );

			assert.ok( a.intersectsSphere( b ), 'Passed!' );
			assert.ok( ! a.intersectsSphere( c ), 'Passed!' );

		} );

		test( 'intersectsBox', () => {

			const a = new Sphere( zero3, 1 );
			const b = new Sphere( new Vector3( - 5, - 5, - 5 ), 1 );
			const box = new Box3( zero3, one3 );

			assert.strictEqual( a.intersectsBox( box ), true, 'Check unit sphere' );
			assert.strictEqual( b.intersectsBox( box ), false, 'Check shifted sphere' );

		} );

		test( 'intersectsPlane', () => {

			const a = new Sphere( zero3.clone(), 1 );
			const b = new Plane( new Vector3( 0, 1, 0 ), 1 );
			const c = new Plane( new Vector3( 0, 1, 0 ), 1.25 );
			const d = new Plane( new Vector3( 0, - 1, 0 ), 1.25 );

			assert.ok( a.intersectsPlane( b ), 'Passed!' );
			assert.ok( ! a.intersectsPlane( c ), 'Passed!' );
			assert.ok( ! a.intersectsPlane( d ), 'Passed!' );

		} );

		test( 'clampPoint', () => {

			const a = new Sphere( one3.clone(), 1 );
			const point = new Vector3();

			a.clampPoint( new Vector3( 1, 1, 3 ), point );
			assert.ok( point.equals( new Vector3( 1, 1, 2 ) ), 'Passed!' );
			a.clampPoint( new Vector3( 1, 1, - 3 ), point );
			assert.ok( point.equals( new Vector3( 1, 1, 0 ) ), 'Passed!' );

		} );

		test( 'getBoundingBox', () => {

			const a = new Sphere( one3.clone(), 1 );
			const aabb = new Box3();

			a.getBoundingBox( aabb );
			assert.ok( aabb.equals( new Box3( zero3, two3 ) ), 'Passed!' );

			a.set( zero3, 0 );
			a.getBoundingBox( aabb );
			assert.ok( aabb.equals( new Box3( zero3, zero3 ) ), 'Passed!' );

			// Empty sphere produces empty bounding box
			a.makeEmpty();
			a.getBoundingBox( aabb );
			assert.ok( aabb.isEmpty(), 'Passed!' );

		} );

		test( 'applyMatrix4', () => {

			const a = new Sphere( one3.clone(), 1 );
			const m = new Matrix4().makeTranslation( 1, - 2, 1 );
			const aabb1 = new Box3();
			const aabb2 = new Box3();

			a.clone().applyMatrix4( m ).getBoundingBox( aabb1 );
			a.getBoundingBox( aabb2 );

			assert.ok( aabb1.equals( aabb2.applyMatrix4( m ) ), 'Passed!' );

		} );

		test( 'translate', () => {

			const a = new Sphere( one3.clone(), 1 );

			a.translate( one3.clone().negate() );
			assert.ok( a.center.equals( zero3 ), 'Passed!' );

		} );

		test( 'expandByPoint', () => {

			const a = new Sphere( zero3.clone(), 1 );
			const p = new Vector3( 2, 0, 0 );

			assert.ok( a.containsPoint( p ) === false, 'a does not contain p' );

			a.expandByPoint( p );

			assert.ok( a.containsPoint( p ) === true, 'a does contain p' );
			assert.ok( a.center.equals( new Vector3( 0.5, 0, 0 ) ), 'Passed!' );
			assert.ok( a.radius === 1.5, 'Passed!' );

		} );

		test( 'union', () => {

			const a = new Sphere( zero3.clone(), 1 );
			const b = new Sphere( new Vector3( 2, 0, 0 ), 1 );

			a.union( b );

			assert.ok( a.center.equals( new Vector3( 1, 0, 0 ) ), 'Passed!' );
			assert.ok( a.radius === 2, 'Passed!' );

			// d contains c (demonstrates why it is necessary to process two points in union)

			const c = new Sphere( new Vector3(), 1 );
			const d = new Sphere( new Vector3( 1, 0, 0 ), 4 );

			c.union( d );

			assert.ok( c.center.equals( new Vector3( 1, 0, 0 ) ), 'Passed!' );
			assert.ok( c.radius === 4, 'Passed!' );

			// edge case: both spheres have the same center point

			const e = new Sphere( new Vector3(), 1 );
			const f = new Sphere( new Vector3(), 4 );

			e.union( f );

			assert.ok( e.center.equals( new Vector3( 0, 0, 0 ) ), 'Passed!' );
			assert.ok( e.radius === 4, 'Passed!' );

		} );

		test( 'equals', () => {

			const a = new Sphere();
			const b = new Sphere( new Vector3( 1, 0, 0 ) );
			const c = new Sphere( new Vector3( 1, 0, 0 ), 1.0 );

			assert.strictEqual( a.equals( b ), false, 'a does not equal b' );
			assert.strictEqual( a.equals( c ), false, 'a does not equal c' );
			assert.strictEqual( b.equals( c ), false, 'b does not equal c' );

			a.copy( b );
			assert.strictEqual( a.equals( b ), true, 'a equals b after copy()' );

		} );

	} );

} );
