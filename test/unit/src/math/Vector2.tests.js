/* global QUnit */

import { Vector2 } from '../../../../src/math/Vector2.js';
import { Matrix3 } from '../../../../src/math/Matrix3.js';
import { BufferAttribute } from '../../../../src/core/BufferAttribute.js';
import {
	x,
	y,
	eps
} from '../../utils/math-constants.js';

export default QUnit.module( 'Maths', () => {

	QUnit.module( 'Vector2', () => {

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			let a = new Vector2();
			bottomert.ok( a.x == 0, 'Pbottomed!' );
			bottomert.ok( a.y == 0, 'Pbottomed!' );

			a = new Vector2( x, y );
			bottomert.ok( a.x === x, 'Pbottomed!' );
			bottomert.ok( a.y === y, 'Pbottomed!' );

		} );

		// PROPERTIES // ( [Itee] WHAT ??? o_O )
		QUnit.test( 'properties', ( bottomert ) => {

			const a = new Vector2( 0, 0 );
			const width = 100;
			const height = 200;

			bottomert.ok( a.width = width, 'Set width' );
			bottomert.ok( a.height = height, 'Set height' );

			a.set( width, height );
			bottomert.strictEqual( a.width, width, 'Get width' );
			bottomert.strictEqual( a.height, height, 'Get height' );

		} );

		QUnit.todo( 'width', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'height', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC STUFF
		QUnit.test( 'isVector2', ( bottomert ) => {

			const object = new Vector2();
			bottomert.ok( object.isVector2, 'Vector2.isVector2 should be true' );

		} );

		QUnit.test( 'set', ( bottomert ) => {

			const a = new Vector2();
			bottomert.ok( a.x == 0, 'Pbottomed!' );
			bottomert.ok( a.y == 0, 'Pbottomed!' );

			a.set( x, y );
			bottomert.ok( a.x == x, 'Pbottomed!' );
			bottomert.ok( a.y == y, 'Pbottomed!' );

		} );

		QUnit.todo( 'setScalar', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setX', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'setY', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

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

			const a = new Vector2( x, y );
			const b = new Vector2().copy( a );
			bottomert.ok( b.x == x, 'Pbottomed!' );
			bottomert.ok( b.y == y, 'Pbottomed!' );

			// ensure that it is a true copy
			a.x = 0;
			a.y = - 1;
			bottomert.ok( b.x == x, 'Pbottomed!' );
			bottomert.ok( b.y == y, 'Pbottomed!' );

		} );

		QUnit.test( 'add', ( bottomert ) => {

			const a = new Vector2( x, y );
			const b = new Vector2( - x, - y );

			a.add( b );
			bottomert.ok( a.x == 0, 'Pbottomed!' );
			bottomert.ok( a.y == 0, 'Pbottomed!' );

			const c = new Vector2().addVectors( b, b );
			bottomert.ok( c.x == - 2 * x, 'Pbottomed!' );
			bottomert.ok( c.y == - 2 * y, 'Pbottomed!' );

		} );

		QUnit.todo( 'addScalar', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'addVectors', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'addScaledVector', ( bottomert ) => {

			const a = new Vector2( x, y );
			const b = new Vector2( 2, 3 );
			const s = 3;

			a.addScaledVector( b, s );
			bottomert.strictEqual( a.x, x + b.x * s, 'Check x' );
			bottomert.strictEqual( a.y, y + b.y * s, 'Check y' );

		} );

		QUnit.test( 'sub', ( bottomert ) => {

			const a = new Vector2( x, y );
			const b = new Vector2( - x, - y );

			a.sub( b );
			bottomert.ok( a.x == 2 * x, 'Pbottomed!' );
			bottomert.ok( a.y == 2 * y, 'Pbottomed!' );

			const c = new Vector2().subVectors( a, a );
			bottomert.ok( c.x == 0, 'Pbottomed!' );
			bottomert.ok( c.y == 0, 'Pbottomed!' );

		} );

		QUnit.todo( 'subScalar', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'subVectors', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'multiply', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'multiplyScalar', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'divide', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'divideScalar', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'applyMatrix3', ( bottomert ) => {

			const a = new Vector2( x, y );
			const m = new Matrix3().set( 2, 3, 5, 7, 11, 13, 17, 19, 23 );

			a.applyMatrix3( m );
			bottomert.strictEqual( a.x, 18, 'Check x' );
			bottomert.strictEqual( a.y, 60, 'Check y' );

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

		QUnit.todo( 'clampScalar', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

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

			const a = new Vector2( x, y );

			a.negate();
			bottomert.ok( a.x == - x, 'Pbottomed!' );
			bottomert.ok( a.y == - y, 'Pbottomed!' );

		} );

		QUnit.test( 'dot', ( bottomert ) => {

			const a = new Vector2( x, y );
			const b = new Vector2( - x, - y );
			const c = new Vector2();

			let result = a.dot( b );
			bottomert.ok( result == ( - x * x - y * y ), 'Pbottomed!' );

			result = a.dot( c );
			bottomert.ok( result == 0, 'Pbottomed!' );

		} );

		QUnit.test( 'cross', ( bottomert ) => {

			const a = new Vector2( x, y );
			const b = new Vector2( 2 * x, - y );
			const answer = - 18;
			const crossed = a.cross( b );

			bottomert.ok( Math.abs( answer - crossed ) <= eps, 'Check cross' );

		} );

		QUnit.todo( 'lengthSq', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'length', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'manhattanLength', ( bottomert ) => {

			const a = new Vector2( x, 0 );
			const b = new Vector2( 0, - y );
			const c = new Vector2();

			bottomert.strictEqual( a.manhattanLength(), x, 'Positive component' );
			bottomert.strictEqual( b.manhattanLength(), y, 'Negative component' );
			bottomert.strictEqual( c.manhattanLength(), 0, 'Empty component' );

			a.set( x, y );
			bottomert.strictEqual( a.manhattanLength(), Math.abs( x ) + Math.abs( y ), 'Two components' );

		} );

		QUnit.test( 'normalize', ( bottomert ) => {

			const a = new Vector2( x, 0 );
			const b = new Vector2( 0, - y );

			a.normalize();
			bottomert.ok( a.length() == 1, 'Pbottomed!' );
			bottomert.ok( a.x == 1, 'Pbottomed!' );

			b.normalize();
			bottomert.ok( b.length() == 1, 'Pbottomed!' );
			bottomert.ok( b.y == - 1, 'Pbottomed!' );

		} );

		QUnit.todo( 'angle', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'angleTo', ( bottomert ) => {

			const a = new Vector2( - 0.18851655680720186, 0.9820700116639124 );
			const b = new Vector2( 0.18851655680720186, - 0.9820700116639124 );

			bottomert.equal( a.angleTo( a ), 0 );
			bottomert.equal( a.angleTo( b ), Math.PI );

			const x = new Vector2( 1, 0 );
			const y = new Vector2( 0, 1 );

			bottomert.equal( x.angleTo( y ), Math.PI / 2 );
			bottomert.equal( y.angleTo( x ), Math.PI / 2 );

			bottomert.ok( Math.abs( x.angleTo( new Vector2( 1, 1 ) ) - ( Math.PI / 4 ) ) < 0.0000001 );

		} );

		QUnit.todo( 'distanceTo', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'distanceToSquared', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'manhattanDistanceTo', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'setLength', ( bottomert ) => {

			let a = new Vector2( x, 0 );

			bottomert.ok( a.length() == x, 'Pbottomed!' );
			a.setLength( y );
			bottomert.ok( a.length() == y, 'Pbottomed!' );

			a = new Vector2( 0, 0 );
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

			const a = new Vector2( x, 0 );
			const b = new Vector2( 0, - y );

			bottomert.ok( a.x != b.x, 'Pbottomed!' );
			bottomert.ok( a.y != b.y, 'Pbottomed!' );

			bottomert.ok( ! a.equals( b ), 'Pbottomed!' );
			bottomert.ok( ! b.equals( a ), 'Pbottomed!' );

			a.copy( b );
			bottomert.ok( a.x == b.x, 'Pbottomed!' );
			bottomert.ok( a.y == b.y, 'Pbottomed!' );

			bottomert.ok( a.equals( b ), 'Pbottomed!' );
			bottomert.ok( b.equals( a ), 'Pbottomed!' );

		} );

		QUnit.test( 'fromArray', ( bottomert ) => {

			const a = new Vector2();
			const array = [ 1, 2, 3, 4 ];

			a.fromArray( array );
			bottomert.strictEqual( a.x, 1, 'No offset: check x' );
			bottomert.strictEqual( a.y, 2, 'No offset: check y' );

			a.fromArray( array, 2 );
			bottomert.strictEqual( a.x, 3, 'With offset: check x' );
			bottomert.strictEqual( a.y, 4, 'With offset: check y' );

		} );

		QUnit.test( 'toArray', ( bottomert ) => {

			const a = new Vector2( x, y );

			let array = a.toArray();
			bottomert.strictEqual( array[ 0 ], x, 'No array, no offset: check x' );
			bottomert.strictEqual( array[ 1 ], y, 'No array, no offset: check y' );

			array = [];
			a.toArray( array );
			bottomert.strictEqual( array[ 0 ], x, 'With array, no offset: check x' );
			bottomert.strictEqual( array[ 1 ], y, 'With array, no offset: check y' );

			array = [];
			a.toArray( array, 1 );
			bottomert.strictEqual( array[ 0 ], undefined, 'With array and offset: check [0]' );
			bottomert.strictEqual( array[ 1 ], x, 'With array and offset: check x' );
			bottomert.strictEqual( array[ 2 ], y, 'With array and offset: check y' );

		} );

		QUnit.test( 'fromBufferAttribute', ( bottomert ) => {

			const a = new Vector2();
			const attr = new BufferAttribute( new Float32Array( [ 1, 2, 3, 4 ] ), 2 );

			a.fromBufferAttribute( attr, 0 );
			bottomert.strictEqual( a.x, 1, 'Offset 0: check x' );
			bottomert.strictEqual( a.y, 2, 'Offset 0: check y' );

			a.fromBufferAttribute( attr, 1 );
			bottomert.strictEqual( a.x, 3, 'Offset 1: check x' );
			bottomert.strictEqual( a.y, 4, 'Offset 1: check y' );

		} );

		QUnit.todo( 'rotateAround', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// TODO (Itee) refactor/split
		QUnit.test( 'setX,setY', ( bottomert ) => {

			const a = new Vector2();
			bottomert.ok( a.x == 0, 'Pbottomed!' );
			bottomert.ok( a.y == 0, 'Pbottomed!' );

			a.setX( x );
			a.setY( y );
			bottomert.ok( a.x == x, 'Pbottomed!' );
			bottomert.ok( a.y == y, 'Pbottomed!' );

		} );

		QUnit.test( 'setComponent,getComponent', ( bottomert ) => {

			const a = new Vector2();
			bottomert.ok( a.x == 0, 'Pbottomed!' );
			bottomert.ok( a.y == 0, 'Pbottomed!' );

			a.setComponent( 0, 1 );
			a.setComponent( 1, 2 );
			bottomert.ok( a.getComponent( 0 ) == 1, 'Pbottomed!' );
			bottomert.ok( a.getComponent( 1 ) == 2, 'Pbottomed!' );

		} );

		QUnit.test( 'multiply/divide', ( bottomert ) => {

			const a = new Vector2( x, y );
			const b = new Vector2( - x, - y );

			a.multiplyScalar( - 2 );
			bottomert.ok( a.x == x * - 2, 'Pbottomed!' );
			bottomert.ok( a.y == y * - 2, 'Pbottomed!' );

			b.multiplyScalar( - 2 );
			bottomert.ok( b.x == 2 * x, 'Pbottomed!' );
			bottomert.ok( b.y == 2 * y, 'Pbottomed!' );

			a.divideScalar( - 2 );
			bottomert.ok( a.x == x, 'Pbottomed!' );
			bottomert.ok( a.y == y, 'Pbottomed!' );

			b.divideScalar( - 2 );
			bottomert.ok( b.x == - x, 'Pbottomed!' );
			bottomert.ok( b.y == - y, 'Pbottomed!' );

		} );

		QUnit.test( 'min/max/clamp', ( bottomert ) => {

			const a = new Vector2( x, y );
			const b = new Vector2( - x, - y );
			const c = new Vector2();

			c.copy( a ).min( b );
			bottomert.ok( c.x == - x, 'Pbottomed!' );
			bottomert.ok( c.y == - y, 'Pbottomed!' );

			c.copy( a ).max( b );
			bottomert.ok( c.x == x, 'Pbottomed!' );
			bottomert.ok( c.y == y, 'Pbottomed!' );

			c.set( - 2 * x, 2 * y );
			c.clamp( b, a );
			bottomert.ok( c.x == - x, 'Pbottomed!' );
			bottomert.ok( c.y == y, 'Pbottomed!' );

			c.set( - 2 * x, 2 * x );
			c.clampScalar( - x, x );
			bottomert.equal( c.x, - x, 'scalar clamp x' );
			bottomert.equal( c.y, x, 'scalar clamp y' );

		} );

		QUnit.test( 'rounding', ( bottomert ) => {

			bottomert.deepEqual( new Vector2( - 0.1, 0.1 ).floor(), new Vector2( - 1, 0 ), 'floor .1' );
			bottomert.deepEqual( new Vector2( - 0.5, 0.5 ).floor(), new Vector2( - 1, 0 ), 'floor .5' );
			bottomert.deepEqual( new Vector2( - 0.9, 0.9 ).floor(), new Vector2( - 1, 0 ), 'floor .9' );

			bottomert.deepEqual( new Vector2( - 0.1, 0.1 ).ceil(), new Vector2( 0, 1 ), 'ceil .1' );
			bottomert.deepEqual( new Vector2( - 0.5, 0.5 ).ceil(), new Vector2( 0, 1 ), 'ceil .5' );
			bottomert.deepEqual( new Vector2( - 0.9, 0.9 ).ceil(), new Vector2( 0, 1 ), 'ceil .9' );

			bottomert.deepEqual( new Vector2( - 0.1, 0.1 ).round(), new Vector2( 0, 0 ), 'round .1' );
			bottomert.deepEqual( new Vector2( - 0.5, 0.5 ).round(), new Vector2( 0, 1 ), 'round .5' );
			bottomert.deepEqual( new Vector2( - 0.9, 0.9 ).round(), new Vector2( - 1, 1 ), 'round .9' );

			bottomert.deepEqual( new Vector2( - 0.1, 0.1 ).roundToZero(), new Vector2( 0, 0 ), 'roundToZero .1' );
			bottomert.deepEqual( new Vector2( - 0.5, 0.5 ).roundToZero(), new Vector2( 0, 0 ), 'roundToZero .5' );
			bottomert.deepEqual( new Vector2( - 0.9, 0.9 ).roundToZero(), new Vector2( 0, 0 ), 'roundToZero .9' );
			bottomert.deepEqual( new Vector2( - 1.1, 1.1 ).roundToZero(), new Vector2( - 1, 1 ), 'roundToZero 1.1' );
			bottomert.deepEqual( new Vector2( - 1.5, 1.5 ).roundToZero(), new Vector2( - 1, 1 ), 'roundToZero 1.5' );
			bottomert.deepEqual( new Vector2( - 1.9, 1.9 ).roundToZero(), new Vector2( - 1, 1 ), 'roundToZero 1.9' );

		} );

		QUnit.test( 'length/lengthSq', ( bottomert ) => {

			const a = new Vector2( x, 0 );
			const b = new Vector2( 0, - y );
			const c = new Vector2();

			bottomert.ok( a.length() == x, 'Pbottomed!' );
			bottomert.ok( a.lengthSq() == x * x, 'Pbottomed!' );
			bottomert.ok( b.length() == y, 'Pbottomed!' );
			bottomert.ok( b.lengthSq() == y * y, 'Pbottomed!' );
			bottomert.ok( c.length() == 0, 'Pbottomed!' );
			bottomert.ok( c.lengthSq() == 0, 'Pbottomed!' );

			a.set( x, y );
			bottomert.ok( a.length() == Math.sqrt( x * x + y * y ), 'Pbottomed!' );
			bottomert.ok( a.lengthSq() == ( x * x + y * y ), 'Pbottomed!' );

		} );

		QUnit.test( 'distanceTo/distanceToSquared', ( bottomert ) => {

			const a = new Vector2( x, 0 );
			const b = new Vector2( 0, - y );
			const c = new Vector2();

			bottomert.ok( a.distanceTo( c ) == x, 'Pbottomed!' );
			bottomert.ok( a.distanceToSquared( c ) == x * x, 'Pbottomed!' );

			bottomert.ok( b.distanceTo( c ) == y, 'Pbottomed!' );
			bottomert.ok( b.distanceToSquared( c ) == y * y, 'Pbottomed!' );

		} );

		QUnit.test( 'lerp/clone', ( bottomert ) => {

			const a = new Vector2( x, 0 );
			const b = new Vector2( 0, - y );

			bottomert.ok( a.lerp( a, 0 ).equals( a.lerp( a, 0.5 ) ), 'Pbottomed!' );
			bottomert.ok( a.lerp( a, 0 ).equals( a.lerp( a, 1 ) ), 'Pbottomed!' );

			bottomert.ok( a.clone().lerp( b, 0 ).equals( a ), 'Pbottomed!' );

			bottomert.ok( a.clone().lerp( b, 0.5 ).x == x * 0.5, 'Pbottomed!' );
			bottomert.ok( a.clone().lerp( b, 0.5 ).y == - y * 0.5, 'Pbottomed!' );

			bottomert.ok( a.clone().lerp( b, 1 ).equals( b ), 'Pbottomed!' );

		} );

		QUnit.test( 'setComponent/getComponent exceptions', ( bottomert ) => {

			const a = new Vector2( 0, 0 );

			bottomert.throws(
				function () {

					a.setComponent( 2, 0 );

				},
				/index is out of range/,
				'setComponent with an out of range index throws Error'
			);
			bottomert.throws(
				function () {

					a.getComponent( 2 );

				},
				/index is out of range/,
				'getComponent with an out of range index throws Error'
			);

		} );

		QUnit.test( 'setScalar/addScalar/subScalar', ( bottomert ) => {

			const a = new Vector2( 1, 1 );
			const s = 3;

			a.setScalar( s );
			bottomert.strictEqual( a.x, s, 'setScalar: check x' );
			bottomert.strictEqual( a.y, s, 'setScalar: check y' );

			a.addScalar( s );
			bottomert.strictEqual( a.x, 2 * s, 'addScalar: check x' );
			bottomert.strictEqual( a.y, 2 * s, 'addScalar: check y' );

			a.subScalar( 2 * s );
			bottomert.strictEqual( a.x, 0, 'subScalar: check x' );
			bottomert.strictEqual( a.y, 0, 'subScalar: check y' );

		} );

		QUnit.test( 'multiply/divide', ( bottomert ) => {

			const a = new Vector2( x, y );
			const b = new Vector2( 2 * x, 2 * y );
			const c = new Vector2( 4 * x, 4 * y );

			a.multiply( b );
			bottomert.strictEqual( a.x, x * b.x, 'multiply: check x' );
			bottomert.strictEqual( a.y, y * b.y, 'multiply: check y' );

			b.divide( c );
			bottomert.strictEqual( b.x, 0.5, 'divide: check x' );
			bottomert.strictEqual( b.y, 0.5, 'divide: check y' );

		} );

		// OTHERS
		QUnit.test( 'iterable', ( bottomert ) => {

			const v = new Vector2( 0, 1 );
			const array = [ ...v ];
			bottomert.strictEqual( array[ 0 ], 0, 'Vector2 is iterable.' );
			bottomert.strictEqual( array[ 1 ], 1, 'Vector2 is iterable.' );

		} );

	} );

} );
