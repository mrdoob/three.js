import { Fn, instanceIndex, instancedArray } from 'three/tsl';
import { rawComputeTest } from './gpu-raw-test-utils.js';

export default QUnit.module( 'TSL', () => {

	QUnit.module( 'compute pipelines', () => {

		rawComputeTest( 'identical compute shaders keep separate buffers', { backend: 'webgl' }, async ( { assert, renderer } ) => {

			const buffers = [ 10, 100 ].map( value => instancedArray( new Float32Array( [ value ] ) ) );
			const kernels = buffers.map( buffer => Fn( () => {

				buffer.element( instanceIndex ).addAssign( 1 );

			} )().compute( 1 ) );

			try {

				renderer.compute( kernels );
				renderer.compute( kernels[ 0 ] );

				const pipelines = kernels.map( kernel => renderer._pipelines.get( kernel ).pipeline );
				assert.notStrictEqual( pipelines[ 0 ], pipelines[ 1 ], 'Kernels have separate pipelines' );
				assert.strictEqual( pipelines[ 0 ].computeProgram, pipelines[ 1 ].computeProgram, 'Identical shaders remain shared' );

				assert.deepEqual( new Float32Array( await renderer.getArrayBufferAsync( buffers[ 0 ].value ) ), new Float32Array( [ 12 ] ), 'First kernel updates its own buffer twice' );
				assert.deepEqual( new Float32Array( await renderer.getArrayBufferAsync( buffers[ 1 ].value ) ), new Float32Array( [ 101 ] ), 'Second kernel updates its own buffer once' );

			} finally {

				for ( const kernel of kernels ) kernel.dispose();

			}

		} );

	} );

} );
