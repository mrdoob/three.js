/**
 * @author sunag / http://www.sunag.com.br/
 */

import { Node } from './Node.js';

export class AttributeNode extends Node {

	constructor( name, type ) {

		super( type );

		this.name = name;

		this.nodeType = "Attribute";

	}

	getAttributeType( builder ) {

		return typeof this.type === 'number' ? builder.getConstructorFromLength( this.type ) : this.type;

	}

	getType( builder ) {

		var type = this.getAttributeType( builder );

		return builder.getTypeByFormat( type );

	}

	generate( builder, output ) {

		var type = this.getAttributeType( builder );

		var attribute = builder.getAttribute( this.name, type ),
			name = builder.isShader( 'vertex' ) ? this.name : attribute.varying.name;

		return builder.format( name, this.getType( builder ), output );

	}

	copy( source ) {

		super.copy( source );

		this.type = source.type;

		return this;

	}

	toJSON( meta ) {

		var data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.type = this.type;

		}

		return data;

	}

}
