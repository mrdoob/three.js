import { WebGLCoordinateSystem } from '../../constants.js';
import TempNode from '../core/TempNode.js';
import { addMethodChaining, Fn, int, nodeProxyIntent } from '../tsl/TSLCore.js';

const _vectorOperators = {
	'==': 'equal',
	'!=': 'notEqual',
	'<': 'lessThan',
	'>': 'greaterThan',
	'<=': 'lessThanEqual',
	'>=': 'greaterThanEqual',
	'%': 'mod'
};

/**
 * This node represents basic mathematical and logical operations like addition,
 * subtraction or comparisons (e.g. `equal()`).
 *
 * @augments TempNode
 */
class OperatorNode extends TempNode {

	static get type() {

		return 'OperatorNode';

	}

	/**
	 * Constructs a new operator node.
	 *
	 * @param {string} op - The operator.
	 * @param {Node} aNode - The first input.
	 * @param {Node} bNode - The second input.
	 * @param {...Node} params - Additional input parameters.
	 */
	constructor( op, aNode, bNode, ...params ) {

		super();

		if ( params.length > 0 ) {

			let finalOp = new OperatorNode( op, aNode, bNode );

			for ( let i = 0; i < params.length - 1; i ++ ) {

				finalOp = new OperatorNode( op, finalOp, params[ i ] );

			}

			aNode = finalOp;
			bNode = params[ params.length - 1 ];

		}

		/**
		 * The operator.
		 *
		 * @type {string}
		 */
		this.op = op;

		/**
		 * The first input.
		 *
		 * @type {Node}
		 */
		this.aNode = aNode;

		/**
		 * The second input.
		 *
		 * @type {Node}
		 */
		this.bNode = bNode;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isOperatorNode = true;

	}

	/**
	 * Returns the operator method name.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @param {string} output - The output type.
	 * @returns {string} The operator method name.
	 */
	getOperatorMethod( builder, output ) {

		return builder.getMethod( _vectorOperators[ this.op ], output );

	}

	/**
	 * This method is overwritten since the node type is inferred from the operator
	 * and the input node types.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The node type.
	 */
	getNodeType( builder ) {

		const op = this.op;

		const aNode = this.aNode;
		const bNode = this.bNode;

		const typeA = aNode.getNodeType( builder );
		const typeB = bNode ? bNode.getNodeType( builder ) : null;

		if ( typeA === 'void' || typeB === 'void' ) {

			return 'void';

		} else if ( op === '%' ) {

			return typeA;

		} else if ( op === '~' || op === '&' || op === '|' || op === '^' || op === '>>' || op === '<<' ) {

			return builder.getIntegerType( typeA );

		} else if ( op === '!' || op === '&&' || op === '||' || op === '^^' ) {

			return 'bool';

		} else if ( op === '==' || op === '!=' || op === '<' || op === '>' || op === '<=' || op === '>=' ) {

			const typeLength = Math.max( builder.getTypeLength( typeA ), builder.getTypeLength( typeB ) );

			return typeLength > 1 ? `bvec${ typeLength }` : 'bool';

		} else {

			// Handle matrix operations

			if ( builder.isMatrix( typeA ) ) {

				if ( typeB === 'float' ) {

					return typeA; // matrix * scalar = matrix

				} else if ( builder.isVector( typeB ) ) {

					return builder.getVectorFromMatrix( typeA ); // matrix * vector

				} else if ( builder.isMatrix( typeB ) ) {

					return typeA; // matrix * matrix

				}

			} else if ( builder.isMatrix( typeB ) ) {

				if ( typeA === 'float' ) {

					return typeB; // scalar * matrix = matrix

				} else if ( builder.isVector( typeA ) ) {

					return builder.getVectorFromMatrix( typeB ); // vector * matrix

				}

			}

			// Handle non-matrix cases

			if ( builder.getTypeLength( typeB ) > builder.getTypeLength( typeA ) ) {

				// anytype x anytype: use the greater length vector

				return typeB;

			}

			return typeA;

		}

	}

