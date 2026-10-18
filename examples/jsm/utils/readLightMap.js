import { DataTexture, FloatType, HalfFloatType, LinearSRGBColorSpace, RenderTarget, RGBAFormat } from 'three';

/**
 * Reads a baked GPU light map back into a data texture with the same half float or float samples,
 * e.g. to export it with {@link GLTFLightMapExporterExtension}, which normalizes the irradiance and
 * stores it as a 16-bit or 8-bit sRGB PNG with the scale in the `KHR_lightmap` intensity.
 * RGB samples remain linear irradiance; no division by pi is applied.
 * The caller owns the returned texture and should dispose it after export.
 *
 * @three_import import { readLightMap } from 'three/addons/utils/readLightMap.js';
 *
 * @param {WebGPURenderer} renderer - The renderer owning the light map.
 * @param {Texture} map - The baked light map.
 * @return {Promise<DataTexture>} The light map samples with the bindings of the map.
 */
async function readLightMap( renderer, map ) {

	const { width, height } = map.image;
	const type = map.type === FloatType ? FloatType : HalfFloatType;
	const target = new RenderTarget( width, height, { type, format: RGBAFormat, depthBuffer: false } );

	let data;

	try {

		renderer.initRenderTarget( target );
		renderer.copyTextureToTexture( map, target.texture );
		data = await renderer.readRenderTargetPixelsAsync( target, 0, 0, width, height );

	} finally {

		target.dispose();

	}

	// half floats are finite without the maximum exponent, and nonnegative without the sign bit or as negative zero

	const valid = type === HalfFloatType ? ( value ) => ( value & 0x7c00 ) !== 0x7c00 && value <= 0x8000 : ( value ) => value >= 0 && value < Infinity;

	for ( let i = 0; i < data.length; i ++ ) {

		if ( i % 4 !== 3 && valid( data[ i ] ) === false ) throw new Error( 'readLightMap: KHR_lightmap irradiance must be finite and nonnegative.' );

	}

	const texture = new DataTexture( data, width, height, RGBAFormat, type );
	for ( const property of [ 'name', 'flipY', 'channel', 'minFilter', 'magFilter', 'wrapS', 'wrapT', 'generateMipmaps' ] ) texture[ property ] = map[ property ];
	texture.offset.copy( map.offset );
	texture.repeat.copy( map.repeat );
	texture.center.copy( map.center );
	texture.rotation = map.rotation;
	texture.matrix.copy( map.matrix );
	texture.matrixAutoUpdate = map.matrixAutoUpdate;
	texture.colorSpace = LinearSRGBColorSpace;
	texture.needsUpdate = true;
	return texture;

}

export { readLightMap };
