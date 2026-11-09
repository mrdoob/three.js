import { DataTexture, PlaneGeometry, EquirectangularReflectionMapping, Mesh, MeshStandardNodeMaterial, NodeMaterial, OrthographicCamera, QuadMesh, RenderTarget, Scene, SphereGeometry } from 'three/webgpu';
import { context, indirectSpecular, pass, sample, uniform, vec2, vec3, vec4 } from 'three/tsl';
import { temporalDenoise } from '../../../../../examples/jsm/tsl/display/DenoiseNode.js';
import { getSharedRenderer } from '../tsl/gpu-test-utils.js';

export default QUnit.module( 'Nodes', () => {

	QUnit.module( 'Lighting', () => {

		QUnit.module( 'IndirectSpecularNode', () => {

			for ( const backend of [ 'webgpu', 'webgl' ] ) {

				QUnit.test( `ordered and nested coverage (${ backend })`, async assert => {

					const renderer = await getSharedRenderer( backend );
					if ( renderer === null ) {

						assert.ok( true, `SKIPPED: ${ backend } unavailable.` );
						return;

					}

					const first = () => vec4( 1, 0, 0, 0.25 );
					const second = () => vec4( 0, 0, 1, 0.5 );
					const fallback = () => vec4( 0, 1, 0, 1 );
					const nested = indirectSpecular( [ first, second ] );
					const query = { position: vec3( 0 ), normal: vec3( 0, 0, 1 ), viewDirection: vec3( 0, 0, 1 ) };
					const material = new NodeMaterial();
					const quad = new QuadMesh( material );
					const target = new RenderTarget( 1, 1, { depthBuffer: false } );
					const previousTarget = renderer.getRenderTarget();

					try {

						for ( const providers of [[ first, second, fallback ], [ nested.asProvider(), fallback ]] ) {

							material.colorNode = indirectSpecular( providers ).sample( query );
							material.needsUpdate = true;
							renderer.setRenderTarget( target );
							quad.render( renderer );
							const pixel = await renderer.readRenderTargetPixelsAsync( target, 0, 0, 1, 1 );
							for ( const [ channel, expected ] of [ 0.25, 0.375, 0.375, 1 ].entries() ) {

								assert.true( Math.abs( pixel[ channel ] / 255 - expected ) < 0.01, `Channel ${ channel } fills only remaining coverage.` );

							}

						}

					} finally {

						renderer.setRenderTarget( previousTarget );
						material.dispose();
						target.dispose();

					}

				} );

				QUnit.test( `replaces environment specular and preserves diffuse (${ backend })`, async assert => {

					const renderer = await getSharedRenderer( backend );
					if ( renderer === null ) {

						assert.ok( true, `SKIPPED: ${ backend } unavailable.` );
						return;

					}

					const data = new Uint8Array( 32 * 16 * 4 );
					for ( let i = 0; i < data.length; i += 4 ) {

						data[ i ] = data[ i + 3 ] = 255;

					}

					const environment = new DataTexture( data, 32, 16 );
					environment.mapping = EquirectangularReflectionMapping;
					environment.needsUpdate = true;
					const material = new MeshStandardNodeMaterial( { envMap: environment, metalness: 1, roughness: 0.3 } );
					material.contextNode = context( { indirectSpecularNode: indirectSpecular( [ () => vec4( 0, 0, 1, 1 ) ] ) } );
					const geometry = new SphereGeometry( 0.8, 16, 8 );
					const scene = new Scene();
					scene.add( new Mesh( geometry, material ) );
					const camera = new OrthographicCamera( - 1, 1, 1, - 1, 0.1, 10 );
					camera.position.z = 3;
					const target = new RenderTarget( 16, 16 );
					const previousTarget = renderer.getRenderTarget();

					try {

						renderer.setRenderTarget( target );
						renderer.render( scene, camera );
						const metal = await renderer.readRenderTargetPixelsAsync( target, 8, 8, 1, 1 );
						assert.true( metal[ 2 ] > 100 && metal[ 0 ] < 5, 'Covered specular replaces the red environment with blue.' );
						material.metalness = 0;
						renderer.render( scene, camera );
						const dielectric = await renderer.readRenderTargetPixelsAsync( target, 8, 8, 1, 1 );
						assert.true( dielectric[ 0 ] > 100, 'Diffuse environment lighting remains red.' );
						assert.true( dielectric[ 2 ] < metal[ 2 ] / 4, 'The material BRDF attenuates dielectric specular.' );

					} finally {

						renderer.setRenderTarget( previousTarget );
						material.dispose();
						geometry.dispose();
						target.dispose();
						environment.dispose();

					}

				} );

				QUnit.test( `denoiser rejects changed surfaces and reactive history (${ backend })`, async assert => {

					const renderer = await getSharedRenderer( backend );
					if ( renderer === null ) {

						assert.ok( true, `SKIPPED: ${ backend } unavailable.` );
						return;

					}


					const identity = uniform( 1 );
					const reactive = uniform( 0 );
					const camera = new OrthographicCamera( - 1, 1, 1, - 1, 0.1, 10 );
					camera.position.z = 3;
					const geometry = new PlaneGeometry( 4, 4 );
					const sourceMaterial = new NodeMaterial();
					sourceMaterial.colorNode = vec4( 1 );
					const scene = new Scene();
					scene.add( new Mesh( geometry, sourceMaterial ) );
					const source = pass( scene, camera );
					const denoiser = temporalDenoise( source.getTextureNode(), {
						camera, depth: source.getTextureNode( 'depth' ), normal: sample( () => vec3( 0, 0, 1 ) ), velocity: sample( () => vec2( 0 ) ),
						surfaceId: sample( () => identity ), reactive: sample( () => reactive ), coverage: true
					} );
					const material = new NodeMaterial();
					material.colorNode = denoiser;
					const quad = new QuadMesh( material );
					const target = new RenderTarget( 1, 1 );
					const previousTarget = renderer.getRenderTarget();

					async function age() {

						renderer._nodes.nodeFrame.update();
						renderer.setRenderTarget( target );
						quad.render( renderer );
						const data = await renderer.readRenderTargetPixelsAsync( denoiser._historyTargets[ 0 ], 0, 0, 1, 1, 2 );
						return data[ 1 ] % 256;

					}

					try {

						await age();
						assert.true( await age() > 1, 'Stable surface accumulates history.' );
						identity.value = 2;
						assert.strictEqual( await age(), 1, 'Changing identity rejects old history.' );
						reactive.value = 1;
						assert.strictEqual( await age(), 1, 'Reactive samples reject history.' );
						reactive.value = 0;
						assert.true( await age() > 1, 'History resumes after reactivity clears.' );

					} finally {

						renderer.setRenderTarget( previousTarget );
						denoiser.dispose();
						material.dispose();
						target.dispose();
						source.dispose();
						geometry.dispose();
						sourceMaterial.dispose();

					}

				} );

			}

		} );

	} );

} );
