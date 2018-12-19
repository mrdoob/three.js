/**
 * @author sunag / http://www.sunag.com.br/
 */

import { TempNode } from '../core/TempNode.js';

function CondNode( a, b, ifNode, elseNode, op ) {

	TempNode.call( this );

	this.a = a;
	this.b = b;

	this.ifNode = ifNode;
	this.elseNode = elseNode;

	this.op = op;

}

CondNode.EQUAL = '==';
CondNode.NOT_EQUAL = '!=';
CondNode.GREATER = '>';
CondNode.GREATER_EQUAL = '>=';
CondNode.LESS = '<';
CondNode.LESS_EQUAL = '<=';

CondNode.prototype = Object.create( TempNode.prototype );
CondNode.prototype.constructor = CondNode;
CondNode.prototype.nodeType = "Cond";

CondNode.prototype.getType = function ( builder ) {

	if ( builder.getTypeLength( this.elseNode.getType( builder ) ) > builder.getTypeLength( this.ifNode.getType( builder ) ) ) {

		return this.elseNode.getType( builder );

	}

	return this.ifNode.getType( builder );

};

CondNode.prototype.getCondType = function ( builder ) {

	if ( builder.getTypeLength( this.b.getType( builder ) ) > builder.getTypeLength( this.a.getType( builder ) ) ) {

		return this.b.getType( builder );

	}

	return this.a.getType( builder );

};

CondNode.prototype.generate = function ( builder, output ) {

	var type = this.getType( builder ),
		condType = this.getCondType( builder ),
		a = this.a.build( builder, condType ),
		b = this.b.build( builder, condType ),
		ifNode = this.ifNode.build( builder, type ),
		elseNode = this.elseNode.build( builder, type );

	var code = '( ' + [ a, this.op, b, '?', ifNode, ':', elseNode ].join( ' ' ) + ' )';

	return builder.format( code, this.getType( builder ), output );

};

CondNode.prototype.copy = function ( source ) {

	TempNode.prototype.copy.call( this, source );

	this.a = source.a;
	this.b = source.b;

	this.ifNode = source.ifNode;
	this.elseNode = source.elseNode;

	this.op = source.op;

};

CondNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.a = this.a.toJSON( meta ).uuid;
		data.b = this.b.toJSON( meta ).uuid;

		data.ifNode = this.ifNode.toJSON( meta ).uuid;
		data.elseNode = this.elseNode.toJSON( meta ).uuid;

		data.op = this.op;

	}

	return data;

};

export { CondNode };
