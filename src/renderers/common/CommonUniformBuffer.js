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

	}

	allocate( byteLength ) {

		if ( this.startFree + byteLength > this.byteLength ) {

			return false;

		}

		// uniformGroups within buffer must be aligned correctly per WebGPU spec.
		const paddedByteLength = Math.ceil( byteLength / this.aligment ) * this.aligment;
		const bpe = this.buffer.BYTES_PER_ELEMENT;
		const buffer = this.buffer.subarray( this.startFree / bpe , ( this.startFree + byteLength ) / bpe );

		this.startFree += paddedByteLength;

		return buffer;

	}

	get byteLength() {

		return this.buffer === null ? 0 : this.buffer.byteLength;

	}

	get arrayBuffer() {

		return this.buffer.buffer;

	}

}

export default CommonUniformBuffer;
