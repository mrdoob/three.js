/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.NodeMath1 = function( a, method ) {
	
	THREE.NodeTemp.call( this );
	
	this.a = a;
	
	this.method = method || THREE.NodeMath1.SIN;
	
};

THREE.NodeMath1.prototype = Object.create( THREE.NodeTemp.prototype );
THREE.NodeMath1.prototype.constructor = THREE.NodeMath1;

THREE.NodeMath1.RAD = 'radians';
THREE.NodeMath1.DEG = 'degrees';
THREE.NodeMath1.EXP = 'exp';
THREE.NodeMath1.EXP2 = 'exp2';
THREE.NodeMath1.LOG = 'log';
THREE.NodeMath1.LOG2 = 'log2';
THREE.NodeMath1.INVERSE_SQRT = 'inversesqrt';
THREE.NodeMath1.FLOOR = 'floor';
THREE.NodeMath1.CEIL = 'ceil';
THREE.NodeMath1.NORMALIZE = 'normalize';
THREE.NodeMath1.FRACT = 'fract';
THREE.NodeMath1.SAT = 'saturate';
THREE.NodeMath1.SIN = 'sin';
THREE.NodeMath1.COS = 'cos';
THREE.NodeMath1.TAN = 'tan';
THREE.NodeMath1.ASIN = 'asin';
THREE.NodeMath1.ACOS = 'acos';
THREE.NodeMath1.ARCTAN = 'atan';
THREE.NodeMath1.ABS = 'abc';
THREE.NodeMath1.SIGN = 'sign';
THREE.NodeMath1.LENGTH = 'length';
THREE.NodeMath1.NEGATE = 'negate';
THREE.NodeMath1.INVERT = 'invert';

THREE.NodeMath1.prototype.getType = function( builder ) {
	
	switch(this.method) {
		case THREE.NodeMath1.DISTANCE:
			return 'fv1';
	}
	
	return this.a.getType( builder );
	
};

THREE.NodeMath1.prototype.generate = function( builder, output ) {
	
	var material = builder.material;
	
	var type = this.getType( builder );
	
	var result = this.a.build( builder, type );
	
	switch(this.method) {
		
		case THREE.NodeMath1.NEGATE:
			result = '(-' + result + ')';
			break;
		
		case THREE.NodeMath1.INVERT:
			result = '(1.0-' + result + ')';
			break;
		
		default:
			result = this.method + '(' + result + ')';
			break;
	}
	
	return builder.format( result, type, output );

};