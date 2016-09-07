/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.AttributeNode = function( name, type ) {

	THREE.InputNode.call( this, type, { shared: false } );

	this.name = name;

};

THREE.AttributeNode.prototype = Object.create( THREE.InputNode.prototype );
THREE.AttributeNode.prototype.constructor = THREE.AttributeNode;

THREE.AttributeNode.prototype.getType = function( builder ) {

	return builder.getTypeByFormat( this.type ) || this.type;

};

THREE.AttributeNode.prototype.generate = function( builder, output ) {

	var attribute = builder.material.getAttribute( this.name, this.type );

	return builder.format( attribute.varName, this.getType( builder ), output );

};
