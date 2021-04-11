/* global QUnit */

import { InterleavedBuffer } from '../../../../src/core/InterleavedBuffer';
import { InterleavedBufferAttribute } from '../../../../src/core/InterleavedBufferAttribute';

export default QUnit.module( 'Core', () => {

	QUnit.module( 'InterleavedBufferAttribute', () => {

		// INSTANCING
		QUnit.todo( "Instancing", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// PROPERTIES
		QUnit.todo( "count", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "array", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// PUBLIC STUFF
		// setY, setZ and setW are calculated in the same way so not QUnit.testing this
		// TODO: ( you can't be sure that will be the case in future, or a mistake was introduce in one off them ! )
		QUnit.test( "setX", ( assert ) => {

			var buffer = new InterleavedBuffer( new Float32Array( [ 1, 2, 3, 7, 8, 9 ] ).buffer );
			var instance = new InterleavedBufferAttribute( buffer, 2, Float32Array, false, 12, 0, 2 );

			instance.setX( 0, 123 );
			instance.setX( 1, 321 );

			var array = new Float32Array( buffer.array.buffer );

			assert.ok( array[ 0 ] === 123 &&
				array[ 3 ] === 321, "x was calculated correct based on index and default offset" );

			var buffer = new InterleavedBuffer( new Float32Array( [ 1, 2, 3, 7, 8, 9 ] ).buffer );
			var instance = new InterleavedBufferAttribute( buffer, 2, Float32Array, false, 12, 4, 2 );

			instance.setX( 0, 123 );
			instance.setX( 1, 321 );

			var array = new Float32Array( buffer.array.buffer );

			// the offset was defined as 1, so go one step futher in the array
			assert.ok( array[ 1 ] === 123 &&
				array[ 4 ] === 321, "x was calculated correct based on index and default offset" );

		} );

		QUnit.todo( "setY", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "setZ", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "setW", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "getX", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "getY", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "getZ", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "getW", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "setXY", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "setXYZ", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.todo( "setXYZW", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

	} );

} );
