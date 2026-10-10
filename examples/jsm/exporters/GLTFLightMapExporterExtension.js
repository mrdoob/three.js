import { DataUtils, FloatType, HalfFloatType, LinearSRGBColorSpace, NoColorSpace, RenderTarget, RGBAFormat, Texture, UnsignedByteType } from 'three';

/**
 * A glTF exporter plugin for the vendor extension `MOZ_lightmap`.
 * Light maps must contain linear irradiance. Float and half-float RGBA textures
 * are scaled into an 8-bit linear PNG, with the scale stored in the intensity.
 * This preserves HDR range with 8-bit precision. GPU render target textures
 * require an initialized WebGPURenderer for readback.
 *
 * ```js
 * exporter.register( writer => new GLTFLightMapExporterExtension( writer, { renderer } ) );
 * ```
 *
 * @three_import import { GLTFLightMapExporterExtension } from 'three/addons/exporters/GLTFLightMapExporterExtension.js';
 */
class GLTFLightMapExporterExtension {

	/**
	 * Constructs a light map exporter plugin.
	 *
	 * @param {GLTFWriter} writer - The glTF writer.
	 * @param {Object} [options] - Export options.
	 * @param {?WebGPURenderer} [options.renderer=null] - Renderer owning GPU light maps.
	 */
	constructor( writer, { renderer = null } = {} ) {

		this.writer = writer;
		this.renderer = renderer;
		this.name = 'MOZ_lightmap';
		this._textures = new Map();

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

		if ( ! this._textures.has( map ) ) this._textures.set( map, this._writeTexture( map ) );
		const { index, scale } = await this._textures.get( map );

		const extension = {
			index,
			texCoord: map.channel,
			intensity: material.lightMapIntensity * scale
		};

		this.writer.applyTextureTransform( extension, map );
		materialDef.extensions = materialDef.extensions || {};
		materialDef.extensions[ this.name ] = extension;
		this.writer.extensionsUsed[ this.name ] = true;

	}

	async _writeTexture( map ) {

		if ( map.colorSpace !== NoColorSpace && map.colorSpace !== LinearSRGBColorSpace ) {

			throw new Error( 'GLTFLightMapExporterExtension: Light maps must use linear color space.' );

		}

		let image = map.image;

		if ( map.isRenderTargetTexture ) {

			const renderer = this.renderer;
			if ( ! renderer?.isWebGPURenderer ) throw new Error( 'GLTFLightMapExporterExtension: GPU light maps require a WebGPURenderer.' );

			const target = new RenderTarget( image.width, image.height, { type: map.type, format: map.format, depthBuffer: false } );

			try {

				renderer.initRenderTarget( target );
				renderer.copyTextureToTexture( map, target.texture );
				const data = await renderer.readRenderTargetPixelsAsync( target, 0, 0, image.width, image.height );
				image = { data, width: image.width, height: image.height };

			} finally {

				target.dispose();

			}

		}

		let scale = 1;
		let texture = map;

		if ( image.data !== undefined && ( map.type === FloatType || map.type === HalfFloatType ) ) {

			if ( map.format !== RGBAFormat ) throw new Error( 'GLTFLightMapExporterExtension: Float light maps must use RGBAFormat.' );

			const decode = map.type === HalfFloatType ? DataUtils.fromHalfFloat : value => value;
			const data = image.data;

			for ( let i = 0; i < data.length; i ++ ) {

				if ( i % 4 === 3 ) continue;
				const value = decode( data[ i ] );
				if ( ! Number.isFinite( value ) || value < 0 ) throw new Error( 'GLTFLightMapExporterExtension: Irradiance must be finite and nonnegative.' );
				scale = Math.max( scale, value );

			}

			const bytes = new Uint8Array( data.length );
			for ( let i = 0; i < bytes.length; i ++ ) bytes[ i ] = i % 4 === 3 ? 255 : Math.round( decode( data[ i ] ) / scale * 255 );
			image = { data: bytes, width: image.width, height: image.height };

		} else if ( map.type !== UnsignedByteType ) {

			throw new Error( 'GLTFLightMapExporterExtension: Unsupported light map type.' );

		}

		if ( image.data !== undefined ) {

			if ( map.format !== RGBAFormat ) throw new Error( 'GLTFLightMapExporterExtension: Data light maps must use RGBAFormat.' );

			// Export through a canvas so flipY also applies to data textures.
			const canvas = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas( image.width, image.height ) : document.createElement( 'canvas' );
			canvas.width = image.width;
			canvas.height = image.height;
			canvas.getContext( '2d' ).putImageData( new ImageData( new Uint8ClampedArray( image.data ), image.width, image.height ), 0, 0 );
			texture = new Texture( canvas );
			for ( const property of [ 'name', 'flipY', 'minFilter', 'magFilter', 'wrapS', 'wrapT' ] ) texture[ property ] = map[ property ];

		}

		return { index: await this.writer.processTextureAsync( texture ), scale };

	}

}

export { GLTFLightMapExporterExtension };
