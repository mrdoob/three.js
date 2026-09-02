import { subgroupIndex, numSubgroups, uint } from 'three/tsl';
import { gpuFuzzTest } from './gpu-test-utils.js';

export default QUnit.module( 'TSL', () => {

	QUnit.module( 'subgroup id', () => {

		gpuFuzzTest( 'subgroupIndex is in [0, numSubgroups)', 256, ( { assert } ) => {

			assert.lessThan(
				subgroupIndex,
				numSubgroups,
				'subgroupIndex is less than numSubgroups'
			);

		}, { backends: [ 'webgpu' ] } );

		gpuFuzzTest( 'numSubgroups is at least 1', 256, ( { assert } ) => {

			assert.greaterThan(
				numSubgroups,
				uint( 0 ),
				'numSubgroups is greater than 0'
			);

		}, { backends: [ 'webgpu' ] } );

	} );

} );
