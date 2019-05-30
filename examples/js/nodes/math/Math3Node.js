/**
 * @author sunag / http://www.sunag.com.br/
 */

import { TempNode } from '../core/TempNode.js';

function Math3Node( a, b, c, method ) {

	TempNode.call( this );

	this.a = a;
	this.b = b;
	this.c = c;

	this.method = method;

}

Math3Node.MIX = 'mix';
Math3Node.CLAMP = 'clamp';
Math3Node.REFRACT = 'refract';
Math3Node.SMOOTHSTEP = 'smoothstep';
Math3Node.FACEFORWARD = 'faceforward';

Math3Node.prototype = Object.create( TempNode.prototype );
Math3Node.prototype.constructor = Math3Node;
Math3Node.prototype.nodeType = "Math3";

Math3Node.prototype.getType = function ( builder ) {

	var a = builder.getTypeLength( this.a.getType( builder ) );
	var b = builder.getTypeLength( this.b.getType( builder ) );
	var c = builder.getTypeLength( this.c.getType( builder ) );

	if ( a > b && a > c ) {

		return this.a.getType( builder );

	} else if ( b > c ) {

		return this.b.getType( builder );

	}

	return this.c.getType( builder );

};

Math3Node.prototype.generate = function ( builder, output ) {

	var a, b, c,
		al = builder.getTypeLength( this.a.getType( builder ) ),
		bl = builder.getTypeLength( this.b.getType( builder ) ),
		cl = builder.getTypeLength( this.c.getType( builder ) ),
		type = this.getType( builder );

	// optimzer

	switch ( this.method ) {

		case Math3Node.REFRACT:

			a = this.a.build( builder, type );
			b = this.b.build( builder, type );
			c = this.c.build( builder, 'f' );

			break;

		case Math3Node.MIX:

			a = this.a.build( builder, type );
			b = this.b.build( builder, type );
			c = this.c.build( builder, cl === 1 ? 'f' : type );

			break;

		default:

			a = this.a.build( builder, type );
			b = this.b.build( builder, type );
			c = this.c.build( builder, type );

			break;

	}

	return builder.format( this.method + '( ' + a + ', ' + b + ', ' + c + ' )', type, output );

};

Math3Node.prototype.copy = function ( source ) {

	TempNode.prototype.copy.call( this, source );

	this.a = source.a;
	this.b = source.b;
	this.c = source.c;
	this.method = source.method;

};

Math3Node.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.a = this.a.toJSON( meta ).uuid;
		data.b = this.b.toJSON( meta ).uuid;
		data.c = this.c.toJSON( meta ).uuid;
		data.method = this.method;

	}

	return data;

};

export { Math3Node };
