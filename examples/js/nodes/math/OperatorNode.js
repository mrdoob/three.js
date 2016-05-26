/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.OperatorNode = function( a, b, op ) {

	THREE.TempNode.call( this );

	this.a = a;
	this.b = b;
	this.op = op || THREE.OperatorNode.ADD;

};

THREE.OperatorNode.ADD = '+';
THREE.OperatorNode.SUB = '-';
THREE.OperatorNode.MUL = '*';
THREE.OperatorNode.DIV = '/';

THREE.OperatorNode.prototype = Object.create( THREE.TempNode.prototype );
THREE.OperatorNode.prototype.constructor = THREE.OperatorNode;

THREE.OperatorNode.prototype.getType = function( builder ) {

	var a = this.a.getType( builder );
	var b = this.b.getType( builder );
	
	if ( builder.isFormatMatrix( a ) ) {
	
		return 'v4';
		
	}
	// use the greater length vector
	else if ( builder.getFormatLength( b ) > builder.getFormatLength( a ) ) {

		return b;

	}

	return a;

};

THREE.OperatorNode.prototype.generate = function( builder, output ) {

	var material = builder.material, 
		data = material.getDataNode( this.uuid );

	var type = this.getType( builder );
	
	var a = this.a.build( builder, type );
	var b = this.b.build( builder, type );

	return builder.format( '(' + a + this.op + b + ')', type, output );

};
