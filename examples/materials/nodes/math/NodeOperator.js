/**
 * @author sunag / http://www.sunag.com.br/
 */
 
THREE.NodeOperator = function( a, b, op ) {
	
	THREE.NodeTemp.call( this );
	
	this.op = op || THREE.NodeOperator.ADD;
	
	this.a = a;
	this.b = b;
	
};

THREE.NodeOperator.prototype = Object.create( THREE.NodeTemp.prototype );
THREE.NodeOperator.prototype.constructor = THREE.NodeOperator;

THREE.NodeOperator.ADD = '+';
THREE.NodeOperator.SUB = '-';
THREE.NodeOperator.MUL = '*';
THREE.NodeOperator.DIV = '/';

THREE.NodeOperator.prototype.getType = function( builder ) {
	
	// use the greater length vector
	if (builder.getFormatLength( this.b.getType( builder ) ) > builder.getFormatLength( this.a.getType( builder ) )) {
		return this.b.getType( builder );
	}
	
	return this.a.getType( builder );

};

THREE.NodeOperator.prototype.generate = function( builder, output ) {
	
	var material = builder.material;
	var data = material.getNodeData( this.uuid );
	
	var a = this.a.build( builder, output );
	var b = this.b.build( builder, output );
	
	return '(' + a + this.op + b + ')';

};