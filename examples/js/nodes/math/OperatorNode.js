/**
 * @author sunag / http://www.sunag.com.br/
 */

import { TempNode } from '../core/TempNode.js';

function OperatorNode( a, b, op ) {

	TempNode.call( this );

	this.a = a;
	this.b = b;
	this.op = op;

}

OperatorNode.ADD = '+';
OperatorNode.SUB = '-';
OperatorNode.MUL = '*';
OperatorNode.DIV = '/';

OperatorNode.prototype = Object.create( TempNode.prototype );
OperatorNode.prototype.constructor = OperatorNode;
OperatorNode.prototype.nodeType = "Operator";

OperatorNode.prototype.getType = function ( builder ) {

	var a = this.a.getType( builder ),
		b = this.b.getType( builder );

	if ( builder.isTypeMatrix( a ) ) {

		return 'v4';

	} else if ( builder.getTypeLength( b ) > builder.getTypeLength( a ) ) {

		// use the greater length vector

		return b;

	}

	return a;

};

OperatorNode.prototype.generate = function ( builder, output ) {

	var data = builder.getNodeData( this ),
		type = this.getType( builder );

	var a = this.a.build( builder, type ),
		b = this.b.build( builder, type );

	return builder.format( '( ' + a + ' ' + this.op + ' ' + b + ' )', type, output );

};

OperatorNode.prototype.copy = function ( source ) {

	TempNode.prototype.copy.call( this, source );

	this.a = source.a;
	this.b = source.b;
	this.op = source.op;

};

OperatorNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.a = this.a.toJSON( meta ).uuid;
		data.b = this.b.toJSON( meta ).uuid;
		data.op = this.op;

	}

	return data;

};

export { OperatorNode };
