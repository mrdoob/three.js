import TempNode from '../core/TempNode.js';
import { nodeProxy } from '../tsl/TSLCore.js';

class AtomicFunctionNode extends TempNode {

	static get type() {

		return 'AtomicFunctionNode';

	}

	constructor( method, pointerNode, valueNode, storeNode = null ) {

		super( 'uint' );

		this.method = method;

		this.pointerNode = pointerNode;
		this.valueNode = valueNode;
		this.storeNode = storeNode;

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

		const methodSnippet = `${ builder.getMethod( method, type ) }( ${params.join( ', ' )} )`;

		if ( this.storeNode !== null ) {

			const varSnippet = this.storeNode.build( builder, inputType );

			builder.addLineFlowCode( `${varSnippet} = ${methodSnippet}`, this );

		} else {

			builder.addLineFlowCode( methodSnippet, this );

		}

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

export const atomicFunc = ( method, pointerNode, valueNode, storeNode ) => {

	const node = atomicNode( method, pointerNode, valueNode, storeNode );
	node.append();

	return node;

};

export const atomicStore = ( pointerNode, valueNode, storeNode = null ) => atomicFunc( AtomicFunctionNode.ATOMIC_STORE, pointerNode, valueNode, storeNode );
export const atomicAdd = ( pointerNode, valueNode, storeNode = null ) => atomicFunc( AtomicFunctionNode.ATOMIC_ADD, pointerNode, valueNode, storeNode );
export const atomicSub = ( pointerNode, valueNode, storeNode = null ) => atomicFunc( AtomicFunctionNode.ATOMIC_SUB, pointerNode, valueNode, storeNode );
export const atomicMax = ( pointerNode, valueNode, storeNode = null ) => atomicFunc( AtomicFunctionNode.ATOMIC_MAX, pointerNode, valueNode, storeNode );
export const atomicMin = ( pointerNode, valueNode, storeNode = null ) => atomicFunc( AtomicFunctionNode.ATOMIC_MIN, pointerNode, valueNode, storeNode );
export const atomicAnd = ( pointerNode, valueNode, storeNode = null ) => atomicFunc( AtomicFunctionNode.ATOMIC_AND, pointerNode, valueNode, storeNode );
export const atomicOr = ( pointerNode, valueNode, storeNode = null ) => atomicFunc( AtomicFunctionNode.ATOMIC_OR, pointerNode, valueNode, storeNode );
export const atomicXor = ( pointerNode, valueNode, storeNode = null ) => atomicFunc( AtomicFunctionNode.ATOMIC_XOR, pointerNode, valueNode, storeNode );
