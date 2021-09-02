import WebGPUBinding from './WebGPUBinding.js';
import { GPUBindingType, GPUChunkSize } from './constants.js';

class WebGPUUniformBuffer extends WebGPUBinding {

	constructor( name, buffer = null ) {

		super( name );

		this.bytesPerElement = Float32Array.BYTES_PER_ELEMENT;
		this.type = GPUBindingType.UniformBuffer;
		this.visibility = GPUShaderStage.VERTEX;

		this.usage = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST;

		this.buffer = buffer;
		this.bufferGPU = null; // set by the renderer

	}

	getByteLength() {

		return WebGPUUniformBuffer.getByteLength(  this.buffer.byteLength );

	}

	getBuffer() {

		return this.buffer;

	}

	update() {

		return true;

	}

	static getByteLength( byteLength ) {

		return byteLength + ( ( GPUChunkSize - ( byteLength % GPUChunkSize ) ) % GPUChunkSize ); // ensure chunk size byte alignment (STD140 layout)

	}

}

WebGPUUniformBuffer.prototype.isUniformBuffer = true;

export default WebGPUUniformBuffer;
