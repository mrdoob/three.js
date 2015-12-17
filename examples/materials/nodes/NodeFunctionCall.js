/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.NodeFunctionCall = function( value ) {
	
	THREE.NodeTemp.call( this );
	
	this.setFunction( value );
	
};

THREE.NodeFunctionCall.prototype = Object.create( THREE.NodeTemp.prototype );
THREE.NodeFunctionCall.prototype.constructor = THREE.NodeFunctionCall;

THREE.NodeFunctionCall.prototype.setFunction = function(val) {
	
	this.input = [];
	this.value = val;
	
};

THREE.NodeFunctionCall.prototype.getFunction = function() {
	
	return this.value;
	
};

THREE.NodeFunctionCall.prototype.getType = function( builder ) {
	
	return this.value.getType( builder );
	
};

THREE.NodeFunctionCall.prototype.generate = function( builder, output ) {
	
	var material = builder.material;
	
	var type = this.getType( builder );
	var func = this.value;
	
	builder.include( func );
	
	var code = func.name + '(';
	var params = [];
	
	for(var i = 0; i < func.input.length; i++) {
		
		var inpt = func.input[i];
		var param = this.input[i] || this.input[inpt.name];
		
		params.push( param.build( builder, builder.getType( inpt.type ) ) );
	
	}
	
	code += params.join(',') + ')';
	
	return builder.format( code, type, output );

};
