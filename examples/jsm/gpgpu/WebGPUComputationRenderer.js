import { instanceIndex, ComputeNode, ShaderNode } from 'three/nodes';
import ComputationRenderer from './ComputationRenderer.js';
import WebGPUTypedBuffer from './WebGPUTypedBuffer.js';

export default class WebGPUComputationRenderer extends ComputationRenderer {

	createBuffer( ...params ) {

		const buffer = new WebGPUTypedBuffer( ...params );
		this._buffers.push( buffer );
		return buffer;

	}

	async compute( shaderNode, outBuffer, populateTypedArray = true ) {

		const index = instanceIndex;
		const shader = new ShaderNode( ( inputs, builder ) => {

			return outBuffer.setBufferElement( index, shaderNode.call( { index }, builder ) );

		} );

		await this.renderer.compute( new ComputeNode( shader, outBuffer.length ) );

		outBuffer.typedArray = populateTypedArray ? await this.renderer.getArrayBuffer( outBuffer.buffer ) : outBuffer.length;

	}

}