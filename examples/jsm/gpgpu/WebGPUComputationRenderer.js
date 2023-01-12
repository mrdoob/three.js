import { instanceIndex, ComputeNode, ShaderNode } from 'three/nodes';
import ComputationRenderer from './ComputationRenderer.js';

export default class WebGPUComputationRenderer extends ComputationRenderer {

	async compute( computeNode, outAttribute, populateTypedArray = true ) {

		const index = instanceIndex;
		const shader = new ShaderNode( ( inputs, stack ) => computeNode.computeNode.call( { index }, stack ) );

		await this.renderer.compute( new ComputeNode( shader, computeNode.count ) );

		outAttribute.array = new outAttribute.array.constructor( populateTypedArray ? await this.renderer.getArrayBuffer( outAttribute ) : outAttribute.array.length );

	}

}
