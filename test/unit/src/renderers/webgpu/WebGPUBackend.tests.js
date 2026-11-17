import { mrt, vec4 } from 'three/tsl';
import { HalfFloatType, NodeMaterial, QuadMesh, RenderTarget, UnsignedByteType } from 'three/webgpu';
import { getSharedRenderer } from '../../nodes/tsl/gpu-test-utils.js';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGPU', () => {

		QUnit.module( 'WebGPUBackend', () => {

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
