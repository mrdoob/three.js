import { Fn, instanceIndex, instancedArray, vec4 } from 'three/tsl';
import { rawComputeTest } from '../../nodes/tsl/gpu-raw-test-utils.js';

async function readFloats( renderer, attribute ) {

	return new Float32Array( await renderer.getArrayBufferAsync( attribute ) );

}

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

			webgpuTest( 'updates of padded vec3 storage data are uploaded unchanged', async ( { assert, renderer } ) => {

				const buffer = instancedArray( new Float32Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ] ), 'vec3' );
				const output = instancedArray( 3, 'vec4' );

				const copy = Fn( () => {

					output.element( instanceIndex ).assign( vec4( buffer.element( instanceIndex ), 1 ) );

				} )().compute( 3 );

				await renderer.computeAsync( copy );

				// the attribute now holds the padded layout

				const array = buffer.value.array;

				assert.strictEqual( buffer.value.itemSize, 4, 'itemSize is padded' );
				assert.deepEqual( Array.from( array ), [ 1, 2, 3, 0, 4, 5, 6, 0, 7, 8, 9, 0 ], 'padded array' );

				array.set( [ 40, 50, 60 ], 4 );
				buffer.value.needsUpdate = true;

				await renderer.computeAsync( copy );

				const result = await readFloats( renderer, output.value );

				assert.deepEqual( Array.from( result ), [ 1, 2, 3, 1, 40, 50, 60, 1, 7, 8, 9, 1 ], 'updated values' );

				// update ranges address the padded layout as well

				array.set( [ 70, 80, 90 ], 8 );
				buffer.value.addUpdateRange( 8, 3 );
				buffer.value.needsUpdate = true;

				await renderer.computeAsync( copy );

				const rangeResult = await readFloats( renderer, output.value );

				assert.deepEqual( Array.from( rangeResult ), [ 1, 2, 3, 1, 40, 50, 60, 1, 70, 80, 90, 1 ], 'values updated through an update range' );

			} );

		} );

	} );

} );
