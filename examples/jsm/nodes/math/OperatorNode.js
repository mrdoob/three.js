/**
 * @author sunag / http://www.sunag.com.br/
 */

import { TempNode } from '../core/TempNode.js';
import { NodeUtils } from '../core/NodeUtils.js';
import { NodeBuilder } from '../core/NodeBuilder.js';

export class OperatorNode extends TempNode {

	constructor( op, a, b ) {

		super();

		this.op = op;

		if ( arguments.length > 3 ) {

			var finalNodeIndex = arguments.length - 1;

			for(var i = 2; i < finalNodeIndex; i++) {

				a = new OperatorNode( op, a, arguments[i] );

			}

			b = arguments[ finalNodeIndex ];

		}

		this.a = NodeBuilder.resolve( a );
		this.b = NodeBuilder.resolve( b );

		this.nodeType = "Operator";

	}

	getType( builder ) {

		var a = this.a.getType( builder ),
			b = this.b.getType( builder );

		if ( builder.isTypeMatrix( a ) ) {

			return 'v4';

		} else if ( builder.getTypeLength( b ) > builder.getTypeLength( a ) ) {

			// use the greater length vector

			return b;

		}

		return a;

	}

	generate( builder, output ) {

		var type = this.getType( builder );

		var a = this.a.build( builder, type ),
			b = this.b.build( builder, type );

		return builder.format( '( ' + a + ' ' + this.op + ' ' + b + ' )', type, output );

	}

	copy( source ) {

		super.copy( source );

		this.op = source.op;
		this.a = source.a;
		this.b = source.b;

		return this;

	}

	toJSON( meta ) {

		var data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.op = this.op;
			data.a = this.a.toJSON( meta ).uuid;
			data.b = this.b.toJSON( meta ).uuid;

		}

		return data;

	}

}

OperatorNode.ADD = '+';
OperatorNode.SUB = '-';
OperatorNode.MUL = '*';
OperatorNode.DIV = '/';

const AddNode = NodeUtils.createProxyClass( OperatorNode, OperatorNode.ADD, 2 );
const SubNode = NodeUtils.createProxyClass( OperatorNode, OperatorNode.SUB, 2 );
const MulNode = NodeUtils.createProxyClass( OperatorNode, OperatorNode.MUL, 2 );
const DivNode = NodeUtils.createProxyClass( OperatorNode, OperatorNode.DIV, 2 );

export { AddNode, SubNode, MulNode, DivNode };
