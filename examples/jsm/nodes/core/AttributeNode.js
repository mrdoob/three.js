/**
 * @author sunag / http://www.sunag.com.br/
 */

import { Node } from './Node.js';

function AttributeNode( name, type ) {

	Node.call( this, type );

	this.name = name;

}

AttributeNode.prototype = Object.create( Node.prototype );
AttributeNode.prototype.constructor = AttributeNode;
AttributeNode.prototype.nodeType = "Attribute";

AttributeNode.prototype.getAttributeType = function ( builder ) {

	return typeof this.type === 'number' ? builder.getConstructorFromLength( this.type ) : this.type;

};

AttributeNode.prototype.getType = function ( builder ) {

	var type = this.getAttributeType( builder );

	return builder.getTypeByFormat( type );

};

AttributeNode.prototype.generate = function ( builder, output ) {

	var type = this.getAttributeType( builder );

	var attribute = builder.getAttribute( this.name, type ),
		name = builder.isShader( 'vertex' ) ? this.name : attribute.varying.name;

	console.log( attribute );

	return builder.format( name, this.getType( builder ), output );

};

AttributeNode.prototype.copy = function ( source ) {

	Node.prototype.copy.call( this, source );

	this.type = source.type;

	return this;

};

AttributeNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.type = this.type;

	}

	return data;

};

export { AttributeNode };
