import { instanceIndex, uint, workgroupId, numWorkgroups } from 'three/tsl';
import { globalInvocationIndex, workgroupIndex } from '../../../../examples/jsm/tsl/gpgpu/LinearIndexingNode.js';
import { gpuTest, gpuFuzzTest } from './gpu-test-utils.js';

export default QUnit.module( 'TSL', () => {

	QUnit.module( 'linear indexing', () => {

		gpuTest( 'globalInvocationIndex matches instanceIndex', ( { assert } ) => {

			assert.eq(
				globalInvocationIndex,
				instanceIndex,
				'globalInvocationIndex equals the linearized compute instanceIndex'
			);

		} );

		gpuFuzzTest( 'workgroupIndex matches 1D instanceIndex / workgroup size', 256, ( { assert } ) => {

			assert.eq(
				workgroupIndex,
				instanceIndex.div( uint( 64 ) ),
				'workgroupIndex equals instanceIndex / 64 for a 1D dispatch'
			);

		} );

		gpuFuzzTest( 'workgroupIndex matches linearized workgroupId', 256, ( { assert } ) => {

			const expected = workgroupId.x.add( workgroupId.y.mul( numWorkgroups.x ) ).add( workgroupId.z.mul( numWorkgroups.x ).mul( numWorkgroups.y ) );

			assert.eq(
				workgroupIndex,
				expected,
				'workgroupIndex equals the 3D workgroupId linearization'
			);

		}, { backends: [ 'webgpu' ] } );

	} );

} );
