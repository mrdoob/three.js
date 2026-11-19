import { DepthTexture, DepthStencilFormat, FloatType, PerspectiveCamera, UnsignedInt248Type } from 'three/webgpu';
import { texture } from 'three/tsl';
import { reproject } from '../../../../examples/jsm/tsl/display/ReprojectNode.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'TSL', () => {

		QUnit.module( 'ReprojectNode', () => {

			QUnit.test( 'Resets incompatible depth history and synchronizes it before copying', assert => {

				const depth = new DepthTexture( 16, 16 );
				const node = reproject( texture( depth ), null, new PerspectiveCamera() );
				let copies = 0;
				const renderer = {
					copyTextureToTexture( source, destination ) {

						assert.strictEqual( source, depth );
						assert.strictEqual( destination, node.previousDepthNode.value );
						assert.strictEqual( destination.image.width, source.image.width );
						assert.strictEqual( destination.image.height, source.image.height );
						assert.strictEqual( destination.format, source.format );
						assert.strictEqual( destination.type, source.type );
						copies ++;

					}
				};

				assert.true( node.needsHistoryReset(), 'Initial dimensions require a reset' );
				node.update( renderer );
				assert.false( node.needsHistoryReset(), 'Copied depth is compatible' );

				const previousDepth = node.previousDepthNode.value;
				const version = previousDepth.version;
				node.update( renderer );
				assert.strictEqual( previousDepth.version, version, 'Unchanged depth needs no reallocation' );

				depth.type = FloatType;
				assert.true( node.needsHistoryReset(), 'Type changes invalidate history at the same size' );
				node.update( renderer );
				assert.true( previousDepth.version > version, 'A type change requests reallocation' );
				assert.false( node.needsHistoryReset(), 'Copied type is compatible' );

				depth.format = DepthStencilFormat;
				assert.true( node.needsHistoryReset(), 'Format changes independently invalidate history' );
				depth.type = UnsignedInt248Type;
				node.update( renderer );
				assert.false( node.needsHistoryReset(), 'Copied format and type are compatible' );

				depth.image.width = 32;
				assert.true( node.needsHistoryReset(), 'Width changes invalidate history' );
				node.update( renderer );
				depth.image.height = 32;
				assert.true( node.needsHistoryReset(), 'Height changes invalidate history' );
				node.update( renderer );
				assert.false( node.needsHistoryReset(), 'Resized depth is compatible' );
				assert.strictEqual( copies, 6, 'Every update copies the current depth' );
				node.dispose();
				depth.dispose();

			} );

		} );

	} );

} );
