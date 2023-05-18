import Binding from './Binding.js';
import { getFloatLength } from './BufferUtils.js';

class Buffer extends Binding {

	constructor( name, buffer = null ) {

		super( name );

		this.isBuffer = true;

		this.bytesPerElement = Float32Array.BYTES_PER_ELEMENT;

		this.buffer = buffer;

	}

	getByteLength() {

		return getFloatLength( this.buffer.byteLength );

	}

	getBuffer() {

		return this.buffer;

	}

	update() {

		return true;

	}

}

export default Buffer;