	generate( builder, output ) {

		const op = this.op;

		const { aNode, bNode } = this;

		const type = this.getNodeType( builder );

		let typeA = null;
		let typeB = null;

		if ( type !== 'void' ) {

			typeA = aNode.getNodeType( builder );
			typeB = bNode ? bNode.getNodeType( builder ) : null;

			if ( op === '<' || op === '>' || op === '<=' || op === '>=' || op === '==' || op === '!=' ) {

				if ( builder.isVector( typeA ) ) {

					typeB = typeA;

				} else if ( builder.isVector( typeB ) ) {

					typeA = typeB;

				} else if ( typeA !== typeB ) {

					typeA = typeB = 'float';

				}

			} else if ( op === '>>' || op === '<<' ) {

				typeA = type;
				typeB = builder.changeComponentType( typeB, 'uint' );

			} else if ( op === '%' ) {

				typeA = type;
				typeB = builder.isInteger( typeA ) && builder.isInteger( typeB ) ? typeB : typeA;

			} else if ( builder.isMatrix( typeA ) ) {

				if ( typeB === 'float' ) {

					// Keep matrix type for typeA, but ensure typeB stays float

					typeB = 'float';

				} else if ( builder.isVector( typeB ) ) {

					// matrix x vector
					typeB = builder.getVectorFromMatrix( typeA );

				} else if ( builder.isMatrix( typeB ) ) {

					// matrix x matrix - keep both types

				} else {

					typeA = typeB = type;

				}

			} else if ( builder.isMatrix( typeB ) ) {

				if ( typeA === 'float' ) {

					// Keep matrix type for typeB, but ensure typeA stays float

					typeA = 'float';

				} else if ( builder.isVector( typeA ) ) {

					// vector x matrix

					typeA = builder.getVectorFromMatrix( typeB );

				} else {

					typeA = typeB = type;

				}

			} else {

				// anytype x anytype

				typeA = typeB = type;

			}

		} else {

			typeA = typeB = type;

		}

		const a = aNode.build( builder, typeA );
		const b = bNode ? bNode.build( builder, typeB ) : null;

		const fnOpSnippet = builder.getFunctionOperator( op );

		if ( output !== 'void' ) {

			const isGLSL = builder.renderer.coordinateSystem === WebGLCoordinateSystem;

			if ( op === '==' || op === '!=' || op === '<' || op === '>' || op === '<=' || op === '>=' ) {

				if ( isGLSL ) {

					if ( builder.isVector( typeA ) ) {

						return builder.format( `${ this.getOperatorMethod( builder, output ) }( ${ a }, ${ b } )`, type, output );

					} else {

						return builder.format( `( ${ a } ${ op } ${ b } )`, type, output );

					}

				} else {

					// WGSL

					return builder.format( `( ${ a } ${ op } ${ b } )`, type, output );

				}

			} else if ( op === '%' ) {

				if ( builder.isInteger( typeB ) ) {

					return builder.format( `( ${ a } % ${ b } )`, type, output );

				} else {

					return builder.format( `${ this.getOperatorMethod( builder, type ) }( ${ a }, ${ b } )`, type, output );

				}

			} else if ( op === '!' || op === '~' ) {

				return builder.format( `(${op}${a})`, typeA, output );

			} else if ( fnOpSnippet ) {

				return builder.format( `${ fnOpSnippet }( ${ a }, ${ b } )`, type, output );

			} else {

				// Handle matrix operations

				if ( builder.isMatrix( typeA ) && typeB === 'float' ) {

					return builder.format( `( ${ b } ${ op } ${ a } )`, type, output );

				} else if ( typeA === 'float' && builder.isMatrix( typeB ) ) {

					return builder.format( `${ a } ${ op } ${ b }`, type, output );

				} else {

					let snippet = `( ${ a } ${ op } ${ b } )`;

					if ( ! isGLSL && type === 'bool' && builder.isVector( typeA ) && builder.isVector( typeB ) ) {

						snippet = `all${ snippet }`;

					}

					return builder.format( snippet, type, output );

				}

			}

		} else if ( typeA !== 'void' ) {

			if ( fnOpSnippet ) {

				return builder.format( `${ fnOpSnippet }( ${ a }, ${ b } )`, type, output );

			} else {

				if ( builder.isMatrix( typeA ) && typeB === 'float' ) {

					return builder.format( `${ b } ${ op } ${ a }`, type, output );

				} else {

					return builder.format( `${ a } ${ op } ${ b }`, type, output );

				}

			}

		}

	}

