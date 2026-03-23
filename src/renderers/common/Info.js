import { error } from '../../utils.js';
import {
	ByteType, UnsignedByteType, ShortType, UnsignedShortType, HalfFloatType,
	IntType, UnsignedIntType, FloatType,
	AlphaFormat, RedFormat, RedIntegerFormat, DepthFormat, DepthStencilFormat,
	RGBFormat,
	UnsignedShort4444Type, UnsignedShort5551Type,
	UnsignedInt248Type, UnsignedInt5999Type, UnsignedInt101111Type
} from '../../constants.js';

/**
 * This renderer module provides a series of statistical information
 * about the GPU memory and the rendering process. Useful for debugging
 * and monitoring.
 */
class Info {

	/**
	 * Constructs a new info component.
	 */
	constructor() {

		/**
		 * Whether frame related metrics should automatically
		 * be resetted or not. This property should be set to `false`
		 * by apps which manage their own animation loop. They must
		 * then call `renderer.info.reset()` once per frame manually.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.autoReset = true;

		/**
		 * The current frame ID. This ID is managed
		 * by `NodeFrame`.
		 *
		 * @type {number}
		 * @readonly
		 * @default 0
		 */
		this.frame = 0;

		/**
		 * The number of render calls since the
		 * app has been started.
		 *
		 * @type {number}
		 * @readonly
		 * @default 0
		 */
		this.calls = 0;

		/**
		 * Render related metrics.
		 *
		 * @type {Object}
		 * @readonly
		 * @property {number} calls - The number of render calls since the app has been started.
		 * @property {number} frameCalls - The number of render calls of the current frame.
		 * @property {number} drawCalls - The number of draw calls of the current frame.
		 * @property {number} triangles - The number of rendered triangle primitives of the current frame.
		 * @property {number} points - The number of rendered point primitives of the current frame.
		 * @property {number} lines - The number of rendered line primitives of the current frame.
		 * @property {number} timestamp - The timestamp of the frame.
		 */
		this.render = {
			calls: 0,
			frameCalls: 0,
			drawCalls: 0,
			triangles: 0,
			points: 0,
			lines: 0,
			timestamp: 0,
		};

		/**
		 * Compute related metrics.
		 *
		 * @type {Object}
		 * @readonly
		 * @property {number} calls - The number of compute calls since the app has been started.
		 * @property {number} frameCalls - The number of compute calls of the current frame.
		 * @property {number} timestamp - The timestamp of the frame when using `renderer.computeAsync()`.
		 */
		this.compute = {
			calls: 0,
			frameCalls: 0,
			timestamp: 0
		};

		/**
		 * Memory related metrics.
		 *
		 * @type {Object}
		 * @readonly
		 * @property {number} geometries - The number of active geometries.
		 * @property {number} textures - The number of active textures.
		 * @property {number} attributes - The number of active attributes.
		 * @property {number} indexAttributes - The number of active index attributes.
		 * @property {number} storageAttributes - The number of active storage attributes.
		 * @property {number} indirectStorageAttributes - The number of active indirect storage attributes.
		 * @property {number} programs - The number of active programs.
		 * @property {number} renderTargets - The number of active renderTargets.
		 * @property {number} total - The total memory size in bytes.
		 * @property {number} texturesSize - The memory size of active textures in bytes.
		 * @property {number} attributesSize - The memory size of active attributes in bytes.
		 * @property {number} indexAttributesSize - The memory size of active index attributes in bytes.
		 * @property {number} storageAttributesSize - The memory size of active storage attributes in bytes.
		 * @property {number} indirectStorageAttributesSize - The memory size of active indirect storage attributes in bytes.
		 */
		this.memory = {
			geometries: 0,
			textures: 0,
			attributes: 0,
			indexAttributes: 0,
			storageAttributes: 0,
			indirectStorageAttributes: 0,
			programs: 0,
			renderTargets: 0,
			total: 0,
			texturesSize: 0,
			attributesSize: 0,
			indexAttributesSize: 0,
			storageAttributesSize: 0,
			indirectStorageAttributesSize: 0
		};

		/**
		 * Map for storing calculated byte sizes of tracked objects.
		 *
		 * @type {Map<Object, number>}
		 * @private
		 */
		this.memoryMap = new Map();

	}

	/**
	 * This method should be executed per draw call and updates the corresponding metrics.
	 *
	 * @param {Object3D} object - The 3D object that is going to be rendered.
	 * @param {number} count - The vertex or index count.
	 * @param {number} instanceCount - The instance count.
	 */
	update( object, count, instanceCount ) {

		this.render.drawCalls ++;

		if ( object.isMesh || object.isSprite ) {

			this.render.triangles += instanceCount * ( count / 3 );

		} else if ( object.isPoints ) {

			this.render.points += instanceCount * count;

		} else if ( object.isLineSegments ) {

			this.render.lines += instanceCount * ( count / 2 );

		} else if ( object.isLine ) {

			this.render.lines += instanceCount * ( count - 1 );

		} else {

			error( 'WebGPUInfo: Unknown object type.' );

		}

	}

	/**
	 * Resets frame related metrics.
	 */
	reset() {

		this.render.drawCalls = 0;
		this.render.frameCalls = 0;
		this.compute.frameCalls = 0;

		this.render.triangles = 0;
		this.render.points = 0;
		this.render.lines = 0;


	}

	/**
	 * Performs a complete reset of the object.
	 */
	dispose() {

		this.reset();

		this.calls = 0;

		this.render.calls = 0;
		this.compute.calls = 0;

		this.render.timestamp = 0;
		this.compute.timestamp = 0;

		for ( const prop in this.memory ) {

			this.memory[ prop ] = 0;

		}

		this.memoryMap.clear();

	}

