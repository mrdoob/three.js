import Node, { addNodeClass } from './Node.js';
import { bypass } from '../core/BypassNode.js';
import { expression } from '../code/ExpressionNode.js';
import { cond } from '../math/CondNode.js';
import { ShaderNode, nodeProxy, getCurrentStack, setCurrentStack } from '../shadernode/ShaderNode.js';

class StackNode extends Node {

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

		this.nodes.push( bypass( expression(), node ) );

		return this;

	}

	if( boolNode, method ) {

		const methodNode = new ShaderNode( method );
		this._currentCond = cond( boolNode, methodNode );

		return this.add( this._currentCond );

	}

	elseif( boolNode, method ) {

		const methodNode = new ShaderNode( method );
		const ifNode = cond( boolNode, methodNode );

		this._currentCond.elseNode = ifNode;
		this._currentCond = ifNode;

		return this;

	}

	else( method ) {

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

}

export default StackNode;

export const stack = nodeProxy( StackNode );

addNodeClass( 'StackNode', StackNode );
