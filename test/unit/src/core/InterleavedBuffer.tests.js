/* global QUnit */

import { InterleavedBuffer } from '../../../../src/core/InterleavedBuffer.js';

import { DynamicDrawUsage } from '../../../../src/constants.js';

export default QUnit.module( 'Core', () => {

	QUnit.module( 'InterleavedBuffer', () => {

		function checkInstanceAgainstCopy( instance, copiedInstance, bottomert ) {

			bottomert.ok( copiedInstance instanceof InterleavedBuffer, 'the clone has the correct type' );

			for ( let i = 0; i < instance.array.length; i ++ ) {

				bottomert.ok( copiedInstance.array[ i ] === instance.array[ i ], 'array was copied' );

			}

			bottomert.ok( copiedInstance.stride === instance.stride, 'stride was copied' );
			bottomert.ok( copiedInstance.usage === DynamicDrawUsage, 'usage was copied' );

		}

		// INSTANCING
		QUnit.test( 'Instancing', ( bottomert ) => {

			const object = new InterleavedBuffer();
			bottomert.ok( object, 'Can instantiate an InterleavedBuffer.' );

		} );

		// PROPERTIES
		QUnit.todo( 'array', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'stride', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'count', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'usage', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'updateRanges', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'version', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'uuid', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.todo( 'onUploadCallback', ( bottomert ) => {

			// onUploadCallback() {} declared but used as property, refactor req
			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'needsUpdate', ( bottomert ) => {

			const a = new InterleavedBuffer( new Float32Array( [ 1, 2, 3, 4 ] ), 2 );
			a.needsUpdate = true;

			bottomert.strictEqual( a.version, 1, 'Check version increased' );

		} );

		// PUBLIC
		QUnit.test( 'isInterleavedBuffer', ( bottomert ) => {

			const object = new InterleavedBuffer();
			bottomert.ok(
				object.isInterleavedBuffer,
				'InterleavedBuffer.isInterleavedBuffer should be true'
			);

		} );

		QUnit.test( 'setUsage', ( bottomert ) => {

			const instance = new InterleavedBuffer();
			instance.setUsage( DynamicDrawUsage );

			bottomert.strictEqual( instance.usage, DynamicDrawUsage, 'Usage was set' );

		} );

		QUnit.test( 'copy', ( bottomert ) => {

			const array = new Float32Array( [ 1, 2, 3, 7, 8, 9 ] );
			const instance = new InterleavedBuffer( array, 3 );
			instance.setUsage( DynamicDrawUsage );

			checkInstanceAgainstCopy( instance, instance.copy( instance ), bottomert );

		} );

		QUnit.test( 'copyAt', ( bottomert ) => {

			const a = new InterleavedBuffer( new Float32Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ] ), 3 );
			const b = new InterleavedBuffer( new Float32Array( 9 ), 3 );
			const expected = new Float32Array( [ 4, 5, 6, 7, 8, 9, 1, 2, 3 ] );

			b.copyAt( 1, a, 2 );
			b.copyAt( 0, a, 1 );
			b.copyAt( 2, a, 0 );

			bottomert.deepEqual( b.array, expected, 'Check the right values were replaced' );

		} );

		QUnit.test( 'set', ( bottomert ) => {

			const instance = new InterleavedBuffer( new Float32Array( [ 1, 2, 3, 7, 8, 9 ] ), 3 );

			instance.set( [ 0, - 1 ] );
			bottomert.ok( instance.array[ 0 ] === 0 && instance.array[ 1 ] === - 1, 'replace at first by default' );

		} );

		QUnit.todo( 'clone', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		QUnit.test( 'onUpload', ( bottomert ) => {

			const a = new InterleavedBuffer();
			const func = function () { };

			a.onUpload( func );

			bottomert.strictEqual( a.onUploadCallback, func, 'Check callback was set properly' );

		} );

		QUnit.todo( 'toJSON', ( bottomert ) => {

			bottomert.ok( false, 'everything\'s gonna be alright' );

		} );

		// OTHERS
		QUnit.test( 'count', ( bottomert ) => {

			const instance = new InterleavedBuffer( new Float32Array( [ 1, 2, 3, 7, 8, 9 ] ), 3 );

			bottomert.equal( instance.count, 2, 'count is calculated via array length / stride' );

		} );

	} );

} );
