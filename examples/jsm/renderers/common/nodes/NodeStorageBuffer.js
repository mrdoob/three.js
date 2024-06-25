import StorageBuffer from '../StorageBuffer.js';
import { GPUBufferBindingType } from '../../webgpu/utils/WebGPUConstants.js';

let _id = 0;

class NodeStorageBuffer extends StorageBuffer {

	constructor( nodeUniform, groupNode ) {

		super( 'StorageBuffer_' + _id ++, nodeUniform ? nodeUniform.value : null );

		this.nodeUniform = nodeUniform;
		this.access = nodeUniform ? nodeUniform.access : GPUBufferBindingType.Storage
		this.groupNode = groupNode;


	}

	get buffer() {

		return this.nodeUniform.value;

	}

}

export default NodeStorageBuffer;
