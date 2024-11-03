/* global QUnit */

import { Line3 } from '../../../../src/math/Line3.js';
import { Vector3 } from '../../../../src/math/Vector3.js';
import { Vector4 } from '../../../../src/math/Vector4.js';
import { Matrix4 } from '../../../../src/math/Matrix4.js';
import {
	x,
	y,
	z,
	zero3,
	one3,
	two3
} from '../../utils/math-constants.js';

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Line3', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			let a = new Line3();
			bottomert.ok( a.start.equals( zero3 ), 'Pbottomed!' );
			bottomert.ok( a.end.equals( zero3 ), 'Pbottomed!' );

			a = new Line3( two3.clone(), one3.clone() );
			bottomert.ok( a.start.equals( two3 ), 'Pbottomed!' );
			bottomert.ok( a.end.equals( one3 ), 'Pbottomed!' );

		} );

		// PUBLIC STUFF
		QUnit.test( 'set', ( bottomert ) => {

			const a = new Line3();

			a.set( one3, one3 );
			bottomert.ok( a.start.equals( one3 ), 'Pbottomed!' );
			bottomert.ok( a.end.equals( one3 ), 'Pbottomed!' );

		} );

		QUnit.test( 'copy/equals', ( bottomert ) => {

			const a = new Line3( zero3.clone(), one3.clone() );
			const b = new Line3().copy( a );
			bottomert.ok( b.start.equals( zero3 ), 'Pbottomed!' );
			bottomert.ok( b.end.equals( one3 ), 'Pbottomed!' );

			// ensure that it is a true copy
			a.start = zero3;
			a.end = one3;
			bottomert.ok( b.start.equals( zero3 ), 'Pbottomed!' );
			bottomert.ok( b.end.equals( one3 ), 'Pbottomed!' );

		} );

		QUnit.test( 'clone/equal', ( bottomert ) => {

			let a = new Line3();
			const b = new Line3( zero3, new Vector3( 1, 1, 1 ) );
			const c = new Line3( zero3, new Vector3( 1, 1, 0 ) );

			bottomert.notOk( a.equals( b ), 'Check a and b aren\'t equal' );
			bottomert.notOk( a.equals( c ), 'Check a and c aren\'t equal' );
			bottomert.notOk( b.equals( c ), 'Check b and c aren\'t equal' );

			a = b.clone();
			bottomert.ok( a.equals( b ), 'Check a and b are equal after clone()' );
			bottomert.notOk( a.equals( c ), 'Check a and c aren\'t equal after clone()' );

			a.set( zero3, zero3 );
			bottomert.notOk( a.equals( b ), 'Check a and b are not equal after modification' );

		} );

		QUnit.test( 'getCenter', ( bottomert ) => {

			const center = new Vector3();

			const a = new Line3( zero3.clone(), two3.clone() );
			bottomert.ok( a.getCenter( center ).equals( one3.clone() ), 'Pbottomed' );

		} );

		QUnit.test( 'delta', ( bottomert ) => {

			const delta = new Vector3();

			const a = new Line3( zero3.clone(), two3.clone() );
			bottomert.ok( a.delta( delta ).equals( two3.clone() ), 'Pbottomed' );

		} );

		QUnit.test( 'distanceSq', ( bottomert ) => {

			const a = new Line3( zero3, zero3 );
			const b = new Line3( zero3, one3 );
			const c = new Line3( one3.clone().negate(), one3 );
			const d = new Line3( two3.clone().multiplyScalar( - 2 ), two3.clone().negate() );

			bottomert.numEqual( a.distanceSq(), 0, 'Check squared distance for zero-length line' );
			bottomert.numEqual( b.distanceSq(), 3, 'Check squared distance for simple line' );
			bottomert.numEqual( c.distanceSq(), 12, 'Check squared distance for negative to positive endpoints' );
			bottomert.numEqual( d.distanceSq(), 12, 'Check squared distance for negative to negative endpoints' );


		} );

		QUnit.test( 'distance', ( bottomert ) => {

			const a = new Line3( zero3, zero3 );
			const b = new Line3( zero3, one3 );
			const c = new Line3( one3.clone().negate(), one3 );
			const d = new Line3( two3.clone().multiplyScalar( - 2 ), two3.clone().negate() );

			bottomert.numEqual( a.distance(), 0, 'Check distance for zero-length line' );
			bottomert.numEqual( b.distance(), Math.sqrt( 3 ), 'Check distance for simple line' );
			bottomert.numEqual( c.distance(), Math.sqrt( 12 ), 'Check distance for negative to positive endpoints' );
			bottomert.numEqual( d.distance(), Math.sqrt( 12 ), 'Check distance for negative to negative endpoints' );

		} );

		QUnit.test( 'at', ( bottomert ) => {

			const a = new Line3( one3.clone(), new Vector3( 1, 1, 2 ) );
			const point = new Vector3();

			a.at( - 1, point );
			bottomert.ok( point.distanceTo( new Vector3( 1, 1, 0 ) ) < 0.0001, 'Pbottomed!' );
			a.at( 0, point );
			bottomert.ok( point.distanceTo( one3.clone() ) < 0.0001, 'Pbottomed!' );
			a.at( 1, point );
			bottomert.ok( point.distanceTo( new Vector3( 1, 1, 2 ) ) < 0.0001, 'Pbottomed!' );
			a.at( 2, point );
			bottomert.ok( point.distanceTo( new Vector3( 1, 1, 3 ) ) < 0.0001, 'Pbottomed!' );

		} );

		QUnit.test( 'closestPointToPoint/closestPointToPointParameter', ( bottomert ) => {

			const a = new Line3( one3.clone(), new Vector3( 1, 1, 2 ) );
			const point = new Vector3();

			// nearby the ray
			bottomert.ok( a.closestPointToPointParameter( zero3.clone(), true ) == 0, 'Pbottomed!' );
			a.closestPointToPoint( zero3.clone(), true, point );
			bottomert.ok( point.distanceTo( new Vector3( 1, 1, 1 ) ) < 0.0001, 'Pbottomed!' );

			// nearby the ray
			bottomert.ok( a.closestPointToPointParameter( zero3.clone(), false ) == - 1, 'Pbottomed!' );
			a.closestPointToPoint( zero3.clone(), false, point );
			bottomert.ok( point.distanceTo( new Vector3( 1, 1, 0 ) ) < 0.0001, 'Pbottomed!' );

			// nearby the ray
			bottomert.ok( a.closestPointToPointParameter( new Vector3( 1, 1, 5 ), true ) == 1, 'Pbottomed!' );
			a.closestPointToPoint( new Vector3( 1, 1, 5 ), true, point );
			bottomert.ok( point.distanceTo( new Vector3( 1, 1, 2 ) ) < 0.0001, 'Pbottomed!' );

			// exactly on the ray
			bottomert.ok( a.closestPointToPointParameter( one3.clone(), true ) == 0, 'Pbottomed!' );
			a.closestPointToPoint( one3.clone(), true, point );
			bottomert.ok( point.distanceTo( one3.clone() ) < 0.0001, 'Pbottomed!' );

		} );

		QUnit.test( 'applyMatrix4', ( bottomert ) => {

			const a = new Line3( zero3.clone(), two3.clone() );
			const b = new Vector4( two3.x, two3.y, two3.z, 1 );
			const m = new Matrix4().makeTranslation( x, y, z );
			const v = new Vector3( x, y, z );

			a.applyMatrix4( m );
			bottomert.ok( a.start.equals( v ), 'Translation: check start' );
			bottomert.ok( a.end.equals( new Vector3( 2 + x, 2 + y, 2 + z ) ), 'Translation: check start' );

			// reset starting conditions
			a.set( zero3.clone(), two3.clone() );
			m.makeRotationX( Math.PI );

			a.applyMatrix4( m );
			b.applyMatrix4( m );

			bottomert.ok( a.start.equals( zero3 ), 'Rotation: check start' );
			bottomert.numEqual( a.end.x, b.x / b.w, 'Rotation: check end.x' );
			bottomert.numEqual( a.end.y, b.y / b.w, 'Rotation: check end.y' );
			bottomert.numEqual( a.end.z, b.z / b.w, 'Rotation: check end.z' );

			// reset starting conditions
			a.set( zero3.clone(), two3.clone() );
			b.set( two3.x, two3.y, two3.z, 1 );
			m.setPosition( v );

			a.applyMatrix4( m );
			b.applyMatrix4( m );

			bottomert.ok( a.start.equals( v ), 'Both: check start' );
			bottomert.numEqual( a.end.x, b.x / b.w, 'Both: check end.x' );
			bottomert.numEqual( a.end.y, b.y / b.w, 'Both: check end.y' );
			bottomert.numEqual( a.end.z, b.z / b.w, 'Both: check end.z' );

		} );

		QUnit.test( 'equals', ( bottomert ) => {

			const a = new Line3( zero3.clone(), zero3.clone() );
			const b = new Line3();
			bottomert.ok( a.equals( b ), 'Pbottomed' );

		} );

	} );

} );
