class CommonUniformBuffer {

	constructor( bufferSize = 0, alignment = 0, info ) {

		let buffer = null;

		if ( bufferSize > 0 ) {

			buffer = new Float32Array( bufferSize );

		}

		// offset in bytes to first free buffer entry

		this.startFree = 0;
		this.buffer = buffer;
		this.aligment = alignment;
		this.freeLists = [];

		this.info = {
			size: buffer.byteLength,
			blockSize: this.aligment,
			free: 0,
			alloc: 0,
			reused: 0,
		};

		Object.defineProperties( this.info, {
			'freeLists': {
				get: () => {

					const a = [];

					for ( let i = 1, l = this.freeLists.length; i < l; i ++ ) {

						if ( this.freeLists[ i ] !== undefined ) a[ i ] = this.freeLists[ i ].length;

					}

					return a;

				}

			},
			unused: {
				get: () => buffer.byteLength - this.startFree
			}
		} );

		info.memory.common = this.info;

	}

	allocate( byteLength ) {

		// uniformGroups within buffer must be aligned correctly per WebGPU spec.

		const aligment = this.aligment;
		const freeLists = this.freeLists;

		const blockCount = Math.ceil( byteLength / aligment );

		let start;

		if ( freeLists.length > blockCount ) {

			// scan freelists for space

			for ( let i = blockCount, l = freeLists.length; i < l; i ++ ) {

				if ( freeLists[ i ] !== undefined && freeLists[ i ].length > 0 ) {

					start = freeLists[ i ].shift();
					this.info.reused ++;

					if ( i > blockCount ) {

						// split overlarge list entries
						this._free( start + ( blockCount * aligment ), ( i - blockCount ) * aligment );

					}

					break;

				}


			}

		}

		if ( start === undefined ) {

			// not allocated from free lists

			if ( this.startFree + byteLength > this.byteLength ) {

				return false;

			}

			// allocate from free area at the end of the buffer
			const paddedByteLength = blockCount * aligment;
			start = this.startFree;

			this.startFree += paddedByteLength;

		}

		const bpe = this.buffer.BYTES_PER_ELEMENT;
		const buffer = this.buffer.subarray( start / bpe, ( start + byteLength ) / bpe );

		this.info.alloc ++;

		return buffer;

	}

	_free( byteOffset, byteLength ) {

		const freeLists = this.freeLists;
		const blockCount = Math.ceil( byteLength / this.aligment );

		if ( freeLists[ blockCount ] === undefined ) {

			freeLists[ blockCount ] = [];

		}

		freeLists[ blockCount ].push( byteOffset );

	}

	free( buffer ) {

		this._free( buffer.byteOffset, buffer.byteLength );
		this.info.free ++;

	}

	get byteLength() {

		return this.buffer === null ? 0 : this.buffer.byteLength;

	}

	get arrayBuffer() {

		return this.buffer.buffer;

	}

}

export default CommonUniformBuffer;
