import { viewportDepthTexture } from '../../../../../src/nodes/display/ViewportDepthTextureNode.js';
import { DepthTexture } from '../../../../../src/textures/DepthTexture.js';
import { RenderTarget } from '../../../../../src/core/RenderTarget.js';

export default QUnit.module( 'Nodes', () => {

	QUnit.module( 'Display', () => {

		QUnit.module( 'ViewportDepthTextureNode', () => {

			// DEPTH TEXTURE CACHING
			QUnit.module( 'Depth Texture Caching', () => {

				QUnit.test( 'getTextureForReference returns shared buffer for null reference', ( assert ) => {

					const node = viewportDepthTexture();
					const texture = node.getTextureForReference( null );

					assert.strictEqual(
						texture, node.defaultFramebuffer,
						'null reference should return the shared depth buffer'
					);

				} );

				QUnit.test( 'different references get independent cached depth textures', ( assert ) => {

					const node = viewportDepthTexture();

					// Create mock canvas targets (simulating different canvases)
					const canvasTarget1 = { isCanvasTarget: true, id: 1 };
					const canvasTarget2 = { isCanvasTarget: true, id: 2 };

					// Get depth textures for each reference
					const depthTex1 = node.getTextureForReference( canvasTarget1 );
					const depthTex2 = node.getTextureForReference( canvasTarget2 );

					// CRITICAL: Different references must get different textures
					assert.notStrictEqual(
						depthTex1, depthTex2,
						'Different CanvasTarget references MUST get different cached depth textures'
					);

					// Both should be DepthTexture instances
					assert.ok(
						depthTex1 instanceof DepthTexture,
						'Cached texture for canvasTarget1 should be a DepthTexture'
					);
					assert.ok(
						depthTex2 instanceof DepthTexture,
						'Cached texture for canvasTarget2 should be a DepthTexture'
					);

					// Neither should be the shared buffer (they should be clones)
					assert.notStrictEqual(
						depthTex1, node.defaultFramebuffer,
						'Cached texture should not be the shared default buffer'
					);
					assert.notStrictEqual(
						depthTex2, node.defaultFramebuffer,
						'Cached texture should not be the shared default buffer'
					);

				} );

				QUnit.test( 'same reference returns same cached depth texture', ( assert ) => {

					const node = viewportDepthTexture();

					const canvasTarget = { isCanvasTarget: true };

					// Get texture twice for same reference
					const depthTex1 = node.getTextureForReference( canvasTarget );
					const depthTex2 = node.getTextureForReference( canvasTarget );

					assert.strictEqual(
						depthTex1, depthTex2,
						'Same reference should return the same cached depth texture'
					);

				} );

				// Test with RenderTargets
				QUnit.test( 'RenderTargets get independent cached depth textures', ( assert ) => {

					const node = viewportDepthTexture();

					const renderTarget1 = new RenderTarget( 512, 512 );
					const renderTarget2 = new RenderTarget( 256, 256 );

					const depthTex1 = node.getTextureForReference( renderTarget1 );
					const depthTex2 = node.getTextureForReference( renderTarget2 );

					assert.notStrictEqual(
						depthTex1, depthTex2,
						'Different RenderTargets MUST get different cached depth textures'
					);

					// Clean up
					renderTarget1.dispose();
					renderTarget2.dispose();

				} );

				// Test mixed CanvasTarget and RenderTarget references
				QUnit.test( 'CanvasTarget and RenderTarget get independent caches', ( assert ) => {

					const node = viewportDepthTexture();

					const canvasTarget = { isCanvasTarget: true };
					const renderTarget = new RenderTarget( 512, 512 );

					const canvasDepthTex = node.getTextureForReference( canvasTarget );
					const renderDepthTex = node.getTextureForReference( renderTarget );

					assert.notStrictEqual(
						canvasDepthTex, renderDepthTex,
						'CanvasTarget and RenderTarget MUST get different cached depth textures'
					);

					// Clean up
					renderTarget.dispose();

				} );

			} );

		} );

	} );

} );
