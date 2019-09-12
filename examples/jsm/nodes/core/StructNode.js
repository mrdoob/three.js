/**
 * @author sunag / http://www.sunag.com.br/
 */

import { TempNode } from './TempNode.js';

export class StructNode extends TempNode {

	constructor( src ) {

		super();

		this.nodeType = "Struct";

		this.parse( src );

	}

	getType( builder ) {

		return builder.getTypeByFormat( this.name );

	}

	getInputByName( name ) {

		var i = this.inputs.length;

		while ( i -- ) {

			if ( this.inputs[ i ].name === name ) {

				return this.inputs[ i ];

			}

		}

	}

	fromParser( parser, prop ) {

		this.name = prop.name;
		this.type = prop.type;

		this.src = prop.getSource();

		this.inputs = [];

		for ( var i = 0; i < prop.properties.length; i ++ ) {

			var property = prop.properties[i];

			this.inputs.push( {
				type: property.type,
				name: property.name
			} );

		}

		parser.getIncludes( prop, this.includes );

		return this;

	}


	parse( src ) {

		this.src = src || '';

		if ( src ) {

			var parser = new GLSLParser( src );

			this.fromParser( parser, parser.getMainProperty() );

		}

	}

	generate( builder, output ) {

		if ( output === 'source' ) {

			return this.src + ';';

		} else {

			return builder.format( '( ' + this.src + ' )', this.getType( builder ), output );

		}

	}

	toJSON( meta ) {

		var data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.src = this.src;

		}

		return data;

	}

}
