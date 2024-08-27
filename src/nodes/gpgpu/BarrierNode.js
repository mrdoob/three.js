import Node, { registerNodeClass } from '../core/Node.js';
import { nodeProxy } from '../tsl/TSLCore.js';

class BarrierNode extends Node {

	constructor( scope ) {

		super();

		this.scope = scope;

	}

	generate( builder ) {

		const { scope } = this;
		const { renderer } = builder;

		if ( renderer.backend.isWebGLBackend === true ) {

			builder.addFlowCode( `\t// ${scope}Barrier \n` );

		} else {

			builder.addLineFlowCode( `${scope}Barrier()` );

		}

	}

}

export default BarrierNode;

registerNodeClass( 'Barrier', BarrierNode );

export const barrier = nodeProxy( BarrierNode );

export const workgroupBarrier = () => barrier( 'workgroup' ).append();

