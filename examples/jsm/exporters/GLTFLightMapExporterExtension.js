import { DataUtils, FloatType, HalfFloatType, LinearSRGBColorSpace, NoColorSpace, RGBAFormat, SRGBColorSpace, UnsignedByteType } from 'three';

/**
 * A glTF exporter plugin for the proposed extension `KHR_lightmap` (glTF 2.0).
 * Light maps hold linear irradiance RGB. Half float and float RGBA data textures, e.g. from
 * {@link readLightMap}, are normalized by their maximum and stored as sRGB encoded PNGs with
 * 16 bits per channel by default, with the scale in the binding intensity. Loaders without 16-bit
 * PNG support decode them with 8 bits, like an 8-bit sRGB light map. sRGB images are stored
 * as they are, linear images and unsigned byte RGBA data textures too, and the binding `encoding`
 * tells loaders the transfer function. Compressed textures require GLTFExporter.setTextureUtils().
 *
 * The direction texture of a directional light map in `material.lightMapDirection`, see
 * `directionalLightMap()`, is written as the optional binding `directionTexture`. It stores the
 * luminance-weighted average direction to the incident light in the world space of the scene,
 * linear and encoded like a normal map, `direction = rgb * 2 - 1`, as an 8-bit PNG. The length
 * of the direction is the directionality, from 0 for light from all directions to 1 for light from
 * one direction. It uses the UVs and the texture transform of `lightmapTexture`.
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
	 * @param {Object} [options] - The export options.
	 * @param {number} [options.bitDepth=16] - The bits per channel of HDR light maps, 16 or 8.
	 */
	constructor( writer, { bitDepth = 16 } = {} ) {

		if ( bitDepth !== 16 && bitDepth !== 8 ) throw new Error( 'KHR_lightmap: The bit depth must be 16 or 8.' );

		this.writer = writer;
		this.name = 'KHR_lightmap';
		this.bitDepth = bitDepth;
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
		if ( ! Number.isFinite( material.lightMapIntensity ) || material.lightMapIntensity < 0 ) throw new Error( 'KHR_lightmap: Invalid binding intensity.' );
		if ( map.matrixAutoUpdate && map.rotation !== 0 && map.repeat.x !== map.repeat.y ) {

			throw new Error( 'KHR_lightmap: Bake rotated nonuniform Three.js texture transforms into UVs before exporting.' );

		}

		if ( ! this.textureCache.has( map ) ) this.textureCache.set( map, this.processLightMapAsync( map ) );
		const { index, scale, encoding } = await this.textureCache.get( map );

		const lightmapTexture = { index, texCoord: map.channel };
		this.writer.applyTextureTransform( lightmapTexture, map );
		const transform = lightmapTexture.extensions?.KHR_texture_transform;
		if ( transform?.rotation !== undefined ) transform.rotation = - transform.rotation;
		materialDef.extensions = materialDef.extensions || {};
		materialDef.extensions[ this.name ] = { lightmapTexture, intensity: material.lightMapIntensity * scale };
		if ( encoding !== 'linear' ) materialDef.extensions[ this.name ].encoding = encoding;
		this.writer.extensionsUsed[ this.name ] = true;

		const direction = material.lightMapDirection;

		if ( direction ) {

			if ( ! this.textureCache.has( direction ) ) this.textureCache.set( direction, this.processDirectionTextureAsync( direction ) );

			const { index } = await this.textureCache.get( direction );
			const directionTexture = { index, texCoord: lightmapTexture.texCoord };
			if ( lightmapTexture.extensions !== undefined ) directionTexture.extensions = structuredClone( lightmapTexture.extensions );
			materialDef.extensions[ this.name ].directionTexture = directionTexture;

		}

	}

	writeMesh( mesh ) {

		for ( const name of [ '_LIGHTMAP_OFFSET', '_LIGHTMAP_SCALE', '_LIGHTMAP_ROTATION', '_LIGHTMAP_INTENSITY' ] ) {

			const attribute = mesh.geometry.getAttribute( name );
			if ( attribute && ( ! mesh.isInstancedMesh || ! attribute.isInstancedBufferAttribute ) ) throw new Error( 'KHR_lightmap: Atlas attributes cannot be vertex attributes.' );

		}

	}

	writeNode( object, nodeDef ) {

		if ( ! object.isInstancedMesh ) return;
		const names = { _LIGHTMAP_OFFSET: 2, _LIGHTMAP_SCALE: 2, _LIGHTMAP_ROTATION: 1, _LIGHTMAP_INTENSITY: 1 };
		for ( const name in names ) {

			const attribute = object.geometry.getAttribute( name );
			if ( ! attribute ) continue;
			const materials = Array.isArray( object.material ) ? object.material : [ object.material ];
			if ( ! materials.some( material => material.lightMap ) || ! attribute.isInstancedBufferAttribute || attribute.itemSize !== names[ name ] || attribute.normalized || ! ( attribute.array instanceof Float32Array ) || attribute.count !== object.count || attribute.meshPerAttribute !== 1 || ! attribute.array.every( value => Number.isFinite( value ) && ( name !== '_LIGHTMAP_INTENSITY' || value >= 0 ) ) ) {

				throw new Error( 'KHR_lightmap: Invalid instance atlas attribute.' );

			}

			nodeDef.extensions.EXT_mesh_gpu_instancing.attributes[ name ] = this.writer.processAccessor( attribute );
			this.writer.extensionsUsed[ this.name ] = true;

		}

	}

	/**
	 * Writes the texture of a light map without changing it.
	 *
	 * @private
	 * @param {Texture} map - The light map.
	 * @return {Promise<{index: number, scale: number, encoding: string}>} The glTF texture, the scale of
	 * its samples and their transfer function.
	 */
	async processLightMapAsync( map ) {

		const writer = this.writer;
		const data = map.isCompressedTexture ? undefined : map.image.data;

		if ( data !== undefined && map.format === RGBAFormat && ( map.type === HalfFloatType || map.type === FloatType ) ) {

			if ( map.colorSpace !== LinearSRGBColorSpace && map.colorSpace !== NoColorSpace ) throw new Error( 'KHR_lightmap: HDR light maps must be linear.' );

			const { width, height } = map.image;
			const { image, scale } = encodeLightMap( data, map.type, width, height, this.bitDepth );
			const blob = await encodePNG( image, width, height, this.bitDepth );

			return { index: await this.processPNGAsync( blob, map ), scale, encoding: 'srgb' };

		}

		if ( data !== undefined && ( map.format !== RGBAFormat || map.type !== UnsignedByteType ) ) {

			throw new Error( 'KHR_lightmap: Data textures must use unsigned byte, half float or float RGBA data.' );

		}

		let encoding;

		if ( map.colorSpace === LinearSRGBColorSpace || map.colorSpace === NoColorSpace ) encoding = 'linear';
		else if ( map.colorSpace === SRGBColorSpace ) encoding = 'srgb';
		else throw new Error( 'GLTFLightMapExporterExtension: Unsupported light map color space.' );

		return { index: await writer.processTextureAsync( map ), scale: 1, encoding };

	}

	/**
	 * Writes the direction texture of a directional light map as an 8-bit PNG. Data textures, e.g.
	 * from {@link readLightMap}, are quantized, other textures are written as they are.
	 *
	 * @private
	 * @param {Texture} map - The encoded directions.
	 * @return {Promise<{index: number}>} The glTF texture.
	 */
	async processDirectionTextureAsync( map ) {

		const data = map.isCompressedTexture ? undefined : map.image.data;

		if ( map.colorSpace !== LinearSRGBColorSpace && map.colorSpace !== NoColorSpace ) throw new Error( 'KHR_lightmap: Direction textures must be linear.' );

		if ( data === undefined ) return { index: await this.writer.processTextureAsync( map ) };

		if ( map.format !== RGBAFormat || [ UnsignedByteType, HalfFloatType, FloatType ].includes( map.type ) === false ) {

			throw new Error( 'KHR_lightmap: Direction data textures must use unsigned byte, half float or float RGBA data.' );

		}

		const { width, height } = map.image;
		const image = new Uint8Array( width * height * 3 );
		const decode = map.type === HalfFloatType ? DataUtils.fromHalfFloat : map.type === UnsignedByteType ? ( value ) => value / 255 : ( value ) => value;

		for ( let i = 0; i < width * height; i ++ ) {

			for ( let c = 0; c < 3; c ++ ) image[ i * 3 + c ] = Math.round( Math.min( Math.max( decode( data[ i * 4 + c ] ), 0 ), 1 ) * 255 );

		}

		return { index: await this.processPNGAsync( await encodePNG( image, width, height, 8 ), map ) };

	}

	/**
	 * Writes a PNG as the image of a new glTF texture with the sampler of a texture.
	 *
	 * @private
	 * @param {Blob} blob - The PNG file.
	 * @param {Texture} map - The texture.
	 * @return {Promise<number>} The index of the glTF texture.
	 */
	async processPNGAsync( blob, map ) {

		const writer = this.writer;
		const json = writer.json;
		const imageDef = { mimeType: 'image/png' };

		if ( writer.options.binary === true ) {

			imageDef.bufferView = await writer.processBufferViewImage( blob );

		} else {

			imageDef.uri = await new Promise( ( resolve ) => {

				const reader = new FileReader();
				reader.onloadend = () => resolve( reader.result );
				reader.readAsDataURL( blob );

			} );

		}

		if ( ! json.images ) json.images = [];
		if ( ! json.textures ) json.textures = [];

		const textureDef = { sampler: writer.processSampler( map ), source: json.images.push( imageDef ) - 1 };
		if ( map.name ) textureDef.name = map.name;

		return json.textures.push( textureDef ) - 1;

	}

}

