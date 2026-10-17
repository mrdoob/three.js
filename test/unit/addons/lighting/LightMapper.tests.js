import { FloatType, Group, LinearSRGBColorSpace, Mesh, MeshBasicMaterial, PlaneGeometry, Texture } from 'three/webgpu';
import { vec3 } from 'three/tsl';
import { LightMapper } from '../../../../examples/jsm/lighting/LightMapper.js';
import { readLightMap } from '../../../../examples/jsm/utils/readLightMap.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Lighting', () => {

		QUnit.module( 'LightMapper', () => {

			QUnit.test( 'Readback preserves linear HDR irradiance and atlas bindings', async assert => {

				const map = new Texture( { width: 1, height: 1 } );
				map.type = FloatType;
				map.channel = 1;
				map.offset.set( 0.25, 0.5 );
				map.repeat.set( 0.5, 0.25 );
				map.rotation = Math.PI / 2;
				const renderer = {
					initRenderTarget: () => {},
					copyTextureToTexture: () => {},
					readRenderTargetPixelsAsync: async () => new Float32Array( [ 4, 2, 0, NaN ] )
				};
				const result = await readLightMap( renderer, map );
				assert.strictEqual( result.intensity, 4, 'Normalization restores irradiance above one without a pi conversion' );
				assert.deepEqual( Array.from( result.texture.image.getContext( '2d' ).getImageData( 0, 0, 1, 1 ).data ), [ 255, 128, 0, 255 ], 'Linear RGB is normalized, and alpha is ignored' );
				assert.strictEqual( result.texture.colorSpace, LinearSRGBColorSpace );
				assert.strictEqual( result.texture.channel, 1 );
				assert.deepEqual( result.texture.offset.toArray(), map.offset.toArray() );
				assert.deepEqual( result.texture.repeat.toArray(), map.repeat.toArray() );
				assert.strictEqual( result.texture.rotation, map.rotation );
				result.texture.dispose();
				map.dispose();

			} );

			QUnit.test( 'Readback rejects invalid irradiance and releases its render target', async assert => {

				const map = new Texture( { width: 1, height: 1 } );
				map.type = FloatType;
				let disposed;
				let sample;
				const renderer = {
					initRenderTarget: target => {

						disposed = false;
						target.addEventListener( 'dispose', () => disposed = true );

					},
					copyTextureToTexture: () => {},
					readRenderTargetPixelsAsync: async () => new Float32Array( [ sample, 1, 1, 1 ] )
				};
				for ( sample of [ - 1, Infinity, NaN ] ) {

					await assert.rejects( readLightMap( renderer, map ), /finite and nonnegative/ );
					assert.true( disposed, 'Readback target is disposed before validating samples' );

				}

				renderer.readRenderTargetPixelsAsync = async () => {

					throw new Error( 'Readback failed' );

				};

				await assert.rejects( readLightMap( renderer, map ), /Readback failed/ );
				assert.true( disposed, 'Failed GPU readback also releases the target' );
				map.dispose();

			} );

			QUnit.test( 'Uses current world transforms without rendering the source scene first', assert => {

				const parent = new Group();
				parent.position.set( 2, 3, 4 );
				const geometry = new PlaneGeometry();
				geometry.setAttribute( 'uv1', geometry.getAttribute( 'uv' ).clone() );
				const material = new MeshBasicMaterial();
				const mesh = new Mesh( geometry, material );
				mesh.position.set( 5, 6, 7 );
				parent.add( mesh );
				let bakedPosition;
				const renderer = {
					autoClear: true,
					getRenderTarget: () => null,
					getActiveCubeFace: () => 0,
					getActiveMipmapLevel: () => 0,
					getRenderObjectFunction: () => null,
					getPixelRatio: () => 1,
					getMRT: () => null,
					getClearColor: value => value.set( 0 ),
					getClearAlpha: () => 1,
					getScissorTest: () => false,
					setRenderTarget: () => {},
					setRenderObjectFunction: () => {},
					setPixelRatio: () => {},
					setMRT: () => {},
					setClearColor: () => {},
					setScissorTest: () => {},
					clear: () => {},
					render: scene => {

						if ( scene.isScene ) bakedPosition = scene.children[ 0 ].matrix.elements.slice( 12, 15 );

					}
				};
				const mapper = new LightMapper( renderer, 32, () => vec3( 1 ) );
				mapper.addObjects( [ mesh ] );
				mapper.update();
				assert.deepEqual( bakedPosition, [ 7, 9, 11 ] );
				mapper.dispose();
				geometry.dispose();
				material.dispose();

			} );

		} );

	} );

} );
