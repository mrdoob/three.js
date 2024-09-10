import TempNode from '../core/TempNode.js';
import { nodeProxy } from '../tsl/TSLCore.js';

class AtomicFunctionNode extends TempNode {

	static get type() {

		return 'AtomicFunctionNode';

	}

	constructor( method, pointerNode, valueNode ) {

		super( 'uint' );

		this.method = method;

		this.pointerNode = pointerNode;
		this.valueNode = valueNode;

	}

	getInputType( builder ) {

		return this.pointerNode.getNodeType( builder );

	}

	getNodeType( builder ) {

		return this.getInputType( builder );

	}

	generate( builder ) {

		const method = this.method;

		const type = this.getNodeType( builder );
		const inputType = this.getInputType( builder );

		const a = this.pointerNode;
		const b = this.valueNode;

		const params = [];

		params.push( `&${ a.build( builder, inputType ) }` );
		params.push( b.build( builder, inputType ) );

		builder.addLineFlowCode( `${ builder.getMethod( method, type ) }( ${params.join( ', ' )} )` );

	}

}

AtomicFunctionNode.ATOMIC_LOAD = 'atomicLoad';
AtomicFunctionNode.ATOMIC_STORE = 'atomicStore';
AtomicFunctionNode.ATOMIC_ADD = 'atomicAdd';
AtomicFunctionNode.ATOMIC_SUB = 'atomicSub';
AtomicFunctionNode.ATOMIC_MAX = 'atomicMax';
AtomicFunctionNode.ATOMIC_MIN = 'atomicMin';
AtomicFunctionNode.ATOMIC_AND = 'atomicAnd';
AtomicFunctionNode.ATOMIC_OR = 'atomicOr';
AtomicFunctionNode.ATOMIC_XOR = 'atomicXor';

export default AtomicFunctionNode;

const atomicNode = nodeProxy( AtomicFunctionNode );

export const atomicFunc = ( method, pointerNode, valueNode ) => {

	const node = atomicNode( method, pointerNode, valueNode );
	node.append();

	return node;

};

export const atomicStore = ( pointerNode, valueNode ) => atomicFunc( AtomicFunctionNode.ATOMIC_STORE, pointerNode, valueNode );
export const atomicAdd = ( pointerNode, valueNode ) => atomicFunc( AtomicFunctionNode.ATOMIC_ADD, pointerNode, valueNode );
export const atomicSub = ( pointerNode, valueNode ) => atomicFunc( AtomicFunctionNode.ATOMIC_SUB, pointerNode, valueNode );
export const atomicMax = ( pointerNode, valueNode ) => atomicFunc( AtomicFunctionNode.ATOMIC_MAX, pointerNode, valueNode );
export const atomicMin = ( pointerNode, valueNode ) => atomicFunc( AtomicFunctionNode.ATOMIC_MIN, pointerNode, valueNode );
export const atomicAnd = ( pointerNode, valueNode ) => atomicFunc( AtomicFunctionNode.ATOMIC_AND, pointerNode, valueNode );
export const atomicOr = ( pointerNode, valueNode ) => atomicFunc( AtomicFunctionNode.ATOMIC_OR, pointerNode, valueNode );
export const atomicXor = ( pointerNode, valueNode ) => atomicFunc( AtomicFunctionNode.ATOMIC_XOR, pointerNode, valueNode );
