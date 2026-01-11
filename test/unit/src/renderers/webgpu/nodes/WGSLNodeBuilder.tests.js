import WGSLNodeBuilder from '../../../../../../src/renderers/webgpu/nodes/WGSLNodeBuilder.js';

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGPU', () => {

		QUnit.module( 'Nodes', () => {

			QUnit.module( 'WGSLNodeBuilder', () => {

				// generateTextureLoad is essentially a pure function (texture info -> WGSL string)
				// The only 'this' access is renderer.backend.compatibilityMode for a depth texture edge case
				// We test the real method with minimal context to verify WGSL output

				QUnit.test( 'generateTextureLoad omits level for storage textures', ( assert ) => {

					const context = {
						renderer: { backend: { compatibilityMode: false } }
					};

					const storageTexture = { isStorageTexture: true };

					const snippet = WGSLNodeBuilder.prototype.generateTextureLoad.call(
						context,
						storageTexture,
						'testTexture',
						'uvec2(0, 0)',
						null, // levelSnippet
						null, // depthSnippet
						null // offsetSnippet
					);

					// Storage textures should NOT have level parameter (WGSL spec)
					assert.notOk( snippet.includes( 'u32(' ), 'storage texture load should not include level parameter' );
					assert.strictEqual( snippet, 'textureLoad( testTexture, uvec2(0, 0) )', 'correct WGSL for storage texture' );

				} );

				QUnit.test( 'generateTextureLoad includes level for regular textures', ( assert ) => {

					const context = {
						renderer: { backend: { compatibilityMode: false } }
					};

					const regularTexture = { isStorageTexture: false };

					const snippet = WGSLNodeBuilder.prototype.generateTextureLoad.call(
						context,
						regularTexture,
						'testTexture',
						'uvec2(0, 0)',
						null, // levelSnippet - should default to '0u'
						null,
						null
					);

					// Regular textures SHOULD have level parameter
					assert.ok( snippet.includes( 'u32( 0u )' ), 'regular texture load should include default level parameter' );
					assert.strictEqual( snippet, 'textureLoad( testTexture, uvec2(0, 0), u32( 0u ) )' );

				} );

			} );

		} );

	} );

} );
