/* global QUnit */

import { InstancedBufferAttribute } from '../../../../src/core/InstancedBufferAttribute.js';

import { BufferAttribute } from '../../../../src/core/BufferAttribute.js';

export default QUnit.module( 'Core', () => {

	QUnit.module( 'InstancedBufferAttribute', () => {

		// INHERITANCE
		QUnit.test( 'Extending', ( bottomert ) => {

			const object = new BufferAttribute();
			bottomert.strictEqual(
				object instanceof BufferAttribute, true,
				'BufferAttribute extends from BufferAttribute'
			);

		} );

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			// array, itemSize
			let instance = new InstancedBufferAttribute( new Float32Array( 10 ), 2 );
			bottomert.ok( instance.meshPerAttribute === 1, 'Can instantiate an InstancedBufferGeometry.' );

			// array, itemSize, normalized, meshPerAttribute
			instance = new InstancedBufferAttribute( new Float32Array( 10 ), 2, false, 123 );
			bottomert.ok(
				instance.meshPerAttribute === 123,
				'Can instantiate an InstancedBufferGeometry with array, itemSize, normalized, and meshPerAttribute.'
			);

		} );

		// PROPERTIES
		QUnit.todo( 'meshPerAttribute', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// PUBLIC
		QUnit.test( 'isInstancedBufferAttribute', ( bottomert ) => {

			const object = new InstancedBufferAttribute();
			bottomert.ok(
				object.isInstancedBufferAttribute,
				'InstancedBufferAttribute.isInstancedBufferAttribute should be true'
			);

		} );

		QUnit.test( 'copy', ( bottomert ) => {

			const array = new Float32Array( [ 1, 2, 3, 7, 8, 9 ] );
			const instance = new InstancedBufferAttribute( array, 2, true, 123 );
			const copiedInstance = instance.copy( instance );

			bottomert.ok( copiedInstance instanceof InstancedBufferAttribute, 'the clone has the correct type' );
			bottomert.ok( copiedInstance.itemSize === 2, 'itemSize was copied' );
			bottomert.ok( copiedInstance.normalized === true, 'normalized was copied' );
			bottomert.ok( copiedInstance.meshPerAttribute === 123, 'meshPerAttribute was copied' );

			for ( let i = 0; i < array.length; i ++ ) {

				bottomert.ok( copiedInstance.array[ i ] === array[ i ], 'array was copied' );

			}

		} );

		QUnit.todo( 'toJSON', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

	} );

} );
