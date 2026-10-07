import { IndirectStorageBufferAttribute } from 'three/webgpu';
import { Fn, instanceIndex, instancedArray, storage } from 'three/tsl';
import { rawComputeTest, readUintBuffer } from './gpu-raw-test-utils.js';

export default QUnit.module( 'TSL', () => {

	QUnit.module( 'indirect dispatch', () => {

		rawComputeTest( 'uploads unbound CPU dispatch buffers and their updates', {}, async ( { assert, renderer } ) => {

			const dispatch = new IndirectStorageBufferAttribute( new Uint32Array( [ 2, 1, 1 ] ), 1 );
			const output = instancedArray( 8, 'uint' );
			const kernel = Fn( () => {

				output.element( instanceIndex ).addAssign( 1 );

			} )().computeKernel( [ 2 ] );

			renderer.compute( kernel, dispatch );
			assert.deepEqual( Array.from( await readUintBuffer( renderer, output ) ), [ 1, 1, 1, 1, 0, 0, 0, 0 ] );

			dispatch.array[ 0 ] = 3;
			dispatch.needsUpdate = true;
			renderer.compute( kernel, dispatch );
			assert.deepEqual( Array.from( await readUintBuffer( renderer, output ) ), [ 2, 2, 2, 2, 1, 1, 0, 0 ] );

		} );

		rawComputeTest( 'preserves GPU-written dispatch counts', {}, async ( { assert, renderer } ) => {

			const dispatch = new IndirectStorageBufferAttribute( new Uint32Array( [ 0, 1, 1 ] ), 1 );
			const dispatchNode = storage( dispatch, 'uint', 3 );
			const output = instancedArray( 8, 'uint' );
			const producer = Fn( () => {

				dispatchNode.element( 0 ).assign( 2 );

			} )().computeKernel( [ 1 ] );
			const consumer = Fn( () => {

				output.element( instanceIndex ).assign( 1 );

			} )().computeKernel( [ 2 ] );

			renderer.compute( producer, [ 1, 1, 1 ] );
			renderer.compute( consumer, dispatch );
			assert.deepEqual( Array.from( await readUintBuffer( renderer, output ) ), [ 1, 1, 1, 1, 0, 0, 0, 0 ] );

		} );

	} );

} );
