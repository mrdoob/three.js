import WebGPUBinding from './WebGPUBinding.js';
import { getFloatLength } from './WebGPUBufferUtils.js';

class WebGPUBuffer extends WebGPUBinding {

	constructor( name, type, buffer = null ) {

		super( name );

		this.isBuffer = true;

		this.bytesPerElement = Float32Array.BYTES_PER_ELEMENT;
		this.type = type;
		this.visibility = GPUShaderStage.VERTEX;

		this.usage = GPUBufferUsage.COPY_DST;

		this.buffer = buffer;
		this.bufferGPU = null; // set by the renderer

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

export default WebGPUBuffer;
