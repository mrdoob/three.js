import { DataUtils, HalfFloatType, LinearSRGBColorSpace, RenderTarget, Texture } from 'three';

/**
 * Reads a baked GPU light map into a normalized linear canvas texture.
 * The returned intensity restores the HDR irradiance range when exporting KHR_lightmap.
 * RGB samples remain linear; no sRGB encoding or division by pi is applied.
 * The 8-bit PNG export loses precision in dark regions; use an HDR image-format
 * extension when this normalization does not provide sufficient bake quality.
 * The caller owns the returned texture and should dispose it after export.
 *
 * @three_import import { readLightMap } from 'three/addons/utils/readLightMap.js';
 *
 * @param {WebGPURenderer} renderer - The renderer owning the light map.
 * @param {Texture} map - The baked light map.
 * @return {Promise<{texture: Texture, intensity: number}>} The normalized map and HDR scale.
 */
async function readLightMap( renderer, map ) {

	const { width, height } = map.image;
	const target = new RenderTarget( width, height, { type: map.type, format: map.format, depthBuffer: false } );

	let data;

	try {

		renderer.initRenderTarget( target );
		renderer.copyTextureToTexture( map, target.texture );
		data = await renderer.readRenderTargetPixelsAsync( target, 0, 0, width, height );

	} finally {

		target.dispose();

	}

	const decode = map.type === HalfFloatType ? DataUtils.fromHalfFloat : value => value;
	let intensity = 1;

	for ( let i = 0; i < data.length; i ++ ) {

		if ( i % 4 === 3 ) continue;
		const value = decode( data[ i ] );
		if ( ! Number.isFinite( value ) || value < 0 ) {

			throw new Error( 'readLightMap: KHR_lightmap irradiance must be finite and nonnegative.' );

		}

		intensity = Math.max( intensity, value );

	}

	const bytes = new Uint8ClampedArray( data.length );
	for ( let i = 0; i < bytes.length; i ++ ) bytes[ i ] = i % 4 === 3 ? 255 : Math.round( decode( data[ i ] ) / intensity * 255 );

	const canvas = document.createElement( 'canvas' );
	canvas.width = width;
	canvas.height = height;
	canvas.getContext( '2d' ).putImageData( new ImageData( bytes, width, height ), 0, 0 );

	const texture = new Texture( canvas );
	for ( const property of [ 'name', 'flipY', 'channel', 'minFilter', 'magFilter', 'wrapS', 'wrapT' ] ) texture[ property ] = map[ property ];
	texture.offset.copy( map.offset );
	texture.repeat.copy( map.repeat );
	texture.center.copy( map.center );
	texture.rotation = map.rotation;
	texture.matrix.copy( map.matrix );
	texture.matrixAutoUpdate = map.matrixAutoUpdate;
	texture.colorSpace = LinearSRGBColorSpace;
	return { texture, intensity };

}

export { readLightMap };
