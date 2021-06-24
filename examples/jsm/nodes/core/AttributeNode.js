import { Node } from './Node.js';

class AttributeNode extends Node {

	constructor( name, type ) {

		super( type );

		this.name = name;

	}

	getAttributeType( builder ) {

		return typeof this.type === 'number' ? builder.getConstructorFromLength( this.type ) : this.type;

	}

	getType( builder ) {

		const type = this.getAttributeType( builder );

		return builder.getTypeByFormat( type );

	}

	generate( builder, output ) {

		const type = this.getAttributeType( builder );

		const attribute = builder.getAttribute( this.name, type ),
			name = builder.isShader( 'vertex' ) ? this.name : attribute.varying.name;

		return builder.format( name, this.getType( builder ), output );

	}

	copy( source ) {

		super.copy( source );

		this.type = source.type;

		return this;

	}

	toJSON( meta ) {

		let data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.type = this.type;

		}

		return data;

	}

}

AttributeNode.prototype.nodeType = 'Attribute';

export { AttributeNode };
