import { DataTexture, FloatType, NodeMaterial, QuadMesh, RenderTarget, RendererUtils, TextureLoader, Vector2 } from 'three/webgpu';
import { context, uniform } from 'three/tsl';
import { fastNoise } from '../../../../examples/jsm/tsl/utils/FASTNoise.js';
import { getSharedRenderer } from '../../src/nodes/tsl/gpu-test-utils.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'TSL', () => {

		QUnit.module( 'FASTNoise', () => {

			QUnit.test( 'integer atlas addressing wraps space and time without mixing slices', async assert => {

				const renderer = await getSharedRenderer( 'webgpu' );
				if ( ! renderer ) {

					assert.ok( true, 'SKIPPED: WebGPU unavailable' );
					return;

				}

				const data = new Uint8Array( 256 * 4096 * 4 );
				for ( let frame = 0; frame < 32; frame ++ ) for ( let y = 0; y < 128; y ++ ) for ( let x = 0; x < 256; x ++ ) {

					const i = 4 * ( ( frame * 128 + y ) * 256 + x );
					data.set( x < 128 ? [ x, y, frame * 8, 255 ] : [ 255 - frame, 0, 0, 255 ], i );

				}

				const atlas = new DataTexture( data, 256, 4096 );
				atlas.needsUpdate = true;
				const index = uniform( 0, 'uint' );
				const material = new NodeMaterial();
				material.fragmentNode = fastNoise( atlas, new Vector2( 11, 23 ), index );
				const target = new RenderTarget( 132, 130, { type: FloatType, depthBuffer: false } );
				const quad = new QuadMesh( material );
				const state = RendererUtils.saveRendererState( renderer );
				const previousContext = renderer.contextNode;
				try {

					renderer.contextNode = context();
					for ( const frame of [ 0, 1, 31, 32, 63 ] ) {

						index.value = frame;
						renderer.setRenderTarget( target );
						quad.render( renderer );
						const pixels = await renderer.readRenderTargetPixelsAsync( target, 0, 0, 132, 130 );
						let maximumError = 0;
						for ( let y = 0; y < 130; y ++ ) for ( let x = 0; x < 132; x ++ ) {

							const expected = [ ( x + 11 ) % 128, ( y + 23 ) % 128, ( frame % 32 ) * 8, 255 - frame % 32 ];
							for ( let c = 0; c < 4; c ++ ) maximumError = Math.max( maximumError, Math.abs( pixels[ 4 * ( y * 132 + x ) + c ] - ( expected[ c ] + 0.5 ) / 256 ) );

						}

						assert.ok( maximumError < 1e-6, `Frame ${ frame } reads the expected pixel, slice and byte-bin center (maximum error ${ maximumError })` );

					}

				} finally {

					renderer.contextNode = previousContext;
					RendererUtils.restoreRendererState( renderer, state );
					atlas.dispose(); material.dispose(); target.dispose();

				}

			} );

			QUnit.test( 'PNG upload preserves scalar bytes and temporal orientation', async assert => {

				const renderer = await getSharedRenderer( 'webgpu' );
				if ( ! renderer ) {

					assert.ok( true, 'SKIPPED: WebGPU unavailable' );
					return;

				}

				const atlas = await new TextureLoader().loadAsync( '../../examples/textures/noises/fast/gauss1-ema01-product.png' );
				atlas.flipY = false;
				atlas.generateMipmaps = false;
				const index = uniform( 0, 'uint' );
				const material = new NodeMaterial();
				material.fragmentNode = fastNoise( atlas, new Vector2(), index );
				const target = new RenderTarget( 1, 1, { type: FloatType, depthBuffer: false } );
				const state = RendererUtils.saveRendererState( renderer );
				const previousContext = renderer.contextNode;
				try {

					renderer.contextNode = context();
					// Independently decoded source PNG bytes at (0,0) in slices 0,1,31.
					const expected = { 0: [ 249, 62, 155, 201 ], 1: [ 205, 147, 37, 180 ], 31: [ 84, 33, 89, 72 ] };
					for ( const [ frame, bytes ] of Object.entries( expected ) ) {

						index.value = Number( frame );
						renderer.setRenderTarget( target );
						new QuadMesh( material ).render( renderer );
						const values = await renderer.readRenderTargetPixelsAsync( target, 0, 0, 1, 1 );
						assert.ok( bytes.every( ( value, c ) => Math.abs( values[ c ] - ( value + 0.5 ) / 256 ) < 1e-6 ), `Slice ${ frame } matches source bytes after browser PNG decoding and GPU upload` );

					}

				} finally {

					renderer.contextNode = previousContext;
					RendererUtils.restoreRendererState( renderer, state );
					atlas.dispose(); material.dispose(); target.dispose();

				}

			} );

		} );

	} );

} );
