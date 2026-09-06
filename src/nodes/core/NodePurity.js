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
import { nodeObject } from '../tsl/TSLCore.js';

// Only built-in expressions whose shader effects are understood can be removed.
// In particular, arbitrary code, discard, storage writes and custom nodes are kept.
const leaves = /*@__PURE__*/ new Set( [ ConstNode, UniformNode, AttributeNode, ParameterNode, ModelNode, Object3DNode, ReferenceNode ] );
const expressions = /*@__PURE__*/ new Set( [ SplitNode, JoinNode, ConvertNode, ArrayElementNode, OperatorNode, MathNode, VarNode, PropertyNode ] );
const mathMethods = /*@__PURE__*/ new Set( Object.values( MathNode ) );
const operators = /*@__PURE__*/ new Set( [ '+', '-', '*', '/', '%', '==', '!=', '<', '<=', '>', '>=', '&&', '||', '^^', '&', '|', '^', '<<', '>>', '!', '~' ] );

/**
 * Whether evaluating an expression can be omitted when its result is unused.
 * Native functions have their own variable scope; inline functions do not.
 *
 * @private
 * @param {NodeBuilder} builder - The current node builder.
 * @param {Node} root - The expression to inspect.
 * @param {boolean} [functionBody=false] - Whether inspecting a native function body.
 * @return {boolean} Whether the expression has no externally visible shader effects.
 */
export function isNodePure( builder, root, functionBody = false ) {

	const visited = new Set();
	const loopInputs = new Set();

	function isLocal( node ) {

		const scope = node.getScope();

		return functionBody && ( scope.constructor === VarNode || scope.constructor === ParameterNode || ( scope.constructor === PropertyNode && scope.varying === false ) );

	}

	function visitFunction( shaderNode, parameters ) {

		const layout = shaderNode.layout;
		const fn = builder.buildFunctionNode( shaderNode );

		if ( fn._isPure !== true ) return false;

		for ( let i = 0; i < layout.inputs.length; i ++ ) {

			const input = layout.inputs[ i ];
			const parameter = nodeObject( Array.isArray( parameters ) ? parameters[ i ] : parameters[ input.name ] );

			if ( parameter === undefined || visit( parameter ) === false ) return false;

		}

		return true;

	}

	function visit( node ) {

		if ( node === null || node === undefined ) return true;
		if ( node.isNode !== true ) return false;
		if ( node._beforeNodes !== null ) return false;
		if ( builder.context.overrideNodes?.has( node ) ) return false;

		const data = builder.getDataFromNode( node );
		if ( visited.has( data ) ) return true;
		visited.add( data );

		const NodeClass = node.constructor;

		if ( leaves.has( NodeClass ) || loopInputs.has( node ) ) return true;

		if ( node.isShaderCallNodeInternal === true ) {

			if ( node.shaderNode.layout !== null ) {

				const rawInputs = node.rawInputs || [];
				const parameters = rawInputs.length === 1 && rawInputs[ 0 ]?.constructor === Object ? rawInputs[ 0 ] : rawInputs;

				return visitFunction( node.shaderNode, parameters );

			}

			return visit( node.getOutputNode( builder ) );

		}

		if ( NodeClass === FunctionOverloadingNode ) {

			return visitFunction( node.getCandidateFn( builder ).shaderNode, node.parametersNodes );

		}

		if ( NodeClass === FunctionCallNode ) {

			if ( node.functionNode._isPure !== true ) return false;

			const inputs = node.functionNode.getInputs( builder );

			return inputs.every( ( input, i ) => {

				const parameter = Array.isArray( node.parameters ) ? node.parameters[ i ] : node.parameters[ input.name ];
				return parameter !== undefined && visit( parameter );

			} );

		}

		if ( NodeClass === StackNode ) {

			return node.nodes.every( visit ) && visit( node.outputNode );

		}

		if ( NodeClass === ConditionalNode ) {

			const { condNode, ifNode, elseNode } = node.getProperties( builder );
			return visit( condNode ) && visit( ifNode ) && visit( elseNode );

		}

		if ( NodeClass === AssignNode ) {

			return isLocal( node.targetNode ) && visit( node.targetNode ) && visit( node.sourceNode );

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

		if ( NodeClass === LoopNode && functionBody ) {

			// Keep arbitrary loop-update code. Counted loops only mutate local indices.
			if ( node.params.length < 2 ) return false;

			for ( const param of node.params.slice( 0, - 1 ) ) {

				if ( param.isNode === true ) {

					if ( param.getNodeType( builder ) === 'bool' || visit( param ) === false ) return false;

				} else {

					if ( param.update !== undefined ) return false;
					if ( param.condition !== undefined && [ '<', '<=', '>', '>=' ].includes( param.condition ) === false ) return false;
					if ( typeof param.start === 'string' || typeof param.end === 'string' ) return false;
					if ( param.start?.isNode && visit( param.start ) === false ) return false;
					if ( param.end?.isNode && visit( param.end ) === false ) return false;

				}

			}

			const properties = node.getProperties( builder );
			for ( const input of Object.values( properties.inputs ) ) loopInputs.add( input );

			return visit( properties.stackNode ) && visit( properties.returnsNode ) && visit( properties.updateNode );

		}

		if ( expressions.has( NodeClass ) ) {

			if ( NodeClass === MathNode && mathMethods.has( node.method ) === false ) return false;
			if ( NodeClass === OperatorNode && operators.has( node.op ) === false ) return false;

			for ( const child of node.getChildren() ) {

				if ( visit( child ) === false ) return false;

			}

			return true;

		}

		return false;

	}

	return visit( root );

}
