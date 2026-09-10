import ConstNode from './ConstNode.js';
import UniformNode from './UniformNode.js';
import AttributeNode from './AttributeNode.js';
import ParameterNode from './ParameterNode.js';
import PropertyNode from './PropertyNode.js';
import VarNode from './VarNode.js';
import VaryingNode from './VaryingNode.js';
import StackNode from './StackNode.js';
import ContextNode from './ContextNode.js';
import IsolateNode from './IsolateNode.js';
import SubBuildNode from './SubBuildNode.js';
import AssignNode from './AssignNode.js';
import SplitNode from '../utils/SplitNode.js';
import JoinNode from '../utils/JoinNode.js';
import ConvertNode from '../utils/ConvertNode.js';
import ArrayElementNode from '../utils/ArrayElementNode.js';
import FunctionOverloadingNode from '../utils/FunctionOverloadingNode.js';
import LoopNode from '../utils/LoopNode.js';
import OperatorNode from '../math/OperatorNode.js';
import MathNode from '../math/MathNode.js';
import ConditionalNode from '../math/ConditionalNode.js';
import ModelNode from '../accessors/ModelNode.js';
import Object3DNode from '../accessors/Object3DNode.js';
import ReferenceNode from '../accessors/ReferenceNode.js';
import FunctionCallNode from '../code/FunctionCallNode.js';
import { isArrayAsParameter } from './NodeUtils.js';
import { nodeObject } from '../tsl/TSLCore.js';

// Only exact built-in classes are eligible; subclasses may add shader effects.
const pureLeaves = /*@__PURE__*/ new Set( [
	ConstNode, UniformNode, AttributeNode, ParameterNode,
	ModelNode, Object3DNode, ReferenceNode
] );
const pureExpressions = /*@__PURE__*/ new Set( [
	SplitNode, JoinNode, ConvertNode, ArrayElementNode,
	OperatorNode, MathNode, VarNode, PropertyNode
] );
const mathMethods = /*@__PURE__*/ new Set( Object.values( MathNode ) );
const operators = /*@__PURE__*/ new Set( [
	'+', '-', '*', '/', '%',
	'==', '!=', '<', '<=', '>', '>=',
	'&&', '||', '^^', '&', '|', '^', '<<', '>>', '!', '~'
] );
const loopConditions = /*@__PURE__*/ new Set( [ '<', '<=', '>', '>=' ] );

/**
 * Whether evaluating an expression can be omitted when its result is unused.
 * Native functions have their own variable scope; inline functions do not.
 *
 * @private
 * @param {NodeBuilder} builder - The current node builder.
 * @param {Node} root - The expression to inspect.
 * @param {?Object<string,Array<NodeVar>>} [functionVariables=null] - The native function's local variables, by shader stage. Omit for inline expressions.
 * @return {boolean} Whether the expression has no externally visible shader effects.
 */
