import Node from '../../../../../src/nodes/core/Node.js';
import MathNode from '../../../../../src/nodes/math/MathNode.js';

function createBuilder() {

	const nodeData = new WeakMap();
	const nodeProperties = new WeakMap();

	return {

		getDataFromNode( node ) {

			if ( nodeData.has( node ) === false ) {

				nodeData.set( node, {} );

			}

			return nodeData.get( node );

		},

		getNodeProperties( node ) {

			if ( nodeProperties.has( node ) === false ) {

				nodeProperties.set( node, {} );

			}

			return nodeProperties.get( node );

		},

		isMatrix( type ) {

			return /^mat[234]$/.test( type );

		}

	};

}

function unwrapNode( node ) {

	while ( node.isStackNode || node.isVarNode ) {

		node = node.outputNode || node.node;

	}

	return node;

}

function getTransformDirectionOperator( transformDirectionNode ) {

	const outputNode = unwrapNode( transformDirectionNode.setup( createBuilder() ) );
	const splitNode = unwrapNode( outputNode.aNode );

	return unwrapNode( splitNode.node );

}

export default QUnit.module( 'Nodes', () => {

	QUnit.module( 'Math', () => {

		QUnit.module( 'MathNode', () => {

			QUnit.test( 'transformDirection multiplies the matrix before the direction', ( assert ) => {

				const directionNode = new Node( 'vec3' );
				const matrixNode = new Node( 'mat4' );

				let operatorNode = getTransformDirectionOperator( new MathNode( MathNode.TRANSFORM_DIRECTION, directionNode, matrixNode ) );

				assert.strictEqual( operatorNode.aNode, matrixNode, 'direction, matrix order multiplies the matrix first' );

				operatorNode = getTransformDirectionOperator( new MathNode( MathNode.TRANSFORM_DIRECTION, matrixNode, directionNode ) );

				assert.strictEqual( operatorNode.aNode, matrixNode, 'matrix, direction order keeps multiplying the matrix first' );

			} );

		} );

	} );

} );
