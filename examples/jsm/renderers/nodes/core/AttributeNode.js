import Node from './Node.js';

class AttributeNode extends Node {

	constructor( type, name = null, property = null ) {

		super( type );

		this.name = name;
		this.property = property;

	}

	setAttributeName( name ) {

		this.name = name;

		return this;

	}

	getAttributeName( /*builder*/ ) {

		return this.name;

	}

	setAttributeProperty( name ) {

		this.property = name;

		return this;

	}

	getAttributeProperty( builder ) {

		const attribute = builder.getAttribute( this.getType( builder ), this.getAttributeName( builder ), this.property );

		return attribute.property;

	}

	generate( builder, output ) {

		const attributeProperty = this.getAttributeProperty( builder );

		return builder.format( attributeProperty, this.getType( builder ), output );

	}

}

export default AttributeNode;
