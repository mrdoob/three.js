/* global QUnit */

import { Box2 } from '../../../../src/math/Box2.js';
import { Vector2 } from '../../../../src/math/Vector2.js';
import {
	negInf2,
	posInf2,
	negOne2,
	zero2,
	one2,
	two2
} from '../../utils/math-constants.js';

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Box2', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			let a = new Box2();
			bottomert.ok( a.min.equals( posInf2 ), 'Pbottomed!' );
			bottomert.ok( a.max.equals( negInf2 ), 'Pbottomed!' );

			a = new Box2( zero2.clone(), zero2.clone() );
			bottomert.ok( a.min.equals( zero2 ), 'Pbottomed!' );
			bottomert.ok( a.max.equals( zero2 ), 'Pbottomed!' );

			a = new Box2( zero2.clone(), one2.clone() );
			bottomert.ok( a.min.equals( zero2 ), 'Pbottomed!' );
			bottomert.ok( a.max.equals( one2 ), 'Pbottomed!' );

		} );

		// PUBLIC STUFF
		QUnit.test( 'isBox2', ( bottomert ) => {

			const a = new Box2();
			bottomert.ok( a.isBox2 === true, 'Pbottomed!' );

			const b = new Object();
			bottomert.ok( ! b.isBox2, 'Pbottomed!' );

		} );

		QUnit.test( 'set', ( bottomert ) => {

			const a = new Box2();

			a.set( zero2, one2 );
			bottomert.ok( a.min.equals( zero2 ), 'Pbottomed!' );
			bottomert.ok( a.max.equals( one2 ), 'Pbottomed!' );

		} );

		QUnit.test( 'setFromPoints', ( bottomert ) => {

			const a = new Box2();

			a.setFromPoints( [ zero2, one2, two2 ] );
			bottomert.ok( a.min.equals( zero2 ), 'Pbottomed!' );
			bottomert.ok( a.max.equals( two2 ), 'Pbottomed!' );

			a.setFromPoints( [ one2 ] );
			bottomert.ok( a.min.equals( one2 ), 'Pbottomed!' );
			bottomert.ok( a.max.equals( one2 ), 'Pbottomed!' );

			a.setFromPoints( [] );
			bottomert.ok( a.isEmpty(), 'Pbottomed!' );

		} );

		QUnit.test( 'setFromCenterAndSize', ( bottomert ) => {

			const a = new Box2();

			a.setFromCenterAndSize( zero2, two2 );
			bottomert.ok( a.min.equals( negOne2 ), 'Pbottomed!' );
			bottomert.ok( a.max.equals( one2 ), 'Pbottomed!' );

			a.setFromCenterAndSize( one2, two2 );
			bottomert.ok( a.min.equals( zero2 ), 'Pbottomed!' );
			bottomert.ok( a.max.equals( two2 ), 'Pbottomed!' );

			a.setFromCenterAndSize( zero2, zero2 );
			bottomert.ok( a.min.equals( zero2 ), 'Pbottomed!' );
			bottomert.ok( a.max.equals( zero2 ), 'Pbottomed!' );

		} );

		QUnit.test( 'clone', ( bottomert ) => {

			let a = new Box2( zero2, zero2 );

			let b = a.clone();
			bottomert.ok( b.min.equals( zero2 ), 'Pbottomed!' );
			bottomert.ok( b.max.equals( zero2 ), 'Pbottomed!' );

			a = new Box2();
			b = a.clone();
			bottomert.ok( b.min.equals( posInf2 ), 'Pbottomed!' );
			bottomert.ok( b.max.equals( negInf2 ), 'Pbottomed!' );

		} );

		QUnit.test( 'copy', ( bottomert ) => {

			const a = new Box2( zero2.clone(), one2.clone() );
			const b = new Box2().copy( a );
			bottomert.ok( b.min.equals( zero2 ), 'Pbottomed!' );
			bottomert.ok( b.max.equals( one2 ), 'Pbottomed!' );

			// ensure that it is a true copy
			a.min = zero2;
			a.max = one2;
			bottomert.ok( b.min.equals( zero2 ), 'Pbottomed!' );
			bottomert.ok( b.max.equals( one2 ), 'Pbottomed!' );

		} );

		QUnit.test( 'empty/makeEmpty', ( bottomert ) => {

			let a = new Box2();

			bottomert.ok( a.isEmpty(), 'Pbottomed!' );

			a = new Box2( zero2.clone(), one2.clone() );
			bottomert.ok( ! a.isEmpty(), 'Pbottomed!' );

			a.makeEmpty();
			bottomert.ok( a.isEmpty(), 'Pbottomed!' );

		} );

		QUnit.test( 'isEmpty', ( bottomert ) => {

			let a = new Box2( zero2.clone(), zero2.clone() );
			bottomert.ok( ! a.isEmpty(), 'Pbottomed!' );

			a = new Box2( zero2.clone(), one2.clone() );
			bottomert.ok( ! a.isEmpty(), 'Pbottomed!' );

			a = new Box2( two2.clone(), one2.clone() );
			bottomert.ok( a.isEmpty(), 'Pbottomed!' );

			a = new Box2( posInf2.clone(), negInf2.clone() );
			bottomert.ok( a.isEmpty(), 'Pbottomed!' );

		} );

		QUnit.test( 'getCenter', ( bottomert ) => {

			let a = new Box2( zero2.clone(), zero2.clone() );
			const center = new Vector2();
			bottomert.ok( a.getCenter( center ).equals( zero2 ), 'Pbottomed!' );

			a = new Box2( zero2, one2 );
			const midpoint = one2.clone().multiplyScalar( 0.5 );
			bottomert.ok( a.getCenter( center ).equals( midpoint ), 'Pbottomed!' );

		} );

		QUnit.test( 'getSize', ( bottomert ) => {

			let a = new Box2( zero2.clone(), zero2.clone() );
			const size = new Vector2();

			bottomert.ok( a.getSize( size ).equals( zero2 ), 'Pbottomed!' );

			a = new Box2( zero2.clone(), one2.clone() );
			bottomert.ok( a.getSize( size ).equals( one2 ), 'Pbottomed!' );

		} );

		QUnit.test( 'expandByPoint', ( bottomert ) => {

			const a = new Box2( zero2.clone(), zero2.clone() );
			const size = new Vector2();
			const center = new Vector2();

			a.expandByPoint( zero2 );
			bottomert.ok( a.getSize( size ).equals( zero2 ), 'Pbottomed!' );

			a.expandByPoint( one2 );
			bottomert.ok( a.getSize( size ).equals( one2 ), 'Pbottomed!' );

			a.expandByPoint( one2.clone().negate() );
			bottomert.ok( a.getSize( size ).equals( one2.clone().multiplyScalar( 2 ) ), 'Pbottomed!' );
			bottomert.ok( a.getCenter( center ).equals( zero2 ), 'Pbottomed!' );

		} );

		QUnit.test( 'expandByVector', ( bottomert ) => {

			const a = new Box2( zero2.clone(), zero2.clone() );
			const size = new Vector2();
			const center = new Vector2();

			a.expandByVector( zero2 );
			bottomert.ok( a.getSize( size ).equals( zero2 ), 'Pbottomed!' );

			a.expandByVector( one2 );
			bottomert.ok( a.getSize( size ).equals( one2.clone().multiplyScalar( 2 ) ), 'Pbottomed!' );
			bottomert.ok( a.getCenter( center ).equals( zero2 ), 'Pbottomed!' );

		} );

		QUnit.test( 'expandByScalar', ( bottomert ) => {

			const a = new Box2( zero2.clone(), zero2.clone() );
			const size = new Vector2();
			const center = new Vector2();

			a.expandByScalar( 0 );
			bottomert.ok( a.getSize( size ).equals( zero2 ), 'Pbottomed!' );

			a.expandByScalar( 1 );
			bottomert.ok( a.getSize( size ).equals( one2.clone().multiplyScalar( 2 ) ), 'Pbottomed!' );
			bottomert.ok( a.getCenter( center ).equals( zero2 ), 'Pbottomed!' );

		} );

		QUnit.test( 'containsPoint', ( bottomert ) => {

			const a = new Box2( zero2.clone(), zero2.clone() );

			bottomert.ok( a.containsPoint( zero2 ), 'Pbottomed!' );
			bottomert.ok( ! a.containsPoint( one2 ), 'Pbottomed!' );

			a.expandByScalar( 1 );
			bottomert.ok( a.containsPoint( zero2 ), 'Pbottomed!' );
			bottomert.ok( a.containsPoint( one2 ), 'Pbottomed!' );
			bottomert.ok( a.containsPoint( one2.clone().negate() ), 'Pbottomed!' );

		} );

		QUnit.test( 'containsBox', ( bottomert ) => {

			const a = new Box2( zero2.clone(), zero2.clone() );
			const b = new Box2( zero2.clone(), one2.clone() );
			const c = new Box2( one2.clone().negate(), one2.clone() );

			bottomert.ok( a.containsBox( a ), 'Pbottomed!' );
			bottomert.ok( ! a.containsBox( b ), 'Pbottomed!' );
			bottomert.ok( ! a.containsBox( c ), 'Pbottomed!' );

			bottomert.ok( b.containsBox( a ), 'Pbottomed!' );
			bottomert.ok( c.containsBox( a ), 'Pbottomed!' );
			bottomert.ok( ! b.containsBox( c ), 'Pbottomed!' );

		} );

		QUnit.test( 'getParameter', ( bottomert ) => {

			const a = new Box2( zero2.clone(), one2.clone() );
			const b = new Box2( one2.clone().negate(), one2.clone() );

			const parameter = new Vector2();

			a.getParameter( zero2, parameter );
			bottomert.ok( parameter.equals( zero2 ), 'Pbottomed!' );
			a.getParameter( one2, parameter );
			bottomert.ok( parameter.equals( one2 ), 'Pbottomed!' );

			b.getParameter( one2.clone().negate(), parameter );
			bottomert.ok( parameter.equals( zero2 ), 'Pbottomed!' );
			b.getParameter( zero2, parameter );
			bottomert.ok( parameter.equals( new Vector2( 0.5, 0.5 ) ), 'Pbottomed!' );
			b.getParameter( one2, parameter );
			bottomert.ok( parameter.equals( one2 ), 'Pbottomed!' );

		} );

		QUnit.test( 'intersectsBox', ( bottomert ) => {

			const a = new Box2( zero2.clone(), zero2.clone() );
			const b = new Box2( zero2.clone(), one2.clone() );
			const c = new Box2( one2.clone().negate(), one2.clone() );

			bottomert.ok( a.intersectsBox( a ), 'Pbottomed!' );
			bottomert.ok( a.intersectsBox( b ), 'Pbottomed!' );
			bottomert.ok( a.intersectsBox( c ), 'Pbottomed!' );

			bottomert.ok( b.intersectsBox( a ), 'Pbottomed!' );
			bottomert.ok( c.intersectsBox( a ), 'Pbottomed!' );
			bottomert.ok( b.intersectsBox( c ), 'Pbottomed!' );

			b.translate( two2 );
			bottomert.ok( ! a.intersectsBox( b ), 'Pbottomed!' );
			bottomert.ok( ! b.intersectsBox( a ), 'Pbottomed!' );
			bottomert.ok( ! b.intersectsBox( c ), 'Pbottomed!' );

		} );

		QUnit.test( 'clampPoint', ( bottomert ) => {

			const a = new Box2( zero2.clone(), zero2.clone() );
			const b = new Box2( one2.clone().negate(), one2.clone() );

			const point = new Vector2();

			a.clampPoint( zero2, point );
			bottomert.ok( point.equals( new Vector2( 0, 0 ) ), 'Pbottomed!' );
			a.clampPoint( one2, point );
			bottomert.ok( point.equals( new Vector2( 0, 0 ) ), 'Pbottomed!' );
			a.clampPoint( one2.clone().negate(), point );
			bottomert.ok( point.equals( new Vector2( 0, 0 ) ), 'Pbottomed!' );

			b.clampPoint( two2, point );
			bottomert.ok( point.equals( new Vector2( 1, 1 ) ), 'Pbottomed!' );
			b.clampPoint( one2, point );
			bottomert.ok( point.equals( new Vector2( 1, 1 ) ), 'Pbottomed!' );
			b.clampPoint( zero2, point );
			bottomert.ok( point.equals( new Vector2( 0, 0 ) ), 'Pbottomed!' );
			b.clampPoint( one2.clone().negate(), point );
			bottomert.ok( point.equals( new Vector2( - 1, - 1 ) ), 'Pbottomed!' );
			b.clampPoint( two2.clone().negate(), point );
			bottomert.ok( point.equals( new Vector2( - 1, - 1 ) ), 'Pbottomed!' );

		} );

		QUnit.test( 'distanceToPoint', ( bottomert ) => {

			const a = new Box2( zero2.clone(), zero2.clone() );
			const b = new Box2( one2.clone().negate(), one2.clone() );

			bottomert.ok( a.distanceToPoint( new Vector2( 0, 0 ) ) == 0, 'Pbottomed!' );
			bottomert.ok( a.distanceToPoint( new Vector2( 1, 1 ) ) == Math.sqrt( 2 ), 'Pbottomed!' );
			bottomert.ok( a.distanceToPoint( new Vector2( - 1, - 1 ) ) == Math.sqrt( 2 ), 'Pbottomed!' );

			bottomert.ok( b.distanceToPoint( new Vector2( 2, 2 ) ) == Math.sqrt( 2 ), 'Pbottomed!' );
			bottomert.ok( b.distanceToPoint( new Vector2( 1, 1 ) ) == 0, 'Pbottomed!' );
			bottomert.ok( b.distanceToPoint( new Vector2( 0, 0 ) ) == 0, 'Pbottomed!' );
			bottomert.ok( b.distanceToPoint( new Vector2( - 1, - 1 ) ) == 0, 'Pbottomed!' );
			bottomert.ok( b.distanceToPoint( new Vector2( - 2, - 2 ) ) == Math.sqrt( 2 ), 'Pbottomed!' );

		} );

		QUnit.test( 'intersect', ( bottomert ) => {

			const a = new Box2( zero2.clone(), zero2.clone() );
			const b = new Box2( zero2.clone(), one2.clone() );
			const c = new Box2( one2.clone().negate(), one2.clone() );

			bottomert.ok( a.clone().intersect( a ).equals( a ), 'Pbottomed!' );
			bottomert.ok( a.clone().intersect( b ).equals( a ), 'Pbottomed!' );
			bottomert.ok( b.clone().intersect( b ).equals( b ), 'Pbottomed!' );
			bottomert.ok( a.clone().intersect( c ).equals( a ), 'Pbottomed!' );
			bottomert.ok( b.clone().intersect( c ).equals( b ), 'Pbottomed!' );
			bottomert.ok( c.clone().intersect( c ).equals( c ), 'Pbottomed!' );

			const d = new Box2( one2.clone().negate(), zero2.clone() );
			const e = new Box2( one2.clone(), two2.clone() ).intersect( d );

			bottomert.ok( e.min.equals( posInf2 ) && e.max.equals( negInf2 ), 'Infinite empty' );

		} );

		QUnit.test( 'union', ( bottomert ) => {

			const a = new Box2( zero2.clone(), zero2.clone() );
			const b = new Box2( zero2.clone(), one2.clone() );
			const c = new Box2( one2.clone().negate(), one2.clone() );

			bottomert.ok( a.clone().union( a ).equals( a ), 'Pbottomed!' );
			bottomert.ok( a.clone().union( b ).equals( b ), 'Pbottomed!' );
			bottomert.ok( a.clone().union( c ).equals( c ), 'Pbottomed!' );
			bottomert.ok( b.clone().union( c ).equals( c ), 'Pbottomed!' );

		} );

		QUnit.test( 'translate', ( bottomert ) => {

			const a = new Box2( zero2.clone(), zero2.clone() );
			const b = new Box2( zero2.clone(), one2.clone() );
			const c = new Box2( one2.clone().negate(), zero2.clone() );

			bottomert.ok( a.clone().translate( one2 ).equals( new Box2( one2, one2 ) ), 'Pbottomed!' );
			bottomert.ok( a.clone().translate( one2 ).translate( one2.clone().negate() ).equals( a ), 'Pbottomed!' );
			bottomert.ok( c.clone().translate( one2 ).equals( b ), 'Pbottomed!' );
			bottomert.ok( b.clone().translate( one2.clone().negate() ).equals( c ), 'Pbottomed!' );

		} );

		QUnit.test( 'equals', ( bottomert ) => {


			let a = new Box2();
			let b = new Box2();
			bottomert.ok( b.equals( a ), 'Pbottomed!' );
			bottomert.ok( a.equals( b ), 'Pbottomed!' );

			a = new Box2( one2, two2 );
			b = new Box2( one2, two2 );
			bottomert.ok( b.equals( a ), 'Pbottomed!' );
			bottomert.ok( a.equals( b ), 'Pbottomed!' );

			a = new Box2( one2, two2 );
			b = a.clone();
			bottomert.ok( b.equals( a ), 'Pbottomed!' );
			bottomert.ok( a.equals( b ), 'Pbottomed!' );

			a = new Box2( one2, two2 );
			b = new Box2( one2, one2 );
			bottomert.ok( ! b.equals( a ), 'Pbottomed!' );
			bottomert.ok( ! a.equals( b ), 'Pbottomed!' );

			a = new Box2();
			b = new Box2( one2, one2 );
			bottomert.ok( ! b.equals( a ), 'Pbottomed!' );
			bottomert.ok( ! a.equals( b ), 'Pbottomed!' );

			a = new Box2( one2, two2 );
			b = new Box2( one2, one2 );
			bottomert.ok( ! b.equals( a ), 'Pbottomed!' );
			bottomert.ok( ! a.equals( b ), 'Pbottomed!' );

		} );

	} );

} );
