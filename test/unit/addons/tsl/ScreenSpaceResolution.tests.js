import {
	BoxGeometry, Color, DataUtils, HemisphereLight, Mesh, MeshStandardMaterial,
	PerspectiveCamera, PlaneGeometry, RenderPipeline, Scene, Vector2
} from 'three/webgpu';
import { mrt, normalView, output, packNormalToRGB, pass, sample, unpackRGBToNormal, velocity } from 'three/tsl';
import { ssgi } from '../../../../examples/jsm/tsl/display/SSGINode.js';
import { temporalReproject } from '../../../../examples/jsm/tsl/display/TemporalReprojectNode.js';
import { recurrentDenoise } from '../../../../examples/jsm/tsl/display/RecurrentDenoiseNode.js';
import { getSharedRenderer } from '../../src/nodes/tsl/gpu-test-utils.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'TSL', () => {

		for ( const [ backend, feedback ] of [
			[ 'webgpu', false ], [ 'webgpu', true ],
			[ 'webgl', false ], [ 'webgl', true ]
		] ) {

			QUnit.test( `Screen-space effects follow reduced-resolution inputs (${ backend }, feedback: ${ feedback })`, async ( assert ) => {

				const renderer = await getSharedRenderer( backend );

				if ( renderer === null ) {

					assert.ok( true, `SKIPPED: "${ backend }" backend is not available in this environment.` );
					return;

				}

				const previousSize = renderer.getSize( new Vector2() );
				const previousPixelRatio = renderer.getPixelRatio();
				const scene = new Scene();
				scene.background = new Color( 0.1, 0.1, 0.1 );
				scene.add( new HemisphereLight( 0xffffff, 0x444444, 3 ) );
				const floorGeometry = new PlaneGeometry( 8, 8 );
				const boxGeometry = new BoxGeometry();
				const floorMaterial = new MeshStandardMaterial();
				const boxMaterial = new MeshStandardMaterial( { color: 0xff0000 } );
				const floor = new Mesh( floorGeometry, floorMaterial );
				floor.rotation.x = - Math.PI / 2;
				const box = new Mesh( boxGeometry, boxMaterial );
				box.position.y = 0.5;
				scene.add( floor, box );
				const camera = new PerspectiveCamera( 50, 4 / 3, 0.1, 20 );
				camera.position.set( 2, 2, 4 );
				camera.lookAt( 0, 0.5, 0 );
				const scenePass = pass( scene, camera );
				scenePass.setResolutionScale( 0.5 );
				scenePass.setMRT( mrt( { output, normal: packNormalToRGB( normalView ), velocity } ) );
				const depth = scenePass.getTextureNode( 'depth' );
				const normal = scenePass.getTextureNode( 'normal' );
				const gi = ssgi( scenePass.getTextureNode(), depth, sample( ( uv ) => unpackRGBToNormal( normal.sample( uv ) ) ), camera );
				gi.useTemporalFiltering = false;
				const temporal = temporalReproject( gi.getGINode(), depth, normal, scenePass.getTextureNode( 'velocity' ), camera, { accumulate: ! feedback } );
				const denoise = recurrentDenoise( temporal, camera, { depth, normal, raw: gi.getGINode(), accumulate: feedback } );
				denoise.alphaSource = 'none';
				if ( feedback ) temporal.setHistoryTexture( denoise.getRenderTarget().texture );
				const pipeline = new RenderPipeline( renderer, denoise );
				async function renderFrame() {

					await new Promise( requestAnimationFrame );
					pipeline.render();

				}

				const device = backend === 'webgpu' ? renderer.backend.device : null;
				if ( device !== null ) device.pushErrorScope( 'validation' );

				try {

					renderer.setPixelRatio( 1 );
					const sizes = [
						[ 64, 48, 32, 24, 0.5, 1 ],
						[ 83, 61, 41, 30, 0.5, 1 ],
						[ 64, 48, 48, 36, 0.75, 1 ],
						[ 32, 24, 32, 24, 0.5, 2 ],
						[ 64, 48, 64, 48, 1, 1 ]
					];

					for ( const [ width, height, inputWidth, inputHeight, scale, pixelRatio ] of sizes ) {

						renderer.setPixelRatio( pixelRatio );
						renderer.setSize( width, height );
						scenePass.setResolutionScale( scale );
						camera.position.x += 0.1;
						camera.lookAt( 0, 0.5, 0 );
						await renderFrame();

						for ( const target of [ gi._ssgiRenderTarget, temporal._historyRenderTarget, temporal._resolveRenderTarget, denoise.getRenderTarget() ] ) {

							assert.strictEqual( target.width, inputWidth, `${ target.texture.name } width follows the input on this frame` );
							assert.strictEqual( target.height, inputHeight, `${ target.texture.name } height follows the input on this frame` );

						}

						assert.strictEqual( temporal._historyRenderTarget.depthTexture.image.width, inputWidth, 'History depth matches the source copy size' );
						await renderFrame();
						const pixels = await renderer.readRenderTargetPixelsAsync( denoise.getRenderTarget(), 0, 0, inputWidth, inputHeight );
						assert.true( pixels.every( value => Number.isFinite( DataUtils.fromHalfFloat( value ) ) ), 'Reprojection and denoising produce finite output after motion and resizing' );
						assert.true( pixels.some( ( value, index ) => index % 4 < 3 && DataUtils.fromHalfFloat( value ) > 0.001 ), 'Indirect lighting is present in the denoised output' );

					}

					// The same input pixel grid should give the same lighting regardless of display resolution.
					renderer.setPixelRatio( 1 );
					renderer.setSize( 32, 24 );
					scenePass.setResolutionScale( 1 );
					await renderFrame();
					const reference = await renderer.readRenderTargetPixelsAsync( gi._ssgiRenderTarget, 0, 0, 32, 24 );
					const referenceGI = await renderer.readRenderTargetPixelsAsync( gi._ssgiRenderTarget, 0, 0, 32, 24, 1 );
					renderer.setSize( 64, 48 );
					scenePass.setResolutionScale( 0.5 );
					await renderFrame();
					const reduced = await renderer.readRenderTargetPixelsAsync( gi._ssgiRenderTarget, 0, 0, 32, 24 );
					const reducedGI = await renderer.readRenderTargetPixelsAsync( gi._ssgiRenderTarget, 0, 0, 32, 24, 1 );
					assert.deepEqual( Array.from( reduced ), Array.from( reference ), 'AO matches the native-resolution reference pixel for pixel' );
					assert.deepEqual( Array.from( reducedGI ), Array.from( referenceGI ), 'GI matches the native-resolution reference pixel for pixel' );
					assert.true( reference.some( value => value < 250 ), 'The reference contains occlusion rather than an empty white result' );

				} finally {

					if ( device !== null ) {

						const validationError = await device.popErrorScope();
						assert.strictEqual( validationError, null, `No WebGPU validation errors: ${ validationError?.message }` );

					}

					pipeline.dispose();
					denoise.dispose();
					temporal.dispose();
					gi.dispose();
					scenePass.dispose();
					floorGeometry.dispose();
					boxGeometry.dispose();
					floorMaterial.dispose();
					boxMaterial.dispose();
					renderer.setPixelRatio( previousPixelRatio );
					renderer.setSize( previousSize.x, previousSize.y );

				}

			} );

		}

	} );

} );
