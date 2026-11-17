import TextureNode from '../../../../../src/nodes/accessors/TextureNode.js';
import StorageTextureNode from '../../../../../src/nodes/accessors/StorageTextureNode.js';
import ViewportTextureNode from '../../../../../src/nodes/display/ViewportTextureNode.js';
import ViewportDepthTextureNode from '../../../../../src/nodes/display/ViewportDepthTextureNode.js';
import ReflectorNode from '../../../../../src/nodes/utils/ReflectorNode.js';
import RTTNode from '../../../../../src/nodes/utils/RTTNode.js';
import { pass, passTexture } from '../../../../../src/nodes/display/PassNode.js';
import { float, ivec2, vec2, vec4 } from '../../../../../src/nodes/tsl/TSLBase.js';
import { Texture } from '../../../../../src/textures/Texture.js';
import StorageTexture from '../../../../../src/renderers/common/StorageTexture.js';
import { Scene } from '../../../../../src/scenes/Scene.js';
import { PerspectiveCamera } from '../../../../../src/cameras/PerspectiveCamera.js';

export default QUnit.module( 'Nodes', () => {

	QUnit.module( 'Accessors', () => {

		QUnit.module( 'TextureNode', () => {

			QUnit.test( 'copySamplingState preserves the destination texture', ( assert ) => {

				const coordinates = vec2( 0.25, 0.75 );
				const level = float( 2 );
				const source = new TextureNode( new Texture() ).sample( coordinates ).level( level );
				const targetTexture = new Texture();
				const target = new TextureNode( targetTexture );

				assert.strictEqual( target.copySamplingState( source ), target, 'Returns the destination node.' );
				assert.strictEqual( target.value, targetTexture, 'Does not replace the destination texture.' );
				assert.strictEqual( target.referenceNode, null, 'Does not replace its render dependency.' );
				assert.strictEqual( target.uvNode, coordinates, 'Copies explicit coordinates.' );
				assert.strictEqual( target.levelNode, level, 'Copies the selected mip.' );

			} );

			const factories = {
				TextureNode: () => new TextureNode( new Texture() ),
				StorageTextureNode: () => new StorageTextureNode( new StorageTexture( 4, 4 ), null, vec4( 1 ) ),
				PassTextureNode: () => {

					const scenePass = pass( new Scene(), new PerspectiveCamera() );
					return passTexture( scenePass, scenePass.getTexture( 'output' ) );

				},
				PassMultipleTextureNode: () => pass( new Scene(), new PerspectiveCamera() ).getPreviousTextureNode(),
				ViewportTextureNode: () => new ViewportTextureNode(),
				ViewportDepthTextureNode: () => new ViewportDepthTextureNode(),
				ReflectorNode: () => new ReflectorNode(),
				RTTNode: () => new RTTNode( vec4( 1 ) )
			};

			for ( const [ name, create ] of Object.entries( factories ) ) {

				QUnit.test( `${ name } cloning preserves sampling and subclass state`, ( assert ) => {

					const source = create();
					const coordinates = ivec2( 1, 2 );
					const level = float( 1 );
					const offset = ivec2( 0, 1 );
					const sampled = source.load( coordinates ).level( level ).offset( offset );
					const clone = sampled.clone();

					assert.strictEqual( clone.uvNode, coordinates, 'Keeps coordinates through chained operations.' );
					assert.strictEqual( clone.levelNode, level, 'Keeps the selected mip.' );
					assert.strictEqual( clone.offsetNode, offset, 'Keeps the texel offset.' );
					assert.strictEqual( clone.sampler, false, 'An unfiltered load stays unfiltered.' );
					assert.strictEqual( clone.constructor, name === 'RTTNode' ? TextureNode : source.constructor, 'Preserves the expected clone type.' );

					if ( source.isPassTextureNode ) {

						assert.strictEqual( clone.passNode, source.passNode, 'Keeps its pass dependency.' );

					}

					if ( source.isPassMultipleTextureNode ) {

						assert.strictEqual( clone.textureName, source.textureName, 'Keeps the selected attachment.' );
						assert.true( clone.previousTexture, 'Keeps the previous-frame attachment.' );

					}

					if ( source.isStorageTextureNode ) {

						assert.strictEqual( clone.storeNode, source.storeNode, 'Keeps the storage value.' );
						assert.strictEqual( clone.access, source.access, 'Keeps storage access.' );

					}

					if ( source instanceof ViewportTextureNode ) {

						assert.strictEqual( clone.defaultFramebuffer, source.defaultFramebuffer, 'Keeps its reference framebuffer.' );

					}

					if ( source instanceof ReflectorNode ) {

						assert.strictEqual( clone.reflector, source.reflector, 'Keeps its reflector dependency.' );

					}

					if ( source.isRTTNode ) {

						assert.strictEqual( source.clone().referenceNode, source, 'The sample still depends on the original RTT node.' );

					}

				} );

			}

			QUnit.test( 'cloning preserves gradients, comparison and bias', ( assert ) => {

				const coordinates = vec2( 0.25, 0.75 );
				const gradientX = vec2( 1, 0 );
				const gradientY = vec2( 0, 1 );
				const texture = new TextureNode( new Texture() );
				const gradients = texture.grad( gradientX, gradientY ).sample( coordinates );
				const comparison = float( 0.5 );
				const depth = new ViewportDepthTextureNode().compare( comparison ).sample( coordinates );
				const biased = texture.blur( 0.25 );

				assert.deepEqual( gradients.gradNode, [ gradientX, gradientY ], 'Keeps explicit gradients when setting coordinates.' );
				assert.strictEqual( depth.compareNode, comparison, 'Keeps depth comparison when setting coordinates.' );
				assert.strictEqual( biased.sample( coordinates ).biasNode, biased.biasNode, 'Keeps the bias when setting coordinates.' );

			} );

		} );

	} );

} );
