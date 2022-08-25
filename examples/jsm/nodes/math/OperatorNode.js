import TempNode from '../core/TempNode.js';

class OperatorNode extends TempNode {

	constructor( op, aNode, bNode, ...params ) {

		super();

		this.op = op;

		if ( params.length > 0 ) {

			let finalBNode = bNode;

			for ( let i = 0; i < params.length; i ++ ) {

				finalBNode = new OperatorNode( op, finalBNode, params[ i ] );

			}

			bNode = finalBNode;

		}

		this.aNode = aNode;
		this.bNode = bNode;

	}

	getNodeType( builder, output ) {

		const op = this.op;

		const aNode = this.aNode;
		const bNode = this.bNode;

		const typeA = aNode.getNodeType( builder );
		const typeB = bNode.getNodeType( builder );

		if ( typeA === 'void' || typeB === 'void' ) {

			return 'void';

		} else if ( op === '=' || op === '%' ) {

			return typeA;

		} else if ( op === '&' || op === '|' || op === '^' || op === '>>' || op === '<<' ) {

			return 'int';

		} else if ( op === '==' || op === '&&' || op === '||' || op === '^^' ) {

			return 'bool';

		} else if ( op === '<' || op === '>' || op === '<=' || op === '>=' ) {

			const typeLength = builder.getTypeLength( output );

			return typeLength > 1 ? `bvec${ typeLength }` : 'bool';

		} else {

			if ( typeA === 'float' && builder.isMatrix( typeB ) ) {

				return typeB;

			} else if ( builder.isMatrix( typeA ) && builder.isVector( typeB ) ) {

				// matrix x vector

				return builder.getVectorFromMatrix( typeA );

			} else if ( builder.isVector( typeA ) && builder.isMatrix( typeB ) ) {

				// vector x matrix

				return builder.getVectorFromMatrix( typeB );

			} else if ( builder.getTypeLength( typeB ) > builder.getTypeLength( typeA ) ) {

				// anytype x anytype: use the greater length vector

				return typeB;

			}

			return typeA;

		}

	}

	generate( builder, output ) {

		const op = this.op;

		const aNode = this.aNode;
		const bNode = this.bNode;

		const type = this.getNodeType( builder, output );

		let typeA = null;
		let typeB = null;

		if ( type !== 'void' ) {

			typeA = aNode.getNodeType( builder );
			typeB = bNode.getNodeType( builder );

			if ( op === '=' ) {

				typeB = typeA;

			} else if ( op === '<' || op === '>' || op === '<=' || op === '>=' ) {

				if ( builder.isVector( typeA ) ) {

					typeB = typeA;

				} else {

					typeA = typeB = 'float';

				}

			} else if ( builder.isMatrix( typeA ) && builder.isVector( typeB ) ) {

				// matrix x vector

				typeB = builder.getVectorFromMatrix( typeA );

			} else if ( builder.isVector( typeA ) && builder.isMatrix( typeB ) ) {

				// vector x matrix

				typeA = builder.getVectorFromMatrix( typeB );

			} else {

				// anytype x anytype

				typeA = typeB = type;

			}

		} else {

			typeA = typeB = type;

		}

		const a = aNode.build( builder, typeA );
		const b = bNode.build( builder, typeB );

		const outputLength = builder.getTypeLength( output );

		if ( output !== 'void' ) {

			if ( op === '=' ) {

				builder.addFlowCode( `${a} ${this.op} ${b}` );

				return a;

			} else if ( op === '>' && outputLength > 1 ) {

				return builder.format( `${ builder.getMethod( 'greaterThan' ) }( ${a}, ${b} )`, type, output );

			} else if ( op === '<=' && outputLength > 1 ) {

				return builder.format( `${ builder.getMethod( 'lessThanEqual' ) }( ${a}, ${b} )`, type, output );

			} else {

				return builder.format( `( ${a} ${this.op} ${b} )`, type, output );

			}

		} else if ( typeA !== 'void' ) {

			return builder.format( `${a} ${this.op} ${b}`, type, output );

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
