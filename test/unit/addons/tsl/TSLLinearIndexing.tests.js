import { instanceIndex, uint, workgroupId, numWorkgroups, workgroupIndex, globalId } from 'three/tsl';
import { gpuFuzzTest } from './gpu-test-utils.js';

export default QUnit.module( 'TSL', () => {

	QUnit.module( 'linear indexing', () => {

		gpuFuzzTest( 'instanceIndex matches linearized globalId', 256, ( { assert } ) => {

			const expected = globalId.x.add( globalId.y.mul( uint( 64 ) ).mul( numWorkgroups.x ) ).add( globalId.z.mul( uint( 64 ) ).mul( numWorkgroups.x ).mul( numWorkgroups.y ) );

			assert.eq(
				instanceIndex,
				expected,
				'instanceIndex equals the 3D globalId linearization'
			);

		}, { backends: [ 'webgpu' ] } );

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
