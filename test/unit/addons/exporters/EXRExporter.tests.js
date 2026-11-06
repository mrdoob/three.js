import { assert, describe, test } from 'vitest';

import { DataTexture, FloatType, RGBAFormat } from 'three';
import { EXRExporter, NO_COMPRESSION, RLE_COMPRESSION, ZIPS_COMPRESSION, ZIP_COMPRESSION, PIZ_COMPRESSION } from '../../../../examples/jsm/exporters/EXRExporter.js';
import { EXRLoader } from '../../../../examples/jsm/loaders/EXRLoader.js';

function createTexture( width, height, noise ) {

	const data = new Float32Array( width * height * 4 );

	for ( let i = 0; i < data.length; i ++ ) {

		data[ i ] = noise ? ( ( i * 7919 ) % 1000 ) / 250 : Math.floor( i / ( width * 4 ) ) / 8;

	}

	return new DataTexture( data, width, height, RGBAFormat, FloatType );

}

async function roundTrip( texture, compression ) {

	const exr = await new EXRExporter().parse( texture, { compression, type: FloatType } );

	return new EXRLoader().setDataType( FloatType ).parse( exr.buffer );

}

describe( 'Addons', () => {

	describe( 'Exporters', () => {

		describe( 'EXRExporter', () => {

			const compressions = { NO_COMPRESSION, RLE_COMPRESSION, ZIPS_COMPRESSION, ZIP_COMPRESSION, PIZ_COMPRESSION };

			for ( const name in compressions ) {

				test( `round trip (${ name })`, async () => {

					// 17 lines leaves a partial last block with ZIP_COMPRESSION (16 lines per block).
					// Noisy data does not shrink when compressed and must be stored uncompressed.

					for ( const [ width, height ] of [[ 5, 16 ], [ 5, 17 ], [ 64, 15 ], [ 33, 70 ]] ) {

						for ( const noise of [ false, true ] ) {

							const texture = createTexture( width, height, noise );
							const result = await roundTrip( texture, compressions[ name ] );

							assert.deepEqual(
								[ result.width, result.height, Array.from( result.data ) ],
								[ width, height, Array.from( texture.image.data ) ],
								`${ width }x${ height } ${ noise ? 'noise' : 'gradient' }`
							);

						}

					}

				} );

			}

			test( 'round trip (PIZ_COMPRESSION, 16-bit wavelet)', async () => {

				const width = 256, height = 32;
				const data = new Float32Array( width * height * 4 );

				for ( let i = 0; i < data.length; i ++ ) data[ i ] = 1 + i * 2 ** - 23;

				const texture = new DataTexture( data, width, height, RGBAFormat, FloatType );
				const result = await roundTrip( texture, PIZ_COMPRESSION );

				assert.deepEqual( Array.from( result.data ), Array.from( data ) );

			} );

		} );

	} );

} );
