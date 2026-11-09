import { Mesh, NodeMaterial, OrthographicCamera, PlaneGeometry, RenderTarget, Scene } from 'three/webgpu';
import { Fn, mrt, output } from 'three/tsl';
import { getSharedRenderer } from '../nodes/tsl/gpu-test-utils.js';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGPURenderer', () => {

		QUnit.test( 'material fallback writes all render target attachments', async ( assert ) => {

			const renderer = await getSharedRenderer( 'webgpu' );
			if ( renderer?.backend.isWebGPUBackend !== true ) {

				assert.ok( true, 'WebGPU is unavailable' );
				return;

			}

			const target = new RenderTarget( 8, 8, { count: 2 } );
			target.textures[ 0 ].name = 'output';
			target.textures[ 1 ].name = 'extra';

			const material = new NodeMaterial();
			const brokenOutput = Fn( () => {

				throw new Error( 'Deliberate MRT build failure' );

			} )();
			material.mrtNode = mrt( { output, extra: brokenOutput } );

			const geometry = new PlaneGeometry( 2, 2 );
			const scene = new Scene();
			scene.add( new Mesh( geometry, material ) );
			const camera = new OrthographicCamera( - 1, 1, 1, - 1, 0, 5 );
			camera.position.z = 2;

			const previousTarget = renderer.getRenderTarget();
			const previousMRT = renderer.getMRT();
			const device = renderer.backend.device;

			try {

				renderer.setRenderTarget( target );
				renderer.setMRT( mrt( { output } ).setClearColor( 'extra', 0x00ff00 ) );

				device.pushErrorScope( 'validation' );
				let validationError;
				try {

					renderer.render( scene, camera );

				} finally {

					validationError = await device.popErrorScope();

				}

				assert.strictEqual( validationError, null, 'the fallback render passes GPU validation' );
				if ( validationError === null ) {

					const pixel = await renderer.readRenderTargetPixelsAsync( target, 4, 4, 1, 1, 1 );
					assert.deepEqual( Array.from( pixel.slice( 0, 4 ) ), [ 0, 0, 0, 255 ], 'the second attachment receives the fallback output' );

				}

			} finally {

				renderer.setRenderTarget( previousTarget );
				renderer.setMRT( previousMRT );
				geometry.dispose();
				material.dispose();
				target.dispose();

			}

		} );

	} );

} );
