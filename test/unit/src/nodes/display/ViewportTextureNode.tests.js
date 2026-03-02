import { viewportTexture } from '../../../../../src/nodes/display/ViewportTextureNode.js';
import { FramebufferTexture } from '../../../../../src/textures/FramebufferTexture.js';
import { RenderTarget } from '../../../../../src/core/RenderTarget.js';

export default QUnit.module( 'Nodes', () => {

	QUnit.module( 'Display', () => {

		QUnit.module( 'ViewportTextureNode', () => {

			// CACHING BEHAVIOR
			QUnit.module( 'Texture Caching', () => {

				QUnit.test( 'getTextureForReference returns defaultFramebuffer for null reference', ( assert ) => {

					const node = viewportTexture();
					const texture = node.getTextureForReference( null );

					assert.strictEqual(
						texture, node.defaultFramebuffer,
						'null reference should return defaultFramebuffer'
					);

				} );

				QUnit.test( 'getTextureForReference caches textures per reference', ( assert ) => {

					const node = viewportTexture();

					// Create mock references (using RenderTargets as they work as cache keys)
					const renderTarget1 = new RenderTarget( 512, 512 );
					const renderTarget2 = new RenderTarget( 256, 256 );

					// Get textures for each reference
					const texture1a = node.getTextureForReference( renderTarget1 );
					const texture1b = node.getTextureForReference( renderTarget1 );
					const texture2 = node.getTextureForReference( renderTarget2 );

					// Same reference should return same cached texture
					assert.strictEqual(
						texture1a, texture1b,
						'Same reference should return same cached texture'
					);

					// Different references should return different textures
					assert.notStrictEqual(
						texture1a, texture2,
						'Different references should return different cached textures'
					);

					// Both should be FramebufferTexture instances
					assert.ok(
						texture1a instanceof FramebufferTexture,
						'Cached texture should be FramebufferTexture instance'
					);
					assert.ok(
						texture2 instanceof FramebufferTexture,
						'Cached texture should be FramebufferTexture instance'
					);

					// Clean up
					renderTarget1.dispose();
					renderTarget2.dispose();

				} );

				QUnit.test( 'cached textures are independent from defaultFramebuffer', ( assert ) => {

					const node = viewportTexture();

					const renderTarget = new RenderTarget( 512, 512 );
					const cachedTexture = node.getTextureForReference( renderTarget );

					assert.notStrictEqual(
						cachedTexture, node.defaultFramebuffer,
						'Cached texture for a reference should not be the defaultFramebuffer'
					);

					// Clean up
					renderTarget.dispose();

				} );

				QUnit.test( 'multiple render targets get independent caches', ( assert ) => {

					const node = viewportTexture();

					// Create multiple render targets with different sizes
					const targets = [
						new RenderTarget( 512, 512 ),
						new RenderTarget( 256, 256 ),
						new RenderTarget( 128, 128 ),
						new RenderTarget( 1024, 1024 )
					];

					const textures = targets.map( target => node.getTextureForReference( target ) );

					// All textures should be unique
					for ( let i = 0; i < textures.length; i ++ ) {

						for ( let j = i + 1; j < textures.length; j ++ ) {

							assert.notStrictEqual(
								textures[ i ], textures[ j ],
								`Texture ${i} should be different from texture ${j}`
							);

						}

					}

					// Verify caching works for all
					targets.forEach( ( target, index ) => {

						const retrieved = node.getTextureForReference( target );
						assert.strictEqual(
							retrieved, textures[ index ],
							`Re-retrieving texture ${index} should return cached version`
						);

					} );

					// Clean up
					targets.forEach( target => target.dispose() );

				} );

			} );

			// REFERENCE PRIORITY
			QUnit.module( 'Reference Priority', () => {

				QUnit.test( 'referenceNode delegation works correctly', ( assert ) => {

					// Create a parent node
					const parentNode = viewportTexture();

					// Create a child node that references the parent
					const childNode = viewportTexture();
					childNode.referenceNode = parentNode;

					const renderTarget = new RenderTarget( 512, 512 );

					// When childNode has a referenceNode, it should use parent's cache
					const textureFromChild = childNode.getTextureForReference( renderTarget );
					const textureFromParent = parentNode.getTextureForReference( renderTarget );

					assert.strictEqual(
						textureFromChild, textureFromParent,
						'Child node with referenceNode should use parent cache'
					);

					// Clean up
					renderTarget.dispose();

				} );

				// When rendering to a RenderTarget, it should take priority over CanvasTarget
				QUnit.test( 'updateReference prioritizes renderTarget over canvasTarget', ( assert ) => {

					const node = viewportTexture();

					// Create mock targets
					const renderTarget = new RenderTarget( 512, 512 );
					const canvasTarget = { isCanvasTarget: true }; // Mock canvas target

					// Create mock renderer that returns both targets
					const mockRenderer = {
						getRenderTarget: () => renderTarget,
						getCanvasTarget: () => canvasTarget
					};

					// Create mock frame object
					const mockFrame = {
						renderer: mockRenderer
					};

					// Call updateReference
					node.updateReference( mockFrame );

					// The node.value should be the texture for renderTarget, not canvasTarget
					const expectedTexture = node.getTextureForReference( renderTarget );
					const canvasTexture = node.getTextureForReference( canvasTarget );

					assert.strictEqual(
						node.value, expectedTexture,
						'When both renderTarget and canvasTarget exist, renderTarget should be used as reference'
					);

					assert.notStrictEqual(
						node.value, canvasTexture,
						'canvasTarget texture should NOT be used when renderTarget is available'
					);

					// Clean up
					renderTarget.dispose();

				} );

				// Test the edge case: when only canvasTarget is available (renderTarget is null)
				QUnit.test( 'updateReference uses canvasTarget when renderTarget is null', ( assert ) => {

					const node = viewportTexture();

					const canvasTarget = { isCanvasTarget: true }; // Mock canvas target

					// Create mock renderer where renderTarget is null
					const mockRenderer = {
						getRenderTarget: () => null,
						getCanvasTarget: () => canvasTarget
					};

					const mockFrame = {
						renderer: mockRenderer
					};

					// Call updateReference
					node.updateReference( mockFrame );

					// The node.value should be the texture for canvasTarget
					const expectedTexture = node.getTextureForReference( canvasTarget );

					assert.strictEqual(
						node.value, expectedTexture,
						'When renderTarget is null, canvasTarget should be used as reference'
					);

				} );

			} );

		} );

	} );

} );
