import Node from './Node.js';
import { select } from '../math/ConditionalNode.js';
import { ShaderNode, nodeProxy, getCurrentStack, setCurrentStack } from '../tsl/TSLBase.js';

class StackNode extends Node {

	static get type() {

		return 'StackNode';

	}

	constructor( parent = null ) {

		super();

		this.nodes = [];
		this.outputNode = null;

		this.parent = parent;

		this._currentCond = null;

		this.isStackNode = true;

	}

	getNodeType( builder ) {

		return this.outputNode ? this.outputNode.getNodeType( builder ) : 'void';

	}

	add( node ) {

		this.nodes.push( node );

		return this;

	}

	If( boolNode, method ) {

		const methodNode = new ShaderNode( method );
		this._currentCond = select( boolNode, methodNode );

		return this.add( this._currentCond );

	}

	ElseIf( boolNode, method ) {

		const methodNode = new ShaderNode( method );
		const ifNode = select( boolNode, methodNode );

		this._currentCond.elseNode = ifNode;
		this._currentCond = ifNode;

		return this;

	}

	Else( method ) {

		this._currentCond.elseNode = new ShaderNode( method );

		return this;

	}

	build( builder, ...params ) {

		const previousStack = getCurrentStack();

		setCurrentStack( this );

		for ( const node of this.nodes ) {

			node.build( builder, 'void' );

		}

		setCurrentStack( previousStack );

		return this.outputNode ? this.outputNode.build( builder, ...params ) : super.build( builder, ...params );

	}

	//

	else( ...params ) { // @deprecated, r168

		console.warn( 'TSL.StackNode: .else() has been renamed to .Else().' );
		return this.Else( ...params );

	}

	elseif( ...params ) { // @deprecated, r168

		console.warn( 'TSL.StackNode: .elseif() has been renamed to .ElseIf().' );
		return this.ElseIf( ...params );

	}

}

export default StackNode;

export const stack = /*@__PURE__*/ nodeProxy( StackNode );