/**
 * Normalizes linear irradiance by its maximum and encodes it with the sRGB transfer function into
 * RGB samples of 16 or 8 bits.
 *
 * @private
 * @param {Uint16Array|Float32Array} data - The half float or float RGBA samples.
 * @param {number} type - HalfFloatType or FloatType.
 * @param {number} width - The width.
 * @param {number} height - The height.
 * @param {number} bitDepth - The bits per sample.
 * @return {{image: Uint16Array|Uint8Array, scale: number}} The RGB samples and the scale that restores the irradiance.
 */
function encodeLightMap( data, type, width, height, bitDepth ) {

	const count = width * height;
	const levels = 2 ** bitDepth - 1;
	const image = bitDepth === 16 ? new Uint16Array( count * 3 ) : new Uint8Array( count * 3 );
	const encode = ( value ) => Math.round( levels * ( value <= 0.0031308 ? 12.92 * value : 1.055 * value ** ( 1 / 2.4 ) - 0.055 ) );

	let decode = ( value ) => value;
	let table = null;

	if ( type === HalfFloatType ) {

		// half floats decode with a table, negative zero included

		table = new Float32Array( 0x8001 );
		for ( let i = 0; i < 0x7c00; i ++ ) table[ i ] = DataUtils.fromHalfFloat( i );
		table.fill( NaN, 0x7c00 );
		table[ 0x8000 ] = 0;
		decode = ( value ) => value <= 0x8000 ? table[ value ] : NaN;

	}

	let scale = 0;

	for ( let i = 0; i < count * 4; i ++ ) {

		if ( i % 4 === 3 ) continue;
		const value = decode( data[ i ] );
		if ( ! ( value >= 0 && value < Infinity ) ) throw new Error( 'KHR_lightmap: Irradiance must be finite and nonnegative.' );
		scale = Math.max( scale, value );

	}

	if ( scale === 0 ) scale = 1;

	if ( table !== null ) {

		// the encoded samples of all finite half floats

		const codes = new Uint16Array( 0x8001 );
		for ( let i = 0; i < 0x7c00; i ++ ) codes[ i ] = encode( table[ i ] / scale );

		for ( let i = 0; i < count; i ++ ) {

			for ( let c = 0; c < 3; c ++ ) image[ i * 3 + c ] = codes[ data[ i * 4 + c ] ];

		}

	} else {

		for ( let i = 0; i < count; i ++ ) {

			for ( let c = 0; c < 3; c ++ ) image[ i * 3 + c ] = encode( data[ i * 4 + c ] / scale );

		}

	}

	return { image, scale };

}

