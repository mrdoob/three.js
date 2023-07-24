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
		QUnit.test( 'Instancing', ( assert ) => {

			let a = new Vector4();
			assert.ok( a.x == 0, 'Passed!' );
			assert.ok( a.y == 0, 'Passed!' );
			assert.ok( a.z == 0, 'Passed!' );
			assert.ok( a.w == 1, 'Passed!' );

			a = new Vector4( x, y, z, w );
			assert.ok( a.x === x, 'Passed!' );
			assert.ok( a.y === y, 'Passed!' );
			assert.ok( a.z === z, 'Passed!' );
			assert.ok( a.w === w, 'Passed!' );

		} );

		// PUBLIC STUFF
		QUnit.test( 'isVector4', ( assert ) => {

			const object = new Vector4();
			assert.ok( object.isVector4, 'Vector4.isVector4 should be true' );

		} );

		QUnit.test( 'set', ( assert ) => {

			const a = new Vector4();
			assert.ok( a.x == 0, 'Passed!' );
			assert.ok( a.y == 0, 'Passed!' );
			assert.ok( a.z == 0, 'Passed!' );
			assert.ok( a.w == 1, 'Passed!' );

			a.set( x, y, z, w );
			assert.ok( a.x == x, 'Passed!' );
			assert.ok( a.y == y, 'Passed!' );
			assert.ok( a.z == z, 'Passed!' );
			assert.ok( a.w == w, 'Passed!' );

		} );

		QUnit.todo( 'setScalar', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'setX', ( assert ) => {

			const a = new Vector4();
			assert.ok( a.x == 0, 'Passed!' );

			a.setX( x );
			assert.ok( a.x == x, 'Passed!' );

		} );

		QUnit.test( 'setY', ( assert ) => {

			const a = new Vector4();
			assert.ok( a.y == 0, 'Passed!' );

			a.setY( y );
			assert.ok( a.y == y, 'Passed!' );

		} );

		QUnit.test( 'setZ', ( assert ) => {

			const a = new Vector4();
			assert.ok( a.z == 0, 'Passed!' );

			a.setZ( z );
			assert.ok( a.z == z, 'Passed!' );

		} );

		QUnit.test( 'setW', ( assert ) => {

			const a = new Vector4();
			assert.ok( a.w == 1, 'Passed!' );

			a.setW( w );
			assert.ok( a.w == w, 'Passed!' );

		} );

		QUnit.todo( 'setComponent', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'getComponent', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'clone', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'copy', ( assert ) => {

			const a = new Vector4( x, y, z, w );
			const b = new Vector4().copy( a );
			assert.ok( b.x == x, 'Passed!' );
			assert.ok( b.y == y, 'Passed!' );
			assert.ok( b.z == z, 'Passed!' );
			assert.ok( b.w == w, 'Passed!' );

			// ensure that it is a true copy
			a.x = 0;
			a.y = - 1;
			a.z = - 2;
			a.w = - 3;
			assert.ok( b.x == x, 'Passed!' );
			assert.ok( b.y == y, 'Passed!' );
			assert.ok( b.z == z, 'Passed!' );
			assert.ok( b.w == w, 'Passed!' );

		} );

		QUnit.test( 'add', ( assert ) => {

			const a = new Vector4( x, y, z, w );
			const b = new Vector4( - x, - y, - z, - w );

			a.add( b );
			assert.ok( a.x == 0, 'Passed!' );
			assert.ok( a.y == 0, 'Passed!' );
			assert.ok( a.z == 0, 'Passed!' );
			assert.ok( a.w == 0, 'Passed!' );

		} );

		QUnit.todo( 'addScalar', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'addVectors', ( assert ) => {

			const b = new Vector4( - x, - y, - z, - w );
			const c = new Vector4().addVectors( b, b );

			assert.ok( c.x == - 2 * x, 'Passed!' );
			assert.ok( c.y == - 2 * y, 'Passed!' );
			assert.ok( c.z == - 2 * z, 'Passed!' );
			assert.ok( c.w == - 2 * w, 'Passed!' );

		} );

		QUnit.test( 'addScaledVector', ( assert ) => {

			const a = new Vector4( x, y, z, w );
			const b = new Vector4( 6, 7, 8, 9 );
			const s = 3;

			a.addScaledVector( b, s );
			assert.strictEqual( a.x, x + b.x * s, 'Check x' );
			assert.strictEqual( a.y, y + b.y * s, 'Check y' );
			assert.strictEqual( a.z, z + b.z * s, 'Check z' );
			assert.strictEqual( a.w, w + b.w * s, 'Check w' );

		} );

		QUnit.test( 'sub', ( assert ) => {

			const a = new Vector4( x, y, z, w );
			const b = new Vector4( - x, - y, - z, - w );

			a.sub( b );
			assert.ok( a.x == 2 * x, 'Passed!' );
			assert.ok( a.y == 2 * y, 'Passed!' );
			assert.ok( a.z == 2 * z, 'Passed!' );
			assert.ok( a.w == 2 * w, 'Passed!' );

		} );

		QUnit.todo( 'subScalar', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'subVectors', ( assert ) => {

			const a = new Vector4( x, y, z, w );
			const c = new Vector4().subVectors( a, a );
			assert.ok( c.x == 0, 'Passed!' );
			assert.ok( c.y == 0, 'Passed!' );
			assert.ok( c.z == 0, 'Passed!' );
			assert.ok( c.w == 0, 'Passed!' );

		} );

		QUnit.todo( 'multiply', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'multiplyScalar', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'applyMatrix4', ( assert ) => {

			const a = new Vector4( x, y, z, w );
			const m = new Matrix4().makeRotationX( Math.PI );
			const expected = new Vector4( 2, - 3, - 4, 5 );

			a.applyMatrix4( m );
			assert.ok( Math.abs( a.x - expected.x ) <= eps, 'Rotation matrix: check x' );
			assert.ok( Math.abs( a.y - expected.y ) <= eps, 'Rotation matrix: check y' );
			assert.ok( Math.abs( a.z - expected.z ) <= eps, 'Rotation matrix: check z' );
			assert.ok( Math.abs( a.w - expected.w ) <= eps, 'Rotation matrix: check w' );

			a.set( x, y, z, w );
			m.makeTranslation( 5, 7, 11 );
			expected.set( 27, 38, 59, 5 );

			a.applyMatrix4( m );
			assert.ok( Math.abs( a.x - expected.x ) <= eps, 'Translation matrix: check x' );
			assert.ok( Math.abs( a.y - expected.y ) <= eps, 'Translation matrix: check y' );
			assert.ok( Math.abs( a.z - expected.z ) <= eps, 'Translation matrix: check z' );
			assert.ok( Math.abs( a.w - expected.w ) <= eps, 'Translation matrix: check w' );

			a.set( x, y, z, w );
			m.set( 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0 );
			expected.set( 2, 3, 4, 4 );

			a.applyMatrix4( m );
			assert.ok( Math.abs( a.x - expected.x ) <= eps, 'Custom matrix: check x' );
			assert.ok( Math.abs( a.y - expected.y ) <= eps, 'Custom matrix: check y' );
			assert.ok( Math.abs( a.z - expected.z ) <= eps, 'Custom matrix: check z' );
			assert.ok( Math.abs( a.w - expected.w ) <= eps, 'Custom matrix: check w' );

			a.set( x, y, z, w );
			m.set( 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53 );
			expected.set( 68, 224, 442, 664 );

			a.applyMatrix4( m );
			assert.ok( Math.abs( a.x - expected.x ) <= eps, 'Bogus matrix: check x' );
			assert.ok( Math.abs( a.y - expected.y ) <= eps, 'Bogus matrix: check y' );
			assert.ok( Math.abs( a.z - expected.z ) <= eps, 'Bogus matrix: check z' );
			assert.ok( Math.abs( a.w - expected.w ) <= eps, 'Bogus matrix: check w' );

		} );

		QUnit.todo( 'divideScalar', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setAxisAngleFromQuaternion', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setAxisAngleFromRotationMatrix', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'min', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'max', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'clamp', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'clampScalar', ( assert ) => {

			const a = new Vector4( - 0.1, 0.01, 0.5, 1.5 );
			const clamped = new Vector4( 0.1, 0.1, 0.5, 1.0 );

			a.clampScalar( 0.1, 1.0 );
			assert.ok( Math.abs( a.x - clamped.x ) <= eps, 'Check x' );
			assert.ok( Math.abs( a.y - clamped.y ) <= eps, 'Check y' );
			assert.ok( Math.abs( a.z - clamped.z ) <= eps, 'Check z' );
			assert.ok( Math.abs( a.w - clamped.w ) <= eps, 'Check w' );

		} );

		QUnit.todo( 'clampLength', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'floor', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'ceil', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'round', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'roundToZero', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'negate', ( assert ) => {

			const a = new Vector4( x, y, z, w );

			a.negate();
			assert.ok( a.x == - x, 'Passed!' );
			assert.ok( a.y == - y, 'Passed!' );
			assert.ok( a.z == - z, 'Passed!' );
			assert.ok( a.w == - w, 'Passed!' );

		} );

		QUnit.test( 'dot', ( assert ) => {

			const a = new Vector4( x, y, z, w );
			const b = new Vector4( - x, - y, - z, - w );
			const c = new Vector4( 0, 0, 0, 0 );

			let result = a.dot( b );
			assert.ok( result == ( - x * x - y * y - z * z - w * w ), 'Passed!' );

			result = a.dot( c );
			assert.ok( result == 0, 'Passed!' );

		} );

		QUnit.todo( 'lengthSq', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'length', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'manhattanLength', ( assert ) => {

			const a = new Vector4( x, 0, 0, 0 );
			const b = new Vector4( 0, - y, 0, 0 );
			const c = new Vector4( 0, 0, z, 0 );
			const d = new Vector4( 0, 0, 0, w );
			const e = new Vector4( 0, 0, 0, 0 );

			assert.ok( a.manhattanLength() == x, 'Positive x' );
			assert.ok( b.manhattanLength() == y, 'Negative y' );
			assert.ok( c.manhattanLength() == z, 'Positive z' );
			assert.ok( d.manhattanLength() == w, 'Positive w' );
			assert.ok( e.manhattanLength() == 0, 'Empty initialization' );

			a.set( x, y, z, w );
			assert.ok(
				a.manhattanLength() == Math.abs( x ) + Math.abs( y ) + Math.abs( z ) + Math.abs( w ),
				'All components'
			);

		} );

		QUnit.test( 'normalize', ( assert ) => {

			const a = new Vector4( x, 0, 0, 0 );
			const b = new Vector4( 0, - y, 0, 0 );
			const c = new Vector4( 0, 0, z, 0 );
			const d = new Vector4( 0, 0, 0, - w );

			a.normalize();
			assert.ok( a.length() == 1, 'Passed!' );
			assert.ok( a.x == 1, 'Passed!' );

			b.normalize();
			assert.ok( b.length() == 1, 'Passed!' );
			assert.ok( b.y == - 1, 'Passed!' );

			c.normalize();
			assert.ok( c.length() == 1, 'Passed!' );
			assert.ok( c.z == 1, 'Passed!' );

			d.normalize();
			assert.ok( d.length() == 1, 'Passed!' );
			assert.ok( d.w == - 1, 'Passed!' );

		} );

		QUnit.test( 'setLength', ( assert ) => {

			let a = new Vector4( x, 0, 0, 0 );

			assert.ok( a.length() == x, 'Passed!' );
			a.setLength( y );
			assert.ok( a.length() == y, 'Passed!' );

			a = new Vector4( 0, 0, 0, 0 );
			assert.ok( a.length() == 0, 'Passed!' );
			a.setLength( y );
			assert.ok( a.length() == 0, 'Passed!' );
			a.setLength();
			assert.ok( isNaN( a.length() ), 'Passed!' );

		} );

		QUnit.todo( 'lerp', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'lerpVectors', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'equals', ( assert ) => {

			const a = new Vector4( x, 0, z, 0 );
			const b = new Vector4( 0, - y, 0, - w );

			assert.ok( a.x != b.x, 'Passed!' );
			assert.ok( a.y != b.y, 'Passed!' );
			assert.ok( a.z != b.z, 'Passed!' );
			assert.ok( a.w != b.w, 'Passed!' );

			assert.ok( ! a.equals( b ), 'Passed!' );
			assert.ok( ! b.equals( a ), 'Passed!' );

			a.copy( b );
			assert.ok( a.x == b.x, 'Passed!' );
			assert.ok( a.y == b.y, 'Passed!' );
			assert.ok( a.z == b.z, 'Passed!' );
			assert.ok( a.w == b.w, 'Passed!' );

			assert.ok( a.equals( b ), 'Passed!' );
			assert.ok( b.equals( a ), 'Passed!' );

		} );

		QUnit.test( 'fromArray', ( assert ) => {

			const a = new Vector4();
			const array = [ 1, 2, 3, 4, 5, 6, 7, 8 ];

			a.fromArray( array );
			assert.strictEqual( a.x, 1, 'No offset: check x' );
			assert.strictEqual( a.y, 2, 'No offset: check y' );
			assert.strictEqual( a.z, 3, 'No offset: check z' );
			assert.strictEqual( a.w, 4, 'No offset: check w' );

			a.fromArray( array, 4 );
			assert.strictEqual( a.x, 5, 'With offset: check x' );
			assert.strictEqual( a.y, 6, 'With offset: check y' );
			assert.strictEqual( a.z, 7, 'With offset: check z' );
			assert.strictEqual( a.w, 8, 'With offset: check w' );

		} );

		QUnit.test( 'toArray', ( assert ) => {

			const a = new Vector4( x, y, z, w );

			let array = a.toArray();
			assert.strictEqual( array[ 0 ], x, 'No array, no offset: check x' );
			assert.strictEqual( array[ 1 ], y, 'No array, no offset: check y' );
			assert.strictEqual( array[ 2 ], z, 'No array, no offset: check z' );
			assert.strictEqual( array[ 3 ], w, 'No array, no offset: check w' );

			array = [];
			a.toArray( array );
			assert.strictEqual( array[ 0 ], x, 'With array, no offset: check x' );
			assert.strictEqual( array[ 1 ], y, 'With array, no offset: check y' );
			assert.strictEqual( array[ 2 ], z, 'With array, no offset: check z' );
			assert.strictEqual( array[ 3 ], w, 'With array, no offset: check w' );

			array = [];
			a.toArray( array, 1 );
			assert.strictEqual( array[ 0 ], undefined, 'With array and offset: check [0]' );
			assert.strictEqual( array[ 1 ], x, 'With array and offset: check x' );
			assert.strictEqual( array[ 2 ], y, 'With array and offset: check y' );
			assert.strictEqual( array[ 3 ], z, 'With array and offset: check z' );
			assert.strictEqual( array[ 4 ], w, 'With array and offset: check w' );

		} );

		QUnit.test( 'fromBufferAttribute', ( assert ) => {

			const a = new Vector4();
			const attr = new BufferAttribute( new Float32Array( [ 1, 2, 3, 4, 5, 6, 7, 8 ] ), 4 );

			a.fromBufferAttribute( attr, 0 );
			assert.strictEqual( a.x, 1, 'Offset 0: check x' );
			assert.strictEqual( a.y, 2, 'Offset 0: check y' );
			assert.strictEqual( a.z, 3, 'Offset 0: check z' );
			assert.strictEqual( a.w, 4, 'Offset 0: check w' );

			a.fromBufferAttribute( attr, 1 );
			assert.strictEqual( a.x, 5, 'Offset 1: check x' );
			assert.strictEqual( a.y, 6, 'Offset 1: check y' );
			assert.strictEqual( a.z, 7, 'Offset 1: check z' );
			assert.strictEqual( a.w, 8, 'Offset 1: check w' );

		} );

		// TODO (Itee) refactor/split
		QUnit.test( 'setX,setY,setZ,setW', ( assert ) => {

			const a = new Vector4();
			assert.ok( a.x == 0, 'Passed!' );
			assert.ok( a.y == 0, 'Passed!' );
			assert.ok( a.z == 0, 'Passed!' );
			assert.ok( a.w == 1, 'Passed!' );

			a.setX( x );
			a.setY( y );
			a.setZ( z );
			a.setW( w );

			assert.ok( a.x == x, 'Passed!' );
			assert.ok( a.y == y, 'Passed!' );
			assert.ok( a.z == z, 'Passed!' );
			assert.ok( a.w == w, 'Passed!' );

		} );

		QUnit.test( 'setComponent,getComponent', ( assert ) => {

			const a = new Vector4();
			assert.ok( a.x == 0, 'Passed!' );
			assert.ok( a.y == 0, 'Passed!' );
			assert.ok( a.z == 0, 'Passed!' );
			assert.ok( a.w == 1, 'Passed!' );

			a.setComponent( 0, 1 );
			a.setComponent( 1, 2 );
			a.setComponent( 2, 3 );
			a.setComponent( 3, 4 );
			assert.ok( a.getComponent( 0 ) == 1, 'Passed!' );
			assert.ok( a.getComponent( 1 ) == 2, 'Passed!' );
			assert.ok( a.getComponent( 2 ) == 3, 'Passed!' );
			assert.ok( a.getComponent( 3 ) == 4, 'Passed!' );

		} );

		QUnit.test( 'setComponent/getComponent exceptions', ( assert ) => {

			const a = new Vector4();

			assert.throws(
				function () {

					a.setComponent( 4, 0 );

				},
				/index is out of range/,
				'setComponent with an out of range index throws Error'
			);
			assert.throws(
				function () {

					a.getComponent( 4 );

				},
				/index is out of range/,
				'getComponent with an out of range index throws Error'
			);

		} );

		QUnit.test( 'setScalar/addScalar/subScalar', ( assert ) => {

			const a = new Vector4();
			const s = 3;

			a.setScalar( s );
			assert.strictEqual( a.x, s, 'setScalar: check x' );
			assert.strictEqual( a.y, s, 'setScalar: check y' );
			assert.strictEqual( a.z, s, 'setScalar: check z' );
			assert.strictEqual( a.w, s, 'setScalar: check w' );

			a.addScalar( s );
			assert.strictEqual( a.x, 2 * s, 'addScalar: check x' );
			assert.strictEqual( a.y, 2 * s, 'addScalar: check y' );
			assert.strictEqual( a.z, 2 * s, 'addScalar: check z' );
			assert.strictEqual( a.w, 2 * s, 'addScalar: check w' );

			a.subScalar( 2 * s );
			assert.strictEqual( a.x, 0, 'subScalar: check x' );
			assert.strictEqual( a.y, 0, 'subScalar: check y' );
			assert.strictEqual( a.z, 0, 'subScalar: check z' );
			assert.strictEqual( a.w, 0, 'subScalar: check w' );

		} );

		QUnit.test( 'multiplyScalar/divideScalar', ( assert ) => {

			const a = new Vector4( x, y, z, w );
			const b = new Vector4( - x, - y, - z, - w );

			a.multiplyScalar( - 2 );
			assert.ok( a.x == x * - 2, 'Passed!' );
			assert.ok( a.y == y * - 2, 'Passed!' );
			assert.ok( a.z == z * - 2, 'Passed!' );
			assert.ok( a.w == w * - 2, 'Passed!' );

			b.multiplyScalar( - 2 );
			assert.ok( b.x == 2 * x, 'Passed!' );
			assert.ok( b.y == 2 * y, 'Passed!' );
			assert.ok( b.z == 2 * z, 'Passed!' );
			assert.ok( b.w == 2 * w, 'Passed!' );

			a.divideScalar( - 2 );
			assert.ok( a.x == x, 'Passed!' );
			assert.ok( a.y == y, 'Passed!' );
			assert.ok( a.z == z, 'Passed!' );
			assert.ok( a.w == w, 'Passed!' );

			b.divideScalar( - 2 );
			assert.ok( b.x == - x, 'Passed!' );
			assert.ok( b.y == - y, 'Passed!' );
			assert.ok( b.z == - z, 'Passed!' );
			assert.ok( b.w == - w, 'Passed!' );

		} );

		QUnit.test( 'min/max/clamp', ( assert ) => {

			const a = new Vector4( x, y, z, w );
			const b = new Vector4( - x, - y, - z, - w );
			const c = new Vector4();

			c.copy( a ).min( b );
			assert.ok( c.x == - x, 'Passed!' );
			assert.ok( c.y == - y, 'Passed!' );
			assert.ok( c.z == - z, 'Passed!' );
			assert.ok( c.w == - w, 'Passed!' );

			c.copy( a ).max( b );
			assert.ok( c.x == x, 'Passed!' );
			assert.ok( c.y == y, 'Passed!' );
			assert.ok( c.z == z, 'Passed!' );
			assert.ok( c.w == w, 'Passed!' );

			c.set( - 2 * x, 2 * y, - 2 * z, 2 * w );
			c.clamp( b, a );
			assert.ok( c.x == - x, 'Passed!' );
			assert.ok( c.y == y, 'Passed!' );
			assert.ok( c.z == - z, 'Passed!' );
			assert.ok( c.w == w, 'Passed!' );

		} );

		QUnit.test( 'length/lengthSq', ( assert ) => {

			const a = new Vector4( x, 0, 0, 0 );
			const b = new Vector4( 0, - y, 0, 0 );
			const c = new Vector4( 0, 0, z, 0 );
			const d = new Vector4( 0, 0, 0, w );
			const e = new Vector4( 0, 0, 0, 0 );

			assert.ok( a.length() == x, 'Passed!' );
			assert.ok( a.lengthSq() == x * x, 'Passed!' );
			assert.ok( b.length() == y, 'Passed!' );
			assert.ok( b.lengthSq() == y * y, 'Passed!' );
			assert.ok( c.length() == z, 'Passed!' );
			assert.ok( c.lengthSq() == z * z, 'Passed!' );
			assert.ok( d.length() == w, 'Passed!' );
			assert.ok( d.lengthSq() == w * w, 'Passed!' );
			assert.ok( e.length() == 0, 'Passed!' );
			assert.ok( e.lengthSq() == 0, 'Passed!' );

			a.set( x, y, z, w );
			assert.ok( a.length() == Math.sqrt( x * x + y * y + z * z + w * w ), 'Passed!' );
			assert.ok( a.lengthSq() == ( x * x + y * y + z * z + w * w ), 'Passed!' );

		} );

		QUnit.test( 'lerp/clone', ( assert ) => {

			const a = new Vector4( x, 0, z, 0 );
			const b = new Vector4( 0, - y, 0, - w );

			assert.ok( a.lerp( a, 0 ).equals( a.lerp( a, 0.5 ) ), 'Passed!' );
			assert.ok( a.lerp( a, 0 ).equals( a.lerp( a, 1 ) ), 'Passed!' );

			assert.ok( a.clone().lerp( b, 0 ).equals( a ), 'Passed!' );

			assert.ok( a.clone().lerp( b, 0.5 ).x == x * 0.5, 'Passed!' );
			assert.ok( a.clone().lerp( b, 0.5 ).y == - y * 0.5, 'Passed!' );
			assert.ok( a.clone().lerp( b, 0.5 ).z == z * 0.5, 'Passed!' );
			assert.ok( a.clone().lerp( b, 0.5 ).w == - w * 0.5, 'Passed!' );

			assert.ok( a.clone().lerp( b, 1 ).equals( b ), 'Passed!' );

		} );

		// OTHERS
		QUnit.test( 'iterable', ( assert ) => {

			const v = new Vector4( 0, 0.3, 0.7, 1 );
			const array = [ ...v ];
			assert.strictEqual( array[ 0 ], 0, 'Vector4 is iterable.' );
			assert.strictEqual( array[ 1 ], 0.3, 'Vector4 is iterable.' );
			assert.strictEqual( array[ 2 ], 0.7, 'Vector4 is iterable.' );
			assert.strictEqual( array[ 3 ], 1, 'Vector4 is iterable.' );

		} );

	} );

} );
