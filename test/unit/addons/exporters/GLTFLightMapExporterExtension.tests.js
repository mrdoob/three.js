import { DataTexture, DataUtils, FloatType, HalfFloatType, Mesh, MeshStandardMaterial, PlaneGeometry, RenderTarget, SRGBColorSpace } from '../../../../src/Three.js';
import { GLTFExporter } from '../../../../examples/jsm/exporters/GLTFExporter.js';
import { GLTFLightMapExporterExtension } from '../../../../examples/jsm/exporters/GLTFLightMapExporterExtension.js';
import { GLTFLoader } from '../../../../examples/jsm/loaders/GLTFLoader.js';
import { GLTFLightMapLoaderExtension } from '../../../../examples/jsm/loaders/GLTFLightMapLoaderExtension.js';

function createMesh( map, intensity = 1 ) {

	map.channel = 1;
	const geometry = new PlaneGeometry();
	geometry.setAttribute( 'uv1', geometry.attributes.uv.clone() );
	return new Mesh( geometry, new MeshStandardMaterial( { lightMap: map, lightMapIntensity: intensity } ) );

}

function createExporter() {

	const exporter = new GLTFExporter();
	exporter.register( writer => new GLTFLightMapExporterExtension( writer ) );
	return exporter;

}

function readPixels( image ) {

	const canvas = document.createElement( 'canvas' );
	canvas.width = image.width;
	canvas.height = image.height;
	const context = canvas.getContext( '2d' );
	context.drawImage( image, 0, 0 );
	return context.getImageData( 0, 0, image.width, image.height ).data;

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Exporters', () => {

		QUnit.module( 'GLTFLightMapExporterExtension', () => {

			QUnit.test( 'HDR GLB round trip preserves effective irradiance', async assert => {

				const values = [ 2, 4, 8, 1, 1, 0.5, 0.25, 1 ];
				for ( const type of [ FloatType, HalfFloatType ] ) {

					const data = type === HalfFloatType ? new Uint16Array( values.map( DataUtils.toHalfFloat ) ) : new Float32Array( values );
					const map = new DataTexture( data, 1, 2 );
					map.type = type;
					const mesh = createMesh( map, 2 );
					const buffer = await createExporter().parseAsync( mesh, { binary: true } );
					const loader = new GLTFLoader();
					loader.register( parser => new GLTFLightMapLoaderExtension( parser ) );
					const gltf = await loader.parseAsync( buffer, '' );
					const material = gltf.scene.children[ 0 ].material;
					assert.strictEqual( material.lightMapIntensity, 16 );
					assert.strictEqual( material.lightMap.channel, 1 );
					const pixels = readPixels( material.lightMap.image );
					for ( let i = 0; i < pixels.length; i ++ ) {

						if ( i % 4 === 3 ) continue;
						assert.ok( Math.abs( pixels[ i ] / 255 * material.lightMapIntensity - values[ i ] * 2 ) <= 16 / 255, 'Irradiance survives PNG quantization' );

					}

					assert.deepEqual( Array.from( map.image.data ), Array.from( data ), 'Source pixels unchanged' );
					assert.strictEqual( mesh.material.lightMapIntensity, 2, 'Source intensity unchanged' );

				}

			} );

			QUnit.test( 'Shared atlas, transforms and zero intensity', async assert => {

				const map = new DataTexture( new Uint8Array( [ 64, 128, 255, 255 ] ), 1, 1 );
				map.offset.set( 0.25, 0.5 );
				map.repeat.set( 0.5, 0.75 );
				map.rotation = 0.2;
				const result = await createExporter().parseAsync( [ createMesh( map, 0 ), createMesh( map, 3 ) ] );
				assert.strictEqual( result.textures.length, 1, 'Shared atlas is embedded once' );
				assert.strictEqual( result.images.length, 1 );
				assert.ok( result.extensionsUsed.includes( 'MOZ_lightmap' ) );
				assert.ok( result.extensionsUsed.includes( 'KHR_texture_transform' ) );
				assert.notOk( result.extensionsRequired?.includes( 'MOZ_lightmap' ), 'Ordinary PBR remains a fallback' );
				const extension = result.materials[ 0 ].extensions.MOZ_lightmap;
				assert.strictEqual( extension.intensity, 0 );
				assert.strictEqual( extension.texCoord, 1 );
				assert.deepEqual( extension.extensions.KHR_texture_transform, { offset: [ 0.25, 0.5 ], scale: [ 0.5, 0.75 ], rotation: 0.2 } );
				assert.strictEqual( result.materials[ 1 ].extensions.MOZ_lightmap.index, extension.index );

			} );

			QUnit.test( 'Data texture orientation', async assert => {

				const map = new DataTexture( new Uint8Array( [ 255, 0, 0, 255, 0, 255, 0, 255 ] ), 1, 2 );
				map.flipY = true;
				const result = await createExporter().parseAsync( createMesh( map ) );
				const image = await createImageBitmap( await ( await fetch( result.images[ 0 ].uri ) ).blob() );
				assert.deepEqual( Array.from( readPixels( image ) ), [ 0, 255, 0, 255, 255, 0, 0, 255 ] );
				image.close();

			} );

			QUnit.test( 'Unsupported input fails explicitly', async assert => {

				const map = new DataTexture( new Uint8Array( [ 255, 255, 255, 255 ] ), 1, 1 );
				map.colorSpace = SRGBColorSpace;
				await assert.rejects( createExporter().parseAsync( createMesh( map ) ), /linear color space/ );
				const target = new RenderTarget( 2, 2 );
				await assert.rejects( createExporter().parseAsync( createMesh( target.texture ) ), /WebGPURenderer/ );
				target.dispose();

			} );

			QUnit.test( 'Materials without a light map', async assert => {

				const mesh = new Mesh( new PlaneGeometry(), new MeshStandardMaterial() );
				const result = await createExporter().parseAsync( mesh );
				assert.strictEqual( result.textures, undefined );
				assert.notOk( result.extensionsUsed?.includes( 'MOZ_lightmap' ) );

			} );

		} );

	} );

} );
