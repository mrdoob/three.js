import { DepthTexture, FloatType, HalfFloatType, PerspectiveCamera, RGFormat, Texture } from 'three/webgpu';
import { texture } from 'three/tsl';
import { denoise, temporalDenoise } from '../../../../examples/jsm/tsl/display/DenoiseNode.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'TSL', () => {

		QUnit.module( 'DenoiseNode', () => {

			const camera = new PerspectiveCamera();
			const input = () => texture( new Texture() );
			const screen = () => ( { depth: texture( new DepthTexture( 4, 4 ) ), normal: input(), camera } );

			// the bytes per sample of the textures of a render target, with the alignment of each format

			const bytesPerSample = ( target ) => target.textures.reduce( ( bytes, t ) => {

				const component = t.type === FloatType ? 4 : 2;
				const size = component * ( t.format === RGFormat ? 2 : 4 );
				return Math.ceil( bytes / component ) * component + size;

			}, 0 );

			QUnit.test( 'Uses the fast preset by default', assert => {

				const node = temporalDenoise( input(), { ...screen(), velocity: input() } );
				assert.strictEqual( node.quality, 'fast', 'fast by default' );
				assert.strictEqual( node.iterations, 2, 'two passes' );
				assert.ok( node.temporal, 'temporal' );
				node.dispose();

				const quality = denoise( input(), { ...screen(), quality: 'quality' } );
				assert.strictEqual( quality.iterations, 3, 'three passes in screen space' );
				assert.notOk( quality.temporal, 'spatial' );
				quality.dispose();

			} );

			QUnit.test( 'Rejects missing or unsupported guides', assert => {

				assert.throws( () => denoise( input(), { camera } ), /depth and camera/, 'screen space needs depth' );
				assert.throws( () => denoise( input(), { depth: texture( new DepthTexture( 4, 4 ) ) } ), /depth and camera/, 'screen space needs a camera' );
				assert.throws( () => denoise( input(), { ...screen(), variance: input() } ), /no variance/, 'no variance in screen space' );
				assert.throws( () => temporalDenoise( input(), screen() ), /velocity/, 'temporal needs velocity' );
				assert.throws( () => denoise( input(), { position: input() } ), /Texture space/, 'texture space needs normals' );
				assert.throws( () => denoise( input(), { position: input(), normal: input(), alpha: true } ), /Texture space/, 'no alpha in texture space' );

			} );

			QUnit.test( 'Denoises light maps in their uv channel with two render targets', assert => {

				const lightMap = new Texture();
				lightMap.channel = 1;

				const node = denoise( texture( lightMap ), { position: input(), normal: input(), variance: input(), quality: 'quality' } );
				assert.strictEqual( node.iterations, 4, 'four passes in texture space' );
				assert.strictEqual( node._renderTarget, null, 'no separate output' );
				assert.strictEqual( node.getTexture().channel, 1, 'output channel' );
				assert.strictEqual( node.getTexture().type, HalfFloatType, 'output type' );
				assert.strictEqual( node.getTextureNode().value, node.getTexture(), 'texture node' );
				node.dispose();

			} );

			QUnit.test( 'Keeps its render targets within 8 attachments and 32 bytes per sample', assert => {

				const configs = {
					'ssgi': () => temporalDenoise( input(), { ...screen(), velocity: input(), alpha: true } ),
					'ssgi quality': () => temporalDenoise( input(), { ...screen(), velocity: input(), alpha: true, quality: 'quality' } ),
					'ssr': () => temporalDenoise( input(), { ...screen(), velocity: input(), roughness: input(), hitDistance: input() } ),
					'ssr coverage': () => temporalDenoise( input(), { ...screen(), velocity: input(), roughness: input(), hitDistance: input(), coverage: true } ),
					'spatial': () => denoise( input(), { ...screen(), alpha: true, roughness: input() } ),
					'spatial without normals': () => denoise( input(), { depth: texture( new DepthTexture( 4, 4 ) ), normal: null, camera } )
				};

				for ( const name in configs ) {

					const node = configs[ name ]();
					const targets = [ ...node._targets, node._renderTarget, node._prepareTarget, ...( node._historyTargets || [] ) ].filter( ( target ) => target !== null );

					for ( const target of targets ) {

						assert.ok( target.textures.length <= 8, `${ name }: ${ target.texture.name } attachments` );
						assert.ok( bytesPerSample( target ) <= 32, `${ name }: ${ target.texture.name } bytes per sample` );

					}

					node.dispose();

				}

			} );

		} );

	} );

} );