export function isNodePure( builder, root, functionVariables = null ) {

	const visited = new Set();
	const loopInputs = new Set();

	function isLocalVariable( node ) {

		if ( functionVariables === null ) return false;

		const scope = node.getScope();
		const NodeClass = scope.constructor;

		if ( NodeClass === ParameterNode ) return true;
		if ( NodeClass !== VarNode && NodeClass !== PropertyNode ) return false;
		if ( NodeClass === PropertyNode && scope.varying ) return false;

		// Global nodes can already have a variable in an enclosing shader scope.
		// Only writes to declarations owned by this function can be discarded.
		const data = builder.getDataFromNode( scope );
		const variable = data[ builder.getSubBuildProperty( 'variable', data.subBuilds ) ];

		return functionVariables[ builder.shaderStage ]?.includes( variable ) === true;

	}

	function visitParameters( inputs, parameters ) {

		const isArray = Array.isArray( parameters );

		for ( let i = 0; i < inputs.length; i ++ ) {

			const key = isArray ? i : inputs[ i ].name;
			const parameter = nodeObject( parameters?.[ key ] );

			if ( parameter === undefined || visit( parameter ) === false ) return false;

		}

		return true;

	}

	function visitFunction( shaderNode, parameters ) {

		const fn = builder.buildFunctionNode( shaderNode );

		return fn._isPure === true && visitParameters( shaderNode.layout.inputs, parameters );

	}

	function visitLoop( node ) {

		// Counted loops only mutate local indices. Keep arbitrary update code.
		if ( functionVariables === null || node.params.length < 2 ) return false;

		for ( let i = 0; i < node.params.length - 1; i ++ ) {

			const param = node.params[ i ];

			if ( param.isNode === true ) {

				if ( param.getNodeType( builder ) === 'bool' || visit( param ) === false ) return false;

			} else {

				const { start, end, condition, update } = param;

				if ( update !== undefined ) return false;
				if ( condition !== undefined && loopConditions.has( condition ) === false ) return false;
				if ( typeof start === 'string' || typeof end === 'string' ) return false;
				if ( start?.isNode && visit( start ) === false ) return false;
				if ( end?.isNode && visit( end ) === false ) return false;

			}

		}

		const properties = node.getProperties( builder );

		for ( const input of Object.values( properties.inputs ) ) loopInputs.add( input );

		return visit( properties.stackNode ) && visit( properties.returnsNode ) && visit( properties.updateNode );

	}

	function visit( node ) {

		if ( node === null || node === undefined ) return true;
		if ( node.isNode !== true ) return false;
		if ( node._beforeNodes !== null ) return false;
		if ( builder.context.overrideNodes?.has( node ) ) return false;

		const NodeClass = node.constructor;

		if ( pureLeaves.has( NodeClass ) || loopInputs.has( node ) ) return true;

		const data = builder.getDataFromNode( node );

		if ( visited.has( data ) ) return true;
		visited.add( data );

		if ( pureExpressions.has( NodeClass ) ) {

			if ( NodeClass === MathNode && mathMethods.has( node.method ) === false ) return false;
			if ( NodeClass === OperatorNode && operators.has( node.op ) === false ) return false;

			for ( const child of node.getChildren() ) {

				if ( visit( child ) === false ) return false;

			}

			return true;

		}

		if ( node.isShaderCallNodeInternal === true ) {

			if ( node.shaderNode.layout !== null ) {

				const rawInputs = node.rawInputs || [];
				const parameters = isArrayAsParameter( rawInputs ) ? rawInputs : rawInputs[ 0 ];

				return visitFunction( node.shaderNode, parameters );

			}

			return visit( node.getOutputNode( builder ) );

		}

		if ( NodeClass === FunctionOverloadingNode ) {

			return visitFunction( node.getCandidateFn( builder ).shaderNode, node.parametersNodes );

		}

		if ( NodeClass === FunctionCallNode ) {

			const fn = node.functionNode;

			return fn._isPure === true && visitParameters( fn.getInputs( builder ), node.parameters );

		}

		if ( NodeClass === StackNode ) {

			return node.nodes.every( visit ) && visit( node.outputNode );

		}

		if ( NodeClass === ConditionalNode ) {

			const { condNode, ifNode, elseNode } = node.getProperties( builder );

			return visit( condNode ) && visit( ifNode ) && visit( elseNode );

		}

		if ( NodeClass === AssignNode ) {

			return isLocalVariable( node.targetNode ) && visit( node.targetNode ) && visit( node.sourceNode );

		}

		if ( NodeClass === ContextNode ) {

			const previousContext = builder.addContext( node.value );

			const result = visit( node.node );

			builder.setContext( previousContext );

			return result;

		}

		if ( NodeClass === IsolateNode ) {

			const previousCache = builder.getCache();

			builder.setCache( builder.getCacheFromNode( node, node.parent ) );

			const result = visit( node.node );

			builder.setCache( previousCache );

			return result;

		}

		if ( NodeClass === VaryingNode ) {

			const previousStage = builder.shaderStage;

			builder.setShaderStage( 'vertex' );

			const result = visit( node.node );

			builder.setShaderStage( previousStage );

			return result;

		}

		if ( NodeClass === SubBuildNode ) {

			builder.addSubBuild( node.name );

			const result = visit( node.node );

			builder.removeSubBuild();

			return result;

		}

		if ( NodeClass === LoopNode ) {

			return visitLoop( node );

		}

		return false;

	}

	return visit( root );

}
