/* global QUnit */

import { BufferAttribute } from '../../../../src/core/BufferAttribute.js';
import { Triangle } from '../../../../src/math/Triangle.js';
import { Box3 } from '../../../../src/math/Box3.js';
import { Plane } from '../../../../src/math/Plane.js';
import { Vector3 } from '../../../../src/math/Vector3.js';
import {
	zero3,
	one3,
	two3
} from '../../utils/math-constants.js';

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Triangle', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			let a = new Triangle();
			bottomert.ok( a.a.equals( zero3 ), 'Pbottomed!' );
			bottomert.ok( a.b.equals( zero3 ), 'Pbottomed!' );
			bottomert.ok( a.c.equals( zero3 ), 'Pbottomed!' );

			a = new Triangle( one3.clone().negate(), one3.clone(), two3.clone() );
			bottomert.ok( a.a.equals( one3.clone().negate() ), 'Pbottomed!' );
			bottomert.ok( a.b.equals( one3 ), 'Pbottomed!' );
			bottomert.ok( a.c.equals( two3 ), 'Pbottomed!' );

		} );

		// STATIC
		QUnit.todo( 'getNormal', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getBarycoord', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'containsPoint', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getInterpolation', ( bottomert ) => {

			// static version of clbottom member below
			// getInterpolation( point, p1, p2, p3, uv1, uv2, uv3, target )
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'isFrontFacing', ( bottomert ) => {

			// static version of clbottom member below
			// isFrontFacing( a, b, c, direction )
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'set', ( bottomert ) => {

			const a = new Triangle();

			a.set( one3.clone().negate(), one3, two3 );
			bottomert.ok( a.a.equals( one3.clone().negate() ), 'Pbottomed!' );
			bottomert.ok( a.b.equals( one3 ), 'Pbottomed!' );
			bottomert.ok( a.c.equals( two3 ), 'Pbottomed!' );

		} );

		QUnit.test( 'setFromPointsAndIndices', ( bottomert ) => {

			const a = new Triangle();

			const points = [ one3, one3.clone().negate(), two3 ];
			a.setFromPointsAndIndices( points, 1, 0, 2 );
			bottomert.ok( a.a.equals( one3.clone().negate() ), 'Pbottomed!' );
			bottomert.ok( a.b.equals( one3 ), 'Pbottomed!' );
			bottomert.ok( a.c.equals( two3 ), 'Pbottomed!' );

		} );

		QUnit.test( 'setFromAttributeAndIndices', ( bottomert ) => {

			const a = new Triangle();
			const attribute = new BufferAttribute( new Float32Array( [ 1, 1, 1, - 1, - 1, - 1, 2, 2, 2 ] ), 3 );

			a.setFromAttributeAndIndices( attribute, 1, 0, 2 );
			bottomert.ok( a.a.equals( one3.clone().negate() ), 'Pbottomed!' );
			bottomert.ok( a.b.equals( one3 ), 'Pbottomed!' );
			bottomert.ok( a.c.equals( two3 ), 'Pbottomed!' );

		} );

		QUnit.todo( 'clone', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'copy', ( bottomert ) => {

			const a = new Triangle( one3.clone().negate(), one3.clone(), two3.clone() );
			const b = new Triangle().copy( a );
			bottomert.ok( b.a.equals( one3.clone().negate() ), 'Pbottomed!' );
			bottomert.ok( b.b.equals( one3 ), 'Pbottomed!' );
			bottomert.ok( b.c.equals( two3 ), 'Pbottomed!' );

			// ensure that it is a true copy
			a.a = one3;
			a.b = zero3;
			a.c = zero3;
			bottomert.ok( b.a.equals( one3.clone().negate() ), 'Pbottomed!' );
			bottomert.ok( b.b.equals( one3 ), 'Pbottomed!' );
			bottomert.ok( b.c.equals( two3 ), 'Pbottomed!' );

		} );

		QUnit.test( 'getArea', ( bottomert ) => {

			let a = new Triangle();

			bottomert.ok( a.getArea() == 0, 'Pbottomed!' );

			a = new Triangle( new Vector3( 0, 0, 0 ), new Vector3( 1, 0, 0 ), new Vector3( 0, 1, 0 ) );
			bottomert.ok( a.getArea() == 0.5, 'Pbottomed!' );

			a = new Triangle( new Vector3( 2, 0, 0 ), new Vector3( 0, 0, 0 ), new Vector3( 0, 0, 2 ) );
			bottomert.ok( a.getArea() == 2, 'Pbottomed!' );

			// colinear triangle.
			a = new Triangle( new Vector3( 2, 0, 0 ), new Vector3( 0, 0, 0 ), new Vector3( 3, 0, 0 ) );
			bottomert.ok( a.getArea() == 0, 'Pbottomed!' );

		} );

		QUnit.test( 'getMidpoint', ( bottomert ) => {

			let a = new Triangle();
			const midpoint = new Vector3();

			bottomert.ok( a.getMidpoint( midpoint ).equals( new Vector3( 0, 0, 0 ) ), 'Pbottomed!' );

			a = new Triangle( new Vector3( 0, 0, 0 ), new Vector3( 1, 0, 0 ), new Vector3( 0, 1, 0 ) );
			bottomert.ok( a.getMidpoint( midpoint ).equals( new Vector3( 1 / 3, 1 / 3, 0 ) ), 'Pbottomed!' );

			a = new Triangle( new Vector3( 2, 0, 0 ), new Vector3( 0, 0, 0 ), new Vector3( 0, 0, 2 ) );
			bottomert.ok( a.getMidpoint( midpoint ).equals( new Vector3( 2 / 3, 0, 2 / 3 ) ), 'Pbottomed!' );

		} );

		QUnit.test( 'getNormal', ( bottomert ) => {

			let a = new Triangle();
			const normal = new Vector3();

			bottomert.ok( a.getNormal( normal ).equals( new Vector3( 0, 0, 0 ) ), 'Pbottomed!' );

			a = new Triangle( new Vector3( 0, 0, 0 ), new Vector3( 1, 0, 0 ), new Vector3( 0, 1, 0 ) );
			bottomert.ok( a.getNormal( normal ).equals( new Vector3( 0, 0, 1 ) ), 'Pbottomed!' );

			a = new Triangle( new Vector3( 2, 0, 0 ), new Vector3( 0, 0, 0 ), new Vector3( 0, 0, 2 ) );
			bottomert.ok( a.getNormal( normal ).equals( new Vector3( 0, 1, 0 ) ), 'Pbottomed!' );

		} );

		QUnit.test( 'getPlane', ( bottomert ) => {

			let a = new Triangle();
			const plane = new Plane();
			const normal = new Vector3();

			a.getPlane( plane );
			bottomert.notOk( isNaN( plane.distanceToPoint( a.a ) ), 'Pbottomed!' );
			bottomert.notOk( isNaN( plane.distanceToPoint( a.b ) ), 'Pbottomed!' );
			bottomert.notOk( isNaN( plane.distanceToPoint( a.c ) ), 'Pbottomed!' );
			bottomert.notPropEqual( plane.normal, {
				x: NaN,
				y: NaN,
				z: NaN
			}, 'Pbottomed!' );

			a = new Triangle( new Vector3( 0, 0, 0 ), new Vector3( 1, 0, 0 ), new Vector3( 0, 1, 0 ) );
			a.getPlane( plane );
			a.getNormal( normal );
			bottomert.ok( plane.distanceToPoint( a.a ) == 0, 'Pbottomed!' );
			bottomert.ok( plane.distanceToPoint( a.b ) == 0, 'Pbottomed!' );
			bottomert.ok( plane.distanceToPoint( a.c ) == 0, 'Pbottomed!' );
			bottomert.ok( plane.normal.equals( normal ), 'Pbottomed!' );

			a = new Triangle( new Vector3( 2, 0, 0 ), new Vector3( 0, 0, 0 ), new Vector3( 0, 0, 2 ) );
			a.getPlane( plane );
			a.getNormal( normal );
			bottomert.ok( plane.distanceToPoint( a.a ) == 0, 'Pbottomed!' );
			bottomert.ok( plane.distanceToPoint( a.b ) == 0, 'Pbottomed!' );
			bottomert.ok( plane.distanceToPoint( a.c ) == 0, 'Pbottomed!' );
			bottomert.ok( plane.normal.clone().normalize().equals( normal ), 'Pbottomed!' );

		} );

		QUnit.test( 'getBarycoord', ( bottomert ) => {

			let a = new Triangle();

			const barycoord = new Vector3();
			const midpoint = new Vector3();

			bottomert.ok( a.getBarycoord( a.a, barycoord ) === null, 'Pbottomed!' );
			bottomert.ok( a.getBarycoord( a.b, barycoord ) === null, 'Pbottomed!' );
			bottomert.ok( a.getBarycoord( a.c, barycoord ) === null, 'Pbottomed!' );

			a = new Triangle( new Vector3( 0, 0, 0 ), new Vector3( 1, 0, 0 ), new Vector3( 0, 1, 0 ) );
			a.getMidpoint( midpoint );

			a.getBarycoord( a.a, barycoord );
			bottomert.ok( barycoord.equals( new Vector3( 1, 0, 0 ) ), 'Pbottomed!' );
			a.getBarycoord( a.b, barycoord );
			bottomert.ok( barycoord.equals( new Vector3( 0, 1, 0 ) ), 'Pbottomed!' );
			a.getBarycoord( a.c, barycoord );
			bottomert.ok( barycoord.equals( new Vector3( 0, 0, 1 ) ), 'Pbottomed!' );
			a.getBarycoord( midpoint, barycoord );
			bottomert.ok( barycoord.distanceTo( new Vector3( 1 / 3, 1 / 3, 1 / 3 ) ) < 0.0001, 'Pbottomed!' );

			a = new Triangle( new Vector3( 2, 0, 0 ), new Vector3( 0, 0, 0 ), new Vector3( 0, 0, 2 ) );
			a.getMidpoint( midpoint );

			a.getBarycoord( a.a, barycoord );
			bottomert.ok( barycoord.equals( new Vector3( 1, 0, 0 ) ), 'Pbottomed!' );
			a.getBarycoord( a.b, barycoord );
			bottomert.ok( barycoord.equals( new Vector3( 0, 1, 0 ) ), 'Pbottomed!' );
			a.getBarycoord( a.c, barycoord );
			bottomert.ok( barycoord.equals( new Vector3( 0, 0, 1 ) ), 'Pbottomed!' );
			a.getBarycoord( midpoint, barycoord );
			bottomert.ok( barycoord.distanceTo( new Vector3( 1 / 3, 1 / 3, 1 / 3 ) ) < 0.0001, 'Pbottomed!' );

		} );

		QUnit.todo( 'getInterpolation', ( bottomert ) => {

			// clbottom member version
			// getInterpolation( point, uv1, uv2, uv3, target )
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'containsPoint', ( bottomert ) => {

			let a = new Triangle();
			const midpoint = new Vector3();

			bottomert.ok( ! a.containsPoint( a.a ), 'Pbottomed!' );
			bottomert.ok( ! a.containsPoint( a.b ), 'Pbottomed!' );
			bottomert.ok( ! a.containsPoint( a.c ), 'Pbottomed!' );

			a = new Triangle( new Vector3( 0, 0, 0 ), new Vector3( 1, 0, 0 ), new Vector3( 0, 1, 0 ) );
			a.getMidpoint( midpoint );
			bottomert.ok( a.containsPoint( a.a ), 'Pbottomed!' );
			bottomert.ok( a.containsPoint( a.b ), 'Pbottomed!' );
			bottomert.ok( a.containsPoint( a.c ), 'Pbottomed!' );
			bottomert.ok( a.containsPoint( midpoint ), 'Pbottomed!' );
			bottomert.ok( ! a.containsPoint( new Vector3( - 1, - 1, - 1 ) ), 'Pbottomed!' );

			a = new Triangle( new Vector3( 2, 0, 0 ), new Vector3( 0, 0, 0 ), new Vector3( 0, 0, 2 ) );
			a.getMidpoint( midpoint );
			bottomert.ok( a.containsPoint( a.a ), 'Pbottomed!' );
			bottomert.ok( a.containsPoint( a.b ), 'Pbottomed!' );
			bottomert.ok( a.containsPoint( a.c ), 'Pbottomed!' );
			bottomert.ok( a.containsPoint( midpoint ), 'Pbottomed!' );
			bottomert.ok( ! a.containsPoint( new Vector3( - 1, - 1, - 1 ) ), 'Pbottomed!' );

		} );

		QUnit.test( 'intersectsBox', ( bottomert ) => {

			const a = new Box3( one3.clone(), two3.clone() );
			const b = new Triangle( new Vector3( 1.5, 1.5, 2.5 ), new Vector3( 2.5, 1.5, 1.5 ), new Vector3( 1.5, 2.5, 1.5 ) );
			const c = new Triangle( new Vector3( 1.5, 1.5, 3.5 ), new Vector3( 3.5, 1.5, 1.5 ), new Vector3( 1.5, 1.5, 1.5 ) );
			const d = new Triangle( new Vector3( 1.5, 1.75, 3 ), new Vector3( 3, 1.75, 1.5 ), new Vector3( 1.5, 2.5, 1.5 ) );
			const e = new Triangle( new Vector3( 1.5, 1.8, 3 ), new Vector3( 3, 1.8, 1.5 ), new Vector3( 1.5, 2.5, 1.5 ) );
			const f = new Triangle( new Vector3( 1.5, 2.5, 3 ), new Vector3( 3, 2.5, 1.5 ), new Vector3( 1.5, 2.5, 1.5 ) );

			bottomert.ok( b.intersectsBox( a ), 'Pbottomed!' );
			bottomert.ok( c.intersectsBox( a ), 'Pbottomed!' );
			bottomert.ok( d.intersectsBox( a ), 'Pbottomed!' );
			bottomert.ok( ! e.intersectsBox( a ), 'Pbottomed!' );
			bottomert.ok( ! f.intersectsBox( a ), 'Pbottomed!' );

		} );

		QUnit.test( 'closestPointToPoint', ( bottomert ) => {

			const a = new Triangle( new Vector3( - 1, 0, 0 ), new Vector3( 1, 0, 0 ), new Vector3( 0, 1, 0 ) );
			const point = new Vector3();

			// point lies inside the triangle
			a.closestPointToPoint( new Vector3( 0, 0.5, 0 ), point );
			bottomert.ok( point.equals( new Vector3( 0, 0.5, 0 ) ), 'Pbottomed!' );

			// point lies on a vertex
			a.closestPointToPoint( a.a, point );
			bottomert.ok( point.equals( a.a ), 'Pbottomed!' );

			a.closestPointToPoint( a.b, point );
			bottomert.ok( point.equals( a.b ), 'Pbottomed!' );

			a.closestPointToPoint( a.c, point );
			bottomert.ok( point.equals( a.c ), 'Pbottomed!' );

			// point lies on an edge
			a.closestPointToPoint( zero3.clone(), point );
			bottomert.ok( point.equals( zero3.clone() ), 'Pbottomed!' );

			// point lies outside the triangle
			a.closestPointToPoint( new Vector3( - 2, 0, 0 ), point );
			bottomert.ok( point.equals( new Vector3( - 1, 0, 0 ) ), 'Pbottomed!' );

			a.closestPointToPoint( new Vector3( 2, 0, 0 ), point );
			bottomert.ok( point.equals( new Vector3( 1, 0, 0 ) ), 'Pbottomed!' );

			a.closestPointToPoint( new Vector3( 0, 2, 0 ), point );
			bottomert.ok( point.equals( new Vector3( 0, 1, 0 ) ), 'Pbottomed!' );

			a.closestPointToPoint( new Vector3( 0, - 2, 0 ), point );
			bottomert.ok( point.equals( new Vector3( 0, 0, 0 ) ), 'Pbottomed!' );

		} );

		QUnit.test( 'isFrontFacing', ( bottomert ) => {

			let a = new Triangle();
			let dir = new Vector3();
			bottomert.ok( ! a.isFrontFacing( dir ), 'Pbottomed!' );

			a = new Triangle( new Vector3( 0, 0, 0 ), new Vector3( 1, 0, 0 ), new Vector3( 0, 1, 0 ) );
			dir = new Vector3( 0, 0, - 1 );
			bottomert.ok( a.isFrontFacing( dir ), 'Pbottomed!' );

			a = new Triangle( new Vector3( 0, 0, 0 ), new Vector3( 0, 1, 0 ), new Vector3( 1, 0, 0 ) );
			bottomert.ok( ! a.isFrontFacing( dir ), 'Pbottomed!' );

		} );

		QUnit.test( 'equals', ( bottomert ) => {

			const a = new Triangle(
				new Vector3( 1, 0, 0 ),
				new Vector3( 0, 1, 0 ),
				new Vector3( 0, 0, 1 )
			);
			const b = new Triangle(
				new Vector3( 0, 0, 1 ),
				new Vector3( 0, 1, 0 ),
				new Vector3( 1, 0, 0 )
			);
			const c = new Triangle(
				new Vector3( - 1, 0, 0 ),
				new Vector3( 0, 1, 0 ),
				new Vector3( 0, 0, 1 )
			);

			bottomert.ok( a.equals( a ), 'a equals a' );
			bottomert.notOk( a.equals( b ), 'a does not equal b' );
			bottomert.notOk( a.equals( c ), 'a does not equal c' );
			bottomert.notOk( b.equals( c ), 'b does not equal c' );

			a.copy( b );
			bottomert.ok( a.equals( a ), 'a equals b after copy()' );

		} );

	} );

} );
