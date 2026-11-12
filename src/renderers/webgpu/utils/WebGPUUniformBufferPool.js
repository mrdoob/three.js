import { GPU_CHUNK_BYTES } from '../../common/Constants.js';
import GPUBufferDescriptor from '../descriptors/GPUBufferDescriptor.js';

const _bufferDescriptor = new GPUBufferDescriptor();

const SLAB_SIZES = [ 65536, 262144, 1048576, 4194304 ]; // 64 KiB -> 256 KiB -> 1 MiB -> 4 MiB
const MAX_POOLED_BYTE_LENGTH = 16384; // 16 KiB
const BUFFER_USAGE = ( typeof GPUBufferUsage !== 'undefined' ) ? ( GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST ) : ( 0x0040 | 0x0008 );

/**
 * Sub-allocates dynamic per-object uniform buffers from fixed-size WebGPU slab buffers
 * and batches dirty CPU ranges into coalesced `queue.writeBuffer()` uploads.
 *
 * @private
 */
class WebGPUUniformBufferPool {

	/**
	 * Constructs a new WebGPU uniform buffer pool.
	 *
	 * @param {GPUDevice} device - The WebGPU device.
	 */
	constructor( device ) {

		this.device = device;
		this.alignment = Math.max( GPU_CHUNK_BYTES, device.limits.minUniformBufferOffsetAlignment );
		this.maxPooledByteLength = Math.min( MAX_POOLED_BYTE_LENGTH, device.limits.maxUniformBufferBindingSize );

		this.slabs = [];
		this._dirtySlabs = [];

	}

	/**
	 * Returns `true` if the given uniform buffer binding should be sub-allocated from this pool.
	 *
	 * @param {UniformBuffer} uniformBuffer - The uniform buffer binding.
	 * @return {boolean} Whether the uniform buffer can be pooled with a dynamic offset.
	 */
	canPool( uniformBuffer ) {

		if ( uniformBuffer.isUniformsGroup !== true ) return false;
		if ( uniformBuffer.groupNode !== undefined && uniformBuffer.groupNode.shared === true ) return false;

		const byteLength = uniformBuffer.byteLength;

		return byteLength > 0 && byteLength <= this.maxPooledByteLength;

	}

	/**
	 * Allocates an aligned slice inside a pooled `GPUBuffer` slab and attaches its `Float32Array` view.
	 *
	 * @param {UniformsGroup} uniformBuffer - The uniform buffer group to pool.
	 * @return {Object} The allocation record.
	 */
	allocate( uniformBuffer ) {

		const byteLength = uniformBuffer.byteLength;
		const alignedSize = Math.ceil( byteLength / this.alignment ) * this.alignment;
		const slabs = this.slabs;

		let slab = null;
		let byteOffset = 0;

		for ( let i = 0, l = slabs.length; i < l; i ++ ) {

			const candidate = slabs[ i ];
			const freeList = candidate.freeLists.get( alignedSize );

			if ( freeList !== undefined && freeList.length > 0 ) {

				slab = candidate;
				byteOffset = freeList.pop();
				slab.activeCount ++;
				break;

			}

			if ( candidate.cursor + alignedSize <= candidate.byteLength ) {

				slab = candidate;
				byteOffset = candidate.cursor;
				candidate.cursor += alignedSize;
				slab.activeCount ++;
				break;

			}

		}

		if ( slab === null ) {

			const slabByteLength = Math.max( SLAB_SIZES[ Math.min( slabs.length, SLAB_SIZES.length - 1 ) ], alignedSize );
			const data = new Uint8Array( slabByteLength );

			_bufferDescriptor.label = 'uniformBufferSlab';
			_bufferDescriptor.size = slabByteLength;
			_bufferDescriptor.usage = BUFFER_USAGE;

			const bufferGPU = this.device.createBuffer( _bufferDescriptor );

			_bufferDescriptor.reset();

			slab = {
				byteLength: slabByteLength,
				bufferGPU,
				data,
				float32View: new Float32Array( data.buffer ),
				cursor: alignedSize,
				activeCount: 1,
				freeLists: new Map(),
				bindGroups: new Map(),
				dirtyStart: Infinity,
				dirtyEnd: 0,
				isDirty: false
			};

			slabs.push( slab );

		}

		const view = slab.float32View.subarray( byteOffset >>> 2, ( byteOffset + byteLength ) >>> 2 );
		const allocation = { slab, bufferGPU: slab.bufferGPU, view, byteOffset, byteLength, alignedSize };

		if ( uniformBuffer._buffer !== null && uniformBuffer._buffer !== view ) {

			view.set( uniformBuffer._buffer );
			this.markDirty( allocation );

		}

		uniformBuffer._buffer = view;
		uniformBuffer._int32View = null;
		uniformBuffer._uint32View = null;
		uniformBuffer._isPooled = true;

		return allocation;

	}

	/**
	 * Releases a previously allocated slice back to its slab's free-list.
	 *
	 * @param {Object} allocation - The allocation record.
	 */
	free( allocation ) {

		const { slab, byteOffset, alignedSize } = allocation;

		if ( -- slab.activeCount === 0 ) {

			slab.cursor = 0;
			slab.freeLists.clear();

		} else {

			let freeList = slab.freeLists.get( alignedSize );

			if ( freeList === undefined ) {

				freeList = [];
				slab.freeLists.set( alignedSize, freeList );

			}

			freeList.push( byteOffset );

		}

	}

	/**
	 * Marks an allocation's byte range dirty for the next {@link WebGPUUniformBufferPool#flush}.
	 *
	 * @param {Object} allocation - The allocation record.
	 */
	markDirty( allocation ) {

		const { slab, byteOffset, byteLength } = allocation;
		const end = byteOffset + byteLength;

		if ( byteOffset < slab.dirtyStart ) slab.dirtyStart = byteOffset;
		if ( end > slab.dirtyEnd ) slab.dirtyEnd = end;

		if ( slab.isDirty === false ) {

			slab.isDirty = true;
			this._dirtySlabs.push( slab );

		}

	}

	/**
	 * Uploads the dirty byte span of each dirty slab to the GPU queue.
	 */
	flush() {

		const dirtySlabs = this._dirtySlabs;
		if ( dirtySlabs.length === 0 ) return;

		const queue = this.device.queue;

		for ( let i = 0, l = dirtySlabs.length; i < l; i ++ ) {

			const slab = dirtySlabs[ i ];
			const byteOffset = slab.dirtyStart;

			queue.writeBuffer( slab.bufferGPU, byteOffset, slab.data, byteOffset, slab.dirtyEnd - byteOffset );

			slab.dirtyStart = Infinity;
			slab.dirtyEnd = 0;
			slab.isDirty = false;

		}

		dirtySlabs.length = 0;

	}

	/**
	 * Destroys all pooled GPU slab buffers and resets the pool.
	 */
	dispose() {

		for ( let i = 0, l = this.slabs.length; i < l; i ++ ) {

			const slab = this.slabs[ i ];
			slab.bindGroups.clear();
			slab.bufferGPU.destroy();

		}

		this.slabs.length = 0;
		this._dirtySlabs.length = 0;

	}

}

export default WebGPUUniformBufferPool;
