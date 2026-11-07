import { BackSide, DataTexture, EquirectangularReflectionMapping, FloatType, MeshBasicMaterial, NodeMaterial, OrthographicCamera, PlaneGeometry, RenderTarget, Scene, BoxGeometry, CubeArrayTexture, Mesh, MeshStandardNodeMaterial, Vector3, WebGPUCoordinateSystem } from 'three/webgpu';
import { getParallaxCorrectNormal, nodeObject, pmremTexture, vec3, vec4 } from 'three/tsl';
import { ReflectionProbe, ReflectionProbes } from '../../../../../examples/jsm/lighting/ReflectionProbes.js';
import { ReflectionProbesNode, reflectionProbesSpecular, reflectionProbesDiffuse } from '../../../../../examples/jsm/tsl/lighting/ReflectionProbesNode.js';
import { getSharedRenderer } from '../../../src/nodes/tsl/gpu-test-utils.js';
import WGSLNodeBuilder from '../../../../../src/renderers/webgpu/nodes/WGSLNodeBuilder.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'TSL', () => {

		QUnit.module( 'ReflectionProbesNode', () => {

			QUnit.test( 'local coverage remains independent of environment fallback', async assert => {

				const adapter = await navigator.gpu?.requestAdapter();
				const info = adapter?.info;
				if ( ! info || info.isFallbackAdapter || /swiftshader|llvmpipe|lavapipe|software/i.test( `${ info.vendor } ${ info.device } ${ info.description }` ) ) {

					assert.ok( true, 'SKIPPED: a hardware WebGPU adapter is required.' );
					return;

				}

				const renderer = await getSharedRenderer( 'webgpu' );
				if ( ! renderer ) return;
				const previousTarget = renderer.getRenderTarget();
				const source = new Scene();
				const boxGeometry = new BoxGeometry( 4, 4, 4 );
				const boxMaterial = new MeshBasicMaterial( { side: BackSide } );
				source.add( new Mesh( boxGeometry, boxMaterial ) );
				const pixels = new Float32Array( 8 * 4 * 4 );
				for ( let i = 0; i < pixels.length; i += 4 ) pixels[ i + 1 ] = pixels[ i + 3 ] = 1;
				const environment = new DataTexture( pixels, 8, 4 );
				environment.type = FloatType;
				environment.mapping = EquirectangularReflectionMapping;
				environment.needsUpdate = true;
				source.environment = environment;
				const redPixels = new Float32Array( pixels.length );
				for ( let i = 0; i < redPixels.length; i += 4 ) redPixels[ i ] = redPixels[ i + 3 ] = 1;
				const alternateEnvironment = new DataTexture( redPixels, 8, 4 );
				alternateEnvironment.type = FloatType;
				alternateEnvironment.mapping = EquirectangularReflectionMapping;
				alternateEnvironment.needsUpdate = true;
				const probes = new ReflectionProbes();
				const probe = new ReflectionProbe( 4, 4, 4 );
				probe.blendDistance = 0.5;
				probes.add( probe );
				const view = new Scene();
				const geometry = new PlaneGeometry( 2, 2 );
				const material = new NodeMaterial();
				view.add( new Mesh( geometry, material ) );
				const camera = new OrthographicCamera( - 1, 1, 1, - 1, 0.1, 10 );
				camera.position.z = 2;
				const target = new RenderTarget( 8, 8, { type: FloatType } );
				const query = { position: vec3( 0 ), direction: vec3( 0, 0, 1 ), roughness: 0 };
				const close = ( actual, expected, message ) => assert.ok( expected.every( ( value, i ) => Math.abs( actual[ i ] - value ) < 0.01 ), `${ message }: ${ actual }` );
				const draw = async node => {

					material.fragmentNode = vec4( node );
					material.needsUpdate = true;
					renderer.setRenderTarget( target );
					renderer.render( view, camera );
					return Array.from( await renderer.readRenderTargetPixelsAsync( target, 4, 4, 1, 1 ) );

				};

				try {

					const environmentNode = vec3( 0.25 );
					source.environmentNode = environmentNode;
					probes.bake( renderer, source );
					assert.strictEqual( source.environmentNode, environmentNode, 'Capture restores the application lighting node' );
					assert.strictEqual( probes.texture.image.depth, 6, 'One probe allocates exactly six layers' );
					const provider = reflectionProbesSpecular( probes );
					close( await draw( provider( query ) ), [ 1, 1, 1, 1 ], 'Interior supplies conditional white radiance' );
					close( await draw( reflectionProbesDiffuse( probes )( { position: query.position, normal: query.direction } ) ), [ Math.PI, Math.PI, Math.PI, 1 ], 'Diffuse provider returns irradiance with the same coverage' );
					view.environmentIntensity = 0;
					close( await draw( provider( query ) ), [ 0, 0, 0, 1 ], 'Zero intensity retains coverage' );
					view.environmentIntensity = 1;
					close( await draw( provider( { ...query, position: vec3( 10 ) } ) ), [ 0, 0, 0, 0 ], 'Explicit outside position has no local coverage' );
					const position = vec3( 1.75, 0, 0 );
					const local = nodeObject( new ReflectionProbesNode( probes, { ...query, position } ) );
					close( await draw( local ), [ 1, 1, 1, 0.5 ], 'Fade changes coverage rather than conditional radiance' );
					const sky = pmremTexture( environment ).context( { getUV: () => query.direction, getTextureLevel: () => 0 } );
					const recomposed = local.rgb.mul( local.a ).add( sky.mul( local.a.oneMinus() ) );
					close( await draw( vec4( recomposed, 1 ) ), [ 0.5, 1, 0.5, 1 ], 'Caller supplies independent PMREM fallback' );
					const bakedTexture = probes.texture;
					sky.node.value = alternateEnvironment;
					close( await draw( vec4( recomposed, 1 ) ), [ 1, 0.5, 0.5, 1 ], 'Fallback can change without rebaking probes' );
					assert.strictEqual( probes.texture, bakedTexture, 'Fallback replacement keeps the local capture' );
					close( await draw( vec4( getParallaxCorrectNormal( vec3( 1, 0, 0 ), vec3( 4 ), vec3( 0 ), vec3( 0, 1, 0 ) ), 1 ) ), [ 2, 1, 0, 1 ], 'Parallax uses explicit query position' );

					const overlap = new ReflectionProbe( 4, 4, 4 );
					overlap.blendDistance = 0.5;
					probes.add( overlap );
					probes.bake( renderer, source );
					assert.strictEqual( probes.texture.image.depth, 12, 'Two probes allocate twelve layers without an environment cube' );
					close( await draw( provider( { ...query, position } ) ), [ 1, 1, 1, 0.75 ], 'Overlapping probes consume only remaining coverage' );
					probes.remove( overlap );

					boxMaterial.color.set( 0 );
					probes.bake( renderer, source );
					close( await draw( local ), [ 0, 0, 0, 0.5 ], 'Rebaked valid black retains fractional coverage' );
					// Keep this compiled graph bound across the next bake.
					boxMaterial.color.set( 0xffffff );
					source.environment = null;
					probes.bake( renderer, source );
					renderer.setRenderTarget( target );
					renderer.render( view, camera );
					close( Array.from( await renderer.readRenderTargetPixelsAsync( target, 4, 4, 1, 1 ) ), [ 1, 1, 1, 0.5 ], 'Existing local bindings follow a replacement texture' );
					probes.capturing = true;
					close( await draw( local ), [ 0, 0, 0, 0 ], 'Capture suppresses local coverage' );
					probes.capturing = false;
					probes.remove( probe );
					source.environment = environment;
					probes.bake( renderer, source );
					assert.strictEqual( probes.texture, null, 'An empty bake has no texture' );
					assert.strictEqual( probes._renderTarget, null, 'An empty bake allocates no environment-only render target' );
					assert.deepEqual( probes.bakedProbes, [], 'An empty bake has no captured probes' );
					close( await draw( local ), [ 0, 0, 0, 0 ], 'Rebuilt material handles an empty probe set' );
					probes.add( probe );
					probes.bake( renderer, source );
					close( await draw( local ), [ 1, 1, 1, 0.5 ], 'Rebuilt material samples returning probes' );

				} finally {

					probes.capturing = false;
					renderer.setRenderTarget( previousTarget );
					for ( const resource of [ boxGeometry, boxMaterial, geometry, material, target, environment, alternateEnvironment, probes ] ) resource.dispose();

				}

			} );

			QUnit.test( 'clone copies the probe settings', ( assert ) => {

				const probes = new ReflectionProbes();
				probes.boxProjection = false;
				const probe = new ReflectionProbe( 8, 5, 8 );
				probe.projectionSize = new Vector3( 16, 5, 8 );
				probe.projectionOffset.set( 0, 0.6, 0 );
				probe.blendDistance = 0.25;
				probes.add( probe );

				const clone = probes.clone();
				const cloneProbe = clone.children[ 0 ];

				assert.strictEqual( clone.boxProjection, false, 'copies boxProjection' );
				assert.strictEqual( clone.texture, null, 'does not share the baked texture' );
				assert.true( cloneProbe.isReflectionProbe, 'clones the probes' );
				assert.deepEqual( cloneProbe.influenceSize.toArray(), [ 8, 5, 8 ], 'copies influenceSize' );
				assert.deepEqual( cloneProbe.projectionSize.toArray(), [ 16, 5, 8 ], 'copies projectionSize' );
				assert.notStrictEqual( cloneProbe.projectionSize, probe.projectionSize, 'does not share projectionSize' );
				assert.deepEqual( cloneProbe.projectionOffset.toArray(), [ 0, 0.6, 0 ], 'copies projectionOffset' );
				assert.strictEqual( cloneProbe.blendDistance, 0.25, 'copies blendDistance' );

			} );

			QUnit.test( 'updates uniforms in every material program', ( assert ) => {

				const probe = new ReflectionProbe( 8, 5, 8 );
				const probes = new ReflectionProbes();
				probes.texture = new CubeArrayTexture();
				probes.texture.mipmaps = [ {}, {} ];
				probes.bakedProbes = [ probe ];
				const node = new ReflectionProbesNode( probes );
				const geometry = new BoxGeometry();
				const material = new MeshStandardNodeMaterial();
				const mesh = new Mesh( geometry, material );
				const renderer = {
					backend: { utils: { getTextureSampleData: () => ( { primarySamples: 1 } ) } },
					coordinateSystem: WebGPUCoordinateSystem,
					debug: { diagnostics: { keywords: false } },
					hasFeature: () => true
				};

				const compile = () => {

					const builder = new WGSLNodeBuilder( mesh, renderer );
					builder.setShaderStage( 'fragment' );
					builder.context.getUV = () => vec3( 1, 0, 0 );
					builder.context.getTextureLevel = () => 0;
					builder.flowStagesNode( node );
					return builder.uniforms.fragment;

				};

				const firstUniforms = compile();
				const firstSlot = node._slots[ 0 ];
				const secondUniforms = compile();

				for ( const name of Object.keys( firstSlot ) ) {

					const uniform = firstSlot[ name ];
					assert.true( firstUniforms.some( binding => binding.node === uniform ), `${ name } is bound in the first program` );
					assert.true( secondUniforms.some( binding => binding.node === uniform ), `${ name } is shared with the second program` );

				}

				probes.boxProjection = false;
				probe.position.set( 1, 2, 3 );
				probe.scale.setScalar( 2 );
				probe.blendDistance = 0.75;
				probe.projectionSize = new Vector3( 10, 6, 10 );
				probe.projectionOffset.set( 0, 0.5, 0 );
				node.updateBefore();

				assert.strictEqual( node._boxProjection.value, 0, 'disables projection' );
				assert.deepEqual( firstSlot.position.value.toArray(), [ 1, 2, 3 ], 'updates the world position in both programs' );
				assert.deepEqual( firstSlot.extent.value.toArray(), [ 8, 5, 8 ], 'updates the influence extent in both programs' );
				assert.strictEqual( firstSlot.fade.value, 0.75, 'updates the fade in both programs' );
				assert.deepEqual( firstSlot.projectionSize.value.toArray(), [ 20, 12, 20 ], 'updates the projection size in both programs' );
				assert.deepEqual( firstSlot.projectionOffset.value.toArray(), [ 0, 1, 0 ], 'updates the projection offset in both programs' );

				probes.boxProjection = true;
				node.updateBefore();
				assert.strictEqual( node._boxProjection.value, 1, 're-enables projection' );

				geometry.dispose();
				material.dispose();
				probes.texture.dispose();

			} );

		} );

	} );

} );
