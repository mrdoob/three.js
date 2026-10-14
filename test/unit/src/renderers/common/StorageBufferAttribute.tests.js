import { ReadbackBuffer } from 'three/webgpu';
import { Fn, instanceIndex, instancedArray } from 'three/tsl';
import { rawComputeTest } from '../../nodes/tsl/gpu-raw-test-utils.js';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'Common', () => {

		QUnit.module( 'StorageBufferAttribute', () => {

			rawComputeTest( 'a failed readback releases its buffers', {}, async ( { assert, renderer } ) => {

				const buffer = instancedArray( 4, 'float' );

				await renderer.computeAsync( Fn( () => {

					buffer.element( instanceIndex ).assign( 7 );

				} )().compute( 4 ) );

				const mapAsync = GPUBuffer.prototype.mapAsync;
				const destroy = GPUBuffer.prototype.destroy;
				const destroyed = new Set();

				GPUBuffer.prototype.mapAsync = function () {

					return Promise.reject( new Error( 'mapping failed' ) );

				};

				GPUBuffer.prototype.destroy = function () {

					destroyed.add( this );
					return destroy.call( this );

				};

				const target = new ReadbackBuffer( 16 );
				let failures = 0;

				try {

					await renderer.getArrayBufferAsync( buffer.value ).catch( () => failures ++ );
					await renderer.getArrayBufferAsync( buffer.value, target ).catch( () => failures ++ );

				} finally {

					GPUBuffer.prototype.mapAsync = mapAsync;
					GPUBuffer.prototype.destroy = destroy;

				}

				assert.strictEqual( failures, 2, 'both readbacks failed' );
				assert.strictEqual( destroyed.size, 1, 'the temporary read buffer was destroyed' );

				await renderer.getArrayBufferAsync( buffer.value, target );

				assert.deepEqual( Array.from( new Float32Array( target.buffer ) ), [ 7, 7, 7, 7 ], 'the readback buffer can be used again' );

				target.release();
				target.dispose();

			} );

		} );

	} );

} );
