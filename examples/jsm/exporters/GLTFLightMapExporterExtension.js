import { Color, LinearSRGBColorSpace, NoColorSpace, RGBAFormat, Source, SRGBColorSpace, UnsignedByteType } from 'three';

/**
 * A glTF exporter plugin for the proposed extension `KHR_lightmap` (glTF 2.1).
 * Light maps are exported as linear irradiance RGB. sRGB images are decoded
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
		this.name = 'KHR_lightmap';
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
		if ( map.matrixAutoUpdate && map.rotation !== 0 && map.repeat.x !== map.repeat.y ) {

			throw new Error( 'KHR_lightmap: Bake rotated nonuniform Three.js texture transforms into UVs before exporting.' );

		}

		const lightmapTexture = {
			index: await this.writer.processTextureAsync( await this.getLinearTextureAsync( map ) ),
			texCoord: map.channel
		};
		this.writer.applyTextureTransform( lightmapTexture, map );
		const transform = lightmapTexture.extensions?.KHR_texture_transform;
		if ( transform?.rotation !== undefined ) transform.rotation = - transform.rotation;
		materialDef.extensions = materialDef.extensions || {};
		materialDef.extensions[ this.name ] = { lightmapTexture, intensity: material.lightMapIntensity };
		this.writer.extensionsUsed[ this.name ] = true;

	}

	writeNode( object, nodeDef ) {

		if ( ! object.isInstancedMesh ) return;
		const names = { _LIGHTMAP_OFFSET: 2, _LIGHTMAP_SCALE: 2, _LIGHTMAP_ROTATION: 1 };
		for ( const name in names ) {

			const attribute = object.geometry.getAttribute( name );
			if ( ! attribute ) continue;
			const materials = Array.isArray( object.material ) ? object.material : [ object.material ];
			if ( ! materials.some( material => material.lightMap ) || ! attribute.isInstancedBufferAttribute || attribute.itemSize !== names[ name ] || attribute.normalized || ! ( attribute.array instanceof Float32Array ) || attribute.count !== object.count || attribute.meshPerAttribute !== 1 || ! attribute.array.every( Number.isFinite ) ) {

				throw new Error( 'KHR_lightmap: Invalid instance atlas attribute.' );

			}

			nodeDef.extensions.EXT_mesh_gpu_instancing.attributes[ name ] = this.writer.processAccessor( attribute );
			this.writer.extensionsUsed[ this.name ] = true;

		}

	}

	afterParse() {

		if ( ! this.writer.extensionsUsed[ this.name ] ) return;
		this.writer.json.asset.version = '2.1';
		this.writer.json.asset.minVersion = '2.1';

	}

	/**
	 * Prepares a linear image without changing the source texture.
	 *
	 * @private
	 * @param {Texture} map - The light map.
	 * @return {Promise<Texture>} The texture to export.
	 */
	async getLinearTextureAsync( map ) {

		if ( ! map.isCompressedTexture && map.image.data !== undefined && ( map.format !== RGBAFormat || map.type !== UnsignedByteType ) ) {

			throw new Error( 'KHR_lightmap: Data textures must use unsigned byte RGBA data. Normalize HDR irradiance and store its scale in lightMapIntensity before exporting.' );

		}
		if ( map.colorSpace === LinearSRGBColorSpace || map.colorSpace === NoColorSpace ) return map;
		if ( this.textureCache.has( map ) ) return this.textureCache.get( map );

		if ( map.colorSpace !== SRGBColorSpace ) {

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

			color.setRGB( data[ i ] / 255, data[ i + 1 ] / 255, data[ i + 2 ] / 255 ).convertSRGBToLinear();
			data[ i ] = Math.round( color.r * 255 );
			data[ i + 1 ] = Math.round( color.g * 255 );
			data[ i + 2 ] = Math.round( color.b * 255 );

		}

		if ( outputImage.getContext ) {

			outputImage.getContext( '2d' ).putImageData( new ImageData( data, image.width, image.height ), 0, 0 );

		}

		const texture = readableMap.clone();
		texture.source = new Source( outputImage );
		texture.colorSpace = LinearSRGBColorSpace;
		this.textureCache.set( map, texture );
		return texture;

	}

}

export { GLTFLightMapExporterExtension };

