import { InterleavedBuffer } from '../../../../src/core/InterleavedBuffer.js';

import { DynamicDrawUsage } from '../../../../src/constants.js';

export default QUnit.module( 'Core', () => {

	QUnit.module( 'InterleavedBuffer', () => {

		function checkInstanceAgainstCopy( instance, copiedInstance, assert ) {

			assert.ok( copiedInstance instanceof InterleavedBuffer, 'the clone has the correct type' );

			for ( let i = 0; i < instance.array.length; i ++ ) {

				assert.ok( copiedInstance.array[ i ] === instance.array[ i ], 'array was copied' );

			}

			assert.ok( copiedInstance.stride === instance.stride, 'stride was copied' );
			assert.ok( copiedInstance.usage === DynamicDrawUsage, 'usage was copied' );

		}

		// INSTANCING
		QUnit.test( 'Instancing', ( assert ) => {

			const object = new InterleavedBuffer();
			assert.ok( object, 'Can instantiate an InterleavedBuffer.' );

		} );

		// PROPERTIES

		QUnit.test( 'needsUpdate', ( assert ) => {

			const a = new InterleavedBuffer( new Float32Array( [ 1, 2, 3, 4 ] ), 2 );
			a.needsUpdate = true;

			assert.strictEqual( a.version, 1, 'Check version increased' );

		} );

		// PUBLIC
		QUnit.test( 'isInterleavedBuffer', ( assert ) => {

			const object = new InterleavedBuffer();
			assert.ok(
				object.isInterleavedBuffer,
				'InterleavedBuffer.isInterleavedBuffer should be true'
			);

		} );

		QUnit.test( 'setUsage', ( assert ) => {

			const instance = new InterleavedBuffer();
			instance.setUsage( DynamicDrawUsage );

			assert.strictEqual( instance.usage, DynamicDrawUsage, 'Usage was set' );

		} );

		QUnit.test( 'copy', ( assert ) => {

			const array = new Float32Array( [ 1, 2, 3, 7, 8, 9 ] );
			const instance = new InterleavedBuffer( array, 3 );
			instance.setUsage( DynamicDrawUsage );

			checkInstanceAgainstCopy( instance, instance.copy( instance ), assert );

		} );

		QUnit.test( 'copyAt', ( assert ) => {

			const a = new InterleavedBuffer( new Float32Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ] ), 3 );
			const b = new InterleavedBuffer( new Float32Array( 9 ), 3 );
			const expected = new Float32Array( [ 4, 5, 6, 7, 8, 9, 1, 2, 3 ] );

			b.copyAt( 1, a, 2 );
			b.copyAt( 0, a, 1 );
			b.copyAt( 2, a, 0 );

			assert.deepEqual( b.array, expected, 'Check the right values were replaced' );

		} );

		QUnit.test( 'set', ( assert ) => {

			const instance = new InterleavedBuffer( new Float32Array( [ 1, 2, 3, 7, 8, 9 ] ), 3 );

			instance.set( [ 0, - 1 ] );
			assert.ok( instance.array[ 0 ] === 0 && instance.array[ 1 ] === - 1, 'replace at first by default' );

		} );

		QUnit.test( 'clone', ( assert ) => {

			const instance = new InterleavedBuffer( new Float32Array( [ 1, 2, 3, 7, 8, 9 ] ), 3 );
			instance.setUsage( DynamicDrawUsage );

			checkInstanceAgainstCopy( instance, instance.clone( {} ), assert );

		} );

		QUnit.test( 'clone (views into a shared array buffer)', ( assert ) => {

			// e.g. GLTFLoader creates interleaved buffers as views at different offsets into one array buffer

			const buffer = new Float32Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] ).buffer;
			const a = new InterleavedBuffer( new Float32Array( buffer, 0, 4 ), 2 );
			const b = new InterleavedBuffer( new Float32Array( buffer, 16, 8 ), 4 );
			const c = new InterleavedBuffer( new Float32Array( buffer, 16, 8 ), 2 );

			const data = {};
			const clonedA = a.clone( data );
			const clonedB = b.clone( data );
			const clonedC = c.clone( data );

			assert.deepEqual( Array.from( clonedA.array ), [ 1, 2, 3, 4 ], 'first view was copied' );
			assert.deepEqual( Array.from( clonedB.array ), [ 5, 6, 7, 8, 9, 10, 11, 12 ], 'second view was copied' );
			assert.ok( clonedA.array.buffer !== buffer, 'array buffer was copied' );
			assert.strictEqual( clonedB.array.buffer.byteLength, 32, 'only the view was copied' );
			assert.ok( clonedB.array.buffer === clonedC.array.buffer, 'views over the same range share their copy' );

		} );

		QUnit.test( 'onUpload', ( assert ) => {

			const a = new InterleavedBuffer();
			const func = function () { };

			a.onUpload( func );

			assert.strictEqual( a.onUploadCallback, func, 'Check callback was set properly' );

		} );

		// OTHERS
		QUnit.test( 'count', ( assert ) => {

			const instance = new InterleavedBuffer( new Float32Array( [ 1, 2, 3, 7, 8, 9 ] ), 3 );

			assert.equal( instance.count, 2, 'count is calculated via array length / stride' );

		} );

	} );

} );
