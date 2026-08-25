import { DataTexture, DataUtils, HalfFloatType, LinearFilter, RepeatWrapping, RGBAFormat } from 'three';

/**
 * Packs a flat array of `channels`-per-texel float values (`channels` may be
 * less than 4, e.g. a single-channel roughness grid) into an RGBA half-float
 * `Uint16Array`, zero-padding any channel beyond `channels`.
 */
function packHalfFloatRGBA( data, channels = 4 ) {

	const texelCount = data.length / channels;
	const packed = new Uint16Array( texelCount * 4 );

	for ( let p = 0; p < texelCount; p ++ ) {

		for ( let c = 0; c < 4; c ++ ) {

			const value = c < channels ? data[ p * channels + c ] : 0;
			packed[ p * 4 + c ] = DataUtils.toHalfFloat( value );

		}

	}

	return packed;

}

/**
 * Builds an RGBA16F `DataTexture` from a flat float array, pre-configured
 * for bilinear-filtered, tileable latent-grid sampling: half-float (not
 * full float, since RGBA32F isn't filterable under WebGPU without an opt-in
 * feature), repeat wrap, linear filtering, no mipmaps.
 */
function createHalfFloatLatentTexture( data, width, height, { channels = 4, wrap = RepeatWrapping } = {} ) {

	const packed = packHalfFloatRGBA( data, channels );
	const texture = new DataTexture( packed, width, height, RGBAFormat, HalfFloatType );

	texture.wrapS = wrap;
	texture.wrapT = wrap;
	texture.magFilter = LinearFilter;
	texture.minFilter = LinearFilter;
	texture.generateMipmaps = false;
	texture.needsUpdate = true;

	return texture;

}

export { packHalfFloatRGBA, createHalfFloatLatentTexture };
