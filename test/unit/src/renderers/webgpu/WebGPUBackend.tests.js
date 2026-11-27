import { Fn, instanceIndex, instancedArray, mrt, vec4 } from 'three/tsl';
import { HalfFloatType, NodeMaterial, QuadMesh, RenderTarget, UnsignedByteType } from 'three/webgpu';
import { getSharedRenderer } from '../../nodes/tsl/gpu-test-utils.js';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGPU', () => {

		QUnit.module( 'WebGPUBackend', () => {

			QUnit.test( 'equivalent compute pipelines share compilation and retain independent storage bindings', async ( assert ) => {

				const renderer = await getSharedRenderer( 'webgpu' );

				if ( renderer === null || renderer.backend.isWebGPUBackend !== true ) {

					assert.ok( true, 'SKIPPED: WebGPU is not available.' );
					return;

				}

				const buffers = [ 4, 10 ].map( value => instancedArray( new Uint32Array( [ value ] ), 'uint' ) );
				const kernels = buffers.map( buffer => Fn( () => {

					buffer.element( instanceIndex ).addAssign( 1 );

				} )().compute( 1 ) );
				const device = renderer.backend.device;
				const createComputePipelineAsync = device.createComputePipelineAsync;
				let pipelineCreations = 0;

				device.createComputePipelineAsync = function ( descriptor ) {

					pipelineCreations ++;
					return createComputePipelineAsync.call( this, descriptor );

				};

				try {

					await Promise.all( kernels.map( kernel => renderer.compileComputeAsync( kernel ) ) );

					const pipeline = renderer._pipelines.get( kernels[ 0 ] ).pipeline;
					assert.strictEqual( renderer._pipelines.get( kernels[ 1 ] ).pipeline, pipeline, 'Identical shader and layout share one pipeline.' );
					assert.strictEqual( pipelineCreations, 1, 'The GPU creates one compute pipeline.' );

					renderer.compute( kernels );
					kernels[ 0 ].dispose();
					renderer.compute( kernels[ 1 ] );

					const data = await Promise.all( buffers.map( buffer => renderer.getArrayBufferAsync( buffer.value ) ) );
					assert.deepEqual( data.map( bytes => new Uint32Array( bytes )[ 0 ] ), [ 5, 12 ], 'Each dispatch updates its own buffer, including after a sibling is disposed.' );

				} finally {

					device.createComputePipelineAsync = createComputePipelineAsync;

					for ( const kernel of kernels ) kernel.dispose();
					for ( const buffer of buffers ) buffer.value.dispose();

				}

			} );

			QUnit.test( 'compute pipeline cache keys include bind group layouts', async ( assert ) => {

				const renderer = await getSharedRenderer( 'webgpu' );

				if ( renderer === null || renderer.backend.isWebGPUBackend !== true ) {

					assert.ok( true, 'SKIPPED: WebGPU is not available.' );
					return;

				}

				const backend = renderer.backend;
				const get = backend.get;

				backend.get = ( bindGroup ) => ( { layoutKey: bindGroup.layoutKey } );

				try {

					const computeNode = { id: 1 };
					const stageCompute = { id: 2 };
					const keyA = renderer._pipelines._getComputeCacheKey( computeNode, stageCompute, [ { layoutKey: 'layout-a' } ] );
					const keyB = renderer._pipelines._getComputeCacheKey( computeNode, stageCompute, [ { layoutKey: 'layout-b' } ] );

					assert.notStrictEqual( keyA, keyB, 'Different bind group layouts produce different cache keys.' );

				} finally {

					backend.get = get;

				}

			} );

			QUnit.test( 'render pipelines honor the formats of all color attachments', async ( assert ) => {

				const renderer = await getSharedRenderer( 'webgpu' );

				if ( renderer === null || renderer.backend.isWebGPUBackend !== true ) {

					assert.ok( true, 'SKIPPED: WebGPU is not available.' );
					return;

				}

				// both targets share the format of the first attachment

				const targetA = new RenderTarget( 1, 1, { count: 2, type: UnsignedByteType, depthBuffer: false } );
				const targetB = new RenderTarget( 1, 1, { count: 2, type: UnsignedByteType, depthBuffer: false } );
				targetB.textures[ 1 ].type = HalfFloatType;

				const material = new NodeMaterial();
				material.fragmentNode = mrt( { output: vec4( 1 ), data: vec4( 0 ) } );

				const quad = new QuadMesh( material );
				const device = renderer.backend.device;

				device.pushErrorScope( 'validation' );

				for ( const target of [ targetA, targetB ] ) {

					target.textures[ 0 ].name = 'output';
					target.textures[ 1 ].name = 'data';

					renderer.setRenderTarget( target );
					quad.render( renderer );

				}

				const error = await device.popErrorScope();

				assert.strictEqual( error, null, 'No validation error.' );

				renderer.setRenderTarget( null );
				targetA.dispose();
				targetB.dispose();
				material.dispose();

			} );

		} );

	} );

} );