let crcTable = null;

/**
 * Encodes RGB samples as a PNG, with the adaptive filter heuristic of libpng.
 *
 * @private
 * @param {Uint16Array|Uint8Array} image - The RGB samples.
 * @param {number} width - The width.
 * @param {number} height - The height.
 * @param {number} bitDepth - The bits per sample, 16 or 8.
 * @return {Promise<Blob>} The PNG file.
 */
async function encodePNG( image, width, height, bitDepth ) {

	const bytesPerPixel = 3 * bitDepth / 8;
	const rowBytes = width * bytesPerPixel;
	const filtered = new Uint8Array( height * ( rowBytes + 1 ) );
	const rows = [ new Uint8Array( rowBytes ), new Uint8Array( rowBytes ) ];
	const candidates = Array.from( { length: 5 }, () => new Uint8Array( rowBytes ) );

	for ( let y = 0; y < height; y ++ ) {

		// big endian samples

		const row = rows[ y % 2 ], previous = rows[ ( y + 1 ) % 2 ];
		const offset = y * width * 3;

		if ( bitDepth === 16 ) {

			for ( let i = 0; i < width * 3; i ++ ) {

				row[ i * 2 ] = image[ offset + i ] >> 8;
				row[ i * 2 + 1 ] = image[ offset + i ] & 0xff;

			}

		} else {

			row.set( image.subarray( offset, offset + rowBytes ) );

		}

		if ( y === 0 ) previous.fill( 0 );

		// none, sub, up, average and paeth, the filter with the smallest sum of absolute differences wins

		let best = 0, bestSum = Infinity;

		for ( let filter = 0; filter < 5; filter ++ ) {

			const output = candidates[ filter ];
			let sum = 0;

			for ( let i = 0; i < rowBytes; i ++ ) {

				const a = i >= bytesPerPixel ? row[ i - bytesPerPixel ] : 0;
				const b = previous[ i ];
				const c = i >= bytesPerPixel ? previous[ i - bytesPerPixel ] : 0;
				let predictor = 0;

				if ( filter === 1 ) predictor = a;
				else if ( filter === 2 ) predictor = b;
				else if ( filter === 3 ) predictor = ( a + b ) >> 1;
				else if ( filter === 4 ) {

					const p = a + b - c, pa = Math.abs( p - a ), pb = Math.abs( p - b ), pc = Math.abs( p - c );
					predictor = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;

				}

				const value = ( row[ i ] - predictor ) & 0xff;
				output[ i ] = value;
				sum += value < 128 ? value : 256 - value;

			}

			if ( sum < bestSum ) {

				best = filter;
				bestSum = sum;

			}

		}

		filtered[ y * ( rowBytes + 1 ) ] = best;
		filtered.set( candidates[ best ], y * ( rowBytes + 1 ) + 1 );

	}

	const stream = new Blob( [ filtered ] ).stream().pipeThrough( new CompressionStream( 'deflate' ) );
	const compressed = new Uint8Array( await new Response( stream ).arrayBuffer() );

	const header = new Uint8Array( 13 );
	const view = new DataView( header.buffer );
	view.setUint32( 0, width );
	view.setUint32( 4, height );
	header.set( [ bitDepth, 2, 0, 0, 0 ], 8 );

	return new Blob( [
		new Uint8Array( [ 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a ] ),
		createChunk( 'IHDR', header ),
		createChunk( 'IDAT', compressed ),
		createChunk( 'IEND', new Uint8Array( 0 ) )
	], { type: 'image/png' } );

}

function createChunk( type, data ) {

	if ( crcTable === null ) {

		crcTable = new Uint32Array( 256 );

		for ( let n = 0; n < 256; n ++ ) {

			let c = n;
			for ( let k = 0; k < 8; k ++ ) c = c & 1 ? 0xedb88320 ^ ( c >>> 1 ) : c >>> 1;
			crcTable[ n ] = c;

		}

	}

	const chunk = new Uint8Array( data.length + 12 );
	const view = new DataView( chunk.buffer );
	view.setUint32( 0, data.length );
	for ( let i = 0; i < 4; i ++ ) chunk[ 4 + i ] = type.charCodeAt( i );
	chunk.set( data, 8 );

	let crc = 0xffffffff;
	for ( let i = 4; i < data.length + 8; i ++ ) crc = crcTable[ ( crc ^ chunk[ i ] ) & 0xff ] ^ ( crc >>> 8 );
	view.setUint32( data.length + 8, ( crc ^ 0xffffffff ) >>> 0 );

	return chunk;

}

export { GLTFLightMapExporterExtension };
