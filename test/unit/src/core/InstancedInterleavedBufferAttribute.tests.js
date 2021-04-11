/* global QUnit */

import { InterleavedBuffer } from '../../../../src/core/InterleavedBuffer';
import { InstancedInterleavedBufferAttribute } from '../../../../src/core/InstancedInterleavedBufferAttribute';

export default QUnit.module( 'Core', () => {

	QUnit.module( 'InstancedInterleavedBufferAttribute', () => {

		// INHERITANCE
		QUnit.todo( "Extending", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// INSTANCING
		QUnit.test( "Instancing", ( assert ) => {

			var array = new Float32Array( [ 1, 2, 3, 7, 8, 9 ] );
			var buffer = new InterleavedBuffer( array.buffer );
			var instance = new InstancedInterleavedBufferAttribute( buffer, 1, Float32Array, false, 4, 0, 6 );

			assert.ok( instance.meshPerAttribute === 1, "ok" );

		} );

		// PUBLIC STUFF
		QUnit.todo( "isInstancedInterleavedBufferAttribute", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "copy", ( assert ) => {

			var array = new Float32Array( [ 1, 2, 3, 7, 8, 9 ] );
			var buffer = new InterleavedBuffer( array.buffer );
			var instance = new InstancedInterleavedBufferAttribute( buffer, 1, Float32Array, false, 4, 0, 6 );
			var copiedInstance = instance.copy( instance );

			assert.ok( copiedInstance.meshPerAttribute === 1, "additional attribute was copied" );

		} );

	} );

} );
