import Binding from './Binding.js';
import { getFloatLength } from './BufferUtils.js';

class Buffer extends Binding {

	constructor( name, buffer = null ) {

		super( name );

		this.isBuffer = true;

		this.bytesPerElement = Float32Array.BYTES_PER_ELEMENT;

		this._buffer = buffer;

	}

	get byteLength() {

		return getFloatLength( this._buffer.byteLength );

	}

	get buffer() {

		return this._buffer;

	}

	update() {

		return true;

	}

}

export default Buffer;
