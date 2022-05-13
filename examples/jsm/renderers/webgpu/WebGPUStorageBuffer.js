import WebGPUBuffer from './WebGPUBuffer.js';
import { GPUBindingType } from './constants.js';

class WebGPUStorageBuffer extends WebGPUBuffer {

	constructor( name, attribute ) {

		super( name, GPUBindingType.StorageBuffer, attribute.array );

		this.usage |= GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE;

		this.attribute = attribute;

	}

}

WebGPUStorageBuffer.prototype.isStorageBuffer = true;

export default WebGPUStorageBuffer;
