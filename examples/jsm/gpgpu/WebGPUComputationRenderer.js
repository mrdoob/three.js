import { instanceIndex, ComputeNode, ShaderNode } from 'three/nodes';
import WebGPUTypedBuffer from './WebGPUTypedBuffer.js';

export default class WebGPUComputationRenderer {

	constructor( shaderNode ) {

		this.shaderNode = shaderNode;

	}

	createBuffer( ...params ) {

		return new WebGPUTypedBuffer( ...params );

	}

	setBuffers( srcBuffer, outBuffer ) {

		this.srcBuffer = srcBuffer;
		this.outBuffer = outBuffer;

		const index = instanceIndex;
		const shaderParams = { index, element: srcBuffer.getBufferElement( index ), buffer: srcBuffer }; // Same arguments as in Array.forEach()
		this._shader = new ShaderNode( ( inputs, builder ) => {

			return outBuffer.setBufferElement( index, this.shaderNode.call( shaderParams, builder ) );

		} );

	}

	async compute( renderer, populateTypedArray = true ) {

		await renderer.compute( new ComputeNode( this._shader, this.outBuffer.length ) );

		const buffer = populateTypedArray ? await renderer.getArrayBuffer( this.outBuffer.buffer ) : this.outBuffer.buffer.length;
		this.outBuffer.typedArray = new this.outBuffer.typedArray.constructor( buffer );

	}

}