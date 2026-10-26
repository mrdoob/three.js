import { DataTexture, DataUtils, FloatType, NodeMaterial, OrthographicCamera, QuadMesh, RendererUtils, Vector2, Vector3 } from 'three/webgpu';
import { context, float, texture, vec4 } from 'three/tsl';
import { ssr } from '../../../../examples/jsm/tsl/display/SSRNode.js';
import { getSharedRenderer } from '../../src/nodes/tsl/gpu-test-utils.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'TSL', () => {

		QUnit.module( 'SSRNode', () => {

			QUnit.test( 'coverage is independent of source brightness and hit distance', async assert => {

				const adapter = await navigator.gpu?.requestAdapter();
				const info = adapter?.info;
				const hardware = info && ! info.isFallbackAdapter && ! /swiftshader|llvmpipe|lavapipe|software/i.test( `${ info.vendor } ${ info.device } ${ info.description }` );
				const renderer = hardware ? await getSharedRenderer( 'webgpu' ) : null;
				if ( ! renderer ) {

					assert.ok( true, 'SKIPPED: WebGPU unavailable' );
					return;

				}

				const state = RendererUtils.saveRendererState( renderer );
				const previousContext = renderer.contextNode;
				const previousSize = renderer.getSize( new Vector2() );
				const previousRatio = renderer.getPixelRatio();
				const width = 64, height = 32, originX = 17;
				const camera = new OrthographicCamera( - 4, 4, 2, - 2, 0.1, 10 );
				camera.coordinateSystem = renderer.coordinateSystem;
				camera.updateProjectionMatrix();
				camera.updateMatrixWorld();
				const projectDepth = z => new Vector3( 0, 0, z ).applyMatrix4( camera.projectionMatrix ).z;
				const makeTexture = callback => {

					const data = new Float32Array( width * height * 4 );
					for ( let y = 0; y < height; y ++ ) {

						for ( let x = 0; x < width; x ++ ) data.set( callback( x, y ), 4 * ( x + width * y ) );

					}

					const result = new DataTexture( data, width, height );
					result.type = FloatType;
					result.needsUpdate = true;
					return result;

				};

				const target = x => x >= 22 && x < 26;
				const source = makeTexture( x => [ target( x ) ? 1 : 0, 0, 0, 1 ] );
				// Reflect (0, 0, -1) about this normal to obtain (1, 0, 0).
				const normal = makeTexture( x => x === originX ? [ Math.SQRT1_2, 0, Math.SQRT1_2, 1 ] : [ - 1, 0, 0, 1 ] );
				// An unrelated foreground sheet separates the origin from the red stripe.
				// Its one-unit separation exceeds both the configured and pixel thickness.
				// The stripe is slightly nearer than the origin to accommodate the
				// sampler's minimum GGX alpha, which perturbs a roughness-zero ray.
				const depth = makeTexture( x => [ projectDepth( x === originX ? - 2 : target( x ) ? - 1.9 : - 1 ), 0, 0, 1 ] );
				const node = ssr( texture( source ), texture( depth ), texture( normal ), {
					camera, stochastic: true, outputCoverage: true,
					metalnessNode: float( 1 ), roughnessNode: float( 0 ), noiseNode: vec4( 0.5 )
				} );
				node.quality.value = 1;
				node.thickness.value = 0.01;
				node.screenEdgeFade.value = 0;
				node.mirrorBias.value = 0;
				const material = new NodeMaterial();
				material.fragmentNode = node.getTextureNode();
				const quad = new QuadMesh( material );
				const renderOrigin = async () => {

					await new Promise( resolve => requestAnimationFrame( resolve ) );
					renderer.setRenderTarget( null );
					quad.render( renderer );
					const result = node.getRenderTarget();
					const pixels = await renderer.readRenderTargetPixelsAsync( result, Math.floor( originX * node.resolutionScale ), Math.floor( height * node.resolutionScale / 2 ), 1, 1 );
					return Array.from( pixels, DataUtils.fromHalfFloat );

				};

				try {

					renderer.setPixelRatio( 1 );
					renderer.setSize( width, height );
					renderer.contextNode = context();
					node.maxDistance.value = 0.25;
					assert.strictEqual( ( await renderOrigin() )[ 0 ], 0, 'A short ray cannot reach geometry beyond its endpoint' );
					node.binaryRefine = true;
					assert.strictEqual( ( await renderOrigin() )[ 0 ], 0, 'Refinement respects the clipped endpoint' );
					node.maxDistance.value = 2;
					const coverageAtOrigin = async () => {

						const pixels = await renderer.readRenderTargetPixelsAsync( node.getRenderTarget(), originX, height / 2, 1, 1, 1 );
						return DataUtils.fromHalfFloat( pixels[ 0 ] );

					};

					const hit = await renderOrigin();
					assert.ok( hit[ 0 ] > 0.9 && hit[ 3 ] > 0, 'Fixture hits the lit stripe and preserves distance' );
					assert.strictEqual( await coverageAtOrigin(), 1, 'A full-validity hit covers the pixel' );
					for ( let i = 0; i < source.image.data.length; i += 4 ) {

						source.image.data[ i ] = 0;
						source.image.data[ i + 3 ] = 0.25;

					}

					source.needsUpdate = true;
					const black = await renderOrigin();
					assert.strictEqual( black[ 0 ], 0, 'Black hits remain black' );
					assert.strictEqual( await coverageAtOrigin(), 0.25, 'Black hits still consume fractional source coverage' );
					assert.ok( Math.abs( black[ 3 ] - hit[ 3 ] ) < 0.01, 'Source coverage does not change geometric distance' );
					node.screenEdgeFade.value = 0.5;
					await renderOrigin();
					const faded = await coverageAtOrigin();
					assert.ok( faded > 0 && faded < 0.25, 'Screen-edge fading reduces coverage' );
					node.maxDistance.value = 0;
					await renderOrigin();
					assert.strictEqual( await coverageAtOrigin(), 0, 'A miss leaves the pixel uncovered' );

				} finally {

					node.dispose();
					material.dispose();
					for ( const value of [ source, depth, normal ] ) value.dispose();
					renderer.contextNode = previousContext;
					renderer.setPixelRatio( previousRatio );
					renderer.setSize( previousSize.x, previousSize.y );
					RendererUtils.restoreRendererState( renderer, state );

				}

			} );

		} );

	} );

} );