	serialize( data ) {

		super.serialize( data );

		data.op = this.op;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.op = data.op;

	}

}

export default OperatorNode;

/**
 * Returns the addition of two or more value.
 *
 * @tsl
 * @function
 * @param {Node} a - The first input.
 * @param {Node} b - The second input.
 * @param {...Node} params - Additional input parameters.
 * @returns {OperatorNode}
 */
export const add = /*@__PURE__*/ nodeProxyIntent( OperatorNode, '+' ).setParameterLength( 2, Infinity ).setName( 'add' );

/**
 * Returns the subtraction of two or more value.
 *
 * @tsl
 * @function
 * @param {Node} a - The first input.
 * @param {Node} b - The second input.
 * @param {...Node} params - Additional input parameters.
 * @returns {OperatorNode}
 */
export const sub = /*@__PURE__*/ nodeProxyIntent( OperatorNode, '-' ).setParameterLength( 2, Infinity ).setName( 'sub' );

/**
 * Returns the multiplication of two or more value.
 *
 * @tsl
 * @function
 * @param {Node} a - The first input.
 * @param {Node} b - The second input.
 * @param {...Node} params - Additional input parameters.
 * @returns {OperatorNode}
 */
export const mul = /*@__PURE__*/ nodeProxyIntent( OperatorNode, '*' ).setParameterLength( 2, Infinity ).setName( 'mul' );

/**
 * Returns the division of two or more value.
 *
 * @tsl
 * @function
 * @param {Node} a - The first input.
 * @param {Node} b - The second input.
 * @param {...Node} params - Additional input parameters.
 * @returns {OperatorNode}
 */
export const div = /*@__PURE__*/ nodeProxyIntent( OperatorNode, '/' ).setParameterLength( 2, Infinity ).setName( 'div' );

/**
 * Computes the remainder of dividing the first node by the second one.
 *
 * @tsl
 * @function
 * @param {Node} a - The first input.
 * @param {Node} b - The second input.
 * @returns {OperatorNode}
 */
export const mod = /*@__PURE__*/ nodeProxyIntent( OperatorNode, '%' ).setParameterLength( 2 ).setName( 'mod' );

/**
 * Checks if two nodes are equal.
 *
 * @tsl
 * @function
 * @param {Node} a - The first input.
 * @param {Node} b - The second input.
 * @returns {OperatorNode}
 */
export const equal = /*@__PURE__*/ nodeProxyIntent( OperatorNode, '==' ).setParameterLength( 2 ).setName( 'equal' );

/**
 * Checks if two nodes are not equal.
 *
 * @tsl
 * @function
 * @param {Node} a - The first input.
 * @param {Node} b - The second input.
 * @returns {OperatorNode}
 */
export const notEqual = /*@__PURE__*/ nodeProxyIntent( OperatorNode, '!=' ).setParameterLength( 2 ).setName( 'notEqual' );

/**
 * Checks if the first node is less than the second.
 *
 * @tsl
 * @function
 * @param {Node} a - The first input.
 * @param {Node} b - The second input.
 * @returns {OperatorNode}
 */
export const lessThan = /*@__PURE__*/ nodeProxyIntent( OperatorNode, '<' ).setParameterLength( 2 ).setName( 'lessThan' );

