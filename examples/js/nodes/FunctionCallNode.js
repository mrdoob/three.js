/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.FunctionCallNode = function( func, inputs ) {

	THREE.TempNode.call( this );

	this.setFunction( func, inputs );

};

THREE.FunctionCallNode.prototype = Object.create( THREE.TempNode.prototype );
THREE.FunctionCallNode.prototype.constructor = THREE.FunctionCallNode;

THREE.FunctionCallNode.prototype.setFunction = function( func, inputs ) {

	this.value = func;
	this.inputs = inputs || [];

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

	var code = func.build( builder, output ) + '(';
	var params = [];

	for ( var i = 0; i < func.inputs.length; i ++ ) {

		var inpt = func.inputs[ i ];
		var param = this.inputs[ i ] || this.inputs[ inpt.name ];

		params.push( param.build( builder, builder.getTypeByFormat( inpt.type ) ) );

	}

	code += params.join( ',' ) + ')';

	return builder.format( code, type, output );

};
