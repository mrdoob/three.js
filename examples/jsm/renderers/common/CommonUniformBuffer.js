class CommonUniformBuffer {

	constructor( bufferSize = 0, alignment = 0 ) {

		let buffer = null;

		if ( bufferSize > 0 ) {

			buffer = new Float32Array( bufferSize );

		}

		// offset in bytes to first free buffer entry

		this.startFree = 0;
		this.buffer = buffer;
		this.aligment = alignment;
		this.freeLists = [];

	}

	allocate( byteLength ) {

		// uniformGroups within buffer must be aligned correctly per WebGPU spec.

		const aligment = this.aligment;
		const freeLists = this.freeLists;

		const listIndex = Math.ceil( byteLength / aligment );

		let start;

		if ( freeLists.length > listIndex ) {

			// scan freelists for space

			for ( let i = listIndex, l = freeLists.length; i < l; i ++ ) {

				if ( freeLists[ i ] !== undefined && freeLists[ i ].length > 0) {

					console.log( 'allocate from free list size', i * aligment );

					start = freeLists[ i ].shift();

					if ( i > listIndex ) {

						// split overlarge list entries
						this.free( start + aligment, ( i - listIndex ) * aligment );

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
			const paddedByteLength = listIndex * aligment;
			start = this.startFree;

			this.startFree += paddedByteLength;

		}

		const bpe = this.buffer.BYTES_PER_ELEMENT;
		const buffer = this.buffer.subarray( start / bpe , ( start + byteLength ) / bpe );

		return buffer;

	}

	get byteLength() {

		return this.buffer === null ? 0 : this.buffer.byteLength;

	}

	get arrayBuffer() {

		return this.buffer.buffer;

	}

	free( buffer ) {

		console.log( 'free', buffer.byteOffset, buffer.byteLength );

		const freeLists = this.freeLists;
		const listIndex = Math.ceil( buffer.byteLength / this.aligment );

		if ( freeLists[ listIndex ] === undefined ) {

			freeLists[ listIndex ] = [];

		}

		freeLists[ listIndex ].push( buffer.byteOffset );

	}

}

export default CommonUniformBuffer;
