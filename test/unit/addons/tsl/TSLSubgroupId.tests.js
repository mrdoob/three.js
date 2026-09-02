import { invocationLocalIndex, subgroupSize, uint } from 'three/tsl';
import { subgroupIndex, numSubgroups } from '../../../../examples/jsm/tsl/gpgpu/SubgroupIdNode.js';
import { gpuFuzzTest } from './gpu-test-utils.js';

export default QUnit.module( 'TSL', () => {

	QUnit.module( 'subgroup id', () => {

		gpuFuzzTest( 'subgroupIndex matches local_invocation_index / subgroup_size', 256, ( { assert } ) => {

			assert.eq(
				subgroupIndex,
				invocationLocalIndex.div( subgroupSize ),
				'subgroupIndex equals invocationLocalIndex / subgroupSize'
			);

		}, { backends: [ 'webgpu' ] } );

		gpuFuzzTest( 'numSubgroups matches ceil(workgroup_size / subgroup_size)', 256, ( { assert } ) => {

			const volume = uint( 64 );
			const expected = volume.add( subgroupSize ).sub( uint( 1 ) ).div( subgroupSize );

			assert.eq(
				numSubgroups,
				expected,
				'numSubgroups equals ceil(64 / subgroupSize) for the default workgroup'
			);

		}, { backends: [ 'webgpu' ] } );

	} );

} );
