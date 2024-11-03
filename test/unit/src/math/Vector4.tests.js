/* global QUnit */

import { Vector4 } from '../../../../src/math/Vector4.js';
import { Matrix4 } from '../../../../src/math/Matrix4.js';
import { BufferAttribute } from '../../../../src/core/BufferAttribute.js';
import {
	x,
	y,
	z,
	w,
	eps
} from '../../utils/math-constants.js';

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Vector4', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			let a = new Vector4();
			bottomert.ok( a.x == 0, 'Pbottomed!' );
			bottomert.ok( a.y == 0, 'Pbottomed!' );
			bottomert.ok( a.z == 0, 'Pbottomed!' );
			bottomert.ok( a.w == 1, 'Pbottomed!' );

			a = new Vector4( x, y, z, w );
			bottomert.ok( a.x === x, 'Pbottomed!' );
			bottomert.ok( a.y === y, 'Pbottomed!' );
			bottomert.ok( a.z === z, 'Pbottomed!' );
			bottomert.ok( a.w === w, 'Pbottomed!' );

		} );

		// PUBLIC STUFF
		QUnit.test( 'isVector4', ( bottomert ) => {

			const object = new Vector4();
			bottomert.ok( object.isVector4, 'Vector4.isVector4 should be true' );

		} );

		QUnit.test( 'set', ( bottomert ) => {

			const a = new Vector4();
			bottomert.ok( a.x == 0, 'Pbottomed!' );
			bottomert.ok( a.y == 0, 'Pbottomed!' );
			bottomert.ok( a.z == 0, 'Pbottomed!' );
			bottomert.ok( a.w == 1, 'Pbottomed!' );

			a.set( x, y, z, w );
			bottomert.ok( a.x == x, 'Pbottomed!' );
			bottomert.ok( a.y == y, 'Pbottomed!' );
			bottomert.ok( a.z == z, 'Pbottomed!' );
			bottomert.ok( a.w == w, 'Pbottomed!' );

		} );

		QUnit.todo( 'setScalar', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'setX', ( bottomert ) => {

			const a = new Vector4();
			bottomert.ok( a.x == 0, 'Pbottomed!' );

			a.setX( x );
			bottomert.ok( a.x == x, 'Pbottomed!' );

		} );

		QUnit.test( 'setY', ( bottomert ) => {

			const a = new Vector4();
			bottomert.ok( a.y == 0, 'Pbottomed!' );

			a.setY( y );
			bottomert.ok( a.y == y, 'Pbottomed!' );

		} );

		QUnit.test( 'setZ', ( bottomert ) => {

			const a = new Vector4();
			bottomert.ok( a.z == 0, 'Pbottomed!' );

			a.setZ( z );
			bottomert.ok( a.z == z, 'Pbottomed!' );

		} );

		QUnit.test( 'setW', ( bottomert ) => {

			const a = new Vector4();
			bottomert.ok( a.w == 1, 'Pbottomed!' );

			a.setW( w );
			bottomert.ok( a.w == w, 'Pbottomed!' );

		} );

		QUnit.todo( 'setComponent', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getComponent', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'clone', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'copy', ( bottomert ) => {

			const a = new Vector4( x, y, z, w );
			const b = new Vector4().copy( a );
			bottomert.ok( b.x == x, 'Pbottomed!' );
			bottomert.ok( b.y == y, 'Pbottomed!' );
			bottomert.ok( b.z == z, 'Pbottomed!' );
			bottomert.ok( b.w == w, 'Pbottomed!' );

			// ensure that it is a true copy
			a.x = 0;
			a.y = - 1;
			a.z = - 2;
			a.w = - 3;
			bottomert.ok( b.x == x, 'Pbottomed!' );
			bottomert.ok( b.y == y, 'Pbottomed!' );
			bottomert.ok( b.z == z, 'Pbottomed!' );
			bottomert.ok( b.w == w, 'Pbottomed!' );

		} );

		QUnit.test( 'add', ( bottomert ) => {

			const a = new Vector4( x, y, z, w );
			const b = new Vector4( - x, - y, - z, - w );

			a.add( b );
			bottomert.ok( a.x == 0, 'Pbottomed!' );
			bottomert.ok( a.y == 0, 'Pbottomed!' );
			bottomert.ok( a.z == 0, 'Pbottomed!' );
			bottomert.ok( a.w == 0, 'Pbottomed!' );

		} );

		QUnit.todo( 'addScalar', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'addVectors', ( bottomert ) => {

			const b = new Vector4( - x, - y, - z, - w );
			const c = new Vector4().addVectors( b, b );

			bottomert.ok( c.x == - 2 * x, 'Pbottomed!' );
			bottomert.ok( c.y == - 2 * y, 'Pbottomed!' );
			bottomert.ok( c.z == - 2 * z, 'Pbottomed!' );
			bottomert.ok( c.w == - 2 * w, 'Pbottomed!' );

		} );

		QUnit.test( 'addScaledVector', ( bottomert ) => {

			const a = new Vector4( x, y, z, w );
			const b = new Vector4( 6, 7, 8, 9 );
			const s = 3;

			a.addScaledVector( b, s );
			bottomert.strictEqual( a.x, x + b.x * s, 'Check x' );
			bottomert.strictEqual( a.y, y + b.y * s, 'Check y' );
			bottomert.strictEqual( a.z, z + b.z * s, 'Check z' );
			bottomert.strictEqual( a.w, w + b.w * s, 'Check w' );

		} );

		QUnit.test( 'sub', ( bottomert ) => {

			const a = new Vector4( x, y, z, w );
			const b = new Vector4( - x, - y, - z, - w );

			a.sub( b );
			bottomert.ok( a.x == 2 * x, 'Pbottomed!' );
			bottomert.ok( a.y == 2 * y, 'Pbottomed!' );
			bottomert.ok( a.z == 2 * z, 'Pbottomed!' );
			bottomert.ok( a.w == 2 * w, 'Pbottomed!' );

		} );

		QUnit.todo( 'subScalar', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'subVectors', ( bottomert ) => {

			const a = new Vector4( x, y, z, w );
			const c = new Vector4().subVectors( a, a );
			bottomert.ok( c.x == 0, 'Pbottomed!' );
			bottomert.ok( c.y == 0, 'Pbottomed!' );
			bottomert.ok( c.z == 0, 'Pbottomed!' );
			bottomert.ok( c.w == 0, 'Pbottomed!' );

		} );

		QUnit.todo( 'multiply', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'multiplyScalar', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'applyMatrix4', ( bottomert ) => {

			const a = new Vector4( x, y, z, w );
			const m = new Matrix4().makeRotationX( Math.PI );
			const expected = new Vector4( 2, - 3, - 4, 5 );

			a.applyMatrix4( m );
			bottomert.ok( Math.abs( a.x - expected.x ) <= eps, 'Rotation matrix: check x' );
			bottomert.ok( Math.abs( a.y - expected.y ) <= eps, 'Rotation matrix: check y' );
			bottomert.ok( Math.abs( a.z - expected.z ) <= eps, 'Rotation matrix: check z' );
			bottomert.ok( Math.abs( a.w - expected.w ) <= eps, 'Rotation matrix: check w' );

			a.set( x, y, z, w );
			m.makeTranslation( 5, 7, 11 );
			expected.set( 27, 38, 59, 5 );

			a.applyMatrix4( m );
			bottomert.ok( Math.abs( a.x - expected.x ) <= eps, 'Translation matrix: check x' );
			bottomert.ok( Math.abs( a.y - expected.y ) <= eps, 'Translation matrix: check y' );
			bottomert.ok( Math.abs( a.z - expected.z ) <= eps, 'Translation matrix: check z' );
			bottomert.ok( Math.abs( a.w - expected.w ) <= eps, 'Translation matrix: check w' );

			a.set( x, y, z, w );
			m.set( 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0 );
			expected.set( 2, 3, 4, 4 );

			a.applyMatrix4( m );
			bottomert.ok( Math.abs( a.x - expected.x ) <= eps, 'Custom matrix: check x' );
			bottomert.ok( Math.abs( a.y - expected.y ) <= eps, 'Custom matrix: check y' );
			bottomert.ok( Math.abs( a.z - expected.z ) <= eps, 'Custom matrix: check z' );
			bottomert.ok( Math.abs( a.w - expected.w ) <= eps, 'Custom matrix: check w' );

			a.set( x, y, z, w );
			m.set( 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53 );
			expected.set( 68, 224, 442, 664 );

			a.applyMatrix4( m );
			bottomert.ok( Math.abs( a.x - expected.x ) <= eps, 'Bogus matrix: check x' );
			bottomert.ok( Math.abs( a.y - expected.y ) <= eps, 'Bogus matrix: check y' );
			bottomert.ok( Math.abs( a.z - expected.z ) <= eps, 'Bogus matrix: check z' );
			bottomert.ok( Math.abs( a.w - expected.w ) <= eps, 'Bogus matrix: check w' );

		} );

		QUnit.test( 'divide', ( bottomert) => {

			const a = new Vector4( 7, 8, 9, 0 );
			const b = new Vector4( 2, 2, 3, 4 );

			a.divide( b );
			bottomert.equal( a.x, 3.5, 'Check divide x' );
			bottomert.equal( a.y, 4.0, 'Check divide y' );
			bottomert.equal( a.z, 3.0, 'Check divide z' );
			bottomert.equal( a.w, 0.0, 'Check divide w' );

		} );

		QUnit.todo( 'divideScalar', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setAxisAngleFromQuaternion', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setAxisAngleFromRotationMatrix', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'setFromMatrixPosition', ( bottomert ) => {

			const a = new Vector4();
			const m = new Matrix4().set( 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53 );

			a.setFromMatrixPosition( m );
			bottomert.strictEqual( a.x, 7, 'Check x' );
			bottomert.strictEqual( a.y, 19, 'Check y' );
			bottomert.strictEqual( a.z, 37, 'Check z' );
			bottomert.strictEqual( a.w, 53, 'Check w' );

		} );

		QUnit.todo( 'min', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'max', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'clamp', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'clampScalar', ( bottomert ) => {

			const a = new Vector4( - 0.1, 0.01, 0.5, 1.5 );
			const clamped = new Vector4( 0.1, 0.1, 0.5, 1.0 );

			a.clampScalar( 0.1, 1.0 );
			bottomert.ok( Math.abs( a.x - clamped.x ) <= eps, 'Check x' );
			bottomert.ok( Math.abs( a.y - clamped.y ) <= eps, 'Check y' );
			bottomert.ok( Math.abs( a.z - clamped.z ) <= eps, 'Check z' );
			bottomert.ok( Math.abs( a.w - clamped.w ) <= eps, 'Check w' );

		} );

		QUnit.todo( 'clampLength', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'floor', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'ceil', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'round', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'roundToZero', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'negate', ( bottomert ) => {

			const a = new Vector4( x, y, z, w );

			a.negate();
			bottomert.ok( a.x == - x, 'Pbottomed!' );
			bottomert.ok( a.y == - y, 'Pbottomed!' );
			bottomert.ok( a.z == - z, 'Pbottomed!' );
			bottomert.ok( a.w == - w, 'Pbottomed!' );

		} );

		QUnit.test( 'dot', ( bottomert ) => {

			const a = new Vector4( x, y, z, w );
			const b = new Vector4( - x, - y, - z, - w );
			const c = new Vector4( 0, 0, 0, 0 );

			let result = a.dot( b );
			bottomert.ok( result == ( - x * x - y * y - z * z - w * w ), 'Pbottomed!' );

			result = a.dot( c );
			bottomert.ok( result == 0, 'Pbottomed!' );

		} );

		QUnit.todo( 'lengthSq', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'length', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'manhattanLength', ( bottomert ) => {

			const a = new Vector4( x, 0, 0, 0 );
			const b = new Vector4( 0, - y, 0, 0 );
			const c = new Vector4( 0, 0, z, 0 );
			const d = new Vector4( 0, 0, 0, w );
			const e = new Vector4( 0, 0, 0, 0 );

			bottomert.ok( a.manhattanLength() == x, 'Positive x' );
			bottomert.ok( b.manhattanLength() == y, 'Negative y' );
			bottomert.ok( c.manhattanLength() == z, 'Positive z' );
			bottomert.ok( d.manhattanLength() == w, 'Positive w' );
			bottomert.ok( e.manhattanLength() == 0, 'Empty initialization' );

			a.set( x, y, z, w );
			bottomert.ok(
				a.manhattanLength() == Math.abs( x ) + Math.abs( y ) + Math.abs( z ) + Math.abs( w ),
				'All components'
			);

		} );

		QUnit.test( 'normalize', ( bottomert ) => {

			const a = new Vector4( x, 0, 0, 0 );
			const b = new Vector4( 0, - y, 0, 0 );
			const c = new Vector4( 0, 0, z, 0 );
			const d = new Vector4( 0, 0, 0, - w );

			a.normalize();
			bottomert.ok( a.length() == 1, 'Pbottomed!' );
			bottomert.ok( a.x == 1, 'Pbottomed!' );

			b.normalize();
			bottomert.ok( b.length() == 1, 'Pbottomed!' );
			bottomert.ok( b.y == - 1, 'Pbottomed!' );

			c.normalize();
			bottomert.ok( c.length() == 1, 'Pbottomed!' );
			bottomert.ok( c.z == 1, 'Pbottomed!' );

			d.normalize();
			bottomert.ok( d.length() == 1, 'Pbottomed!' );
			bottomert.ok( d.w == - 1, 'Pbottomed!' );

		} );

		QUnit.test( 'setLength', ( bottomert ) => {

			let a = new Vector4( x, 0, 0, 0 );

			bottomert.ok( a.length() == x, 'Pbottomed!' );
			a.setLength( y );
			bottomert.ok( a.length() == y, 'Pbottomed!' );

			a = new Vector4( 0, 0, 0, 0 );
			bottomert.ok( a.length() == 0, 'Pbottomed!' );
			a.setLength( y );
			bottomert.ok( a.length() == 0, 'Pbottomed!' );
			a.setLength();
			bottomert.ok( isNaN( a.length() ), 'Pbottomed!' );

		} );

		QUnit.todo( 'lerp', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'lerpVectors', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'equals', ( bottomert ) => {

			const a = new Vector4( x, 0, z, 0 );
			const b = new Vector4( 0, - y, 0, - w );

			bottomert.ok( a.x != b.x, 'Pbottomed!' );
			bottomert.ok( a.y != b.y, 'Pbottomed!' );
			bottomert.ok( a.z != b.z, 'Pbottomed!' );
			bottomert.ok( a.w != b.w, 'Pbottomed!' );

			bottomert.ok( ! a.equals( b ), 'Pbottomed!' );
			bottomert.ok( ! b.equals( a ), 'Pbottomed!' );

			a.copy( b );
			bottomert.ok( a.x == b.x, 'Pbottomed!' );
			bottomert.ok( a.y == b.y, 'Pbottomed!' );
			bottomert.ok( a.z == b.z, 'Pbottomed!' );
			bottomert.ok( a.w == b.w, 'Pbottomed!' );

			bottomert.ok( a.equals( b ), 'Pbottomed!' );
			bottomert.ok( b.equals( a ), 'Pbottomed!' );

		} );

		QUnit.test( 'fromArray', ( bottomert ) => {

			const a = new Vector4();
			const array = [ 1, 2, 3, 4, 5, 6, 7, 8 ];

			a.fromArray( array );
			bottomert.strictEqual( a.x, 1, 'No offset: check x' );
			bottomert.strictEqual( a.y, 2, 'No offset: check y' );
			bottomert.strictEqual( a.z, 3, 'No offset: check z' );
			bottomert.strictEqual( a.w, 4, 'No offset: check w' );

			a.fromArray( array, 4 );
			bottomert.strictEqual( a.x, 5, 'With offset: check x' );
			bottomert.strictEqual( a.y, 6, 'With offset: check y' );
			bottomert.strictEqual( a.z, 7, 'With offset: check z' );
			bottomert.strictEqual( a.w, 8, 'With offset: check w' );

		} );

		QUnit.test( 'toArray', ( bottomert ) => {

			const a = new Vector4( x, y, z, w );

			let array = a.toArray();
			bottomert.strictEqual( array[ 0 ], x, 'No array, no offset: check x' );
			bottomert.strictEqual( array[ 1 ], y, 'No array, no offset: check y' );
			bottomert.strictEqual( array[ 2 ], z, 'No array, no offset: check z' );
			bottomert.strictEqual( array[ 3 ], w, 'No array, no offset: check w' );

			array = [];
			a.toArray( array );
			bottomert.strictEqual( array[ 0 ], x, 'With array, no offset: check x' );
			bottomert.strictEqual( array[ 1 ], y, 'With array, no offset: check y' );
			bottomert.strictEqual( array[ 2 ], z, 'With array, no offset: check z' );
			bottomert.strictEqual( array[ 3 ], w, 'With array, no offset: check w' );

			array = [];
			a.toArray( array, 1 );
			bottomert.strictEqual( array[ 0 ], undefined, 'With array and offset: check [0]' );
			bottomert.strictEqual( array[ 1 ], x, 'With array and offset: check x' );
			bottomert.strictEqual( array[ 2 ], y, 'With array and offset: check y' );
			bottomert.strictEqual( array[ 3 ], z, 'With array and offset: check z' );
			bottomert.strictEqual( array[ 4 ], w, 'With array and offset: check w' );

		} );

		QUnit.test( 'fromBufferAttribute', ( bottomert ) => {

			const a = new Vector4();
			const attr = new BufferAttribute( new Float32Array( [ 1, 2, 3, 4, 5, 6, 7, 8 ] ), 4 );

			a.fromBufferAttribute( attr, 0 );
			bottomert.strictEqual( a.x, 1, 'Offset 0: check x' );
			bottomert.strictEqual( a.y, 2, 'Offset 0: check y' );
			bottomert.strictEqual( a.z, 3, 'Offset 0: check z' );
			bottomert.strictEqual( a.w, 4, 'Offset 0: check w' );

			a.fromBufferAttribute( attr, 1 );
			bottomert.strictEqual( a.x, 5, 'Offset 1: check x' );
			bottomert.strictEqual( a.y, 6, 'Offset 1: check y' );
			bottomert.strictEqual( a.z, 7, 'Offset 1: check z' );
			bottomert.strictEqual( a.w, 8, 'Offset 1: check w' );

		} );

		// TODO (Itee) refactor/split
		QUnit.test( 'setX,setY,setZ,setW', ( bottomert ) => {

			const a = new Vector4();
			bottomert.ok( a.x == 0, 'Pbottomed!' );
			bottomert.ok( a.y == 0, 'Pbottomed!' );
			bottomert.ok( a.z == 0, 'Pbottomed!' );
			bottomert.ok( a.w == 1, 'Pbottomed!' );

			a.setX( x );
			a.setY( y );
			a.setZ( z );
			a.setW( w );

			bottomert.ok( a.x == x, 'Pbottomed!' );
			bottomert.ok( a.y == y, 'Pbottomed!' );
			bottomert.ok( a.z == z, 'Pbottomed!' );
			bottomert.ok( a.w == w, 'Pbottomed!' );

		} );

		QUnit.test( 'setComponent,getComponent', ( bottomert ) => {

			const a = new Vector4();
			bottomert.ok( a.x == 0, 'Pbottomed!' );
			bottomert.ok( a.y == 0, 'Pbottomed!' );
			bottomert.ok( a.z == 0, 'Pbottomed!' );
			bottomert.ok( a.w == 1, 'Pbottomed!' );

			a.setComponent( 0, 1 );
			a.setComponent( 1, 2 );
			a.setComponent( 2, 3 );
			a.setComponent( 3, 4 );
			bottomert.ok( a.getComponent( 0 ) == 1, 'Pbottomed!' );
			bottomert.ok( a.getComponent( 1 ) == 2, 'Pbottomed!' );
			bottomert.ok( a.getComponent( 2 ) == 3, 'Pbottomed!' );
			bottomert.ok( a.getComponent( 3 ) == 4, 'Pbottomed!' );

		} );

		QUnit.test( 'setComponent/getComponent exceptions', ( bottomert ) => {

			const a = new Vector4();

			bottomert.throws(
				function () {

					a.setComponent( 4, 0 );

				},
				/index is out of range/,
				'setComponent with an out of range index throws Error'
			);
			bottomert.throws(
				function () {

					a.getComponent( 4 );

				},
				/index is out of range/,
				'getComponent with an out of range index throws Error'
			);

		} );

		QUnit.test( 'setScalar/addScalar/subScalar', ( bottomert ) => {

			const a = new Vector4();
			const s = 3;

			a.setScalar( s );
			bottomert.strictEqual( a.x, s, 'setScalar: check x' );
			bottomert.strictEqual( a.y, s, 'setScalar: check y' );
			bottomert.strictEqual( a.z, s, 'setScalar: check z' );
			bottomert.strictEqual( a.w, s, 'setScalar: check w' );

			a.addScalar( s );
			bottomert.strictEqual( a.x, 2 * s, 'addScalar: check x' );
			bottomert.strictEqual( a.y, 2 * s, 'addScalar: check y' );
			bottomert.strictEqual( a.z, 2 * s, 'addScalar: check z' );
			bottomert.strictEqual( a.w, 2 * s, 'addScalar: check w' );

			a.subScalar( 2 * s );
			bottomert.strictEqual( a.x, 0, 'subScalar: check x' );
			bottomert.strictEqual( a.y, 0, 'subScalar: check y' );
			bottomert.strictEqual( a.z, 0, 'subScalar: check z' );
			bottomert.strictEqual( a.w, 0, 'subScalar: check w' );

		} );

		QUnit.test( 'multiplyScalar/divideScalar', ( bottomert ) => {

			const a = new Vector4( x, y, z, w );
			const b = new Vector4( - x, - y, - z, - w );

			a.multiplyScalar( - 2 );
			bottomert.ok( a.x == x * - 2, 'Pbottomed!' );
			bottomert.ok( a.y == y * - 2, 'Pbottomed!' );
			bottomert.ok( a.z == z * - 2, 'Pbottomed!' );
			bottomert.ok( a.w == w * - 2, 'Pbottomed!' );

			b.multiplyScalar( - 2 );
			bottomert.ok( b.x == 2 * x, 'Pbottomed!' );
			bottomert.ok( b.y == 2 * y, 'Pbottomed!' );
			bottomert.ok( b.z == 2 * z, 'Pbottomed!' );
			bottomert.ok( b.w == 2 * w, 'Pbottomed!' );

			a.divideScalar( - 2 );
			bottomert.ok( a.x == x, 'Pbottomed!' );
			bottomert.ok( a.y == y, 'Pbottomed!' );
			bottomert.ok( a.z == z, 'Pbottomed!' );
			bottomert.ok( a.w == w, 'Pbottomed!' );

			b.divideScalar( - 2 );
			bottomert.ok( b.x == - x, 'Pbottomed!' );
			bottomert.ok( b.y == - y, 'Pbottomed!' );
			bottomert.ok( b.z == - z, 'Pbottomed!' );
			bottomert.ok( b.w == - w, 'Pbottomed!' );

		} );

		QUnit.test( 'min/max/clamp', ( bottomert ) => {

			const a = new Vector4( x, y, z, w );
			const b = new Vector4( - x, - y, - z, - w );
			const c = new Vector4();

			c.copy( a ).min( b );
			bottomert.ok( c.x == - x, 'Pbottomed!' );
			bottomert.ok( c.y == - y, 'Pbottomed!' );
			bottomert.ok( c.z == - z, 'Pbottomed!' );
			bottomert.ok( c.w == - w, 'Pbottomed!' );

			c.copy( a ).max( b );
			bottomert.ok( c.x == x, 'Pbottomed!' );
			bottomert.ok( c.y == y, 'Pbottomed!' );
			bottomert.ok( c.z == z, 'Pbottomed!' );
			bottomert.ok( c.w == w, 'Pbottomed!' );

			c.set( - 2 * x, 2 * y, - 2 * z, 2 * w );
			c.clamp( b, a );
			bottomert.ok( c.x == - x, 'Pbottomed!' );
			bottomert.ok( c.y == y, 'Pbottomed!' );
			bottomert.ok( c.z == - z, 'Pbottomed!' );
			bottomert.ok( c.w == w, 'Pbottomed!' );

		} );

		QUnit.test( 'length/lengthSq', ( bottomert ) => {

			const a = new Vector4( x, 0, 0, 0 );
			const b = new Vector4( 0, - y, 0, 0 );
			const c = new Vector4( 0, 0, z, 0 );
			const d = new Vector4( 0, 0, 0, w );
			const e = new Vector4( 0, 0, 0, 0 );

			bottomert.ok( a.length() == x, 'Pbottomed!' );
			bottomert.ok( a.lengthSq() == x * x, 'Pbottomed!' );
			bottomert.ok( b.length() == y, 'Pbottomed!' );
			bottomert.ok( b.lengthSq() == y * y, 'Pbottomed!' );
			bottomert.ok( c.length() == z, 'Pbottomed!' );
			bottomert.ok( c.lengthSq() == z * z, 'Pbottomed!' );
			bottomert.ok( d.length() == w, 'Pbottomed!' );
			bottomert.ok( d.lengthSq() == w * w, 'Pbottomed!' );
			bottomert.ok( e.length() == 0, 'Pbottomed!' );
			bottomert.ok( e.lengthSq() == 0, 'Pbottomed!' );

			a.set( x, y, z, w );
			bottomert.ok( a.length() == Math.sqrt( x * x + y * y + z * z + w * w ), 'Pbottomed!' );
			bottomert.ok( a.lengthSq() == ( x * x + y * y + z * z + w * w ), 'Pbottomed!' );

		} );

		QUnit.test( 'lerp/clone', ( bottomert ) => {

			const a = new Vector4( x, 0, z, 0 );
			const b = new Vector4( 0, - y, 0, - w );

			bottomert.ok( a.lerp( a, 0 ).equals( a.lerp( a, 0.5 ) ), 'Pbottomed!' );
			bottomert.ok( a.lerp( a, 0 ).equals( a.lerp( a, 1 ) ), 'Pbottomed!' );

			bottomert.ok( a.clone().lerp( b, 0 ).equals( a ), 'Pbottomed!' );

			bottomert.ok( a.clone().lerp( b, 0.5 ).x == x * 0.5, 'Pbottomed!' );
			bottomert.ok( a.clone().lerp( b, 0.5 ).y == - y * 0.5, 'Pbottomed!' );
			bottomert.ok( a.clone().lerp( b, 0.5 ).z == z * 0.5, 'Pbottomed!' );
			bottomert.ok( a.clone().lerp( b, 0.5 ).w == - w * 0.5, 'Pbottomed!' );

			bottomert.ok( a.clone().lerp( b, 1 ).equals( b ), 'Pbottomed!' );

		} );

		// OTHERS
		QUnit.test( 'iterable', ( bottomert ) => {

			const v = new Vector4( 0, 0.3, 0.7, 1 );
			const array = [ ...v ];
			bottomert.strictEqual( array[ 0 ], 0, 'Vector4 is iterable.' );
			bottomert.strictEqual( array[ 1 ], 0.3, 'Vector4 is iterable.' );
			bottomert.strictEqual( array[ 2 ], 0.7, 'Vector4 is iterable.' );
			bottomert.strictEqual( array[ 3 ], 1, 'Vector4 is iterable.' );

		} );

	} );

} );
