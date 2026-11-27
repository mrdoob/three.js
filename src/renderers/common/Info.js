import { error } from '../../utils.js';
import { getByteLength } from '../../extras/TextureUtils.js';
import {
	ByteType, UnsignedByteType, ShortType, UnsignedShortType, HalfFloatType,
	IntType, UnsignedIntType, FloatType,
	AlphaFormat, RedFormat, RedIntegerFormat, DepthFormat, DepthStencilFormat,
	RGFormat, RGIntegerFormat, RGBFormat, RGBIntegerFormat,
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
		 * Whether frame related metrics should automatically be reset at the
		 * start of each animation frame or not. The renderer runs its internal
		 * animation loop once `render()` or `compute()` has been called, even
		 * when the app manages its own animation loop. When set to `false`, the
		 * app must call `renderer.info.reset()` manually.
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
		 * The number of render and compute calls since the
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
		 */
		this.render = {
			calls: 0,
			frameCalls: 0,
			drawCalls: 0,
			triangles: 0,
			points: 0,
			lines: 0
		};

		/**
		 * Compute related metrics.
		 *
		 * @type {Object}
		 * @readonly
		 * @property {number} calls - The number of compute calls since the app has been started.
		 * @property {number} frameCalls - The number of compute calls of the current frame.
		 */
		this.compute = {
			calls: 0,
			frameCalls: 0
		};

		/**
		 * Memory related metrics.
		 *
		 * @type {Object}
		 * @readonly
		 * @property {number} attributes - The number of active attributes.
		 * @property {number} attributesSize - The memory size of active attributes in bytes.
		 * @property {number} geometries - The number of active geometries.
		 * @property {number} indexAttributes - The number of active index attributes.
		 * @property {number} indexAttributesSize - The memory size of active index attributes in bytes.
		 * @property {number} indirectStorageAttributes - The number of active indirect storage attributes.
		 * @property {number} indirectStorageAttributesSize - The memory size of active indirect storage attributes in bytes.
		 * @property {number} programs - The number of active programs.
		 * @property {number} programsSize - The memory size of active programs in bytes.
		 * @property {number} readbackBuffers - The number of active readback buffers.
		 * @property {number} readbackBuffersSize - The memory size of active readback buffers in bytes.
		 * @property {number} renderTargets - The number of active renderTargets.
		 * @property {number} storageAttributes - The number of active storage attributes.
		 * @property {number} storageAttributesSize - The memory size of active storage attributes in bytes.
		 * @property {number} textures - The number of active textures.
		 * @property {number} texturesSize - The memory size of active textures in bytes.
		 * @property {number} uniformBuffers - The number of active uniform buffers.
		 * @property {number} uniformBuffersSize - The memory size of active uniform buffers in bytes.
		 * @property {number} total - The total memory size in bytes.
		 */
		this.memory = {
			attributes: 0,
			attributesSize: 0,
			geometries: 0,
			indexAttributes: 0,
			indexAttributesSize: 0,
			indirectStorageAttributes: 0,
			indirectStorageAttributesSize: 0,
			programs: 0,
			programsSize: 0,
			readbackBuffers: 0,
			readbackBuffersSize: 0,
			renderTargets: 0,
			storageAttributes: 0,
			storageAttributesSize: 0,
			textures: 0,
			texturesSize: 0,
			uniformBuffers: 0,
			uniformBuffersSize: 0,
			total: 0
		};

		/**
		 * The tracked GPU resources. `creator` is the stack of the render and compute calls
		 * the resource was created in, see {@link Info#beginRender} and {@link Info#beginCompute},
		 * or `null` outside of them.
		 *
		 * @type {Set<{type: string, name: string, size: number, creator: ?Array<Object>}>}
		 * @readonly
		 */
		this.resources = new Set();

		/**
		 * Map for storing the data of tracked objects.
		 *
		 * @type {WeakMap<Object, Object>}
		 * @private
		 */
		this.memoryMap = new WeakMap();

		/**
		 * The stack of the active render and compute calls.
		 *
		 * @type {Array<Object>}
		 * @private
		 */
		this._calls = [];

	}

	/**
	 * Called when a render call begins.
	 *
	 * @param {Object3D} scene - The scene or 3D object to render.
	 * @param {Camera} camera - The camera.
	 * @param {?RenderTarget} renderTarget - The render target.
	 * @param {number} activeCubeFace - The active cube face.
	 * @param {number} activeMipmapLevel - The active mipmap level.
	 */
	beginRender( scene, camera, renderTarget, activeCubeFace, activeMipmapLevel ) {

		this._calls.push( { scene, camera, renderTarget, activeCubeFace, activeMipmapLevel } );

	}

	/**
	 * Called when a render call ends.
	 */
	finishRender() {

		this._calls.pop();

	}

	/**
	 * Called when a compute call begins.
	 *
	 * @param {Node|Array<Node>} computeNode - The compute node(s).
	 */
	beginCompute( computeNode ) {

		this._calls.push( { computeNode } );

	}

	/**
	 * Called when a compute call ends.
	 */
	finishCompute() {

		this._calls.pop();

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

		for ( const prop in this.memory ) {

			this.memory[ prop ] = 0;

		}

		this.resources.clear();
		this.memoryMap = new WeakMap();

	}

	/**
	 * Tracks texture memory explicitly, updating counts and byte tracking.
	 *
	 * @param {Texture} texture
	 * @param {Object} options - The texture's size and level information.
	 */
	createTexture( texture, options ) {

		this._createResource( texture, 'textures', this._getTextureMemorySize( texture, options ) );

	}

	/**
	 * Updates the tracked memory of a texture when its default texture is replaced with the loaded one.
	 *
	 * @param {Texture} texture
	 * @param {Object} options - The texture's size and level information.
	 */
	updateTexture( texture, options ) {

		const data = this.memoryMap.get( texture );
		const size = this._getTextureMemorySize( texture, options );
		const delta = size - data.size;

		data.size = size;

		this.memory.total += delta;
		this.memory.texturesSize += delta;

	}

	/**
	 * Tracks texture memory explicitly, updating counts and byte tracking.
	 *
	 * @param {Texture} texture
	 */
	destroyTexture( texture ) {

		this._destroyResource( texture );

	}

	/**
	 * Tracks attribute memory explicitly, updating counts and byte tracking.
	 *
	 * @param {BufferAttribute} attribute
	 * @param {string} type - type of attribute
	 * @private
	 */
	_createAttribute( attribute, type ) {

		this._createResource( attribute, type, this._getAttributeMemorySize( attribute ) );

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

		this._destroyResource( attribute );

	}

	/**
	 * Tracks a readback buffer memory explicitly.
	 *
	 * @param {ReadbackBuffer} readbackBuffer - The readback buffer to track.
	 */
	createReadbackBuffer( readbackBuffer ) {

		this._createResource( readbackBuffer, 'readbackBuffers', readbackBuffer.maxByteLength );

	}

	/**
	 * Tracks a readback buffer memory explicitly.
	 *
	 * @param {ReadbackBuffer} readbackBuffer - The readback buffer to track.
	 */
	destroyReadbackBuffer( readbackBuffer ) {

		this._destroyResource( readbackBuffer );

	}

	/**
	 * Tracks a uniform buffer memory explicitly.
	 *
	 * @param {UniformBuffer} uniformBuffer - The uniform buffer to track.
	 */
	createUniformBuffer( uniformBuffer ) {

		this._createResource( uniformBuffer, 'uniformBuffers', uniformBuffer.byteLength );

	}

	/**
	 * Tracks a uniform buffer memory explicitly.
	 *
	 * @param {UniformBuffer} uniformBuffer - The uniform buffer to track.
	 */
	destroyUniformBuffer( uniformBuffer ) {

		this._destroyResource( uniformBuffer );

	}

	/**
	 * Tracks program memory explicitly, updating counts and byte tracking.
	 *
	 * @param {ProgrammableStage} program - The program to track.
	 */
	createProgram( program ) {

		this._createResource( program, 'programs', program.code.length ); // Approx size

	}

	/**
	 * Tracks program memory explicitly, updating counts and byte tracking.
	 *
	 * @param {Object} program - The program to track.
	 */
	destroyProgram( program ) {

		this._destroyResource( program );

	}

	/**
	 * Tracks the memory of a resource.
	 *
	 * @param {Object} resource - The resource to track.
	 * @param {string} type - The memory type, see {@link Info#memory}.
	 * @param {number} size - The memory size in bytes.
	 * @private
	 */
	_createResource( resource, type, size ) {

		const creator = this._calls.length > 0 ? this._calls.slice() : null;
		const data = { type, name: resource.name || '', size, creator };

		this.memoryMap.set( resource, data );
		this.resources.add( data );

		this.memory[ type ] ++;
		this.memory.total += size;
		this.memory[ type + 'Size' ] += size;

	}

	/**
	 * Stops tracking the memory of a resource.
	 *
	 * @param {Object} resource - The tracked resource.
	 * @private
	 */
	_destroyResource( resource ) {

		const data = this.memoryMap.get( resource );

		if ( data === undefined ) return;

		this.memoryMap.delete( resource );
		this.resources.delete( data );

		this.memory[ data.type ] --;
		this.memory.total -= data.size;
		this.memory[ data.type + 'Size' ] -= data.size;

	}

	/**
	 * Calculates the memory size of a texture in bytes.
	 *
	 * @param {Texture} texture - The texture to calculate the size for.
	 * @param {Object} options - The texture's size and level information.
	 * @return {number} The calculated size in bytes.
	 * @private
	 */
	_getTextureMemorySize( texture, options ) {

		let bytesPerChannel = 1;

		if ( texture.type === ByteType || texture.type === UnsignedByteType ) bytesPerChannel = 1;
		else if ( texture.type === ShortType || texture.type === UnsignedShortType || texture.type === HalfFloatType ) bytesPerChannel = 2;
		else if ( texture.type === IntType || texture.type === UnsignedIntType || texture.type === FloatType ) bytesPerChannel = 4;

		let channels = 4; // RGBA default

		if ( texture.format === AlphaFormat || texture.format === RedFormat || texture.format === RedIntegerFormat || texture.format === DepthFormat || texture.format === DepthStencilFormat ) channels = 1;
		else if ( texture.format === RGFormat || texture.format === RGIntegerFormat ) channels = 2;
		else if ( texture.format === RGBFormat || texture.format === RGBIntegerFormat ) channels = 3;

		let bytesPerPixel = bytesPerChannel * channels;

		// Packed overrides
		if ( texture.type === UnsignedShort4444Type || texture.type === UnsignedShort5551Type ) bytesPerPixel = 2;
		else if ( texture.type === UnsignedInt248Type || texture.type === UnsignedInt5999Type || texture.type === UnsignedInt101111Type ) bytesPerPixel = 4;

		const { width, height, depth, levels } = options;
		const is3D = texture.isData3DTexture === true || texture.is3DTexture === true;

		let size = 0;

		for ( let i = 0; i < levels; i ++ ) {

			const levelWidth = Math.max( 1, width >> i );
			const levelHeight = Math.max( 1, height >> i );
			const levelDepth = is3D ? Math.max( 1, depth >> i ) : depth;

			if ( texture.isCompressedTexture ) {

				size += getByteLength( levelWidth, levelHeight, texture.format, texture.type ) * levelDepth;

			} else {

				size += levelWidth * levelHeight * levelDepth * bytesPerPixel;

			}

		}

		return size;

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
