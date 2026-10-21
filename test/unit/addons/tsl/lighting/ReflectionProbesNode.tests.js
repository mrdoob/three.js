import { BoxGeometry, CubeArrayTexture, Mesh, MeshStandardNodeMaterial, Vector3, WebGPUCoordinateSystem } from 'three/webgpu';
import { vec3 } from 'three/tsl';
import { ReflectionProbe, ReflectionProbes } from '../../../../../examples/jsm/lighting/ReflectionProbes.js';
import { ReflectionProbesNode } from '../../../../../examples/jsm/tsl/lighting/ReflectionProbesNode.js';
import WGSLNodeBuilder from '../../../../../src/renderers/webgpu/nodes/WGSLNodeBuilder.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'TSL', () => {

		QUnit.module( 'ReflectionProbesNode', () => {

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
				node.updateBefore();

				assert.strictEqual( firstSlot.project.value, 0, 'disables projection in both programs' );
				assert.deepEqual( firstSlot.position.value.toArray(), [ 1, 2, 3 ], 'updates the world position in both programs' );
				assert.deepEqual( firstSlot.extent.value.toArray(), [ 8, 5, 8 ], 'updates the influence extent in both programs' );
				assert.strictEqual( firstSlot.fade.value, 0.75, 'updates the fade in both programs' );
				assert.deepEqual( firstSlot.projectionSize.value.toArray(), [ 20, 12, 20 ], 'updates the projection size in both programs' );

				probes.boxProjection = true;
				node.updateBefore();
				assert.strictEqual( firstSlot.project.value, 1, 're-enables projection in both programs' );

				geometry.dispose();
				material.dispose();
				probes.texture.dispose();

			} );

		} );

	} );

} );
