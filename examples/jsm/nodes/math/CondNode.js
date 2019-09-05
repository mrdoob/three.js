/**
 * @author sunag / http://www.sunag.com.br/
 */

import { TempNode } from '../core/TempNode.js';

export class CondNode extends TempNode {

	constructor( a, b, op, ifNode, elseNode ) {

		super();

		this.a = a;
		this.b = b;

		this.op = op;

		this.ifNode = ifNode;
		this.elseNode = elseNode;

		this.nodeType = "Cond";

	}

	getType( builder ) {

		if ( this.ifNode ) {

			var ifType = this.ifNode.getType( builder );
			var elseType = this.elseNode.getType( builder );

			if ( builder.getTypeLength( elseType ) > builder.getTypeLength( ifType ) ) {

				return elseType;

			}

			return ifType;

		}

		return 'b';

	}

	getCondType( builder ) {

		if ( builder.getTypeLength( this.b.getType( builder ) ) > builder.getTypeLength( this.a.getType( builder ) ) ) {

			return this.b.getType( builder );

		}

		return this.a.getType( builder );

	};

	generate( builder, output ) {

		var type = this.getType( builder ),
			condType = this.getCondType( builder ),
			a = this.a.build( builder, condType ),
			b = this.b.build( builder, condType ),
			code;

		if ( this.ifNode ) {

			var ifCode = this.ifNode.build( builder, type ),
				elseCode = this.elseNode.build( builder, type );

			code = '( ' + [ a, this.op, b, '?', ifCode, ':', elseCode ].join( ' ' ) + ' )';

		} else {

			code = '( ' + a + ' ' + this.op + ' ' + b + ' )';

		}

		return builder.format( code, this.getType( builder ), output );

	};

	copy( source ) {

		super.copy( source );

		this.a = source.a;
		this.b = source.b;

		this.op = source.op;

		this.ifNode = source.ifNode;
		this.elseNode = source.elseNode;

		return this;

	};

	toJSON( meta ) {

		var data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.a = this.a.toJSON( meta ).uuid;
			data.b = this.b.toJSON( meta ).uuid;

			data.op = this.op;

			if ( data.ifNode ) data.ifNode = this.ifNode.toJSON( meta ).uuid;
			if ( data.elseNode ) data.elseNode = this.elseNode.toJSON( meta ).uuid;

		}

		return data;

	}

}

CondNode.EQUAL = '==';
CondNode.NOT_EQUAL = '!=';
CondNode.GREATER = '>';
CondNode.GREATER_EQUAL = '>=';
CondNode.LESS = '<';
CondNode.LESS_EQUAL = '<=';
