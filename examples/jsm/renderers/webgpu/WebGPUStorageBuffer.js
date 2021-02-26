import WebGPUBinding from './WebGPUBinding.js';
import { GPUBindingType } from './constants.js';

class WebGPUStorageBuffer extends WebGPUBinding {

	constructor( name, attribute ) {

		super( name );

		this.type = GPUBindingType.StorageBuffer;

		this.usage = GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST;

		this.attribute = attribute;
		this.bufferGPU = null; // set by the renderer

		Object.defineProperty( this, 'isStorageBuffer', { value: true } );

	}

}

export default WebGPUStorageBuffer;
