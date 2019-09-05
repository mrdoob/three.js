/**
 * @author sunag / http://www.sunag.com.br/
 */

import { TempNode } from './TempNode.js';

const declarationRegexp = /^struct\s*([a-z_0-9]+)\s*{\s*((.|\n)*?)}/img;
const propertiesRegexp = /\s*(\w*?)\s*(\w*?)(\=|\;)/img;

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

	generate( builder, output ) {

		if ( output === 'source' ) {

			return this.src + ';';

		} else {

			return builder.format( '( ' + this.src + ' )', this.getType( builder ), output );

		}

	}

	parse( src ) {

		this.src = src || '';

		this.inputs = [];

		var declaration = declarationRegexp.exec( this.src );

		if ( declaration ) {

			var properties = declaration[ 2 ], match;

			while ( match = propertiesRegexp.exec( properties ) ) {

				this.inputs.push( {
					type: match[ 1 ],
					name: match[ 2 ]
				} );

			}

			this.name = declaration[ 1 ];

		} else {

			this.name = '';

		}

		this.type = this.name;

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
