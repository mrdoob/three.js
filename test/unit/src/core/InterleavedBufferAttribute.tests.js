/**
 * @author simonThiele / https://github.com/simonThiele
 * @author TristanVALCKE / https://github.com/Itee
 */
/* global QUnit */

import { InterleavedBuffer } from '../../../../src/core/InterleavedBuffer';
import { InterleavedBufferAttribute } from '../../../../src/core/InterleavedBufferAttribute';

export default QUnit.module( 'Core', () => {

	QUnit.module( 'InterleavedBufferAttribute', () => {

		// INSTANCING
		QUnit.test( "Instancing", ( assert ) => {} );

		// PROPERTIES
		QUnit.test( "count", ( assert ) => {

			var buffer = new InterleavedBuffer( new Float32Array( [ 1, 2, 3, 7, 8, 9 ] ), 3 );
			var instance = new InterleavedBufferAttribute( buffer, 2, 0 );

			assert.ok( instance.count === 2, "count is calculated via array length / stride" );

		} );

		QUnit.test( "array", ( assert ) => {} );

		// PUBLIC STUFF
		// setY, setZ and setW are calculated in the same way so not QUnit.testing this
		// TODO: ( you can't be sure that will be the case in future, or a mistake was introduce in one off them ! )
		QUnit.test( "setX", ( assert ) => {

			var buffer = new InterleavedBuffer( new Float32Array( [ 1, 2, 3, 7, 8, 9 ] ), 3 );
			var instance = new InterleavedBufferAttribute( buffer, 2, 0 );

			instance.setX( 0, 123 );
			instance.setX( 1, 321 );

			assert.ok( instance.data.array[ 0 ] === 123 &&
				instance.data.array[ 3 ] === 321, "x was calculated correct based on index and default offset" );

			var buffer = new InterleavedBuffer( new Float32Array( [ 1, 2, 3, 7, 8, 9 ] ), 3 );
			var instance = new InterleavedBufferAttribute( buffer, 2, 1 );

			instance.setX( 0, 123 );
			instance.setX( 1, 321 );

			// the offset was defined as 1, so go one step futher in the array
			assert.ok( instance.data.array[ 1 ] === 123 &&
				instance.data.array[ 4 ] === 321, "x was calculated correct based on index and default offset" );

		} );

		QUnit.test( "setY", ( assert ) => {} );

		QUnit.test( "setZ", ( assert ) => {} );

		QUnit.test( "setW", ( assert ) => {} );

		QUnit.test( "getX", ( assert ) => {} );

		QUnit.test( "getY", ( assert ) => {} );

		QUnit.test( "getZ", ( assert ) => {} );

		QUnit.test( "getW", ( assert ) => {} );

		QUnit.test( "setXY", ( assert ) => {} );

		QUnit.test( "setXYZ", ( assert ) => {} );

		QUnit.test( "setXYZW", ( assert ) => {} );

	} );

} );
