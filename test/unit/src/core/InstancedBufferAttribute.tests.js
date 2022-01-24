/* global QUnit */

import { InstancedBufferAttribute } from '../../../../src/core/InstancedBufferAttribute.js';

export default QUnit.module( 'Core', () => {

	QUnit.module( 'InstancedBufferAttribute', () => {

		// INHERITANCE
		QUnit.todo( 'Extending', ( assert ) => {

			assert.ok( false, 'everything\'s gonna be alright' );

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			var instance = new InstancedBufferAttribute( new Float32Array( 10 ), 2 );
			assert.ok( instance.meshPerAttribute === 1, 'ok' );

			var instance = new InstancedBufferAttribute( new Float32Array( 10 ), 2, false, 123 );
			assert.ok( instance.meshPerAttribute === 123, 'ok' );

		} );

		// PUBLIC STUFF
		QUnit.test( 'copy', ( assert ) => {

			var array = new Float32Array( [ 1, 2, 3, 7, 8, 9 ] );
			var instance = new InstancedBufferAttribute( array, 2, true, 123 );
			var copiedInstance = instance.copy( instance );

			assert.ok( copiedInstance instanceof InstancedBufferAttribute, 'the clone has the correct type' );
			assert.ok( copiedInstance.itemSize === 2, 'itemSize was copied' );
			assert.ok( copiedInstance.normalized === true, 'normalized was copied' );
			assert.ok( copiedInstance.meshPerAttribute === 123, 'meshPerAttribute was copied' );

			for ( var i = 0; i < array.length; i ++ ) {

				assert.ok( copiedInstance.array[ i ] === array[ i ], 'array was copied' );

			}

		} );

	} );

} );
