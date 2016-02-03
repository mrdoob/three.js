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

	// use the greater length vector
	if ( builder.getFormatLength( this.b.getType( builder ) ) > builder.getFormatLength( this.a.getType( builder ) ) ) {

		return this.b.getType( builder );

	}

	return this.a.getType( builder );

};

THREE.OperatorNode.prototype.generate = function( builder, output ) {

	var material = builder.material;
	var data = material.getDataNode( this.uuid );

	var a = this.a.build( builder, output );
	var b = this.b.build( builder, output );

	return '(' + a + this.op + b + ')';

};
