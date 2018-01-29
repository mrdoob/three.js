/**
 * @author alemures / https://github.com/alemures
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { arrayMin, arrayMax } from '../../../src/utils';

QUnit.module( 'utils', () => {

	QUnit.test( 'arrayMin', ( assert ) => {

		assert.equal( arrayMin( [] ), Infinity, 'Empty array return positive infinit' );
		assert.equal( arrayMin( [ 5 ] ), 5, 'Single valued array should return the unique value as minimum' );
		assert.equal( arrayMin( [ 1, 5, 10 ] ), 1, 'The array [ 1, 5, 10 ] return 1' );
		assert.equal( arrayMin( [ 5, 1, 10 ] ), 1, 'The array [ 5, 1, 10 ] return 1' );
		assert.equal( arrayMin( [ 10, 5, 1 ] ), 1, 'The array [ 10, 5, 1 ] return 1' );
		assert.equal( arrayMax( [ - 0, 0 ] ), - 0, 'The array [ - 0, 0 ] return -0' );
		assert.equal( arrayMin( [ - Infinity, 0, Infinity ] ), - Infinity, 'The array [ - Infinity, 0, Infinity ] return -Infinity' );

	} );

	QUnit.test( 'arrayMax', ( assert ) => {

		assert.equal( arrayMax( [] ), - Infinity, 'Empty array return negative infinit' );
		assert.equal( arrayMax( [ 5 ] ), 5, 'Single valued array should return the unique value as maximum' );
		assert.equal( arrayMax( [ 10, 5, 1 ] ), 10, 'The array [ 10, 5, 1 ] return 10' );
		assert.equal( arrayMax( [ 1, 10, 5 ] ), 10, 'The array [ 1, 10, 5 ] return 10' );
		assert.equal( arrayMax( [ 1, 5, 10 ] ), 10, 'The array [ 1, 5, 10 ] return 10' );
		assert.equal( arrayMax( [ - 0, 0 ] ), 0, 'The array [ - 0, 0 ] return 0' );
		assert.equal( arrayMax( [ - Infinity, 0, Infinity ] ), Infinity, 'The array [ - Infinity, 0, Infinity ] return Infinity' );

	} );


} );

