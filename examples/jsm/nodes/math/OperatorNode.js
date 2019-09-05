/**
 * @author sunag / http://www.sunag.com.br/
 */

import { TempNode } from '../core/TempNode.js';
import { NodeUtils } from '../core/NodeUtils.js';

const OperatorsDict = {
	'add': '+',
	'sub': '-',
	'mul': '*',
	'div': '/'
};

export class OperatorNode extends TempNode {

	constructor( a, b, op ) {

		super();

		this.a = a;
		this.b = b;
		this.op = op;

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
			b = this.b.build( builder, type ),
			op = OperatorsDict[ this.op ] || this.op;

		return builder.format( '( ' + a + ' ' + op + ' ' + b + ' )', type, output );

	}

	copy( source ) {

		super.copy( source );

		this.a = source.a;
		this.b = source.b;
		this.op = source.op;

		return this;

	}

	toJSON( meta ) {

		var data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.a = this.a.toJSON( meta ).uuid;
			data.b = this.b.toJSON( meta ).uuid;
			data.op = this.op;

		}

		return data;

	}

}

OperatorNode.ADD = 'add';
OperatorNode.SUB = 'sub';
OperatorNode.MUL = 'mul';
OperatorNode.DIV = 'div';

const AddNode = NodeUtils.createProxyClass( OperatorNode, OperatorNode.ADD );
const SubNode = NodeUtils.createProxyClass( OperatorNode, OperatorNode.SUB );
const MulNode = NodeUtils.createProxyClass( OperatorNode, OperatorNode.MUL );
const DivNode = NodeUtils.createProxyClass( OperatorNode, OperatorNode.DIV );

export { AddNode };
export { SubNode };
export { MulNode };
export { DivNode };
