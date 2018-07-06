/**
 * @author sunag / http://www.sunag.com.br/
 */
 
import { TempNode } from '../core/TempNode.js';

function Math2Node( a, b, method ) {

	TempNode.call( this );

	this.a = a;
	this.b = b;

	this.method = method || Math2Node.DISTANCE;

};

Math2Node.MIN = 'min';
Math2Node.MAX = 'max';
Math2Node.MOD = 'mod';
Math2Node.STEP = 'step';
Math2Node.REFLECT = 'reflect';
Math2Node.DISTANCE = 'distance';
Math2Node.DOT = 'dot';
Math2Node.CROSS = 'cross';
Math2Node.POW = 'pow';

Math2Node.prototype = Object.create( TempNode.prototype );
Math2Node.prototype.constructor = Math2Node;
Math2Node.prototype.nodeType = "Math2";

Math2Node.prototype.getInputType = function ( builder ) {

	// use the greater length vector
	
	if ( builder.getTypeLength( this.b.getType( builder ) ) > builder.getTypeLength( this.a.getType( builder ) ) ) {

		return this.b.getType( builder );

	}

	return this.a.getType( builder );

};

Math2Node.prototype.getType = function ( builder ) {

	switch ( this.method ) {

		case Math2Node.DISTANCE:
		case Math2Node.DOT:
		
			return 'f';

		case Math2Node.CROSS:
		
			return 'v3';

	}

	return this.getInputType( builder );

};

Math2Node.prototype.generate = function ( builder, output ) {

	var a, b, 
		type = this.getInputType( builder ),
		al = builder.getTypeLength( this.a.getType( builder ) ),
		bl = builder.getTypeLength( this.b.getType( builder ) );
		
	// optimzer

	switch ( this.method ) {

		case Math2Node.CROSS:
		
			a = this.a.build( builder, 'v3' );
			b = this.b.build( builder, 'v3' );
			
			break;

		case Math2Node.STEP:
		
			a = this.a.build( builder, al === 1 ? 'f' : type );
			b = this.b.build( builder, type );
			
			break;

		case Math2Node.MIN:
		case Math2Node.MAX:
		case Math2Node.MOD:
		
			a = this.a.build( builder, type );
			b = this.b.build( builder, bl === 1 ? 'f' : type );
			
			break;

		default:
		
			a = this.a.build( builder, type );
			b = this.b.build( builder, type );
			
			break;

	}

	return builder.format( this.method + '( ' + a + ', ' + b + ' )', this.getType( builder ), output );

};

Math2Node.prototype.copy = function ( source ) {
			
	TempNode.prototype.copy.call( this, source );
	
	this.a = source.a;
	this.b = source.b;
	this.method = source.method;
	
};

Math2Node.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.a = this.a.toJSON( meta ).uuid;
		data.b = this.b.toJSON( meta ).uuid;
		data.method = this.method;

	}

	return data;

};

export { Math2Node };
