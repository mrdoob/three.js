import { CubeTexture, WebGPUCoordinateSystem, WebGLCoordinateSystem } from '../../../../../src/Three.WebGPU.js';
import CubeTextureNode from '../../../../../src/nodes/accessors/CubeTextureNode.js';
import { vec3 } from '../../../../../src/nodes/tsl/TSLBase.js';
import WGSLNodeBuilder from '../../../../../src/renderers/webgpu/nodes/WGSLNodeBuilder.js';

export default QUnit.module( 'Nodes', () => {

	QUnit.module( 'Accessors', () => {

		QUnit.module( 'CubeTextureNode', () => {

			QUnit.test( 'cube sampling only applies the backend coordinate conversion', ( assert ) => {

				for ( const coordinateSystem of [ WebGPUCoordinateSystem, WebGLCoordinateSystem ] ) {

					for ( const isRenderTargetTexture of [ false, true ] ) {

						const texture = new CubeTexture();
						texture.isRenderTargetTexture = isRenderTargetTexture;

						const builder = new WGSLNodeBuilder( null, {
							coordinateSystem,
							debug: { diagnostics: { keywords: false } }
						} );
						const node = new CubeTextureNode( texture );
						const uv = node.setupUV( builder, vec3( 1, 2, 3 ) );

						builder.setShaderStage( 'fragment' );

						let snippet;

						for ( const stage of [ 'setup', 'analyze', 'generate' ] ) {

							builder.setBuildStage( stage );
							snippet = uv.build( builder, 'vec3' );

						}

						const flipX = coordinateSystem === WebGPUCoordinateSystem || ! isRenderTargetTexture;
						const expected = flipX
							? 'vec3<f32>( ( - vec3<f32>( 1.0, 2.0, 3.0 ).x ), vec3<f32>( 1.0, 2.0, 3.0 ).yz )'
							: 'vec3<f32>( 1.0, 2.0, 3.0 )';

						assert.strictEqual( snippet, expected, 'The supplied direction is preserved apart from the required X flip' );
						assert.strictEqual( builder.uniforms.fragment.length, 0, 'Custom cube sampling does not depend on material environment rotation' );

					}

				}

			} );

		} );

	} );

} );
