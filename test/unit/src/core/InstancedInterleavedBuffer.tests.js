/**
 * @author simonThiele / https://github.com/simonThiele
 */
/* global QUnit */

import { InstancedInterleavedBuffer } from '../../../../src/core/InstancedInterleavedBuffer';

export default QUnit.module( 'Core', () => {

	QUnit.module( 'InstancedInterleavedBuffer', () => {

		QUnit.test( "can be created", ( assert ) => {

			var array = new Float32Array( [ 1, 2, 3, 7, 8, 9 ] );
			var instance = new InstancedInterleavedBuffer( array, 3 );

			assert.ok( instance.meshPerAttribute === 1, "ok" );

		} );

		QUnit.test( "copy", ( assert ) => {

			var array = new Float32Array( [ 1, 2, 3, 7, 8, 9 ] );
			var instance = new InstancedInterleavedBuffer( array, 3 );
			var copiedInstance = instance.copy( instance );

			assert.ok( copiedInstance.meshPerAttribute === 1, "additional attribute was copied" );

		} );

	} );

} );
