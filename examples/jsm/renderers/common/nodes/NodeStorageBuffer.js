import StorageBuffer from '../StorageBuffer.js';
import { GPUBufferBindingType } from '../../webgpu/utils/WebGPUConstants.js';

let _id = 0;

class NodeStorageBuffer extends StorageBuffer {

	constructor( nodeUniform ) {

		const access = nodeUniform ? nodeUniform.access : GPUBufferBindingType.Storage;
		const namePrefix = access === GPUBufferBindingType.Storage ? 'StorageBuffer_': 'StorageReadOnlyBuffer_';

		super( namePrefix + _id ++, nodeUniform ? nodeUniform.value : null );

		this.nodeUniform = nodeUniform;
		this.access = access;

	}

	get buffer() {

		return this.nodeUniform.value;

	}

}

export default NodeStorageBuffer;