	/**
	 * Tracks texture memory explicitly, updating counts and byte tracking.
	 *
	 * @param {Texture} texture
	 */
	createTexture( texture ) {

		const size = this._getTextureMemorySize( texture );
		this.memoryMap.set( texture, size );

		this.memory.textures ++;
		this.memory.total += size;
		this.memory.texturesSize += size;

	}

	/**
	 * Tracks texture memory explicitly, updating counts and byte tracking.
	 *
	 * @param {Texture} texture
	 */
	destroyTexture( texture ) {

		const size = this.memoryMap.get( texture ) || 0;
		this.memoryMap.delete( texture );

		this.memory.textures --;
		this.memory.total -= size;
		this.memory.texturesSize -= size;

	}

	/**
	 * Tracks attribute memory explicitly, updating counts and byte tracking.
	 *
	 * @param {BufferAttribute} attribute
	 * @param {string} type - type of attribute
	 * @private
	 */
	_createAttribute( attribute, type ) {

		const size = this._getAttributeMemorySize( attribute );
		this.memoryMap.set( attribute, { size, type } );

		this.memory[ type ] ++;
		this.memory.total += size;
		this.memory[ type + 'Size' ] += size;

	}

	/**
	 * Tracks a regular attribute memory explicitly.
	 *
	 * @param {BufferAttribute} attribute - The attribute to track.
	 */
	createAttribute( attribute ) {

		this._createAttribute( attribute, 'attributes' );

	}

	/**
	 * Tracks an index attribute memory explicitly.
	 *
	 * @param {BufferAttribute} attribute - The index attribute to track.
	 */
	createIndexAttribute( attribute ) {

		this._createAttribute( attribute, 'indexAttributes' );

	}

	/**
	 * Tracks a storage attribute memory explicitly.
	 *
	 * @param {BufferAttribute} attribute - The storage attribute to track.
	 */
	createStorageAttribute( attribute ) {

		this._createAttribute( attribute, 'storageAttributes' );

	}

	/**
	 * Tracks an indirect storage attribute memory explicitly.
	 *
	 * @param {BufferAttribute} attribute - The indirect storage attribute to track.
	 */
	createIndirectStorageAttribute( attribute ) {

		this._createAttribute( attribute, 'indirectStorageAttributes' );

	}

	/**
	 * Tracks attribute memory explicitly, updating counts and byte tracking.
	 *
	 * @param {BufferAttribute} attribute
	 */
	destroyAttribute( attribute ) {

		const data = this.memoryMap.get( attribute );

		if ( data ) {

			this.memoryMap.delete( attribute );

			this.memory[ data.type ] --;
			this.memory.total -= data.size;
			this.memory[ data.type + 'Size' ] -= data.size;

		}

	}

	/**
	 * Calculates the memory size of a texture in bytes.
	 *
	 * @param {Texture} texture - The texture to calculate the size for.
	 * @return {number} The calculated size in bytes.
	 * @private
	 */
	_getTextureMemorySize( texture ) {

		if ( texture.isCompressedTexture ) {

			return 1; // Fallback estimate since exact format decompressed isn't readily available without format maps

		}

		let bytesPerChannel = 1;

		if ( texture.type === ByteType || texture.type === UnsignedByteType ) bytesPerChannel = 1;
		else if ( texture.type === ShortType || texture.type === UnsignedShortType || texture.type === HalfFloatType ) bytesPerChannel = 2;
		else if ( texture.type === IntType || texture.type === UnsignedIntType || texture.type === FloatType ) bytesPerChannel = 4;

		let channels = 4; // RGBA default

		if ( texture.format === AlphaFormat || texture.format === RedFormat || texture.format === RedIntegerFormat || texture.format === DepthFormat || texture.format === DepthStencilFormat ) channels = 1;
		else if ( texture.format === RGBFormat ) channels = 3;

		let bytesPerPixel = bytesPerChannel * channels;

		// Packed overrides
		if ( texture.type === UnsignedShort4444Type || texture.type === UnsignedShort5551Type ) bytesPerPixel = 2;
		else if ( texture.type === UnsignedInt248Type || texture.type === UnsignedInt5999Type || texture.type === UnsignedInt101111Type ) bytesPerPixel = 4;

		const width = texture.width || 1;
		const height = texture.height || 1;
		const depth = texture.isCubeTexture ? 6 : ( texture.depth || 1 );

		let size = width * height * depth * bytesPerPixel;
		const mipmaps = texture.mipmaps;

		if ( mipmaps && mipmaps.length > 0 ) {

			let mipmapSize = 0;
			for ( let i = 0; i < mipmaps.length; i ++ ) {

				const mipmap = mipmaps[ i ];
				if ( mipmap.data ) {

					mipmapSize += mipmap.data.byteLength;

				} else {

					const mipWidth = mipmap.width || Math.max( 1, width >> i );
					const mipHeight = mipmap.height || Math.max( 1, height >> i );
					mipmapSize += mipWidth * mipHeight * depth * bytesPerPixel;

				}

			}

			size += mipmapSize;

		} else if ( texture.generateMipmaps ) {

			size = size * 1.333; // MiP chain approximation

		}

		return Math.round( size );

	}

	/**
	 * Calculates the memory size of an attribute in bytes.
	 *
	 * @param {BufferAttribute} attribute - The attribute to calculate the size for.
	 * @return {number} The calculated size in bytes.
	 * @private
	 */
	_getAttributeMemorySize( attribute ) {

		if ( attribute.isInterleavedBufferAttribute ) attribute = attribute.data;

		if ( attribute.array ) {

			return attribute.array.byteLength;

		} else if ( attribute.count && attribute.itemSize ) {

			return attribute.count * attribute.itemSize * 4; // Assume Float32

		}

		return 0;

	}

}


export default Info;
