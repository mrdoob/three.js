/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.Math1Node = function( a, method ) {

	THREE.TempNode.call( this );

	this.a = a;

	this.method = method || THREE.Math1Node.SIN;

};

THREE.Math1Node.RAD = 'radians';
THREE.Math1Node.DEG = 'degrees';
THREE.Math1Node.EXP = 'exp';
THREE.Math1Node.EXP2 = 'exp2';
THREE.Math1Node.LOG = 'log';
THREE.Math1Node.LOG2 = 'log2';
THREE.Math1Node.SQRT = 'sqrt';
THREE.Math1Node.INV_SQRT = 'inversesqrt';
THREE.Math1Node.FLOOR = 'floor';
THREE.Math1Node.CEIL = 'ceil';
THREE.Math1Node.NORMALIZE = 'normalize';
THREE.Math1Node.FRACT = 'fract';
THREE.Math1Node.SAT = 'saturate';
THREE.Math1Node.SIN = 'sin';
THREE.Math1Node.COS = 'cos';
THREE.Math1Node.TAN = 'tan';
THREE.Math1Node.ASIN = 'asin';
THREE.Math1Node.ACOS = 'acos';
THREE.Math1Node.ARCTAN = 'atan';
THREE.Math1Node.ABS = 'abs';
THREE.Math1Node.SIGN = 'sign';
THREE.Math1Node.LENGTH = 'length';
THREE.Math1Node.NEGATE = 'negate';
THREE.Math1Node.INVERT = 'invert';

THREE.Math1Node.prototype = Object.create( THREE.TempNode.prototype );
THREE.Math1Node.prototype.constructor = THREE.Math1Node;

THREE.Math1Node.prototype.getType = function( builder ) {

	switch ( this.method ) {
		case THREE.Math1Node.LENGTH:
			return 'fv1';
	}

	return this.a.getType( builder );

};

THREE.Math1Node.prototype.generate = function( builder, output ) {

	var material = builder.material;

	var type = this.getType( builder );

	var result = this.a.build( builder, type );

	switch ( this.method ) {

		case THREE.Math1Node.NEGATE:
			result = '(-' + result + ')';
			break;

		case THREE.Math1Node.INVERT:
			result = '(1.0-' + result + ')';
			break;

		default:
			result = this.method + '(' + result + ')';
			break;
	}

	return builder.format( result, type, output );

};
