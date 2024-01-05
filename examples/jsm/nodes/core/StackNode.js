import Node, { addNodeClass } from './Node.js';
import { expression } from '../code/ExpressionNode.js';
import { ShaderNode, nodeProxy } from '../shadernode/ShaderNode.js';

class StackNode extends Node {

	constructor( parent = null ) {

		super();

		this.nodes = [];
		this.outputNodeInternal = null; // shouldn't start with _, because otherwise getNodeChildren() works incorrectly

		this._parent = parent;

		this._currentCond = null;

		this.isStackNode = true;

	}

	get parent() {

		return this._parent;

	}

	get outputNode() {

		return this.outputNodeInternal;

	}

	set outputNode( value ) {

		if ( value === this ) value = null; // @TODO: fix the cause of the possibility of outputNode being set to the same stack
		this.outputNodeInternal = value;

	}

	getNodeType( builder ) {

		return this.outputNode ? this.outputNode.getNodeType( builder ) : 'void';

	}

	add( node ) {

		this.nodes.push( expression().bypass( node ) );

		return this;

	}

	if( boolNode, method, method2 ) {

		this._currentCond = boolNode.cond( new ShaderNode( method ), method2 !== undefined ? new ShaderNode( method2 ) : null );

		return this.add( this._currentCond );

	}

	elseif( boolNode, method ) {

		const ifNode = boolNode.cond( new ShaderNode( method ) );

		this._currentCond.elseNode = ifNode;
		this._currentCond = ifNode;

		return this;

	}

	else( method ) {

		this._currentCond.elseNode = new ShaderNode( method );

		return this;

	}

	build( builder, output ) {

		if ( builder.getBuildStage() === 'analyze' ) return super.build( builder, output );
		if ( builder.getBuildStage() === 'setup' ) super.build( builder, output );

		const previousStack = builder.stack;

		builder.stack = this;

		for ( const node of this.nodes ) {

			node.build( builder, 'void' );

		}

		builder.stack = previousStack;

		return this.outputNode && output !== 'void' ? this.outputNode.build( builder, output ) : super.build( builder, output );

	}

}

export default StackNode;

export const stack = nodeProxy( StackNode );

addNodeClass( 'StackNode', StackNode );
