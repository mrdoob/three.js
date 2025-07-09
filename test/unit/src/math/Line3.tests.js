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
		QUnit.test( 'Instancing', ( assert ) => {

			let a = new Line3();
			assert.ok( a.start.equals( zero3 ), 'Passed!' );
			assert.ok( a.end.equals( zero3 ), 'Passed!' );

			a = new Line3( two3.clone(), one3.clone() );
			assert.ok( a.start.equals( two3 ), 'Passed!' );
			assert.ok( a.end.equals( one3 ), 'Passed!' );

		} );

		// PUBLIC STUFF
		QUnit.test( 'set', ( assert ) => {

			const a = new Line3();

			a.set( one3, one3 );
			assert.ok( a.start.equals( one3 ), 'Passed!' );
			assert.ok( a.end.equals( one3 ), 'Passed!' );

		} );

		QUnit.test( 'copy/equals', ( assert ) => {

			const a = new Line3( zero3.clone(), one3.clone() );
			const b = new Line3().copy( a );
			assert.ok( b.start.equals( zero3 ), 'Passed!' );
			assert.ok( b.end.equals( one3 ), 'Passed!' );

			// ensure that it is a true copy
			a.start = zero3;
			a.end = one3;
			assert.ok( b.start.equals( zero3 ), 'Passed!' );
			assert.ok( b.end.equals( one3 ), 'Passed!' );

		} );

		QUnit.test( 'clone/equal', ( assert ) => {

			let a = new Line3();
			const b = new Line3( zero3, new Vector3( 1, 1, 1 ) );
			const c = new Line3( zero3, new Vector3( 1, 1, 0 ) );

			assert.notOk( a.equals( b ), 'Check a and b aren\'t equal' );
			assert.notOk( a.equals( c ), 'Check a and c aren\'t equal' );
			assert.notOk( b.equals( c ), 'Check b and c aren\'t equal' );

			a = b.clone();
			assert.ok( a.equals( b ), 'Check a and b are equal after clone()' );
			assert.notOk( a.equals( c ), 'Check a and c aren\'t equal after clone()' );

			a.set( zero3, zero3 );
			assert.notOk( a.equals( b ), 'Check a and b are not equal after modification' );

		} );

		QUnit.test( 'getCenter', ( assert ) => {

			const center = new Vector3();

			const a = new Line3( zero3.clone(), two3.clone() );
			assert.ok( a.getCenter( center ).equals( one3.clone() ), 'Passed' );

		} );

		QUnit.test( 'delta', ( assert ) => {

			const delta = new Vector3();

			const a = new Line3( zero3.clone(), two3.clone() );
			assert.ok( a.delta( delta ).equals( two3.clone() ), 'Passed' );

		} );

		QUnit.test( 'distanceSq', ( assert ) => {

			const a = new Line3( zero3, zero3 );
			const b = new Line3( zero3, one3 );
			const c = new Line3( one3.clone().negate(), one3 );
			const d = new Line3( two3.clone().multiplyScalar( - 2 ), two3.clone().negate() );

			assert.numEqual( a.distanceSq(), 0, 'Check squared distance for zero-length line' );
			assert.numEqual( b.distanceSq(), 3, 'Check squared distance for simple line' );
			assert.numEqual( c.distanceSq(), 12, 'Check squared distance for negative to positive endpoints' );
			assert.numEqual( d.distanceSq(), 12, 'Check squared distance for negative to negative endpoints' );


		} );

		QUnit.test( 'distance', ( assert ) => {

			const a = new Line3( zero3, zero3 );
			const b = new Line3( zero3, one3 );
			const c = new Line3( one3.clone().negate(), one3 );
			const d = new Line3( two3.clone().multiplyScalar( - 2 ), two3.clone().negate() );

			assert.numEqual( a.distance(), 0, 'Check distance for zero-length line' );
			assert.numEqual( b.distance(), Math.sqrt( 3 ), 'Check distance for simple line' );
			assert.numEqual( c.distance(), Math.sqrt( 12 ), 'Check distance for negative to positive endpoints' );
			assert.numEqual( d.distance(), Math.sqrt( 12 ), 'Check distance for negative to negative endpoints' );

		} );

		QUnit.test( 'at', ( assert ) => {

			const a = new Line3( one3.clone(), new Vector3( 1, 1, 2 ) );
			const point = new Vector3();

			a.at( - 1, point );
			assert.ok( point.distanceTo( new Vector3( 1, 1, 0 ) ) < 0.0001, 'Passed!' );
			a.at( 0, point );
			assert.ok( point.distanceTo( one3.clone() ) < 0.0001, 'Passed!' );
			a.at( 1, point );
			assert.ok( point.distanceTo( new Vector3( 1, 1, 2 ) ) < 0.0001, 'Passed!' );
			a.at( 2, point );
			assert.ok( point.distanceTo( new Vector3( 1, 1, 3 ) ) < 0.0001, 'Passed!' );

		} );

		QUnit.test( 'closestPointToPoint/closestPointToPointParameter', ( assert ) => {

			const a = new Line3( one3.clone(), new Vector3( 1, 1, 2 ) );
			const point = new Vector3();

			// nearby the ray
			assert.ok( a.closestPointToPointParameter( zero3.clone(), true ) == 0, 'Passed!' );
			a.closestPointToPoint( zero3.clone(), true, point );
			assert.ok( point.distanceTo( new Vector3( 1, 1, 1 ) ) < 0.0001, 'Passed!' );

			// nearby the ray
			assert.ok( a.closestPointToPointParameter( zero3.clone(), false ) == - 1, 'Passed!' );
			a.closestPointToPoint( zero3.clone(), false, point );
			assert.ok( point.distanceTo( new Vector3( 1, 1, 0 ) ) < 0.0001, 'Passed!' );

			// nearby the ray
			assert.ok( a.closestPointToPointParameter( new Vector3( 1, 1, 5 ), true ) == 1, 'Passed!' );
			a.closestPointToPoint( new Vector3( 1, 1, 5 ), true, point );
			assert.ok( point.distanceTo( new Vector3( 1, 1, 2 ) ) < 0.0001, 'Passed!' );

			// exactly on the ray
			assert.ok( a.closestPointToPointParameter( one3.clone(), true ) == 0, 'Passed!' );
			a.closestPointToPoint( one3.clone(), true, point );
			assert.ok( point.distanceTo( one3.clone() ) < 0.0001, 'Passed!' );

		} );

		QUnit.test( 'applyMatrix4', ( assert ) => {

			const a = new Line3( zero3.clone(), two3.clone() );
			const b = new Vector4( two3.x, two3.y, two3.z, 1 );
			const m = new Matrix4().makeTranslation( x, y, z );
			const v = new Vector3( x, y, z );

			a.applyMatrix4( m );
			assert.ok( a.start.equals( v ), 'Translation: check start' );
			assert.ok( a.end.equals( new Vector3( 2 + x, 2 + y, 2 + z ) ), 'Translation: check start' );

			// reset starting conditions
			a.set( zero3.clone(), two3.clone() );
			m.makeRotationX( Math.PI );

			a.applyMatrix4( m );
			b.applyMatrix4( m );

			assert.ok( a.start.equals( zero3 ), 'Rotation: check start' );
			assert.numEqual( a.end.x, b.x / b.w, 'Rotation: check end.x' );
			assert.numEqual( a.end.y, b.y / b.w, 'Rotation: check end.y' );
			assert.numEqual( a.end.z, b.z / b.w, 'Rotation: check end.z' );

			// reset starting conditions
			a.set( zero3.clone(), two3.clone() );
			b.set( two3.x, two3.y, two3.z, 1 );
			m.setPosition( v );

			a.applyMatrix4( m );
			b.applyMatrix4( m );

			assert.ok( a.start.equals( v ), 'Both: check start' );
			assert.numEqual( a.end.x, b.x / b.w, 'Both: check end.x' );
			assert.numEqual( a.end.y, b.y / b.w, 'Both: check end.y' );
			assert.numEqual( a.end.z, b.z / b.w, 'Both: check end.z' );

		} );

		QUnit.test( 'equals', ( assert ) => {

			const a = new Line3( zero3.clone(), zero3.clone() );
			const b = new Line3();
			assert.ok( a.equals( b ), 'Passed' );

		} );

		QUnit.test( 'distanceSqToLine3', ( assert ) => {

			const line1 = new Line3();
			line1.start.set( 0, 0, 0 );
			line1.end.set( 2, 0, 0 );

			const line2 = new Line3();
			line2.start.set( 1, 10, 0 );
			line2.end.set( 1, - 2, 0 );

			assert.numEqual( line1.distanceSqToLine3( line2 ), 0 );

			// Parallel lines case
			line2.start.set( - 2, 0, 2 );
			line2.end.set( 20, 0, 2 );

			assert.numEqual( line1.distanceSqToLine3( line2 ), 4 );

			// Closest point on lines from one side is out of segment
			line1.start.set( 0, 4, 0 );
			line1.end.set( 2, 2, 0 );

			line2.start.set( 0, 0, 0 );
			line2.end.set( 4, 0, 0 );

			assert.numEqual( line1.distanceSqToLine3( line2 ), 4 );

			// Closest point on lines from another side is out of segment
			line1.start.set( 0, 4, 0 );
			line1.end.set( 3, 1, 0 );

			line2.start.set( 0, 0, 0 );
			line2.end.set( 1, 0, 0 );

			assert.numEqual( line1.distanceSqToLine3( line2 ), 4.5 );

			// Closest point on lines from both sides is out of the segment
			line1.start.set( 0, 4, 0 );
			line1.end.set( 2, 2, 0 );

			line2.start.set( 0, 0, 0 );
			line2.end.set( 1, 0, 0 );

			assert.numEqual( line1.distanceSqToLine3( line2 ), 5 );

			// General case with skew lines
			line1.start.set( 4, 0, 0 );
			line1.end.set( - 4, 0, 0 );

			line2.start.set( 0, 4, 0 );
			line2.end.set( 0, 0, 4 );

			assert.numEqual( line1.distanceSqToLine3( line2 ), 8 );

		} );

	} );

} );
