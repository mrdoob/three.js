/* global QUnit */

import { InstancedInterleavedBuffer } from '../../../../src/core/InstancedInterleavedBuffer.js';

export default QUnit.module( 'Core', () => {

	QUnit.module( 'InstancedInterleavedBuffer', () => {

		// INHERITANCE
		QUnit.todo( 'Extending', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			var array = new Float32Array( [ 1, 2, 3, 7, 8, 9 ] );
			var instance = new InstancedInterleavedBuffer( array, 3 );

			assert.ok( instance.meshPerAttribute === 1, 'ok' );

		} );

		// PUBLIC STUFF
		QUnit.todo( 'isInstancedInterleavedBuffer', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'copy', ( assert ) => {

			var array = new Float32Array( [ 1, 2, 3, 7, 8, 9 ] );
			var instance = new InstancedInterleavedBuffer( array, 3 );
			var copiedInstance = instance.copy( instance );

			assert.ok( copiedInstance.meshPerAttribute === 1, 'additional attribute was copied' );

		} );

	} );

} );
