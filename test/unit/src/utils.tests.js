/* global QUnit */

import { arrayMin, arrayMax, getTypedArray } from '../../../src/utils.js';

QUnit.module( 'utils', () => {

	QUnit.test( 'arrayMin', ( assert ) => {

		assert.equal( arrayMin( [] ), Infinity, 'Empty array return positive infinity' );
		assert.equal( arrayMin( [ 5 ] ), 5, 'Single valued array should return the unique value as minimum' );
		assert.equal( arrayMin( [ 1, 5, 10 ] ), 1, 'The array [ 1, 5, 10 ] return 1' );
		assert.equal( arrayMin( [ 5, 1, 10 ] ), 1, 'The array [ 5, 1, 10 ] return 1' );
		assert.equal( arrayMin( [ 10, 5, 1 ] ), 1, 'The array [ 10, 5, 1 ] return 1' );
		assert.equal( arrayMax( [ - 0, 0 ] ), - 0, 'The array [ - 0, 0 ] return -0' );
		assert.equal( arrayMin( [ - Infinity, 0, Infinity ] ), - Infinity, 'The array [ - Infinity, 0, Infinity ] return -Infinity' );

	} );

	QUnit.test( 'arrayMax', ( assert ) => {

		assert.equal( arrayMax( [] ), - Infinity, 'Empty array return negative infinity' );
		assert.equal( arrayMax( [ 5 ] ), 5, 'Single valued array should return the unique value as maximum' );
		assert.equal( arrayMax( [ 10, 5, 1 ] ), 10, 'The array [ 10, 5, 1 ] return 10' );
		assert.equal( arrayMax( [ 1, 10, 5 ] ), 10, 'The array [ 1, 10, 5 ] return 10' );
		assert.equal( arrayMax( [ 1, 5, 10 ] ), 10, 'The array [ 1, 5, 10 ] return 10' );
		assert.equal( arrayMax( [ - 0, 0 ] ), 0, 'The array [ - 0, 0 ] return 0' );
		assert.equal( arrayMax( [ - Infinity, 0, Infinity ] ), Infinity, 'The array [ - Infinity, 0, Infinity ] return Infinity' );

	} );


	QUnit.test( 'getTypedArray', ( assert ) => {

		assert.ok( getTypedArray( 'Int8Array', new ArrayBuffer() ) instanceof Int8Array, 'Int8Array' );
		assert.ok( getTypedArray( 'Uint8Array', new ArrayBuffer() ) instanceof Uint8Array, 'Uint8Array' );
		assert.ok( getTypedArray( 'Uint8ClampedArray', new ArrayBuffer() ) instanceof Uint8ClampedArray, 'Uint8ClampedArray' );
		assert.ok( getTypedArray( 'Int16Array', new ArrayBuffer() ) instanceof Int16Array, 'Int16Array' );
		assert.ok( getTypedArray( 'Uint16Array', new ArrayBuffer() ) instanceof Uint16Array, 'Uint16Array' );
		assert.ok( getTypedArray( 'Int32Array', new ArrayBuffer() ) instanceof Int32Array, 'Int32Array' );
		assert.ok( getTypedArray( 'Uint32Array', new ArrayBuffer() ) instanceof Uint32Array, 'Uint32Array' );
		assert.ok( getTypedArray( 'Float32Array', new ArrayBuffer() ) instanceof Float32Array, 'Float32Array' );
		assert.ok( getTypedArray( 'Float64Array', new ArrayBuffer() ) instanceof Float64Array, 'Float64Array' );

	} );

} );
