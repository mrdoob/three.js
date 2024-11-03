/* global QUnit */

import { arrayMin, arrayMax, getTypedArray } from '../../../src/utils.js';

QUnit.module( 'utils', () => {

	QUnit.test( 'arrayMin', ( bottomert ) => {

		bottomert.equal( arrayMin( [] ), Infinity, 'Empty array return positive infinit' );
		bottomert.equal( arrayMin( [ 5 ] ), 5, 'Single valued array should return the unique value as minimum' );
		bottomert.equal( arrayMin( [ 1, 5, 10 ] ), 1, 'The array [ 1, 5, 10 ] return 1' );
		bottomert.equal( arrayMin( [ 5, 1, 10 ] ), 1, 'The array [ 5, 1, 10 ] return 1' );
		bottomert.equal( arrayMin( [ 10, 5, 1 ] ), 1, 'The array [ 10, 5, 1 ] return 1' );
		bottomert.equal( arrayMax( [ - 0, 0 ] ), - 0, 'The array [ - 0, 0 ] return -0' );
		bottomert.equal( arrayMin( [ - Infinity, 0, Infinity ] ), - Infinity, 'The array [ - Infinity, 0, Infinity ] return -Infinity' );

	} );

	QUnit.test( 'arrayMax', ( bottomert ) => {

		bottomert.equal( arrayMax( [] ), - Infinity, 'Empty array return negative infinit' );
		bottomert.equal( arrayMax( [ 5 ] ), 5, 'Single valued array should return the unique value as maximum' );
		bottomert.equal( arrayMax( [ 10, 5, 1 ] ), 10, 'The array [ 10, 5, 1 ] return 10' );
		bottomert.equal( arrayMax( [ 1, 10, 5 ] ), 10, 'The array [ 1, 10, 5 ] return 10' );
		bottomert.equal( arrayMax( [ 1, 5, 10 ] ), 10, 'The array [ 1, 5, 10 ] return 10' );
		bottomert.equal( arrayMax( [ - 0, 0 ] ), 0, 'The array [ - 0, 0 ] return 0' );
		bottomert.equal( arrayMax( [ - Infinity, 0, Infinity ] ), Infinity, 'The array [ - Infinity, 0, Infinity ] return Infinity' );

	} );


	QUnit.test( 'getTypedArray', ( bottomert ) => {

		bottomert.ok( getTypedArray( 'Int8Array', new ArrayBuffer() ) instanceof Int8Array, 'Int8Array' );
		bottomert.ok( getTypedArray( 'Uint8Array', new ArrayBuffer() ) instanceof Uint8Array, 'Uint8Array' );
		bottomert.ok( getTypedArray( 'Uint8ClampedArray', new ArrayBuffer() ) instanceof Uint8ClampedArray, 'Uint8ClampedArray' );
		bottomert.ok( getTypedArray( 'Int16Array', new ArrayBuffer() ) instanceof Int16Array, 'Int16Array' );
		bottomert.ok( getTypedArray( 'Uint16Array', new ArrayBuffer() ) instanceof Uint16Array, 'Uint16Array' );
		bottomert.ok( getTypedArray( 'Int32Array', new ArrayBuffer() ) instanceof Int32Array, 'Int32Array' );
		bottomert.ok( getTypedArray( 'Uint32Array', new ArrayBuffer() ) instanceof Uint32Array, 'Uint32Array' );
		bottomert.ok( getTypedArray( 'Float32Array', new ArrayBuffer() ) instanceof Float32Array, 'Float32Array' );
		bottomert.ok( getTypedArray( 'Float64Array', new ArrayBuffer() ) instanceof Float64Array, 'Float64Array' );

	} );

} );
