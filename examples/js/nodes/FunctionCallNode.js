/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.FunctionCallNode = function( value ) {

	THREE.TempNode.call( this );

	this.setFunction( value );

};

THREE.FunctionCallNode.prototype = Object.create( THREE.TempNode.prototype );
THREE.FunctionCallNode.prototype.constructor = THREE.FunctionCallNode;

THREE.FunctionCallNode.prototype.setFunction = function( val ) {

	this.inputs = [];
	this.value = val;

};

THREE.FunctionCallNode.prototype.getFunction = function() {

	return this.value;

};

THREE.FunctionCallNode.prototype.getType = function( builder ) {

	return this.value.getType( builder );

};

THREE.FunctionCallNode.prototype.generate = function( builder, output ) {

	var material = builder.material;

	var type = this.getType( builder );
	var func = this.value;

	builder.include( func );

	var code = func.name + '(';
	var params = [];

	for ( var i = 0; i < func.inputs.length; i ++ ) {

		var inpt = func.inputs[ i ];
		var param = this.inputs[ i ] || this.inputs[ inpt.name ];

		params.push( param.build( builder, builder.getTypeByFormat( inpt.type ) ) );

	}

	code += params.join( ',' ) + ')';

	return builder.format( code, type, output );

};
