/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.AttributeNode = function( name, type ) {

	THREE.InputNode.call( this, type, { shared: false } );

	this.name = name;

};

THREE.AttributeNode.prototype = Object.create( THREE.InputNode.prototype );
THREE.AttributeNode.prototype.constructor = THREE.AttributeNode;

THREE.AttributeNode.prototype.getAttributeType = function( builder ) {

	return typeof this.type === 'number' ? builder.getConstructorFromLength( this.type ) : this.type;

};

THREE.AttributeNode.prototype.getType = function( builder ) {

	var type = this.getAttributeType( builder );

	return builder.getTypeByFormat( type );

};

THREE.AttributeNode.prototype.generate = function( builder, output ) {

	var type = this.getAttributeType( builder );

	var attribute = builder.material.getAttribute( this.name, type );

	return builder.format( attribute.varName, this.getType( builder ), output );

};
