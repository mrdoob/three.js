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

		QUnit.test( "copyAt", ( assert ) => {

			var a = new InterleavedBuffer( new Float32Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ] ), 3 );
			var b = new InterleavedBuffer( new Float32Array( 9 ), 3 );
			var expected = new Float32Array( [ 4, 5, 6, 7, 8, 9, 1, 2, 3 ] );

			b.copyAt( 1, a, 2 );
			b.copyAt( 0, a, 1 );
			b.copyAt( 2, a, 0 );

			assert.deepEqual( b.array, expected, "Check the right values were replaced" );

		} );

		QUnit.test( "set", ( assert ) => {

			var instance = new InterleavedBuffer( new Float32Array( [ 1, 2, 3, 7, 8, 9 ] ), 3 );

			instance.set( [ 0, - 1 ] );
			assert.ok( instance.array[ 0 ] === 0 && instance.array[ 1 ] === - 1, "replace at first by default" );

		} );

		QUnit.test( "onUpload", ( assert ) => {

			var a = new InterleavedBuffer();
			var func = function () { };

			a.onUpload( func );

			assert.strictEqual( a.onUploadCallback, func, "Check callback was set properly" );

		} );

		// OTHERS
		QUnit.test( "count", ( assert ) => {

			var instance = new InterleavedBuffer( new Float32Array( [ 1, 2, 3, 7, 8, 9 ] ), 3 );

			assert.equal( instance.count, 2, "count is calculated via array length / stride" );

		} );

	} );

} );
