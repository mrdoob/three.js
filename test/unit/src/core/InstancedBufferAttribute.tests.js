/**
 * @author simonThiele / https://github.com/simonThiele
 */
/* global QUnit */

import { InstancedBufferAttribute } from '../../../../src/core/InstancedBufferAttribute';

export default QUnit.module( 'Core', () => {

	QUnit.module( 'InstancedBufferAttribute', () => {

		// INHERITANCE
		QUnit.todo( "Extending", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// INSTANCING
		QUnit.test( "Instancing", ( assert ) => {

			var instance = new InstancedBufferAttribute( new Float32Array( 10 ), 2 );
			assert.ok( instance.meshPerAttribute === 1, "ok" );

			var instance = new InstancedBufferAttribute( new Float32Array( 10 ), 2, 123 );
			assert.ok( instance.meshPerAttribute === 123, "ok" );

		} );

	} );

} );
