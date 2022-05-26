import WebGPUBuffer from './WebGPUBuffer.js';
import { GPUBindingType } from './constants.js';

class WebGPUUniformBuffer extends WebGPUBuffer {

	constructor( name, buffer = null ) {

		super( name, GPUBindingType.UniformBuffer, buffer );

		this.isUniformBuffer = true;

		this.usage |= GPUBufferUsage.UNIFORM;

	}

}

export default WebGPUUniformBuffer;
