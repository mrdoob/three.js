import { ReadbackBuffer } from 'three/webgpu';
import { Fn, instanceIndex, instancedArray } from 'three/tsl';
import { rawComputeTest } from '../../nodes/tsl/gpu-raw-test-utils.js';

// these tests need the WebGPU backend: WebGPURenderer falls back to WebGL 2 where WebGPU is unavailable

function webgpuTest( name, run ) {

	rawComputeTest( name, {}, async ( { assert, renderer } ) => {

		if ( renderer.backend.isWebGPUBackend !== true ) {

			assert.ok( true, `SKIPPED: "${ name }" requires the WebGPU backend.` );
			return;

		}

		await run( { assert, renderer } );

	} );

}

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'Common', () => {

		QUnit.module( 'StorageBufferAttribute', () => {

			webgpuTest( 'a failed readback releases its buffers', async ( { assert, renderer } ) => {

				const buffer = instancedArray( 4, 'float' );

				await renderer.computeAsync( Fn( () => {

					buffer.element( instanceIndex ).assign( 7 );

				} )().compute( 4 ) );

				const mapAsync = GPUBuffer.prototype.mapAsync;
				const destroy = GPUBuffer.prototype.destroy;
				const destroyed = new Set();
				const failure = new Error( 'mapping failed' );
				const errors = [];

				GPUBuffer.prototype.mapAsync = function () {

					return Promise.reject( failure );

				};

				GPUBuffer.prototype.destroy = function () {

					destroyed.add( this );
					return destroy.call( this );

				};

				const target = new ReadbackBuffer( 16 );

				try {

					try {

						await renderer.getArrayBufferAsync( buffer.value ).catch( ( error ) => errors.push( error ) );
						await renderer.getArrayBufferAsync( buffer.value, target ).catch( ( error ) => errors.push( error ) );

					} finally {

						GPUBuffer.prototype.mapAsync = mapAsync;
						GPUBuffer.prototype.destroy = destroy;

					}

					assert.strictEqual( errors.length, 2, 'both readbacks failed' );
					assert.strictEqual( errors[ 0 ], failure, 'a readback into a new array buffer rethrows the mapping error' );
					assert.strictEqual( errors[ 1 ], failure, 'a readback into a ReadbackBuffer rethrows the mapping error' );
					assert.strictEqual( destroyed.size, 1, 'the temporary read buffer was destroyed' );

					await renderer.getArrayBufferAsync( buffer.value, target );

					assert.deepEqual( Array.from( new Float32Array( target.buffer ) ), [ 7, 7, 7, 7 ], 'the readback buffer can be used again' );

					target.release();

				} finally {

					target.dispose();

				}

			} );

		} );

	} );

} );
