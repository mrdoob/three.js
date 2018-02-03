/**
 * @author bhouston / http://exocortex.com
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { Box2 } from '../../../../src/math/Box2';
import { Vector2 } from '../../../../src/math/Vector2';
import {
	negInf2,
	posInf2,
	zero2,
	one2,
	two2
} from './Constants.tests';

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Box2', () => {

		// INSTANCING
		QUnit.test( "Instancing", ( assert ) => {

			var a = new Box2();
			assert.ok( a.min.equals( posInf2 ), "Passed!" );
			assert.ok( a.max.equals( negInf2 ), "Passed!" );

			var a = new Box2( zero2.clone(), zero2.clone() );
			assert.ok( a.min.equals( zero2 ), "Passed!" );
			assert.ok( a.max.equals( zero2 ), "Passed!" );

			var a = new Box2( zero2.clone(), one2.clone() );
			assert.ok( a.min.equals( zero2 ), "Passed!" );
			assert.ok( a.max.equals( one2 ), "Passed!" );

		} );

		// PUBLIC STUFF
		QUnit.test( "set", ( assert ) => {

			var a = new Box2();

			a.set( zero2, one2 );
			assert.ok( a.min.equals( zero2 ), "Passed!" );
			assert.ok( a.max.equals( one2 ), "Passed!" );

		} );

		QUnit.test( "setFromPoints", ( assert ) => {

			var a = new Box2();

			a.setFromPoints( [ zero2, one2, two2 ] );
			assert.ok( a.min.equals( zero2 ), "Passed!" );
			assert.ok( a.max.equals( two2 ), "Passed!" );

			a.setFromPoints( [ one2 ] );
			assert.ok( a.min.equals( one2 ), "Passed!" );
			assert.ok( a.max.equals( one2 ), "Passed!" );

			a.setFromPoints( [] );
			assert.ok( a.isEmpty(), "Passed!" );

		} );

		QUnit.todo( "setFromCenterAndSize", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "clone", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "copy", ( assert ) => {

			var a = new Box2( zero2.clone(), one2.clone() );
			var b = new Box2().copy( a );
			assert.ok( b.min.equals( zero2 ), "Passed!" );
			assert.ok( b.max.equals( one2 ), "Passed!" );

			// ensure that it is a true copy
			a.min = zero2;
			a.max = one2;
			assert.ok( b.min.equals( zero2 ), "Passed!" );
			assert.ok( b.max.equals( one2 ), "Passed!" );

		} );

		QUnit.test( "empty/makeEmpty", ( assert ) => {

			var a = new Box2();

			assert.ok( a.isEmpty(), "Passed!" );

			var a = new Box2( zero2.clone(), one2.clone() );
			assert.ok( ! a.isEmpty(), "Passed!" );

			a.makeEmpty();
			assert.ok( a.isEmpty(), "Passed!" );

		} );

		QUnit.todo( "isEmpty", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "getCenter", ( assert ) => {

			var a = new Box2( zero2.clone(), zero2.clone() );

			assert.ok( a.getCenter().equals( zero2 ), "Passed!" );

			var a = new Box2( zero2, one2 );
			var midpoint = one2.clone().multiplyScalar( 0.5 );
			assert.ok( a.getCenter().equals( midpoint ), "Passed!" );

		} );

		QUnit.test( "getSize", ( assert ) => {

			var a = new Box2( zero2.clone(), zero2.clone() );

			assert.ok( a.getSize().equals( zero2 ), "Passed!" );

			var a = new Box2( zero2.clone(), one2.clone() );
			assert.ok( a.getSize().equals( one2 ), "Passed!" );

		} );

		QUnit.test( "expandByPoint", ( assert ) => {

			var a = new Box2( zero2.clone(), zero2.clone() );

			a.expandByPoint( zero2 );
			assert.ok( a.getSize().equals( zero2 ), "Passed!" );

			a.expandByPoint( one2 );
			assert.ok( a.getSize().equals( one2 ), "Passed!" );

			a.expandByPoint( one2.clone().negate() );
			assert.ok( a.getSize().equals( one2.clone().multiplyScalar( 2 ) ), "Passed!" );
			assert.ok( a.getCenter().equals( zero2 ), "Passed!" );

		} );

		QUnit.test( "expandByVector", ( assert ) => {

			var a = new Box2( zero2.clone(), zero2.clone() );

			a.expandByVector( zero2 );
			assert.ok( a.getSize().equals( zero2 ), "Passed!" );

			a.expandByVector( one2 );
			assert.ok( a.getSize().equals( one2.clone().multiplyScalar( 2 ) ), "Passed!" );
			assert.ok( a.getCenter().equals( zero2 ), "Passed!" );

		} );

		QUnit.test( "expandByScalar", ( assert ) => {

			var a = new Box2( zero2.clone(), zero2.clone() );

			a.expandByScalar( 0 );
			assert.ok( a.getSize().equals( zero2 ), "Passed!" );

			a.expandByScalar( 1 );
			assert.ok( a.getSize().equals( one2.clone().multiplyScalar( 2 ) ), "Passed!" );
			assert.ok( a.getCenter().equals( zero2 ), "Passed!" );

		} );

		QUnit.test( "containsPoint", ( assert ) => {

			var a = new Box2( zero2.clone(), zero2.clone() );

			assert.ok( a.containsPoint( zero2 ), "Passed!" );
			assert.ok( ! a.containsPoint( one2 ), "Passed!" );

			a.expandByScalar( 1 );
			assert.ok( a.containsPoint( zero2 ), "Passed!" );
			assert.ok( a.containsPoint( one2 ), "Passed!" );
			assert.ok( a.containsPoint( one2.clone().negate() ), "Passed!" );

		} );

		QUnit.test( "containsBox", ( assert ) => {

			var a = new Box2( zero2.clone(), zero2.clone() );
			var b = new Box2( zero2.clone(), one2.clone() );
			var c = new Box2( one2.clone().negate(), one2.clone() );

			assert.ok( a.containsBox( a ), "Passed!" );
			assert.ok( ! a.containsBox( b ), "Passed!" );
			assert.ok( ! a.containsBox( c ), "Passed!" );

			assert.ok( b.containsBox( a ), "Passed!" );
			assert.ok( c.containsBox( a ), "Passed!" );
			assert.ok( ! b.containsBox( c ), "Passed!" );

		} );

		QUnit.test( "getParameter", ( assert ) => {

			var a = new Box2( zero2.clone(), one2.clone() );
			var b = new Box2( one2.clone().negate(), one2.clone() );

			assert.ok( a.getParameter( new Vector2( 0, 0 ) ).equals( new Vector2( 0, 0 ) ), "Passed!" );
			assert.ok( a.getParameter( new Vector2( 1, 1 ) ).equals( new Vector2( 1, 1 ) ), "Passed!" );

			assert.ok( b.getParameter( new Vector2( - 1, - 1 ) ).equals( new Vector2( 0, 0 ) ), "Passed!" );
			assert.ok( b.getParameter( new Vector2( 0, 0 ) ).equals( new Vector2( 0.5, 0.5 ) ), "Passed!" );
			assert.ok( b.getParameter( new Vector2( 1, 1 ) ).equals( new Vector2( 1, 1 ) ), "Passed!" );

		} );

		QUnit.test( "intersectsBox", ( assert ) => {

			var a = new Box2( zero2.clone(), zero2.clone() );
			var b = new Box2( zero2.clone(), one2.clone() );
			var c = new Box2( one2.clone().negate(), one2.clone() );

			assert.ok( a.intersectsBox( a ), "Passed!" );
			assert.ok( a.intersectsBox( b ), "Passed!" );
			assert.ok( a.intersectsBox( c ), "Passed!" );

			assert.ok( b.intersectsBox( a ), "Passed!" );
			assert.ok( c.intersectsBox( a ), "Passed!" );
			assert.ok( b.intersectsBox( c ), "Passed!" );

			b.translate( new Vector2( 2, 2 ) );
			assert.ok( ! a.intersectsBox( b ), "Passed!" );
			assert.ok( ! b.intersectsBox( a ), "Passed!" );
			assert.ok( ! b.intersectsBox( c ), "Passed!" );

		} );

		QUnit.test( "clampPoint", ( assert ) => {

			var a = new Box2( zero2.clone(), zero2.clone() );
			var b = new Box2( one2.clone().negate(), one2.clone() );

			assert.ok( a.clampPoint( new Vector2( 0, 0 ) ).equals( new Vector2( 0, 0 ) ), "Passed!" );
			assert.ok( a.clampPoint( new Vector2( 1, 1 ) ).equals( new Vector2( 0, 0 ) ), "Passed!" );
			assert.ok( a.clampPoint( new Vector2( - 1, - 1 ) ).equals( new Vector2( 0, 0 ) ), "Passed!" );

			assert.ok( b.clampPoint( new Vector2( 2, 2 ) ).equals( new Vector2( 1, 1 ) ), "Passed!" );
			assert.ok( b.clampPoint( new Vector2( 1, 1 ) ).equals( new Vector2( 1, 1 ) ), "Passed!" );
			assert.ok( b.clampPoint( new Vector2( 0, 0 ) ).equals( new Vector2( 0, 0 ) ), "Passed!" );
			assert.ok( b.clampPoint( new Vector2( - 1, - 1 ) ).equals( new Vector2( - 1, - 1 ) ), "Passed!" );
			assert.ok( b.clampPoint( new Vector2( - 2, - 2 ) ).equals( new Vector2( - 1, - 1 ) ), "Passed!" );

		} );

		QUnit.test( "distanceToPoint", ( assert ) => {

			var a = new Box2( zero2.clone(), zero2.clone() );
			var b = new Box2( one2.clone().negate(), one2.clone() );

			assert.ok( a.distanceToPoint( new Vector2( 0, 0 ) ) == 0, "Passed!" );
			assert.ok( a.distanceToPoint( new Vector2( 1, 1 ) ) == Math.sqrt( 2 ), "Passed!" );
			assert.ok( a.distanceToPoint( new Vector2( - 1, - 1 ) ) == Math.sqrt( 2 ), "Passed!" );

			assert.ok( b.distanceToPoint( new Vector2( 2, 2 ) ) == Math.sqrt( 2 ), "Passed!" );
			assert.ok( b.distanceToPoint( new Vector2( 1, 1 ) ) == 0, "Passed!" );
			assert.ok( b.distanceToPoint( new Vector2( 0, 0 ) ) == 0, "Passed!" );
			assert.ok( b.distanceToPoint( new Vector2( - 1, - 1 ) ) == 0, "Passed!" );
			assert.ok( b.distanceToPoint( new Vector2( - 2, - 2 ) ) == Math.sqrt( 2 ), "Passed!" );

		} );

		QUnit.test( "intersect", ( assert ) => {

			var a = new Box2( zero2.clone(), zero2.clone() );
			var b = new Box2( zero2.clone(), one2.clone() );
			var c = new Box2( one2.clone().negate(), one2.clone() );

			assert.ok( a.clone().intersect( a ).equals( a ), "Passed!" );
			assert.ok( a.clone().intersect( b ).equals( a ), "Passed!" );
			assert.ok( b.clone().intersect( b ).equals( b ), "Passed!" );
			assert.ok( a.clone().intersect( c ).equals( a ), "Passed!" );
			assert.ok( b.clone().intersect( c ).equals( b ), "Passed!" );
			assert.ok( c.clone().intersect( c ).equals( c ), "Passed!" );

		} );

		QUnit.test( "union", ( assert ) => {

			var a = new Box2( zero2.clone(), zero2.clone() );
			var b = new Box2( zero2.clone(), one2.clone() );
			var c = new Box2( one2.clone().negate(), one2.clone() );

			assert.ok( a.clone().union( a ).equals( a ), "Passed!" );
			assert.ok( a.clone().union( b ).equals( b ), "Passed!" );
			assert.ok( a.clone().union( c ).equals( c ), "Passed!" );
			assert.ok( b.clone().union( c ).equals( c ), "Passed!" );

		} );

		QUnit.test( "translate", ( assert ) => {

			var a = new Box2( zero2.clone(), zero2.clone() );
			var b = new Box2( zero2.clone(), one2.clone() );
			var c = new Box2( one2.clone().negate(), one2.clone() );
			var d = new Box2( one2.clone().negate(), zero2.clone() );

			assert.ok( a.clone().translate( one2 ).equals( new Box2( one2, one2 ) ), "Passed!" );
			assert.ok( a.clone().translate( one2 ).translate( one2.clone().negate() ).equals( a ), "Passed!" );
			assert.ok( d.clone().translate( one2 ).equals( b ), "Passed!" );
			assert.ok( b.clone().translate( one2.clone().negate() ).equals( d ), "Passed!" );

		} );

		QUnit.todo( "equals", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

	} );

} );