/**
 * Checks if the first node is greater than the second.
 *
 * @tsl
 * @function
 * @param {Node} a - The first input.
 * @param {Node} b - The second input.
 * @returns {OperatorNode}
 */
export const greaterThan = /*@__PURE__*/ nodeProxyIntent( OperatorNode, '>' ).setParameterLength( 2 ).setName( 'greaterThan' );

/**
 * Checks if the first node is less than or equal to the second.
 *
 * @tsl
 * @function
 * @param {Node} a - The first input.
 * @param {Node} b - The second input.
 * @returns {OperatorNode}
 */
export const lessThanEqual = /*@__PURE__*/ nodeProxyIntent( OperatorNode, '<=' ).setParameterLength( 2 ).setName( 'lessThanEqual' );

/**
 * Checks if the first node is greater than or equal to the second.
 *
 * @tsl
 * @function
 * @param {Node} a - The first input.
 * @param {Node} b - The second input.
 * @returns {OperatorNode}
 */
export const greaterThanEqual = /*@__PURE__*/ nodeProxyIntent( OperatorNode, '>=' ).setParameterLength( 2 ).setName( 'greaterThanEqual' );

/**
 * Performs a logical AND operation on multiple nodes.
 *
 * @tsl
 * @function
 * @param {...Node} nodes - The input nodes to be combined using AND.
 * @returns {OperatorNode}
 */
export const and = /*@__PURE__*/ nodeProxyIntent( OperatorNode, '&&' ).setParameterLength( 2, Infinity ).setName( 'and' );

/**
 * Performs a logical OR operation on multiple nodes.
 *
 * @tsl
 * @function
 * @param {...Node} nodes - The input nodes to be combined using OR.
 * @returns {OperatorNode}
 */
export const or = /*@__PURE__*/ nodeProxyIntent( OperatorNode, '||' ).setParameterLength( 2, Infinity ).setName( 'or' );

/**
 * Performs logical NOT on a node.
 *
 * @tsl
 * @function
 * @param {Node} value - The value.
 * @returns {OperatorNode}
 */
export const not = /*@__PURE__*/ nodeProxyIntent( OperatorNode, '!' ).setParameterLength( 1 ).setName( 'not' );

/**
 * Performs logical XOR on two nodes.
 *
 * @tsl
 * @function
 * @param {Node} a - The first input.
 * @param {Node} b - The second input.
 * @returns {OperatorNode}
 */
export const xor = /*@__PURE__*/ nodeProxyIntent( OperatorNode, '^^' ).setParameterLength( 2 ).setName( 'xor' );

/**
 * Performs bitwise AND on two nodes.
 *
 * @tsl
 * @function
 * @param {Node} a - The first input.
 * @param {Node} b - The second input.
 * @returns {OperatorNode}
 */
export const bitAnd = /*@__PURE__*/ nodeProxyIntent( OperatorNode, '&' ).setParameterLength( 2 ).setName( 'bitAnd' );

/**
 * Performs bitwise NOT on a node.
 *
 * @tsl
 * @function
 * @param {Node} a - The first input.
 * @param {Node} b - The second input.
 * @returns {OperatorNode}
 */
export const bitNot = /*@__PURE__*/ nodeProxyIntent( OperatorNode, '~' ).setParameterLength( 2 ).setName( 'bitNot' );

/**
 * Performs bitwise OR on two nodes.
 *
 * @tsl
 * @function
 * @param {Node} a - The first input.
 * @param {Node} b - The second input.
 * @returns {OperatorNode}
 */
export const bitOr = /*@__PURE__*/ nodeProxyIntent( OperatorNode, '|' ).setParameterLength( 2 ).setName( 'bitOr' );

/**
 * Performs bitwise XOR on two nodes.
 *
 * @tsl
 * @function
 * @param {Node} a - The first input.
 * @param {Node} b - The second input.
 * @returns {OperatorNode}
 */
