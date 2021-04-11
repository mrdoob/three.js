/* global QUnit */

import { InterleavedBuffer } from '../../../../src/core/InterleavedBuffer';
import { DynamicDrawUsage } from '../../../../src/constants';

export default QUnit.module( 'Core', () => {

	QUnit.module( 'InterleavedBuffer', () => {

		function checkInstanceAgainstCopy( instance, copiedInstance, assert ) {

			assert.ok( copiedInstance instanceof InterleavedBuffer, "the clone has the correct type" );

			for ( var i = 0; i < instance.array.length; i ++ ) {

				assert.ok( copiedInstance.array[ i ] === instance.array[ i ], "array was copied" );

			}

			assert.ok( copiedInstance.stride === instance.stride, "stride was copied" );
			assert.ok( copiedInstance.usage === DynamicDrawUsage, "usage was copied" );

		}

		// INSTANCING
		QUnit.todo( "Instancing", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		// PROPERTIES
		QUnit.test( "needsUpdate", ( assert ) => {

			var a = new InterleavedBuffer( new Float32Array( [ 1, 2, 3, 4 ] ), 2 );

			a.needsUpdate = true;

			assert.strictEqual( a.version, 1, "Check version increased" );

		} );

		// PUBLIC STUFF
		QUnit.todo( "isInterleavedBuffer", ( assert ) => {

			assert.ok( false, "everything's gonna be alright" );

		} );

		QUnit.test( "setUsage", ( assert ) => {

			var instance = new InterleavedBuffer();
			instance.setUsage( DynamicDrawUsage );

			assert.strictEqual( instance.usage, DynamicDrawUsage, "Usage was set" );

		} );

		QUnit.test( "copy", ( assert ) => {

			var array = new Float32Array( [ 1, 2, 3, 7, 8, 9 ] );
			var instance = new InterleavedBuffer( array, 3 );
			instance.setUsage( DynamicDrawUsage );

			checkInstanceAgainstCopy( instance, instance.copy( instance ), assert );

		} );

		QUnit.test( "onUpload", ( assert ) => {

			var a = new InterleavedBuffer();
			var func = function () { };

			a.onUpload( func );

			assert.strictEqual( a.onUploadCallback, func, "Check callback was set properly" );

		} );

	} );

} );
