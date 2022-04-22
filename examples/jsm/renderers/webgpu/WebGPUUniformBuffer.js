import WebGPUBuffer from './WebGPUBuffer.js';
import { GPUBindingType } from './constants.js';

class WebGPUUniformBuffer extends WebGPUBuffer {

	constructor( name, buffer = null ) {

		super( name, GPUBindingType.UniformBuffer, buffer );

		this.usage |= GPUBufferUsage.UNIFORM;

	}

}

WebGPUUniformBuffer.prototype.isUniformBuffer = true;

export default WebGPUUniformBuffer;
