import WebGPUBinding from './WebGPUBinding.js';
import { GPUBindingType } from './constants.js';

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

		const buffer = 	this.buffer;

		return buffer.byteLength + ( ( 4 - ( buffer.byteLength % 4 ) ) % 4 ); // ensure 4 byte alignment, see #20441

	}

	getBuffer() {

		return this.buffer;

	}

	update() {

		return true;

	}

}

WebGPUUniformBuffer.prototype.isUniformBuffer = true;

export default WebGPUUniformBuffer;