export const bitXor = /*@__PURE__*/ nodeProxyIntent( OperatorNode, '^' ).setParameterLength( 2 ).setName( 'bitXor' );

/**
 * Shifts a node to the left.
 *
 * @tsl
 * @function
 * @param {Node} a - The node to shift.
 * @param {Node} b - The value to shift.
 * @returns {OperatorNode}
 */
export const shiftLeft = /*@__PURE__*/ nodeProxyIntent( OperatorNode, '<<' ).setParameterLength( 2 ).setName( 'shiftLeft' );

/**
 * Shifts a node to the right.
 *
 * @tsl
 * @function
 * @param {Node} a - The node to shift.
 * @param {Node} b - The value to shift.
 * @returns {OperatorNode}
 */
export const shiftRight = /*@__PURE__*/ nodeProxyIntent( OperatorNode, '>>' ).setParameterLength( 2 ).setName( 'shiftRight' );

/**
 * Increments a node by 1.
 *
 * @tsl
 * @function
 * @param {Node} a - The node to increment.
 * @returns {OperatorNode}
 */
export const incrementBefore = Fn( ( [ a ] ) => {

	a.addAssign( 1 );
	return a;

} );

/**
 * Decrements a node by 1.
 *
 * @tsl
 * @function
 * @param {Node} a - The node to decrement.
 * @returns {OperatorNode}
 */
export const decrementBefore = Fn( ( [ a ] ) => {

	a.subAssign( 1 );
	return a;

} );

/**
 * Increments a node by 1 and returns the previous value.
 *
 * @tsl
 * @function
 * @param {Node} a - The node to increment.
 * @returns {OperatorNode}
 */
export const increment = /*@__PURE__*/ Fn( ( [ a ] ) => {

	const temp = int( a ).toConst();
	a.addAssign( 1 );
	return temp;

} );

/**
 * Decrements a node by 1 and returns the previous value.
 *
 * @tsl
 * @function
 * @param {Node} a - The node to decrement.
 * @returns {OperatorNode}
 */
export const decrement = /*@__PURE__*/ Fn( ( [ a ] ) => {

	const temp = int( a ).toConst();
	a.subAssign( 1 );
	return temp;

} );

addMethodChaining( 'add', add );
addMethodChaining( 'sub', sub );
addMethodChaining( 'mul', mul );
addMethodChaining( 'div', div );
addMethodChaining( 'mod', mod );
addMethodChaining( 'equal', equal );
addMethodChaining( 'notEqual', notEqual );
addMethodChaining( 'lessThan', lessThan );
addMethodChaining( 'greaterThan', greaterThan );
addMethodChaining( 'lessThanEqual', lessThanEqual );
addMethodChaining( 'greaterThanEqual', greaterThanEqual );
addMethodChaining( 'and', and );
addMethodChaining( 'or', or );
addMethodChaining( 'not', not );
addMethodChaining( 'xor', xor );
addMethodChaining( 'bitAnd', bitAnd );
addMethodChaining( 'bitNot', bitNot );
addMethodChaining( 'bitOr', bitOr );
addMethodChaining( 'bitXor', bitXor );
addMethodChaining( 'shiftLeft', shiftLeft );
addMethodChaining( 'shiftRight', shiftRight );

addMethodChaining( 'incrementBefore', incrementBefore );
addMethodChaining( 'decrementBefore', decrementBefore );
addMethodChaining( 'increment', increment );
addMethodChaining( 'decrement', decrement );

/**
 * @tsl
 * @function
 * @deprecated since r175. Use {@link mod} instead.
 *
 * @param {Node} a - The first input.
 * @param {Node} b - The second input.
 * @returns {OperatorNode}
 */
export const modInt = ( a, b ) => { // @deprecated, r175

	console.warn( 'THREE.TSL: "modInt()" is deprecated. Use "mod( int( ... ) )" instead.' );
	return mod( int( a ), int( b ) );

};

addMethodChaining( 'modInt', modInt );
