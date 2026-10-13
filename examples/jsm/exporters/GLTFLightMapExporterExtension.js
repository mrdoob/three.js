import { Color, LinearSRGBColorSpace, NoColorSpace, RGBAFormat, Source, SRGBColorSpace, UnsignedByteType } from 'three';

/**
 * A glTF exporter plugin for the vendor extension `MOZ_lightmap`.
 * Light maps are exported as sRGB-encoded RGB. Linear images are converted
 * without modifying the source texture. Linear data textures must use
 * unsigned byte RGBA data, with HDR scale stored in lightMapIntensity.
 * Compressed textures require GLTFExporter.setTextureUtils().
 *
 * ```js
 * exporter.register( writer => new GLTFLightMapExporterExtension( writer ) );
 * ```
 *
 * @three_import import { GLTFLightMapExporterExtension } from 'three/addons/exporters/GLTFLightMapExporterExtension.js';
 */
class GLTFLightMapExporterExtension {

	/**
	 * Constructs a light map exporter plugin.
	 *
	 * @param {GLTFWriter} writer - The glTF writer.
	 */
	constructor( writer ) {

		this.writer = writer;
		this.name = 'MOZ_lightmap';
		this.textureCache = new Map();

	}

	/**
	 * Writes a material's light map.
	 *
	 * @param {Material} material - The material.
	 * @param {Object} materialDef - The glTF material definition.
	 * @return {Promise<void>} Resolves after the light map has been written.
	 */
	async writeMaterialAsync( material, materialDef ) {

		const map = material.lightMap;
		if ( ! map ) return;

		const extension = {
			index: await this.writer.processTextureAsync( await this.getSRGBTextureAsync( map ) ),
			texCoord: map.channel,
			// Convert MeshBasicMaterial's light map intensity to MOZ_lightmap's unlit normalization.
			intensity: material.isMeshBasicMaterial ? material.lightMapIntensity / Math.PI : material.lightMapIntensity
		};

		this.writer.applyTextureTransform( extension, map );
		materialDef.extensions = materialDef.extensions || {};
		materialDef.extensions[ this.name ] = extension;
		this.writer.extensionsUsed[ this.name ] = true;

	}

	/**
	 * Prepares an sRGB image without changing the source texture.
	 *
	 * @private
	 * @param {Texture} map - The light map.
	 * @return {Promise<Texture>} The texture to export.
	 */
	async getSRGBTextureAsync( map ) {

		if ( map.colorSpace === SRGBColorSpace ) return map;
		if ( this.textureCache.has( map ) ) return this.textureCache.get( map );

		if ( map.colorSpace !== LinearSRGBColorSpace && map.colorSpace !== NoColorSpace ) {

			throw new Error( 'GLTFLightMapExporterExtension: Unsupported light map color space.' );

		}

		const readableMap = map.isCompressedTexture ? await this.writer.decompressTextureAsync( map, this.writer.options.maxTextureSize ) : map;
		const image = readableMap.image;
		let outputImage;
		let data;

		if ( image.data !== undefined ) {

			if ( readableMap.format !== RGBAFormat || readableMap.type !== UnsignedByteType ) {

				throw new Error( 'GLTFLightMapExporterExtension: Linear data textures must use unsigned byte RGBA data. Normalize HDR values and store the scale in lightMapIntensity.' );

			}

			data = new Uint8ClampedArray( image.data );
			outputImage = { data, width: image.width, height: image.height };

		} else {

			const canvas = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas( image.width, image.height ) : document.createElement( 'canvas' );
			canvas.width = image.width;
			canvas.height = image.height;
			const context = canvas.getContext( '2d', { willReadFrequently: true } );
			context.drawImage( image, 0, 0 );
			const imageData = context.getImageData( 0, 0, image.width, image.height );
			data = imageData.data;
			outputImage = canvas;

		}

		const color = new Color();

		for ( let i = 0; i < data.length; i += 4 ) {

			color.setRGB( data[ i ] / 255, data[ i + 1 ] / 255, data[ i + 2 ] / 255 ).convertLinearToSRGB();
			data[ i ] = Math.round( color.r * 255 );
			data[ i + 1 ] = Math.round( color.g * 255 );
			data[ i + 2 ] = Math.round( color.b * 255 );

		}

		if ( outputImage.getContext ) {

			outputImage.getContext( '2d' ).putImageData( new ImageData( data, image.width, image.height ), 0, 0 );

		}

		const texture = readableMap.clone();
		texture.source = new Source( outputImage );
		texture.colorSpace = SRGBColorSpace;
		this.textureCache.set( map, texture );
		return texture;

	}

}

export { GLTFLightMapExporterExtension };
